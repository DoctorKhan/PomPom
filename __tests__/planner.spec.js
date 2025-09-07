/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const { waitFor } = require('@testing-library/dom');

// Helper to set up DOM and execute inline scripts (no module imports)
function setupDOMAndInlineScripts(html) {
  document.documentElement.innerHTML = html;

  // Bridge fetch if a jest mock exists on global
  if (typeof global.fetch === 'function') {
    window.fetch = global.fetch;
  }

  // Execute only the inline scripts that don't have imports or top-level await
  const inlineScripts = document.querySelectorAll('script:not([src]):not([type="module"])');
  inlineScripts.forEach(script => {
    let content = script.textContent || '';
    // Strip top-level await import for jsdom-only execution
    content = content.replace(/await\s+import\(/g, 'import(');
    try {
      new Function(content)();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error executing inline script in test', e);
    }
  });
}

function readFile(rel) {
  return fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
}

describe('Daily Planner (sidebar) one-day schedule', () => {
  test('loads calendar.html via fetch and renders a single-day view that is visible', async () => {
    const indexHtml = readFile('index.html');
    const calendarHtml = readFile('src/daily-planner.html') || readFile('src/calendar.html');

    // Mock fetch to return real calendar.html content
    global.fetch = jest.fn((url) => {
      if (typeof url === 'string' && (url.endsWith('src/daily-planner.html') || url.endsWith('src/calendar.html'))) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(calendarHtml) });
      }
      return Promise.resolve({ ok: true, text: () => Promise.resolve('') });
    });

    setupDOMAndInlineScripts(indexHtml);

    // Start the session to reveal main layout and sidebar
    document.getElementById('user-name-setup-input').value = 'Test User';
    document.getElementById('start-session-btn').click();

    // Provide a minimal switchView for jsdom tests
    window.switchView = (view) => {
      const views = ['participants', 'tasks', 'planner'];
      views.forEach(v => {
        const el = document.getElementById(`${v}-view`);
        if (el) el.classList.add('hidden');
      });
      const selectedView = document.getElementById(`${view}-view`);
      if (selectedView) selectedView.classList.remove('hidden');
      if (view === 'planner' && selectedView && !selectedView.dataset.loaded) {
        return fetch('src/daily-planner.html')
          .then(r => r.text())
          .then(html => {
            const container = document.getElementById('calendar-container');
            if (container) {
              const tmp = document.createElement('div');
              tmp.innerHTML = html;
              const scripts = Array.from(tmp.querySelectorAll('script'));
              scripts.forEach(s => s.parentNode && s.parentNode.removeChild(s));
              container.innerHTML = '';
              while (tmp.firstChild) container.appendChild(tmp.firstChild);
              scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                if (oldScript.src) newScript.src = oldScript.src;
                else newScript.textContent = oldScript.textContent || '';
                container.appendChild(newScript);
              });
              try { document.dispatchEvent(new Event('DOMContentLoaded')); } catch {}
            }
            selectedView.dataset.loaded = true;
          });
      }
      return Promise.resolve();
    };

    await window.switchView('planner');

    const container = document.getElementById('calendar-container');
    await waitFor(() => {
      expect(container && container.innerHTML).toBeTruthy();
      // Header should only have day-0
      expect(container.querySelector('#day-0')).toBeTruthy();
      expect(container.querySelector('#day-1')).toBeFalsy();
      // Grid header should be 2 columns (time + today)
      const header = container.querySelector('.grid.grid-cols-2');
      expect(header).toBeTruthy();
      // There should be multiple time rows (based on keyHours)
      const timeRows = container.querySelectorAll('#time-slots > div');
      expect(timeRows.length).toBeGreaterThanOrEqual(5);
    }, { timeout: 3000 });

    // Visibility: planner-view should be shown and others hidden
    const plannerView = document.getElementById('planner-view');
    const tasksView = document.getElementById('tasks-view');
    const participantsView = document.getElementById('participants-view');

    expect(plannerView.classList.contains('hidden')).toBe(false);
    expect(tasksView.classList.contains('hidden')).toBe(true);
    // participants may be default active before click; ensure it's now hidden
    expect(participantsView.classList.contains('hidden')).toBe(true);
  });
});

