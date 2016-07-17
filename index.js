// node modules
var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');

// app modules
var authorize = require('./app_modules/auth');
var server = require('./app_modules/server');

var doc = new GoogleSpreadsheet('1orBhRALYqEZW5S7QP3ZPqohY0gd6dDZRbHD_YMQh5xI');

server(doc, 8080);
