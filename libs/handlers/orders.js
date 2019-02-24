/*
 * Library for handel user oreders
 *
 */

// App Dependencies
var fileDB = require('../file-db');
var utils = require('../utils');
var tokens = require('./tokens')



// Container for all the orders methods
var orders  = {};

// orders
orders.requests = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    orders[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Order - get
// Required data: email
// Optional data: none
orders.get = function(data,callback){
  // Check that all required fields are filled out
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0  && utils.validEmail(data.payload.email.trim()) ? data.payload.email.trim() : false;

  if(data.qsObj && data.qsObj.email)
    email = typeof(data.qsObj.email) == 'string' && data.qsObj.email.trim().length > 0  ? data.qsObj.email.trim() : false;

  
  // Check that email is valid
  // Get user id (based on email)
  var id = utils.getValidDirName(email);

  if(email){

  	// Get token from headers
  	var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

  	// Verify that the given token is valid for the phone number
  	tokens.verifyToken(token,email,function(tokenIsValid){
    	if(tokenIsValid){
		    // Make sure the menue exist
		    fileDB.read('orders',id,function(err,data){
		      if(!err){
		      	callback(200, data);
		      } else {
		        callback(400,{'Error' : 'Could not find order'});
		      }
		    });
    	}else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid."});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }
};


// Order - post
// Required data: menuid, email
// Optional data: none
orders.post = function(data,callback){
  // Check that all required fields are filled out
  var menuId = typeof(data.payload.menuId) == 'string' && data.payload.menuId.trim().length > 0 ? data.payload.menuId.trim() : false;
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0  && utils.validEmail(data.payload.email.trim()) ? data.payload.email.trim() : false;

  // Get user id (based on email)
  var id = utils.getValidDirName(email);

  if(menuId && email){

  	// Get token from headers
  	var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

  	// Verify that the given token is valid for the phone number
  	tokens.verifyToken(token,email,function(tokenIsValid){
    	if(tokenIsValid){
		    // Make sure the menue exist
		    fileDB.read('menus',menuId,function(err,menudata){
		      if(!err){
		      	// Oreder's item
		      	var itemObject = {
		      		'menuId' : menuId,
		          'price'  : menudata.price,
		          'purchased' : false
		      	}

		      	// Check if order already exists and needs updates or create new one
		      	fileDB.read('orders',id,function(err,data){
		      		var orderObject;
		      		var action = 'update';
			        if(err){
			        	action = 'create';
			        	// Create the order object
				        orderObject = {
				          'userId' : id,
				          'email'  : email,
				          'orders' : []
				        };
			        }
			        else{
			        	orderObject = data
			        }

			        // Add item to orders arrary
			        orderObject.orders.push(itemObject)

			        // Store the user
			        fileDB[action]('orders',id,orderObject,function(err){
			          if(!err){
			            callback(200);
			          } else {
			            callback(500,{'Error' : 'Could not add the new order'});
			          }
			        });

			      });
		      } else {
		        callback(400,{'Error' : 'Could not find menuid'});
		      }
		    });
    	}else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid."});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }
};


// Order - post
// Required data: none
// Optional data: none
orders.put = function(data,callback){
  callback(405,{'Error' : 'Use POST method instead'});
};

// Order - delete
// Required data: menuid, email
// Optional data: none
orders.delete = function(data,callback){
  // Check that all required fields are filled out
  var menuId = typeof(data.payload.menuId) == 'string' && data.payload.menuId.trim().length > 0 ? data.payload.menuId.trim() : false;
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0  && utils.validEmail(data.payload.email.trim()) ? data.payload.email.trim() : false;

  // Get user id (based on email)
  var id = utils.getValidDirName(email);

  if(menuId && email){

  	// Get token from headers
  	var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

  	// Verify that the given token is valid for the phone number
  	tokens.verifyToken(token,email,function(tokenIsValid){
    	if(tokenIsValid){
		    
      	// Check if order already exists and needs updates or create new one
      	fileDB.read('orders',id,function(err,data){
      		if(!err){

      			// Store the user
      			var idxItem = orders._findItem(data, menuId);
      			if(idxItem  > -1){
      				data.orders.splice(idxItem, 1);
      				if(data.orders.length){
      					fileDB.update('orders',id,data,function(err){
				          if(!err){
				            callback(200);
				          } else {
				            callback(500,{'Error' : 'Could not remove the order'});
				          }
				        });
      				} else {
      					fileDB.delete('orders',id,function(err){
				          if(!err){
				            callback(200);
				          } else {
				            callback(500,{'Error' : 'Could not remove the order'});
				          }
				        });
      				}
      			} else {
	      			callback(400,{'Error' : 'Could not find menuid'});
	      		}
      		} else {
      			callback(400,{'Error' : 'Could not find order object'});
      		}
		    });
    	}else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid."});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }
};

orders._findItem = function(order, menuId){
	if(order && order.orders && order.orders.length){
		var i = 0;
		while(i < order.orders.length){
			if(order.orders[i].menuId == menuId && !order.orders[i].purchased)
				return i;
			i++;
		}
	}
	return -1;
}

module.exports = orders;