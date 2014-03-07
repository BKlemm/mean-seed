angular.module('app').controller('profileCtrl', function ($scope,anUserSvc,anNotifierSvc,anIdentitySvc, anAuthSvc) {
	$scope.email = anIdentitySvc.currentUser.username;
	$scope.fname = anIdentitySvc.currentUser.firstName;
	$scope.lname = anIdentitySvc.currentUser.lastName;

	$scope.update = function(){
		var newUserData = {
			username: $scope.email,
			firstName: $scope.fname,
			lastName: $scope.lname
		}
		if($scope.password && $scope.password.length > 0){
			newUserData.password = $scope.password;
		}

		anAuthSvc.updateCurrentUser(newUserData).then(function(){
			anNotifierSvc.notify('Your user account has been updated');
		}, function(reason){
			anNotifierSvc.error(reason);
		})
	}
});