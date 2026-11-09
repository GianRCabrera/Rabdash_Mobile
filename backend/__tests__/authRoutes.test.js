const bcrypt = require('bcrypt');
const request = require('supertest');
const { loadApp, mockQueryResult } = require('./helpers');

// Covers the account routes other than /login itself (auth.test.js) and OTP
// validation (otp.test.js): registration, logout, profile/position lookups,
// and both password-reset flows. Each test uses its own email address so the
// accumulating mockQueryResult rules from one test can't answer another's
// queries.
describe('account routes', () => {
  let app;
  let pool;
  let webPool;
  let transporter;
  const password = 'CorrectHorseBattery1!';
  let passwordHash;

  // authLimiter allows 10 requests per IP per 15 minutes, and this file makes
  // more than that. app.js trusts one proxy hop (for Render), so giving each
  // request its own X-Forwarded-For address keeps them in separate buckets —
  // the limiter itself is covered in accountRateLimit.test.js.
  let ipCounter = 0;
  const nextIp = () => `10.0.${Math.floor(ipCounter / 250)}.${(ipCounter++ % 250) + 1}`;
  const post = (agentOrApp, path) => agentOrApp.post(path).set('X-Forwarded-For', nextIp());

  const sqlCalls = (p, fragment) => p.query.mock.calls.filter(([sql]) => sql.includes(fragment));
  const verifiedOtp = (purpose, overrides = {}) => ({
    otp: '123456', purpose, verified: 1, attempts: 0, expiry: new Date(Date.now() + 3600000), ...overrides,
  });
  const userRow = (email, position = 'Private Veterinarian') => ({ email, password: passwordHash, position });

  const loginAs = async (email) => {
    const agent = request.agent(app);
    const res = await post(agent, '/login').send({ email, password });
    expect(res.body.success).toBe(true);
    return agent;
  };

  beforeAll(async () => {
    ({ app, pool, webPool } = loadApp());
    ({ transporter } = require('../lib/mailer'));
    passwordHash = await bcrypt.hash(password, 10);
  });

  beforeEach(() => {
    pool.query.mockClear();
    webPool.query.mockClear();
    jest.spyOn(transporter, 'sendMail').mockResolvedValue({});
  });

  describe('POST /register', () => {
    test('is refused without a verified registration OTP, and nothing is inserted', async () => {
      const res = await post(request(app), '/register').send({
        name: 'No', last_name: 'Otp', email: 'no-otp@example.invalid', password, position: 'CVO',
      });

      expect(res.status).toBe(403);
      expect(sqlCalls(pool, 'INSERT INTO users')).toHaveLength(0);
    });

    test('is refused when the verified OTP has expired', async () => {
      const email = 'expired-otp@example.invalid';
      mockQueryResult(pool, 'FROM otp_codes', (values) =>
        values[0] === email ? [verifiedOtp('register', { expiry: new Date(Date.now() - 1000) })] : []
      );

      const res = await post(request(app), '/register').send({ name: 'Old', last_name: 'Otp', email, password });

      expect(res.status).toBe(403);
      expect(sqlCalls(pool, 'INSERT INTO users')).toHaveLength(0);
    });

    test('a request claiming the RabDash role is registered as Private Veterinarian instead', async () => {
      const email = 'wants-rabdash@example.invalid';
      mockQueryResult(pool, 'FROM otp_codes', (values) => (values[0] === email ? [verifiedOtp('register')] : []));

      const res = await post(request(app), '/register').send({
        name: 'Sneaky', last_name: 'User', email, password, position: 'RabDash',
      });

      expect(res.body.success).toBe(true);
      const [[, values]] = sqlCalls(pool, 'INSERT INTO users');
      expect(values[2]).toBe(email);
      expect(values[3]).toBe('Private Veterinarian');
    });

    test('a valid registration stores a hashed password, keeps CVO, consumes the OTP, and logs the user in', async () => {
      const email = 'new-cvo@example.invalid';
      mockQueryResult(pool, 'FROM otp_codes', (values) => (values[0] === email ? [verifiedOtp('register')] : []));
      mockQueryResult(pool, 'SELECT name, last_name, email, position FROM users', (values) =>
        values[0] === email ? [{ name: 'New', last_name: 'Cvo', email, position: 'CVO' }] : []
      );

      const agent = request.agent(app);
      const res = await post(agent, '/register').send({ name: 'New', last_name: 'Cvo', email, password, position: 'CVO' });

      expect(res.body.success).toBe(true);
      const [[, values]] = sqlCalls(pool, 'INSERT INTO users');
      expect(values[3]).toBe('CVO');
      expect(values[4]).not.toBe(password);
      expect(await bcrypt.compare(password, values[4])).toBe(true);
      expect(sqlCalls(pool, 'DELETE FROM otp_codes').map(([, v]) => v)).toContainEqual([email, 'register']);

      const profile = await agent.get('/userProfile');
      expect(profile.status).toBe(200);
      expect(profile.body.email).toBe(email);
    });
  });

  describe('sessions: /logout, /userProfile, /Position', () => {
    test('logout without a session is rejected', async () => {
      const res = await request(app).post('/logout');
      expect(res.status).toBe(401);
    });

    test('logout ends the session, so the same client is unauthenticated afterwards', async () => {
      const email = 'logout@example.invalid';
      mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', (values) => (values[0] === email ? [userRow(email)] : []));
      mockQueryResult(pool, 'SELECT position FROM users', (values) => (values[0] === email ? [{ position: 'Private Veterinarian' }] : []));

      const agent = await loginAs(email);
      expect((await agent.get('/Position')).status).toBe(200);

      const res = await agent.post('/logout');
      expect(res.body.success).toBe(true);
      expect((await agent.get('/Position')).status).toBe(401);
    });

    test('/userProfile and /Position require a session', async () => {
      expect((await request(app).get('/userProfile')).status).toBe(401);
      expect((await request(app).get('/Position')).status).toBe(401);
    });

    test('/userProfile never selects or returns the password hash', async () => {
      const email = 'profile@example.invalid';
      mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', (values) => (values[0] === email ? [userRow(email)] : []));
      mockQueryResult(pool, 'SELECT name, last_name, email, position FROM users', (values) =>
        values[0] === email ? [{ name: 'Pro', last_name: 'File', email, position: 'Private Veterinarian' }] : []
      );

      const agent = await loginAs(email);
      pool.query.mockClear();
      const res = await agent.get('/userProfile');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ name: 'Pro', last_name: 'File', email, position: 'Private Veterinarian' });
      const [[sql]] = sqlCalls(pool, 'FROM users WHERE email');
      expect(sql).not.toMatch(/password|\*/i);
    });

    test('an account that only exists in the web database is found by /userProfile and /Position', async () => {
      const email = 'web-only@example.invalid';
      mockQueryResult(webPool, 'SELECT * FROM users WHERE email = ?', (values) => (values[0] === email ? [userRow(email, 'RabDash')] : []));
      mockQueryResult(webPool, 'SELECT name, last_name, email, position FROM users', (values) =>
        values[0] === email ? [{ name: 'Web', last_name: 'Only', email, position: 'RabDash' }] : []
      );
      mockQueryResult(webPool, 'SELECT position FROM users', (values) => (values[0] === email ? [{ position: 'RabDash' }] : []));

      const agent = await loginAs(email);

      const profile = await agent.get('/userProfile');
      expect(profile.status).toBe(200);
      expect(profile.body.email).toBe(email);
      const position = await agent.get('/Position');
      expect(position.body).toEqual({ position: 'RabDash' });
    });

    test('/userProfile is 404 when the logged-in account has since been deleted from both databases', async () => {
      const email = 'deleted@example.invalid';
      let deleted = false;
      mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', (values) => (values[0] === email ? [userRow(email)] : []));
      mockQueryResult(pool, 'SELECT name, last_name, email, position FROM users', (values) =>
        values[0] === email && !deleted ? [{ email }] : []
      );

      const agent = await loginAs(email);
      deleted = true;
      expect((await agent.get('/userProfile')).status).toBe(404);
    });
  });

  describe('POST /reset-password (change password while logged out, using the old one)', () => {
    test('requires email, old password, and new password', async () => {
      const res = await post(request(app), '/reset-password').send({ email: 'missing@example.invalid', oldPassword: password });
      expect(res.status).toBe(400);
    });

    test('a wrong old password is refused and nothing is updated', async () => {
      const email = 'wrong-old@example.invalid';
      mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', (values) => (values[0] === email ? [userRow(email)] : []));

      const res = await post(request(app), '/reset-password').send({ email, oldPassword: 'not-it', newPassword: 'NewPassword1!' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/old password is incorrect/i);
      expect(sqlCalls(pool, 'UPDATE users')).toHaveLength(0);
    });

    test('an unknown email is refused', async () => {
      const res = await post(request(app), '/reset-password').send({
        email: 'nobody@example.invalid', oldPassword: password, newPassword: 'NewPassword1!',
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/user not found/i);
    });

    test('updates the password in the database the account lives in (web DB), hashed', async () => {
      const email = 'web-reset@example.invalid';
      mockQueryResult(webPool, 'SELECT * FROM users WHERE email = ?', (values) => (values[0] === email ? [userRow(email)] : []));

      const res = await post(request(app), '/reset-password').send({ email, oldPassword: password, newPassword: 'NewPassword1!' });

      expect(res.body.success).toBe(true);
      expect(sqlCalls(pool, 'UPDATE users')).toHaveLength(0);
      const [[, [newHash, updatedEmail]]] = sqlCalls(webPool, 'UPDATE users SET password');
      expect(updatedEmail).toBe(email);
      expect(await bcrypt.compare('NewPassword1!', newHash)).toBe(true);
    });
  });

  describe('POST /reset-forgotten-password (OTP-gated)', () => {
    test('is refused without a verified reset OTP, and nothing is updated', async () => {
      const email = 'forgot-no-otp@example.invalid';
      mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', (values) => (values[0] === email ? [userRow(email)] : []));

      const res = await post(request(app), '/reset-forgotten-password').send({ email, newPassword: 'NewPassword1!' });

      expect(res.status).toBe(403);
      expect(sqlCalls(pool, 'UPDATE users')).toHaveLength(0);
    });

    test('a registration OTP cannot be used to reset a password', async () => {
      const email = 'forgot-wrong-purpose@example.invalid';
      mockQueryResult(pool, 'FROM otp_codes', (values) => (values[0] === email && values[1] === 'register' ? [verifiedOtp('register')] : []));
      mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', (values) => (values[0] === email ? [userRow(email)] : []));

      const res = await post(request(app), '/reset-forgotten-password').send({ email, newPassword: 'NewPassword1!' });

      expect(res.status).toBe(403);
      expect(sqlCalls(pool, 'UPDATE users')).toHaveLength(0);
    });

    test('with a verified reset OTP, sets the new (hashed) password and consumes the OTP', async () => {
      const email = 'forgot-ok@example.invalid';
      mockQueryResult(pool, 'FROM otp_codes', (values) => (values[0] === email && values[1] === 'reset' ? [verifiedOtp('reset')] : []));
      mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', (values) => (values[0] === email ? [userRow(email)] : []));

      const res = await post(request(app), '/reset-forgotten-password').send({ email, newPassword: 'NewPassword1!' });

      expect(res.body.success).toBe(true);
      const [[, [newHash, updatedEmail]]] = sqlCalls(pool, 'UPDATE users SET password');
      expect(updatedEmail).toBe(email);
      expect(await bcrypt.compare('NewPassword1!', newHash)).toBe(true);
      expect(sqlCalls(pool, 'DELETE FROM otp_codes').map(([, v]) => v)).toContainEqual([email, 'reset']);
    });
  });

  describe('OTP emails: /resetpass and /registerotp', () => {
    test.each([
      ['/resetpass', 'reset'],
      ['/registerotp', 'register'],
    ])('%s stores a %s OTP and emails that same code to the address', async (path, purpose) => {
      const email = `otp-mail-${purpose}@example.invalid`;

      const res = await post(request(app), path).send({ email, name: 'A', last_name: 'B' });

      expect(res.body.success).toBe(true);
      const [[, [storedEmail, storedPurpose, storedOtp]]] = sqlCalls(pool, 'INSERT INTO otp_codes');
      expect([storedEmail, storedPurpose]).toEqual([email, purpose]);
      expect(storedOtp).toMatch(/^\d{6}$/);
      expect(transporter.sendMail).toHaveBeenCalledTimes(1);
      const [[mail]] = transporter.sendMail.mock.calls;
      expect(mail.to).toBe(email);
      expect(mail.html).toContain(storedOtp);
      expect(mail.from).toBe('admin@rabdash.com');
    });

    test.each(['/resetpass', '/registerotp'])('%s sends from MAIL_FROM when it is set', async (path) => {
      process.env.MAIL_FROM = 'RabDash <no-reply@rabdash.davaocity.gov.ph>';
      try {
        await post(request(app), path).send({ email: 'mail-from@example.invalid', name: 'A', last_name: 'B' });
      } finally {
        delete process.env.MAIL_FROM;
      }

      expect(transporter.sendMail.mock.calls[0][0].from).toBe('RabDash <no-reply@rabdash.davaocity.gov.ph>');
    });

    test.each(['/resetpass', '/registerotp'])('%s reports failure (500) when the email cannot be sent', async (path) => {
      transporter.sendMail.mockRejectedValue(new Error('SMTP down'));

      const res = await post(request(app), path).send({ email: 'smtp-down@example.invalid', name: 'A', last_name: 'B' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});
