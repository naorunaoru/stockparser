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

function parseCells (cells) {
  if (!cells) {
    console.log('cells?', cells);
    return;
  }
  var rows = parseCellsIntoRows(cells);

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

        if (users[colId - 1]) {
          aromkasWithReviews[aromkaRowId].reviews.push({
            name: users[colId - 1],
            percentage: rows[aromkaRowId][colId - 1] ? rows[aromkaRowId][colId - 1].replace(/%?$/, '%') : '',
            review: rows[aromkaRowId][colId]
          });
        }
      });
    }
  });

  var aromkasArray = Object.keys(aromkas).map(function(key) {
    return {
      id: key,
      name: aromkas[key],
      reviewsCount: aromkasWithReviews[key] ? aromkasWithReviews[key].reviews.length : 0
    }
  });

  var usersArray = Object.keys(users).map(function(key) {
    return {
      id: key,
      name: users[key]
    }
  });

  return {
    users: usersArray,
    aromkas: aromkasArray,
    aromkasWithReviews: aromkasWithReviews
  };
}

module.exports = parseCells;
