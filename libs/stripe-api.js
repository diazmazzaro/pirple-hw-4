/*
 * Library for spripe api wrapper
 *
 */

// Dependencies
var https = require('https');
// App Dependencies
var config = require('../config');
var utils = require('./utils');

// API endpoins
var STRIPE_host = 'api.stripe.com';
var STRIPE_charges = '/v1/charges';



var stripe = {};
stripe._cards ={
	'visa' : 'tok_visa',
	'visa_debit' : 'tok_visa_debit',
	'mastercard' : 'tok_mastercard',
	'mastercard_debit' : 'tok_mastercard_debit',
	'mastercard_prepaid' : 'tok_mastercard_prepaid',
	'amex' : 'tok_amex',
	'discover' : 'tok_discover',
	'diners' : 'tok_diners',
	'jcb' : 'tok_jcb',
	'unionpay' : 'tok_unionpay'
}

// createCharge - post charge to stripe API
// Required data: amount, currency, card
// Optional data: description
stripe.createCharge = function(amount,currency, card, email, description, callback){
	// Get callback function
  var callbackFc = callback || (typeof(description) == 'function' ? description : false);

	var _key = config.stripe && config.stripe.key || false;

	if(_key){
		// Check that all required fields are filled out
		var _amount   = typeof(amount) == 'number' &&  amount >= 50 ? amount : false;
	  var _currency = typeof(currency) == 'string' && currency.trim().length > 0 ? currency.trim() : false;
	  var _email    = typeof(email) == 'string' && email.trim().length > 0 ? email.trim() : false;
		var _card     = typeof(card) == 'string' && card.trim().length > 0 ? card.trim().toLowerCase() : false;
		    _card     = stripe._cards[_card] || false;

		var _description = typeof(description) == 'string' && description.trim().length > 0 ? description.trim() : false;

		if(_amount && _currency && _card){
			

			var dataString = 'amount=' + _amount 
			               + '&currency=' + _currency
			               + '&source=' + _card
			               // + 'receipt_email=' + encodeURI(_email) Unsuported for testing;
			               + (_description ? '&description=' + encodeURI(_description) : '');
			console.log(dataString)
			var options = {
				protocol : 'https',
				host     : STRIPE_host,
				path     : STRIPE_charges,
				method   : 'POST',
				body     : dataString,
				headers  : {
					'Content-Type' : 'application/x-www-form-urlencoded',
					'Authorization' : utils.getBasicAuth(_key, '')
				}
			}
			utils.pullEndpoint(options, true, (err, data)=>{
				callbackFc(err, data)
			})

		}else {
	    callbackFc({ error : 'Missing required fields' });
	  }
	}else {
    callbackFc({ error : 'Missing stripe config key' });
  }
}

module.exports = stripe;