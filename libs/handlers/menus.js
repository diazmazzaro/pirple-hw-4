/*
 * Library for handel menu requests
 *
 */

// App Dependencies
var fileDB = require('../file-db');
var utils = require('../utils');


// Container for all the menus methods
var menus  = {};

// Tokens
menus.requests = function(data,callback){
  // TODO: support all method for RESTful.
  // var acceptableMethods = ['post','get','put','delete'];
  var acceptableMethods = ['get'];
  if(acceptableMethods.indexOf(data.method) > -1){
    menus[data.method](data,callback);
  } else {
    callback(405);
  }
};


// Required data: menuid, email
// Optional data: none
menus.get = function(data,callback){
  
  var email;
  var menuid;
  // Check that email is in query string
  if(data.qsObj && data.qsObj.email)
    email = typeof(data.qsObj.email) == 'string' && data.qsObj.email.trim().length > 0  ? data.qsObj.email.trim() : false;

  // Check that email is in query string
  if(data.qsObj && data.qsObj.menuid)
    menuid = typeof(data.qsObj.menuid) == 'string' && data.qsObj.menuid.trim().length > 0  ? data.qsObj.menuid.trim() : false;

  
  // Check that email is valid
  if(!email)
    email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0  ? data.payload.email.trim() : false;
  
  // Check that email is valid
  if(!menuid)
    menuid = typeof(data.payload.menuid) == 'string' && data.payload.menuid.trim().length > 0  ? data.payload.menuid.trim() : false;
  
  if(email){
  	// If menu id is specified, get that menu item
  	if(menuid){
	    // Get token from headers
	    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
	    // Verify that the given token is valid for the email number
	    tokens.verifyToken(token,email,function(tokenIsValid){
	      if(tokenIsValid){
	        // Lookup the user
	        fileDB.read('menus',menuid,function(err,data){
	          if(!err && data){
	            callback(200,data);
	          } else {
	            callback(404);
	          }
	        });
	      } else {
	        callback(403,{"Error" : "Missing required token in header, or token is invalid."})
	      }
	    });
	  }
	  else{
	  	// if not, list all menu items
	  	menus.list(data, callback)
	  }
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};

// Required data: email
// Optional data: none
menus.list = function(data,callback){
  
  var email;
  // Check that email is in query string
  if(data.qsObj && data.qsObj.email)
    email = typeof(data.qsObj.email) == 'string' && data.qsObj.email.trim().length > 0  ? data.qsObj.email.trim() : false;
  
  // Check that email is valid
  if(!email)
    email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0  ? data.payload.email.trim() : false;

  if(email){
    // Get token from headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    // Verify that the given token is valid for the email number
    tokens.verifyToken(token,email,function(tokenIsValid){
      if(tokenIsValid){
        // Lookup the user
        fileDB.list('menus',function(err,data){
        	var _remainingFiles = data.length;
        	var _hasError = false;
        	var allMenus = [];

        	data.forEach( menuid => {
        		fileDB.read('menus',menuid,function(err,menuData){
		          if(!err && data){
		            allMenus.push(menuData)
		          } else {
		            _hasError = true;
		          }

		          if(--_remainingFiles == 0){
		          	if(_hasError)
		          		callback(500,{"Error" : "Error reading menu files."});
		          	else
		          		callback(200,allMenus);
		          }
		        });
        	});
        	
        })
        
      } else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid."})
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};

module.exports = menus;