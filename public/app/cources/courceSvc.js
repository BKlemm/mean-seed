angular.module('app').factory('courceSvc', function ($resource){
	var CourceResource = $resource('/api/cources/:_id',{_id:"@id"},{
		update: {method:'PUT',isArray:false}
	});
	return CourceResource;
});