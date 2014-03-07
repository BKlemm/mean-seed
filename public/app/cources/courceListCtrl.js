angular.module('app').controller('courceListCtrl', function ($scope,cachedCourcesSvc){
	$scope.cources = cachedCourcesSvc.query();

	$scope.sortOptions = [{value:"title",text: "Sort by Title"},
		{value: "published",text: "Sort by Publish Date"}];

	$scope.sortOrder = $scope.sortOptions[0].value;
});