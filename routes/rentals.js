const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/rentals - List rental inventory
router.get('/', (req, res) => {
  try {
    const rentals = db.prepare('SELECT * FROM rental_items ORDER BY capacity_kva ASC').all();
    res.json({ success: true, data: rentals });
  } catch (err) {
    res.status(500).json({ success: false, error: 'အငှားမီးစက်များ ဖော်ပြရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

// POST /api/rentals/book - Customer Rental Booking Inquiry
router.post('/book', (req, res) => {
  try {
    const {
      rental_item_id,
      custom_capacity_kva,
      customer_name,
      customer_phone,
      customer_email,
      start_date,
      end_date,
      rental_purpose,
      delivery_address,
      city,
      operator_needed,
      fuel_supply_needed,
      notes
    } = req.body;

    if (!customer_name || !customer_phone || !start_date || !end_date || !delivery_address) {
      return res.status(400).json({ success: false, error: 'အမည်၊ ဖုန်းနံပါတ်၊ ငှားရမ်းမည့်ရက်စွဲ နှင့် ပို့ဆောင်ရမည့်လိပ်စာ ထည့်သွင်းပေးပါ' });
    }

    const bookingCode = 'RNT-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 899 + 100);

    // Calculate approximate days & estimate
    let totalEstimate = 0;
    if (rental_item_id) {
      const item = db.prepare('SELECT * FROM rental_items WHERE id = ?').get(rental_item_id);
      if (item && item.daily_rate_lakhs) {
        const d1 = new Date(start_date);
        const d2 = new Date(end_date);
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        if (diffDays >= 30 && item.monthly_rate_lakhs) {
          const months = diffDays / 30;
          totalEstimate = months * item.monthly_rate_lakhs;
        } else {
          totalEstimate = diffDays * item.daily_rate_lakhs;
        }
      }
    }

    const stmt = db.prepare(`
      INSERT INTO rental_bookings (
        booking_code, rental_item_id, custom_capacity_kva,
        customer_name, customer_phone, customer_email,
        start_date, end_date, rental_purpose,
        delivery_address, city, operator_needed, fuel_supply_needed,
        notes, status, total_estimated_price
      ) VALUES (
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, 'pending', ?
      )
    `);

    stmt.run(
      bookingCode,
      rental_item_id ? Number(rental_item_id) : null,
      custom_capacity_kva ? Number(custom_capacity_kva) : null,
      customer_name,
      customer_phone,
      customer_email || '',
      start_date,
      end_date,
      rental_purpose || 'General',
      delivery_address,
      city || 'Yangon',
      operator_needed ? 1 : 0,
      fuel_supply_needed ? 1 : 0,
      notes || '',
      totalEstimate
    );

    res.json({
      success: true,
      message: 'မီးစက်ငှားရမ်းမှု တောင်းဆိုချက်ကို အောင်မြင်စွာ လက်ခံရရှိပါပြီ။ မကြာမီ လူကြီးမင်းထံသို့ တာဝန်ခံမှ ဆက်သွယ်ပေးပါမည်။',
      booking_code: bookingCode
    });
  } catch (err) {
    console.error('Rental booking error:', err);
    res.status(500).json({ success: false, error: 'ဘိုကင်တင်ရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

// GET /api/rentals/bookings - Admin View Bookings
router.get('/bookings', authMiddleware, (req, res) => {
  try {
    const bookings = db.prepare(`
      SELECT b.*, r.title as rental_item_title, r.capacity_kva as item_capacity
      FROM rental_bookings b
      LEFT JOIN rental_items r ON b.rental_item_id = r.id
      ORDER BY b.id DESC
    `).all();
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: 'ဘိုကင်များ ရယူရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

// PATCH /api/rentals/bookings/:id/status - Admin status update
router.patch('/bookings/:id/status', authMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE rental_bookings SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true, message: 'ဘိုကင် status ကို ပြောင်းလဲပြီးပါပြီ' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Status ပြောင်းလဲရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

// Admin CRUD for rental items
router.post('/items', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const {
      title, capacity_kva, fuel_type, type,
      daily_rate_lakhs, monthly_rate_lakhs,
      includes_operator, includes_transport, min_rental_days, description
    } = req.body;

    const imgUrl = req.file ? `/uploads/${req.file.filename}` : '/images/rental-25kva.svg';

    const stmt = db.prepare(`
      INSERT INTO rental_items (
        title, capacity_kva, fuel_type, type,
        daily_rate_lakhs, monthly_rate_lakhs,
        includes_operator, includes_transport, min_rental_days, image, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      title,
      Number(capacity_kva),
      fuel_type || 'Diesel',
      type || 'Soundproof',
      daily_rate_lakhs ? Number(daily_rate_lakhs) : null,
      monthly_rate_lakhs ? Number(monthly_rate_lakhs) : null,
      includes_operator ? 1 : 0,
      includes_transport ? 1 : 0,
      min_rental_days ? Number(min_rental_days) : 1,
      imgUrl,
      description || ''
    );

    res.json({ success: true, message: 'အငှားမီးစက်အသစ် ထည့်သွင်းပြီးပါပြီ' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'ထည့်သွင်းရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

router.delete('/items/:id', authMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM rental_items WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'အငှားမီးစက်ကို ဖျက်ပစ်ပြီးပါပြီ' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'ဖျက်ပစ်ရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

module.exports = router;
