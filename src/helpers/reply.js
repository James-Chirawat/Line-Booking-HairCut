/**
 * Reply Helper
 * Wraps LINE MessagingApiClient.replyMessage with safe array handling
 */
const { lineClient } = require('../config');

async function reply(replyToken, messages) {
  const msgs = Array.isArray(messages) ? messages : [messages];
  return lineClient.replyMessage({ replyToken, messages: msgs });
}

module.exports = { reply };
