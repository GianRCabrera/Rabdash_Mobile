// Manual Jest mock for mysql2. Each createPool() call returns a fresh fake pool
// whose .query is a jest.fn() defaulting to "no rows" — tests configure per-call
// behavior via mockImplementation on the pool objects exposed through __mockPools.
const mockPools = [];

function makeFakePool(config) {
  const pool = {
    query: jest.fn((sql, values, callback) => {
      if (typeof values === 'function') {
        callback = values;
      }
      callback(null, []);
    }),
    getConnection: jest.fn((callback) => {
      callback(null, { release: jest.fn() });
    }),
    on: jest.fn(),
    // app.js logs pool.config.connectionConfig.database for diagnostics on
    // every login query — real mysql2 pools have this shape, so the fake
    // needs it too or that log line throws.
    config: { connectionConfig: { database: (config && config.database) || 'mock_db' } },
  };
  mockPools.push(pool);
  return pool;
}

module.exports = {
  createPool: jest.fn((config) => makeFakePool(config)),
  __mockPools: mockPools,
  __resetMockPools: () => {
    mockPools.length = 0;
  },
};
