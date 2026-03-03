require('dotenv').config();
const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');
const { createClient } = require('@supabase/supabase-js');

const app = express();

const lineConfig = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

const line = new Client(lineConfig);
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('\nMissing Supabase credentials.\nPlease add SUPABASE_URL and SUPABASE_KEY to your environment or .env file.\nExample .env:\nSUPABASE_URL=https://xyzcompany.supabase.co\nSUPABASE_KEY=eyJhbGci...\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// In-memory state สำหรับ multi-step flow
// Production ควรเอาลง Redis หรือ Supabase แต่สำหรับ demo ใช้นี้ก่อน
const userState = new Map();

app.post('/webhook', middleware(lineConfig), async (req, res) => {
  try {
    await Promise.all(req.body.events.map(handleEvent));
    res.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// Event Router
// ─────────────────────────────────────────
async function handleEvent(event) {
  const userId = event.source.userId;

  if (event.type === 'follow') {
    return line.replyMessage(event.replyToken, buildWelcome());
  }

  if (event.type === 'message' && event.message.type === 'text') {
    const text = event.message.text.trim();
    const cmds = { จอง: startBooking, จองคิว: startBooking, ดูคิวฉัน: showMyBooking };
    const fn = cmds[text];
    if (fn) return fn(event.replyToken, userId);
    return line.replyMessage(event.replyToken, buildMainMenu());
  }

  if (event.type === 'postback') {
    const params = Object.fromEntries(new URLSearchParams(event.postback.data));
    return handlePostback(event.replyToken, userId, params);
  }
}

async function handlePostback(replyToken, userId, params) {
  const { action } = params;

  if (action === 'book_start') return startBooking(replyToken, userId);

  if (action === 'select_date') {
    userState.set(userId, { date: params.date });
    return line.replyMessage(replyToken, buildTimeFlex(params.date));
  }

  if (action === 'select_time') {
    const state = userState.get(userId) || {};
    if (!state.date) {
      return line.replyMessage(replyToken, { type: 'text', text: '⚠️ Session หมดอายุ กรุณาจองใหม่' });
    }
    await saveBooking(userId, state.date, params.time);
    userState.delete(userId);
    return line.replyMessage(replyToken, buildConfirmFlex(state.date, params.time));
  }

  if (action === 'cancel') {
    const cancelled = await cancelBooking(userId);
    return line.replyMessage(replyToken, {
      type: 'text',
      text: cancelled ? '❌ ยกเลิกคิวเรียบร้อย' : '⚠️ ไม่พบคิวที่จะยกเลิก',
    });
  }

  if (action === 'view_booking') return showMyBooking(replyToken, userId);
}

// ─────────────────────────────────────────
// Business Logic
// ─────────────────────────────────────────
async function startBooking(replyToken, userId) {
  // เช็คว่ามีคิวอยู่แล้วมั้ย
  const existing = await getActiveBooking(userId);
  if (existing) {
    return line.replyMessage(replyToken, [
      { type: 'text', text: '⚠️ คุณมีคิวอยู่แล้ว! ยกเลิกก่อนถึงจะจองใหม่ได้นะครับ' },
      buildConfirmFlex(existing.booking_date, existing.booking_time),
    ]);
  }
  return line.replyMessage(replyToken, buildDateFlex());
}

async function showMyBooking(replyToken, userId) {
  const booking = await getActiveBooking(userId);
  if (!booking) {
    return line.replyMessage(replyToken, {
      type: 'text',
      text: '📭 ยังไม่มีคิว\nพิมพ์ "จอง" เพื่อจองคิวได้เลยครับ',
    });
  }
  return line.replyMessage(replyToken, buildConfirmFlex(booking.booking_date, booking.booking_time));
}

// ─────────────────────────────────────────
// Supabase DB Layer
// ─────────────────────────────────────────
async function getActiveBooking(userId) {
  const { data } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .gte('booking_date', new Date().toISOString().split('T')[0])
    .order('booking_date', { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
}

async function saveBooking(userId, date, time) {
  const { error } = await supabase.from('bookings').insert({
    user_id: userId,
    booking_date: date,
    booking_time: time,
    status: 'confirmed',
  });
  if (error) throw error;
}

async function cancelBooking(userId) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .select();
  if (error) throw error;
  return data?.length > 0;
}

// ─────────────────────────────────────────
// Flex Message Builders
// ─────────────────────────────────────────
function buildWelcome() {
  return {
    type: 'flex',
    altText: 'ยินดีต้อนรับ!',
    contents: {
      type: 'bubble',
      size: 'mega',
      hero: {
        type: 'box', layout: 'vertical',
        backgroundColor: '#1a1a2e', paddingAll: '32px',
        contents: [
          { type: 'text', text: '✂️', size: '5xl', align: 'center' },
          { type: 'text', text: 'ยินดีต้อนรับ!', color: '#ffffff', size: 'xxl', weight: 'bold', align: 'center' },
          { type: 'text', text: 'ร้านตัดผม The Cut', color: '#89cff0', size: 'sm', align: 'center', margin: 'sm' },
        ],
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'md',
        contents: [
          { type: 'text', text: 'สิ่งที่ทำได้ผ่าน Bot นี้', weight: 'bold' },
          ...['💈 จองคิวตัดผมออนไลน์', '📋 ดูคิวที่จองไว้', '❌ ยกเลิกคิว'].map(t => ({
            type: 'text', text: t, color: '#555555', size: 'sm',
          })),
        ],
      },
      footer: {
        type: 'box', layout: 'vertical',
        contents: [{
          type: 'button',
          action: { type: 'postback', label: '✂️ จองคิวเลย!', data: 'action=book_start' },
          style: 'primary', color: '#e94560',
        }],
      },
    },
  };
}

function buildMainMenu() {
  return {
    type: 'text',
    text: '✂️ สวัสดีครับ! เลือกเมนูด้านล่างได้เลย',
    quickReply: {
      items: [
        {
          type: 'action',
          action: { type: 'postback', label: '📅 จองคิว', data: 'action=book_start' },
        },
        {
          type: 'action',
          action: { type: 'postback', label: '🗂 ดูคิวฉัน', data: 'action=view_booking' },
        },
        {
          type: 'action',
          action: { type: 'message', label: '❓ วิธีใช้', text: 'วิธีใช้' },
        },
      ],
    },
  };
}

function buildDateFlex() {
  const today = new Date();
  // สร้าง 7 วันข้างหน้า ข้ามวันนี้
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    // ข้ามวันอาทิตย์ (getDay() === 0)
    return d.getDay() === 0 ? null : {
      label: d.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' }),
      value: d.toISOString().split('T')[0],
    };
  }).filter(Boolean);

  return {
    type: 'flex',
    altText: 'เลือกวันที่ต้องการจอง',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box', layout: 'vertical', backgroundColor: '#1a1a2e',
        contents: [
          { type: 'text', text: '✂️ จองคิวตัดผม', color: '#fff', size: 'xl', weight: 'bold' },
          { type: 'text', text: 'Step 1/2 — เลือกวันที่', color: '#89cff0', size: 'xs' },
        ],
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'sm',
        contents: dates.map(d => ({
          type: 'button',
          action: { type: 'postback', label: d.label, data: `action=select_date&date=${d.value}` },
          style: 'secondary', height: 'sm',
        })),
      },
    },
  };
}

function buildTimeFlex(date) {
  const slots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  // แบ่ง slot เป็น row ละ 4
  const rows = [];
  for (let i = 0; i < slots.length; i += 4) {
    rows.push(slots.slice(i, i + 4));
  }

  return {
    type: 'flex',
    altText: 'เลือกเวลา',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box', layout: 'vertical', backgroundColor: '#0f3460',
        contents: [
          { type: 'text', text: '⏰ เลือกเวลา', color: '#fff', size: 'xl', weight: 'bold' },
          { type: 'text', text: displayDate, color: '#89cff0', size: 'xs' },
          { type: 'text', text: 'Step 2/2', color: '#89cff055', size: 'xs' },
        ],
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'sm',
        contents: rows.map(row => ({
          type: 'box', layout: 'horizontal', spacing: 'sm',
          contents: row.map(t => ({
            type: 'button', flex: 1,
            action: { type: 'postback', label: t, data: `action=select_time&time=${t}` },
            style: 'primary', color: '#e94560', height: 'sm',
          })),
        })),
      },
    },
  };
}

function buildConfirmFlex(date, time) {
  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return {
    type: 'flex',
    altText: '✅ จองคิวสำเร็จ',
    contents: {
      type: 'bubble',
      size: 'mega',
      hero: {
        type: 'box', layout: 'vertical', backgroundColor: '#0d7377', paddingAll: '24px',
        contents: [
          { type: 'text', text: '✅', size: '5xl', align: 'center' },
          { type: 'text', text: 'จองคิวสำเร็จ!', color: '#fff', size: 'xxl', weight: 'bold', align: 'center' },
        ],
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'md',
        contents: [
          { type: 'text', text: '📋 รายละเอียดการจอง', weight: 'bold', size: 'lg' },
          {
            type: 'box', layout: 'horizontal',
            contents: [
              { type: 'text', text: '📅 วันที่', color: '#888', flex: 2, size: 'sm' },
              { type: 'text', text: displayDate, flex: 5, wrap: true, size: 'sm' },
            ],
          },
          {
            type: 'box', layout: 'horizontal',
            contents: [
              { type: 'text', text: '⏰ เวลา', color: '#888', flex: 2, size: 'sm' },
              { type: 'text', text: `${time} น.`, flex: 5, weight: 'bold', color: '#0d7377' },
            ],
          },
          { type: 'separator' },
          { type: 'text', text: '📍 ร้าน The Cut — กรุณามาก่อน 5 นาที', size: 'xs', color: '#888', wrap: true },
        ],
      },
      footer: {
        type: 'box', layout: 'vertical',
        contents: [{
          type: 'button',
          action: { type: 'postback', label: '❌ ยกเลิกคิวนี้', data: 'action=cancel' },
          style: 'secondary', color: '#ff6b6b',
        }],
      },
    },
  };
}

// ─────────────────────────────────────────
// Start
// ─────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✂️  Bot running on :${PORT}`));