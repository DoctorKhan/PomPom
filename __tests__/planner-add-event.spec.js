/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const { waitFor } = require('@testing-library/dom');

function read(rel) { return fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8'); }

function setupIndex(html) {
  document.documentElement.innerHTML = html;
}

describe('Daily Planner - Add Event flow', () => {
  test('adds an event via quick add and renders a pill in today column', async () => {
    const indexHtml = read('index.html');
    const plannerHtml = read('src/daily-planner.html');

    // Mock fetch for planner load
    global.fetch = jest.fn((url) => {
      if (typeof url === 'string' && url.endsWith('src/daily-planner.html')) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(plannerHtml) });
      }
      return Promise.resolve({ ok: true, text: () => Promise.resolve('') });
    });

    setupIndex(indexHtml);

    // Start session to show main layout
    document.getElementById('user-name-setup-input').value = 'Tester';
    document.getElementById('start-session-btn').click();

    // Minimal view switcher to load planner and execute scripts
    window.switchView = async (view) => {
      const selectedView = document.getElementById(`${view}-view`);
      if (view === 'planner' && selectedView && !selectedView.dataset.loaded) {
        const html = await (await fetch('src/daily-planner.html')).text();
        const container = document.getElementById('calendar-container');
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const scripts = Array.from(tmp.querySelectorAll('script'));
        scripts.forEach(s => s.parentNode && s.parentNode.removeChild(s));
        container.innerHTML = '';
        while (tmp.firstChild) container.appendChild(tmp.firstChild);
        scripts.forEach(s => {
          const ns = document.createElement('script');
          if (s.src) ns.src = s.src; else ns.textContent = s.textContent || '';
          container.appendChild(ns);
        });
        try { document.dispatchEvent(new Event('DOMContentLoaded')); } catch {}
        selectedView.dataset.loaded = true;
      }
      // show planner view
      document.getElementById('planner-view').classList.remove('hidden');
      document.getElementById('tasks-view').classList.add('hidden');
      document.getElementById('participants-view').classList.add('hidden');
    };

    await window.switchView('planner');

    // Click "+ Add Event" to open quick-add
    const addBtn = document.getElementById('add-event-btn');
    expect(addBtn).toBeTruthy();
    addBtn.click();

    // Enter a simple event for today at 2pm
    const input = document.getElementById('event-input');
    const saveBtn = document.getElementById('save-event-btn');
    input.value = 'Demo at 2pm';
    saveBtn.click();

    // Ensure a pill appears in the time slots
    const container = document.getElementById('calendar-container');
    await waitFor(() => {
      const pill = container.querySelector('.event-pill');
      expect(pill).toBeTruthy();
      // header still single-day
      expect(container.querySelector('#day-0')).toBeTruthy();
      expect(container.querySelector('#day-1')).toBeFalsy();
    }, { timeout: 3000 });
  });
});

