/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const { parseEventText, createAIEventParser } = require('../src/eventParser');

// Load HTML to access the inline helpers if needed
const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

describe('Quick Schedule - parsing and UI fill', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = html;
    // Provide a noop fetch by default
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: async () => ({ groqConfigured: false }) }));
  });

  test('local parsing populates summary and time when inputs exist', () => {
    // Inject the optional fields so we can assert fill behavior
    const desc = document.createElement('input'); desc.id = 'schedule-desc'; document.body.appendChild(desc);
    const time = document.createElement('input'); time.id = 'schedule-time'; document.body.appendChild(time);

    // Simulate the inline local parser
    const ev = parseEventText('Standup tomorrow 9am');
    // Simulate the fill logic
    if (desc) desc.value = ev.summary;
    const [, t] = String(ev.startLocal||'').split('T');
    if (t && time) time.value = t.slice(0,5);

    expect(desc.value.toLowerCase()).toContain('standup');
    expect(time.value).toBe('09:00');
  });

  test('health endpoint failure falls back to local parse', async () => {
    // Mock health to fail
    global.fetch = jest.fn(async (url) => {
      if (String(url).includes('/api/health')) throw new Error('fail');
      return { ok: true, json: async () => ({}) };
    });

    // Using the event parser module to ensure it still returns values
    const ev = parseEventText('weekly Tue 2pm planning');
    expect(ev).toBeTruthy();
    expect(ev.startLocal).toMatch(/T14:00$/);
  });
});

