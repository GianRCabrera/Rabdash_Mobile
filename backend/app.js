const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const crypto = require('crypto');
const moment = require('moment-timezone');
const nodemailer = require('nodemailer'); // For sending reset password emails
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const saltRounds = 8; // You can adjust the number of salt rounds as needed

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
  connectionLimit: 10,
  acquireTimeout: 30000,
  waitForConnections: true,
  queueLimit: 0
};

const webDbConfig = {
  host: 'srv615.hstgr.io',
  user: 'u365573988_rabdash',
  password: 'Forrabdash1',
  database: 'u365573988_rabdashdb',
  connectionLimit: 10,
  acquireTimeout: 30000,
  waitForConnections: true,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);        //Pool for mobile application
const webPool = mysql.createPool(webDbConfig);  //Pool for web application 

function handleDisconnect(pool) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      setTimeout(() => handleDisconnect(pool), 2000); // Retry after 2 seconds
    } else if (connection) {
      connection.release();
    }
  });

  pool.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect(pool); // Reconnect if connection was lost
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

const registerUser = async (user, pool) => {
  const { name, last_name, email, position, password } = user;
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const updatedAt = createdAt;

  try {
    //HASH PART
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (name, last_name, email, position, password, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await queryDatabase(pool, query, [name, last_name, email, position, hashedPassword, createdAt, updatedAt]);
    console.log('User registered successfully');
    return true;
  } catch (error) {
    console.error('Error during registration:', error);
    throw new Error('An error occurred during registration.');
  }
};

app.post('/register', async (req, res) => {
  try {
    const userRegistered = await registerUser(req.body, pool);
    if (userRegistered) {
      req.session.user = req.body;
      res.json({ success: true, message: 'User has been registered successfully' });
    }
  } catch (error) {
    res.json({ success: false, message: 'An error occurred during registration.' });
  }
});

const logInUser = async (user, pool) => {
  const { email, password } = user;
  const query = 'SELECT * FROM users WHERE email = ?';
  try {
    const results = await queryDatabase(pool, query, [email]);
    if (results.length > 0) {
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        return user;
      }
    }
    return null;
  } catch (error) {
    throw error;
  }
};

app.post('/login', async (req, res) => {
  try {
    let user = await logInUser(req.body, pool);

    if (!user) {
      user = await logInUser(req.body, webPool);
    }

    if (user && user.position) {
      req.session.user = { email: user.email, position: user.position };
      console.log('Session set:', req.session.user); // Log the session data
      res.json({ success: true, message: 'Login successful', position: user.position });
    } else {
      res.json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
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
    const results = await queryDatabase(pool, query, [email]);

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

// Configure Nodemailer with Hostinger SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com', // Replace with your Hostinger SMTP server
  port: 465, // Typically 587 or 465
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'admin@rabdash.com', // Your email address
    pass: 'Forrabdash1!', // Your email password
  },
});

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const otpStore = {};

//OTP for reset Password
app.post('/resetpass', async (req, res) => {
  const { email } = req.body;
  
  // Generate OTP (You can define generateOTP function as per your logic)
  const otp = generateOTP();

  // Store OTP with expiration time (in milliseconds)
  otpStore[email] = {
    otp,
    expiry: Date.now() + 3600000, // OTP expires in 1 hour
  };

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
    res.json({ success: true, message: 'Password reset OTP sent successfully.', otp });
  } catch (error) {
    console.error('Error sending email:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send password reset OTP.' });
  }
});


// Register route with OTP generation and email sending
app.post('/registerotp', async (req, res) => {
  const { name, last_name, email, position, password } = req.body;

  try {
    // Generate OTP
    const otp = generateOTP();
    otpStore[email] = {
      otp,
      expiry: Date.now() + 3600000, // OTP expires in 1 hour
    };

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

// Validate OTP endpoint
app.post('/validate-otp', async (req, res) => {
  const { email, otp } = req.body;
  const storedOtp = otpStore[email];

  console.log(`Validating OTP for ${email}: received ${otp}, stored ${storedOtp ? storedOtp.otp : 'none'}`);

  if (storedOtp && storedOtp.otp === otp && storedOtp.expiry > Date.now()) {
    res.json({ success: true, message: 'OTP is valid.' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
  }
});

// Validate OTP for registration endpoint
app.post('/validate-otp-reg', async (req, res) => {
  const { email, otp } = req.body;
  const storedOtp = otpStore[email];

  console.log(`Validating OTP for ${email}: received ${otp}, stored ${storedOtp ? storedOtp.otp : 'none'}`);

  if (storedOtp && storedOtp.otp === otp && storedOtp.expiry > Date.now()) {
    res.json({ success: true, message: 'OTP is valid.' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
  }
});

// Reset Password Functionality
app.post('/reset-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  console.log('Received reset password request:', { email, oldPassword, newPassword });

  if (!email || !oldPassword || !newPassword) {
    console.log('Missing fields:', { email, oldPassword, newPassword });
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    console.log('Querying database for user with email:', email);
    const results = await queryDatabase(pool, 'SELECT * FROM users WHERE email = ?', [email]);

    if (results.length === 0) {
      console.log('User not found for email:', email);
      return res.status(400).json({ success: false, message: 'User not found.' });
    }

    const user = results[0];
    console.log('User found:', user);

    console.log('Stored password:', user.password);

    console.log('Comparing old password...');
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    console.log('Password match result:', passwordMatch);

    if (!passwordMatch) {
      console.log('Old password is incorrect for user:', email);
      return res.status(400).json({ success: false, message: 'Old password is incorrect.' });
    }

    console.log('Old password matched.');

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    console.log('Updating user password in database...');
    await queryDatabase(pool, 'UPDATE users SET password = ? WHERE email = ?', [hashedNewPassword, email]);
    console.log('Password updated successfully for user:', email);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error during password reset:', error.message);
    res.status(500).json({ success: false, message: 'Database error.' });
  }
});

//Forms
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

  try {
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

  try {
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

  try {
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

  const query = 'SELECT * FROM vaccination_form WHERE username = ?';

  try {
    const results = await queryDatabase(pool, query, [username]);

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
    } else {
      console.error('No vaccination forms found in the database');
      res.status(404).json({ message: 'No vaccination forms found' });
    }
  } catch (error) {
    console.error('Error retrieving vaccination forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving vaccination forms' });
  }
});

// New endpoint to fetch vaccination_form data from both mobile and web databases
app.get('/getVaccinationFormsCVO', async (req, res) => {
  const { user } = req.session;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const query = 'SELECT * FROM vaccination_form LIMIT ? OFFSET ?';

  try {
    const mobileResults = await queryDatabase(pool, query, [parseInt(limit), parseInt(offset)]);
    const webResults = await queryDatabase(webPool, query, [parseInt(limit), parseInt(offset)]);

    const vaccinationForms = [...mobileResults, ...webResults];

    if (vaccinationForms.length > 0) {
      console.log('Vaccination Forms:', vaccinationForms);
      res.json(vaccinationForms);
    } else {
      console.error('No vaccination forms found in the databases');
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

  const username = user.email;
  console.log('Username:', username);

  const query = 'SELECT * FROM consent_form WHERE username = ?';

  try {
    const results = await queryDatabase(pool, query, [username]);

    if (results.length > 0) {
      const adjustedResults = results.map(result => {
        if (result.date) {
          result.date = moment(result.date).tz('UTC').format('YYYY-MM-DD');
        }
        return result;
      });
      console.log('Neuter Forms:', adjustedResults);
      res.json(adjustedResults);
    } else {
      console.error('No neuter forms found in the database');
      res.status(404).json({ message: 'No neuter forms found' });
    }
  } catch (error) {
    console.error('Error retrieving neuter forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving neuter forms' });
  }
});

// New endpoint to fetch neuter form data from both mobile and web databases
app.get('/getNeuterFormsCVO', async (req, res) => {
  const { user } = req.session;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const query = 'SELECT * FROM consent_form LIMIT ? OFFSET ?';

  try {
    const mobileResults = await queryDatabase(pool, query, [parseInt(limit), parseInt(offset)]);
    const webResults = await queryDatabase(webPool, query, [parseInt(limit), parseInt(offset)]);

    const neuterForms = [...mobileResults, ...webResults];

    if (neuterForms.length > 0) {
      console.log('Neuter Forms:', neuterForms);
      res.json(neuterForms);
    } else {
      console.error('No neuter forms found in the databases');
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

// Add a new endpoint to fetch rabies sample form data from both mobile and web databases
app.get('/getRabiesSampleFormsCVO', async (req, res) => {
  const { user } = req.session;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const query = 'SELECT * FROM bite_form LIMIT ? OFFSET ?';

  try {
    const mobileResults = await queryDatabase(pool, query, [parseInt(limit), parseInt(offset)]);
    const webResults = await queryDatabase(webPool, query, [parseInt(limit), parseInt(offset)]);

    const rabiesSampleForms = [...mobileResults, ...webResults];

    if (rabiesSampleForms.length > 0) {
      console.log('Rabies Sample Forms:', rabiesSampleForms);
      res.json(rabiesSampleForms);
    } else {
      console.error('No rabies sample forms found in the databases');
      res.status(404).json({ message: 'No rabies sample forms found' });
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

  try {
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
  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const username = user.email;
  console.log('Username:', username);

  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const updatedAt = createdAt;

  const { date, title, district, barangay, purok } = req.body;

  console.log('Received Schedule Form Data:', req.body);

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

  try {
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

  console.log('Received IEC Form Data:', req.body);

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

  try {
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

  console.log('Received Animal Control Form Data:', req.body);

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

  try {
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

  console.log('Received Rabies Exposure Form Data:', req.body);

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

  try {
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

//Position Endpoint
app.get('/Position', async (req, res) => {
  const { user } = req.session;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const { email } = user;
  console.log('Fetching user profile for authenticated user:', email);

  const query = 'SELECT position FROM users WHERE email = ?';
  try {
    const results = await queryDatabase(pool, query, [email]);

    if (results.length === 1) {
      const { position } = results[0];
      console.log('User Position:', position);
      res.json({ position });
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

// New endpoint to fetch control_form data from both mobile and web databases
app.get('/getAnimalControlForms', async (req, res) => {
  const query = 'SELECT * FROM control_form';

  try {
    const mobileResults = await queryDatabase(pool, query);
    const webResults = await queryDatabase(webPool, query);

    const controlForms = [...mobileResults, ...webResults];

    if (controlForms.length > 0) {
      console.log('Animal Control and Rehabilitation Daily Report Forms:', controlForms);
      res.json(controlForms);
    } else {
      console.error('No Animal Control and Rehabilitation Daily Report forms found in the databases');
      res.status(404).json({ message: 'No Animal Control and Rehabilitation Daily Report forms found' });
    }
  } catch (error) {
    console.error('Error retrieving Animal Control and Rehabilitation Daily Report forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving Animal Control and Rehabilitation Daily Report forms' });
  }
});

// New endpoint to fetch IEC forms data from both mobile and web databases
app.get('/getIECForms', async (req, res) => {
  const query = 'SELECT * FROM iec_form';

  try {
    const mobileResults = await queryDatabase(pool, query);
    const webResults = await queryDatabase(webPool, query);

    const iecForms = [...mobileResults, ...webResults];

    if (iecForms.length > 0) {
      console.log('IEC Report Forms:', iecForms);
      res.json(iecForms);
    } else {
      console.error('No IEC forms found in the databases');
      res.status(404).json({ message: 'No IEC Report forms found' });
    }
  } catch (error) {
    console.error('Error retrieving IEC Report forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving IEC Report forms' });
  }
});

// New endpoint to fetch Schedule forms data from both mobile and web databases
app.get('/getScheduleForms', async (req, res) => {
  const query = 'SELECT * FROM schedule_form';

  try {
    const mobileResults = await queryDatabase(pool, query);
    const webResults = await queryDatabase(webPool, query);

    const scheduleForms = [...mobileResults, ...webResults];

    if (scheduleForms.length > 0) {
      console.log('Schedule Forms:', scheduleForms);
      res.json(scheduleForms);
    } else {
      console.error('No Schedule forms found in the databases');
      res.status(404).json({ message: 'No Schedule Report forms found' });
    }
  } catch (error) {
    console.error('Error retrieving Schedule Report forms:', error);
    res.status(500).json({ message: 'An error occurred while retrieving Schedule Report forms' });
  }
});

// New endpoint to fetch Budget forms data from both mobile and web databases
app.get('/getBudgetForms', async (req, res) => {
  const query = 'SELECT * FROM budget_form';

  try {
    const mobileResults = await queryDatabase(pool, query);
    const webResults = await queryDatabase(webPool, query);

    const budgetForms = [...mobileResults, ...webResults];

    if (budgetForms.length > 0) {
      console.log('Budget Forms:', budgetForms);
      res.json(budgetForms);
    } else {
      console.error('No Budget forms found in the databases');
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

// New endpoint to fetch exposure_form data from both mobile and web databases
app.get('/getRabiesExposureForms', async (req, res) => {
  const query = 'SELECT * FROM exposure_form';

  try {
    const mobileResults = await queryDatabase(pool, query);
    const webResults = await queryDatabase(webPool, query);

    const exposureForms = [...mobileResults, ...webResults];

    if (exposureForms.length > 0) {
      console.log('Rabies Exposure Forms:', exposureForms);
      res.json(exposureForms);
    } else {
      console.error('No Rabies Exposure forms found in the databases');
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
    await queryDatabase(pool, deleteQuery, [id]);
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
    await queryDatabase(pool, deleteQuery, [id]);
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
    await queryDatabase(pool, deleteQuery, [id]);
    console.log(`Rabies sample form with ID ${id} deleted successfully`);
    res.json({ success: true, message: 'Rabies sample form deleted successfully' });
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
    await queryDatabase(pool, deleteQuery, [id]);
    console.log(`Budget form with ID ${id} deleted successfully`);
    res.json({ success: true, message: 'Budget form deleted successfully' });
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
    await queryDatabase(pool, deleteQuery, [id]);
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
    await queryDatabase(pool, deleteQuery, [id]);
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
    await queryDatabase(pool, deleteQuery, [id]);
    console.log(`Animal control form with ID ${id} deleted successfully`);
    res.json({ success: true, message: 'Animal control form deleted successfully' });
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