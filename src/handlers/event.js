/**
 * Event Router — LINE Webhook Event Handler
 * Routes follow, message, and postback events to the appropriate handlers
 */
const { reply } = require('../helpers/reply');
const { startBooking, showMyBooking, showHelp } = require('./commands');
const { getActiveBooking, getBookedSlots, isSlotBooked, saveBooking, cancelBooking } = require('../db/bookings');
const { buildWelcome, buildMainMenu } = require('../flex/welcome');
const { buildTimeFlex, buildConfirmFlex, buildMyBookingFlex } = require('../flex/booking');

// In-memory state สำหรับ multi-step flow
// Production ควรเอาลง Redis หรือ Supabase
const userState = new Map();

// ── Text Command Map ─────────────────────
const TEXT_COMMANDS = {
  จอง:      startBooking,
  จองคิว:   startBooking,
  ดูคิวฉัน: showMyBooking,
  วิธีใช้:   showHelp,
};

// ── Main Event Handler ───────────────────
async function handleEvent(event) {
  const userId = event.source.userId;

  if (event.type === 'follow') {
    return reply(event.replyToken, buildWelcome());
  }

  if (event.type === 'message' && event.message.type === 'text') {
    const text = event.message.text.trim();
    const fn = TEXT_COMMANDS[text];
    if (fn) return fn(event.replyToken, userId);
    return reply(event.replyToken, buildMainMenu());
  }

  if (event.type === 'postback') {
    const params = Object.fromEntries(new URLSearchParams(event.postback.data));
    return handlePostback(event.replyToken, userId, params);
  }
}

// ── Postback Handler ─────────────────────
async function handlePostback(replyToken, userId, params) {
  const { action } = params;

  if (action === 'book_start') {
    return startBooking(replyToken, userId);
  }

  if (action === 'select_date') {
    const date = params.date;
    userState.set(userId, { date });
    const bookedSlots = await getBookedSlots(date);
    return reply(replyToken, buildTimeFlex(date, bookedSlots));
  }

  if (action === 'select_time') {
    const state = userState.get(userId) || {};
    if (!state.date) {
      return reply(replyToken, {
        type: 'text',
        text: '⚠️ Session หมดอายุ กรุณากด "จองคิว" ใหม่อีกครั้งนะครับ',
      });
    }
    // เช็คว่า user มีคิวอยู่แล้วมั้ย (จองได้ครั้งละ 1 คิว)
    const existing = await getActiveBooking(userId);
    if (existing) {
      userState.delete(userId);
      return reply(replyToken, [
        { type: 'text', text: '⚠️ คุณมีคิวอยู่แล้วครับ ยกเลิกคิวเดิมก่อนถึงจะจองใหม่ได้นะ' },
        buildMyBookingFlex(existing.booking_date, existing.booking_time),
      ]);
    }
    // เช็คว่า slot นี้ว่างอยู่มั้ย (ป้องกัน race condition)
    const alreadyBooked = await isSlotBooked(state.date, params.time);
    if (alreadyBooked) {
      userState.delete(userId);
      return reply(replyToken, [
        { type: 'text', text: '⚠️ เวลานี้ถูกจองไปแล้วครับ กรุณาเลือกเวลาอื่น' },
        buildMainMenu(),
      ]);
    }
    await saveBooking(userId, state.date, params.time);
    userState.delete(userId);
    return reply(replyToken, buildConfirmFlex(state.date, params.time));
  }

  if (action === 'cancel') {
    const cancelled = await cancelBooking(userId);
    if (cancelled) {
      return reply(replyToken, [
        { type: 'text', text: '✅ ยกเลิกคิวเรียบร้อยแล้วครับ' },
        buildMainMenu(),
      ]);
    }
    return reply(replyToken, { type: 'text', text: '⚠️ ไม่พบคิวที่จะยกเลิก' });
  }

  if (action === 'view_booking') {
    return showMyBooking(replyToken, userId);
  }
}

module.exports = { handleEvent };
