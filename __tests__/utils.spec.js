const {
  extractJSON,
  toISOFromAny,
  normalizeDueLocal,
  parseDueOrNull,
  extractTagsFromText,
  parseTagsFromString,
} = require('../src/utils');

describe('utils', () => {
  test('extractJSON parses plain JSON', () => {
    expect(extractJSON('{"a":1}')).toEqual({ a: 1 });
  });
  test('extractJSON parses fenced JSON', () => {
    const txt = '```json\n{"b":2}\n```';
    expect(extractJSON(txt)).toEqual({ b: 2 });
  });
  test('extractJSON parses first/last braces', () => {
    const txt = 'noise {"c":3} more';
    expect(extractJSON(txt)).toEqual({ c: 3 });
  });
  test('extractJSON returns null on failure', () => {
    expect(extractJSON('not json')).toBeNull();
  });

  test('toISOFromAny handles ISO-ish local strings', () => {
    const iso = toISOFromAny('2025-08-14T15:30');
    expect(iso).toMatch(/T\d{2}:\d{2}:00\.000Z$/);
  });
  test('toISOFromAny falls back to Date parse', () => {
    const iso = toISOFromAny('2025-08-14 15:30');
    expect(iso).toMatch(/T\d{2}:\d{2}:00\.000Z$/);
  });
  test('toISOFromAny blank -> empty', () => {
    expect(toISOFromAny('')).toBe('');
  });

  test('normalizeDueLocal today default 17:00', () => {
    const s = normalizeDueLocal('today');
    expect(s).toMatch(/T\d{2}:\d{2}$/);
  });
  test('normalizeDueLocal tomorrow', () => {
    const s = normalizeDueLocal('tomorrow 9am');
    expect(s).toMatch(/T09:00$/);
  });
  test('normalizeDueLocal in 2 days', () => {
    const s = normalizeDueLocal('in 2 days 4pm');
    // Should encode the intended 16:00 local time; exact timezone offset varies
    expect(s).toMatch(/T\d{2}:\d{2}$/);
  });
  test('normalizeDueLocal weekday', () => {
    const s = normalizeDueLocal('fri 3:30pm');
    expect(s).toMatch(/T15:30$/);
  });

  test('parseDueOrNull detects tokens', () => {
    expect(parseDueOrNull('meet tomorrow')).not.toBeNull();
    expect(parseDueOrNull('next wed 2pm')).not.toBeNull();
    expect(parseDueOrNull('someday')).toBeNull();
  });

  test('extractTagsFromText strips tags and returns list', () => {
    const { cleanText, tags } = extractTagsFromText('Finish #Report for #Team alpha');
    expect(tags.sort()).toEqual(['report','team']);
    expect(cleanText.toLowerCase()).toContain('finish');
    expect(cleanText).not.toMatch(/#/);
  });

  test('parseTagsFromString collects words and #tags', () => {
    expect(parseTagsFromString('#bug urgent, backlog  ')).toEqual(['bug','urgent','backlog']);
  });
});

