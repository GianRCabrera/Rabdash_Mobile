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

// Retries the initial connection; does NOT re-register the 'error' listener on each
// retry (that was a bug — every retry added another listener, eventually tripping
// Node's MaxListenersExceededWarning when a DB stayed unreachable for a while).
function tryConnect(pool) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      setTimeout(() => tryConnect(pool), 2000); // Retry after 2 seconds
    } else if (connection) {
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

module.exports = { pool, webPool, queryDatabase };
