'use strict';

var DAYS = ['Su', 'Mo', 'Tue', 'Wed', 'Thu', 'Fr', 'Sa'];

exports.simpleCopy = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

exports.formatDate = function(date) {
  return date.getUTCFullYear() + '-' + date.getUTCMonth() + '-' + date.getUTCDate() + ', ' + DAYS[date.getDay()];
};
