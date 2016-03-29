'use strict';

var rp = require('request-promise');


exports.postToChannel = function(channel, emoji, botName, message) {
  var body = {
    channel: channel,
    icon_emoji: emoji,
    username: botName,
    text: message
  };

  return rp({
      method: 'POST',
      uri: process.env.SLACK_WEBHOOK_URL,
      body: body,
      json: true
    });
};
