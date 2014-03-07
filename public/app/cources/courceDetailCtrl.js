angular.module('app').controller('courceDetailCtrl', function ($scope,cachedCourcesSvc,$routeParams){
	cachedCourcesSvc.query().$promise.then(function(collection){
		collection.forEach(function(cource){
			if(cource._id === $routeParams.id){
				$scope.cource = cource;
			}
		})
	})
});