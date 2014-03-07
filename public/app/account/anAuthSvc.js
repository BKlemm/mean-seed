angular.module('app').factory('anAuthSvc',function($http,anIdentitySvc,$q,anUserSvc){
	return {
		authenticateUser: function(username,password){
			var dfd = $q.defer();
			$http.post('/login',{username:username,password:password}).then(function(response){
				if(response.data.success){
					var user = new anUserSvc();
					angular.extend(user,response.data.user);
					anIdentitySvc.currentUser = user;
					dfd.resolve(true);
				} else {
					dfd.resolve(false);
				}
			});
			return dfd.promise;
		},
		createUser: function(newUserData){
			var newUser = new anUserSvc(newUserData);
			var dfd = $q.defer();

			newUser.$save().then(function(){
				anIdentitySvc.currentUser = newUser;
				dfd.resolve();
			}, function(response){
				dfd.reject(response.data.reason);
			});
			return dfd.promise;
		},
		updateCurrentUser: function(newUserData){
			var dfd = $q.defer();

			var clone = angular.copy(anIdentitySvc.currentUser);
			angular.extend(clone,newUserData);
			clone.$update().then(function(){
				anIdentitySvc.currentUser = clone;
				dfd.resolve();
			}, function(response){
				dfd.reject(response.data.reason);
			});
			return dfd.promise;
		},
		logoutUser: function(){
			var dfd = $q.defer();
			$http.post('/logout',{logout:true}).then(function(){
				anIdentitySvc.currentUser = undefined;
				dfd.resolve();
			})
			return dfd.promise;
		},
		authorizeCurrentUserForRoute: function(role){
			if(anIdentitySvc.isAuthorized(role)){
				return true;
			} else {
				return $q.reject('not authorized');
			}
		},
		authorizeAuthenticateUserForRoute: function(){
			if(anIdentitySvc.isAuthenticated()){
				return true;
			} else {
				return $q.reject('not authorized');
			}
		}
	}
})