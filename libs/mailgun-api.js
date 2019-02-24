/*
 * Library for mailgun api wrapper
 *
 */

// Dependencies
var https = require('https');
// App Dependencies
var config = require('../config');
var utils = require('./utils');

// API endpoins
var MAILGUN_host = 'api.mailgun.net';
var MAILGUN_message = '/v3/sandbox9755b74a902142768480bae8d1d9c66e.mailgun.org/messages';

var mailgun = {};

// createCharge - send mail via Mailgun API
// Required data: email, subject, body
// Optional data: none
mailgun.sendEmail = function(email, subject, body, callback){

	var _key = config.mailgun && config.mailgun.key || false;
	var _from = config.mailgun && config.mailgun.from || false;
	console.log('key  -->', _key)
	console.log('from -->', _from)
	if(_key && _from){
		// Check that all required fields are filled out
		var _email    = typeof(email) == 'string' && email.trim().length > 0 ? email.trim() : false;
		var _subject  = typeof(subject) == 'string' && subject.trim().length > 0 ? subject.trim() : false;
		var _body     = typeof(body) == 'string' && body.trim().length > 0 ? body.trim() : false;
		

		if(_email && _subject && _body){
			

			var dataString = 'from='     + encodeURI(_from)
			               + '&to='      + encodeURI(_email)
			               + '&subject=' + encodeURI(_subject)
			               + '&text='    + encodeURI(_body);

			var options = {
				protocol : 'https',
				host     : MAILGUN_host,
				path     : MAILGUN_message,
				method   : 'POST',
				body     : dataString,
				headers  : {
					'Content-Type' : 'application/x-www-form-urlencoded',
					'Authorization' : utils.getBasicAuth('api', _key)
				}
			}
			utils.pullEndpoint(options, true, (err, data)=>{
				callback(err, data)
			})

		}else {
	    callback({ error : 'Missing required fields' });
	  }
	}else {
    callback({ error : 'Missing mailgun config key' });
  }
}

module.exports = mailgun;