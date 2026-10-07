-- Persists OTPs (registration + password-reset) in MySQL instead of the
-- in-memory store the backend used previously, which was wiped on every
-- server restart/redeploy. See backend/app.js's upsertOtp/getOtp/etc.
-- Originally created manually via phpMyAdmin (Sep 2026); captured here for
-- reproducibility in any environment set up from scratch. IF NOT EXISTS
-- makes this a safe no-op against the already-existing production table.
CREATE TABLE IF NOT EXISTS otp_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  purpose VARCHAR(20) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expiry DATETIME NOT NULL,
  verified TINYINT(1) NOT NULL DEFAULT 0,
  attempts INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_email_purpose (email, purpose)
);
