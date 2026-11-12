import { formatRelativeDay } from '../relativeDate';

describe('formatRelativeDay', () => {
  const now = new Date(2026, 10, 12, 9, 30); // Nov 12 2026, 9:30 local

  test.each([
    [new Date(2026, 10, 12, 0, 5), 'Today'],
    [new Date(2026, 10, 11, 23, 59), 'Yesterday'],
    [new Date(2026, 10, 9, 14, 0), 'Nov 9'],
    [new Date(2025, 11, 30, 8, 0), 'Dec 30, 2025'],
  ])('%s → %s', (date, expected) => {
    expect(formatRelativeDay(date, now)).toBe(expected);
  });

  test('accepts an ISO string, and returns empty text for an invalid date', () => {
    expect(formatRelativeDay(new Date(2026, 10, 12, 1).toISOString(), now)).toBe('Today');
    expect(formatRelativeDay('not a date', now)).toBe('');
  });
});
