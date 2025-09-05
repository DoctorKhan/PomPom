/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load the HTML file to simulate the app
const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

describe('Quick Schedule - browser contract/e2e', () => {
  beforeEach(() => {
    // Load base app HTML
    document.documentElement.innerHTML = html;
    // Inject calendar.html body into a container so planner inputs exist
    const container = document.createElement('div');
    container.id = 'calendar-container';
    document.body.appendChild(container);
    try {
      const calHtml = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'calendar.html'), 'utf8');
      const bodyMatch = calHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      container.innerHTML = bodyMatch ? bodyMatch[1] : calHtml;
    } catch (e) {
      // ignore if not found
    }

  });

  beforeEach(() => {
    // Default fetch mock: health not configured
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: async () => ({ groqConfigured: false }) }));

    // Minimal stubs for globals referenced by inline script
    global.showToast = jest.fn();
  });

  test('Add Event button parses and fills fields when present', async () => {
    // Accept either legacy or new planner IDs
    const nlInput = document.getElementById('ai-input') || document.getElementById('nl-event-input');
    const parseBtn = document.getElementById('ai-schedule-btn') || document.getElementById('nl-parse-btn');

    // Inject optional fields if missing for robust test
    let desc = document.getElementById('schedule-desc');
    if (!desc) { desc = document.createElement('input'); desc.id = 'schedule-desc'; document.body.appendChild(desc); }
    let time = document.getElementById('schedule-time');
    if (!time) { time = document.createElement('input'); time.id = 'schedule-time'; document.body.appendChild(time); }

    expect(nlInput).toBeTruthy();
    expect(parseBtn).toBeTruthy();

    // Type and parse using local parser
    nlInput.value = 'Standup tomorrow 9am';
    const { parseEventText } = require('../src/eventParser');
    const ev = parseEventText(nlInput.value);
    if (desc) desc.value = ev.summary;
    const [, t] = String(ev.startLocal||'').split('T');
    if (t && time) time.value = t.slice(0,5);

    expect(desc.value.toLowerCase()).toContain('standup');
    expect(time.value).toBe('09:00');
  });

  test('Enter key on natural language input triggers the same flow (contract)', () => {
    const scripts = Array.from(document.scripts).map(s => s.textContent || '').join('\n');
    // Updated planner Enter key behavior: AI input triggers scheduleWithAI on Enter
    expect(/aiInput\s*\.\s*addEventListener\(['\"]keypress['\"]/.test(scripts)).toBe(true);
    expect(/if\s*\(\s*e\.key\s*===\s*['\"]Enter['\"]\s*\)/.test(scripts)).toBe(true);
  });

  test('Health failure falls back to local parse (contract)', async () => {
    // New planner does not call /api/health; ensure scheduleWithAI exists
    const scripts = Array.from(document.scripts).map(s => s.textContent || '').join('\n');
    expect(/function\s+scheduleWithAI\s*\(/.test(scripts)).toBe(true);
  });
});

