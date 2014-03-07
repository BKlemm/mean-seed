angular.module('app').controller('navbarLoginCtrl', function ($scope,$http,anIdentitySvc,anNotifierSvc,anAuthSvc,$location) {
	$scope.identity = anIdentitySvc;
	$scope.signin = function(username,password){
		anAuthSvc.authenticateUser(username,password).then(function(success){
			if(success){
				anNotifierSvc.notify('You have successfully singed in!');
			} else {
				anNotifierSvc.notify('Username/Password are incorrect!');
			}
		});
	};

	$scope.signout = function(){
		anAuthSvc.logoutUser().then(function(){
			$scope.username = "";
			$scope.password = "";
			anNotifierSvc.notify('You have successfully signed out');
			$location.path('/');
		})
	}
});