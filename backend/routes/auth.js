const express = require('express');
const bcrypt = require('bcrypt'); // Still used directly below (registerUser, /reset-password, /reset-forgotten-password) — verifyPassword itself lives in ../lib/passwords.

const { pool, webPool, queryDatabase } = require('../db');
const { SELF_REGISTERABLE_POSITIONS } = require('../constants');
const { requireAuth, authLimiter, loginAccountLimiter } = require('../middleware');
const { verifyPassword, saltRounds } = require('../lib/passwords');
const { transporter } = require('../lib/mailer');
const {
  generateOTP, upsertOtp, getOtp, deleteOtp, isOtpUsable, makeOtpValidator,
} = require('../lib/otp');

const router = express.Router();

const registerUser = async (user, pool) => {
  const { name, last_name, email, password } = user;
  // Validate against a whitelist rather than trusting the client's `position`
  // directly — otherwise a crafted request could self-assign 'RabDash' or any
  // other string. Falls back to Private Veterinarian for anything unrecognized.
  const position = SELF_REGISTERABLE_POSITIONS.includes(user.position) ? user.position : 'Private Veterinarian';
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const updatedAt = createdAt;

  try {
    // HASH PART
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (name, last_name, email, position, password, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await queryDatabase(pool, query, [name, last_name, email, position, hashedPassword, createdAt, updatedAt]);
    console.log('User registered successfully as', position);
    return position;
  } catch (error) {
    console.error('Error during registration:', error);
    throw new Error('An error occurred during registration.');
  }
};

router.post('/register', authLimiter, async (req, res) => {
  const { email } = req.body;

  try {
    const storedOtp = await getOtp(email, 'register');
    if (!isOtpUsable(storedOtp)) {
      return res.status(403).json({ success: false, message: 'OTP verification required before registering.' });
    }

    const registeredPosition = await registerUser(req.body, pool);
    if (registeredPosition) {
      await deleteOtp(email, 'register');
      req.session.user = { email, position: registeredPosition };
      res.json({ success: true, message: 'User has been registered successfully' });
    }
  } catch (error) {
    res.json({ success: false, message: 'An error occurred during registration.' });
  }
});

const logInUserFromPool = async (user, pool) => {
  const { email, password } = user;
  const query = 'SELECT * FROM users WHERE email = ?';
  try {
    console.log(`Querying ${pool.config.connectionConfig.database} for user: ${email}`);
    const results = await queryDatabase(pool, query, [email]);
    if (results.length > 0) {
      const user = results[0];

      const passwordMatch = await verifyPassword(password, user.password);
      console.log(`Password match result: ${passwordMatch}`);
      if (passwordMatch) {
        console.log('Password matches for user:', email);
        return user;
      } else {
        console.log('Password does not match for user:', email);
      }
    } else {
      console.log('No user found in database:', pool.config.connectionConfig.database);
    }
    return null;
  } catch (error) {
    console.error(`Error querying ${pool.config.connectionConfig.database}:`, error);
    throw error;
  }
};

const logInUser = async (user) => {
  console.log('Attempting to log in user:', user.email);
  let loggedInUser = await logInUserFromPool(user, pool);
  if (!loggedInUser) {
    console.log('User not found in mobile database, querying web database...');
    loggedInUser = await logInUserFromPool(user, webPool);
  }
  if (loggedInUser) {
    console.log('User successfully logged in:', loggedInUser.email);
  } else {
    console.log('Login failed for user:', user.email);
  }
  return loggedInUser;
};

router.post('/login', authLimiter, loginAccountLimiter, async (req, res) => {
  try {
    const user = await logInUser(req.body);

    if (user && user.position) {
      req.session.user = { email: user.email, position: user.position };
      console.log('Session set:', req.session.user); // Log the session data
      res.json({ success: true, message: 'Login successful', position: user.position });
    } else {
      console.log('Invalid email or password for user:', req.body.email);
      res.json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.json({ success: false, message: 'An error occurred during login' });
  }
});

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ success: false, message: 'An error occurred during logout' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

router.get('/userProfile', async (req, res) => {
  const { user } = req.session;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const { email } = user;
  // Explicit column list — this used to be SELECT *, which sent the user's
  // password hash to the client on every profile load.
  const query = 'SELECT name, last_name, email, position FROM users WHERE email = ?';

  try {
    // First, check the mobile app database
    let results = await queryDatabase(pool, query, [email]);
    if (results.length === 1) {
      const userProfile = results[0];
      return res.json(userProfile);
    }

    // If not found, check the website database
    results = await queryDatabase(webPool, query, [email]);
    if (results.length === 1) {
      const userProfile = results[0];
      return res.json(userProfile);
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    return res.status(500).json({ message: 'An error occurred while retrieving user profile' });
  }
});

// OTP for reset Password
router.post('/resetpass', authLimiter, async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();

  try {
    await upsertOtp(email, 'reset', otp);
  } catch (error) {
    console.error('Error storing password reset OTP:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to send password reset OTP.' });
  }

  const mailOptions = {
    from: 'admin@rabdash.com',
    to: email,
    subject: 'Password Reset Notification',
    html: `
      <p>Hello!</p>
      <p>You are receiving this email because we received a password reset request for your account.</p>
      <p>Your OTP is: <b>${otp}</b></p>
      <p>This password reset one-time pin (OTP) will expire in 60 minutes.</p>
      <p>If you did not request a password reset, no further action is required.</p>
      <p>Regards,<br>RabDash</p>
    `,
  };

  try {
    // Send email with OTP
    await transporter.sendMail(mailOptions);
    console.log(`Password reset OTP sent to ${email}`);
    res.json({ success: true, message: 'Password reset OTP sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send password reset OTP.' });
  }
});

// Register route with OTP generation and email sending
router.post('/registerotp', authLimiter, async (req, res) => {
  const { name, last_name, email, position, password } = req.body;

  try {
    // Generate OTP
    const otp = generateOTP();
    await upsertOtp(email, 'register', otp);

    // Send OTP email
    const mailOptions = {
      from: 'admin@rabdash.com',
      to: email,
      subject: 'Email Verification OTP',
      html: `
        <p>Hello ${name} ${last_name},</p>
        <p>Thank you for registering. Your OTP for email verification is: <b>${otp}</b></p>
        <p>This OTP will expire in 60 minutes.</p>
        <p>Regards,<br>RabDash</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Error during registration or sending OTP email:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send OTP email.' });
  }
});

router.post('/validate-otp', authLimiter, makeOtpValidator('reset'));
router.post('/validate-otp-reg', authLimiter, makeOtpValidator('register'));

// Mirrors logInUser's dual-database lookup — an account can live in either
// database (login already checks both, falling back to webPool), but
// password reset used to only ever check the mobile pool, silently failing
// "User not found" for any account whose row actually lives in the web DB.
const findUserPool = async (email) => {
  const mobileResults = await queryDatabase(pool, 'SELECT * FROM users WHERE email = ?', [email]);
  if (mobileResults.length > 0) return { userPool: pool, userRow: mobileResults[0] };
  const webResults = await queryDatabase(webPool, 'SELECT * FROM users WHERE email = ?', [email]);
  if (webResults.length > 0) return { userPool: webPool, userRow: webResults[0] };
  return null;
};

// Reset Password Functionality
router.post('/reset-password', authLimiter, loginAccountLimiter, async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const found = await findUserPool(email);

    if (!found) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }

    const { userPool, userRow: user } = found;

    const passwordMatch = await verifyPassword(oldPassword, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ success: false, message: 'Old password is incorrect.' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await queryDatabase(userPool, 'UPDATE users SET password = ? WHERE email = ?', [hashedNewPassword, email]);
    console.log('Password updated successfully for user:', email);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error during password reset:', error.message);
    res.status(500).json({ success: false, message: 'Database error.' });
  }
});

// Reset Forgotten Password Functionality
router.post('/reset-forgotten-password', authLimiter, async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const storedOtp = await getOtp(email, 'reset');
    if (!isOtpUsable(storedOtp)) {
      return res.status(403).json({ success: false, message: 'OTP verification required before resetting password.' });
    }

    const found = await findUserPool(email);

    if (!found) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }

    const { userPool } = found;

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await queryDatabase(userPool, 'UPDATE users SET password = ? WHERE email = ?', [hashedNewPassword, email]);
    console.log('Password updated successfully for user:', email);

    await deleteOtp(email, 'reset');

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error during password reset:', error.message);
    res.status(500).json({ success: false, message: 'Database error.' });
  }
});

module.exports = router;
