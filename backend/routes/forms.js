const express = require('express');

const { pool, webPool, queryDatabase } = require('../db');
const { REVIEWER_POSITIONS } = require('../constants');
const { requireAuth, requireReviewer } = require('../middleware');
const {
  authorizeFormMutation, createSubmitHandler, createEditHandler,
  createPaginatedCvoListHandler, createScopedPaginatedListHandler,
} = require('../lib/formHelpers');

const router = express.Router();

//Forms
const VACCINATION_FIELDS = [
  'date', 'district', 'barangay', 'purok', 'vaccinator', 'timeStart', 'ownerName', 'address', 'sex', 'contactNo',
  'petName', 'petAge', 'species', 'petSex', 'color', 'cardNo', 'vaccine', 'source', 'dateVaccinated', 'timeFinish',
];
router.post('/submitVaccinationForm', requireAuth, createSubmitHandler('vaccination_form', 'Vaccination', VACCINATION_FIELDS));
router.post('/editVaccinationForm', requireAuth, createEditHandler('vaccination_form', 'Vaccination', VACCINATION_FIELDS));


const NEUTER_FIELDS = [
  'date', 'district', 'barangay', 'purok', 'proc', 'client', 'address', 'contactNo',
  'name', 'species', 'sex', 'breed', 'age', 'pets', 'cat',
];
router.post('/submitNeuterForm', requireAuth, createSubmitHandler('consent_form', 'Neuter', NEUTER_FIELDS));
router.post('/editNeuterForm', requireAuth, createEditHandler('consent_form', 'Neuter', NEUTER_FIELDS));

const RABIES_SAMPLE_FIELDS = [
  'name', 'sex', 'address', 'number', 'district', 'barangay', 'date', 'species', 'breed', 'age',
  'sampleSex', 'specimen', 'ownership', 'vacStatus', 'contact', 'manage', 'death', 'changes', 'otherillness', 'fatcount',
];
router.post('/submitRabiesSampleForms', requireAuth, createSubmitHandler('bite_form', 'Rabies Sample', RABIES_SAMPLE_FIELDS));
router.post('/editRabiesSampleForms', requireAuth, createEditHandler('bite_form', 'Rabies Sample', RABIES_SAMPLE_FIELDS));

// Add a new endpoint to fetch vaccination form data
router.get('/getVaccinationForms', async (req, res) => {
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
router.get('/getVaccinationFormsCVO', requireReviewer, createPaginatedCvoListHandler('vaccination_form', ['ownerName', 'petName', 'cardNo']));

// Add a new endpoint to fetch neuter form data
router.get('/getNeuterForms', async (req, res) => {
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
router.get('/getNeuterFormsCVO', requireReviewer, createPaginatedCvoListHandler('consent_form', ['client', 'name']));


// Add a new endpoint to fetch rabies sample form data
router.get('/getRabiesSampleForms', async (req, res) => {
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
router.get('/getRabiesSampleFormsCVO', requireReviewer, createPaginatedCvoListHandler('bite_form', ['name', 'number']));

const BUDGET_FIELDS = ['year', 'budget', 'costvax'];
router.post('/submitBudgetForm', requireAuth, createSubmitHandler('budget_form', 'Budget', BUDGET_FIELDS));
router.post('/editBudgetForm', requireAuth, createEditHandler('budget_form', 'Budget', BUDGET_FIELDS));

const WEATHER_FIELDS = [
  'minimum_temperature', 'maximum_temperature', 'mean_temperature', 'relative_humidity', 'rainfall', 'precipitation',
];
router.post('/submitWeatherForm', requireAuth, createSubmitHandler('weather_form', 'Weather', WEATHER_FIELDS));
// The old hand-written editWeatherForm handler mislabeled its success/error
// messages as "Schedule Form" (a copy-paste artifact) — using the shared
// factory here fixes that automatically.
router.post('/editWeatherForm', requireAuth, createEditHandler('weather_form', 'Weather', WEATHER_FIELDS));

const SCHEDULE_FIELDS = ['date', 'title', 'district', 'barangay', 'purok'];
router.post('/submitScheduleForm', requireAuth, createSubmitHandler('schedule_form', 'Schedule', SCHEDULE_FIELDS));
router.post('/editScheduleForm', requireAuth, createEditHandler('schedule_form', 'Schedule', SCHEDULE_FIELDS));

const IEC_FIELDS = ['date', 'title', 'district', 'barangay', 'purok', 'participants', 'brochure', 'materials'];
router.post('/submitIECForm', requireAuth, createSubmitHandler('iec_form', 'IEC', IEC_FIELDS));
router.post('/editIECForm', requireAuth, createEditHandler('iec_form', 'IEC', IEC_FIELDS));


const ANIMAL_CONTROL_FIELDS = ['date1', 'cageNum', 'impHeads', 'date2', 'claimedHeads', 'date3', 'euthHeads', 'date4', 'chief'];
router.post('/submitAnimalControlForm', requireAuth, createSubmitHandler('control_form', 'Animal Control', ANIMAL_CONTROL_FIELDS));
router.post('/editAnimalControlForm', requireAuth, createEditHandler('control_form', 'Animal Control', ANIMAL_CONTROL_FIELDS));

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
router.post('/submitRabiesExposureForm', requireAuth, createSubmitHandler('exposure_form', 'Rabies Exposure', RABIES_EXPOSURE_FIELDS, RABIES_EXPOSURE_REQUIRED_FIELDS));
router.post('/editRabiesExposureForm', requireAuth, createEditHandler('exposure_form', 'Rabies Exposure', RABIES_EXPOSURE_FIELDS, RABIES_EXPOSURE_REQUIRED_FIELDS));

// New endpoint to fetch control_form data from both mobile and web databases
router.get('/getAnimalControlForms', requireAuth, createScopedPaginatedListHandler('control_form', ['cageNum', 'chief']));

// New endpoint to fetch IEC forms data from both mobile and web databases
router.get('/getIECForms', requireAuth, createScopedPaginatedListHandler('iec_form', ['title', 'barangay']));

// New endpoint to fetch Schedule forms data from both mobile and web databases
router.get('/getScheduleForms', requireAuth, createScopedPaginatedListHandler('schedule_form', ['title', 'barangay']));

// New endpoint to fetch Budget forms data from both mobile and web databases
router.get('/getBudgetForms', requireAuth, createScopedPaginatedListHandler('budget_form', ['year']));

// Add a new endpoint to fetch weather form data
router.get('/getWeatherForms', requireAuth, async (req, res) => {
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
router.get('/getRabiesExposureForms', requireAuth, createScopedPaginatedListHandler('exposure_form', ['name', 'regNo']));

// DELETE endpoint for Vaccination Forms
router.delete('/deleteVaccinationForm/:id', requireAuth, async (req, res) => {
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
router.delete('/deleteNeuterForm/:id', requireAuth, async (req, res) => {
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
router.delete('/deleteRabiesSampleForm/:id', requireAuth, async (req, res) => {
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
router.delete('/deleteBudgetForm/:id', requireAuth, async (req, res) => {
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
router.delete('/deleteScheduleForm/:id', requireAuth, async (req, res) => {
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
router.delete('/deleteIECForm/:id', requireAuth, async (req, res) => {
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
router.delete('/deleteAnimalControlForm/:id', requireAuth, async (req, res) => {
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
router.delete('/deleteRabiesExposureForm/:id', requireAuth, async (req, res) => {
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

module.exports = router;
