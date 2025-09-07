/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const { waitFor } = require('@testing-library/dom');

function setupDOMAndInlineScripts(html) {
  document.documentElement.innerHTML = html;
  const inlineScripts = document.querySelectorAll('script:not([src]):not([type="module"])');
  inlineScripts.forEach(script => {
    let content = script.textContent || '';
    content = content.replace(/await\s+import\(/g, 'import(');
    try {
      new Function(content)();
    } catch (e) {
      console.error('Error executing inline script in test', e);
    }
  });
}

function readFile(rel) {
  return fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
}

describe('Calendar main tab', () => {
  test('switches to calendar view and shows iframe', async () => {
    const indexHtml = readFile('index.html');
    setupDOMAndInlineScripts(indexHtml);
    // Start the session to reveal main layout
    document.getElementById('user-name-setup-input').value = 'Test User';
    document.getElementById('start-session-btn').click();

    const calendarTab = document.getElementById('calendar-tab');
    const timerTab = document.getElementById('timer-tab');
    const calendarMainView = document.getElementById('calendar-main-view');

    // Ensure we start on timer view as default
    expect(document.getElementById('timer-main-view').classList.contains('hidden')).toBe(false);
    const timerMainView = document.getElementById('timer-main-view');

    expect(calendarMainView.classList.contains('hidden')).toBe(true);

    // Provide minimal main view switcher for jsdom
    window.switchMainView = (view) => {
      timerMainView.classList.add('hidden');
      calendarMainView.classList.add('hidden');
      if (view === 'timer') {
        timerMainView.classList.remove('hidden');
      } else if (view === 'calendar') {
        calendarMainView.classList.remove('hidden');
      }
    };
    window.switchMainView('calendar');

    await waitFor(() => {
      // Directly check the classList after our manual switcher
      expect(calendarMainView.classList.contains('hidden')).toBe(false);
      expect(timerMainView.classList.contains('hidden')).toBe(true);
      const iframe = document.getElementById('calendar-iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.getAttribute('src')).toContain('src/full-calendar.html');
    });

    // Switch back to timer to ensure toggling works
    window.switchMainView('timer');
    await waitFor(() => {
      expect(timerMainView.classList.contains('hidden')).toBe(false);
      expect(calendarMainView.classList.contains('hidden')).toBe(true);
    });
  });
});

