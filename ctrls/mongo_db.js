'use strict';


var MongoClient = require('mongodb').MongoClient;
var Q = require('q');


try {
  var CONFIG = require('../config.json');
} catch(e) {
  console.error('config.json is not available.');
}


exports.qOpenConnection = function() {
  var auth = CONFIG.MONGODB.USERNAME && CONFIG.MONGODB.PASSWORD
    ? CONFIG.MONGODB.USERNAME + ':' + CONFIG.MONGODB.PASSWORD + '@'
    : '';
  return Q.nfbind(MongoClient.connect)('mongodb://' + auth + CONFIG.MONGODB.URL);
};
