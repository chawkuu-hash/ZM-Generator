const crypto = require('crypto');

// Simple in-memory session token store (or cookie token verification)
const activeSessions = new Map();

function createSession(userId, username, name, role) {
  const token = crypto.randomBytes(32).toString('hex');
  const sessionData = {
    userId,
    username,
    name,
    role,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
  };
  activeSessions.set(token, sessionData);
  return token;
}

function destroySession(token) {
  if (token) {
    activeSessions.delete(token);
  }
}

function authMiddleware(req, res, next) {
  const token = req.cookies?.zm_auth_token || req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized: လော့ဂ်အင် ဝင်ရောက်ရန် လိုအပ်ပါသည်' });
  }

  const session = activeSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ success: false, error: 'Session သက်တမ်းကုန်ဆုံးသွားပါပြီ။ ပြန်လည် လော့ဂ်အင်ဝင်ပါ' });
  }

  req.user = session;
  next();
}

module.exports = {
  createSession,
  destroySession,
  authMiddleware,
  activeSessions
};
