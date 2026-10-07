const bcrypt = require('bcrypt');
const argon2 = require('argon2');

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
    } else if (hash.startsWith('$argon2i$') || hash.startsWith('$argon2id$')) {
      // Use Argon2 for verification
      return await argon2.verify(hash, password);
    } else {
      // Some rows have a plaintext string in `password` instead of a bcrypt/argon2 hash
      // (inserted directly via SQL, not through /register). Treat as "no match" rather
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
