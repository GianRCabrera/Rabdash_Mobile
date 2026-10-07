require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const moment = require('moment'); // Import moment for date formatting

const { pool, webPool, queryDatabase } = require('./db');

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

// Auth/OTP routes (/register, /login, /logout, /userProfile, /resetpass,
// /registerotp, /validate-otp(-reg), /reset-password, /reset-forgotten-password)
// — see routes/auth.js. Second slice of the app.js-to-route-modules split,
// now that db.js/constants.js/middleware.js/lib/* give it the shared
// infrastructure it needs without redefining any of it.
app.use(require('./routes/auth'));

// All 9 form types' submit*/edit*/get*/delete* routes — see routes/forms.js.
// Third (and largest) slice of the split; everything it needs (the
// create*Handler factories, authorizeFormMutation, the DB pools) already
// lives in db.js/constants.js/middleware.js/lib/formHelpers.js.
app.use(require('./routes/forms'));

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

// Serve static files from a directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes to serve the files — see routes/reportTemplates.js (first slice of
// the single-file-to-modules split: stateless, no DB/session dependency,
// lowest possible risk to prove out the extraction pattern first).
app.use(require('./routes/reportTemplates'));

const PORT = process.env.PORT || 3000;

// Only auto-start the server when this file is run directly (`node app.js`,
// which is exactly what `npm start`/Render do) — not when it's require()'d,
// e.g. from a test file via supertest, which drives the app in-process
// without needing it to actually bind a port.
if (require.main === module) {
  startServer(PORT);
}

module.exports = app;
