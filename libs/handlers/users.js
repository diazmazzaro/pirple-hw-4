/*
 * Library for handel user requests
 *
 */

// App Dependencies
var fileDB = require('../file-db');
var utils = require('../utils');
var tokens = require('./tokens')



// Container for all the users methods
var users  = {};

// Users
users.requests = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    users[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Users - post
// Required data: firstName, lastName, email, address, phone, password, tosAgreement
// Optional data: none
users.post = function(data,callback){
  // Check that all required fields are filled out
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0  && utils.validEmail(data.payload.email.trim()) ? data.payload.email.trim() : false;

  var address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length > 0  ? data.payload.address.trim() : false;

  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  var id = utils.getValidDirName(email);

  if(firstName && lastName && phone && password && email && address && tosAgreement){
    // Make sure the user doesnt already exist
    fileDB.read('users',id,function(err,data){
      if(err){
        // Hash the password
        var hashedPassword = utils.hash(password);

        // Create the user object
        if(hashedPassword){
          var userObject = {
            'firstName' : firstName,
            'lastName' : lastName,
            'phone' : phone,
            'email' : email,
            'address' : address,
            'hashedPassword' : hashedPassword,
            'tosAgreement' : true
          };

          console.log('ready to create')
          // Store the user
          fileDB.create('users',id,userObject,function(err){
            if(!err){
              callback(200);
            } else {
              callback(500,{'Error' : 'Could not create the new user'});
            }
          });
        } else {
          callback(500,{'Error' : 'Could not hash the user\'s password.'});
        }

      } else {
        // User alread exists
        callback(400,{'Error' : 'A user with that email already exists'});
      }
    });

  } else {
    var msg = '';
    if(!phone)
      msg += 'Missing or invalid phone\n';
    if(!email)
      msg += 'Missing or invalid email\n';
    callback(400,{'Error' : 'Missing reqfuired fields', 'message' : msg});
  }

};

// Required data: email
// Optional data: none
users.get = function(data,callback){
  // Check that email is in query string
  var email;

  if(data.qsObj && data.qsObj.email)
    email = typeof(data.qsObj.email) == 'string' && data.qsObj.email.trim().length > 0  ? data.qsObj.email.trim() : false;

  
  // Check that email is valid
  if(!email)
    email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0  ? data.payload.email.trim() : false;

  if(email){
    var id = utils.getValidDirName(email);
    // Get token from headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    // Verify that the given token is valid for the email number
    tokens.verifyToken(token,email,function(tokenIsValid){
      if(tokenIsValid){
        // Lookup the user
        fileDB.read('users',id,function(err,data){
          if(!err && data){
            // Remove the hashed password from the user user object before returning it to the requester
            delete data.hashedPassword;
            callback(200,data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid."})
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};

// Required data: email
// Optional data: firstName, lastName, phone, address,password (at least one must be specified)
users.put = function(data,callback){
  // Check for required field
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0  ? data.payload.email.trim() : false;

  // Check for optional fields
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length > 0  ? data.payload.address.trim() : false;

  // Error if phone is invalid
  if(email){
    var id = utils.getValidDirName(email);

    // Error if nothing is sent to update
    if(firstName || lastName || password || phone || address){

      // Get token from headers
      var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

      // Verify that the given token is valid for the phone number
      tokens.verifyToken(token,email,function(tokenIsValid){
        if(tokenIsValid){

          // Lookup the user
          fileDB.read('users',id,function(err,userData){
            if(!err && userData){
              // Update the fields if necessary
              if(firstName){
                userData.firstName = firstName;
              }
              if(lastName){
                userData.lastName = lastName;
              }
              if(password){
                userData.hashedPassword = helpers.hash(password);
              }
              // Store the new updates
              fileDB.update('users',id,userData,function(err){
                if(!err){
                  callback(200);
                } else {
                  callback(500,{'Error' : 'Could not update the user.'});
                }
              });
            } else {
              callback(400,{'Error' : 'Specified user does not exist.'});
            }
          });
        } else {
          callback(403,{"Error" : "Missing required token in header, or token is invalid."});
        }
      });
    } else {
      callback(400,{'Error' : 'Missing fields to update.'});
    }
  } else {
    callback(400,{'Error' : 'Missing required field.'});
  }

};

// Required data: phone
// Cleanup old checks associated with the user
users.delete = function(data,callback){
  // Check that phone number is valid
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0  ? data.payload.email.trim() : false;

  if(email){

    var id = utils.getValidDirName(email);

    // Get token from headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    // Verify that the given token is valid for the phone number
    tokens.verifyToken(token,email,function(tokenIsValid){
      if(tokenIsValid){
        // Lookup the user
        fileDB.read('users',id,function(err,userData){
          if(!err && userData){
            // Delete the user's data
            fileDB.delete('users',id,function(err){
              if(!err){
                callback(200);
              }
              else {
                callback(500,{'Error' : 'Could not delete the specified user'});
              }
            });
          } else {
            callback(400,{'Error' : 'Could not find the specified user.'});
          }
        });
      } else {
        callback(403,{"Error" : "Missing required token in header, or token is invalid."});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};

module.exports = users;