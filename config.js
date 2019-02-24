/*
 * Configuration variables
 *
 */

 // Dependencies
var fs = require('fs');
var path = require('path');

// environments
var environments = {
	// Staging (default) environment
	staging : {
	  'envName'    : 'staging',
	  // Base directory path for file db .
	  'fileDbRoot' : path.resolve(__dirname,'./_data/'),
    // Web Server ports
	  'httpPort'   : 2602,
	  'httpsPort'  : 2601,
	  // SSL certificate
	  'ssl'        : {
	  	'key': fs.readFileSync('./ssl/key.pem'),
		  'cert': fs.readFileSync('./ssl/cert.pem')
	   },
		// Twilio setup.
		'twilio'     : {
	    'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
	    'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
	    'fromPhone' : '+15005550006'
	  },
	  // key for crypto
	  'hashingSecret' : 'thisIsASecret',
	  'stripe'        : {
	  	'key'       : 'sk_test_4eC39HqLyjWDarjtT1zdp7dc'
	  },
	  'mailgun'       : {
      'key' : '4e28dcdd0845a4576edf856073e18d5d-059e099e-0e15e915',
      'from': 'Pirple Pizza Delivery System <pizzadelivery@pirple.com>'
	  },
	  'templateGlobals' : {
	    'appName' : 'Pizza Delivery',
	    'companyName' : 'PDMCompany, Inc.',
	    'yearCreated' : '2019',
	    'baseUrl' : 'http://localhost:2602/'
	  }
	},

	// Production environment
	production : {
		'envName'    : 'production',
		// Base directory path for file db .
	  'fileDbRoot' : path.resolve(__dirname,'./.data/'),
    // Web Server ports
	  'httpPort'   : 3012,
	  'httpsPort'  : 3011,
	  // SSL certificate
	  'ssl'        : {
	  	'key': fs.readFileSync('./ssl/key.pem'),
		  'cert': fs.readFileSync('./ssl/cert.pem')
		},
		// Twilio setup.
		'twilio'     : {
	    'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
	    'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
	    'fromPhone' : '+15005550006'
	  },
	  // key for crypto
	  'hashingSecret' : 'thisIsASecret',
	  'stripe'        : {
	  	'key'       : 'sk_test_4eC39HqLyjWDarjtT1zdp7dc'
	  },
	  'mailgun'       : {
      'key' : '4e28dcdd0845a4576edf856073e18d5d-059e099e-0e15e915',
      'from': 'Pirple Pizza Delivery System <pizzadelivery@pirple.com>'
	  },
	  'templateGlobals' : {
	    'appName' : 'Pizza Delivery',
	    'companyName' : 'PDMCompany, Inc.',
	    'yearCreated' : '2019',
	    'baseUrl' : 'http://localhost:3012/'
	  }
	}
}

// Determine which environment was passed as a command-line argument
var env = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Export the module
module.exports = typeof(environments[env]) == 'object' ? environments[env] : environments.staging;
