'use strict';


var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


exports.simpleCopy = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

exports.formatDate = function(date) {
  return date.getUTCFullYear() + '-' + date.getUTCMonth() + '-' + date.getUTCDate() + ', ' + DAYS[date.getDay()];
};
