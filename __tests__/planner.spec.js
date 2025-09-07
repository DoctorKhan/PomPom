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
            // Load content directly into the planner view
            const tmp = document.createElement('div');
            tmp.innerHTML = html;
            const scripts = Array.from(tmp.querySelectorAll('script'));
            scripts.forEach(s => s.parentNode && s.parentNode.removeChild(s));
            selectedView.innerHTML = '';
            while (tmp.firstChild) selectedView.appendChild(tmp.firstChild);
            scripts.forEach(oldScript => {
              const newScript = document.createElement('script');
              if (oldScript.src) newScript.src = oldScript.src;
              else newScript.textContent = oldScript.textContent || '';
              selectedView.appendChild(newScript);
            });
            try { document.dispatchEvent(new Event('DOMContentLoaded')); } catch {}
            selectedView.dataset.loaded = true;
          });
      }
      return Promise.resolve();
    };

    await window.switchView('planner');

    // Wait for planner view to be visible and loaded
    await waitFor(() => {
      const plannerView = document.getElementById('planner-view');
      expect(plannerView).toBeTruthy();
      expect(plannerView.classList.contains('hidden')).toBe(false);

      // Check for daily planner specific elements
      const agendaList = document.getElementById('agenda-list');
      const currentDate = document.getElementById('current-date');
      const addTaskBtn = document.getElementById('add-task-btn');

      expect(agendaList).toBeTruthy();
      expect(currentDate).toBeTruthy();
      expect(addTaskBtn).toBeTruthy();

      // Check that content has been loaded
      expect(plannerView.innerHTML.trim()).not.toBe('');
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

