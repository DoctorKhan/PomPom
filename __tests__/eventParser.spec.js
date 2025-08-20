const { parseEventText, createAIEventParser } = require('../src/eventParser');

function fmt(d) {
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	const hh = String(d.getHours()).padStart(2, '0');
	const mi = String(d.getMinutes()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

describe('eventParser - local parsing', () => {
	const NOW = new Date('2025-08-19T12:00:00'); // local time reference for tests

	test('parses weekly meeting on Monday at 2pm', () => {
		const text = 'Weekly Group Meeting Monday at 2pm';
		const ev = parseEventText(text, NOW);
		expect(ev).toBeTruthy();
		expect(ev.summary.toLowerCase()).toContain('group meeting');
		// Should be weekly recurrence and Monday
		expect(ev.recurrenceRRule).toMatch(/FREQ=WEEKLY/);
		expect(ev.recurrenceRRule).toMatch(/BYDAY=MO/);
		// Time should be 14:00 local
		expect(ev.startLocal).toMatch(/T14:00$/);
		// Verify computed day is Monday (1)
		const localDate = new Date(ev.startLocal);
		expect(localDate.getDay()).toBe(1);
		// End should be one hour later
		const endLocal = new Date(ev.endLocal);
		expect((endLocal - localDate) / (60 * 1000)).toBe(60);
	});

	test('parses tomorrow at 9am (no recurrence)', () => {
		const text = 'Team Sync tomorrow 9am';
		const ev = parseEventText(text, NOW);
		expect(ev.summary.toLowerCase()).toContain('team sync');
		expect(ev.recurrenceRRule || '').toBe('');
		expect(ev.startLocal).toMatch(/T09:00$/);
		const start = new Date(ev.startLocal);
		const expected = new Date(NOW);
		expected.setDate(expected.getDate() + 1);
		expected.setHours(9, 0, 0, 0);
		expect(fmt(start)).toBe(fmt(expected));
	});

	test('parses short weekday and 24h time', () => {
		const text = 'Code Review Fri 16:30';
		const ev = parseEventText(text, NOW);
		expect(ev.summary.toLowerCase()).toContain('code review');
		expect(ev.recurrenceRRule || '').toBe('');
		expect(ev.startLocal).toMatch(/T16:30$/);
	});
});

describe('eventParser - AI parsing', () => {
	test('uses AI endpoint to parse when provided', async () => {
		const doFetch = jest.fn(async () => ({
			ok: true,
			json: async () => ({
				choices: [
					{ message: { content: '{"summary":"Sprint Planning","startLocal":"2025-08-20T10:00","endLocal":"2025-08-20T11:00","recurrenceRRule":""}' } }
				]
			})
		}));
		const aiParse = createAIEventParser({ doFetch });
		const ev = await aiParse('Sprint Planning tomorrow 10am');
		expect(doFetch).toHaveBeenCalled();
		expect(ev.summary).toBe('Sprint Planning');
		expect(ev.startLocal).toBe('2025-08-20T10:00');
		expect(ev.endLocal).toBe('2025-08-20T11:00');
	});
});
