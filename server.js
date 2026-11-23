const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const generatorRoutes = require('./routes/generators');
const rentalRoutes = require('./routes/rentals');
const repairRoutes = require('./routes/repairs');
const sellRoutes = require('./routes/sellRequests');
const orderRoutes = require('./routes/orders');
const trackRoutes = require('./routes/track');
const statsRoutes = require('./routes/stats');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/generators', generatorRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/sell', sellRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ZM Generator Web API',
    database: 'SQLite',
    time: new Date().toISOString()
  });
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'ဆာဗာတွင် ယာယီအမှားတစ်ခု ဖြစ်ပေါ်နေပါသည်'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`⚡ ZM Generator E-Commerce & Service Web is Running!`);
  console.log(`🌐 Website URL: http://localhost:${PORT}`);
  console.log(`🔑 Admin Login: http://localhost:${PORT}/login.html`);
  console.log(`📊 Admin Panel: http://localhost:${PORT}/admin.html`);
  console.log(`🛠️  Database: SQLite (database/zm_generator.db)`);
  console.log(`=======================================================`);
});
