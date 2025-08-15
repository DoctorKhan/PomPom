const { bestMatchOwner, formatDateTimeForOwner } = require('../src/utils');

describe('bestMatchOwner', () => {
  const members = ['Soft Cloud', 'Alice Johnson', 'Bob Lee'];

  test('returns fallback when members empty or no input', () => {
    expect(bestMatchOwner('', members, 'Me')).toBe('Me');
    expect(bestMatchOwner('  ', [], 'Me')).toBe('Me');
  });

  test('exact match', () => {
    expect(bestMatchOwner('Alice Johnson', members, 'Me')).toBe('Alice Johnson');
  });

  test('startsWith token match', () => {
    expect(bestMatchOwner('alice', members, 'Me')).toBe('Alice Johnson');
  });

  test('includes token match', () => {
    expect(bestMatchOwner('john', members, 'Me')).toBe('Alice Johnson');
  });
});

describe('formatDateTimeForOwner', () => {
  test('formats when valid date string', () => {
    const out = formatDateTimeForOwner('2025-08-14T15:30:00.000Z', 'UTC');
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(5);
  });
  test('returns dash on invalid input', () => {
    expect(formatDateTimeForOwner('', 'UTC')).toBe('—');
    expect(formatDateTimeForOwner('not-a-date', 'UTC')).toBe('—');
  });
});

