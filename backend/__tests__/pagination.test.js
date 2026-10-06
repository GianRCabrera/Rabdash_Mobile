const bcrypt = require('bcrypt');
const request = require('supertest');
const { loadApp, mockQueryResult } = require('./helpers');

describe('GET /getVaccinationFormsCVO pagination and search', () => {
  let app;
  let pool;
  let web;
  const password = 'SamePasswordForAllTestUsers1!';
  const reviewerEmail = 'reviewer@example.invalid';

  beforeAll(async () => {
    ({ app, pool } = loadApp());
    web = require('mysql2').__mockPools[1];
    const hash = await bcrypt.hash(password, 10);
    mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', [
      { email: reviewerEmail, password: hash, position: 'RabDash' },
    ]);
  });

  const loginAsReviewer = async () => {
    const agent = request.agent(app);
    await agent.post('/login').send({ email: reviewerEmail, password });
    return agent;
  };

  // Both mobile and web pools are queried for every call (list + count each),
  // so every test needs a rule on both — a real COUNT(*) always returns
  // exactly one row, but the mock's "no rule matched" fallback is an empty
  // array, which throws reading .total off it if a pool is left unmocked.
  const mockEmptyOn = (targetPool) => {
    mockQueryResult(targetPool, 'COUNT(*) AS total', [{ total: 0 }]);
    mockQueryResult(targetPool, 'SELECT * FROM vaccination_form', []);
  };

  test('defaults to page 1, limit 20, and returns the paginated envelope shape', async () => {
    mockEmptyOn(web);
    mockQueryResult(pool, 'COUNT(*) AS total', [{ total: 3 }]);
    mockQueryResult(pool, 'SELECT * FROM vaccination_form', (values) => {
      // Last two params are always [limit, offset] on the list query.
      const [limit, offset] = values.slice(-2);
      expect(limit).toBe(20);
      expect(offset).toBe(0);
      return [{ id: 1, created_at: '2026-01-01' }];
    });

    const agent = await loginAsReviewer();
    const res = await agent.get('/getVaccinationFormsCVO');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ page: 1, limit: 20, total: 3 }));
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('page/limit query params compute the correct offset', async () => {
    mockEmptyOn(web);
    mockQueryResult(pool, 'COUNT(*) AS total', [{ total: 0 }]);
    mockQueryResult(pool, 'SELECT * FROM vaccination_form', (values) => {
      const [limit, offset] = values.slice(-2);
      expect(limit).toBe(10);
      expect(offset).toBe(20); // page 3, limit 10 -> offset 20
      return [];
    });

    const agent = await loginAsReviewer();
    const res = await agent.get('/getVaccinationFormsCVO').query({ page: 3, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(3);
    expect(res.body.limit).toBe(10);
  });

  test('an out-of-range limit is clamped to the 200 cap', async () => {
    mockEmptyOn(web);
    mockQueryResult(pool, 'COUNT(*) AS total', [{ total: 0 }]);
    mockQueryResult(pool, 'SELECT * FROM vaccination_form', (values) => {
      const [limit] = values.slice(-2);
      expect(limit).toBe(200);
      return [];
    });

    const agent = await loginAsReviewer();
    const res = await agent.get('/getVaccinationFormsCVO').query({ limit: 999999 });
    expect(res.body.limit).toBe(200);
  });

  test('a search term builds a WHERE clause over the narrow field set, not every column', async () => {
    mockQueryResult(web, 'COUNT(*) AS total', (values) => {
      expect(values).toEqual(['%Rex%', '%Rex%', '%Rex%']); // ownerName, petName, cardNo
      return [{ total: 1 }];
    });
    mockQueryResult(web, 'SELECT * FROM vaccination_form', []);
    mockQueryResult(pool, 'COUNT(*) AS total', (values) => {
      expect(values).toEqual(['%Rex%', '%Rex%', '%Rex%']);
      return [{ total: 1 }];
    });
    mockQueryResult(pool, 'SELECT * FROM vaccination_form', (values) => {
      expect(values.slice(0, 3)).toEqual(['%Rex%', '%Rex%', '%Rex%']);
      return [{ id: 5, petName: 'Rex', created_at: '2026-01-01' }];
    });

    const agent = await loginAsReviewer();
    const res = await agent.get('/getVaccinationFormsCVO').query({ search: 'Rex' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.total).toBe(2); // 1 from mobile mock + 1 from web mock
  });

  test('mobile and web rows are merged and re-sorted by created_at, not left as two separate blocks', async () => {
    mockQueryResult(pool, 'COUNT(*) AS total', [{ total: 0 }]);
    mockQueryResult(web, 'COUNT(*) AS total', [{ total: 0 }]);
    mockQueryResult(pool, 'SELECT * FROM vaccination_form', [
      { id: 1, created_at: '2026-01-05T00:00:00.000Z' },
    ]);
    mockQueryResult(web, 'SELECT * FROM vaccination_form', [
      { id: 2, created_at: '2026-01-10T00:00:00.000Z' },
    ]);

    const agent = await loginAsReviewer();
    const res = await agent.get('/getVaccinationFormsCVO');

    expect(res.body.data.map((row) => row.id)).toEqual([2, 1]); // newer (web) first
  });
});
