const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

// GET /api/settings - Public company details
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM settings').all();
    const settings = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Settings ရယူရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

// POST /api/settings - Admin update settings
router.post('/', authMiddleware, (req, res) => {
  try {
    const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string' || typeof value === 'number') {
        upsert.run(key, String(value));
      }
    }
    res.json({ success: true, message: 'Settings များကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

module.exports = router;
