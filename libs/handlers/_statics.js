// App Dependencies
var utils     = require('../utils');
var templates = require('../templates');

var statics = {};

var HTML_index = '' +
'<html>' +
  '<head>' +
    '<!-- General Settings -->' +
    '<meta charset="utf-8">' +
    '<meta http-equiv="content-language" content="en-us">' +
    '<base href="{global.baseUrl}" />' +
    '<!-- Meta Tags -->' +
    '<title>{head.title} | {global.appName}</title>' +
    '<meta name="description" content="{head.description}">' +
    '<!-- Static Assets -->' +
    '<link type="image/x-icon" rel="icon" href="favicon.ico">' +
    '<script type="text/javascript" charset="utf-8" src="public/app.js"></script>' +
    '<link rel="stylesheet" type="text/css" href="public/app.css" />' +
  '</head>' +
  '<body class="{body.class}">' +
  	'Hello World!' +
  '</body>' +
 '</html>';

// Get temporal index html for test
statics.tmpIndex = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Callback the data
    callback(200,HTML_index,'html');
  } else {
    callback(405);
  }
};

// Index
statics.index = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    var templateData = {
      'head.title' : 'Welcome',
      'head.description' : 'Welcome to PDM\'s Pizza Delivery',
      'body.class' : 'index'
    };
    // Read in a template as a string
    templates.get('index',templateData,function(err,str){
      if(!err && str){
        // Add the universal header and footer
        templates.addMasterTemplates(str,templateData,function(err,str){
          if(!err && str){
            // Return that page as HTML
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }
};

// Create New Session
statics.sessionCreate = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    var templateData = {
      'head.title' : 'Login to your account.',
      'head.description' : 'Please enter your phone number and password to access your account.',
      'body.class' : 'sessionCreate'
    };
    // Read in a template as a string
    templates.get('sessionCreate',templateData,function(err,str){
      if(!err && str){
        // Add the universal header and footer
        templates.addMasterTemplates(str,templateData,function(err,str){
          if(!err && str){
            // Return that page as HTML
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }
};

// Session has been deleted
statics.sessionDeleted = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    var templateData = {
      'head.title' : 'Logged Out',
      'head.description' : 'You have been logged out of your account.',
      'body.class' : 'sessionDeleted'
    };
    // Read in a template as a string
    templates.get('sessionDeleted',templateData,function(err,str){
      if(!err && str){
        // Add the universal header and footer
        templates.addMasterTemplates(str,templateData,function(err,str){
          if(!err && str){
            // Return that page as HTML
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }
};

// Create Account
statics.accountCreate = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    var templateData = {
      'head.title' : 'Create an Account',
      'head.description' : 'Signup is easy and only takes a few seconds.',
      'body.class' : 'accountCreate'
    };
    // Read in a template as a string
    templates.get('accountCreate',templateData,function(err,str){
      if(!err && str){
        // Add the universal header and footer
        templates.addMasterTemplates(str,templateData,function(err,str){
          if(!err && str){
            // Return that page as HTML
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }
};

// Dashboard (view all checks)
statics.ordersList = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    var templateData = {
      'head.title' : 'Orders History',
      'body.class' : 'ordersList'
    };
    // Read in a template as a string
    templates.get('ordersList',templateData,function(err,str){
      if(!err && str){
        // Add the universal header and footer
        templates.addMasterTemplates(str,templateData,function(err,str){
          if(!err && str){
            // Return that page as HTML
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }
};

// Create a new check
statics.ordersBook = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    var templateData = {
      'head.title' : 'Book an order',
      'body.class' : 'ordersBook'
    };
    // Read in a template as a string
    templates.get('ordersBook',templateData,function(err,str){
      if(!err && str){
        // Add the universal header and footer
        templates.addMasterTemplates(str,templateData,function(err,str){
          if(!err && str){
            // Return that page as HTML
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }
};

// Favicon
statics.favicon = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Read in the favicon's data
    utils.getStaticAsset('favicon.ico',function(err,data){
      if(!err && data){
        // Callback the data
        callback(200,data,'favicon');
      } else {
        callback(500);
      }
    });
  } else {
    callback(405);
  }
};

// Public assets
statics.public = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Get the filename being requested
    var trimmedAssetName = data.path.replace('public/','').trim();
    if(trimmedAssetName.length > 0){
      // Read in the asset's data
      utils.getStaticAsset(trimmedAssetName,function(err,data){
        if(!err && data){

          // Determine the content type (default to plain text)
          var contentType = 'plain';

          if(trimmedAssetName.indexOf('.css') > -1){
            contentType = 'css';
          }

          if(trimmedAssetName.indexOf('.png') > -1){
            contentType = 'png';
          }

          if(trimmedAssetName.indexOf('.jpg') > -1){
            contentType = 'jpg';
          }

          if(trimmedAssetName.indexOf('.ico') > -1){
            contentType = 'favicon';
          }

          // Callback the data
          callback(200,data,contentType);
        } else {
          callback(404);
        }
      });
    } else {
      callback(404);
    }

  } else {
    callback(405);
  }
};

module.exports = statics;