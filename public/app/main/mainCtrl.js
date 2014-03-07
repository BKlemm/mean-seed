angular.module('app').controller('mainCtrl', function ($scope,cachedCourcesSvc) {
	$scope.cources = cachedCourcesSvc.query();
});