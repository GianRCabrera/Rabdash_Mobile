// Shared test setup: mocks mysql2 and express-mysql-session so app.js can be
// require()'d without touching any real database, then loads a fresh copy of the
// app (jest.resetModules() first, since app.js has module-level state like the
// session secret and the DB pools) and exposes the fake pools for per-test
// query configuration.
jest.mock('mysql2');
jest.mock('express-mysql-session');

// app.js logs verbosely (every login attempt, every query, etc.) — useful in
// production, just noise in test output. Silence it here so test failures are
// easy to spot; assertions still work normally since we're only intercepting
// the console methods, not the app's actual behavior.
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

function loadApp() {
  jest.resetModules();
  const mysql2 = require('mysql2');
  mysql2.__resetMockPools();
  const app = require('../app');
  const [pool, webPool] = mysql2.__mockPools;
  return { app, pool, webPool };
}

// Registers a fake-response rule on a pool: any query whose SQL contains
// `sqlFragment` (a cheap substring match — good enough for routing fake
// responses without re-implementing a SQL parser) resolves with `rows`.
// `rows` may also be a function `(values) => rows`, for rules that need to
// vary by query parameter (e.g. a user-lookup query returning a different
// row per email). Rules accumulate per pool and are checked in registration
// order, most-recently-registered first (so an in-test override beats a
// beforeEach default); unmatched queries fall back to an empty result set.
// Call this as many times as needed per test to cover every query the
// route makes.
function mockQueryResult(pool, sqlFragment, rows) {
  if (!pool.__rules) {
    pool.__rules = [];
    pool.query.mockImplementation((sql, values, callback) => {
      if (typeof values === 'function') {
        callback = values;
      }
      const rule = pool.__rules.find((r) => sql.includes(r.sqlFragment));
      if (!rule) return callback(null, []);
      const result = typeof rule.rows === 'function' ? rule.rows(Array.isArray(values) ? values : []) : rule.rows;
      callback(null, result);
    });
  }
  pool.__rules.unshift({ sqlFragment, rows });
}

module.exports = { loadApp, mockQueryResult };
