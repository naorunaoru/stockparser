var express = require('express');
var exphbs = require('express-handlebars');
var auth = require('../auth');
var parseCells = require('./parse');

function getInfo (doc, callback) {
  doc.getInfo(function(error, info) {
    if (error) {
      auth(doc, function() {
        getInfo(doc, callback);
      });
      return;
    }

    callback(info);
  });
}

function createServerForDocument (doc, port) {
  var app = express();
  app.engine('.hbs', exphbs({
    layoutsDir: './app_modules/server/views/layouts',
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
      json: function(context) {
          return JSON.stringify(context);
      }
    }
  }));
  app.set('view engine', '.hbs');
  app.set('views', './app_modules/server/views');
  app.use(express.static('./app_modules/server/public'));
  port == port || 8080;

  app.get('/', function (req, res) {
    getInfo(doc, function(info) {
      info.worksheets[0].getCells(function(error, cells) {
        var spreadsheetData = parseCells(cells);
        res.render('index', {
          title: 'Шток-Ревю',
          aromkas: spreadsheetData.aromkas.filter(function(aromka) {
            return aromka.reviewsCount > 0;
          })
        });
      });
    });
  });

  app.get('/:id', function(req, res) {
    getInfo(doc, function(info) {
      info.worksheets[0].getCells(function(error, cells) {
        var data = parseCells(cells).aromkasWithReviews[req.params.id];
        if (!data) {
          return;
        }

        res.render('aroma', {
          title: 'Шток-Ревю | ' + data.name,
          data: data
        });
      });
    });
  })

  app.listen(port, function () {
    console.log('server started on', port);
  });
}

module.exports = createServerForDocument;
