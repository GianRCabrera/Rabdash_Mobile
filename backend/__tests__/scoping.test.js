const bcrypt = require('bcrypt');
const request = require('supertest');
const { loadApp, mockQueryResult } = require('./helpers');

describe('GET /getWeatherForms scoping (own records vs. all records)', () => {
  let app;
  let pool;
  const password = 'SamePasswordForAllTestUsers1!';
  const users = {
    'vet@example.invalid': { position: 'Private Veterinarian' },
    'rabdash@example.invalid': { position: 'RabDash' },
    'cvo@example.invalid': { position: 'CVO' },
  };

  // Load once, not per-test — see the comment in idor.test.js for why
  // (repeated jest.resetModules()+require('../app') leaks timers that
  // eventually hang later tests in the same file).
  beforeAll(async () => {
    ({ app, pool } = loadApp());
    const hash = await bcrypt.hash(password, 10);
    mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', (values) => {
      const email = values[0];
      return users[email] ? [{ email, password: hash, position: users[email].position }] : [];
    });
    // Two different fake result sets so we can tell which query shape actually ran.
    mockQueryResult(pool, 'FROM weather_form WHERE username = ?', (values) => [
      { id: 1, username: values[0], note: 'own-only query' },
    ]);
    mockQueryResult(pool, 'FROM weather_form ORDER BY created_at DESC', [
      { id: 1, username: 'someone-else@example.invalid', note: 'unscoped query' },
      { id: 2, username: 'vet@example.invalid', note: 'unscoped query' },
    ]);
  });

  const loginAs = async (email) => {
    const agent = request.agent(app);
    await agent.post('/login').send({ email, password });
    return agent;
  };

  test('a regular Private Veterinarian only gets the own-records query', async () => {
    const agent = await loginAs('vet@example.invalid');
    const res = await agent.get('/getWeatherForms');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([expect.objectContaining({ note: 'own-only query', username: 'vet@example.invalid' })]);
  });

  test('a RabDash reviewer gets the unscoped, everyone-included query', async () => {
    const agent = await loginAs('rabdash@example.invalid');
    const res = await agent.get('/getWeatherForms');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.every((row) => row.note === 'unscoped query')).toBe(true);
  });

  // PROVISIONAL (see CLAUDE.md): CVO is not currently a reviewer — scoped
  // the same as Private Veterinarian until an elevated CVO tier is designed.
  test('a CVO account is scoped to its own records too, not treated as a reviewer', async () => {
    const agent = await loginAs('cvo@example.invalid');
    const res = await agent.get('/getWeatherForms');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([expect.objectContaining({ note: 'own-only query', username: 'cvo@example.invalid' })]);
  });
});
