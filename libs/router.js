/*
 * Library for reques routing
 *
 */

// Dependencies
var fs = require('fs');
var path = require('path');

// App Dependencies
var shandlers = require('./handlers/_statics')

const PATH_handlers = './handlers';

// Default static handlers
var router = {
	notFound : function(data,callback){
	  callback(404, { msg : 'Endpoint not found.'});
	},
	ping : function(data,callback){
    callback(200, { echo : data.payload});
	}
}

// Load dynamic handlers
router.loadHandlers = function() {
	var dir = path.resolve(__dirname, PATH_handlers);
	fs.readdirSync(dir).forEach(file => {
	  var name = 'api/' + /^([^\.]+)/.exec(file)[1];
	  router[name] = require(path.resolve(dir, file)).requests;
	});
}

// Static assets and handlers
router['favicon.ico']     = shandlers.favicon;
router['public']          = shandlers.public;
router['']                = shandlers.index;
router['index']           = shandlers.index;
router['account/create']  = shandlers.accountCreate;

router['session/create']  = shandlers.sessionCreate;
router['session/deleted'] = shandlers.sessionDeleted;

router['orders/all']      = shandlers.ordersList;
router['orders/book']     = shandlers.ordersBook;



router.loadHandlers();

module.exports = router;