// App Dependencies
var server = require('./libs/server');
var config = require('./config');
var cli    = require('./libs/cli');

var app = {};

app.initialize = function(){
	server.init(config);
	setTimeout(() =>{
		cli.init();
	}, 50)
}

app.initialize();


module.exports = app;