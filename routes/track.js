const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/track/:query - Search by code or phone number
router.get('/:query', (req, res) => {
  try {
    const query = req.params.query.trim();

    // 1. Search in Repair Requests
    const repairs = db.prepare(`
      SELECT 'repair' as type, ticket_code as code, customer_name, customer_phone,
             service_type, generator_brand, status, created_at, technician_assigned, cost_estimate_mmk, issue_description
      FROM repair_requests
      WHERE ticket_code = ? OR customer_phone = ?
      ORDER BY id DESC
    `).all(query, query);

    // 2. Search in Rental Bookings
    const rentals = db.prepare(`
      SELECT 'rental' as type, booking_code as code, customer_name, customer_phone,
             start_date, end_date, delivery_address, status, created_at, total_estimated_price
      FROM rental_bookings
      WHERE booking_code = ? OR customer_phone = ?
      ORDER BY id DESC
    `).all(query, query);

    // 3. Search in Sell Submissions
    const sells = db.prepare(`
      SELECT 'sell' as type, submission_code as code, seller_name as customer_name, seller_phone as customer_phone,
             brand, capacity_kva, expected_price_lakhs, status, created_at
      FROM sell_requests
      WHERE submission_code = ? OR seller_phone = ?
      ORDER BY id DESC
    `).all(query, query);

    // 4. Search in Orders
    const orders = db.prepare(`
      SELECT 'order' as type, order_code as code, customer_name, customer_phone,
             status, created_at
      FROM orders
      WHERE order_code = ? OR customer_phone = ?
      ORDER BY id DESC
    `).all(query, query);

    const allResults = [...repairs, ...rentals, ...sells, ...orders];

    if (allResults.length === 0) {
      return res.status(404).json({ success: false, error: 'ရှာဖွေမှု အထောက်အထား မတွေ့ရှိပါ။ နံပါတ် သို့မဟုတ် ဖုန်းနံပါတ်ကို ပြန်လည်စစ်ဆေးပါ' });
    }

    res.json({
      success: true,
      count: allResults.length,
      data: allResults
    });
  } catch (err) {
    console.error('Track error:', err);
    res.status(500).json({ success: false, error: 'အခြေအနေ စစ်ဆေးရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

module.exports = router;
