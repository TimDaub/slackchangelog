'use strict';

var Q = require('q');
var MongoDB = require('../ctrls/mongo_db');

var SlackCtrl = require('../ctrls/slack_ctrl');
var utils = require('../utils/utils');
var transformers = require('../ctrls/transformers');


var _respondWithText = function(req, res, text, type) {
  var userName = req.body.user_name;
  var input = '@' + userName + ': ' + req.body.command + ' ' + req.body.text + '\r\n';
  type = type || 'ephemeral';

  res.json(200, {
    response_type: type,
    text: input + text
  });
};

var _genericTextResponse = function(req, res) {
  return function(text) { _respondWithText(req, res, text); };
};

var _getChangelog = function(req, res, start, end) {
  MongoDB
    .qGetChangelog(start, end)
    .then(transformers.qTransformChangelogList)
    .then(_genericTextResponse(req, res))
    .catch(_genericTextResponse(req, res));
};

var _addChangelog = function(req, res) {
  var words = req.body.text.split(' ');
  var userName = req.body.user_name;

  var dateCreated = new Date(words[1]);
  var isDateValid = !isNaN(dateCreated.getTime());
  var changeText = words.slice(isDateValid ? 2 : 1, words.length).join(' ');

  MongoDB
    .qAddChangelog(userName, isDateValid ? dateCreated : new Date(), changeText, req.body)
    .then(transformers.qTransformCreateAction)
    .then(function(text) {
      return Q.Promise(function(reject, resolve) {
        SlackCtrl.postToChannel(
          process.env.SLACK_CHANNEL,
          process.env.SLACK_EMOJI,
          process.env.SLACK_BOT_NAME,
          text
        );
        resolve(':kissing_cat:: "Hello human, I have added your change to the list!"');
      });
    })
    .then(_genericTextResponse(req, res))
    .catch(_genericTextResponse(req, res));
};

var _rmChangelog = function(req, res) {
  var hash = req.body.text.split(' ')[1];
  var userName = req.body.user_name;

  if(process.env.SLACK_RESTRICT_RM_TO_ADMIN  === 'true' && process.env.SLACK_ADMIN !== userName) {
    throw new Error(':smirk_cat:: Human, my master told me to only allow him to delete posts.');
  }

  MongoDB
    .qRmChangelog(userName, hash)
    .then(_genericTextResponse(req, res))
    .catch(_genericTextResponse(req, res));
};

exports.routeCommands = function(req, res) {
  var text = req.body.text;
  var command = req.body.command;
  var token = req.body.token;

  if(token !== process.env.SLACK_TOKEN) {
    res.send(401, 'Your team is not allowed to make requests to this server.');
  }

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
          _respondWithText(req, res, ':smirk_cat:: "Sorry human, I cannot let you do that (the command doesn\'t exist)!"');
      }
    }
  } else {
    res.send(400, 'This server only handles requests of command /changelog');
  }
};
