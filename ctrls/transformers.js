'use strict';

var Q = require('q');

var utils = require('../utils/utils');


exports.qTransformToReadableChangelog = function(items) {
  console.log(items)
  return Q.Promise(function(reject, resolve) {
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
