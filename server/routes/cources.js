var Cource = require('mongoose').model('Cource');

exports.getCources = function(req,res) {
	Cource.find({}).exec(function(err,collection){
		res.send(collection);
	})
};

exports.getCourcesById = function(req,res) {
	Cource.findOne({_id:req.params.id}).exec(function(err,cource){
		res.send(cource);
	})
};