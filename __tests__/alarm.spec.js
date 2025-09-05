/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

function executeModuleScript() {
  const scriptEl = document.querySelector('script[type="module"]');
  if (scriptEl && scriptEl.textContent) {
    new Function(scriptEl.textContent)();
  }
}

describe('Alarm Sound', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.documentElement.innerHTML = html;
    // Mock sound to avoid jsdom Audio not implemented
    window.playGong = jest.fn(() => { window.__LAST_GONG_PLAYED = Date.now(); });
    // Make sure fetch exists for any AI calls indirectly
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: async () => ({ choices: [{ message: { content: '{}' } }] }) }));
    executeModuleScript();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('plays gong when timer completes (short duration override)', () => {
    // Start session
    document.getElementById('user-name-setup-input').value = 'User';
    document.getElementById('start-session-btn').click();

    // Override to 2 seconds to make test quick
    window.__TIMER_SECONDS_OVERRIDE = 2;

    const startBtn = document.getElementById('start-pause-btn');
    startBtn.click(); // start

    // Advance timers to trigger tick interval and completion
    jest.advanceTimersByTime(2200);

    expect(window.playGong).toHaveBeenCalled();
    expect(window.__LAST_GONG_PLAYED).toBeDefined();
  });
});

