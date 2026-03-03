/**
 * Application Configuration
 * LINE Bot SDK + Supabase client initialization
 */
require('dotenv').config();
const { messagingApi, middleware } = require('@line/bot-sdk');
const { createClient } = require('@supabase/supabase-js');

// ── LINE Config ──────────────────────────
const LINE_CONFIG = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken: LINE_CONFIG.channelAccessToken,
});

// ── Supabase Config ──────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    '\n❌ Missing Supabase credentials.\n' +
    'Please add SUPABASE_URL and SUPABASE_KEY to your .env file.\n'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── App Constants ────────────────────────
const PORT = process.env.PORT || 3000;

const TIME_SLOTS = [
  '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
];

const THEME = {
  navy:    '#16213e',
  blue:    '#0f3460',
  teal:    '#0d7377',
  red:     '#e94560',
  gold:    '#e2b714',
  skyBlue: '#89cff0',
  mint:    '#b2dfdb',
};

module.exports = {
  LINE_CONFIG,
  lineClient,
  supabase,
  PORT,
  TIME_SLOTS,
  THEME,
  middleware,
};
