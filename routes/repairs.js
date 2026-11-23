const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /api/repairs - Public Service & Maintenance Ticket Submission
router.post('/', upload.array('photos', 4), (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_address,
      city,
      generator_brand,
      generator_capacity_kva,
      service_type,
      urgency_level,
      issue_description,
      preferred_date
    } = req.body;

    if (!customer_name || !customer_phone || !customer_address || !issue_description) {
      return res.status(400).json({ success: false, error: 'အမည်၊ ဖုန်းနံပါတ်၊ နေရာလိပ်စာ နှင့် ဖြစ်ပွားသည့် ပြဿနာအကြောင်းအရာ ဖြည့်စွက်ပေးပါ' });
    }

    const ticketCode = 'REP-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 899 + 100);

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => `/uploads/${f.filename}`);
    }

    const stmt = db.prepare(`
      INSERT INTO repair_requests (
        ticket_code, customer_name, customer_phone, customer_address, city,
        generator_brand, generator_capacity_kva, service_type, urgency_level,
        issue_description, images, preferred_date, status
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, 'pending'
      )
    `);

    stmt.run(
      ticketCode,
      customer_name,
      customer_phone,
      customer_address,
      city || 'Yangon',
      generator_brand || '',
      generator_capacity_kva ? Number(generator_capacity_kva) : null,
      service_type || 'General Inspection',
      urgency_level || 'Normal',
      issue_description,
      JSON.stringify(images),
      preferred_date || ''
    );

    res.json({
      success: true,
      message: 'မီးစက်ပြုပြင်ရေး တောင်းဆိုချက်ကို လက်ခံရရှိပါပြီ။ အင်ဂျင်နီယာအဖွဲ့မှ အမြန်ဆုံး ဆက်သွယ်ပါမည်။',
      ticket_code: ticketCode
    });
  } catch (err) {
    console.error('Repair request error:', err);
    res.status(500).json({ success: false, error: 'ပြုပြင်ရေးတောင်းဆိုချက် ပေးပို့ရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

// GET /api/repairs - Admin View Tickets
router.get('/', authMiddleware, (req, res) => {
  try {
    const { status, urgency } = req.query;
    let query = 'SELECT * FROM repair_requests WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (urgency && urgency !== 'all') {
      query += ' AND urgency_level = ?';
      params.push(urgency);
    }

    query += ' ORDER BY id DESC';
    const tickets = db.prepare(query).all(...params);

    const parsed = tickets.map(t => {
      let imgs = [];
      try {
        imgs = JSON.parse(t.images || '[]');
      } catch (e) {
        imgs = [];
      }
      return { ...t, images: imgs };
    });

    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: 'လက်မှတ်များ ရယူရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

// PATCH /api/repairs/:id - Admin Update Ticket (technician, cost, status, notes)
router.patch('/:id', authMiddleware, (req, res) => {
  try {
    const { status, technician_assigned, cost_estimate_mmk, admin_notes } = req.body;

    const current = db.prepare('SELECT * FROM repair_requests WHERE id = ?').get(req.params.id);
    if (!current) {
      return res.status(404).json({ success: false, error: 'ပြုပြင်ရေးလက်မှတ် ရှာမတွေ့ပါ' });
    }

    const stmt = db.prepare(`
      UPDATE repair_requests SET
        status = ?,
        technician_assigned = ?,
        cost_estimate_mmk = ?,
        admin_notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      status || current.status,
      technician_assigned !== undefined ? technician_assigned : current.technician_assigned,
      cost_estimate_mmk !== undefined ? Number(cost_estimate_mmk) : current.cost_estimate_mmk,
      admin_notes !== undefined ? admin_notes : current.admin_notes,
      req.params.id
    );

    res.json({ success: true, message: 'လက်မှတ် အခြေအနေကို ပြင်ဆင်ပြီးပါပြီ' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'ပြင်ဆင်ရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

module.exports = router;
