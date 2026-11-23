const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

// POST /api/orders - Submit purchase inquiry or order
router.post('/', (req, res) => {
  try {
    const { generator_id, customer_name, customer_phone, customer_email, delivery_address, message } = req.body;

    if (!generator_id || !customer_name || !customer_phone) {
      return res.status(400).json({ success: false, error: 'မီးစက်ရွေးချယ်မှု၊ အမည် နှင့် ဖုန်းနံပါတ် ဖြည့်စွက်ပေးပါ' });
    }

    const orderCode = 'ORD-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 899 + 100);

    const stmt = db.prepare(`
      INSERT INTO orders (order_code, generator_id, customer_name, customer_phone, customer_email, delivery_address, message, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'new_inquiry')
    `);

    stmt.run(
      orderCode,
      Number(generator_id),
      customer_name,
      customer_phone,
      customer_email || '',
      delivery_address || '',
      message || ''
    );

    res.json({
      success: true,
      message: 'မီးစက်ဝယ်ယူရန် တောင်းဆိုချက်ကို အောင်မြင်စွာ လက်ခံရရှိပါပြီ။ အရောင်းဌာနမှ မကြာမီ ဆက်သွယ်ပေးပါမည်။',
      order_code: orderCode
    });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ success: false, error: 'ဝယ်ယူမှုတင်ပြရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

// GET /api/orders - Admin view orders
router.get('/', authMiddleware, (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.*, g.title as generator_title, g.brand, g.capacity_kva, g.price_lakhs
      FROM orders o
      LEFT JOIN generators g ON o.generator_id = g.id
      ORDER BY o.id DESC
    `).all();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: 'အမှာစာများ ရယူရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', authMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true, message: 'အမှာစာ အခြေအနေ ပြင်ဆင်ပြီးပါပြီ' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'အမှာစာ ပြင်ဆင်ရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

module.exports = router;
