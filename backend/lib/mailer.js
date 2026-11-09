const nodemailer = require('nodemailer');

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

// Sender address for OTP emails. MAIL_FROM lets it change (e.g. when the
// website moves off rabdash.com) without a code change; the address must be
// a verified sender in Brevo. Read per send so a changed env value applies.
const DEFAULT_MAIL_FROM = 'admin@rabdash.com';
const mailFrom = () => process.env.MAIL_FROM || DEFAULT_MAIL_FROM;

module.exports = { transporter, mailFrom, DEFAULT_MAIL_FROM };
