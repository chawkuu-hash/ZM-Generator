const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'zm_generator.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Connect to SQLite Database
const db = new DatabaseSync(dbPath);

// Enable WAL mode for better performance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Tables
function initDatabase() {
  // 1. Admin Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Generators for Sale Table (Secondhand & Refurbished)
  db.exec(`
    CREATE TABLE IF NOT EXISTS generators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT,
      capacity_kva REAL NOT NULL,
      power_kw REAL,
      fuel_type TEXT DEFAULT 'Diesel',
      type TEXT DEFAULT 'Soundproof', -- Soundproof, Open, Trailer
      phase TEXT DEFAULT '3-Phase', -- Single Phase, 3-Phase
      engine_model TEXT,
      alternator_brand TEXT,
      condition TEXT NOT NULL, -- Like New, 90% Condition, Good Running, Overhauled
      running_hours INTEGER DEFAULT 0,
      year_manufactured INTEGER,
      price_lakhs REAL NOT NULL, -- In Myanmar Lakhs (သိန်း)
      price_mmk INTEGER, -- Converted in MMK
      is_negotiable INTEGER DEFAULT 1,
      warranty_months INTEGER DEFAULT 6,
      location TEXT DEFAULT 'Yangon',
      images TEXT, -- JSON array of image URLs
      featured INTEGER DEFAULT 0,
      status TEXT DEFAULT 'available', -- available, reserved, sold
      description TEXT,
      specifications TEXT, -- JSON key-value
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Generator Rental Catalog Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS rental_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      capacity_kva REAL NOT NULL,
      fuel_type TEXT DEFAULT 'Diesel',
      type TEXT DEFAULT 'Soundproof',
      daily_rate_lakhs REAL,
      monthly_rate_lakhs REAL,
      includes_operator INTEGER DEFAULT 0,
      includes_transport INTEGER DEFAULT 0,
      min_rental_days INTEGER DEFAULT 1,
      image TEXT,
      description TEXT,
      is_available INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Rental Bookings / Inquiries Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS rental_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_code TEXT UNIQUE NOT NULL,
      rental_item_id INTEGER,
      custom_capacity_kva REAL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      rental_purpose TEXT, -- Event, Industrial, Construction, Hospital, Backup
      delivery_address TEXT NOT NULL,
      city TEXT DEFAULT 'Yangon',
      operator_needed INTEGER DEFAULT 0,
      fuel_supply_needed INTEGER DEFAULT 0,
      notes TEXT,
      status TEXT DEFAULT 'pending', -- pending, confirmed, ongoing, completed, cancelled
      total_estimated_price REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (rental_item_id) REFERENCES rental_items(id) ON DELETE SET NULL
    );
  `);

  // 5. Generator Repair & Maintenance Requests Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS repair_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_code TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      city TEXT DEFAULT 'Yangon',
      generator_brand TEXT,
      generator_capacity_kva REAL,
      service_type TEXT NOT NULL, -- Emergency Breakdown, Periodic Maintenance, Engine Overhaul, Alternator Rewind, Wiring/Controller, General Inspection
      urgency_level TEXT DEFAULT 'Normal', -- Urgent / Immediate, Today, Scheduled
      issue_description TEXT NOT NULL,
      images TEXT, -- JSON array
      preferred_date TEXT,
      technician_assigned TEXT,
      status TEXT DEFAULT 'pending', -- pending, inspected, in_progress, completed, cancelled
      cost_estimate_mmk INTEGER DEFAULT 0,
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Sell Generator Submissions (Customers selling their used generators to ZM)
  db.exec(`
    CREATE TABLE IF NOT EXISTS sell_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_code TEXT UNIQUE NOT NULL,
      seller_name TEXT NOT NULL,
      seller_phone TEXT NOT NULL,
      location TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT,
      capacity_kva REAL NOT NULL,
      fuel_type TEXT DEFAULT 'Diesel',
      running_hours INTEGER,
      condition_description TEXT NOT NULL,
      expected_price_lakhs REAL,
      images TEXT, -- JSON array
      status TEXT DEFAULT 'pending', -- pending, reviewing, contacted, purchased, rejected
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 7. Purchase Orders / Inquiries for Sale Generators
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT UNIQUE NOT NULL,
      generator_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      delivery_address TEXT,
      message TEXT,
      status TEXT DEFAULT 'new_inquiry', -- new_inquiry, contacted, deal_closed, cancelled
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (generator_id) REFERENCES generators(id) ON DELETE SET NULL
    );
  `);

  // 8. Website Configuration / Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

initDatabase();

module.exports = db;
