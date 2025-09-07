/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const { waitFor, fireEvent } = require('@testing-library/dom');

function read(rel) { return fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8'); }

function loadCalendar() {
  const html = read('src/full-calendar.html');
  document.open();
  document.write(html);
  document.close();

  // Execute scripts
  const scripts = Array.from(document.querySelectorAll('script'));
  scripts.forEach(s => {
    const code = (s.textContent || '').trim();
    if (code && !code.includes('cdn.tailwindcss.com')) {
      try {
        // eslint-disable-next-line no-eval
        window.eval(code);
      } catch (error) {
        console.warn('Script execution error:', error.message);
      }
    }
  });

  // Run init if available
  if (window.__initCalendar) {
    window.__initCalendar();
  }
}

describe('Calendar Basic Functionality', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    delete window.__initCalendar;
  });

  test('calendar renders with grid structure', async () => {
    loadCalendar();
    
    const grid = document.querySelector('.calendar-grid');
    expect(grid).toBeTruthy();

    await waitFor(() => {
      // Should have day headers
      const dayHeaders = grid.querySelectorAll('.day-header');
      expect(dayHeaders.length).toBeGreaterThan(0);

      // Should have time labels
      const timeLabels = grid.querySelectorAll('.time-label');
      expect(timeLabels.length).toBe(24);

      // Should have time slots
      const timeSlots = grid.querySelectorAll('.time-slot');
      expect(timeSlots.length).toBe(168); // 7 days × 24 hours
    }, { timeout: 2000 });
  });

  test('add event button opens modal', async () => {
    loadCalendar();
    
    const addBtn = document.getElementById('add-event-btn');
    expect(addBtn).toBeTruthy();
    
    addBtn.click();
    
    await waitFor(() => {
      const modal = document.getElementById('event-modal');
      expect(modal).toBeTruthy();
      expect(modal.classList.contains('hidden')).toBe(false);
    });
  });

  test('modal form has required fields', async () => {
    loadCalendar();
    
    const addBtn = document.getElementById('add-event-btn');
    addBtn.click();
    
    await waitFor(() => {
      expect(document.getElementById('event-title')).toBeTruthy();
      expect(document.getElementById('event-start')).toBeTruthy();
      expect(document.getElementById('event-end')).toBeTruthy();
      expect(document.getElementById('event-category')).toBeTruthy();
      expect(document.getElementById('event-form')).toBeTruthy();
    });
  });

  test('navigation buttons exist and are functional', async () => {
    loadCalendar();
    
    await waitFor(() => {
      const prevBtn = document.getElementById('prev-week');
      const nextBtn = document.getElementById('next-week');
      const todayBtn = document.getElementById('today-btn');
      
      expect(prevBtn).toBeTruthy();
      expect(nextBtn).toBeTruthy();
      expect(todayBtn).toBeTruthy();
      
      // Test that clicking doesn't throw errors
      expect(() => {
        if (prevBtn) fireEvent.click(prevBtn);
        if (nextBtn) fireEvent.click(nextBtn);
        if (todayBtn) fireEvent.click(todayBtn);
      }).not.toThrow();
    });
  });

  test('keyboard shortcuts work', async () => {
    loadCalendar();
    
    await waitFor(() => {
      // Test Ctrl+N opens event modal
      fireEvent.keyDown(document, { key: 'n', ctrlKey: true });
      
      const eventModal = document.getElementById('event-modal');
      expect(eventModal.classList.contains('hidden')).toBe(false);
      
      // Test Escape closes modal
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(eventModal.classList.contains('hidden')).toBe(true);
    });
  });

  test('search modal opens and closes', async () => {
    loadCalendar();

    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
      fireEvent.click(searchBtn);

      await waitFor(() => {
        const searchModal = document.getElementById('search-modal');
        expect(searchModal.classList.contains('hidden')).toBe(false);

        // Close modal
        const closeBtn = document.getElementById('close-search-modal');
        if (closeBtn) {
          fireEvent.click(closeBtn);
          expect(searchModal.classList.contains('hidden')).toBe(true);
        }
      });
    }
  });

  test('event creation works through form submission', async () => {
    loadCalendar();

    await waitFor(() => {
      const grid = document.querySelector('.calendar-grid');
      expect(grid.children.length).toBeGreaterThan(0);
    });

    // Open modal
    const addBtn = document.getElementById('add-event-btn');
    addBtn.click();

    await waitFor(() => {
      const modal = document.getElementById('event-modal');
      expect(modal.classList.contains('hidden')).toBe(false);
    });

    // Fill form
    const titleInput = document.getElementById('event-title');
    const startInput = document.getElementById('event-start');
    const endInput = document.getElementById('event-end');

    titleInput.value = 'Test Event';

    // Set valid times
    const now = new Date();
    now.setHours(10, 0, 0, 0);
    startInput.value = now.toISOString().slice(0, 16);

    const endTime = new Date(now);
    endTime.setHours(11, 0, 0, 0);
    endInput.value = endTime.toISOString().slice(0, 16);

    // Submit form
    const form = document.getElementById('event-form');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);

    // Check that event was created
    await waitFor(() => {
      const events = document.querySelectorAll('.event-container');
      expect(events.length).toBeGreaterThan(0);

      if (events.length > 0) {
        expect(events[0].textContent).toContain('Test Event');
      }
    }, { timeout: 3000 });
  });

  test('drag and drop functionality works', async () => {
    loadCalendar();

    await waitFor(() => {
      const grid = document.querySelector('.calendar-grid');
      expect(grid.children.length).toBeGreaterThan(0);
    });

    // Create an event first
    const addBtn = document.getElementById('add-event-btn');
    addBtn.click();

    await waitFor(() => {
      const modal = document.getElementById('event-modal');
      expect(modal.classList.contains('hidden')).toBe(false);
    });

    const titleInput = document.getElementById('event-title');
    const startInput = document.getElementById('event-start');
    const endInput = document.getElementById('event-end');

    titleInput.value = 'Draggable Event';

    const now = new Date();
    now.setHours(9, 0, 0, 0);
    startInput.value = now.toISOString().slice(0, 16);

    const endTime = new Date(now);
    endTime.setHours(10, 0, 0, 0);
    endInput.value = endTime.toISOString().slice(0, 16);

    const form = document.getElementById('event-form');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);

    await waitFor(() => {
      const events = document.querySelectorAll('.event-container');
      expect(events.length).toBeGreaterThan(0);
    });

    // Test drag functionality
    const eventElement = document.querySelector('.event-container');
    expect(eventElement).toBeTruthy();

    // Simulate mousedown
    const mouseDownEvent = new MouseEvent('mousedown', {
      clientX: 100,
      clientY: 100,
      bubbles: true
    });
    eventElement.dispatchEvent(mouseDownEvent);

    // Check that dragging class is added
    expect(eventElement.classList.contains('dragging')).toBe(true);

    // Simulate mousemove
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 150,
      clientY: 150,
      bubbles: true
    });
    document.dispatchEvent(mouseMoveEvent);

    // Simulate mouseup
    const mouseUpEvent = new MouseEvent('mouseup', {
      clientX: 150,
      clientY: 150,
      bubbles: true
    });
    document.dispatchEvent(mouseUpEvent);

    // Check that dragging class is removed
    await waitFor(() => {
      expect(eventElement.classList.contains('dragging')).toBe(false);
    });
  });

  test('AI scheduling interface exists and is functional', async () => {
    loadCalendar();

    await waitFor(() => {
      const grid = document.querySelector('.calendar-grid');
      expect(grid.children.length).toBeGreaterThan(0);
    });

    // Check AI input and button exist
    const aiInput = document.getElementById('ai-input');
    const aiBtn = document.getElementById('ai-schedule-btn');

    expect(aiInput).toBeTruthy();
    expect(aiBtn).toBeTruthy();

    // Test input functionality
    aiInput.value = 'Test meeting tomorrow 2pm';
    expect(aiInput.value).toBe('Test meeting tomorrow 2pm');

    // Test button is clickable (won't actually call API in test)
    expect(aiBtn.disabled).toBe(false);
    expect(() => {
      fireEvent.click(aiBtn);
    }).not.toThrow();
  });

  test('mobile menu functionality works', async () => {
    loadCalendar();

    await waitFor(() => {
      const grid = document.querySelector('.calendar-grid');
      expect(grid.children.length).toBeGreaterThan(0);
    });

    // Check mobile menu button exists
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-sidebar-overlay');

    expect(mobileMenuBtn).toBeTruthy();
    expect(sidebar).toBeTruthy();
    expect(overlay).toBeTruthy();

    // Test mobile menu toggle
    expect(sidebar.classList.contains('mobile-open')).toBe(false);
    expect(overlay.classList.contains('active')).toBe(false);

    // Test mobile menu toggle function directly
    if (window.toggleMobileSidebar) {
      window.toggleMobileSidebar();

      expect(sidebar.classList.contains('mobile-open')).toBe(true);
      expect(overlay.classList.contains('active')).toBe(true);

      // Close mobile sidebar
      if (window.closeMobileSidebar) {
        window.closeMobileSidebar();

        expect(sidebar.classList.contains('mobile-open')).toBe(false);
        expect(overlay.classList.contains('active')).toBe(false);
      }
    } else {
      // Fallback: just test that elements exist and button is clickable
      expect(() => {
        fireEvent.click(mobileMenuBtn);
      }).not.toThrow();
    }
  });

  test('modern calendar styling is applied', async () => {
    loadCalendar();

    await waitFor(() => {
      const grid = document.querySelector('.calendar-grid');
      expect(grid.children.length).toBeGreaterThan(0);
    });

    // Check modern styling elements
    const app = document.getElementById('app');
    const sidebar = document.getElementById('sidebar');
    const main = document.querySelector('main');
    const header = document.querySelector('.calendar-header');

    // Verify clean white background
    expect(app).toBeTruthy();
    expect(sidebar).toBeTruthy();
    expect(main).toBeTruthy();
    expect(header).toBeTruthy();

    // Check for modern button styles
    const createBtn = document.getElementById('add-event-btn');
    const todayBtn = document.getElementById('today-btn');

    expect(createBtn).toBeTruthy();
    expect(todayBtn).toBeTruthy();
    expect(createBtn.classList.contains('btn-primary')).toBe(true);
    expect(todayBtn.classList.contains('btn-secondary')).toBe(true);

    // Verify calendar grid structure
    const grid = document.querySelector('.calendar-grid');
    expect(grid).toBeTruthy();

    // Check for time labels and day headers
    const timeLabels = document.querySelectorAll('.time-label');
    const dayHeaders = document.querySelectorAll('.day-header');

    expect(timeLabels.length).toBeGreaterThan(0);
    expect(dayHeaders.length).toBeGreaterThanOrEqual(7); // At least 7 days of the week
  });

  test('AI-enhanced features are present', async () => {
    loadCalendar();

    await waitFor(() => {
      const grid = document.querySelector('.calendar-grid');
      expect(grid.children.length).toBeGreaterThan(0);
    });

    // Check for AI-specific elements
    const aiInput = document.getElementById('ai-input');
    const aiScheduleBtn = document.getElementById('ai-schedule-btn');
    const floatingAssistant = document.getElementById('ai-floating-assistant');
    const aiQuickModal = document.getElementById('ai-quick-modal');

    expect(aiInput).toBeTruthy();
    expect(aiScheduleBtn).toBeTruthy();
    expect(floatingAssistant).toBeTruthy();
    expect(aiQuickModal).toBeTruthy();

    // Check AI button styling
    expect(aiScheduleBtn.classList.contains('btn-ai')).toBe(true);

    // Check for AI-enhanced styling classes
    const app = document.getElementById('app');
    const sidebar = document.getElementById('sidebar');

    expect(app).toBeTruthy();
    expect(sidebar).toBeTruthy();

    // Verify AI assistant functionality
    expect(() => {
      fireEvent.click(floatingAssistant);
    }).not.toThrow();

    // Check if AI quick modal opens
    fireEvent.click(floatingAssistant);
    expect(aiQuickModal.classList.contains('flex')).toBe(true);

    // Check for AI quick actions
    const quickActions = document.querySelectorAll('.ai-quick-action');
    expect(quickActions.length).toBe(4); // Should have 4 quick actions
  });
});
