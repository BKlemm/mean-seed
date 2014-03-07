angular.module('app').factory('anIdentitySvc',function($window,anUserSvc){
	var currentUser;
	if(!!$window.bootstrappedUserObject){
		currentUser = new anUserSvc();
		angular.extend(currentUser,$window.bootstrappedUserObject);
	}
	return {
		currentUser: currentUser,
		isAuthenticated: function(){
			return !!this.currentUser;
		},
		isAuthorized: function(role){
			return !!this.currentUser && this.currentUser.roles.indexOf(role) > -1;
		}
	}
})
