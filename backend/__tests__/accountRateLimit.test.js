const bcrypt = require('bcrypt');
const request = require('supertest');
const { loadApp, mockQueryResult } = require('./helpers');

// authLimiter (pre-existing, IP-keyed) only mitigates one attacker hammering
// from one address — it does nothing against attempts spread across many
// IPs targeting one specific account. loginAccountLimiter closes that gap.
// Each simulated attempt below uses a distinct X-Forwarded-For value (the
// app has `trust proxy` set, so Express's req.ip respects it) specifically
// so no single IP ever approaches authLimiter's own max:10 — isolating the
// new account-keyed behavior from the pre-existing IP-keyed one, which
// would otherwise also trip at the same request count and mask what's
// actually being tested.
describe('Account-aware login rate limiting (spread across many IPs)', () => {
  let app;
  let pool;
  const password = 'CorrectHorseBattery1!';
  const targetEmail = 'target@example.invalid';
  const otherEmail = 'other@example.invalid';

  beforeAll(async () => {
    ({ app, pool } = loadApp());
    const hash = await bcrypt.hash(password, 10);
    mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', (values) => {
      const email = values[0];
      if (email === targetEmail) return [{ email, password: hash, position: 'Private Veterinarian' }];
      if (email === otherEmail) return [{ email, password: hash, position: 'Private Veterinarian' }];
      return [];
    });
  });

  const attempt = (email, pw, ip) =>
    request(app).post('/login').set('X-Forwarded-For', ip).send({ email, password: pw });

  test('10 failed attempts against one account from 10 different IPs locks that account out', async () => {
    for (let i = 0; i < 10; i++) {
      const res = await attempt(targetEmail, 'wrong-password', `10.0.1.${i}`);
      expect(res.status).toBe(200); // login's own failure response, not rate-limited yet
      expect(res.body.success).toBe(false);
    }

    const blocked = await attempt(targetEmail, 'wrong-password', '10.0.1.99');
    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toMatch(/this account/i);

    // Even the correct password is blocked once the account itself is locked.
    const blockedWithCorrectPassword = await attempt(targetEmail, password, '10.0.1.100');
    expect(blockedWithCorrectPassword.status).toBe(429);
  });

  test('a different account is unaffected by another account being locked out', async () => {
    const res = await attempt(otherEmail, password, '10.0.2.1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
