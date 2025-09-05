/**
 * @jeconst html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');

// Helper to set up DOM and execute script
const setupDOMAndScript = () => {
    document.documentElement.innerHTML = html;
    const scriptEl = document.querySelector('script[type="module"]');
    if (scriptEl && scriptEl.textContent) {
        // JSDOM doesn't execute module scripts, so we manually execute it.
        // Note: This has limitations and may not perfectly replicate browser behavior.
        try {
            // In JSDOM, top-level await isn't supported in the same way as a browser.
            // We'll remove the 'await' from the dynamic import to prevent a syntax error.
            // The import will still be async, but it won't block the script execution here.
            const scriptContent = scriptEl.textContent.replace('await import(', 'import(');
            new Function(scriptContent)();
        } catch (e) {
            console.error("Error executing script in test", e);
        }
    }
};sdom
 */

const fs = require('fs');
const path = require('path');

const { waitFor } = require('@testing-library/dom');

// Load the HTML file
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

// Helper to set up DOM and execute script
const setupDOMAndScript = () => {
    document.documentElement.innerHTML = html;
    const scriptEl = document.querySelector('script[type="module"]');
    if (scriptEl && scriptEl.textContent) {
        // JSDOM doesn't execute module scripts, so we manually execute it.
        // Note: This has limitations and may not perfectly replicate browser behavior.
        try {
            new Function(scriptEl.textContent)();
        } catch (e) {
            console.error("Error executing script in test", e);
        }
    }
};

describe('PomPom User Flow Tests', () => {

    // Setup a generic fetch mock before each test.
    // Tests that need a specific mock can override it.
    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ candidates: [{ content: { parts: [{ text: '{"tasks":[]}' }] } }] }),
                text: () => Promise.resolve('Default mock response'),
            })
        );
    });

    describe('Welcome Page', () => {
        beforeEach(() => {
            setupDOMAndScript();
        });

        test('should display the welcome page initially', () => {
            const welcomePage = document.getElementById('welcome-page');
            const sessionPage = document.getElementById('session-page');
            expect(welcomePage.classList.contains('hidden')).toBe(false);
            expect(sessionPage.classList.contains('hidden')).toBe(true);
        });

        test('should have input fields for session and user name', () => {
            expect(document.getElementById('session-name-input')).toBeTruthy();
            expect(document.getElementById('user-name-setup-input')).toBeTruthy();
        });

        test('should generate a random user name when shuffle button is clicked', () => {
            const userNameInput = document.getElementById('user-name-setup-input');
            const shuffleBtn = document.getElementById('shuffle-user-name-btn');
            const initialName = userNameInput.value;
            shuffleBtn.click();
            expect(userNameInput.value).not.toBe(initialName);
        });

        test('should switch to the session page on "Start Session" click', () => {
            const startBtn = document.getElementById('start-session-btn');
            const welcomePage = document.getElementById('welcome-page');
            const sessionPage = document.getElementById('session-page');
            const userNameInput = document.getElementById('user-name-setup-input');
            
            userNameInput.value = 'Test User'; // A user name is required
            startBtn.click();

            expect(welcomePage.classList.contains('hidden')).toBe(true);
            expect(sessionPage.classList.contains('hidden')).toBe(false);
        });
    });

    describe('Session Page', () => {
        beforeEach(() => {
            setupDOMAndScript();
            // Navigate to the session page before each test in this block
            document.getElementById('user-name-setup-input').value = 'Test User';
            document.getElementById('start-session-btn').click();
        });

        test('should display the main timer and goal input', () => {
            expect(document.getElementById('timer-display')).toBeTruthy();
            expect(document.getElementById('goal-input')).toBeTruthy();
        });

        test('should have tabs for Team, Tasks, and Planner', () => {
            const navButtons = document.querySelectorAll('.nav-btn');
            const tabs = Array.from(navButtons).map(btn => btn.dataset.view);
            expect(tabs).toEqual(expect.arrayContaining(['participants', 'tasks', 'planner']));
        });

        test('should switch between views when tabs are clicked', () => {
            const tasksBtn = document.querySelector('[data-view="tasks"]');
            const plannerBtn = document.querySelector('[data-view="planner"]');
            const participantsView = document.getElementById('participants-view');
            const tasksView = document.getElementById('tasks-view');
            const plannerView = document.getElementById('planner-view');

            // Initial state
            expect(participantsView.classList.contains('hidden')).toBe(false);
            expect(tasksView.classList.contains('hidden')).toBe(true);
            expect(plannerView.classList.contains('hidden')).toBe(true);

            // Click tasks tab
            tasksBtn.click();
            expect(participantsView.classList.contains('hidden')).toBe(true);
            expect(tasksView.classList.contains('hidden')).toBe(false);
            expect(plannerView.classList.contains('hidden')).toBe(true);

            // Click planner tab
            plannerBtn.click();
            expect(participantsView.classList.contains('hidden')).toBe(true);
            expect(tasksView.classList.contains('hidden')).toBe(true);
            expect(plannerView.classList.contains('hidden')).toBe(false);
        });

        test('should toggle the chat popup', () => {
            const chatPopupBtn = document.getElementById('chat-popup-btn');
            const chatPopup = document.getElementById('chat-popup');

            expect(chatPopup.classList.contains('hidden')).toBe(true);
            chatPopupBtn.click();
            expect(chatPopup.classList.contains('hidden')).toBe(false);
            chatPopupBtn.click();
            expect(chatPopup.classList.contains('hidden')).toBe(true);
        });

        test('should copy the session link to clipboard', async () => {
            // Mock clipboard API
            Object.assign(navigator, {
                clipboard: {
                    writeText: jest.fn().mockResolvedValue(),
                },
            });

            const copyLinkBtn = document.getElementById('copy-link-btn');
            copyLinkBtn.click();

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('?session='));

            const toastEl = document.getElementById('toast');
            await waitFor(() => {
                expect(toastEl.classList.contains('hidden')).toBe(false);
            });
            expect(toastEl.textContent).toBe('Share link copied to clipboard!');
        });
    });

    describe('Task Management', () => {
        beforeEach(() => {
            setupDOMAndScript();
            document.getElementById('user-name-setup-input').value = 'Test User';
            document.getElementById('start-session-btn').click();
            document.querySelector('[data-view="tasks"]').click();
        });

        test('should add a task when pressing Enter in the input field', async () => {
            const todoIdeaInput = document.getElementById('todo-idea-input');
            const todoList = document.getElementById('todo-list');
            
            todoIdeaInput.value = 'New task from Enter';
            const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            todoIdeaInput.dispatchEvent(event);

            await waitFor(() => {
                expect(todoList.children.length).toBe(1);
            });

            expect(todoList.textContent).toContain('New task from Enter');
            expect(todoIdeaInput.value).toBe('');
        });
    });

    describe('Planner View Dynamic Content', () => {
        test('should fetch and display calendar.html when planner tab is clicked', async () => {
            const mockCalendarContent = '<div id="mock-calendar-content">Calendar Loaded Successfully</div>';
            global.fetch = jest.fn((url) => {
                if (url.endsWith('src/calendar.html')) {
                    return Promise.resolve({
                        ok: true,
                        text: () => Promise.resolve(mockCalendarContent),
                    });
                }
                // A default mock for any other fetch calls
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({}),
                    text: () => Promise.resolve(''),
                });
            });

            setupDOMAndScript();

            // Simulate starting the session
            document.getElementById('user-name-setup-input').value = 'Test User';
            document.getElementById('start-session-btn').click();
            
            const plannerBtn = document.querySelector('[data-view="planner"]');
            const calendarContainer = document.getElementById('calendar-container');

            // Click the planner button to trigger the fetch
            plannerBtn.click();

            // Wait for the content to be loaded
            await waitFor(() => {
                expect(calendarContainer.innerHTML).toContain('Calendar Loaded Successfully');
            }, { timeout: 3000 }); // Added a specific timeout to prevent long waits

            // Verify fetch was called once for the calendar
            const calendarFetchCalls = global.fetch.mock.calls.filter(call => call[0].endsWith('src/calendar.html'));
            expect(calendarFetchCalls.length).toBe(1);
            
            // Click again and verify fetch is not called a second time
            plannerBtn.click();
            
            // Give a moment for any potential async operations to settle
            await new Promise(resolve => setTimeout(resolve, 100)); 
            
            const newCalendarFetchCalls = global.fetch.mock.calls.filter(call => call[0].endsWith('src/calendar.html'));
            expect(newCalendarFetchCalls.length).toBe(1);
        });
    });
});
