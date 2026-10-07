require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const moment = require('moment'); // Import moment for date formatting

const { pool, webPool, queryDatabase } = require('./db');
const { REVIEWER_POSITIONS } = require('./constants');
const { requireAuth, requireReviewer } = require('./middleware');
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

// Auth/OTP routes (/register, /login, /logout, /userProfile, /resetpass,
// /registerotp, /validate-otp(-reg), /reset-password, /reset-forgotten-password)
// — see routes/auth.js. Second slice of the app.js-to-route-modules split,
// now that db.js/constants.js/middleware.js/lib/* give it the shared
// infrastructure it needs without redefining any of it.
app.use(require('./routes/auth'));

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
