  const express = require('express');
  const session = require('express-session');
  const bodyParser = require('body-parser');
  const mysql = require('mysql');
  const cors = require('cors');
  const crypto = require('crypto');
  const moment = require('moment-timezone');
  const nodemailer = require('nodemailer'); // For sending reset password emails

  const app = express();
  const path = require('path');

  // Generate a random secret key
  const secretKey = crypto.randomBytes(64).toString('hex');

  app.use(cors());
  app.use(bodyParser.json());

  // Use the session middleware
  app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
  }));

  const dbConfig = {
    host: 'srv615.hstgr.io',
    user: 'u365573988_mobile321',
    password: 'Rabdogs123',
    database: 'u365573988_rabdash_mobile',
  };

  const pool = mysql.createPool(dbConfig);

  // Handle database queries with proper error handling
  const queryDatabase = (query, values) => {
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

  const registerUser = async (user) => {
    const { name, last_name, email, position, password } = user;
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updatedAt = createdAt;

    const query = `
      INSERT INTO users (name, last_name, email, position, password, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      await queryDatabase(query, [name, last_name, email, position, password, createdAt, updatedAt]);
      console.log('User registered successfully');
      return true;
    } catch (error) {
      console.error('Error during registration:', error);
      throw new Error('An error occurred during registration.');
    }
  };

  app.post('/register', async (req, res) => {
    try {
      const userRegistered = await registerUser(req.body);
      if (userRegistered) {
        req.session.user = req.body;
        res.json({ Message: 'User has been registered successfully' });
      }
    } catch (error) {
      res.json({ Message: 'An error occurred during registration.' });
    }
  });

  const LogIn = async (user) => {
    const { email, password } = user;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    try {
      const results = await queryDatabase(query, [email, password]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      throw error;
    }
  };
  
  app.post('/login', async (req, res) => {
    try {
      const user = await LogIn(req.body);
  
      if (user && user.position) {
        // Set the user information in the session upon successful login
        req.session.user = { email: user.email, position: user.position };
        res.json({ success: true, message: 'Login successful', position: user.position });
      } else {
        res.json({ success: false, message: 'Invalid email or password' });
      }
    } catch (error) {
      res.json({ success: false, message: 'An error occurred during login' });
    }
  });
  
  app.get('/userProfile', async (req, res) => {
    const { user } = req.session;
  
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
  
    const { email } = user;
    console.log('Fetching user profile for authenticated user:', email);
  
    const query = 'SELECT * FROM users WHERE email = ?';
    try {
      const results = await queryDatabase(query, [email]);
  
      if (results.length === 1) {
        const userProfile = results[0];
        console.log('User Profile:', userProfile);
        res.json(userProfile);
      } else {
        console.error('User not found in the database');
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error retrieving user profile:', error);
      res.status(500).json({ message: 'An error occurred while retrieving user profile' });
    }
  });

app.post('/submitVaccinationForm', async (req, res) => {
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

  const insertQuery = `
    INSERT INTO vaccination_form
    (username, date, district, barangay, purok, vaccinator, timeStart, ownerName, address, sex, contactNo,
      petName, petAge, species, petSex, color, cardNo,
      vaccine, source, dateVaccinated, timeFinish,  created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  try {
    const result = await queryDatabase(insertQuery, [
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

  try {
    await queryDatabase(updateQuery, [
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

app.post('/submitNeuterForm', async (req, res) => {
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

  const insertQuery = `
    INSERT INTO consent_form
    (username, date, district, barangay, purok, proc, client, address, contactNo, name, species,
    sex, breed, age, pets, cat, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const result = await queryDatabase(insertQuery, [
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

  try {
    await queryDatabase(updateQuery, [
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

app.post('/submitRabiesSampleForms', async (req, res) => {
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

  const insertQuery = `
    INSERT INTO bite_form
    (username, name, sex, address, number, district, barangay, date, species, breed, age,
      sampleSex, specimen, ownership, vacStatus, contact, manage, death, changes, otherillness, fatcount, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const result = await queryDatabase(insertQuery, [
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

  try {
    await queryDatabase(updateQuery, [
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

  const query = 'SELECT * FROM vaccination_form WHERE username = ?';

  try {
    const results = await queryDatabase(query, [username]);

    if (results.length > 0) {
       // Adjust each date in the results
       const adjustedResults = results.map(result => {
        if (result.date) {
          result.date = moment(result.date).tz('UTC').format('YYYY-MM-DD');
        }
        if (result.dateVaccinated) {
          result.dateVaccinated = moment(result.dateVaccinated).tz('UTC').format('YYYY-MM-DD');
        }
        return result;
      });
      console.log('Vaccination Forms:', adjustedResults);
      res.json(adjustedResults);
      // const vaccinationForms = results;
      // console.log('Vaccination Forms:', vaccinationForms);
      // res.json(vaccinationForms);
    } else {
      console.error('No vaccination forms found in the database');
      res.status(404).json({ message: 'No vaccination forms found' });
    }
  } catch (error) {
    console.error('Error retrieving vaccination forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving vaccination forms' });
  }
});

// Add a new endpoint to fetch vaccination form data
app.get('/getVaccinationFormsCVO', async (req, res) => {
  const query = 'SELECT * FROM vaccination_form';

  try {
    const results = await queryDatabase(query);

    if (results.length > 0) {
      const vaccinationForms = results;
      console.log('Vaccination Forms:', vaccinationForms);
      res.json(vaccinationForms);
    } else {
      console.error('No vaccination forms found in the database');
      res.status(404).json({ message: 'No vaccination forms found' });
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

  const username = user.email; // Use the user's email as the username
  console.log('Username:', username);

  const query = 'SELECT * FROM consent_form WHERE username = ?';

  try {
    const results = await queryDatabase(query, [username]);

    if (results.length > 0) {
      const neuterForms = results;
      console.log('Neuter Forms:', neuterForms);
      res.json(neuterForms);
    } else {
      console.error('No neuter forms found in the database');
      res.status(404).json({ message: 'No neuter forms found' });
    }
  } catch (error) {
    console.error('Error retrieving neuter forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving neuter forms' });
  }
});

// Add a new endpoint to fetch neuter form data
app.get('/getNeuterFormsCVO', async (req, res) => {

  const query = 'SELECT * FROM consent_form';

  try {
    const results = await queryDatabase(query);

    if (results.length > 0) {
      const neuterForms = results;
      console.log('Nueter Forms:', neuterForms);
      res.json(neuterForms);
    } else {
      console.error('No neuter forms found in the database');
      res.status(404).json({ message: 'No neuter forms found' });
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

  const query = 'SELECT * FROM bite_form WHERE username = ?';

  try {
    const results = await queryDatabase(query, [username]);

    if (results.length > 0) {
      const RabiesSampleForms = results;
      console.log('Rabies Sample Forms:', RabiesSampleForms);
      res.json(RabiesSampleForms);
    } else {
      console.error('No rabies sample forms found in the database');
      res.status(404).json({ message: 'No rabies sample forms found' });
    }
  } catch (error) {
    console.error('Error retrieving rabies sample forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving rabies sample forms' });
  }
});

// Add a new endpoint to fetch rabies sample form data
app.get('/getRabiesSampleFormsCVO', async (req, res) => {
  const query = 'SELECT * FROM bite_form';

  try {
    const results = await queryDatabase(query);

    if (results.length > 0) {
      const RabiesSampleForms = results;
      console.log('Rabies Sample Forms:', RabiesSampleForms);
      res.json(RabiesSampleForms);
    } else {
      console.error('No rabies sample forms found in the database');
      res.status(404).json({ message: 'No rabies sample forms found' });
    }
  } catch (error) {
    console.error('Error retrieving rabies sample forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving rabies sample forms' });
  }
});

app.post('/submitBudgetForm', async (req, res) => {
  const { user } = req.session;
  const username = user.email;
  console.log('Username:', username);

  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const updatedAt = createdAt;

  const {
    year,
    budget,
    costvax,
  } = req.body;

  const insertQuery = `
    INSERT INTO budget_form
    (username, year, budget, costvax, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    const result = await queryDatabase(insertQuery, [
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

  try {
    await queryDatabase(updateQuery, [
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

app.post('/submitWeatherForm', async (req, res) => {
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

  console.log('Received Weather Form Data:', req.body);

  // Insert data into the weather_form table using parameterized query
  const insertQuery = `
    INSERT INTO weather_form
    (username, minimum_temperature, maximum_temperature, mean_temperature, relative_humidity, rainfall, precipitation, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const result = await queryDatabase(insertQuery, [
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

app.post('/editWeatherForm', async (req, res) => {
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

  try {
    await queryDatabase(updateQuery, [
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
  const username = user.email;
  console.log('Username:', username);

  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const updatedAt = createdAt;

  const {
    date,
    title,
    district,
    barangay,
    purok,
  } = req.body;

  console.log('Received Schedule Form Data:', req.body);

  // Insert data into the iec_form table using parameterized query
  const insertQuery = `
    INSERT INTO schedule_form
    (username, date, title, district, barangay, purok, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const result = await queryDatabase(insertQuery, [
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

  try {
    await queryDatabase(updateQuery, [
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
  const username = user.email;
  console.log('Username:', username);

  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const updatedAt = createdAt;

  const {
    date,
    title,
    district,
    barangay,
    purok,
    participants,
    brochure,
    materials
  } = req.body;

  console.log('Received IEC Form Data:', req.body);

  // Insert data into the iec_form table using parameterized query
  const insertQuery = `
    INSERT INTO iec_form
    (username, date, title, district, barangay, purok, participants, brochure, materials, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const result = await queryDatabase(insertQuery, [
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

  try {
    await queryDatabase(updateQuery, [
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

  console.log('Received Animal Control Form Data:', req.body);

  // Insert data into the Animal_Control_form table using parameterized query
  const vaccinationFormQuery = `
    INSERT INTO control_form
    (username, date1, cageNum, impHeads, date2, claimedHeads, date3, euthHeads, date4, chief, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await queryDatabase(vaccinationFormQuery, [
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
    date1=?, cageNum=?,impHeads=?, date2=?, claimedHeads=?, date3=?, euthHeads=?, date4=?, chief=?,
    updated_at=? WHERE id=?
  `;

  try {
    await queryDatabase(updateQuery, [
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

  console.log('Received Rabies Exposure Form Data:', req.body);

  // Insert data into the vaccination_form table
  const vaccinationFormQuery = `
    INSERT INTO exposure_form
    (username, regNo, regDate, name, address, age, sex, expDate, place, typeAnimal, typeBNB,
     site, category, washing, RIG, route, d0, d3, d7, d14, d28, brand, outcome, bitingStatus, remarks, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await queryDatabase(vaccinationFormQuery, [
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

  try {
    await queryDatabase(updateQuery, [
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

app.get('/Position', async (req, res) => {
  const { user } = req.session;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const { email } = user;
  console.log('Fetching user profile for authenticated user:', email);

  const query = 'SELECT position FROM users WHERE email = ?'; // Select only the position column
  try {
    const results = await queryDatabase(query, [email]);

    if (results.length === 1) {
      const { position } = results[0]; // Extract the position from the first (and only) result
      console.log('User Position:', position);
      res.json({ position }); // Return only the position
    } else {
      console.error('User not found in the database');
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error retrieving user position:', error);
    res.status(500).json({ message: 'An error occurred while retrieving user position' });
  }
});

  const startServer = (port) => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  };

 // Add a new endpoint to fetch vaccination form data
app.get('/getAnimalControlForms', async (req, res) => {
  const query = 'SELECT * FROM control_form';

  try {
    const results = await queryDatabase(query);

    if (results.length > 0) {
      const vaccinationForms = results;
      console.log('Animal Control and Rehabilitation Daily Report Forms:', vaccinationForms);
      res.json(vaccinationForms);
    } else {
      console.error('No Animal Control and Rehabilitation Daily Report forms found in the database');
      res.status(404).json({ message: 'No Animal Control and Rehabilitation Daily Report forms found' });
    }
  } catch (error) {
    console.error('Error retrieving Animal Control and Rehabilitation Daily Report forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving Animal Control and Rehabilitation Daily Report forms' });
  }
});

// Add a new endpoint to fetch vaccination form data
app.get('/getIECForms', async (req, res) => {
  const query = 'SELECT * FROM iec_form';

  try {
    const results = await queryDatabase(query);

    if (results.length > 0) {
      const vaccinationForms = results;
      console.log('IEC Report Forms:', vaccinationForms);
      res.json(vaccinationForms);
    } else {
      console.error('No IEC forms found in the database');
      res.status(404).json({ message: 'No IEC Report forms found' });
    }
  } catch (error) {
    console.error('Error retrieving IEC Report forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving IEC Report forms' });
  }
});

// Add a new endpoint to fetch vaccination form data
app.get('/getScheduleForms', async (req, res) => {
  const query = 'SELECT * FROM schedule_form';

  try {
    const results = await queryDatabase(query);

    if (results.length > 0) {
      const vaccinationForms = results;
      console.log('Schedule Forms:', vaccinationForms);
      res.json(vaccinationForms);
    } else {
      console.error('No Schedule forms found in the database');
      res.status(404).json({ message: 'No Schedule Report forms found' });
    }
  } catch (error) {
    console.error('Error retrieving Schedule Report forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving Schedule Report forms' });
  }
});

// Add a new endpoint to fetch vaccination form data
app.get('/getBudgetForms', async (req, res) => {
  const query = 'SELECT * FROM budget_form';

  try {
    const results = await queryDatabase(query);

    if (results.length > 0) {
      const vaccinationForms = results;
      console.log('Budget Forms:', vaccinationForms);
      res.json(vaccinationForms);
    } else {
      console.error('No Budget forms found in the database');
      res.status(404).json({ message: 'No Budget Report forms found' });
    }
  } catch (error) {
    console.error('Error retrieving Budget Report forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving Budget Report forms' });
  }
});

// Add a new endpoint to fetch vaccination form data
app.get('/getWeatherForms', async (req, res) => {
  const query = 'SELECT * FROM weather_form';

  try {
    const results = await queryDatabase(query);

    if (results.length > 0) {
      const vaccinationForms = results;
      console.log('Weather Forms:', vaccinationForms);
      res.json(vaccinationForms);
    } else {
      console.error('No Weather forms found in the database');
      res.status(404).json({ message: 'No Weather Report forms found' });
    }
  } catch (error) {
    console.error('Error retrieving Weather Report forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving Weather Report forms' });
  }
});

// Add a new endpoint to fetch vaccination form data
app.get('/getRabiesExposureForms', async (req, res) => {
  const query = 'SELECT * FROM exposure_form';

  try {
    const results = await queryDatabase(query);

    if (results.length > 0) {
      const vaccinationForms = results;
      console.log('Rabies Exposure Forms:', vaccinationForms);
      res.json(vaccinationForms);
    } else {
      console.error('No Rabies Exposure forms found in the database');
      res.status(404).json({ message: 'No Rabies Exposure forms found' });
    }
  } catch (error) {
    console.error('Error retrieving Rabies Exposure forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving Rabies Exposure forms' });
  }
});

// DELETE endpoint for Vaccination Forms
app.delete('/deleteVaccinationForm/:id', async (req, res) => {
  const { id } = req.params;

  const deleteQuery = 'DELETE FROM vaccination_form WHERE id = ?';

  try {
    await queryDatabase(deleteQuery, [id]);
    console.log(`Vaccination form with ID ${id} deleted successfully`);
    res.json({ success: true, message: 'Vaccination form deleted successfully' });
  } catch (error) {
    console.error('Error deleting vaccination form:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the vaccination form' });
  }
});

// DELETE endpoint for Neuter Forms
app.delete('/deleteNeuterForm/:id', async (req, res) => {
  const { id } = req.params;

  const deleteQuery = 'DELETE FROM consent_form WHERE id = ?';

  try {
    await queryDatabase(deleteQuery, [id]);
    console.log(`Neuter form with ID ${id} deleted successfully`);
    res.json({ success: true, message: 'Neuter form deleted successfully' });
  } catch (error) {
    console.error('Error deleting neuter form:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the neuter form' });
  }
});

// DELETE endpoint for Rabies Sample Forms
app.delete('/deleteRabiesSampleForm/:id', async (req, res) => {
  const { id } = req.params;

  const deleteQuery = 'DELETE FROM bite_form WHERE id = ?';

  try {
    await queryDatabase(deleteQuery, [id]);
    console.log(`Rabies Sample form with ID ${id} deleted successfully`);
    res.json({ success: true, message: 'Rabies Sample form deleted successfully' });
  } catch (error) {
    console.error('Error deleting rabies sample form:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the rabies sample form' });
  }
});

// DELETE endpoint for Budget Forms
app.delete('/deleteBudgetForm/:id', async (req, res) => {
  const { id } = req.params;

  const deleteQuery = 'DELETE FROM budget_form WHERE id = ?';

  try {
    const result = await queryDatabase(deleteQuery, [id]);
    if (result.affectedRows > 0) {
      console.log(`Budget form with ID ${id} deleted successfully`);
      res.json({ success: true, message: 'Budget form deleted successfully' });
    } else {
      console.error(`No Budget form found with ID ${id}`);
      res.status(404).json({ success: false, message: 'No Budget form found with the given ID' });
    }
  } catch (error) {
    console.error('Error deleting budget form:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the budget form' });
  }
});

// DELETE endpoint for Schedule Forms
app.delete('/deleteScheduleForm/:id', async (req, res) => {
  const { id } = req.params;

  const deleteQuery = 'DELETE FROM schedule_form WHERE id = ?';

  try {
    await queryDatabase(deleteQuery, [id]);
    console.log(`Schedule form with ID ${id} deleted successfully`);
    res.json({ success: true, message: 'Schedule form deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule form:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the schedule form' });
  }
});

// DELETE endpoint for IEC Forms
app.delete('/deleteIECForm/:id', async (req, res) => {
  const { id } = req.params;

  const deleteQuery = 'DELETE FROM iec_form WHERE id = ?';

  try {
    await queryDatabase(deleteQuery, [id]);
    console.log(`IEC form with ID ${id} deleted successfully`);
    res.json({ success: true, message: 'IEC form deleted successfully' });
  } catch (error) {
    console.error('Error deleting IEC form:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the IEC form' });
  }
});

// DELETE endpoint for Animal Control Forms
app.delete('/deleteAnimalControlForm/:id', async (req, res) => {
  const { id } = req.params;

  const deleteQuery = 'DELETE FROM control_form WHERE id = ?';

  try {
    await queryDatabase(deleteQuery, [id]);
    console.log(`Animal Control form with ID ${id} deleted successfully`);
    res.json({ success: true, message: 'Animal Control form deleted successfully' });
  } catch (error) {
    console.error('Error deleting animal control form:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the animal control form' });
  }
});

// DELETE endpoint for Rabies Exposure Forms
app.delete('/deleteRabiesExposureForm/:id', async (req, res) => {
  const { id } = req.params;

  const deleteQuery = 'DELETE FROM exposure_form WHERE id = ?';

  try {
    await queryDatabase(deleteQuery, [id]);
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

app.get('/Rabies_Sample_Report_form.xlsx', (req, res) => {
  res.sendFile(path.join(__dirname, 'assets/templates/Rabies_Sample_Report_form.xlsx'));
});

app.get('/IEC_Report_form.xlsx', (req, res) => {
  res.sendFile(path.join(__dirname, 'assets/templates/IEC_Report_formx.lsx'));
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
startServer(PORT);
