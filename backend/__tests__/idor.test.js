const bcrypt = require('bcrypt');
const request = require('supertest');
const { loadApp, mockQueryResult } = require('./helpers');

describe('Ownership check on edit/delete (the IDOR fix)', () => {
  let app;
  let pool;
  const password = 'SamePasswordForAllTestUsers1!';
  const users = {
    'owner@example.invalid': { position: 'Private Veterinarian' },
    'attacker@example.invalid': { position: 'Private Veterinarian' },
    'reviewer@example.invalid': { position: 'RabDash' },
    'cvo@example.invalid': { position: 'CVO' },
  };

  const loginAs = async (email) => {
    const agent = request.agent(app);
    await agent.post('/login').send({ email, password });
    return agent;
  };

  // Load once, not per-test: each loadApp() spins up a fresh Express app
  // (rate limiter, DB pool reconnect logic, etc.), and re-requiring app.js
  // seven times in one file leaks enough timers to eventually hang later
  // tests. Sessions are already isolated per supertest agent, so a shared
  // app instance across tests in this file is correct, not just faster.
  beforeAll(async () => {
    ({ app, pool } = loadApp());
    const hash = await bcrypt.hash(password, 10);
    mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', (values) => {
      const email = values[0];
      return users[email] ? [{ email, password: hash, position: users[email].position }] : [];
    });
    // The record being fought over: id 1, owned by owner@example.invalid.
    // Any other id (e.g. the "nonexistent record" test) resolves to no rows.
    mockQueryResult(pool, 'SELECT username FROM vaccination_form WHERE id = ?', (values) =>
      String(values[0]) === '1' ? [{ username: 'owner@example.invalid' }] : []
    );
  });

  test('a different user editing the record gets 403', async () => {
    const attacker = await loginAs('attacker@example.invalid');
    const res = await attacker.post('/editVaccinationForm').send({ id: 1, ownerName: 'Hacked' });
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  test('a different user deleting the record gets 403', async () => {
    const attacker = await loginAs('attacker@example.invalid');
    const res = await attacker.delete('/deleteVaccinationForm/1');
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  test('the actual owner can edit their own record', async () => {
    const owner = await loginAs('owner@example.invalid');
    const res = await owner.post('/editVaccinationForm').send({ id: 1, ownerName: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('the actual owner can delete their own record', async () => {
    const owner = await loginAs('owner@example.invalid');
    const res = await owner.delete('/deleteVaccinationForm/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('a RabDash reviewer can edit a record they do not own', async () => {
    const reviewer = await loginAs('reviewer@example.invalid');
    const res = await reviewer.post('/editVaccinationForm').send({ id: 1, ownerName: 'Reviewed' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('a RabDash reviewer can delete a record they do not own', async () => {
    const reviewer = await loginAs('reviewer@example.invalid');
    const res = await reviewer.delete('/deleteVaccinationForm/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // PROVISIONAL (see CLAUDE.md): CVO is not currently a reviewer — it does
  // NOT get the ownership-override RabDash gets, same as any other non-owner.
  test('a CVO account editing a record it does not own still gets 403', async () => {
    const cvo = await loginAs('cvo@example.invalid');
    const res = await cvo.post('/editVaccinationForm').send({ id: 1, ownerName: 'Should not work' });
    expect(res.status).toBe(403);
  });

  test('editing a nonexistent record id gets 404', async () => {
    const owner = await loginAs('owner@example.invalid');
    const res = await owner.post('/editVaccinationForm').send({ id: 999999, ownerName: 'Ghost' });
    expect(res.status).toBe(404);
  });
});
