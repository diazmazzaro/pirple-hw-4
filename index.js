// App Dependencies
var server = require('./libs/server');
var config = require('./config');

var app = {};

app.initialize = function(){
	server.init(config);
}

app.initialize();


module.exports = app;