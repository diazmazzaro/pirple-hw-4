/*
 * Library for handel chekout orders
 *
 */

// App Dependencies
var fileDB  = require('../file-db');
var utils   = require('../utils');
var tokens  = require('./tokens');
var stripe  = require('../stripe-api');
var mailgun = require('../mailgun-api')



// Container for all the orders methods
var checkout  = {};

// orders
checkout.requests = function(data,callback){
  var acceptableMethods = ['post','get'];
  if(acceptableMethods.indexOf(data.method) > -1){
    checkout[data.method](data,callback);
  } else {
    callback(405);
  }
};


// Order - get
// Required data: email
// Optional data: none
checkout.get = function(data,callback){
  // Check that all required fields are filled out
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0  && utils.validEmail(data.payload.email.trim()) ? data.payload.email.trim() : false;

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
            var checkout = {
              userId : data.userId,
              menuId : data.menuId,
              total  : 0,
              count  : 0
            }

            if(data.orders && data.orders.length){
              data.orders.forEach(item => {
                if(!item.purchased){
                  checkout.total += item.price;
                  checkout.count += 1;
                }
              })
              checkout.total = Math.round10(checkout.total, -2);
              
              callback(200, checkout);
            }
            else{
              callback(400,{'Error' : 'No items to checkout'});  
            }
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
// Required data: email, card
// Optional data: none
checkout.post = function(data,callback){
  // Check that all required fields are filled out
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0  && utils.validEmail(data.payload.email.trim()) ? data.payload.email.trim() : false;
  var card = typeof(data.payload.card) == 'string' && data.payload.card.trim().length > 0 ? data.payload.card.trim() : false;

  // Get user id (based on email)
  var id = utils.getValidDirName(email);

  if(email && card){

    // Get token from headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    // Verify that the given token is valid for the phone number
    tokens.verifyToken(token,email,function(tokenIsValid){
      if(tokenIsValid){
        // Make sure the menue exist
        fileDB.read('orders',id,function(err,data){
          if(!err){
            var checkout = {
              total  : 0,
              count  : 0
            }

            if(data.orders && data.orders.length){
              data.orders.forEach(item => {
                if(!item.purchased){
                  checkout.total += item.price;
                  checkout.count += 1;
                  item.purchased = true;
                  item.purchaseDate = Date.now();
                }
              })
              // If exists items to purchase
              if(checkout.count){
                // Total amount
                checkout.total = Math.round10(checkout.total, -2);
                // call stripe API to create charge (fix dolar with decimals to cents)
                stripe.createCharge(Math.round10(checkout.total * 100, 0), 'usd', card, email, checkout.count + ' items purchased. Total $' + checkout.total + '.', (err, stripeData) =>{
                  if(err){
                    callback(500,err);  
                  } else {
                    fileDB.update('orders',id,data,function(err){
                      if(!err){
                        mailgun.sendEmail(email, 'Pizza Delivery receipt - $' + checkout.total, 'Here is your receipt for ' + checkout.count + ' items purchased. Total $' + checkout.total + '.', (err, mailgunData) =>{
                          if(err){
                            callback(200, { warning : err})
                          }
                          else{
                            callback(200)
                          }
                        })
                      } else {
                        callback(500,{'Error' : 'Could not remove the order'});
                      }
                    });
                  }
                });  
              } else{
                callback(400,{'Error' : 'No items to checkout'});  
              }
            }
            else{
              callback(400,{'Error' : 'No items to checkout'});  
            }
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


module.exports = checkout;