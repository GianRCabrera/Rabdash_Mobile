import { getResetPasswordEmail } from '../deepLink';

describe('getResetPasswordEmail', () => {
  test.each([
    ['rabdashmobile://reset-password?email=staff%40example.com', 'staff@example.com'],
    ['exp://127.0.0.1:8081/--/reset-password?email=staff@example.com', 'staff@example.com'],
    ['rabdashmobile://reset-password?foo=1&email=name%2Brabdash%40gmail.com#top', 'name+rabdash@gmail.com'],
  ])('reads the email from %s', (url, email) => {
    expect(getResetPasswordEmail(url)).toBe(email);
  });

  test.each([
    'rabdashmobile://login?email=staff%40example.com',
    'rabdashmobile://reset-password',
    'rabdashmobile://reset-password?email=',
    'rabdashmobile://reset-password?email=%E0%A4%A',
    null,
  ])('returns null for %s', (url) => {
    expect(getResetPasswordEmail(url)).toBeNull();
  });

  test('a huge malformed link is handled quickly instead of freezing', () => {
    const url = `rabdashmobile://reset-password?email=${'%'.repeat(50000)}${'%E0'.repeat(50000)}`;
    const start = Date.now();
    expect(getResetPasswordEmail(url)).toBeNull();
    expect(Date.now() - start).toBeLessThan(500);
  });
});
