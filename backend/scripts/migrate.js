#!/usr/bin/env node
// Lightweight migration runner for the mobile app's own database (the one
// backend/app.js connects to via DB_* env vars) — NOT the companion
// website's database, which is a separate Laravel app with its own
// migration system already.
//
// Migrations are plain numbered .sql files in backend/migrations/, applied
// in filename order. Applied filenames are recorded in a schema_migrations
// tracking table (created automatically on first run), so re-running this
// script only applies new ones.
//
// MySQL DDL statements (CREATE TABLE, ALTER TABLE, etc.) aren't
// transactional — each one commits immediately regardless of any
// surrounding transaction — so there's no rollback safety net if a
// migration fails partway through a multi-statement file. Keep each
// migration small and idempotent (CREATE TABLE IF NOT EXISTS, etc.) so a
// partial failure or re-run is safe to retry.
//
// Usage: cd backend && npm run migrate

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: true,
  });

  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename VARCHAR(255) NOT NULL PRIMARY KEY,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [appliedRows] = await connection.query('SELECT filename FROM schema_migrations');
  const applied = new Set(appliedRows.map((row) => row.filename));

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const pending = files.filter((file) => !applied.has(file));

  if (pending.length === 0) {
    console.log('No pending migrations.');
    await connection.end();
    return;
  }

  for (const file of pending) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    console.log(`Applying ${file}...`);
    try {
      await connection.query(sql);
      await connection.query('INSERT INTO schema_migrations (filename) VALUES (?)', [file]);
      console.log('  done');
    } catch (error) {
      console.error(`  FAILED: ${error.message}`);
      await connection.end();
      process.exit(1);
    }
  }

  console.log(`Applied ${pending.length} migration(s).`);
  await connection.end();
}

main().catch((error) => {
  console.error('Migration run failed:', error.message);
  process.exit(1);
});
