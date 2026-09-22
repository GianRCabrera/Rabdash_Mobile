const bcrypt = require('bcrypt');
const request = require('supertest');
const { loadApp, mockQueryResult } = require('./helpers');

describe('POST /login', () => {
  let app;
  let pool;
  const email = 'auth-test@example.invalid';
  const correctPassword = 'CorrectHorseBattery1!';

  // Load once, not per-test — see the comment in idor.test.js for why
  // (repeated jest.resetModules()+require('../app') leaks timers that
  // eventually hang later tests in the same file).
  beforeAll(async () => {
    ({ app, pool } = loadApp());
    const hash = await bcrypt.hash(correctPassword, 10);
    mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', [
      { email, password: hash, position: 'Private Veterinarian' },
    ]);
  });

  test('correct credentials succeed', async () => {
    const res = await request(app).post('/login').send({ email, password: correctPassword });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: 'Login successful', position: 'Private Veterinarian' });
  });

  test('wrong password fails with a generic message', async () => {
    const res = await request(app).post('/login').send({ email, password: 'WrongPassword!' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password');
  });

  test('non-existent email fails with the same generic message (no account enumeration)', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'nobody@example.invalid', password: 'whatever123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password');
  });

  test('an unrecognized password hash format fails closed instead of 500ing', async () => {
    mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', [
      { email, password: 'not-a-real-hash', position: 'Private Veterinarian' },
    ]);
    const res = await request(app).post('/login').send({ email, password: correctPassword });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password');
  });
});
