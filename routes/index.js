var MongoDB = require('../ctrls/mongo_db');

try {
  var CONFIG = require('../config.json');
} catch(e) {
  console.log('config.json is not available, therefore I will use an environment variable.');
}

exports.getChangelog = function(req, res){
  MongoDB.qOpenConnection()
    .then(function(db) {
      console.log(db);
    })
    .catch(function(err) {
      console.log(err);
    });
  res.send(200, 'OK');
};