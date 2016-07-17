var express = require('express');
var exphbs = require('express-handlebars');
var auth = require('../auth');

function parseCellsIntoRows (cells) {
  var result = {};

  cells.forEach(function(cell) {
    if (!cell.value) {
      return;
    }

    var coords = cell.batchId.match(/R(\d+)C(\d+)/);

    if (!result[coords[1]]) {
      result[coords[1]] = {};
    }

    result[coords[1]][coords[2]] = cell.value;
  });

  return result;
}

function parseRowsIntoData (rows) {
    var users = {};
    var aromkas = {};
    var aromkasWithReviews = {};

  // parse users
  Object.keys(rows[5]).forEach(function(colId) {
    if (colId > 2) {
      users[colId] = rows[5][colId];
    }
  });

  // parse aromkas
  Object.keys(rows).forEach(function(rowId) {
    if (rowId >= 7) {
      aromkas[rowId] = rows[rowId][1];
    }
  });

  // parse reviews
  Object.keys(aromkas).forEach(function(aromkaRowId) {
    var aromkaKeys = Object.keys(rows[aromkaRowId]);

    if (aromkaKeys.length > 1) {
      aromkasWithReviews[aromkaRowId] = {
        name: aromkas[aromkaRowId],
        reviews: []
      };

      aromkaKeys.forEach(function(colId) {
        colId = parseInt(colId);
        if (users[parseInt(colId) + 1]) {
          var thingToPush = {};

          thingToPush = {
            name: users[colId - 1],
            percentage: rows[aromkaRowId][colId - 1] ? rows[aromkaRowId][colId - 1].replace(/%?$/, '%') : '',
            review: rows[aromkaRowId][colId]
          }

          aromkasWithReviews[aromkaRowId].reviews.push(thingToPush);
        }
      });
    } else {
      delete aromkas[aromkaRowId];
    }
  });

  var aromkasArray = Object.keys(aromkas).map(function(key) {
    return {
      id: key,
      name: aromkas[key],
      reviewsCount: aromkasWithReviews[key].reviews.length
    }
  });

  return {
    aromkas: aromkasArray,
    aromkasWithReviews: aromkasWithReviews
  };
}

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
        var spreadsheetData = parseRowsIntoData(parseCellsIntoRows(cells));
        res.render('index', {
          title: 'Шток-Ревю',
          aromkas: spreadsheetData.aromkas
        });
      });
    });
  });

  app.get('/:id', function(req, res) {
    getInfo(doc, function(info) {
      info.worksheets[0].getCells(function(error, cells) {
        var spreadsheetData = parseRowsIntoData(parseCellsIntoRows(cells));
        res.render('aroma', {
          title: 'Шток-Ревю',
          data: spreadsheetData.aromkasWithReviews[req.params.id]
        });
      });
    });
  })

  app.listen(port, function () {
    console.log('server started on', port);
  });
}

module.exports = createServerForDocument;
