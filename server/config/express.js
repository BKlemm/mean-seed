var express = require('express'),
    path = require('path'),
    passport = require('passport');

module.exports = function(app,config){

	app.configure(function () {
		app.set('port', config.port);
		app.set('views', path.join(config.rootPath, 'server/views'));
		app.set('view engine', 'jade');
		app.use(express.favicon());
		app.use(express.logger('dev'));
		app.use(express.json());
		app.use(express.cookieParser());
		app.use(express.bodyParser());
		app.use(express.session({secret:'angular node'}))
		app.use(express.urlencoded());
		app.use(express.methodOverride());
		app.use(passport.initialize());
		app.use(passport.session());
		//app.use(app.router);
		app.use(express.static(path.join(config.rootPath, 'public')));

		if ('development' == app.get('env')) {
  			app.use(express.errorHandler());
		}
	});
}