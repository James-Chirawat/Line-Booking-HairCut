/**
 * Command Handlers — Business Logic
 * startBooking, showMyBooking, showHelp
 */
const { reply } = require('../helpers/reply');
const { getActiveBooking } = require('../db/bookings');
const { buildDateFlex, buildMyBookingFlex } = require('../flex/booking');
const { buildMainMenu } = require('../flex/welcome');
const { buildHelpFlex } = require('../flex/help');

async function startBooking(replyToken, _userId) {
  return reply(replyToken, buildDateFlex());
}

async function showMyBooking(replyToken, userId) {
  const booking = await getActiveBooking(userId);
  if (!booking) {
    return reply(replyToken, [
      { type: 'text', text: '📭 ยังไม่มีคิวครับ' },
      buildMainMenu(),
    ]);
  }
  return reply(replyToken, buildMyBookingFlex(booking.booking_date, booking.booking_time));
}

async function showHelp(replyToken, _userId) {
  return reply(replyToken, buildHelpFlex());
}

module.exports = { startBooking, showMyBooking, showHelp };
