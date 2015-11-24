var MongoDB = require('../ctrls/mongo_db');
var _ = require('lodash');
var Q = require('q');
var utils = require('../ctrls/utils');

try {
  var CONFIG = require('../config.json');
} catch(e) {
  console.log('config.json is not available, therefore I will use an environment variable.');
}

var COLLECTION = 'changelog';

var _respondWithText = function(req, res, text, type) {
  var userName = req.body.user_name
  type = type || 'ephemeral';

  res.json(200, {
    response_type: type,
    text: text
  });
};

var _getChangelog = function(req, res) {
  MongoDB.qOpenConnection()
    .then(function aOpenConnection(db) {
      var col = db.collection(COLLECTION);
      var today = new Date();
      var lastWeek = new Date(new Date().setDate(today.getDate() - 7));

      col
        .find({ date_created: { $gte: lastWeek, $lt: today } })
        .sort({ date_created: 1 })
        .toArray(function(err, items) {
          var date;
          var texts = items.map(function(change) {
            var dateChanged = !date || date.getUTCDate() !== change.date_created.getUTCDate();
            var text = dateChanged ? utils.formatDate(change.date_created) + ':\r\n' : '';
            date = dateChanged ? change.date_created : date;
            text += '\t\t @' + change.user_name + ': ' + change.text + '\r\n'
            return text;
          });
          _respondWithText(req, res, texts.join('') || 'Couldn\'t find a changelog :crying_cat_face:');
        });
    })
    .catch(function aErrorFindChangelog(err) {
      console.error(err);
      _respondWithText(req, res, err.message);
    })
};

var _addChangelog = function(req, res) {
  var words = req.body.text.split(' ');
  MongoDB.qOpenConnection()
    .then(function aOpenConnection(db) {
      var col = db.collection(COLLECTION);

      var date_created = new Date(words[1]);
      var isDateValid = !isNaN(date_created.getTime())
      req.body.text = words.slice(isDateValid ? 2 : 1, words.length).join(' ');

      if(!req.body.text) throw new Error('Sorry, your message was invalid.');
      if(req.body.text.length > 80) throw new Error('Sorry, your message cannot be longer than 80 characters. \r\n This is what you wrote: "' + req.body.text + '"');

      return col.insertOne(_.extend(req.body, { date_created: isDateValid ? date_created : new Date() }))
    })
    .then(function aAddChangelog(dbRes) {
      _respondWithText(req, res, 'Change added to changelog!');
    })
    .catch(function aErrorAddChangelog(err) {
      console.error(err);
      _respondWithText(req, res, err.message);
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
  var token = req.body.token;

  if(token !== CONFIG.SLACK.TOKEN) res.send(401, 'Your team is not allowed to make requests to this server.');

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
          _respondWithText(req, res, 'Command not available!');
      }
    }
  } else {
    res.send(400, 'This server only handles requests of command /changelog');
  }
};