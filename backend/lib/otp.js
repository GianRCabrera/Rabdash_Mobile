const crypto = require('crypto');
const { pool, queryDatabase } = require('../db');

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const OTP_EXPIRY_MS = 3600000; // 1 hour
const OTP_MAX_ATTEMPTS = 5;

const toMysqlDatetime = (date) => date.toISOString().slice(0, 19).replace('T', ' ');

// Replaces the old in-memory otpStore, which was wiped on every server
// restart/redeploy — a real reliability problem since redeploys can land
// mid-registration or mid-password-reset for a real user. `purpose`
// ('register' vs 'reset') keeps the two flows from validating against each
// other's OTP, which the old store (keyed by email only) didn't prevent.
const upsertOtp = async (email, purpose, otp) => {
  const expiry = toMysqlDatetime(new Date(Date.now() + OTP_EXPIRY_MS));
  await queryDatabase(pool, `
    INSERT INTO otp_codes (email, purpose, otp, expiry, verified, attempts)
    VALUES (?, ?, ?, ?, 0, 0)
    ON DUPLICATE KEY UPDATE otp = VALUES(otp), expiry = VALUES(expiry), verified = 0, attempts = 0
  `, [email, purpose, otp, expiry]);
};

const getOtp = async (email, purpose) => {
  const rows = await queryDatabase(pool, 'SELECT * FROM otp_codes WHERE email = ? AND purpose = ?', [email, purpose]);
  return rows[0] || null;
};

const markOtpVerified = (email, purpose) =>
  queryDatabase(pool, 'UPDATE otp_codes SET verified = 1 WHERE email = ? AND purpose = ?', [email, purpose]);

const incrementOtpAttempts = (email, purpose) =>
  queryDatabase(pool, 'UPDATE otp_codes SET attempts = attempts + 1 WHERE email = ? AND purpose = ?', [email, purpose]);

const deleteOtp = (email, purpose) =>
  queryDatabase(pool, 'DELETE FROM otp_codes WHERE email = ? AND purpose = ?', [email, purpose]);

const isOtpUsable = (storedOtp) =>
  !!storedOtp && storedOtp.verified && new Date(storedOtp.expiry) > new Date();

// Shared by /validate-otp (purpose 'reset') and /validate-otp-reg (purpose
// 'register') — these were previously byte-for-byte identical handlers
// checking the same in-memory object with no purpose check at all. Now each
// only matches an OTP issued for its own purpose, and a wrong guess counts
// against OTP_MAX_ATTEMPTS on top of the existing per-IP authLimiter.
const makeOtpValidator = (purpose) => async (req, res) => {
  const { email, otp } = req.body;

  try {
    const storedOtp = await getOtp(email, purpose);
    const attemptsLeft = storedOtp && storedOtp.attempts < OTP_MAX_ATTEMPTS;
    const isMatch = !!(storedOtp && attemptsLeft && storedOtp.otp === otp && new Date(storedOtp.expiry) > new Date());

    // Never log the OTP value itself (submitted or stored) — it's the credential
    // that gates registration/password reset, so leaking it via logs defeats the point of OTP.
    console.log(`Validating OTP for ${email} (${purpose}): match=${isMatch}`);

    if (isMatch) {
      await markOtpVerified(email, purpose);
      return res.json({ success: true, message: 'OTP is valid.' });
    }

    if (attemptsLeft) {
      await incrementOtpAttempts(email, purpose);
    }
    res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
  } catch (error) {
    console.error('Error validating OTP:', error.message);
    res.status(500).json({ success: false, message: 'Database error.' });
  }
};

module.exports = {
  generateOTP,
  OTP_EXPIRY_MS,
  OTP_MAX_ATTEMPTS,
  upsertOtp,
  getOtp,
  markOtpVerified,
  incrementOtpAttempts,
  deleteOtp,
  isOtpUsable,
  makeOtpValidator,
};
