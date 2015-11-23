var MongoDB = require('../ctrls/mongo_db');

try {
  var CONFIG = require('../config.json');
} catch(e) {
  console.log('config.json is not available, therefore I will use an environment variable.');
}

var COLLECTION = 'changelog';


var _respondWithText = function(req, res, text, type) {
  type = type || 'ephemeral';

  res.json(200, {
    response_type: type,
    text: text
  });
};

var _getChangelog = function(req, res) {
  res.send(418, 'Not yet implemented');
};

var _addChangelog = function(req, res) {
  MongoDB.qOpenConnection()
    .then(function(db) {
      var col = db.collection(COLLECTION);
      return col.insertOne(req.body)
    })
    .then(function(dbRes) {
      _respondWithText(req, res, 'Change added to changelog');
    })
    .catch(function(err) {
      _respondWithText(req, res, err);
    });
};


var _editChangelog = function(req, res) {
  res.send(418, 'Not yet implemented');
};

var _removeChangelog = function(req, res) {
  res.send(418, 'Not yet implemented');
};

exports.routeCommands = function(req, res) {
  var text = req.body.text;
  var command = req.body.command;

  if(command === '/changelog') {
    if(!text) {
      _getChangelog(req, res);
    } else {
      var subcommand = text.split(' ')[0];
      switch(subcommand) {
        case 'add':
          _addChangelog(req, res);
          break;
        case 'edit':
          _editChangelog(req, res);
          break;
        case 'remove':
          _removeChangelog(req, res);
          break;
        default:
          _respondWithText(req, res, 'Command not available');
      }
    }
  } else {
    res.send(400, 'This server only handles requests of command /changelog');
  }
};