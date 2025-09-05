/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

function executeModuleScript() {
  const scriptEl = document.querySelector('script[type="module"]');
  if (scriptEl && scriptEl.textContent) {
    // Execute the inline module script in test env
    new Function(scriptEl.textContent)();
  }
}

describe('UI Integration', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = html;
    // Basic localStorage mock
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    // Make fetch visible on window when tests mock global.fetch
    if (typeof window.fetch === 'undefined' && typeof global.fetch !== 'undefined') {
      window.fetch = global.fetch;
    }
    executeModuleScript();
  });

  test('Start/Pause/Reset should toggle timer text', () => {
    // navigate to session page
    document.getElementById('user-name-setup-input').value = 'User';
    document.getElementById('start-session-btn').click();

    const startBtn = document.getElementById('start-pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const timerDisplay = document.getElementById('timer-display');

    expect(timerDisplay.textContent).toContain('25:00');
    startBtn.click();
    expect(startBtn.textContent.toLowerCase()).toContain('pause');
    startBtn.click(); // pause
    expect(startBtn.textContent.toLowerCase()).toContain('start');
    resetBtn.click();
    expect(timerDisplay.textContent).toContain('25:00');
  });

  test('Enter in the idea input adds a task and top task appears as goal', async () => {
    document.getElementById('user-name-setup-input').value = 'User';
    document.getElementById('start-session-btn').click();

    const ideaInput = document.getElementById('todo-idea-input');
    const list = document.getElementById('todo-list');
    const goal = document.getElementById('goal-input');

    ideaInput.value = 'Build login';
    const ev = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    ideaInput.dispatchEvent(ev);

    await new Promise(r => setTimeout(r, 0));

    expect(list.children.length).toBeGreaterThan(0);
    expect(goal.value.toLowerCase()).toContain('build login');
  }, 10000);

  test('AI Agent unknown action falls back to dialog', async () => {
    document.getElementById('user-name-setup-input').value = 'User';
    document.getElementById('start-session-btn').click();

    // Mock Groq call to return a non-JSON response and then a reply
    window.fetch = jest.fn()
      // First call: classification prompt -> returns non-JSON
      .mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{ message: { content: 'not json' } }] }) })
      // Second call: dialog reply
      .mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{ message: { content: 'Hello there!' } }] }) });

    const openBtn = document.getElementById('ai-agent-btn');
    openBtn.click();

    const input = document.getElementById('ai-agent-input');
    const send = document.getElementById('ai-agent-send');
    input.value = 'tell me something nice';
    send.click();

    await new Promise(r => setTimeout(r, 0));

    const msgs = document.getElementById('ai-agent-messages');
    expect(msgs.textContent).toContain('Hello there');
  }, 10000);
});

