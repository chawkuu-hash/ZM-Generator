const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /api/sell - Customer submits generator to sell
router.post('/', upload.array('photos', 5), (req, res) => {
  try {
    const {
      seller_name,
      seller_phone,
      location,
      brand,
      model,
      capacity_kva,
      fuel_type,
      running_hours,
      condition_description,
      expected_price_lakhs
    } = req.body;

    if (!seller_name || !seller_phone || !location || !brand || !capacity_kva) {
      return res.status(400).json({ success: false, error: 'အမည်၊ ဖုန်းနံပါတ်၊ တည်နေရာ၊ တံဆိပ် နှင့် kVA ပါဝါ ထည့်သွင်းပေးပါ' });
    }

    const code = 'SELL-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 899 + 100);

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => `/uploads/${f.filename}`);
    }

    const stmt = db.prepare(`
      INSERT INTO sell_requests (
        submission_code, seller_name, seller_phone, location, brand, model,
        capacity_kva, fuel_type, running_hours, condition_description,
        expected_price_lakhs, images, status
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, 'pending'
      )
    `);

    stmt.run(
      code,
      seller_name,
      seller_phone,
      location,
      brand,
      model || '',
      Number(capacity_kva),
      fuel_type || 'Diesel',
      running_hours ? Number(running_hours) : null,
      condition_description || '',
      expected_price_lakhs ? Number(expected_price_lakhs) : null,
      JSON.stringify(images)
    );

    res.json({
      success: true,
      message: 'မီးစက်ရောင်းချရန် တင်ပြချက်ကို လက်ခံရရှိပါပြီ။ ZM အဝယ်အဖွဲ့မှ ဈေးနှုန်းစစ်ဆေး၍ ဆက်သွယ်ပေးပါမည်။',
      submission_code: code
    });
  } catch (err) {
    console.error('Sell submission error:', err);
    res.status(500).json({ success: false, error: 'တင်ပြချက် ပေးပို့ရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

// GET /api/sell - Admin View Submissions
router.get('/', authMiddleware, (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM sell_requests ORDER BY id DESC').all();
    const parsed = list.map(item => {
      let imgs = [];
      try {
        imgs = JSON.parse(item.images || '[]');
      } catch (e) {
        imgs = [];
      }
      return { ...item, images: imgs };
    });
    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: 'အချက်အလက် ရယူရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

// PATCH /api/sell/:id - Admin Update Status / Notes
router.patch('/:id', authMiddleware, (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    db.prepare('UPDATE sell_requests SET status = ?, admin_notes = ? WHERE id = ?')
      .run(status, admin_notes || '', req.params.id);
    res.json({ success: true, message: 'အခြေအနေ ပြင်ဆင်ပြီးပါပြီ' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'ပြင်ဆင်ရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

module.exports = router;
