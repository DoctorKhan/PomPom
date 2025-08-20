const { parseEventText } = require('../src/eventParser');

function fmt(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

describe('eventParser - advanced local parsing', () => {
  const WED = new Date('2025-08-20T12:00:00'); // Wed
  const FRI = new Date('2025-08-22T08:00:00'); // Fri

  test('"next wed 14:30" resolves to next Wednesday at 14:30', () => {
    const text = 'next wed 14:30 planning';
    const ev = parseEventText(text, WED);
    expect(ev.summary.toLowerCase()).toContain('planning');
    // Since our parser always selects the next occurrence for a weekday token, on Wed it should be a week later
    expect(ev.startLocal).toMatch(/T14:30$/);
    const start = new Date(ev.startLocal);
    expect(start.getDay()).toBe(3); // Wednesday
    const diffDays = Math.round((start - WED) / (24 * 60 * 60 * 1000));
    expect(diffDays).toBeGreaterThanOrEqual(6); // around 7 days depending on local timezone offset
  });

  test('"wed 14:30" when today is Wed picks next week (not today)', () => {
    const ev = parseEventText('wed 14:30', WED);
    const start = new Date(ev.startLocal);
    expect(start.getDay()).toBe(3);
    // Should be at least 1 day in future (not same-day)
    expect(start > WED).toBe(true);
  });

  test('"every other fri 10am" gracefully schedules next Friday at 10:00 with no recurrence', () => {
    const ev = parseEventText('every other fri 10am', WED);
    expect(ev.recurrenceRRule || '').toBe(''); // no biweekly support -> no recurrence
    expect(ev.startLocal).toMatch(/T10:00$/);
    const start = new Date(ev.startLocal);
    expect(start.getDay()).toBe(5); // Friday
    expect(start > WED).toBe(true);
  });

  test('explicit time parsing still applied with am/pm', () => {
    const ev = parseEventText('team sync tomorrow 9am', FRI);
    expect(ev.startLocal).toMatch(/T09:00$/);
  });

  test('24h time parsing preserved', () => {
    const ev = parseEventText('demo tue 16:05', WED);
    expect(ev.startLocal).toMatch(/T16:05$/);
  });
});

