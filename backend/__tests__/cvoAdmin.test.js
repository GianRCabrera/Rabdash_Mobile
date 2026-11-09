const bcrypt = require('bcrypt');
const request = require('supertest');
const { loadApp, mockQueryResult } = require('./helpers');
const { createOrUpdateUser } = require('../scripts/createUser');

// CVO Admin (CVO's admin/IT staff) can see every user's submissions but can
// only change their own. Plain CVO stays limited to its own submissions,
// since anyone can sign up as CVO.
describe('CVO Admin role', () => {
  let app;
  let pool;
  let webPool;
  const password = 'CorrectHorseBattery1!';
  const users = {
    'admin@example.invalid': 'CVO Admin',
    'cvo@example.invalid': 'CVO',
  };
  const agents = {};
  const sqlCalls = (fragment) => pool.query.mock.calls.filter(([sql]) => sql.includes(fragment));

  beforeAll(async () => {
    ({ app, pool, webPool } = loadApp());
    const hash = await bcrypt.hash(password, 10);
    mockQueryResult(pool, 'SELECT * FROM users WHERE email = ?', (values) =>
      users[values[0]] ? [{ email: values[0], password: hash, position: users[values[0]] }] : []
    );
    // Record 1 belongs to some vet; record 2 belongs to the CVO Admin.
    mockQueryResult(pool, 'SELECT username FROM', (values) =>
      ({ 1: [{ username: 'vet@example.invalid' }], 2: [{ username: 'admin@example.invalid' }] })[values[0]] || []
    );
    mockQueryResult(pool, 'COUNT(*) AS total', [{ total: 0 }]);
    mockQueryResult(webPool, 'COUNT(*) AS total', [{ total: 0 }]);
    for (const email of Object.keys(users)) {
      agents[email] = request.agent(app);
      await agents[email].post('/login').send({ email, password });
    }
  });

  beforeEach(() => {
    pool.query.mockClear();
  });

  test.each(['/getVaccinationFormsCVO', '/getNeuterFormsCVO', '/getRabiesSampleFormsCVO'])(
    '%s: CVO Admin can open the all-users list, plain CVO cannot',
    async (path) => {
      expect((await agents['admin@example.invalid'].get(path)).status).toBe(200);
      expect((await agents['cvo@example.invalid'].get(path)).status).toBe(403);
    }
  );

  test('CVO Admin gets every user\'s Animal Control records (no username filter)', async () => {
    const res = await agents['admin@example.invalid'].get('/getAnimalControlForms');

    expect(res.status).toBe(200);
    const [[sql]] = sqlCalls('SELECT * FROM control_form');
    expect(sql).not.toContain('username = ?');
  });

  test('plain CVO still gets only their own Animal Control records', async () => {
    await agents['cvo@example.invalid'].get('/getAnimalControlForms');

    const [[sql, values]] = sqlCalls('SELECT * FROM control_form');
    expect(sql).toContain('username = ?');
    expect(values[0]).toBe('cvo@example.invalid');
  });

  test('CVO Admin cannot edit another user\'s record', async () => {
    const res = await agents['admin@example.invalid'].post('/editBudgetForm').send({ id: 1 });

    expect(res.status).toBe(403);
    expect(sqlCalls('UPDATE ')).toHaveLength(0);
  });

  test('CVO Admin cannot delete another user\'s record', async () => {
    const res = await agents['admin@example.invalid'].delete('/deleteBudgetForm/1');

    expect(res.status).toBe(403);
    expect(sqlCalls('DELETE FROM')).toHaveLength(0);
  });

  test('CVO Admin can delete their own record', async () => {
    const res = await agents['admin@example.invalid'].delete('/deleteBudgetForm/2');

    expect(res.body.success).toBe(true);
    expect(sqlCalls('DELETE FROM budget_form')).toHaveLength(1);
  });
});

describe('npm run create-user (createOrUpdateUser)', () => {
  const fakeDb = (existingPosition) => {
    const calls = [];
    return {
      calls,
      query: jest.fn(async (sql, values) => {
        calls.push([sql, values]);
        if (sql.startsWith('SELECT')) return [existingPosition ? [{ position: existingPosition }] : []];
        return [{}];
      }),
    };
  };
  const details = { name: 'Ana', lastName: 'Cruz', email: 'ana@example.invalid', position: 'CVO Admin', password: 'LongEnough1' };

  test('creates a new account with a bcrypt-hashed password', async () => {
    const db = fakeDb();

    expect(await createOrUpdateUser(db, details, jest.fn())).toBe('created');

    const [sql, values] = db.calls[1];
    expect(sql).toMatch(/^INSERT INTO users/);
    expect(values.slice(0, 4)).toEqual(['Ana', 'Cruz', 'ana@example.invalid', 'CVO Admin']);
    expect(values[4]).toMatch(/^\$2[ab]\$/);
    expect(await bcrypt.compare('LongEnough1', values[4])).toBe(true);
  });

  test('changes an existing account\'s position only after confirmation', async () => {
    const declined = fakeDb('CVO');
    expect(await createOrUpdateUser(declined, details, async () => false)).toBe('exists');
    expect(declined.calls).toHaveLength(1);

    const confirmed = fakeDb('CVO');
    expect(await createOrUpdateUser(confirmed, details, async () => true)).toBe('updated');
    expect(confirmed.calls[1]).toEqual(['UPDATE users SET position = ?, updated_at = ? WHERE email = ?', ['CVO Admin', expect.any(String), 'ana@example.invalid']]);
  });

  test.each([
    [{ position: 'Superuser' }, /Unknown position/],
    [{ email: 'not-an-email' }, /Not a valid email/],
    [{ password: 'short' }, /at least 8/],
  ])('rejects %o', async (override, message) => {
    const db = fakeDb();
    await expect(createOrUpdateUser(db, { ...details, ...override }, jest.fn())).rejects.toThrow(message);
    expect(db.calls.filter(([sql]) => !sql.startsWith('SELECT'))).toHaveLength(0);
  });
});
