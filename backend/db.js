const mysql = require('mysql2');

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

// Waits before each reconnect attempt while the database is unreachable:
// 2s, 4s, 8s, ... capped at 60s. It used to retry every 2s forever, which
// on Nov 11 2026 hammered Hostinger with ~30 failed connections a minute
// during a network outage, the kind of traffic that can get a host
// blocked. Requests still try the database on their own as they come in;
// this only paces the background reconnect.
const RETRY_BASE_MS = 2000;
const RETRY_MAX_MS = 60 * 1000;
const retryDelay = (attempt) => Math.min(RETRY_BASE_MS * 2 ** attempt, RETRY_MAX_MS);

// Retries the initial connection; does NOT re-register the 'error' listener on each
// retry (that was a bug — every retry added another listener, eventually tripping
// Node's MaxListenersExceededWarning when a DB stayed unreachable for a while).
function tryConnect(pool, attempt = 0) {
  pool.getConnection((err, connection) => {
    const name = pool.config?.connectionConfig?.database || 'database';
    if (err) {
      const delay = retryDelay(attempt);
      // One line per attempt (not the whole error object, which was ~40 log
      // lines each time); err.code says what went wrong, e.g. ETIMEDOUT.
      console.error(`Error getting ${name} connection (${err.code || err.message}); retrying in ${delay / 1000}s`);
      setTimeout(() => tryConnect(pool, attempt + 1), delay);
    } else if (connection) {
      if (attempt > 0) console.log(`Connected to ${name} after ${attempt} failed attempt(s)`);
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

module.exports = { pool, webPool, queryDatabase, tryConnect, retryDelay };
