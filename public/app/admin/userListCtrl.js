angular.module('app').controller('userListCtrl', function ($scope,anUserSvc){
	$scope.users = anUserSvc.query();
});