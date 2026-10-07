require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const moment = require('moment'); // Import moment for date formatting
const bcrypt = require('bcrypt'); // Still used directly below (registerUser, /reset-password, /reset-forgotten-password) — verifyPassword itself lives in ./lib/passwords now.

const { pool, webPool, queryDatabase } = require('./db');
const { REVIEWER_POSITIONS, SELF_REGISTERABLE_POSITIONS } = require('./constants');
const { requireAuth, requireReviewer, authLimiter, loginAccountLimiter } = require('./middleware');
const { verifyPassword, saltRounds } = require('./lib/passwords');
const { transporter } = require('./lib/mailer');
const {
  generateOTP, upsertOtp, getOtp, deleteOtp, isOtpUsable, makeOtpValidator,
} = require('./lib/otp');
const {
  authorizeFormMutation, createSubmitHandler, createEditHandler,
  createPaginatedCvoListHandler, createScopedPaginatedListHandler,
} = require('./lib/formHelpers');

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

app.post('/login', authLimiter, loginAccountLimiter, async (req, res) => {
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
app.post('/reset-password', authLimiter, loginAccountLimiter, async (req, res) => {
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
const VACCINATION_FIELDS = [
  'date', 'district', 'barangay', 'purok', 'vaccinator', 'timeStart', 'ownerName', 'address', 'sex', 'contactNo',
  'petName', 'petAge', 'species', 'petSex', 'color', 'cardNo', 'vaccine', 'source', 'dateVaccinated', 'timeFinish',
];
app.post('/submitVaccinationForm', requireAuth, createSubmitHandler('vaccination_form', 'Vaccination', VACCINATION_FIELDS));
app.post('/editVaccinationForm', requireAuth, createEditHandler('vaccination_form', 'Vaccination', VACCINATION_FIELDS));


const NEUTER_FIELDS = [
  'date', 'district', 'barangay', 'purok', 'proc', 'client', 'address', 'contactNo',
  'name', 'species', 'sex', 'breed', 'age', 'pets', 'cat',
];
app.post('/submitNeuterForm', requireAuth, createSubmitHandler('consent_form', 'Neuter', NEUTER_FIELDS));
app.post('/editNeuterForm', requireAuth, createEditHandler('consent_form', 'Neuter', NEUTER_FIELDS));

const RABIES_SAMPLE_FIELDS = [
  'name', 'sex', 'address', 'number', 'district', 'barangay', 'date', 'species', 'breed', 'age',
  'sampleSex', 'specimen', 'ownership', 'vacStatus', 'contact', 'manage', 'death', 'changes', 'otherillness', 'fatcount',
];
app.post('/submitRabiesSampleForms', requireAuth, createSubmitHandler('bite_form', 'Rabies Sample', RABIES_SAMPLE_FIELDS));
app.post('/editRabiesSampleForms', requireAuth, createEditHandler('bite_form', 'Rabies Sample', RABIES_SAMPLE_FIELDS));

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
app.get('/getVaccinationFormsCVO', requireReviewer, createPaginatedCvoListHandler('vaccination_form', ['ownerName', 'petName', 'cardNo']));

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
app.get('/getNeuterFormsCVO', requireReviewer, createPaginatedCvoListHandler('consent_form', ['client', 'name']));


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
app.get('/getRabiesSampleFormsCVO', requireReviewer, createPaginatedCvoListHandler('bite_form', ['name', 'number']));

const BUDGET_FIELDS = ['year', 'budget', 'costvax'];
app.post('/submitBudgetForm', requireAuth, createSubmitHandler('budget_form', 'Budget', BUDGET_FIELDS));
app.post('/editBudgetForm', requireAuth, createEditHandler('budget_form', 'Budget', BUDGET_FIELDS));

const WEATHER_FIELDS = [
  'minimum_temperature', 'maximum_temperature', 'mean_temperature', 'relative_humidity', 'rainfall', 'precipitation',
];
app.post('/submitWeatherForm', requireAuth, createSubmitHandler('weather_form', 'Weather', WEATHER_FIELDS));
// The old hand-written editWeatherForm handler mislabeled its success/error
// messages as "Schedule Form" (a copy-paste artifact) — using the shared
// factory here fixes that automatically.
app.post('/editWeatherForm', requireAuth, createEditHandler('weather_form', 'Weather', WEATHER_FIELDS));

const SCHEDULE_FIELDS = ['date', 'title', 'district', 'barangay', 'purok'];
app.post('/submitScheduleForm', requireAuth, createSubmitHandler('schedule_form', 'Schedule', SCHEDULE_FIELDS));
app.post('/editScheduleForm', requireAuth, createEditHandler('schedule_form', 'Schedule', SCHEDULE_FIELDS));

const IEC_FIELDS = ['date', 'title', 'district', 'barangay', 'purok', 'participants', 'brochure', 'materials'];
app.post('/submitIECForm', requireAuth, createSubmitHandler('iec_form', 'IEC', IEC_FIELDS));
app.post('/editIECForm', requireAuth, createEditHandler('iec_form', 'IEC', IEC_FIELDS));


const ANIMAL_CONTROL_FIELDS = ['date1', 'cageNum', 'impHeads', 'date2', 'claimedHeads', 'date3', 'euthHeads', 'date4', 'chief'];
app.post('/submitAnimalControlForm', requireAuth, createSubmitHandler('control_form', 'Animal Control', ANIMAL_CONTROL_FIELDS));
app.post('/editAnimalControlForm', requireAuth, createEditHandler('control_form', 'Animal Control', ANIMAL_CONTROL_FIELDS));

// Add a new endpoint to handle form data
const RABIES_EXPOSURE_FIELDS = [
  'regNo', 'regDate', 'name', 'address', 'age', 'sex', 'expDate', 'place', 'typeAnimal', 'typeBNB',
  'site', 'category', 'washing', 'RIG', 'route', 'd0', 'd3', 'd7', 'd14', 'd28', 'brand', 'outcome', 'bitingStatus', 'remarks',
];
// RIG, route, and the d0/d3/d7/d14/d28 dose dates are deliberately excluded from
// the required set — this form's own frontend validation doesn't require them
// either, since a case can be registered before its full multi-week
// vaccination schedule and outcome are known. Edits still overwrite every
// column above (including these), same as before.
const RABIES_EXPOSURE_REQUIRED_FIELDS = [
  'regNo', 'regDate', 'name', 'address', 'age', 'sex', 'expDate', 'place', 'typeAnimal', 'typeBNB',
  'site', 'category', 'washing', 'brand', 'outcome', 'bitingStatus', 'remarks',
];
app.post('/submitRabiesExposureForm', requireAuth, createSubmitHandler('exposure_form', 'Rabies Exposure', RABIES_EXPOSURE_FIELDS, RABIES_EXPOSURE_REQUIRED_FIELDS));
app.post('/editRabiesExposureForm', requireAuth, createEditHandler('exposure_form', 'Rabies Exposure', RABIES_EXPOSURE_FIELDS, RABIES_EXPOSURE_REQUIRED_FIELDS));

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
app.get('/getAnimalControlForms', requireAuth, createScopedPaginatedListHandler('control_form', ['cageNum', 'chief']));

// New endpoint to fetch IEC forms data from both mobile and web databases
app.get('/getIECForms', requireAuth, createScopedPaginatedListHandler('iec_form', ['title', 'barangay']));

// New endpoint to fetch Schedule forms data from both mobile and web databases
app.get('/getScheduleForms', requireAuth, createScopedPaginatedListHandler('schedule_form', ['title', 'barangay']));

// New endpoint to fetch Budget forms data from both mobile and web databases
app.get('/getBudgetForms', requireAuth, createScopedPaginatedListHandler('budget_form', ['year']));

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
app.get('/getRabiesExposureForms', requireAuth, createScopedPaginatedListHandler('exposure_form', ['name', 'regNo']));

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
