var should = require('should');
var rp = require('request-promise');
var utils = require('../ctrls/utils');

var API_SERVER = 'http://localhost:3000/'
var API_BODY_BOILERPLATE = {
  token: 'gIkuvaNzQIHg97ATvDxqgjtO',
  team_id: 'T0001',
  team_domain: 'example',
  channel_id: 'C2147483705',
  channel_name: 'test',
  user_id: 'U2147483697',
  user_name: 'Tim',
  command: '/changelog',
  text: 94070,
  response_url: 'https://hooks.slack.com/commands/1234/5678'
}

var _alterBody = function(changeSet) {
  var bodyCopy = utils.simpleCopy(API_BODY_BOILERPLATE);

  return Object
          .keys(changeSet)
          .reduce(function(defaultBody, changeKey) {
            defaultBody[changeKey] = changeSet[changeKey];
            return defaultBody
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
      res.text.should.containEql('Command not available!');
      done();
    }, function(err) {
      throw err;
    });
  });

  it('should add an item to the changelog', function (done) {
    var body = _alterBody({
      text: 'add #ikonotv Implemented link in loan history when loaning under a contract'
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
      res.text.should.containEql('Change added to changelog!');
      done();
    }, function(err) {
      throw err;
    });
  });

  it('should return a changelog about the last 7 days', function(done) {
    var body = _alterBody({
      text: ''
    });

    rp({
      method: 'POST',
      uri: API_SERVER,
      body: body,
      json: true
    })
    .then(function(res) {
      console.log(res);
      done();
    })
    .catch(function(err) {
      throw err;
    });
  });
});