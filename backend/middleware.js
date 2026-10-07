const { rateLimit } = require('express-rate-limit');
const { REVIEWER_POSITIONS } = require('./constants');

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  next();
};

// PROVISIONAL (Sep 2026, not finalized — see CLAUDE.md): RabDash is currently the
// only true reviewer role (sees/edits everyone's submissions). CVO is a real,
// self-registerable position, but is intentionally scoped like Private
// Veterinarian (own submissions only) until a proper elevated-CVO tier is
// designed. Named requireReviewer/REVIEWER_POSITIONS rather than requireCVO
// specifically so this doesn't read as "requires CVO" when it excludes CVO.
const requireReviewer = (req, res, next) => {
  const { user } = req.session;
  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  if (!REVIEWER_POSITIONS.includes(user.position)) {
    return res.status(403).json({ message: 'Forbidden: reviewer access required' });
  }
  next();
};

// Rate limiter for auth/OTP endpoints — mitigates brute-forcing logins, OTPs, and password resets.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

// authLimiter alone is keyed by IP, so it only mitigates one attacker
// hammering from one address — it does nothing against attempts spread
// across many IPs targeting one specific account. This second limiter is
// keyed by the submitted email instead, applied alongside authLimiter (not
// instead of it) on the two endpoints that check a password against a
// stored hash (/login, /reset-password's oldPassword check) — the
// genuinely brute-forceable ones; OTP-gated endpoints already have their
// own per-OTP attempt cap (see OTP_MAX_ATTEMPTS).
//
// Tradeoff worth knowing: this means 10 failed attempts against one
// account from anywhere locks that account out for the window, which is
// itself a (much narrower) denial-of-service surface — someone could lock
// out a legitimate user by repeatedly guessing wrong on their email. That's
// the standard, accepted tradeoff for account-based lockout; the
// alternative (no account-level limiting at all) leaves the account open
// to unlimited guessing once an attacker has more than 10 IPs.
const loginAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.body.email || '').toLowerCase().trim(),
  skip: (req) => !req.body.email,
  message: { success: false, message: 'Too many attempts for this account. Please try again later.' },
});

module.exports = { requireAuth, requireReviewer, authLimiter, loginAccountLimiter };
