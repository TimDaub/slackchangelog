var rp = require('request-promise');

try {
  var CONFIG = require('../config.json');
} catch(e) {
  console.log('config.json is not available, therefore I will use an environment variable.');
}

exports.postToChannel = function(channel, emoji, botName, message) {
  var body = {
    channel: channel,
    icon_emoji: emoji,
    username: botName,
    text: message,
  };

  return rp({
      method: 'POST',
      uri: CONFIG.SLACK.WEBHOOK_URL,
      body: body,
      json: true
    })
};