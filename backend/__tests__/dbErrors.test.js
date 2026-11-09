const bcrypt = require('bcrypt');
const request = require('supertest');
const { loadApp, mockQueryResult } = require('./helpers');

// What every route does when the database fails mid-request (Hostinger
// down, connection dropped, etc.): a 500 the app can show as "please try
// again", never a hang, a crash, or the raw MySQL error text in the
// response.
describe('database failures', () => {
  let app;
  let pool;
  let webPool;
  let agent;
  let dbDown = false;
  let ip = 0;
  const password = 'CorrectHorseBattery1!';
  const SQL_ERROR = 'ER_SECRET_DETAIL: connect ECONNREFUSED 10.0.0.1:3306';

  // Auth routes are rate-limited per IP; give each request its own.
  const post = (path) => request(app).post(path).set('X-Forwarded-For', `10.9.0.${++ip}`);

  const expectSafe500 = (res) => {
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('ER_SECRET_DETAIL');
    expect(JSON.stringify(res.body)).not.toContain('ECONNREFUSED');
  };

  beforeAll(async () => {
    ({ app, pool, webPool } = loadApp());
    const hash = await bcrypt.hash(password, 10);
    // Every query fails while dbDown is set, except the login lookup used to
    // get a session in the first place.
    for (const p of [pool, webPool]) {
      mockQueryResult(p, '', () => (dbDown ? new Error(SQL_ERROR) : []));
    }
    mockQueryResult(pool, 'SELECT username FROM', () => (dbDown ? new Error(SQL_ERROR) : [{ username: 'owner@example.invalid' }]));
    mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', (values) => {
      if (dbDown) return new Error(SQL_ERROR);
      return values[0] === 'owner@example.invalid' ? [{ email: values[0], password: hash, position: 'Private Veterinarian' }] : [];
    });
    agent = request.agent(app);
    const login = await agent.post('/login').send({ email: 'owner@example.invalid', password });
    expect(login.body.success).toBe(true);
  });

  beforeEach(() => {
    dbDown = true;
  });

  afterAll(() => {
    dbDown = false;
  });

  test('login reports a server error (500), not "invalid email or password"', async () => {
    const res = await post('/login').send({ email: 'owner@example.invalid', password });

    expectSafe500(res);
    expect(res.body.message).not.toMatch(/invalid email or password/i);
  });

  test.each([
    ['/resetpass', { email: 'a@example.invalid' }],
    ['/reset-password', { email: 'a@example.invalid', oldPassword: 'OldPassword1!', newPassword: 'NewPassword1!' }],
    ['/reset-forgotten-password', { email: 'a@example.invalid', newPassword: 'NewPassword1!' }],
  ])('%s returns a safe 500', async (path, body) => {
    expectSafe500(await post(path).send(body));
  });

  test('/userProfile returns a safe 500', async () => {
    expectSafe500(await agent.get('/userProfile'));
  });

  const forms = ['Vaccination', 'Neuter', 'RabiesSample', 'Budget', 'Schedule', 'IEC', 'AnimalControl', 'RabiesExposure'];
  const submitPath = (f) => (f === 'RabiesSample' ? '/submitRabiesSampleForms' : `/submit${f}Form`);

  test.each(forms)('submitting a %s form returns a safe 500', async (form) => {
    // Fields are checked before the insert, so send every one the route asks for.
    dbDown = false;
    const missing = (await agent.post(submitPath(form)).send({})).body.message;
    const body = Object.fromEntries(missing.replace(/^Missing required field\(s\): /, '').split(', ').map((f) => [f, 'x']));
    dbDown = true;

    expectSafe500(await agent.post(submitPath(form)).send(body));
  });

  test.each(forms)('editing a %s form returns a safe 500', async (form) => {
    expectSafe500(await agent.post(submitPath(form).replace('/submit', '/edit')).send({ id: 1 }));
  });

  test.each(forms)('deleting a %s form returns a safe 500', async (form) => {
    expectSafe500(await agent.delete(`/delete${form}Form/1`));
  });

  test.each([
    '/getVaccinationForms',
    '/getNeuterForms',
    '/getRabiesSampleForms',
    '/getBudgetForms',
    '/getScheduleForms',
    '/getIECForms',
    '/getAnimalControlForms',
    '/getRabiesExposureForms',
  ])('%s returns a safe 500', async (path) => {
    expectSafe500(await agent.get(path));
  });
});
