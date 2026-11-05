const bcrypt = require('bcrypt');
const request = require('supertest');
const { loadApp, mockQueryResult } = require('./helpers');

// Every form type has its own submit/edit/delete route pointing at its own
// table. Most are one-line factory calls or near-identical copies, so the
// realistic bug is a route wired to the wrong table, or one that skips the
// ownership check — these tests run the same checks across every route
// rather than only the vaccination form (which idor.test.js and
// formValidation.test.js cover in more depth).
describe('form routes across every form type', () => {
  let app;
  let pool;
  const password = 'CorrectHorseBattery1!';
  const users = {
    'owner@example.invalid': 'Private Veterinarian',
    'other@example.invalid': 'Private Veterinarian',
    'reviewer@example.invalid': 'RabDash',
  };
  const agents = {};

  const submitRoutes = [
    ['/submitVaccinationForm', 'vaccination_form'],
    ['/submitNeuterForm', 'consent_form'],
    ['/submitRabiesSampleForms', 'bite_form'],
    ['/submitBudgetForm', 'budget_form'],
    ['/submitWeatherForm', 'weather_form'],
    ['/submitScheduleForm', 'schedule_form'],
    ['/submitIECForm', 'iec_form'],
    ['/submitAnimalControlForm', 'control_form'],
    ['/submitRabiesExposureForm', 'exposure_form'],
  ];
  const editRoutes = submitRoutes.map(([path, table]) => [path.replace('/submit', '/edit'), table]);
  const deleteRoutes = [
    ['/deleteVaccinationForm', 'vaccination_form'],
    ['/deleteNeuterForm', 'consent_form'],
    ['/deleteRabiesSampleForm', 'bite_form'],
    ['/deleteBudgetForm', 'budget_form'],
    ['/deleteScheduleForm', 'schedule_form'],
    ['/deleteIECForm', 'iec_form'],
    ['/deleteAnimalControlForm', 'control_form'],
    ['/deleteRabiesExposureForm', 'exposure_form'],
  ];

  const sqlCalls = (fragment) => pool.query.mock.calls.filter(([sql]) => sql.includes(fragment));

  // Rather than duplicating each form's field list here (which would drift
  // from routes/forms.js), ask the route itself: an empty submission is
  // rejected with a 400 naming every required field.
  const completeBody = async (agent, method, path, extra = {}) => {
    const res = await agent[method](path).send(extra);
    expect(res.status).toBe(400);
    const fields = res.body.message.replace(/^Missing required field\(s\): /, '').split(', ');
    return Object.fromEntries([...Object.entries(extra), ...fields.map((f) => [f, `test-${f}`])]);
  };

  beforeAll(async () => {
    ({ app, pool } = loadApp());
    const hash = await bcrypt.hash(password, 10);
    mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', (values) =>
      users[values[0]] ? [{ email: values[0], password: hash, position: users[values[0]] }] : []
    );
    // Record 1 in every table belongs to owner@; any other id doesn't exist.
    mockQueryResult(pool, 'SELECT username FROM', (values) =>
      String(values[0]) === '1' ? [{ username: 'owner@example.invalid' }] : []
    );
    mockQueryResult(pool, 'INSERT INTO', { insertId: 42 });
    // Log in once per user (the login route is rate-limited per IP, and
    // sessions are isolated per agent, so reusing them is safe).
    for (const email of Object.keys(users)) {
      agents[email] = request.agent(app);
      await agents[email].post('/login').send({ email, password });
    }
  });

  beforeEach(() => {
    pool.query.mockClear();
  });

  describe('submit', () => {
    test.each(submitRoutes)('%s inserts into %s, with the username taken from the session, not the request', async (path, table) => {
      const agent = agents['owner@example.invalid'];
      const body = await completeBody(agent, 'post', path);

      const res = await agent.post(path).send({ ...body, username: 'someone-else@example.invalid' });

      expect(res.body).toMatchObject({ success: true, id: 42 });
      const inserts = sqlCalls('INSERT INTO');
      expect(inserts).toHaveLength(1);
      const [[sql, values]] = inserts;
      expect(sql).toMatch(new RegExp(`^INSERT INTO ${table} \\(username,`));
      expect(values[0]).toBe('owner@example.invalid');
      expect(values).not.toContain('someone-else@example.invalid');
    });

    test.each(submitRoutes.map(([path]) => path))('%s requires a session', async (path) => {
      expect((await request(app).post(path).send({})).status).toBe(401);
    });
  });

  describe('edit', () => {
    test.each(editRoutes)('%s updates %s for the record owner', async (path, table) => {
      const agent = agents['owner@example.invalid'];
      const body = await completeBody(agent, 'post', path, { id: 1 });

      const res = await agent.post(path).send(body);

      expect(res.body.success).toBe(true);
      const updates = sqlCalls('UPDATE ');
      expect(updates).toHaveLength(1);
      expect(updates[0][0]).toMatch(new RegExp(`^UPDATE ${table} SET .* WHERE id=\\?$`));
      expect(updates[0][1][updates[0][1].length - 1]).toBe(1);
    });

    test.each(editRoutes)('%s refuses another user\'s record (403) without updating %s', async (path) => {
      const res = await agents['other@example.invalid'].post(path).send({ id: 1 });

      expect(res.status).toBe(403);
      expect(sqlCalls('UPDATE ')).toHaveLength(0);
    });
  });

  describe('delete', () => {
    test.each(deleteRoutes)('%s deletes from %s for the record owner', async (path, table) => {
      const res = await agents['owner@example.invalid'].delete(`${path}/1`);

      expect(res.body.success).toBe(true);
      expect(sqlCalls('DELETE FROM').map(([sql, values]) => [sql, values])).toEqual([
        [`DELETE FROM ${table} WHERE id = ?`, ['1']],
      ]);
    });

    test.each(deleteRoutes)('%s refuses another user\'s record (403) without deleting from %s', async (path) => {
      const res = await agents['other@example.invalid'].delete(`${path}/1`);

      expect(res.status).toBe(403);
      expect(sqlCalls('DELETE FROM')).toHaveLength(0);
    });

    test.each(deleteRoutes)('%s lets a RabDash reviewer delete any user\'s record from %s', async (path, table) => {
      const res = await agents['reviewer@example.invalid'].delete(`${path}/1`);

      expect(res.body.success).toBe(true);
      expect(sqlCalls(`DELETE FROM ${table}`)).toHaveLength(1);
    });

    test.each(deleteRoutes)('%s refuses records that came from the website database (403)', async (path) => {
      const res = await agents['reviewer@example.invalid'].delete(`${path}/1?dbOrigin=web`);

      expect(res.status).toBe(403);
      expect(sqlCalls('DELETE FROM')).toHaveLength(0);
    });

    test.each(deleteRoutes)('%s returns 404 for a record that does not exist', async (path) => {
      const res = await agents['owner@example.invalid'].delete(`${path}/999`);

      expect(res.status).toBe(404);
      expect(sqlCalls('DELETE FROM')).toHaveLength(0);
    });

    test.each(deleteRoutes.map(([path]) => path))('%s requires a session', async (path) => {
      expect((await request(app).delete(`${path}/1`)).status).toBe(401);
    });
  });

  // The three original list endpoints are hand-written rather than built
  // from the shared pagination factories (covered in pagination.test.js and
  // scopedPagination.test.js).
  describe('own-records lists', () => {
    const listRoutes = [
      ['/getVaccinationForms', 'vaccination_form'],
      ['/getNeuterForms', 'consent_form'],
      ['/getRabiesSampleForms', 'bite_form'],
    ];

    test.each(listRoutes)('%s returns only the logged-in user\'s %s rows, with dates as YYYY-MM-DD', async (path, table) => {
      mockQueryResult(pool, `SELECT * FROM ${table} WHERE username = ?`, (values) =>
        values[0] === 'owner@example.invalid'
          ? [{ id: 1, username: values[0], date: '2026-11-05T00:00:00.000Z', dateVaccinated: '2026-11-06T00:00:00.000Z' }]
          : []
      );

      const res = await agents['owner@example.invalid'].get(path);

      expect(res.status).toBe(200);
      expect(sqlCalls(`FROM ${table} WHERE username = ?`)[0][1]).toEqual(['owner@example.invalid']);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].date).toBe('2026-11-05');
      if (table === 'vaccination_form') {
        expect(res.body[0].dateVaccinated).toBe('2026-11-06');
      }
    });

    test.each(listRoutes)('%s is empty for a user with no %s rows', async (path) => {
      const res = await agents['other@example.invalid'].get(path);
      expect(res.body).toEqual([]);
    });

    test.each(listRoutes.map(([path]) => path))('%s requires a session', async (path) => {
      expect((await request(app).get(path)).status).toBe(401);
    });
  });
});
