import { isValidEmail, normalizeEmail } from '../email';

describe('isValidEmail', () => {
  test.each([
    'vet@example.com',
    'juan.dela-cruz@davaocity.gov.ph',
    'name+rabdash@gmail.com',
    'staff@cityvet.agency',
    'someone@museum.museum',
    '  padded@example.com ',
  ])('accepts %p', (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  test.each(['', '   ', 'not-an-email', 'missing-at.example.com', 'no-dot@example', 'two@@example.com', 'has space@example.com', undefined, null])(
    'rejects %p',
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    }
  );
});

describe('normalizeEmail', () => {
  test('trims surrounding whitespace (e.g. a space left by keyboard autocomplete)', () => {
    expect(normalizeEmail('  vet@example.com ')).toBe('vet@example.com');
  });

  test('treats missing values as empty', () => {
    expect(normalizeEmail(undefined)).toBe('');
  });
});
