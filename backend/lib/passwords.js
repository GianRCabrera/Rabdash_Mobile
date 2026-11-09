const bcrypt = require('bcrypt');

const saltRounds = 10; // Match the rounds used in your PHP application

const verifyPassword = async (password, hash) => {
  try {
    if (hash.startsWith('$2y$')) {
      // Convert $2y$ to $2b$ for bcrypt verification
      hash = hash.replace('$2y$', '$2b$');
    }

    if (hash.startsWith('$2b$') || hash.startsWith('$2a$')) {
      // Use bcrypt for verification
      return await bcrypt.compare(password, hash);
    } else {
      // Anything that isn't bcrypt (a plaintext string inserted directly via SQL,
      // or an argon2 hash — support for those was removed Nov 2026, when no
      // account in either database used one). Treat as "no match" rather
      // than throwing, so the caller sees a normal failed login instead of a 500 —
      // callers should never end up authenticating against a hash we can't verify.
      console.error('Unknown password hash format encountered during verification; treating as no match.');
      return false;
    }
  } catch (error) {
    console.error('Error verifying password:', error);
    throw error;
  }
};

module.exports = { verifyPassword, saltRounds };
