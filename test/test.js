'use strict';

require('dotenv').config()

var rp = require('request-promise');
var utils = require('../ctrls/utils');
var util = require('util');

var mongodb = require('../ctrls/mongo_db');


var API_SERVER = 'http://localhost:3000/';
var CHANGE_TEXT = 'Implemented tests for slackchangelog';
var TODAY = new Date();
var YESTERDAY = new Date(new Date().setDate(TODAY.getDate() - 1));
var API_BODY_BOILERPLATE = {
  token: process.env.SLACK_TOKEN,
  team_id: 'T0001',
  team_domain: 'example',
  channel_id: 'C2147483705',
  channel_name: 'test',
  user_id: 'U2147483697',
  user_name: 'tim',
  command: '/changelog',
  text: 'This is some text',
  response_url: 'https://hooks.slack.com/commands/1234/5678'
};


var _alterBody = function(changeSet) {
  var bodyCopy = utils.simpleCopy(API_BODY_BOILERPLATE);

  return Object
          .keys(changeSet)
          .reduce(function(defaultBody, changeKey) {
            defaultBody[changeKey] = changeSet[changeKey];
            return defaultBody;
          }, bodyCopy);
};

describe('API', function() {
  it('should respond nicely, when command is not available', function(done) {
    var body = _alterBody({
      text: 'timissocool'
    });

    rp({
      method: 'POST',
      uri: API_SERVER,
      body: body,
      json: true
    })
    .then(function(res) {
      res.should.have.property('response_type', 'ephemeral');
      res.should.have.property('text');
      res.text.should.containEql('Sorry human, I cannot let you do that');
      done();
    }, function(err) {
      throw err;
    });
  });

  it('should add an item to the changelog', function (done) {
    var body = _alterBody({
      text: 'add ' + CHANGE_TEXT
    });

    rp({
      method: 'POST',
      uri: API_SERVER,
      body: body,
      json: true
    })
    .then(function(res) {
      res.should.have.property('response_type', 'ephemeral');
      res.should.have.property('text');
      res.text.should.containEql('Hello human, I have added your change to the list!');
      done();
    }, function(err) {
      throw err;
    });
  });

  it('should add an item to yesterday\'s changelog', function(done) {
    var yesterdayAsDate = utils.formatDate(YESTERDAY).split(',')[0];
    var body = _alterBody({
      text: 'add ' + yesterdayAsDate + ' ' + CHANGE_TEXT
    });

    var today = new Date();
    var yesterday = new Date(new Date().setDate(today.getDate() - 1));
    mongodb
      .qGetChangelog(yesterday, today)
      .then(function(changelogBefore) {
        return rp({
          method: 'POST',
               uri: API_SERVER,
               body: body,
               json: true
        });
      })
      .then(function(res) {
        console.log(JSON.stringify(res.body));
        return mongodb.qGetChangelog(yesterday, today);
      })
      .then(function(changelogAfter){
        console.log(JSON.stringify(changelogAfter));
        done();
      })
      .catch(function(err) {
        throw err;
      });
  });

  it('should return a changelog about the last 7 days containing the two previously generated changes', function(done) {
    var body = _alterBody({
      text: ''
    });

    rp({
      method: 'POST',
      uri: API_SERVER,
      body: body,
      json: true
    })
    .then(function() {
      done();
    })
    .catch(function(err) {
      throw err;
    });
  });
});
