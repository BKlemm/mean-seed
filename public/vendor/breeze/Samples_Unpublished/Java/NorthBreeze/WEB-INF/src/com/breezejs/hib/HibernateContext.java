package com.breezejs.hib;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.hibernate.EntityMode;
import org.hibernate.FlushMode;
import org.hibernate.PropertyValueException;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.metadata.ClassMetadata;
import org.hibernate.type.ComponentType;
import org.hibernate.type.Type;

import com.breezejs.save.*;

public class HibernateContext extends ContextProvider {

	private Metadata metadataMap;
	private Session session;
	private List<EntityError> entityErrors = new ArrayList<EntityError>();
	private Map<EntityInfo, KeyMapping> entityKeyMapping = new HashMap<EntityInfo, KeyMapping>();

	/**
	 * @param session Hibernate session to be used for saving
	 * @param metadataMap metadata from MetadataBuilder
	 */
	public HibernateContext(Session session, Metadata metadataMap) {
		this.session = session;
		this.metadataMap = metadataMap;
	}
	
	/**
     * Allows subclasses to process entities before they are saved.  This method is called
     * after BeforeSaveEntities(saveMap), and before any session.Save methods are called.
     * The foreign-key associations on the entities have been resolved, relating the entities
     * to each other, and attaching proxies for other many-to-one associations.
	 * 
	 * @param entitiesToPersist List of entities in the order they will be saved
	 * @return The same entitiesToPersist.  Overrides of this method may modify the list.
	 */
	public List<EntityInfo> beforeSaveEntityGraph(List<EntityInfo> entitiesToPersist) {
		return entitiesToPersist;
	}

	/**
	 * Persist the changes to the entities in the saveMap.
	 * This implements the abstract method in ContextProvider.
	 * Assigns saveWorkState.KeyMappings, which map the temporary keys to their real generated keys.
	 * Note that this method sets session.FlushMode = FlushMode.MANUAL, so manual flushes are required.
	 * @param saveWorkState
	 */
	protected void saveChangesCore(SaveWorkState saveWorkState) {
		Map<Class, List<EntityInfo>> saveMap = saveWorkState.saveMap;
		session.setFlushMode(FlushMode.MANUAL);
		Transaction tx = session.getTransaction();
		boolean hasExistingTransaction = tx.isActive();
		if (!hasExistingTransaction)
			tx.begin();
		try {
			// Relate entities in the saveMap to other entities, so Hibernate can save the FK values.
			RelationshipFixer fixer = getRelationshipFixer(saveMap);			
			List<EntityInfo> saveOrder = fixer.fixupRelationships();
			
			// Allow subclass to process entities before we save them
			saveOrder = beforeSaveEntityGraph(saveOrder);
			
			processSaves(saveOrder);

			session.flush();
			refreshFromSession(saveMap);
			if (!hasExistingTransaction)
				tx.commit();
			fixer.removeRelationships();
		} catch (PropertyValueException pve) {
			// Hibernate can throw this
			if (tx.isActive())
				tx.rollback();
			entityErrors.add(new EntityError("PropertyValueException", pve.getEntityName(), null,
					pve.getPropertyName(), pve.getMessage()));
			saveWorkState.entityErrors = entityErrors;
		} catch (Exception ex) {
			if (tx.isActive())
				tx.rollback();
			throw ex;
		} finally {
			//          if (!hasExistingTransaction) tx.Dispose();
		}

		saveWorkState.keyMappings = updateAutoGeneratedKeys(saveWorkState.entitiesWithAutoGeneratedKeys);
	}
	
	/**
	 * Get a new RelationshipFixer using the saveMap and the foreign-key map from the metadata.
	 * @param saveMap
	 * @return
	 */
	protected RelationshipFixer getRelationshipFixer(Map<Class, List<EntityInfo>> saveMap) {
		// Get the map of foreign key relationships
		Map<String, String> fkMap = metadataMap.foreignKeyMap;
		return new RelationshipFixer(saveMap, fkMap, session);
	}

	/**
	 * Persist the changes to the entities in the saveOrder.
	 * @param saveMap
	 */
	protected void processSaves(List<EntityInfo> saveOrder) {

		SessionFactory sf = session.getSessionFactory();
		for (EntityInfo entityInfo : saveOrder) {
	        Class entityType = entityInfo.entity.getClass();
	        ClassMetadata classMeta = sf.getClassMetadata(entityType);
	        addKeyMapping(entityInfo, entityType, classMeta);
	        processEntity(entityInfo, classMeta);
		}
	}

	/**
	 * Add, update, or delete the entity according to its EntityState.
	 * @param entityInfo
	 * @param classMeta
	 */
	protected void processEntity(EntityInfo entityInfo, ClassMetadata classMeta) {
		Object entity = entityInfo.entity;
		EntityState state = entityInfo.entityState;

		// Restore the old value of the concurrency column so Hibernate will be able to save the entity
		if (classMeta.isVersioned()) {
			restoreOldVersionValue(entityInfo, classMeta);
		}

		if (state == EntityState.Modified) {
			session.update(entity);
		} else if (state == EntityState.Added) {
			session.save(entity);
		} else if (state == EntityState.Deleted) {
			session.delete(entity);
		} else {
	        // Ignore EntityState.Unchanged.  Too many problems using session.Lock or session.Merge
	        //session.Lock(entity, LockMode.None);
		}
	}

	/**
	 * Record the value of the temporary key in EntityKeyMapping
	 * @param entityInfo
	 * @param type
	 * @param meta
	 */
	protected void addKeyMapping(EntityInfo entityInfo, Class type, ClassMetadata meta) {
		if (entityInfo.entityState == EntityState.Added) {
			Object entity = entityInfo.entity;
			Object id = getIdentifier(entity, meta);
			KeyMapping km = new KeyMapping(type.getName(), id);
			entityKeyMapping.put(entityInfo, km);
		}
	}

	/**
	 * Get the identifier value for the entity.  If the entity does not have an
	 * identifier property, or natural identifiers defined, then the entity itself is returned.
	 * @param entity
	 * @param meta
	 * @return
	 */
	protected Object getIdentifier(Object entity, ClassMetadata meta) {
		Class type = entity.getClass();
		if (meta == null)
			meta = session.getSessionFactory().getClassMetadata(type);

		Type idType = meta.getIdentifierType();
		if (idType != null) {
			Serializable id = meta.getIdentifier(entity, null);
			if (idType.isComponentType()) {
				ComponentType compType = (ComponentType) idType;
				return compType.getPropertyValues(id, EntityMode.POJO);
			} else {
				return id;
			}
		} else if (meta.hasNaturalIdentifier()) {
			int[] idprops = meta.getNaturalIdentifierProperties();
			Object[] values = meta.getPropertyValues(entity);
			Object[] idvalues = new Object[idprops.length];
			for (int i = 0; i < idprops.length; i++) {
				idvalues[i] = values[idprops[i]];
			}
			return idvalues;
		}
		return entity;
	}

	/**
	 * Get the identifier value for the entity as an object[].  This is needed for creating an EntityError.
	 * @param entity
	 * @param meta
	 * @return
	 */
	protected Object[] getIdentifierAsArray(Object entity, ClassMetadata meta) {
		Object value = getIdentifier(entity, meta);
		if (value.getClass().isArray()) {
			return (Object[]) value;
		} else {
			return new Object[] { value };
		}
	}

	/**
	 * Restore the old value of the concurrency column so Hibernate will save the entity.
	 * Otherwise it will complain because Breeze has already changed the value.
	 * @param entityInfo
	 * @param classMeta
	 */
	protected void restoreOldVersionValue(EntityInfo entityInfo, ClassMetadata classMeta) {
		if (entityInfo.originalValuesMap == null || entityInfo.originalValuesMap.size() == 0)
			return;
		int vcol = classMeta.getVersionProperty();
		String vname = classMeta.getPropertyNames()[vcol];
		Object oldVersion = entityInfo.originalValuesMap.get(vname);
		if (oldVersion != null) {
			Object entity = entityInfo.entity;
			//        Class vtype = classMeta.getPropertyTypes()[vcol].getReturnedClass();
			//        if (vtype != oldVersion.getClass()) {
			//        	// because JsonConvert makes all integers Int64
			//        	oldVersion = vtype.getConstructor(oldVersion.getClass()).newInstance(oldVersion);
			//        } 
			classMeta.setPropertyValue(entity, vname, oldVersion);
		}
	}

	/**
	 * Update the KeyMappings with their real values.
	 * @param entitiesWithAutoGeneratedKeys
	 * @return
	 */
	protected List<KeyMapping> updateAutoGeneratedKeys(List<EntityInfo> entitiesWithAutoGeneratedKeys) {
		List<KeyMapping> list = new ArrayList<KeyMapping>();
		for (EntityInfo entityInfo : entitiesWithAutoGeneratedKeys) {
			KeyMapping km = entityKeyMapping.get(entityInfo);
			if (km != null && km.getTempValue() != null) {
				Object entity = entityInfo.entity;
				Object id = getIdentifier(entity, null);
				km.setRealValue(id);
				list.add(km);
			}
		}
		return list;
	}

	/**
	 * Refresh the entities from the database.  This picks up changes due to triggers, etc.
	 * and makes Hibernate update the foreign keys.
	 * @param saveMap
	 */
	protected void refreshFromSession(Map<Class, List<EntityInfo>> saveMap) {
    	for (Entry<Class, List<EntityInfo>> entry : saveMap.entrySet()) {
            for (EntityInfo entityInfo : entry.getValue()) {
                if (entityInfo.entityState == EntityState.Added || entityInfo.entityState == EntityState.Modified)
                    session.refresh(entityInfo.entity);
            }
        }    	
		
	}
}
