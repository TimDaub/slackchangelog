var MongoClient = require('mongodb').MongoClient
var Q = require('q');

try {
  var CONFIG = require('../config.json');
} catch(e) {
  console.error('config.json is not available.');
}


exports.qOpenConnection = function() {
  return Q.nfbind(MongoClient.connect)('mongodb://' + CONFIG.MONGODB.USERNAME + ':' + CONFIG.MONGODB.PASSWORD +'@' +CONFIG.MONGODB.URL);
}