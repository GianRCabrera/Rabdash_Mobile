const bcrypt = require('bcrypt');
const request = require('supertest');
const { loadApp, mockQueryResult } = require('./helpers');

// Covers createScopedPaginatedListHandler, shared by getAnimalControlForms,
// getIECForms, getScheduleForms, getBudgetForms, and getRabiesExposureForms
// — testing one of them (control_form) exercises the same code path as all
// five. See pagination.test.js for the CVO-only variant of this pattern
// (createPaginatedCvoListHandler), which doesn't branch on role.
describe('GET /getAnimalControlForms scoped pagination (reviewer vs. own records)', () => {
  let app;
  let pool;
  let web;
  const password = 'SamePasswordForAllTestUsers1!';
  const users = {
    'vet@example.invalid': { position: 'Private Veterinarian' },
    'reviewer@example.invalid': { position: 'RabDash' },
  };

  beforeAll(async () => {
    ({ app, pool } = loadApp());
    web = require('mysql2').__mockPools[1];
    const hash = await bcrypt.hash(password, 10);
    mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', (values) => {
      const email = values[0];
      return users[email] ? [{ email, password: hash, position: users[email].position }] : [];
    });
  });

  const loginAs = async (email) => {
    const agent = request.agent(app);
    await agent.post('/login').send({ email, password });
    return agent;
  };

  const mockEmptyOn = (targetPool) => {
    mockQueryResult(targetPool, 'COUNT(*) AS total', [{ total: 0 }]);
    mockQueryResult(targetPool, 'SELECT * FROM control_form', []);
  };

  test('a non-reviewer only gets their own (username-scoped) records', async () => {
    mockEmptyOn(web);
    mockQueryResult(pool, 'COUNT(*) AS total', (values) => {
      expect(values).toEqual(['vet@example.invalid']);
      return [{ total: 1 }];
    });
    mockQueryResult(pool, 'SELECT * FROM control_form', (values) => {
      // Scope param (username) comes before limit/offset.
      expect(values[0]).toBe('vet@example.invalid');
      return [{ id: 1, username: 'vet@example.invalid', created_at: '2026-01-01' }];
    });

    const agent = await loginAs('vet@example.invalid');
    const res = await agent.get('/getAnimalControlForms');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test('a RabDash reviewer gets unscoped records — no username filter applied', async () => {
    mockEmptyOn(web);
    mockQueryResult(pool, 'COUNT(*) AS total', (values) => {
      expect(values).toEqual([]); // no scope param for a reviewer
      return [{ total: 2 }];
    });
    mockQueryResult(pool, 'SELECT * FROM control_form', (values) => {
      const [limit, offset] = values.slice(-2);
      expect(values.length).toBe(2); // only [limit, offset], no scope/search params
      expect(limit).toBe(20);
      expect(offset).toBe(0);
      return [{ id: 1, username: 'someone-else@example.invalid', created_at: '2026-01-01' }];
    });

    const agent = await loginAs('reviewer@example.invalid');
    const res = await agent.get('/getAnimalControlForms');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test('a non-reviewer search combines the username scope and the search term with AND', async () => {
    mockEmptyOn(web);
    mockQueryResult(pool, 'COUNT(*) AS total', (values) => {
      expect(values).toEqual(['vet@example.invalid', '%12%', '%12%']); // username, then cageNum/chief search params
      return [{ total: 0 }];
    });
    mockQueryResult(pool, 'SELECT * FROM control_form', []);

    const agent = await loginAs('vet@example.invalid');
    const res = await agent.get('/getAnimalControlForms').query({ search: '12' });

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
  });
});
