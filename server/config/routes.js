var routes = require('../routes'),
	users = require('../routes/users'),
	cources = require('../routes/cources'),
	auth = require('./auth'),
	mongoose = require('mongoose'),
 	User = mongoose.model('User');

module.exports = function(app){

	app.get('/api/users', auth.requiresRole('admin'), users.getUser);
	app.post('/api/users',users.createUser);
	app.put('/api/users',users.updateUser);

	app.get('/api/cources',cources.getCources);
	app.get('/api/cources/_id',cources.getCourcesById);

	app.get('/partials/*', function(req,res){
		res.render('../../public/app/' + req.params);
	});

	app.post('/login',auth.authenticate);
	app.post('/logout',auth.logout);

	app.all('/api/*',function(req,res){
		res.send(404);
	})

	app.get('*',function(req,res){
		res.render('index', { title: 'Angularnode', bootstrappedUser: req.user });
	});
}