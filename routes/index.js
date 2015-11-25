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
  var input = '@' + userName + ': ' + req.body.command + ' ' + req.body.text + '\r\n';
  type = type || 'ephemeral';

  res.json(200, {
    response_type: type,
    text: input + text
  });
};

var _getChangelog = function(req, res, start, end) {
  MongoDB.qOpenConnection()
    .then(function aOpenConnection(db) {
      var col = db.collection(COLLECTION);

      col
        .find({ date_created: { $gte: start, $lt: end } })
        .sort({ date_created: 1 })
        .toArray(function(err, items) {
          console.log(items);
          var date;
          var texts = items.reduce(function(text, change) {
            var dateChanged = !date || date.getUTCDate() !== change.date_created.getUTCDate();
            text += dateChanged ? '\r\n\t\t' + utils.formatDate(change.date_created) + ':\r\n' : '';
            date = dateChanged ? change.date_created : date;
            text += '\t\t\t\t #' + change.hash.slice(-6) + ' @' +  change.user_name + ': ' + change.text + '\r\n'
            return text;
          }, '');
          _respondWithText(req, res, texts || ':crying_cat_face:: "Couldn\'t find a changelog."');
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
      var changeText = words.slice(isDateValid ? 2 : 1, words.length).join(' ');

      if(!changeText) throw new Error(':crying_cat_face:: "Sorry human, your message was invalid. Human obliteration initiated."');
      if(changeText.length > 80) throw new Error(':crying_cat_face:: "Sorry human, Linus told me that messages can not be longer than 80 characters."');

      var body = _.extend(_.extend({}, req.body), {
        date_created: isDateValid ? date_created : new Date(),
        text: changeText,
      });
      return col.insertOne(_.extend(body, {
        hash: require('crypto').createHash('md5').update(JSON.stringify(body)).digest("hex")
      }))
    })
    .then(function aAddChangelog(dbRes) {
      _respondWithText(req, res, ':kissing_cat:: "Hello human, I have added your change to the list!"');
    })
    .catch(function aErrorAddChangelog(err) {
      console.error(err);
      _respondWithText(req, res, err.message);
    });
};

var _rmChangelog = function(req, res) {
  var words = req.body.text.split(' ');
  MongoDB.qOpenConnection()
    .then(function aOpenConnection(db) {
      var col = db.collection(COLLECTION);

      var hash = words[1];
      if(hash.length !== 6) throw new Error(':crying_cat_face:: 1, 2, 3... wait a second. Human, your hash doesn\'t have 7 characters.')

      return col.deleteOne({ hash: { $regex: hash.slice(-6) } });
    })
    .then(function aRmChangelog(dbRes) {
      if(dbRes.deletedCount === 1) {
        _respondWithText(req, res, ':scream_cat:: "The changelog? Where is it? I need to find it!" (It was deleted)');
      } else {
        throw new Error(':crying_cat_face:: Oh, no! We have deleted something else! Please contact tim@ascribe.io');
      }
    })
    .catch(function aErrorRmChangelog(err) {
      console.error(err);
      _respondWithText(req, res, err.message);
    });
};

exports.routeCommands = function(req, res) {
  var text = req.body.text;
  var command = req.body.command;
  var token = req.body.token;

  if(token !== CONFIG.SLACK.TOKEN) res.send(401, 'Your team is not allowed to make requests to this server.');

  if(command === '/changelog') {
    if(!text) {
      // generate a changelog of the last week
      var today = new Date();
      var lastWeek = new Date(new Date().setDate(today.getDate() - 7));
      _getChangelog(req, res, lastWeek, today);
    } else {
      var subcommand = text.split(' ')[0];
      switch(subcommand) {
        case 'add':
          _addChangelog(req, res);
          break;
        case 'rm':
          _rmChangelog(req, res);
          break;
        default:
          _respondWithText(req, res, ':smirk_cat:: "Sorry human, I cannot let you do that!"');
      }
    }
  } else {
    res.send(400, 'This server only handles requests of command /changelog');
  }
};