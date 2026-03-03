/**
 * Flex Builder — Help Page
 */
const { THEME } = require('../config');

function buildHelpFlex() {
  const items = [
    { icon: '1️⃣', title: 'จองคิวตัดผม', desc: 'พิมพ์ "จอง" หรือ "จองคิว" แล้วเลือกวันเวลาที่ต้องการ' },
    { icon: '2️⃣', title: 'ดูคิวที่จองไว้', desc: 'พิมพ์ "ดูคิวฉัน" หรือกดปุ่ม 📋' },
    { icon: '3️⃣', title: 'ยกเลิกคิว', desc: 'กดปุ่ม ❌ ยกเลิกคิวนี้ ในหน้ารายละเอียด' },
  ];

  return {
    type: 'flex',
    altText: '📖 วิธีใช้งาน Bot',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box', layout: 'vertical', backgroundColor: THEME.navy, paddingAll: '20px',
        contents: [
          { type: 'text', text: '📖 วิธีใช้งาน', color: '#ffffff', size: 'xl', weight: 'bold', align: 'center' },
          { type: 'text', text: 'ร้านตัดผม The Cut', color: THEME.gold, size: 'sm', align: 'center', margin: 'sm' },
        ],
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'lg', paddingAll: '20px',
        contents: items.flatMap((item, i) => {
          const row = [{
            type: 'box', layout: 'horizontal', spacing: 'md',
            contents: [
              { type: 'text', text: item.icon, size: 'lg', flex: 0, gravity: 'center' },
              {
                type: 'box', layout: 'vertical', flex: 1,
                contents: [
                  { type: 'text', text: item.title, weight: 'bold', size: 'md', color: '#333333' },
                  { type: 'text', text: item.desc, size: 'sm', color: '#888888', wrap: true, margin: 'xs' },
                ],
              },
            ],
          }];
          if (i < items.length - 1) row.push({ type: 'separator', margin: 'md' });
          return row;
        }),
      },
      footer: {
        type: 'box', layout: 'vertical', spacing: 'sm',
        contents: [{
          type: 'button',
          action: { type: 'postback', label: '✂️ จองคิวเลย!', data: 'action=book_start', displayText: 'จองคิว' },
          style: 'primary', color: THEME.red, height: 'sm',
        }],
      },
    },
  };
}

module.exports = { buildHelpFlex };
