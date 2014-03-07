angular.module('app').factory('cachedCourcesSvc', function (courceSvc){
	var courceList;

	return {
		query: function(){
			if(!courceList){
				courceList = courceSvc.query();
			}
		}
		return courceList;
	}
});