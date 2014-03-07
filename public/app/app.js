angular.module('app',['ngResource','ngRoute']);

angular.module('app').config(function ($routeProvider) {
	var routeRoleChecks = {
		admin: {auth: function(anAuth){
			return anAuth.authorizeCurrentUserForRoute('admin');
		}},
		user: {auth: function(anAuth){
			return anAuth.authorizeAuthenticateUserForRoute();
		}}
	}

	$routeProvider
		.when('/',{
			templateUrl: '/partials/main/main',
			controller: 'mainCtrl'
		})
		.when('/admin/users',{
			templateUrl: '/partials/admin/user-list',
			controller: 'userListCtrl',
			resolve: routeRoleChecks.admin
		})
		.when('/signup',{
			templateUrl: '/partials/account/signup',
			controller: 'signupCtrl'
		})
		.when('/profile',{
			templateUrl: '/partials/account/profile',
			controller: 'profileCtrl',
			resolve: routeRoleChecks.user
		})
		.when('/cources',{
			templateUrl: '/partials/cources/cource-list',
			controller: 'courceListCtrl'
		})
		.when('/cources/:id',{
			templateUrl: '/partials/cources/cource-details',
			controller: 'courceDetailCtrl'
		})
	});

angular.module('app').run(function ($rootScope,$location) {
	$rootScope.$on('$routeChangeError', function(evt,current,prevoius,rejection){
		if(rejection === 'not authorized'){
			$location.path('/');
		}
	})
});
