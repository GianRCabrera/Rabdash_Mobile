const request = require('supertest');
const { loadApp, mockQueryResult } = require('./helpers');

describe('OTP purpose isolation and attempt limiting', () => {
  let app;
  let pool;
  const email = 'otp-test@example.invalid';
  const correctOtp = '123456';
  const futureExpiry = new Date(Date.now() + 3600000);

  beforeAll(() => {
    ({ app, pool } = loadApp());
  });

  test('an OTP issued for registration does not validate through the reset endpoint, and vice versa', async () => {
    mockQueryResult(pool, 'FROM otp_codes', (values) => {
      const purpose = values[1];
      return purpose === 'register'
        ? [{ email, purpose: 'register', otp: correctOtp, expiry: futureExpiry, verified: 0, attempts: 0 }]
        : [];
    });

    const resetRes = await request(app).post('/validate-otp').send({ email, otp: correctOtp });
    expect(resetRes.status).toBe(400);

    const registerRes = await request(app).post('/validate-otp-reg').send({ email, otp: correctOtp });
    expect(registerRes.status).toBe(200);
    expect(registerRes.body.success).toBe(true);
  });

  test('a correct OTP is rejected once the attempt cap is reached', async () => {
    mockQueryResult(pool, 'FROM otp_codes', [
      { email, purpose: 'reset', otp: correctOtp, expiry: futureExpiry, verified: 0, attempts: 5 },
    ]);

    const res = await request(app).post('/validate-otp').send({ email, otp: correctOtp });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid or expired/i);
  });

  test('a correct OTP still validates when under the attempt cap', async () => {
    mockQueryResult(pool, 'FROM otp_codes', [
      { email, purpose: 'reset', otp: correctOtp, expiry: futureExpiry, verified: 0, attempts: 4 },
    ]);

    const res = await request(app).post('/validate-otp').send({ email, otp: correctOtp });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
