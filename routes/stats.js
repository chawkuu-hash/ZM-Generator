const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

// GET /api/stats/dashboard - Summary for Admin
router.get('/dashboard', authMiddleware, (req, res) => {
  try {
    const totalGenerators = db.prepare('SELECT COUNT(*) as count FROM generators').get().count;
    const availableGenerators = db.prepare("SELECT COUNT(*) as count FROM generators WHERE status = 'available'").get().count;
    const soldGenerators = db.prepare("SELECT COUNT(*) as count FROM generators WHERE status = 'sold'").get().count;

    const totalRentalBookings = db.prepare('SELECT COUNT(*) as count FROM rental_bookings').get().count;
    const pendingRentalBookings = db.prepare("SELECT COUNT(*) as count FROM rental_bookings WHERE status = 'pending'").get().count;

    const totalRepairs = db.prepare('SELECT COUNT(*) as count FROM repair_requests').get().count;
    const pendingRepairs = db.prepare("SELECT COUNT(*) as count FROM repair_requests WHERE status = 'pending' OR status = 'in_progress'").get().count;

    const totalSellRequests = db.prepare('SELECT COUNT(*) as count FROM sell_requests').get().count;
    const pendingSellRequests = db.prepare("SELECT COUNT(*) as count FROM sell_requests WHERE status = 'pending' OR status = 'reviewing'").get().count;

    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'new_inquiry'").get().count;

    // Recent items
    const recentRepairs = db.prepare('SELECT * FROM repair_requests ORDER BY id DESC LIMIT 5').all();
    const recentRentals = db.prepare('SELECT * FROM rental_bookings ORDER BY id DESC LIMIT 5').all();
    const recentOrders = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 5').all();
    const recentSells = db.prepare('SELECT * FROM sell_requests ORDER BY id DESC LIMIT 5').all();

    res.json({
      success: true,
      metrics: {
        generators: {
          total: totalGenerators,
          available: availableGenerators,
          sold: soldGenerators
        },
        rentals: {
          total: totalRentalBookings,
          pending: pendingRentalBookings
        },
        repairs: {
          total: totalRepairs,
          pending: pendingRepairs
        },
        sells: {
          total: totalSellRequests,
          pending: pendingSellRequests
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders
        }
      },
      recent: {
        repairs: recentRepairs,
        rentals: recentRentals,
        orders: recentOrders,
        sells: recentSells
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, error: 'Dashboard metrics ရယူရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

module.exports = router;
