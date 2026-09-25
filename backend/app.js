require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const crypto = require('crypto');
const { rateLimit } = require('express-rate-limit');
const nodemailer = require('nodemailer'); // For sending reset password emails
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const argon2 = require('argon2'); // Import argon2 for password hashing
const moment = require('moment'); // Import moment for date formatting
const saltRounds = 10; // Match the rounds used in your PHP application

const app = express();
const path = require('path');

// Trust Render's TLS-terminating proxy so req.secure (and cookie.secure: 'auto' below)
// reflect the original client protocol instead of the plain-HTTP hop behind the proxy.
app.set('trust proxy', 1);

// Session secret: use a persisted SESSION_SECRET so logins survive a server restart.
// Falls back to a per-boot random secret (all sessions invalidated on restart) if unset.
if (!process.env.SESSION_SECRET) {
  console.warn('SESSION_SECRET is not set — using an ephemeral secret; all sessions will be invalidated on every restart.');
}
const secretKey = process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex');

// CORS: restrict to CORS_ORIGIN (comma-separated) once known; defaults to reflecting
// the request origin (current behavior) when unset, with credentials enabled so
// session cookies actually work from browser/web clients.
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true,
}));
app.use(bodyParser.json());

// Persist sessions in the mobile DB instead of the default in-memory store, which
// express-session warns leaks memory and doesn't survive a process restart — on
// Render's free tier the instance restarts on every inactivity spin-down, so without
// this every user was getting logged out far more often than SESSION_SECRET alone
// (which only persists the signing key, not the session data) would suggest.
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
sessionStore.onReady().catch((error) => {
  console.error('Session store failed to initialize:', error);
});

// Use the session middleware
// cookie.secure: 'auto' marks the cookie Secure when the request is actually HTTPS
// (via trust proxy above on Render) but still works over plain HTTP for local dev,
// where the mobile app/Expo Go talks to a LAN-IP backend without TLS.
app.use(session({
  secret: secretKey,
  store: sessionStore,
  resave: false,
  // false (not the previous true): with a persistent store, saveUninitialized would
  // write a DB row for every request that touches session middleware — i.e. nearly
  // every request — even from visitors who never log in.
  saveUninitialized: false,
  cookie: {
    secure: 'auto',
    httpOnly: true,
    sameSite: 'lax',
  },
}));

// Rate limiter for auth/OTP endpoints — mitigates brute-forcing logins, OTPs, and password resets.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
};

const webDbConfig = {
  host: process.env.WEB_DB_HOST,
  user: process.env.WEB_DB_USER,
  password: process.env.WEB_DB_PASSWORD,
  database: process.env.WEB_DB_DATABASE,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);        // Pool for mobile application
const webPool = mysql.createPool(webDbConfig);  // Pool for web application

// Retries the initial connection; does NOT re-register the 'error' listener on each
// retry (that was a bug — every retry added another listener, eventually tripping
// Node's MaxListenersExceededWarning when a DB stayed unreachable for a while).
function tryConnect(pool) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      setTimeout(() => tryConnect(pool), 2000); // Retry after 2 seconds
    } else if (connection) {
      connection.release();
    }
  });
}

function handleDisconnect(pool) {
  tryConnect(pool);

  pool.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      tryConnect(pool); // Reconnect if connection was lost
    } else {
      throw err;
    }
  });
}

handleDisconnect(pool);
handleDisconnect(webPool);

const queryDatabase = (pool, query, values) => {
  return new Promise((resolve, reject) => {
    pool.query(query, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

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

const REVIEWER_POSITIONS = ['RabDash'];

// Guards edit/delete on a form record: only the submitter (matched by username) or a
// reviewer may modify it. `table` is always a hardcoded literal from the call site,
// never user input, so it's safe to interpolate into the query.
//
// `dbOrigin` ('mobile' | 'web' | undefined) is which database the caller believes this
// row came from — see the get*FormsCVO/isReviewer list endpoints, which tag every row
// they return with dbOrigin since they merge results from `pool` and `webPool`. Mobile
// and web rows are independent auto-increment sequences, so the same numeric `id` can
// legitimately exist in both databases at once. Every mutation below only ever touches
// `pool` by `id`, so without this check, a reviewer editing/deleting a web-sourced row
// would silently mutate an unrelated mobile row that happens to share its id, instead of
// failing or doing nothing. Rejecting dbOrigin==='web' outright (rather than attempting
// the mutation against `webPool`) is deliberate: we haven't verified the web DB's schema
// matches column-for-column, and it has its own independent admin/edit workflow via the
// companion website.
// Sends the response and returns false when the caller should stop; true means proceed.
const authorizeFormMutation = async (req, res, table, id, dbOrigin) => {
  if (dbOrigin === 'web') {
    res.status(403).json({ message: 'This record was submitted through the website and cannot be edited or deleted from the mobile app.' });
    return false;
  }
  const { user } = req.session;
  const rows = await queryDatabase(pool, `SELECT username FROM ${table} WHERE id = ?`, [id]);
  if (rows.length === 0) {
    res.status(404).json({ message: 'Record not found' });
    return false;
  }
  if (rows[0].username !== user.email && !REVIEWER_POSITIONS.includes(user.position)) {
    res.status(403).json({ message: 'Forbidden: you do not have permission to modify this record' });
    return false;
  }
  return true;
};

// Tags every row from a merged mobile+web list query with which database it came from,
// so the frontend can hide edit/delete for web-sourced rows and pass dbOrigin back on
// mutation requests — see authorizeFormMutation above for why this matters.
const tagOrigin = (mobileRows, webRows) => [
  ...mobileRows.map((row) => ({ ...row, dbOrigin: 'mobile' })),
  ...webRows.map((row) => ({ ...row, dbOrigin: 'web' })),
];

// Rejects with 400 if any of `fields` is missing/blank in req.body; returns
// true otherwise. None of the form-submission endpoints validated required
// fields before this — a missing field silently became NULL (or a raw 500
// if the column is NOT NULL) instead of a clear 400. Required-field lists
// below were taken from each form screen's own client-side "fill in all
// fields" check, not guessed — some fields (e.g. the Rabies Exposure form's
// vaccine-dose dates) are deliberately optional there and are excluded here
// too, since they're filled in over weeks, not all at once.
const requireFields = (req, res, fields) => {
  const missing = fields.filter((field) => {
    const value = req.body[field];
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
  });
  if (missing.length > 0) {
    res.status(400).json({ success: false, message: `Missing required field(s): ${missing.join(', ')}` });
    return false;
  }
  return true;
};

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


// Positions selectable via public self-registration. RabDash is deliberately
// excluded — that's still provisioned separately, never through this form.
const SELF_REGISTERABLE_POSITIONS = ['Private Veterinarian', 'CVO'];

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

app.post('/register', authLimiter, async (req, res) => {
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

app.post('/login', authLimiter, async (req, res) => {
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

app.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ success: false, message: 'An error occurred during logout' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

app.get('/userProfile', async (req, res) => {
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

// Configure Nodemailer with SMTP (see SMTP_* vars in .env)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for 587/STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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

// OTP for reset Password
app.post('/resetpass', authLimiter, async (req, res) => {
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
app.post('/registerotp', authLimiter, async (req, res) => {
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

app.post('/validate-otp', authLimiter, makeOtpValidator('reset'));
app.post('/validate-otp-reg', authLimiter, makeOtpValidator('register'));

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
app.post('/reset-password', authLimiter, async (req, res) => {
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
app.post('/reset-forgotten-password', authLimiter, async (req, res) => {
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


//Forms
app.post('/submitVaccinationForm', requireAuth, async (req, res) => {
  const { user } = req.session;
  const username = user.email;
  console.log('Username:', username);

  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const updatedAt = createdAt;

  const {
    date,
    district,
    barangay,
    purok,
    vaccinator,
    timeStart,
    ownerName,
    address,
    sex,
    contactNo,

    petName,
    petAge,
    species,
    petSex,
    color,
    cardNo,
    vaccine,
    source,
    dateVaccinated,
    timeFinish,
  } = req.body;

  if (!requireFields(req, res, [
    'date', 'district', 'barangay', 'purok', 'vaccinator', 'timeStart', 'ownerName', 'address', 'sex', 'contactNo',
    'petName', 'petAge', 'species', 'petSex', 'color', 'cardNo', 'vaccine', 'source', 'dateVaccinated', 'timeFinish',
  ])) return;

  const insertQuery = `
    INSERT INTO vaccination_form
    (username, date, district, barangay, purok, vaccinator, timeStart, ownerName, address, sex, contactNo,
      petName, petAge, species, petSex, color, cardNo,
      vaccine, source, dateVaccinated, timeFinish,  created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  try {
    const result = await queryDatabase(pool, insertQuery, [
      username,
      date,
      district,
      barangay,
      purok,
      vaccinator,
      timeStart,
      ownerName,
      address,
      sex,
      contactNo,

      petName,
      petAge,
      species,
      petSex,
      color,
      cardNo,
      vaccine,
      source,
      dateVaccinated,
      timeFinish,
      createdAt,
      updatedAt
    ]);
    const insertedId = result.insertId;
    console.log('Vaccination form data inserted successfully. New ID:', insertedId);
    res.json({ success: true, message: 'Vaccination form data submitted successfully', id: insertedId });
  } catch (error) {
    console.error('Error during Vaccination form submission:', error);
    res.status(500).json({ success: false, message: 'An error occurred during Vaccination form submission' });
  }
});


app.post('/editVaccinationForm', async (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const username = user.email;
  console.log('Username:', username);

  const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const {
    id,
    date,
    district,
    barangay,
    purok,
    vaccinator,
    timeStart,
    ownerName,
    address,
    sex,
    contactNo,
    petName,
    petAge,
    species,
    petSex,
    color,
    cardNo,
    vaccine,
    source,
    dateVaccinated,
    timeFinish
  } = req.body;

  const updateQuery = `
    UPDATE vaccination_form SET
    date=?, district=?, barangay=?, purok=?, vaccinator=?, timeStart=?, ownerName=?, address=?,
    sex=?, contactNo=?, petName=?, petAge=?, species=?, petSex=?, color=?, cardNo=?, vaccine=?,
    source=?, dateVaccinated=?, timeFinish=?, updated_at=? WHERE id=?
  `;
  const { dbOrigin } = req.body;

  try {
    if (!(await authorizeFormMutation(req, res, 'vaccination_form', id, dbOrigin))) return;
    await queryDatabase(pool, updateQuery, [
      date,
      district,
      barangay,
      purok,
      vaccinator,
      timeStart,
      ownerName,
      address,
      sex,
      contactNo,
      petName,
      petAge,
      species,
      petSex,
      color,
      cardNo,
      vaccine,
      source,
      dateVaccinated,
      timeFinish,
      updatedAt,
      id
    ]);
    console.log('Vaccination form data updated successfully for ID:', id);
    res.json({ success: true, message: 'Vaccination Form updated successfully', id });
  } catch (error) {
    console.error('Error during Vaccination form update:', error);
    res.status(500).json({ success: false, message: 'An error occurred during Vaccination form update' });
  }
});


app.post('/submitNeuterForm', requireAuth, async (req, res) => {
  const { user } = req.session;
  const username = user.email;
  console.log('Username:', username);

  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const updatedAt = createdAt;

  const {
    date,
    district,
    barangay,
    purok,
    proc,
    client,
    address,
    contactNo,
    name,
    species,
    sex,
    breed,
    age,
    pets,
    cat,
  } = req.body;

  if (!requireFields(req, res, [
    'date', 'district', 'barangay', 'purok', 'proc', 'client', 'address', 'contactNo',
    'name', 'species', 'sex', 'breed', 'age', 'pets', 'cat',
  ])) return;

  const insertQuery = `
    INSERT INTO consent_form
    (username, date, district, barangay, purok, proc, client, address, contactNo, name, species,
    sex, breed, age, pets, cat, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const result = await queryDatabase(pool, insertQuery, [
      username,
      date,
      district,
      barangay,
      purok,
      proc,
      client,
      address,
      contactNo,
      name,
      species,
      sex,
      breed,
      age,
      pets,
      cat,
      createdAt,
      updatedAt
    ]);
    const insertedId = result.insertId;
    console.log('Neuter form data inserted successfully. New ID:', insertedId);
    res.json({ success: true, message: 'Neuter form data submitted successfully', id: insertedId });
  } catch (error) {
    console.error('Error during neuter form submission:', error);
    res.status(500).json({ success: false, message: 'An error occurred during neuter form submission' });
  }
});

app.post('/editNeuterForm', async (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const username = user.email;
  console.log('Username:', username);

  const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const {
    id,
    date,
    district,
    barangay,
    purok,
    proc,
    client,
    address,
    contactNo,
    name,
    species,
    sex,
    breed,
    age,
    pets,
    cat,
  } = req.body;

  const updateQuery = `
    UPDATE consent_form SET
    date=?, district=?, barangay=?, purok=?, proc=?, client=?, address=?, contactNo=?,
    name=?, species=?, sex=?, breed=?, age=?, pets=?, cat=?, updated_at=? WHERE id=?
  `;
  const { dbOrigin } = req.body;

  try {
    if (!(await authorizeFormMutation(req, res, 'consent_form', id, dbOrigin))) return;
    await queryDatabase(pool, updateQuery, [
      date,
      district,
      barangay,
      purok,
      proc,
      client,
      address,
      contactNo,
      name,
      species,
      sex,
      breed,
      age,
      pets,
      cat,
      updatedAt,
      id
    ]);
    console.log('Neuter form data updated successfully for ID:', id);
    res.json({ success: true, message: 'Neuter Form updated successfully', id });
  } catch (error) {
    console.error('Error during neuter form update:', error);
    res.status(500).json({ success: false, message: 'An error occurred during neuter form update' });
  }
});

app.post('/submitRabiesSampleForms', requireAuth, async (req, res) => {
  const { user } = req.session;
  const username = user.email;
  console.log('Username:', username);

  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const updatedAt = createdAt;

  const {
    name,
    sex,
    address,
    number,
    district,
    barangay,
    date,
    species,
    breed,
    age,

    sampleSex,
    specimen,
    ownership,
    vacStatus,
    contact,
    manage,
    death,
    changes,
    otherillness,
    fatcount,
  } = req.body;

  if (!requireFields(req, res, [
    'name', 'sex', 'address', 'number', 'district', 'barangay', 'date', 'species', 'breed', 'age',
    'sampleSex', 'specimen', 'ownership', 'vacStatus', 'contact', 'manage', 'death', 'changes', 'otherillness', 'fatcount',
  ])) return;

  const insertQuery = `
    INSERT INTO bite_form
    (username, name, sex, address, number, district, barangay, date, species, breed, age,
      sampleSex, specimen, ownership, vacStatus, contact, manage, death, changes, otherillness, fatcount, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const result = await queryDatabase(pool, insertQuery, [
      username,
      name,
      sex,
      address,
      number,
      district,
      barangay,
      date,
      species,
      breed,
      age,

      sampleSex,
      specimen,
      ownership,
      vacStatus,
      contact,
      manage,
      death,
      changes,
      otherillness,
      fatcount,
      createdAt,
      updatedAt
    ]);
    const insertedId = result.insertId;
    console.log('Rabies Sample form data inserted successfully. New ID:', insertedId);
    res.json({ success: true, message: 'Rabies Sample form data submitted successfully', id: insertedId });
  } catch (error) {
    console.error('Error during Rabies Sample form submission:', error);
    res.status(500).json({ success: false, message: 'An error occurred during Rabies Sample form submission' });
  }
});

app.post('/editRabiesSampleForms', async (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const username = user.email;
  console.log('Username:', username);

  const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const {
    id,
    name,
    sex,
    address,
    number,
    district,
    barangay,
    date,
    species,
    breed,
    age,
    sampleSex,
    specimen,
    ownership,
    vacStatus,
    contact,
    manage,
    death,
    changes,
    otherillness,
    fatcount,
  } = req.body;

  const updateQuery = `
    UPDATE bite_form SET
    name=?, sex=?, address=?, number=?, district=?, barangay=?, date=?, species=?,
    breed=?, age=?, sampleSex=?, specimen=?, ownership=?, vacStatus=?, contact=?,
    manage=?, death=?, changes=?, otherillness=?, fatcount=?, updated_at=? WHERE id=?
  `;
  const { dbOrigin } = req.body;

  try {
    if (!(await authorizeFormMutation(req, res, 'bite_form', id, dbOrigin))) return;
    await queryDatabase(pool, updateQuery, [
      name,
      sex,
      address,
      number,
      district,
      barangay,
      date,
      species,
      breed,
      age,
      sampleSex,
      specimen,
      ownership,
      vacStatus,
      contact,
      manage,
      death,
      changes,
      otherillness,
      fatcount,
      updatedAt,
      id
    ]);
    console.log('Rabies Sample form data updated successfully for ID:', id);
    res.json({ success: true, message: 'Rabies Sample Form updated successfully', id });
  } catch (error) {
    console.error('Error during Rabies Sample form update:', error);
    res.status(500).json({ success: false, message: 'An error occurred during Rabies Sample form update' });
  }
});

// Add a new endpoint to fetch vaccination form data
app.get('/getVaccinationForms', async (req, res) => {
  const { user } = req.session;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const username = user.email; // Use the user's email as the username
  console.log('Username:', username);

  const query = 'SELECT * FROM vaccination_form WHERE username = ? ORDER BY created_at DESC';

  try {
    const results = await queryDatabase(pool, query, [username]);

    if (results.length > 0) {
      // Adjust each date in the results
      const adjustedResults = results.map(result => {
        if (result.date) {
          const dateObj = new Date(result.date);
          result.date = dateObj.toISOString().split('T')[0];
        }
        if (result.dateVaccinated) {
          const dateVaccinatedObj = new Date(result.dateVaccinated);
          result.dateVaccinated = dateVaccinatedObj.toISOString().split('T')[0];
        }
        return result;
      });
      res.json(adjustedResults);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error retrieving vaccination forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving vaccination forms' });
  }
});

// New endpoint to fetch vaccination_form data from both mobile and web databases
app.get('/getVaccinationFormsCVO', requireReviewer, async (req, res) => {
  // Used to default to LIMIT 10 OFFSET 0, silently hiding everything older
  // from reviewers. Removing the limit entirely OOM-crashed the whole Render
  // process (both DBs' full result sets held in memory at once, then
  // JSON-serialized) — this bounded cap stops that while still comfortably
  // covering realistic table sizes. Real server-side pagination is the
  // proper long-term fix; this is a stopgap.
  const query = 'SELECT * FROM vaccination_form ORDER BY created_at DESC LIMIT 500';

  try {
    const mobileResults = await queryDatabase(pool, query, []);
    const webResults = await queryDatabase(webPool, query, []);

    const vaccinationForms = tagOrigin(mobileResults, webResults);

    if (vaccinationForms.length > 0) {
      res.json(vaccinationForms);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error retrieving vaccination forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving vaccination forms' });
  }
});

// Add a new endpoint to fetch neuter form data
app.get('/getNeuterForms', async (req, res) => {
  const { user } = req.session;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const username = user.email;
  console.log('Username:', username);

  const query = 'SELECT * FROM consent_form WHERE username = ? ORDER BY created_at DESC';

  try {
    const results = await queryDatabase(pool, query, [username]);

    if (results.length > 0) {
      const adjustedResults = results.map(result => {
        if (result.date) {
          const dateObj = new Date(result.date);
          result.date = dateObj.toISOString().split('T')[0];
        }
        return result;
      });
      res.json(adjustedResults);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error retrieving neuter forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving neuter forms' });
  }
});

// New endpoint to fetch neuter form data from both mobile and web databases
app.get('/getNeuterFormsCVO', requireReviewer, async (req, res) => {
  // Bounded LIMIT — see the comment on getVaccinationFormsCVO above.
  const query = 'SELECT * FROM consent_form ORDER BY created_at DESC LIMIT 500';

  try {
    const mobileResults = await queryDatabase(pool, query, []);
    const webResults = await queryDatabase(webPool, query, []);

    const neuterForms = tagOrigin(mobileResults, webResults);

    if (neuterForms.length > 0) {
      res.json(neuterForms);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error retrieving neuter forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving neuter forms' });
  }
});


// Add a new endpoint to fetch rabies sample form data
app.get('/getRabiesSampleForms', async (req, res) => {
  const { user } = req.session;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const username = user.email; // Use the user's email as the username
  console.log('Username:', username);

  const query = 'SELECT * FROM bite_form WHERE username = ? ORDER BY created_at DESC';

  try {
    const results = await queryDatabase(pool, query, [username]);

    if (results.length > 0) {
      const adjustedResults = results.map(result => {
        if (result.date) {
          const dateObj = new Date(result.date);
          result.date = dateObj.toISOString().split('T')[0];
        }
        return result;
      });
      res.json(adjustedResults);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error retrieving rabies sample forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving rabies sample forms' });
  }
});

// Add a new endpoint to fetch rabies sample form data from both mobile and web databases
app.get('/getRabiesSampleFormsCVO', requireReviewer, async (req, res) => {
  // Bounded LIMIT — see the comment on getVaccinationFormsCVO above.
  const query = 'SELECT * FROM bite_form ORDER BY created_at DESC LIMIT 500';

  try {
    const mobileResults = await queryDatabase(pool, query, []);
    const webResults = await queryDatabase(webPool, query, []);

    const rabiesSampleForms = tagOrigin(mobileResults, webResults);

    if (rabiesSampleForms.length > 0) {
      res.json(rabiesSampleForms);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error retrieving rabies sample forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving rabies sample forms' });
  }
});

app.post('/submitBudgetForm', async (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const username = user.email;
  console.log('Username:', username);

  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const updatedAt = createdAt;

  const {
    year,
    budget,
    costvax,
  } = req.body;

  if (!requireFields(req, res, ['year', 'budget', 'costvax'])) return;

  const insertQuery = `
    INSERT INTO budget_form
    (username, year, budget, costvax, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    const result = await queryDatabase(pool, insertQuery, [
      username,
      year,
      budget,
      costvax,
      createdAt,
      updatedAt
    ]);
    const insertedId = result.insertId;
    console.log('Budget form data inserted successfully. New ID:', insertedId);
    res.json({ success: true, message: 'Budget form data submitted successfully', id: insertedId });
  } catch (error) {
    console.error('Error during Budget form submission:', error);
    res.status(500).json({ success: false, message: 'An error occurred during Budget form submission' });
  }
});

app.post('/editBudgetForm', async (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const username = user.email;
  console.log('Username:', username);

  const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const {
    id,
    year,
    budget,
    costvax,
  } = req.body;

  const updateQuery = `
    UPDATE budget_form SET
    year=?, budget=?, costvax=?, updated_at=? WHERE id=?
  `;
  const { dbOrigin } = req.body;

  try {
    if (!(await authorizeFormMutation(req, res, 'budget_form', id, dbOrigin))) return;
    await queryDatabase(pool, updateQuery, [
      year,
      budget,
      costvax,
      updatedAt,
      id
    ]);
    console.log('Budget form data updated successfully for ID:', id);
    res.json({ success: true, message: 'Budget Form updated successfully', id });
  } catch (error) {
    console.error('Error during Budget form update:', error);
    res.status(500).json({ success: false, message: 'An error occurred during Budget form update' });
  }
});

app.post('/submitWeatherForm', requireAuth, async (req, res) => {
const { user } = req.session;
const username = user.email;

console.log('Username:', username);

const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
const updatedAt = createdAt;

const {
  minimum_temperature,
  maximum_temperature,
  mean_temperature,
  relative_humidity,
  rainfall,
  precipitation
} = req.body;

if (!requireFields(req, res, [
  'minimum_temperature', 'maximum_temperature', 'mean_temperature', 'relative_humidity', 'rainfall', 'precipitation',
])) return;

// Insert data into the weather_form table using parameterized query
const insertQuery = `
  INSERT INTO weather_form
  (username, minimum_temperature, maximum_temperature, mean_temperature, relative_humidity, rainfall, precipitation, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

try {
  const result = await queryDatabase(pool, insertQuery, [
    username,
    minimum_temperature,
    maximum_temperature,
    mean_temperature,
    relative_humidity,
    rainfall,
    precipitation,
    createdAt,
    updatedAt
  ]);
  const insertedId = result.insertId;
  console.log('Weather form data inserted successfully. New ID:', insertedId);

  console.log('Weather form data inserted successfully');
  res.json({ success: true, message: 'Weather form data submitted successfully' });
} catch (error) {
  console.error('Error during Weather form submission:', error.message);
  res.status(500).json({ success: false, message: 'An error occurred during Weather form submission' });
}
});

app.post('/editWeatherForm', requireAuth, async (req, res) => {
const { user } = req.session;
const username = user.email;
console.log('Username:', username);

const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

const {
  id,
  minimum_temperature,
  maximum_temperature,
  mean_temperature,
  relative_humidity,
  rainfall,
  precipitation,
} = req.body;

const updateQuery = `
  UPDATE weather_form SET
  minimum_temperature=?, maximum_temperature=?, mean_temperature=?, relative_humidity=?, rainfall=?, precipitation=?,
  updated_at=? WHERE id=?
`;
const { dbOrigin } = req.body;

try {
  if (!(await authorizeFormMutation(req, res, 'weather_form', id, dbOrigin))) return;
  await queryDatabase(pool, updateQuery, [
    minimum_temperature,
    maximum_temperature,
    mean_temperature,
    relative_humidity,
    rainfall,
    precipitation,
    updatedAt,
    id
  ]);
  console.log('Schedule form data updated successfully for ID:', id);
  res.json({ success: true, message: 'Schedule Form updated successfully', id });
} catch (error) {
  console.error('Error during Schedule form update:', error);
  res.status(500).json({ success: false, message: 'An error occurred during Schedule form update' });
}
});

app.post('/submitScheduleForm', async (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const username = user.email;
  console.log('Username:', username);

  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const updatedAt = createdAt;

  const { date, title, district, barangay, purok } = req.body;

  if (!requireFields(req, res, ['date', 'title', 'district', 'barangay', 'purok'])) return;

  const insertQuery = `
    INSERT INTO schedule_form
    (username, date, title, district, barangay, purok, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const result = await queryDatabase(pool, insertQuery, [
      username,
      date,
      title,
      district,
      barangay,
      purok,
      createdAt,
      updatedAt
    ]);
    const insertedId = result.insertId;
    console.log('Schedule form data inserted successfully. New ID:', insertedId);
    res.json({ success: true, message: 'Schedule form data submitted successfully', id: insertedId });
  } catch (error) {
    console.error('Error during Schedule form submission:', error);
    res.status(500).json({ success: false, message: 'An error occurred during Schedule form submission' });
  }
});

app.post('/editScheduleForm', async (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const username = user.email;
  console.log('Username:', username);

  const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const {
    id,
    date,
    title,
    district,
    barangay,
    purok,
  } = req.body;

  const updateQuery = `
    UPDATE schedule_form SET
    date=?, title=?, district=?, barangay=?, purok=?,
    updated_at=? WHERE id=?
  `;
  const { dbOrigin } = req.body;

  try {
    if (!(await authorizeFormMutation(req, res, 'schedule_form', id, dbOrigin))) return;
    await queryDatabase(pool, updateQuery, [
      date,
      title,
      district,
      barangay,
      purok,
      updatedAt,
      id
    ]);
    console.log('Schedule form data updated successfully for ID:', id);
    res.json({ success: true, message: 'Schedule Form updated successfully', id });
  } catch (error) {
    console.error('Error during Schedule form update:', error);
    res.status(500).json({ success: false, message: 'An error occurred during Schedule form update' });
  }
});

app.post('/submitIECForm', async (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const username = user.email;
  console.log('Username:', username);

  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const updatedAt = createdAt;

  const { date, title, district, barangay, purok, participants, brochure, materials } = req.body;

  if (!requireFields(req, res, ['date', 'title', 'district', 'barangay', 'purok', 'participants', 'brochure', 'materials'])) return;

  const insertQuery = `
    INSERT INTO iec_form
    (username, date, title, district, barangay, purok, participants, brochure, materials, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const result = await queryDatabase(pool, insertQuery, [
      username,
      date,
      title,
      district,
      barangay,
      purok,
      participants,
      brochure,
      materials,
      createdAt,
      updatedAt
    ]);
    const insertedId = result.insertId;
    console.log('IEC form data inserted successfully. New ID:', insertedId);
    res.json({ success: true, message: 'IEC form data submitted successfully', id: insertedId });
  } catch (error) {
    console.error('Error during IEC form submission:', error);
    res.status(500).json({ success: false, message: 'An error occurred during IEC form submission' });
  }
});

app.post('/editIECForm', async (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  
  const username = user.email;
  console.log('Username:', username);

  const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const {
    id,
    date,
    title,
    district,
    barangay,
    purok,
    participants,
    brochure,
    materials
  } = req.body;

  const updateQuery = `
    UPDATE iec_form SET
    date=?, title=?, district=?, barangay=?, purok=?, participants=?, brochure=?, materials=?,
    updated_at=? WHERE id=?
  `;
  const { dbOrigin } = req.body;

  try {
    if (!(await authorizeFormMutation(req, res, 'iec_form', id, dbOrigin))) return;
    await queryDatabase(pool, updateQuery, [
      date,
      title,
      district,
      barangay,
      purok,
      participants,
      brochure,
      materials,
      updatedAt,
      id
    ]);
    console.log('IEC form data updated successfully for ID:', id);
    res.json({ success: true, message: 'IEC Form updated successfully', id });
  } catch (error) {
    console.error('Error during IEC form update:', error);
    res.status(500).json({ success: false, message: 'An error occurred during IEC form update' });
  }
});


app.post('/submitAnimalControlForm', async (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const username = user.email;
  console.log('Username:', username);

  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const updatedAt = createdAt;

  const {
    date1,
    cageNum,
    impHeads,
    date2,
    claimedHeads,
    date3,
    date4,
    euthHeads,
    chief
  } = req.body;

  if (!requireFields(req, res, ['date1', 'cageNum', 'impHeads', 'date2', 'claimedHeads', 'date3', 'date4', 'euthHeads', 'chief'])) return;

  const vaccinationFormQuery = `
    INSERT INTO control_form
    (username, date1, cageNum, impHeads, date2, claimedHeads, date3, euthHeads, date4, chief, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await queryDatabase(pool, vaccinationFormQuery, [
      username,
      date1,
      cageNum,
      impHeads,
      date2,
      claimedHeads,
      date3,
      euthHeads,
      date4,
      chief,
      createdAt,
      updatedAt
    ]);

    console.log('Animal Control form data inserted successfully');
    res.json({ success: true, message: 'Animal Control form data submitted successfully' });
  } catch (error) {
    console.error('Error during Animal Control form submission:', error.message);
    res.status(500).json({ success: false, message: 'An error occurred during Animal Control form submission' });
  }
});

app.post('/editAnimalControlForm', async (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const username = user.email;
  console.log('Username:', username);

  const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const {
    id,
    date1,
    cageNum,
    impHeads,
    date2,
    claimedHeads,
    date3,
    euthHeads,
    date4,
    chief,
  } = req.body;

  const updateQuery = `
    UPDATE control_form SET
    date1=?, cageNum=?, impHeads=?, date2=?, claimedHeads=?, date3=?, euthHeads=?, date4=?, chief=?,
    updated_at=? WHERE id=?
  `;
  const { dbOrigin } = req.body;

  try {
    if (!(await authorizeFormMutation(req, res, 'control_form', id, dbOrigin))) return;
    await queryDatabase(pool, updateQuery, [
      date1,
      cageNum,
      impHeads,
      date2,
      claimedHeads,
      date3,
      euthHeads,
      date4,
      chief,
      updatedAt,
      id
    ]);
    console.log('Animal Control form data updated successfully for ID:', id);
    res.json({ success: true, message: 'Animal Control Form updated successfully', id });
  } catch (error) {
    console.error('Error during Animal Control form update:', error);
    res.status(500).json({ success: false, message: 'An error occurred during Animal Control form update' });
  }
});

// Add a new endpoint to handle form data
app.post('/submitRabiesExposureForm', async (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const username = user.email;
  console.log('Username:', username);

  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const updatedAt = createdAt;

  const {
    regNo,
    regDate,
    name,
    address,
    age,
    sex,
    expDate,
    place,
    typeAnimal,
    typeBNB,
    site,
    category,
    washing,
    RIG,
    route,
    d0,
    d3,
    d7,
    d14,
    d28,
    brand,
    outcome,
    bitingStatus,
    remarks,
  } = req.body;

  // RIG, route, and the d0/d3/d7/d14/d28 dose dates are deliberately excluded —
  // this form's own frontend validation doesn't require them either, since a
  // case can be registered before its full multi-week vaccination schedule
  // and outcome are known.
  if (!requireFields(req, res, [
    'regNo', 'regDate', 'name', 'address', 'age', 'sex', 'expDate', 'place', 'typeAnimal', 'typeBNB',
    'site', 'category', 'washing', 'brand', 'outcome', 'bitingStatus', 'remarks',
  ])) return;

  const vaccinationFormQuery = `
    INSERT INTO exposure_form
    (username, regNo, regDate, name, address, age, sex, expDate, place, typeAnimal, typeBNB,
     site, category, washing, RIG, route, d0, d3, d7, d14, d28, brand, outcome, bitingStatus, remarks, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await queryDatabase(pool, vaccinationFormQuery, [
      username,
      regNo,
      regDate,
      name,
      address,
      age,
      sex,
      expDate,
      place,
      typeAnimal,
      typeBNB,
      site,
      category,
      washing,
      RIG,
      route,
      d0,
      d3,
      d7,
      d14,
      d28,
      brand,
      outcome,
      bitingStatus,
      remarks,
      createdAt,
      updatedAt
    ]);

    console.log('Rabies Exposure form data inserted successfully');
    res.json({ success: true, message: 'Rabies Exposure form data submitted successfully' });
  } catch (error) {
    console.error('Error during Rabies Exposure form submission:', error);
    res.status(500).json({ success: false, message: 'An error occurred during Rabies Exposure form submission' });
  }
});

app.post('/editRabiesExposureForm', async (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const username = user.email;
  console.log('Username:', username);

  const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const {
    id,
    regNo,
    regDate,
    name,
    address,
    age,
    sex,
    expDate,
    place,
    typeAnimal,
    typeBNB,
    site,
    category,
    washing,
    RIG,
    route,
    d0,
    d3,
    d7,
    d14,
    d28,
    brand,
    outcome,
    bitingStatus,
    remarks,
  } = req.body;

  const updateQuery = `
    UPDATE exposure_form SET
    regNo=?, regDate=?, name=?, address=?, age=?, sex=?, expDate=?, place=?, typeAnimal=?,
    typeBNB=?, site=?, category=?, washing=?, RIG=?, route=?, d0=?, d3=?, d7=?, d14=?, d28=?,
    brand=?, outcome=?, bitingStatus=?, remarks=?, updated_at=? WHERE id=?
  `;
  const { dbOrigin } = req.body;

  try {
    if (!(await authorizeFormMutation(req, res, 'exposure_form', id, dbOrigin))) return;
    await queryDatabase(pool, updateQuery, [
      regNo,
      regDate,
      name,
      address,
      age,
      sex,
      expDate,
      place,
      typeAnimal,
      typeBNB,
      site,
      category,
      washing,
      RIG,
      route,
      d0,
      d3,
      d7,
      d14,
      d28,
      brand,
      outcome,
      bitingStatus,
      remarks,
      updatedAt,
      id
    ]);
    console.log('Rabies Exposure form data updated successfully for ID:', id);
    res.json({ success: true, message: 'Rabies Exposure Form updated successfully', id });
  } catch (error) {
    console.error('Error during Rabies Exposure form update:', error);
    res.status(500).json({ success: false, message: 'An error occurred during Rabies Exposure form update' });
  }
});

// Add this route to your backend code
app.get('/Position', async (req, res) => {
  const { user } = req.session;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const { email } = user;
  const query = 'SELECT position FROM users WHERE email = ?';
  try {
    let results = await queryDatabase(pool, query, [email]);
    if (results.length === 1) {
      return res.json(results[0]);
    }

    // Check the website database if not found in mobile database
    results = await queryDatabase(webPool, query, [email]);
    if (results.length === 1) {
      return res.json(results[0]);
    }

    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error('Error retrieving user position:', error);
    return res.status(500).json({ message: 'An error occurred while retrieving user position' });
  }
});

const startServer = (port) => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

// New endpoint to fetch control_form data from both mobile and web databases
app.get('/getAnimalControlForms', requireAuth, async (req, res) => {
  const { user } = req.session;
  const isReviewer = REVIEWER_POSITIONS.includes(user.position);
  const query = isReviewer
    ? 'SELECT * FROM control_form ORDER BY created_at DESC LIMIT 500'
    : 'SELECT * FROM control_form WHERE username = ? ORDER BY created_at DESC';
  const params = isReviewer ? [] : [user.email];

  try {
    const mobileResults = await queryDatabase(pool, query, params);
    const webResults = await queryDatabase(webPool, query, params);

    const controlForms = tagOrigin(mobileResults, webResults);

    if (controlForms.length > 0) {
      res.json(controlForms);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error retrieving Animal Control and Rehabilitation Daily Report forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving Animal Control and Rehabilitation Daily Report forms' });
  }
});

// New endpoint to fetch IEC forms data from both mobile and web databases
app.get('/getIECForms', requireAuth, async (req, res) => {
  const { user } = req.session;
  const isReviewer = REVIEWER_POSITIONS.includes(user.position);
  const query = isReviewer
    ? 'SELECT * FROM iec_form ORDER BY created_at DESC LIMIT 500'
    : 'SELECT * FROM iec_form WHERE username = ? ORDER BY created_at DESC';
  const params = isReviewer ? [] : [user.email];

  try {
    const mobileResults = await queryDatabase(pool, query, params);
    const webResults = await queryDatabase(webPool, query, params);

    const iecForms = tagOrigin(mobileResults, webResults);

    if (iecForms.length > 0) {
      res.json(iecForms);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error retrieving IEC Report forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving IEC Report forms' });
  }
});

// New endpoint to fetch Schedule forms data from both mobile and web databases
app.get('/getScheduleForms', requireAuth, async (req, res) => {
  const { user } = req.session;
  const isReviewer = REVIEWER_POSITIONS.includes(user.position);
  const query = isReviewer
    ? 'SELECT * FROM schedule_form ORDER BY created_at DESC LIMIT 500'
    : 'SELECT * FROM schedule_form WHERE username = ? ORDER BY created_at DESC';
  const params = isReviewer ? [] : [user.email];

  try {
    const mobileResults = await queryDatabase(pool, query, params);
    const webResults = await queryDatabase(webPool, query, params);

    const scheduleForms = tagOrigin(mobileResults, webResults);

    if (scheduleForms.length > 0) {
      res.json(scheduleForms);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error retrieving Schedule Report forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving Schedule Report forms' });
  }
});

// New endpoint to fetch Budget forms data from both mobile and web databases
app.get('/getBudgetForms', requireAuth, async (req, res) => {
  const { user } = req.session;
  const isReviewer = REVIEWER_POSITIONS.includes(user.position);
  const query = isReviewer
    ? 'SELECT * FROM budget_form ORDER BY created_at DESC LIMIT 500'
    : 'SELECT * FROM budget_form WHERE username = ? ORDER BY created_at DESC';
  const params = isReviewer ? [] : [user.email];

  try {
    const mobileResults = await queryDatabase(pool, query, params);
    const webResults = await queryDatabase(webPool, query, params);

    const budgetForms = tagOrigin(mobileResults, webResults);

    if (budgetForms.length > 0) {
      res.json(budgetForms);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error retrieving Budget Report forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving Budget Report forms' });
  }
});

// Add a new endpoint to fetch weather form data
app.get('/getWeatherForms', requireAuth, async (req, res) => {
  const { user } = req.session;
  const isReviewer = REVIEWER_POSITIONS.includes(user.position);
  const query = isReviewer
    ? 'SELECT * FROM weather_form ORDER BY created_at DESC'
    : 'SELECT * FROM weather_form WHERE username = ? ORDER BY created_at DESC';
  const params = isReviewer ? [] : [user.email];

  try {
    const results = await queryDatabase(pool, query, params);

    if (results.length > 0) {
      const weatherForms = results;
      res.json(weatherForms);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error retrieving Weather Report forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving Weather Report forms' });
  }
});

// New endpoint to fetch exposure_form data from both mobile and web databases
app.get('/getRabiesExposureForms', requireAuth, async (req, res) => {
  const { user } = req.session;
  const isReviewer = REVIEWER_POSITIONS.includes(user.position);
  const query = isReviewer
    ? 'SELECT * FROM exposure_form ORDER BY created_at DESC LIMIT 500'
    : 'SELECT * FROM exposure_form WHERE username = ? ORDER BY created_at DESC';
  const params = isReviewer ? [] : [user.email];

  try {
    const mobileResults = await queryDatabase(pool, query, params);
    const webResults = await queryDatabase(webPool, query, params);

    const exposureForms = tagOrigin(mobileResults, webResults);

    if (exposureForms.length > 0) {
      res.json(exposureForms);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error retrieving Rabies Exposure forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving Rabies Exposure forms' });
  }
});

// DELETE endpoint for Vaccination Forms
app.delete('/deleteVaccinationForm/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { dbOrigin } = req.query;

  const deleteQuery = 'DELETE FROM vaccination_form WHERE id = ?';

  try {
    if (!(await authorizeFormMutation(req, res, 'vaccination_form', id, dbOrigin))) return;
    await queryDatabase(pool, deleteQuery, [id]);
    console.log(`Vaccination form with ID ${id} deleted successfully`);
    res.json({ success: true, message: 'Vaccination form deleted successfully' });
  } catch (error) {
    console.error('Error deleting vaccination form:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the vaccination form' });
  }
});

// DELETE endpoint for Neuter Forms
app.delete('/deleteNeuterForm/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { dbOrigin } = req.query;

  const deleteQuery = 'DELETE FROM consent_form WHERE id = ?';

  try {
    if (!(await authorizeFormMutation(req, res, 'consent_form', id, dbOrigin))) return;
    await queryDatabase(pool, deleteQuery, [id]);
    console.log(`Neuter form with ID ${id} deleted successfully`);
    res.json({ success: true, message: 'Neuter form deleted successfully' });
  } catch (error) {
    console.error('Error deleting neuter form:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the neuter form' });
  }
});

// DELETE endpoint for Rabies Sample Forms
app.delete('/deleteRabiesSampleForm/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { dbOrigin } = req.query;

  const deleteQuery = 'DELETE FROM bite_form WHERE id = ?';

  try {
    if (!(await authorizeFormMutation(req, res, 'bite_form', id, dbOrigin))) return;
    await queryDatabase(pool, deleteQuery, [id]);
    console.log(`Rabies sample form with ID ${id} deleted successfully`);
    res.json({ success: true, message: 'Rabies sample form deleted successfully' });
  } catch (error) {
    console.error('Error deleting rabies sample form:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the rabies sample form' });
  }
});


// DELETE endpoint for Budget Forms
app.delete('/deleteBudgetForm/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { dbOrigin } = req.query;

  const deleteQuery = 'DELETE FROM budget_form WHERE id = ?';

  try {
    if (!(await authorizeFormMutation(req, res, 'budget_form', id, dbOrigin))) return;
    await queryDatabase(pool, deleteQuery, [id]);
    console.log(`Budget form with ID ${id} deleted successfully`);
    res.json({ success: true, message: 'Budget form deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget form:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the budget form' });
  }
});

// DELETE endpoint for Schedule Forms
app.delete('/deleteScheduleForm/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { dbOrigin } = req.query;

  const deleteQuery = 'DELETE FROM schedule_form WHERE id = ?';

  try {
    if (!(await authorizeFormMutation(req, res, 'schedule_form', id, dbOrigin))) return;
    await queryDatabase(pool, deleteQuery, [id]);
    console.log(`Schedule form with ID ${id} deleted successfully`);
    res.json({ success: true, message: 'Schedule form deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule form:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the schedule form' });
  }
});

// DELETE endpoint for IEC Forms
app.delete('/deleteIECForm/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { dbOrigin } = req.query;

  const deleteQuery = 'DELETE FROM iec_form WHERE id = ?';

  try {
    if (!(await authorizeFormMutation(req, res, 'iec_form', id, dbOrigin))) return;
    await queryDatabase(pool, deleteQuery, [id]);
    console.log(`IEC form with ID ${id} deleted successfully`);
    res.json({ success: true, message: 'IEC form deleted successfully' });
  } catch (error) {
    console.error('Error deleting IEC form:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the IEC form' });
  }
});

// DELETE endpoint for Animal Control Forms
app.delete('/deleteAnimalControlForm/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { dbOrigin } = req.query;

  const deleteQuery = 'DELETE FROM control_form WHERE id = ?';

  try {
    if (!(await authorizeFormMutation(req, res, 'control_form', id, dbOrigin))) return;
    await queryDatabase(pool, deleteQuery, [id]);
    console.log(`Animal control form with ID ${id} deleted successfully`);
    res.json({ success: true, message: 'Animal control form deleted successfully' });
  } catch (error) {
    console.error('Error deleting animal control form:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the animal control form' });
  }
});

// DELETE endpoint for Rabies Exposure Forms
app.delete('/deleteRabiesExposureForm/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { dbOrigin } = req.query;

  const deleteQuery = 'DELETE FROM exposure_form WHERE id = ?';

  try {
    if (!(await authorizeFormMutation(req, res, 'exposure_form', id, dbOrigin))) return;
    await queryDatabase(pool, deleteQuery, [id]);
    console.log(`Rabies Exposure form with ID ${id} deleted successfully`);
    res.json({ success: true, message: 'Rabies Exposure form deleted successfully' });
  } catch (error) {
    console.error('Error deleting rabies exposure form:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the rabies exposure form' });
  }
});

// Serve static files from a directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes to serve the files
app.get('/Vaccination_Report_form.xlsx', (req, res) => {
res.sendFile(path.join(__dirname, 'assets/templates/Vaccination_Report_form.xlsx'));
});

app.get('/Neuter_Report_form.xlsx', (req, res) => {
res.sendFile(path.join(__dirname, 'assets/templates/Neuter_Report_form.xlsx'));
});

app.get('/Rabies_Sample_Report_form.xlsx', (req, res) => {
res.sendFile(path.join(__dirname, 'assets/templates/Rabies_Sample_Report_form.xlsx'));
});

app.get('/IEC_Report_form.xlsx', (req, res) => {
res.sendFile(path.join(__dirname, 'assets/templates/IEC_Report_form.xlsx'));
});

app.get('/Daily_Report_form.xlsx', (req, res) => {
res.sendFile(path.join(__dirname, 'assets/templates/Daily_Report_form.xlsx'));
});

app.get('/Schedule_Report_form.xlsx', (req, res) => {
res.sendFile(path.join(__dirname, 'assets/templates/Schedule_Report_form.xlsx'));
});

app.get('/Budget_Report_form.xlsx', (req, res) => {
res.sendFile(path.join(__dirname, 'assets/templates/Budget_Report_form.xlsx'));
});

app.get('/Rabies_Exposure_Report_form.xlsx', (req, res) => {
res.sendFile(path.join(__dirname, 'assets/templates/Rabies_Exposure_Report_form.xlsx'));
});

const PORT = process.env.PORT || 3000;

// Only auto-start the server when this file is run directly (`node app.js`,
// which is exactly what `npm start`/Render do) — not when it's require()'d,
// e.g. from a test file via supertest, which drives the app in-process
// without needing it to actually bind a port.
if (require.main === module) {
  startServer(PORT);
}

module.exports = app;