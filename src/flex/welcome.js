/**
 * Flex Builders — Welcome & Main Menu
 */
const { THEME } = require('../config');

function buildWelcome() {
  return {
    type: 'flex',
    altText: 'ยินดีต้อนรับ! ✂️',
    contents: {
      type: 'bubble',
      size: 'mega',
      hero: {
        type: 'box', layout: 'vertical',
        backgroundColor: THEME.navy, paddingAll: '30px',
        contents: [
          { type: 'text', text: '✂️', size: '5xl', align: 'center' },
          { type: 'text', text: 'ยินดีต้อนรับ!', color: '#ffffff', size: 'xxl', weight: 'bold', align: 'center', margin: 'md' },
          { type: 'text', text: 'ร้านตัดผม The Cut', color: THEME.gold, size: 'md', align: 'center', margin: 'sm' },
        ],
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'md', paddingAll: '20px',
        contents: [
          { type: 'text', text: 'สิ่งที่ทำได้ผ่าน Bot นี้', weight: 'bold', color: '#333333' },
          { type: 'separator', margin: 'sm' },
          ...[
            { icon: '💈', label: 'จองคิวตัดผมออนไลน์' },
            { icon: '📋', label: 'ดูคิวที่จองไว้' },
            { icon: '❌', label: 'ยกเลิกคิว' },
          ].map(item => ({
            type: 'box', layout: 'horizontal', spacing: 'md', margin: 'sm',
            contents: [
              { type: 'text', text: item.icon, size: 'sm', flex: 0 },
              { type: 'text', text: item.label, color: '#555555', size: 'sm', flex: 1 },
            ],
          })),
        ],
      },
      footer: {
        type: 'box', layout: 'vertical', spacing: 'sm',
        contents: [
          {
            type: 'button',
            action: { type: 'postback', label: '✂️ จองคิวเลย!', data: 'action=book_start', displayText: 'จองคิว' },
            style: 'primary', color: THEME.red, height: 'sm',
          },
          {
            type: 'button',
            action: { type: 'postback', label: '📋 ดูคิวของฉัน', data: 'action=view_booking', displayText: 'ดูคิวฉัน' },
            style: 'secondary', height: 'sm',
          },
        ],
      },
    },
  };
}

function buildMainMenu() {
  return {
    type: 'text',
    text: '✂️ สวัสดีครับ เลือกเมนูด้านล่างได้เลย 👇',
    quickReply: {
      items: [
        {
          type: 'action',
          imageUrl: 'https://img.icons8.com/color/48/calendar--v1.png',
          action: { type: 'message', label: '💈 จองคิว', text: 'จองคิว' },
        },
        {
          type: 'action',
          imageUrl: 'https://img.icons8.com/color/48/clipboard-list.png',
          action: { type: 'message', label: '📋 ดูคิวฉัน', text: 'ดูคิวฉัน' },
        },
        {
          type: 'action',
          imageUrl: 'https://img.icons8.com/color/48/help--v1.png',
          action: { type: 'message', label: '❓ วิธีใช้', text: 'วิธีใช้' },
        },
      ],
    },
  };
}

module.exports = { buildWelcome, buildMainMenu };
