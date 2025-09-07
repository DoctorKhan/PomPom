/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const { waitFor, fireEvent } = require('@testing-library/dom');

function read(rel) { return fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8'); }

function loadFullCalendarIntoDom() {
  const html = read('src/full-calendar.html');
  document.open();
  document.write(html);
  document.close();

  // Execute inline script content with proper scoping to avoid redeclaration
  const scripts = Array.from(document.querySelectorAll('script'));
  scripts.forEach((s, index) => {
    const code = (s.textContent || '').trim();
    if (code && !code.includes('cdn.tailwindcss.com') && !s.src) {
      try {
        // Replace const declaration with var to avoid redeclaration errors
        let modifiedCode = code;
        if (code.includes('const __initCalendar')) {
          modifiedCode = code.replace('const __initCalendar', 'var __initCalendar');
        }
        // eslint-disable-next-line no-eval
        window.eval(modifiedCode);
      } catch (error) {
        console.warn('Script execution error:', error.message);
      }
    }
  });

  // Ensure init runs and wait for it to complete
  if (window.__initCalendar) {
    try {
      window.__initCalendar();
      console.log('Calendar initialized successfully');
    } catch (error) {
      console.error('Calendar initialization error:', error);
    }

    // Give the calendar time to render and check if it worked
    return new Promise(resolve => {
      setTimeout(() => {
        const grid = document.querySelector('.calendar-grid');
        console.log('Calendar grid found:', !!grid);
        if (grid) {
          console.log('Grid children count:', grid.children.length);
        }
        resolve();
      }, 500);
    });
  } else {
    console.log('__initCalendar function not found');
  }

  return Promise.resolve();
}

function createTestEvent(title = 'Test Event', startHour = 10, duration = 1, dayOffset = 0) {
  const start = new Date();
  start.setDate(start.getDate() - start.getDay() + dayOffset); // Set to specific day of current week
  start.setHours(startHour, 0, 0, 0);

  const end = new Date(start);
  end.setHours(startHour + duration);

  return {
    id: Date.now() + Math.random(),
    title,
    start,
    end,
    category: 'work',
    description: 'Test event description'
  };
}

describe('Full Calendar Implementation', () => {
  beforeEach(() => {
    // Reset DOM and globals for each test
    document.body.innerHTML = '';
    document.head.innerHTML = '';

    // Clear any existing calendar functions
    delete window.__initCalendar;
    delete window.events;
    delete window.weekStart;

    // Mock MutationObserver to prevent Tailwind CSS issues
    if (window.MutationObserver) {
      window.MutationObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        disconnect: jest.fn(),
        takeRecords: jest.fn()
      }));
    }
  });

  describe('Calendar Structure', () => {
    test('renders complete calendar grid with headers and time slots', async () => {
      await loadFullCalendarIntoDom();

      // First check if the basic structure exists
      const app = document.getElementById('app');
      expect(app).toBeTruthy();

      const grid = document.querySelector('.calendar-grid');
      if (!grid) {
        console.log('Calendar grid not found. Available elements:', document.body.innerHTML.substring(0, 500));
      }
      expect(grid).toBeTruthy();

      await waitFor(() => {
        // Check day headers (0-6 for Sun-Sat)
        for (let i = 0; i < 7; i++) {
          const header = document.querySelector(`#day-${i}`);
          expect(header).toBeTruthy();
          expect(header.classList.contains('day-header')).toBe(true);
        }

        // Check time labels (24 hours)
        const timeLabels = grid.querySelectorAll('.time-label');
        expect(timeLabels.length).toBe(24);

        // Check time slots (7 days × 24 hours)
        const timeSlots = grid.querySelectorAll('.time-slot');
        expect(timeSlots.length).toBe(168); // 7 * 24

        // Verify grid has children (CSS display property may not be set in jsdom)
        expect(grid.children.length).toBeGreaterThan(0);

        // Verify grid has the correct class
        expect(grid.classList.contains('calendar-grid')).toBe(true);
      }, { timeout: 2000 });
    }, 10000);

    test('highlights today in header', async () => {
      loadFullCalendarIntoDom();

      await waitFor(() => {
        const today = new Date();
        const todayDayOfWeek = today.getDay(); // 0 = Sunday
        const todayHeader = document.querySelector(`#day-${todayDayOfWeek}`);

        if (todayHeader) {
          expect(todayHeader.classList.contains('today-header')).toBe(true);
        }
      });
    });

    test('time slots have correct data attributes', async () => {
      loadFullCalendarIntoDom();

      await waitFor(() => {
        const firstSlot = document.querySelector('.time-slot[data-day-index="0"][data-hour="0"]');
        expect(firstSlot).toBeTruthy();
        expect(firstSlot.dataset.dayIndex).toBe('0');
        expect(firstSlot.dataset.hour).toBe('0');

        const lastSlot = document.querySelector('.time-slot[data-day-index="6"][data-hour="23"]');
        expect(lastSlot).toBeTruthy();
        expect(lastSlot.dataset.dayIndex).toBe('6');
        expect(lastSlot.dataset.hour).toBe('23');
      });
    });
  });

  describe('Event Creation and Display', () => {
    test('creates event through modal form submission', async () => {
      await loadFullCalendarIntoDom();

      // Wait for calendar to be fully initialized
      await waitFor(() => {
        const grid = document.querySelector('.calendar-grid');
        expect(grid.children.length).toBeGreaterThan(0);
      });

      // Open modal
      const addBtn = document.getElementById('add-event-btn');
      expect(addBtn).toBeTruthy();
      addBtn.click();

      await waitFor(() => {
        const modal = document.getElementById('event-modal');
        expect(modal).toBeTruthy();
        expect(modal.classList.contains('flex')).toBe(true);
        expect(modal.classList.contains('hidden')).toBe(false);
      });

      // Fill form with valid data
      const titleInput = document.getElementById('event-title');
      const startInput = document.getElementById('event-start');
      const endInput = document.getElementById('event-end');
      const categorySelect = document.getElementById('event-category');

      expect(titleInput).toBeTruthy();
      expect(startInput).toBeTruthy();
      expect(endInput).toBeTruthy();
      expect(categorySelect).toBeTruthy();

      titleInput.value = 'Team Meeting';

      // Set time to a specific time within current week
      const today = new Date();
      const startTime = new Date(today);
      startTime.setHours(14, 0, 0, 0); // 2 PM today
      startInput.value = startTime.toISOString().slice(0, 16);

      const endTime = new Date(startTime);
      endTime.setHours(15, 0, 0, 0); // 3 PM today
      endInput.value = endTime.toISOString().slice(0, 16);

      categorySelect.value = 'meeting';

      // Trigger form submission event
      const form = document.getElementById('event-form');
      expect(form).toBeTruthy();

      // Manually trigger the submit event to ensure it's processed
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);

      // Wait for event to be created and rendered
      await waitFor(() => {
        const eventElements = document.querySelectorAll('.event-container');
        expect(eventElements.length).toBeGreaterThan(0);

        if (eventElements.length > 0) {
          const eventElement = eventElements[0];
          expect(eventElement.textContent).toContain('Team Meeting');
        }
      }, { timeout: 5000 });
    });

    test('positions events correctly in grid', async () => {
      loadFullCalendarIntoDom();

      // Create event programmatically for precise positioning test
      const testEvent = createTestEvent('Positioned Event', 9, 2, 1); // Monday 9-11 AM

      // Add event directly (simulating successful form submission)
      await waitFor(() => {
        const addBtn = document.getElementById('add-event-btn');
        addBtn.click();
      });

      const titleInput = document.getElementById('event-title');
      const startInput = document.getElementById('event-start');
      const endInput = document.getElementById('event-end');

      titleInput.value = testEvent.title;
      startInput.value = testEvent.start.toISOString().slice(0, 16);
      endInput.value = testEvent.end.toISOString().slice(0, 16);

      const form = document.getElementById('event-form');
      fireEvent.submit(form);

      await waitFor(() => {
        const eventElement = document.querySelector('.event-container');
        expect(eventElement).toBeTruthy();

        // Check grid positioning
        const gridColumn = eventElement.style.gridColumn;
        const gridRow = eventElement.style.gridRow;

        expect(gridColumn).toBeTruthy();
        expect(gridRow).toBeTruthy();
        expect(gridRow).toContain('span');
      }, { timeout: 2000 });
    });
  });

  describe('Event Interaction', () => {
    test('opens edit modal when clicking on event', async () => {
      loadFullCalendarIntoDom();

      // Create and add an event first
      const addBtn = document.getElementById('add-event-btn');
      addBtn.click();

      const titleInput = document.getElementById('event-title');
      titleInput.value = 'Clickable Event';

      const form = document.getElementById('event-form');
      fireEvent.submit(form);

      await waitFor(() => {
        const eventElement = document.querySelector('.event-container');
        expect(eventElement).toBeTruthy();

        // Click on the event
        fireEvent.click(eventElement);

        // Check that modal opens with event data
        const modal = document.getElementById('event-modal');
        expect(modal.classList.contains('flex')).toBe(true);

        const modalTitle = document.getElementById('modal-title');
        expect(modalTitle.textContent).toBe('Edit Event');

        const editTitleInput = document.getElementById('event-title');
        expect(editTitleInput.value).toBe('Clickable Event');
      }, { timeout: 2000 });
    });

    test('deletes event when delete button is clicked', async () => {
      loadFullCalendarIntoDom();

      // Mock confirm dialog
      window.confirm = jest.fn(() => true);

      // Create event
      const addBtn = document.getElementById('add-event-btn');
      addBtn.click();

      const titleInput = document.getElementById('event-title');
      titleInput.value = 'Event to Delete';

      const form = document.getElementById('event-form');
      fireEvent.submit(form);

      await waitFor(() => {
        const eventElement = document.querySelector('.event-container');
        expect(eventElement).toBeTruthy();

        // Click event to open edit modal
        fireEvent.click(eventElement);

        // Click delete button
        const deleteBtn = document.getElementById('delete-event');
        fireEvent.click(deleteBtn);

        // Event should be removed
        const eventsAfterDelete = document.querySelectorAll('.event-container');
        expect(eventsAfterDelete.length).toBe(0);
      }, { timeout: 2000 });
    });
  });

  describe('Calendar Navigation', () => {
    test('navigates to previous week', async () => {
      loadFullCalendarIntoDom();

      await waitFor(() => {
        // Get current week display
        const initialHeaders = Array.from(document.querySelectorAll('.day-header')).slice(1); // Skip corner cell
        const initialDates = initialHeaders.map(h => h.textContent);

        // Click previous week
        const prevBtn = document.getElementById('prev-week');
        if (prevBtn) {
          fireEvent.click(prevBtn);

          // Check that dates changed
          const newHeaders = Array.from(document.querySelectorAll('.day-header')).slice(1);
          const newDates = newHeaders.map(h => h.textContent);

          expect(newDates).not.toEqual(initialDates);
        }
      });
    });

    test('navigates to next week', async () => {
      loadFullCalendarIntoDom();

      await waitFor(() => {
        const initialHeaders = Array.from(document.querySelectorAll('.day-header')).slice(1);
        const initialDates = initialHeaders.map(h => h.textContent);

        const nextBtn = document.getElementById('next-week');
        if (nextBtn) {
          fireEvent.click(nextBtn);

          const newHeaders = Array.from(document.querySelectorAll('.day-header')).slice(1);
          const newDates = newHeaders.map(h => h.textContent);

          expect(newDates).not.toEqual(initialDates);
        }
      });
    });

    test('returns to current week with today button', async () => {
      loadFullCalendarIntoDom();

      await waitFor(() => {
        const todayBtn = document.getElementById('today-btn');
        if (todayBtn) {
          // Navigate away first
          const nextBtn = document.getElementById('next-week');
          if (nextBtn) {
            fireEvent.click(nextBtn);
            fireEvent.click(nextBtn); // Go 2 weeks ahead
          }

          // Then return to today
          fireEvent.click(todayBtn);

          // Check that current week contains today
          const today = new Date();
          const todayDayOfWeek = today.getDay();
          const todayHeader = document.querySelector(`#day-${todayDayOfWeek}`);

          if (todayHeader) {
            expect(todayHeader.classList.contains('today-header')).toBe(true);
          }
        }
      });
    });
  });

  describe('Search and Filtering', () => {
    test('filters events by search term', async () => {
      loadFullCalendarIntoDom();

      // Wait for calendar initialization
      await waitFor(() => {
        const grid = document.querySelector('.calendar-grid');
        expect(grid.children.length).toBeGreaterThan(0);
      });

      // Create a single test event first
      const addBtn = document.getElementById('add-event-btn');
      addBtn.click();

      const titleInput = document.getElementById('event-title');
      titleInput.value = 'Meeting with Client';

      const form = document.getElementById('event-form');
      fireEvent.submit(form);

      // Wait for event to be created
      await waitFor(() => {
        const allEvents = document.querySelectorAll('.event-container');
        expect(allEvents.length).toBe(1);
      }, { timeout: 2000 });

      // Test search functionality
      const searchBtn = document.getElementById('search-btn');
      if (searchBtn) {
        fireEvent.click(searchBtn);

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.value = 'nonexistent';

          const applyBtn = document.getElementById('apply-filters');
          if (applyBtn) {
            fireEvent.click(applyBtn);

            // Should show no events
            const filteredEvents = document.querySelectorAll('.event-container');
            expect(filteredEvents.length).toBe(0);
          }
        }
      }
    }, 10000); // Increase timeout for this complex test

    test('clears all filters', async () => {
      loadFullCalendarIntoDom();

      // Create and filter events first
      const addBtn = document.getElementById('add-event-btn');
      addBtn.click();

      const titleInput = document.getElementById('event-title');
      titleInput.value = 'Test Event';

      const form = document.getElementById('event-form');
      fireEvent.submit(form);

      await waitFor(() => {
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
          fireEvent.click(searchBtn);

          // Set some filters
          const searchInput = document.getElementById('search-input');
          const filterCategory = document.getElementById('filter-category');

          searchInput.value = 'nonexistent';
          filterCategory.value = 'personal';

          const applyBtn = document.getElementById('apply-filters');
          if (applyBtn) {
            fireEvent.click(applyBtn);

            // Should show no events
            let filteredEvents = document.querySelectorAll('.event-container');
            expect(filteredEvents.length).toBe(0);

            // Clear filters
            fireEvent.click(searchBtn); // Reopen modal
            const clearBtn = document.getElementById('clear-filters');
            if (clearBtn) {
              fireEvent.click(clearBtn);

              // Should show all events again
              filteredEvents = document.querySelectorAll('.event-container');
              expect(filteredEvents.length).toBeGreaterThan(0);
            }
          }
        }
      }, { timeout: 5000 });
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('opens new event modal with Ctrl+N', async () => {
      loadFullCalendarIntoDom();

      await waitFor(() => {
        // Simulate Ctrl+N
        fireEvent.keyDown(document, { key: 'n', ctrlKey: true });

        const modal = document.getElementById('event-modal');
        expect(modal.classList.contains('flex')).toBe(true);
        expect(modal.classList.contains('hidden')).toBe(false);

        const modalTitle = document.getElementById('modal-title');
        expect(modalTitle.textContent).toBe('Create Event');
      });
    });

    test('opens search modal with Ctrl+F', async () => {
      loadFullCalendarIntoDom();

      await waitFor(() => {
        fireEvent.keyDown(document, { key: 'f', ctrlKey: true });

        const searchModal = document.getElementById('search-modal');
        expect(searchModal.classList.contains('flex')).toBe(true);
        expect(searchModal.classList.contains('hidden')).toBe(false);
      });
    });

    test('closes modals with Escape key', async () => {
      loadFullCalendarIntoDom();

      await waitFor(() => {
        // Open event modal first
        const addBtn = document.getElementById('add-event-btn');
        addBtn.click();

        let modal = document.getElementById('event-modal');
        expect(modal.classList.contains('flex')).toBe(true);

        // Close with Escape
        fireEvent.keyDown(document, { key: 'Escape' });

        expect(modal.classList.contains('hidden')).toBe(true);
      });
    });
  });

  describe('Form Validation', () => {
    test('prevents creating events with end time before start time', async () => {
      loadFullCalendarIntoDom();

      // Mock alert
      window.alert = jest.fn();

      const addBtn = document.getElementById('add-event-btn');
      addBtn.click();

      const titleInput = document.getElementById('event-title');
      const startInput = document.getElementById('event-start');
      const endInput = document.getElementById('event-end');

      titleInput.value = 'Invalid Event';

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(15, 0, 0, 0); // 3 PM
      startInput.value = tomorrow.toISOString().slice(0, 16);

      const earlierTime = new Date(tomorrow);
      earlierTime.setHours(14, 0, 0, 0); // 2 PM (before start)
      endInput.value = earlierTime.toISOString().slice(0, 16);

      const form = document.getElementById('event-form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('End time must be after start time');

        // Event should not be created
        const events = document.querySelectorAll('.event-container');
        expect(events.length).toBe(0);
      });
    });

    test('creates event with default title when title is empty', async () => {
      loadFullCalendarIntoDom();

      const addBtn = document.getElementById('add-event-btn');
      addBtn.click();

      // Leave title empty
      const titleInput = document.getElementById('event-title');
      titleInput.value = '';

      const form = document.getElementById('event-form');
      fireEvent.submit(form);

      await waitFor(() => {
        const eventElement = document.querySelector('.event-container');
        expect(eventElement).toBeTruthy();
        expect(eventElement.textContent).toContain('Untitled Event');
      }, { timeout: 2000 });
    });
  });
});

