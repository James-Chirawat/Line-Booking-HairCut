/**
 * ✂️ Line Booking HairCut — Entry Point
 *
 * Structure:
 *   src/
 *   ├── config.js          — ENV, LINE/Supabase clients, constants
 *   ├── helpers/
 *   │   └── reply.js       — LINE reply helper
 *   ├── db/
 *   │   └── bookings.js    — Supabase queries
 *   ├── handlers/
 *   │   ├── event.js       — Webhook event router
 *   │   └── commands.js    — Business logic (book, view, help)
 *   └── flex/
 *       ├── welcome.js     — Welcome & main menu builders
 *       ├── booking.js     — Date, time, confirm builders
 *       └── help.js        — Help page builder
 */
const express = require('express');
const { LINE_CONFIG, PORT, middleware } = require('./src/config');
const { handleEvent } = require('./src/handlers/event');

const app = express();

// ── Webhook Endpoint ─────────────────────
app.post('/webhook', middleware(LINE_CONFIG), async (req, res) => {
  try {
    await Promise.all(req.body.events.map(handleEvent));
    res.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Health Check ─────────────────────────
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'barbershop-line-bot' });
});

// ── Start Server ─────────────────────────
app.listen(PORT, () => {
  console.log(`✂️  Bot running on :${PORT}`);
});