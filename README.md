# ✂️ Line Booking HairCut

ระบบจองคิวตัดผมผ่าน LINE Bot — จอง, ดูคิว, ยกเลิก ได้จบใน Chat เดียว

## Tech Stack

- **Node.js + Express** — Webhook Server
- **LINE Messaging API** — Flex Message + Quick Reply
- **Supabase** — PostgreSQL Database

## โครงสร้างไฟล์

```
src/
├── config.js          # ENV, LINE/Supabase clients, ค่าคงที่
├── db/bookings.js     # Supabase queries
├── handlers/
│   ├── event.js       # Webhook event router
│   └── commands.js    # Business logic
├── flex/
│   ├── welcome.js     # Welcome & Quick Reply menu
│   ├── booking.js     # Date, Time, Confirm UI
│   └── help.js        # Help page
└── helpers/reply.js   # LINE reply wrapper
```

## ติดตั้ง & รัน

```bash
# 1. Clone
git clone https://github.com/James-Chirawat/Line-Booking-HairCut.git
cd Line-Booking-HairCut

# 2. ติดตั้ง dependencies
npm install

# 3. สร้างไฟล์ .env
cp .env.example .env
# แก้ค่า LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN,
# SUPABASE_URL, SUPABASE_KEY

# 4. สร้างตาราง bookings ใน Supabase
# → คัดลอก SQL จาก supabase.db ไปรันใน SQL Editor

# 5. รัน
node index.js
```

## ตั้งค่า Webhook

1. เปิด [LINE Developers Console](https://developers.line.biz/console/)
2. ตั้ง Webhook URL → `https://your-domain.com/webhook`
3. เปิด **Use webhook** ✅

> ทดสอบ local ใช้ `ngrok http 3000` แล้วเอา URL ไปตั้งเป็น Webhook

## ฟีเจอร์

| ฟีเจอร์ | คำสั่ง / การทำงาน |
|---------|-------------------|
| 💈 จองคิว | พิมพ์ `จอง` หรือ `จองคิว` → เลือกวัน → เลือกเวลา |
| 📋 ดูคิว | พิมพ์ `ดูคิวฉัน` |
| ❌ ยกเลิก | กดปุ่ม "ยกเลิกคิวนี้" ในหน้ารายละเอียด |
| ❓ วิธีใช้ | พิมพ์ `วิธีใช้` |
| 🛡️ ป้องกัน Double Booking | UI + App + DB Level |

## Environment Variables

| ตัวแปร | คำอธิบาย |
|--------|----------|
| `LINE_CHANNEL_SECRET` | Channel Secret จาก LINE Console |
| `LINE_CHANNEL_ACCESS_TOKEN` | Channel Access Token |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_KEY` | Supabase Anon/Public Key |
