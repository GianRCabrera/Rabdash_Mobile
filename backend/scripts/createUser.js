#!/usr/bin/env node
// Creates an account with a position that public sign-up doesn't offer
// (e.g. CVO Admin), or changes an existing account's position. Writes to
// the mobile app's own database (DB_* env vars), hashing the password with
// bcrypt the same way /register does.
//
// Usage: cd backend && npm run create-user
// It asks for everything interactively; the password isn't echoed.

require('dotenv').config();
const readline = require('readline');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const { ALL_POSITIONS } = require('../constants');

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

// Same rule the app uses at sign-up (src/utils/email.js).
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');

const nowMysql = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

// The database work, separate from the prompts so it can be tested.
// Returns 'created', 'updated', or 'exists' (account exists and
// confirmUpdate declined).
async function createOrUpdateUser(db, { name, lastName, email, position, password }, confirmUpdate) {
  if (!ALL_POSITIONS.includes(position)) throw new Error(`Unknown position: ${position}`);
  if (!isValidEmail(email)) throw new Error(`Not a valid email: ${email}`);

  const [existing] = await db.query('SELECT position FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    if (!(await confirmUpdate(existing[0].position))) return 'exists';
    await db.query('UPDATE users SET position = ?, updated_at = ? WHERE email = ?', [position, nowMysql(), email]);
    return 'updated';
  }

  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const now = nowMysql();
  await db.query(
    'INSERT INTO users (name, last_name, email, position, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, lastName, email, position, hash, now, now]
  );
  return 'created';
}

function ask(rl, question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    if (hidden) {
      // Print the prompt, then stop echoing what's typed.
      const write = rl._writeToOutput.bind(rl);
      rl._writeToOutput = (s) => { if (s.includes(question)) write(s); };
      rl.question(question, (answer) => {
        rl._writeToOutput = write;
        process.stdout.write('\n');
        resolve(answer);
      });
    } else {
      rl.question(question, (answer) => resolve(answer.trim()));
    }
  });
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    const email = await ask(rl, 'Email: ');
    console.log(`Positions: ${ALL_POSITIONS.map((p, i) => `${i + 1}) ${p}`).join('  ')}`);
    const choice = await ask(rl, 'Position number [3 = CVO Admin]: ');
    const position = ALL_POSITIONS[(parseInt(choice, 10) || 3) - 1];

    const [existing] = await db.query('SELECT position FROM users WHERE email = ?', [email]);
    let details = { email, position };
    if (existing.length === 0) {
      details = {
        ...details,
        name: await ask(rl, 'First name: '),
        lastName: await ask(rl, 'Last name: '),
        password: await ask(rl, 'Password (not shown): ', { hidden: true }),
      };
    }

    const result = await createOrUpdateUser(db, details, async (current) => {
      const answer = await ask(rl, `${email} already exists as "${current}". Change it to "${position}"? (y/N): `);
      return answer.toLowerCase() === 'y';
    });
    console.log({
      created: `Created ${email} as ${position}.`,
      updated: `Changed ${email} to ${position}. They need to log out and back in to see the change.`,
      exists: 'No changes made.',
    }[result]);
  } finally {
    rl.close();
    await db.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { createOrUpdateUser };
