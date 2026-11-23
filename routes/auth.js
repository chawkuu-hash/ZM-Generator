const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { createSession, destroySession, authMiddleware } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username နှင့် Password ထည့်သွင်းပေးပါ' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'အကောင့်အမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'အကောင့်အမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်' });
    }

    const token = createSession(user.id, user.username, user.name, user.role);

    // Set cookie
    res.cookie('zm_auth_token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'lax'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'လော့ဂ်အင် ဝင်ရောက်ရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const token = req.cookies?.zm_auth_token || req.headers['authorization']?.replace('Bearer ', '');
  if (token) {
    destroySession(token);
  }
  res.clearCookie('zm_auth_token');
  res.json({ success: true, message: 'အောင်မြင်စွာ ထွက်ခွာပြီးပါပြီ' });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const token = req.cookies?.zm_auth_token || req.headers['authorization']?.replace('Bearer ', '');
  if (!token) {
    return res.json({ authenticated: false });
  }

  const { activeSessions } = require('../middleware/auth');
  const session = activeSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    return res.json({ authenticated: false });
  }

  res.json({
    authenticated: true,
    user: {
      id: session.userId,
      username: session.username,
      name: session.name,
      role: session.role
    }
  });
});

module.exports = router;
