var mongoose = require('mongoose');

var courceSchema = mongoose.Schema({
	title: {type:String, required:'{PATH} is required!'},
	featured: {type:Boolean, required:'{PATH} is required!'},
	published: {type: Date, required: '{PATH} is required!',unique:true},
	tags: [String]
});

var Cource = mongoose.model('Cource',courceSchema);

function createDefaultCources(){
	Cource.find({}).exec(function(err,collection){
		if(collection.length === 0){
			Cource.create({title: 'C# for Scociopaths', featured: true, published: new Date('1/1/2014'),tags: ['C#']}),
			Cource.create({title: 'Java for Scociopaths', featured: false, published: new Date('1/10/2014'),tags: ['Java']}),
			Cource.create({title: 'C for Scociopaths', featured: true, published: new Date('4/1/2014'),tags: ['C']}),
			Cource.create({title: 'C++ for Scociopaths', featured: true, published: new Date('1/1/2014'),tags: ['C++']}),
			Cource.create({title: 'Python for Scociopaths', featured: false, published: new Date('12/1/2014'),tags: ['Python']}),
			Cource.create({title: 'HTML for Scociopaths', featured: true, published: new Date('1/11/2014'),tags: ['html']}),
			Cource.create({title: 'CSS for Scociopaths', featured: true, published: new Date('10/11/2014'),tags: ['CSS']}),
			Cource.create({title: 'CSS3 for Scociopaths', featured: true, published: new Date('1/2/2014'),tags: ['CSS3']}),
			Cource.create({title: 'C-Sharp for Scociopaths', featured: true, published: new Date('1/3/2014'),tags: ['C#']}),
			Cource.create({title: 'Javascript for Scociopaths', featured: false, published: new Date('1/4/2014'),tags: ['Javascript']}),
			Cource.create({title: 'Ruby for Scociopaths', featured: true, published: new Date('10/5/2014'),tags: ['Ruby']})
		}
	})
};

exports.createDefaultCources = createDefaultCources;