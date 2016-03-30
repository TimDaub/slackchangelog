'use strict';

var Q = require('q');

var utils = require('../utils/utils');


exports.qTransformChangelogList= function(items) {
  return Q.Promise(function(resolve, reject) {
    var date;
    var texts = items.reduce(function(text, change) {
      var dateChanged = !date || date.getUTCDate() !== change.date_created.getUTCDate();
      text += dateChanged ? '\r\n\t\t' + utils.formatDate(change.date_created) + ':\r\n' : '';
      date = dateChanged ? change.date_created : date;
      text += '\t\t\t\t #' + change.hash.slice(-6) + ' @' + change.user_name + ': ' + change.text + '\r\n';
      return text;
    }, '');
    resolve(texts || ':crying_cat_face:: "Couldn\'t find a changelog."');
  });
};

exports.qTransformCreateAction = function(createOps) {
  return Q.Promise(function(resolve, reject) {
    var userName = createOps.user_name;
    var dateCreated = createOps.date_created;
    var text = createOps.text;

    var savedChangeText = '@' + userName + ' at ' + utils.formatDate(dateCreated) + ': ' + text;
    resolve('Hello Humans, @' + userName + ' has added the following to the changelog:\r\n\t\t' + savedChangeText + '\r\n _(Type /changelog to see all changes)_');
  });
};
