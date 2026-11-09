const bcrypt = require('bcrypt');
const { verifyPassword } = require('../lib/passwords');

describe('verifyPassword (bcrypt only)', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('accepts the right password and rejects a wrong one', async () => {
    const hash = await bcrypt.hash('Right1!', 4);
    expect(await verifyPassword('Right1!', hash)).toBe(true);
    expect(await verifyPassword('Wrong1!', hash)).toBe(false);
  });

  test('accepts PHP/Laravel-style $2y$ hashes from the website database', async () => {
    const hash = (await bcrypt.hash('Right1!', 4)).replace(/^\$2b\$/, '$2y$');
    expect(await verifyPassword('Right1!', hash)).toBe(true);
  });

  test.each([
    ['an argon2 hash (support removed Nov 2026)', '$argon2id$v=19$m=65536,t=3,p=4$c2FsdHNhbHQ$aGFzaGhhc2g'],
    ['a plaintext password stored by hand', 'Right1!'],
  ])('treats %s as a failed login instead of throwing', async (_label, stored) => {
    expect(await verifyPassword('Right1!', stored)).toBe(false);
  });
});
