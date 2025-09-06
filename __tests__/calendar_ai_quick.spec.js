/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Calendar AI Quick Schedule', () => {
  let html;
  beforeAll(() => {
    html = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'calendar.html'), 'utf8');
  });

  function runInlineScripts() {
    const scripts = Array.from(document.querySelectorAll('script'));
    scripts.forEach(s => { const code = s.textContent || ''; if (code.includes('DOMContentLoaded')) { new Function(code)(); } });
    document.dispatchEvent(new Event('DOMContentLoaded'));
  }

  beforeEach(() => {
    document.documentElement.innerHTML = html;
    runInlineScripts();
  });

  test('Enter in ai-input schedules event and renders it in a time slot', () => {
    const aiInput = document.getElementById('ai-input');
    const timeSlots = document.getElementById('time-slots');
    expect(aiInput).toBeTruthy();

    aiInput.value = 'Standup tomorrow at 9am';
    const evt = new KeyboardEvent('keypress', { key: 'Enter', bubbles: true });
    aiInput.dispatchEvent(evt);

    const text = timeSlots.textContent || '';
    expect(text.toLowerCase()).toContain('standup');
  });

  test('Click on ai-schedule-btn also schedules', () => {
    const aiInput = document.getElementById('ai-input');
    const btn = document.getElementById('ai-schedule-btn');
    expect(btn).toBeTruthy();
    aiInput.value = 'Lunch tomorrow 1pm';
    btn.click();
    const text = (document.getElementById('time-slots').textContent || '').toLowerCase();
    expect(text).toContain('lunch');
  });
});

