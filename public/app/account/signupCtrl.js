angular.module('app').controller('signupCtrl', function ($scope,anUserSvc,anNotifierSvc,$location, anAuthSvc) {
	$scope.signup = function(){
		var newUserData = {
			username: $scope.email,
			password: $scope.password,
			firstName:$scope.fname,
			lastName: $scope.lname
		};

		anAuthSvc.createUser(newUserData).then(function(){
			anNotifierSvc.notify('User account created');
			$location.path("/");
		}, function(reason){
			anNotifierSvc.error(reason);
		})
	}
});