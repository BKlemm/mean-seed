angular.module('app').value('anToastr',toastr);

angular.module('app').factory('anNotifierSvc',function(anToastr){
	return {
		notify: function(msg){
			anToastr.success(msg);
			console.log(msg);
		},
		error: function(msg){
			anToastr.error(msg);
			console.log(msg);
		}
	}
})