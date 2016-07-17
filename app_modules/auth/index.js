var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');

/*
  creds.json must be present with Google's JSON token
*/

function authorize (doc, callback) {
  console.log('authorizing...');
  var creds = require('./creds.json');
  doc.useServiceAccountAuth(creds, callback);
}

module.exports = authorize;
