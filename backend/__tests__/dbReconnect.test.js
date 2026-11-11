jest.mock('mysql2');

const { tryConnect, retryDelay } = require('../db');

describe('background reconnect while the database is unreachable', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('waits longer after each failure, capped at a minute', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 10].map(retryDelay)).toEqual([2000, 4000, 8000, 16000, 32000, 60000, 60000, 60000]);
  });

  test('retries with growing gaps, and stops once a connection succeeds', () => {
    const timeout = Object.assign(new Error('connect ETIMEDOUT'), { code: 'ETIMEDOUT' });
    const release = jest.fn();
    let failuresLeft = 3;
    const pool = {
      config: { connectionConfig: { database: 'test_db' } },
      getConnection: jest.fn((cb) => (failuresLeft-- > 0 ? cb(timeout) : cb(null, { release }))),
    };

    tryConnect(pool);
    expect(pool.getConnection).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1999);
    expect(pool.getConnection).toHaveBeenCalledTimes(1); // not after 2s any more...
    jest.advanceTimersByTime(1);
    expect(pool.getConnection).toHaveBeenCalledTimes(2);
    jest.advanceTimersByTime(4000);
    expect(pool.getConnection).toHaveBeenCalledTimes(3);
    jest.advanceTimersByTime(7999);
    expect(pool.getConnection).toHaveBeenCalledTimes(3); // ...the third gap is 8s
    jest.advanceTimersByTime(1);
    expect(pool.getConnection).toHaveBeenCalledTimes(4); // succeeds

    jest.advanceTimersByTime(10 * 60 * 1000);
    expect(pool.getConnection).toHaveBeenCalledTimes(4); // no more retries after success
    expect(release).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error getting test_db connection (ETIMEDOUT); retrying in 2s');
    expect(console.log).toHaveBeenCalledWith('Connected to test_db after 3 failed attempt(s)');
  });
});
