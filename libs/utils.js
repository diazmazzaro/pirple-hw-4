/*
 * Helpers for various tasks
 *
 */

// Polyfill Decimal 10

(function() {
  /**
   * Ajuste decimal de un número.
   *
   * @param {String}  tipo  El tipo de ajuste.
   * @param {Number}  valor El numero.
   * @param {Integer} exp   El exponente (el logaritmo 10 del ajuste base).
   * @returns {Number} El valor ajustado.
   */
  function decimalAdjust(type, value, exp) {
    // Si el exp no está definido o es cero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Si el valor no es un número o el exp no es un entero...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
})(); 

// Dependencies
var config = require('../config');
var crypto = require('crypto');
var http = require('http');
var https = require('https');
var querystring = require('querystring');
var path = require('path');
var fs = require('fs');
var StringDecoder = require('string_decoder').StringDecoder;

// Container for all the helpers
var utils = {};

// Exports cofig for others library.
utils.config = config;

// Parse a JSON string to an object in all cases, without throwing
utils.parseJsonToObject = function(str){
  try{
    var obj = JSON.parse(str);
    return obj;
  } catch(e){
    return {};
  }
};

// Create a SHA256 hash
utils.hash = function(str){
  if(typeof(str) == 'string' && str.length > 0){
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Create a string of random alphanumeric characters, of a given length
utils.createRandomString = function(strLength){
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // Define all the possible characters that could go into a string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    var str = '';
    for(i = 1; i <= strLength; i++) {
        // Get a random charactert from the possibleCharacters string
        var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        // Append this character to the string
        str+=randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
};

utils.sendTwilioSms = function(phone,msg,callback){
  // Validate parameters
  phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
  msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
  if(phone && msg){

    // Configure the request payload
    var payload = {
      'From' : config.twilio.fromPhone,
      'To' : '+1'+phone,
      'Body' : msg
    };
    var stringPayload = querystring.stringify(payload);


    // Configure the request details
    var requestDetails = {
      'protocol' : 'https:',
      'hostname' : 'api.twilio.com',
      'method' : 'POST',
      'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
      'auth' : config.twilio.accountSid+':'+config.twilio.authToken,
      'headers' : {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate the request object
    var req = https.request(requestDetails,function(res){
        // Grab the status of the sent request
        var status =  res.statusCode;
        // Callback successfully if the request went through
        if(status == 200 || status == 201){
          callback(false);
        } else {
          callback('Status code returned was '+status);
        }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error',function(e){
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();

  } else {
    callback('Given parameters were missing or invalid');
  }
};

// Safety JSON parse
utils.parseJSON = function(str){
  try{
    var obj = JSON.parse(str);
    return obj;
  } catch(e){
    return {};
  }
};

// Validates Email
utils.validEmail = function(email){
  return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}

// Create a SHA256 hash
utils.hash = function(str){
  if(typeof(str) == 'string' && str.length > 0){
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Fix string to be a directory name
utils.getValidDirName = function(dir) {
  if(typeof(dir) == 'string' && dir.length > 0){
    return dir.replace(/@/g, '_')
  } else {
    return false;
  }
}

// Get basic auth value
utils.getBasicAuth = function(usr, psw){
  return 'Basic ' + Buffer.from(usr + ':' + psw).toString('base64');
}

// Check if header exists
utils.hasHeader = function(options, key){
  var headers = (options ? options.headers : null) || options;
  var re = new RegExp(key, 'i');
  for(var k in headers){
    if(re.test(k)) return true;
  }
  return false;
}

// Pull data from http endpoint
utils.pullEndpoint = function(options, parseJSON, callback){

  // Get callback function
  var callbackFc = callback || (typeof(parseJSON) == 'function' ? parseJSON : false);

  if(!callbackFc)
    throw new Error('Missing callback parameter');

  if(!options)      return callbackFc({ error : { message : 'Missing \'options\' arg.'}});
  if(!options.host) return callbackFc({ error : { message : '\'host\' parameter is empty.'}});

  var protocol = (options.protocol || 'http').toLowerCase();
  var method   = (options.method || 'GET').toUpperCase();
  var path     = options.path || '/';
  var port     = options.port || (protocol == 'https' ? 443 : 80);

  var _http = protocol == 'https'? https : http;


  var ops = {
    host : options.host, // here only the domain name
    port : port,
    path : (/^(\/)/i.test(path) ? '' : '/' ) + path,
    headers: options.headers || {}, 
    method : method
  };
  var body = options.body;
  if(body && typeof(body) === 'object' && typeof(body) != 'string'){
    body = JSON.stringify(body)
    if(!utils.hasHeader(ops, 'Content-Type')) options.headers['Content-Type'] = 'application/json; charset=utf-8';
    if(!utils.hasHeader(ops, 'Content-Length')) options.headers['Content-Length'] = Buffer.byteLength(body, 'utf8');
  }

  var req = _http.request(ops, (res)=>{
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    res.on('data', function(data) {
        buffer += decoder.write(data);
    });
    res.on('end', function() {
      buffer += decoder.end();
      if(parseJSON){
        try{
          if(/^(2)/i.test(res.statusCode.toString()))
            callbackFc(null, {statusCode : res.statusCode , data : JSON.parse(buffer)})
          else
            callbackFc({statusCode : res.statusCode , error : JSON.parse(buffer)})
        }
        catch(err){
          callbackFc({error : err});
        }
      }
      else{
        if(/^(2)/i.test(res.statusCode.toString()))
          callbackFc(null, {statusCode : res.statusCode , data : buffer});
        else
          callbackFc({statusCode : res.statusCode , error : { message : buffer}})
      }

    });
  });
  req.on('error', (err)=>{
    callbackFc({error : err});
  })

  req.on('timeout', (err)=>{
    callbackFc({ error : { message : 'Timeout exeded.' }});
  })
  
  if(body) req.write(Buffer.from(body).toString('utf8'));
  req.end();
}

// Get the contents of a static (public) asset
utils.getStaticAsset = function(fileName,callback){
  fileName = typeof(fileName) == 'string' && fileName.length > 0 ? fileName : false;
  if(fileName){
    var publicDir = path.join(__dirname,'/../public/');
    fs.readFile(publicDir+fileName, function(err,data){
      if(!err && data){
        callback(false,data);
      } else {
        callback('No file could be found');
      }
    });
  } else {
    callback('A valid file name was not specified');
  }
};

// Export the module
module.exports = utils;
