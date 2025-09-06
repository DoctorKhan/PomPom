/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

function executeInlineNonModuleScripts() {
  const scripts = Array.from(document.querySelectorAll('script'));
  scripts.forEach((script) => {
    const type = (script.getAttribute('type') || '').toLowerCase();
    if (type === 'module') return; // skip module script
    if (script.src) return; // skip external src
    const code = script.textContent || '';
    if (!code.trim()) return;
    try { new Function(code)(); } catch (e) { /* ignore in tests */ }
  });
}

describe('Welcome Enter key starts session', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    executeInlineNonModuleScripts();
  });

  test('pressing Enter in name input triggers Start Focusing flow', () => {
    const nameInput = document.getElementById('user-name-setup-input');
    const teamInput = document.getElementById('session-name-input');
    const startBtn = document.getElementById('start-session-btn');
    const welcomePage = document.getElementById('welcome-page');
    const sessionPage = document.getElementById('session-page');

    expect(nameInput).toBeTruthy();
    expect(startBtn).toBeTruthy();
    expect(welcomePage).toBeTruthy();
    expect(sessionPage).toBeTruthy();

    // Fill inputs
    nameInput.value = 'Tester';
    teamInput.value = 'alpha';

    // Dispatch Enter
    const evt = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    nameInput.dispatchEvent(evt);

    // Expect session page to be visible (either via click handler or fallback)
    expect(welcomePage.classList.contains('hidden')).toBe(true);
    expect(sessionPage.classList.contains('hidden')).toBe(false);
  });
});

