const bcrypt = require('bcrypt');
const request = require('supertest');
const { loadApp, mockQueryResult } = require('./helpers');

describe('GET /mySummary (home screen activity)', () => {
  let app;
  let pool;
  let agent;
  const email = 'vet@example.invalid';
  const password = 'CorrectHorseBattery1!';
  const sqlCalls = (fragment) => pool.query.mock.calls.filter(([sql]) => sql.includes(fragment));

  beforeAll(async () => {
    ({ app, pool } = loadApp());
    const hash = await bcrypt.hash(password, 10);
    mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', (values) =>
      values[0] === email ? [{ email, password: hash, position: 'Private Veterinarian' }] : []
    );
    agent = request.agent(app);
    await agent.post('/login').send({ email, password });
  });

  beforeEach(() => {
    pool.query.mockClear();
  });

  test('requires a session', async () => {
    expect((await request(app).get('/mySummary')).status).toBe(401);
  });

  test('sums this month and total across every form table, for the session user only', async () => {
    mockQueryResult(pool, 'COUNT(*) AS total', [
      { total: 10, month: '2' },
      { total: 5, month: '1' },
      { total: 0, month: null },
      { total: 0, month: 0 },
      { total: 3, month: '0' },
      { total: 0, month: 0 },
      { total: 1, month: '1' },
      { total: 1, month: 0 },
    ]);
    mockQueryResult(pool, "AS form, id", []);

    const res = await agent.get('/mySummary?username=someone-else@example.invalid');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ thisMonth: 4, total: 20, recent: [] });
    const [[countSql, countParams]] = sqlCalls('COUNT(*) AS total');
    for (const table of ['vaccination_form', 'consent_form', 'bite_form', 'exposure_form', 'control_form', 'schedule_form', 'iec_form', 'budget_form']) {
      expect(countSql).toContain(`FROM ${table} WHERE username = ?`);
    }
    // [monthStart, username] per table, always the session's email.
    expect(countParams).toHaveLength(16);
    countParams.filter((_, i) => i % 2 === 1).forEach((value) => expect(value).toBe(email));
    const [[, recentParams]] = sqlCalls('AS form, id');
    expect(recentParams).toEqual(Array(8).fill(email));
  });

  test('returns the 5 most recent submissions with their form key and label', async () => {
    mockQueryResult(pool, 'COUNT(*) AS total', []);
    mockQueryResult(pool, 'AS form, id', [
      { form: 'neuter', id: 7, label: 'Juan Cruz', created_at: '2026-11-12T01:00:00.000Z' },
      { form: 'budget', id: 3, label: 2026, created_at: '2026-11-11T01:00:00.000Z' },
      { form: 'iec', id: 9, label: null, created_at: '2026-11-10T01:00:00.000Z' },
    ]);

    const res = await agent.get('/mySummary');

    expect(res.body.recent).toEqual([
      { form: 'neuter', id: 7, label: 'Juan Cruz', createdAt: '2026-11-12T01:00:00.000Z' },
      { form: 'budget', id: 3, label: '2026', createdAt: '2026-11-11T01:00:00.000Z' },
      { form: 'iec', id: 9, label: '', createdAt: '2026-11-10T01:00:00.000Z' },
    ]);
    const [[recentSql]] = sqlCalls('AS form, id');
    expect(recentSql).toMatch(/ORDER BY created_at DESC LIMIT 5$/);
  });

  test('a database error is a 500 that does not leak the MySQL text', async () => {
    mockQueryResult(pool, 'COUNT(*) AS total', () => new Error('ER_SECRET: connect ECONNREFUSED'));

    const res = await agent.get('/mySummary');

    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('ER_SECRET');
  });
});

describe('manilaMonthStartUtc', () => {
  const { manilaMonthStartUtc } = require('../routes/forms');

  test.each([
    // Mid-month: Manila midnight Nov 1 = Oct 31 16:00 UTC.
    ['2026-11-12T01:00:00Z', '2026-10-31 16:00:00'],
    // 7am on Dec 1 in Davao is still Nov 30 in UTC, but it's December there.
    ['2026-11-30T23:00:00Z', '2026-11-30 16:00:00'],
    // Late on Nov 30 in Davao (15:59 UTC) is still November.
    ['2026-11-30T15:59:00Z', '2026-10-31 16:00:00'],
    // New year.
    ['2026-12-31T17:00:00Z', '2026-12-31 16:00:00'],
  ])('at %s the month starts at %s UTC', (now, expected) => {
    expect(manilaMonthStartUtc(new Date(now))).toBe(expected);
  });
});
