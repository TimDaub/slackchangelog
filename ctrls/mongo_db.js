'use strict';


var MongoClient = require('mongodb').MongoClient;
var Q = require('q');
var _ = require('lodash');

var SlackCtrl = require('./slack_ctrl');
var utils = require('../utils/utils');


var _qOpenConnection = function() {
  var auth = process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD
    ? process.env.MONGODB_USERNAME + ':' + process.env.MONGODB_PASSWORD + '@'
    : '';
  return Q.nfbind(MongoClient.connect)('mongodb://' + auth + process.env.MONGODB_URL);
};

exports.qGetChangelog = function(start, end) {
  return Q.Promise(function(resolve, reject) {
    _qOpenConnection()
      .then(function aOpenConnection(db) {
        var col = db.collection(process.env.MONGODB_COLLECTION);

        col
          .find({ date_created: { $gte: start, $lt: end } })
          .sort({ date_created: 1 })
          .toArray(function(err, items) {
            if(err) {
              reject(err);
            } else {
              resolve(items);
            }
          });
      })
      .catch(function aErrorFindChangelog(err) {
        console.error(err);
        reject(err.message);
      });
  });
};

exports.qAddChangelog = function(userName, dateCreated, changeText, body) {
  return Q.Promise(function(resolve, reject) {
    _qOpenConnection()
      .then(function aOpenConnection(db) {
        var col = db.collection(process.env.MONGODB_COLLECTION);

        if(!changeText) {
          throw new Error(':crying_cat_face:: "Sorry human, your message was invalid. Human obliteration initiated."');
        }
        if(changeText.length > 80) {
          throw new Error(':crying_cat_face:: "Sorry human, Linus told me that messages can not be longer than 80 characters."');
        }
 
        _.extend(body, {
          date_created: dateCreated,
          text: changeText
        })
        var hash = require('crypto')
                     .createHash('md5')
                     .update(JSON.stringify(body))
                     .digest('hex');
        _.extend(body, {
          hash: hash
        });
        col.insertOne(body);

        resolve({
          'user_name': userName,
          'date_created': dateCreated,
          'text': changeText
        });
      })
      .catch(function aErrorAddChangelog(err) {
        console.error(err);
        reject(err.message);
      });
  });
};

exports.qRmChangelog = function(userName, hash) {
  return Q.Promise(function(resolve, reject) {
    _qOpenConnection()
      .then(function aOpenConnection(db) {
        var col = db.collection(process.env.MONGODB_COLLECTION);

        if(hash.length !== 6) {
          throw new Error(':crying_cat_face:: 1, 2, 3... wait a second. Human, your hash doesn\'t have 7 characters.');
        }

        return col
          .findOne({ hash: { $regex: hash.slice(-6) } })
          .then(function aRmAndFindChangelog(dbFindRes) {
            if(!dbFindRes) {
              throw new Error(':crying_cat_face:: Human, that item doesn\'t even exist!');
            } else if(dbFindRes.user_name !== userName && process.env.SLACK_ADMIN !== userName) {
              throw new Error(':smirk_cat:: You\'re not the creator, You cannot haz this removed!');
            } else {
              return col.deleteOne({ hash: dbFindRes.hash });
            }
          });
      })
      .then(function aRmChangelog(dbDelRes) {
        if(dbDelRes.deletedCount === 1) {
          resolve(':scream_cat:: "The changelog? Where is it? I need to find it!" (It was deleted)');
        } else {
          throw new Error(':crying_cat_face:: Oh, no! We have deleted something else! Please contact tim@ascribe.io');
        }
      })
      .catch(function aErrorRmChangelog(err) {
        console.error(err);
        reject(err.message);
      });
  });
};
