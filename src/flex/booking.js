/**
 * Flex Builders — Booking Flow (Date, Time, Confirm)
 */
const { TIME_SLOTS, THEME } = require('../config');

function buildDateFlex() {
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    if (d.getDay() === 0) return null; // ข้ามวันอาทิตย์
    return {
      label: d.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' }),
      value: d.toISOString().split('T')[0],
    };
  }).filter(Boolean);

  return {
    type: 'flex',
    altText: '📅 เลือกวันที่ต้องการจอง',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box', layout: 'vertical', backgroundColor: THEME.navy, paddingAll: '20px',
        contents: [
          { type: 'text', text: '✂️ จองคิวตัดผม', color: '#ffffff', size: 'xl', weight: 'bold', align: 'center' },
          { type: 'text', text: 'Step 1/2 — เลือกวันที่', color: THEME.gold, size: 'sm', align: 'center', margin: 'sm' },
        ],
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'sm', paddingAll: '16px',
        contents: dates.map(d => ({
          type: 'button',
          action: {
            type: 'postback',
            label: `📅 ${d.label}`.substring(0, 20),
            data: `action=select_date&date=${d.value}`,
            displayText: d.label,
          },
          style: 'secondary', height: 'sm', margin: 'xs',
        })),
      },
    },
  };
}

function buildTimeFlex(date, bookedSlots = []) {
  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const bookedSet = new Set(bookedSlots);

  const slotContents = TIME_SLOTS.map(t => {
    if (bookedSet.has(t)) {
      return {
        type: 'box', layout: 'horizontal', spacing: 'md',
        backgroundColor: '#f0f0f0', cornerRadius: '8px', paddingAll: '12px', margin: 'sm',
        contents: [
          { type: 'text', text: `🕐 ${t}`, size: 'md', color: '#aaaaaa', flex: 1 },
          { type: 'text', text: '❌ เต็ม', size: 'sm', color: '#cc0000', align: 'end', gravity: 'center', flex: 0 },
        ],
      };
    }
    return {
      type: 'button',
      action: {
        type: 'postback',
        label: `🕐 ${t} — ว่าง ✅`,
        data: `action=select_time&time=${t}`,
        displayText: `เลือกเวลา ${t}`,
      },
      style: 'primary', color: THEME.teal, height: 'sm', margin: 'sm',
    };
  });

  const hasAvailable = TIME_SLOTS.some(t => !bookedSet.has(t));
  if (!hasAvailable) {
    slotContents.push({
      type: 'text', text: '⚠️ วันนี้เต็มทุกช่วงเวลาแล้วครับ',
      color: '#cc0000', size: 'sm', align: 'center', margin: 'lg', wrap: true,
    });
  }

  return {
    type: 'flex',
    altText: `⏰ เลือกเวลา — ${displayDate}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box', layout: 'vertical', backgroundColor: THEME.blue, paddingAll: '20px',
        contents: [
          { type: 'text', text: '⏰ เลือกเวลา', color: '#ffffff', size: 'xl', weight: 'bold', align: 'center' },
          { type: 'text', text: displayDate, color: THEME.gold, size: 'sm', align: 'center', margin: 'sm' },
          { type: 'text', text: 'Step 2/2 — เลือกช่วงเวลาที่ว่าง', color: THEME.skyBlue, size: 'xs', align: 'center', margin: 'xs' },
        ],
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'none', paddingAll: '16px',
        contents: slotContents,
      },
    },
  };
}

function buildConfirmFlex(date, time) {
  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=16.7479163,100.1893587';

  return {
    type: 'flex',
    altText: '✅ จองคิวสำเร็จ!',
    contents: {
      type: 'bubble',
      size: 'mega',
      hero: {
        type: 'box', layout: 'vertical', backgroundColor: THEME.teal, paddingAll: '28px',
        contents: [
          { type: 'text', text: '✅', size: '4xl', align: 'center' },
          { type: 'text', text: 'จองคิวสำเร็จ!', color: '#ffffff', size: 'xl', weight: 'bold', align: 'center', margin: 'md' },
          { type: 'text', text: 'ร้าน The Cut', color: THEME.mint, size: 'sm', align: 'center', margin: 'xs' },
        ],
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'md', paddingAll: '20px',
        contents: [
          { type: 'text', text: '📋 รายละเอียดการจอง', weight: 'bold', size: 'md', color: '#333333' },
          { type: 'separator', margin: 'sm' },
          {
            type: 'box', layout: 'horizontal', margin: 'md',
            contents: [
              { type: 'text', text: '📅 วันที่', color: '#888888', flex: 2, size: 'sm' },
              { type: 'text', text: displayDate, flex: 5, wrap: true, size: 'sm', weight: 'bold' },
            ],
          },
          {
            type: 'box', layout: 'horizontal', margin: 'sm',
            contents: [
              { type: 'text', text: '⏰ เวลา', color: '#888888', flex: 2, size: 'sm' },
              { type: 'text', text: `${time} น.`, flex: 5, weight: 'bold', color: THEME.teal, size: 'lg' },
            ],
          },
          { type: 'separator', margin: 'md' },
          // ── Location Section ──
          {
            type: 'box', layout: 'horizontal', margin: 'md', spacing: 'sm',
            contents: [
              { type: 'text', text: '📍', size: 'sm', flex: 0 },
              {
                type: 'box', layout: 'vertical', flex: 1,
                contents: [
                  { type: 'text', text: 'ร้าน The Cut (มหาวิทยาลัยนเรศวร)', size: 'sm', weight: 'bold', color: '#333333', wrap: true },
                  { type: 'text', text: 'กรุณามาก่อนเวลานัด 5 นาที', size: 'xs', color: '#888888', margin: 'xs' },
                ],
              },
            ],
          },
          {
            type: 'button',
            action: { type: 'uri', label: '🗺 นำทางไปร้าน', uri: MAPS_URL },
            style: 'primary', color: '#4285F4', height: 'sm', margin: 'sm',
          },
        ],
      },
      footer: {
        type: 'box', layout: 'vertical', spacing: 'sm',
        contents: [{
          type: 'button',
          action: { type: 'postback', label: '❌ ยกเลิกคิวนี้', data: 'action=cancel', displayText: 'ยกเลิกคิว' },
          style: 'secondary', height: 'sm',
        }],
      },
    },
  };
}

function buildMyBookingFlex(date, time) {
  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=16.7479163,100.1893587';

  return {
    type: 'flex',
    altText: '📋 คิวของคุณ',
    contents: {
      type: 'bubble',
      size: 'mega',
      hero: {
        type: 'box', layout: 'vertical', backgroundColor: THEME.navy, paddingAll: '28px',
        contents: [
          { type: 'text', text: '📋', size: '4xl', align: 'center' },
          { type: 'text', text: 'คิวของคุณ', color: '#ffffff', size: 'xl', weight: 'bold', align: 'center', margin: 'md' },
          { type: 'text', text: 'ร้าน The Cut', color: THEME.gold, size: 'sm', align: 'center', margin: 'xs' },
        ],
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'md', paddingAll: '20px',
        contents: [
          { type: 'text', text: '📋 รายละเอียดการจอง', weight: 'bold', size: 'md', color: '#333333' },
          { type: 'separator', margin: 'sm' },
          {
            type: 'box', layout: 'horizontal', margin: 'md',
            contents: [
              { type: 'text', text: '📅 วันที่', color: '#888888', flex: 2, size: 'sm' },
              { type: 'text', text: displayDate, flex: 5, wrap: true, size: 'sm', weight: 'bold' },
            ],
          },
          {
            type: 'box', layout: 'horizontal', margin: 'sm',
            contents: [
              { type: 'text', text: '⏰ เวลา', color: '#888888', flex: 2, size: 'sm' },
              { type: 'text', text: `${time} น.`, flex: 5, weight: 'bold', color: THEME.teal, size: 'lg' },
            ],
          },
          { type: 'separator', margin: 'md' },
          {
            type: 'box', layout: 'horizontal', margin: 'md', spacing: 'sm',
            contents: [
              { type: 'text', text: '📍', size: 'sm', flex: 0 },
              {
                type: 'box', layout: 'vertical', flex: 1,
                contents: [
                  { type: 'text', text: 'ร้าน The Cut (มหาวิทยาลัยนเรศวร)', size: 'sm', weight: 'bold', color: '#333333', wrap: true },
                  { type: 'text', text: 'กรุณามาก่อนเวลานัด 5 นาที', size: 'xs', color: '#888888', margin: 'xs' },
                ],
              },
            ],
          },
          {
            type: 'button',
            action: { type: 'uri', label: '🗺 นำทางไปร้าน', uri: MAPS_URL },
            style: 'primary', color: '#4285F4', height: 'sm', margin: 'sm',
          },
        ],
      },
      footer: {
        type: 'box', layout: 'vertical', spacing: 'sm',
        contents: [{
          type: 'button',
          action: { type: 'postback', label: '❌ ยกเลิกคิวนี้', data: 'action=cancel', displayText: 'ยกเลิกคิว' },
          style: 'secondary', height: 'sm',
        }],
      },
    },
  };
}

module.exports = { buildDateFlex, buildTimeFlex, buildConfirmFlex, buildMyBookingFlex };
