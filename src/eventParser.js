// Event parsing utilities for natural language scheduling
// Exports:
// - parseEventText(text, now?): returns { summary, startLocal, endLocal, recurrenceRRule }
// - createAIEventParser({ doFetch }): returns async (text) => same shape as above using server AI proxy

const WEEKDAYS = {
	sunday: 0, sun: 0,
	monday: 1, mon: 1,
	tuesday: 2, tue: 2, tues: 2,
	wednesday: 3, wed: 3,
	thursday: 4, thu: 4, thur: 4, thurs: 4,
	friday: 5, fri: 5,
	saturday: 6, sat: 6,
};

function toParts(d) {
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	const hh = String(d.getHours()).padStart(2, '0');
	const mi = String(d.getMinutes()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function parseTime(text) {
	const t = (text || '').toLowerCase();
	// 1) am/pm format e.g., 2pm, 2:30pm, 11 am
	let m = t.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
	if (m) {
		let hh = parseInt(m[1], 10);
		const mm = m[2] ? parseInt(m[2], 10) : 0;
		const ap = m[3];
		if (ap === 'pm' && hh < 12) hh += 12;
		if (ap === 'am' && hh === 12) hh = 0;
		return { hours: hh, minutes: mm };
	}
	// 2) 24h time e.g., 16:30 or 9:00
	m = t.match(/\b(\d{1,2}):(\d{2})\b/);
	if (m) {
		return { hours: parseInt(m[1], 10), minutes: parseInt(m[2], 10) };
	}
	return null;
}

function nextWeekdayDate(now, weekdayIdx) {
	const d = new Date(now);
	const cur = d.getDay();
	let diff = (weekdayIdx - cur + 7) % 7;
	if (diff === 0) diff = 7; // next occurrence, not today
	d.setDate(d.getDate() + diff);
	return d;
}

function findWeekdayToken(text) {
	const t = (text || '').toLowerCase();
	const keys = Object.keys(WEEKDAYS);
	const key = keys.find(k => new RegExp(`\\b${k}\\b`).test(t));
	return key ? WEEKDAYS[key] : null;
}

function inferSummary(text) {
	// Remove basic time/weekday words for a cleaner summary
	const t = (text || '').replace(/\b(today|tomorrow|at|on)\b/gi, ' ')
		.replace(/\b(mon|monday|tue|tues|tuesday|wed|wednesday|thu|thur|thurs|thursday|fri|friday|sat|saturday|sun|sunday)\b/gi, ' ')
		.replace(/\b(\d{1,2})(?::\d{2})?\s*(am|pm)?\b/gi, ' ')
		.replace(/\s{2,}/g, ' ')
		.trim();
	return t || 'New Event';
}

function parseEventText(text, now = new Date()) {
	const lower = (text || '').toLowerCase();
	const hasWeeklyCue = /\bweekly\b/.test(lower);
	const weekdayIdx = findWeekdayToken(text);
	const time = parseTime(text) || { hours: 9, minutes: 0 };

	let start = new Date(now);
	if (/\btomorrow\b/.test(lower)) {
		start.setDate(start.getDate() + 1);
	} else if (/\btoday\b/.test(lower)) {
		// leave date as today
	} else if (weekdayIdx !== null) {
		start = nextWeekdayDate(now, weekdayIdx);
	}
	start.setHours(time.hours, time.minutes, 0, 0);

	// Default 60 minutes duration
	const end = new Date(start.getTime() + 60 * 60 * 1000);

	let rrule = '';
	if (hasWeeklyCue && weekdayIdx !== null) {
		const byday = ['SU','MO','TU','WE','TH','FR','SA'][weekdayIdx];
		rrule = `FREQ=WEEKLY;BYDAY=${byday}`;
	}

	return {
		summary: inferSummary(text),
		startLocal: toParts(start),
		endLocal: toParts(end),
		recurrenceRRule: rrule,
	};
}

function extractJSON(text) {
	try { return JSON.parse(text); } catch {}
	const match = String(text || '').match(/```(?:json)?\s*([\s\S]*?)```/i);
	if (match) { try { return JSON.parse(match[1]); } catch {} }
	const i = String(text || '').indexOf('{');
	const j = String(text || '').lastIndexOf('}');
	if (i !== -1 && j !== -1 && j > i) { try { return JSON.parse(text.slice(i, j + 1)); } catch {} }
	return null;
}

function createAIEventParser({ doFetch = (url, opts) => fetch(url, opts) } = {}) {
	return async function aiParse(text) {
		const prompt = `You convert scheduling text to JSON with fields: summary, startLocal (YYYY-MM-DDTHH:MM), endLocal, recurrenceRRule (or empty). Only return JSON.`;
		const body = {
			model: 'llama-3.1-8b-instant',
			messages: [
				{ role: 'system', content: prompt },
				{ role: 'user', content: text }
			],
			temperature: 0.1,
		};
		const resp = await doFetch('/api/groq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
		if (!resp || !resp.ok) throw new Error('AI parsing failed');
		const data = await resp.json();
		const content = data?.choices?.[0]?.message?.content || '';
		const obj = extractJSON(content);
		if (!obj) throw new Error('AI returned no JSON');
		// Basic normalization and defaults
		return {
			summary: obj.summary || inferSummary(text),
			startLocal: obj.startLocal || parseEventText(text).startLocal,
			endLocal: obj.endLocal || parseEventText(text).endLocal,
			recurrenceRRule: obj.recurrenceRRule || '',
		};
	};
}

module.exports = { parseEventText, createAIEventParser };
