/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load the HTML file
const html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');

describe('PomPom Basic Functionality', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
        
        // Mock localStorage
        const localStorageMock = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
        };
        global.localStorage = localStorageMock;
        
        // Mock window.location
        delete window.location;
        window.location = {
            hash: '',
            href: 'http://localhost:8000',
            pathname: '/',
            search: '',
            origin: 'http://localhost:8000'
        };
    });

    describe('DOM Elements', () => {
        test('should have session name input on landing page', () => {
            const sessionInput = document.querySelector('#session-name-input');
            expect(sessionInput).toBeTruthy();
            expect(sessionInput.placeholder).toBeTruthy();
            expect(sessionInput.placeholder.length).toBeGreaterThan(0);
        });

        test('should have start button on welcome page', () => {
            const startBtn = document.querySelector('#start-session-btn');
            expect(startBtn).toBeTruthy();
            expect(startBtn.textContent).toMatch(/Start/i);
        });

        test('should have user name input on name input page', () => {
            const userNameInput = document.querySelector('#user-name-setup-input');
            expect(userNameInput).toBeTruthy();
            expect(userNameInput.placeholder).toBeTruthy();
        });

        test('should have shuffle button (dice) on name input page', () => {
            const shuffleBtn = document.querySelector('#shuffle-user-name-btn');
            expect(shuffleBtn).toBeTruthy();
            expect(shuffleBtn.title).toBeTruthy();
        });

        test('should have start session button on name input page', () => {
            const startBtn = document.querySelector('#start-session-btn');
            expect(startBtn).toBeTruthy();
            expect(startBtn.textContent).toContain('Start');
        });

        test('should have timer display on session page', () => {
            const timerDisplay = document.querySelector('#timer-display');
            expect(timerDisplay).toBeTruthy();
            expect(timerDisplay.textContent).toContain('25:00');
        });

        test('should have start/pause button on session page', () => {
            const startPauseBtn = document.querySelector('#start-pause-btn');
            expect(startPauseBtn).toBeTruthy();
        });

        test('should have reset button on session page', () => {
            const resetBtn = document.querySelector('#reset-btn');
            expect(resetBtn).toBeTruthy();
        });

        test('should have current task display on session page', () => {
            const currentTaskDisplay = document.querySelector('#current-task-display');
            expect(currentTaskDisplay).toBeTruthy();
            expect(currentTaskDisplay.textContent).toContain('No task selected');
        });

        test('should have leave button in session page sidebar', () => {
            const leaveBtn = document.querySelector('#leave-btn');
            expect(leaveBtn).toBeTruthy();
            expect(leaveBtn.title).toContain('Leave');
        });
    });

    describe('Page Structure', () => {
        test('should have required page containers', () => {
            const welcomePage = document.querySelector('#welcome-page');
            const sessionPage = document.querySelector('#session-page');

            expect(welcomePage).toBeTruthy();
            expect(sessionPage).toBeTruthy();
        });

        test('initially welcome page is visible and session page hidden', () => {
            const welcomePage = document.querySelector('#welcome-page');
            const sessionPage = document.querySelector('#session-page');

            expect(welcomePage.classList.contains('hidden')).toBeFalsy();
            expect(sessionPage.classList.contains('hidden')).toBeTruthy();
        });

        test('should have glass look on session page', () => {
            const sessionPage = document.querySelector('#session-page');
            expect(sessionPage.className).toMatch(/glass/i);
        });
    });

    describe('Timer Modes', () => {
        test('should have pomodoro mode buttons', () => {
            const pomodoro25 = document.querySelector('[data-mode="pomodoro25"]');
            const shortBreak = document.querySelector('[data-mode="shortBreak"]');
            const longBreak = document.querySelector('[data-mode="longBreak"]');

            expect(pomodoro25).toBeTruthy();
            expect(shortBreak).toBeTruthy();
            expect(longBreak).toBeTruthy();

            expect(pomodoro25.textContent).toMatch(/25m|Focus/);
        });

        test('should have break mode buttons', () => {
            const shortBreak = document.querySelector('[data-mode="shortBreak"]');
            const longBreak = document.querySelector('[data-mode="longBreak"]');

            expect(shortBreak).toBeTruthy();
            expect(longBreak).toBeTruthy();
        });
    });

    describe('Navigation Elements', () => {
        test('should have navigation tabs in header', () => {
            const navTabs = document.querySelectorAll('.main-tab');
            expect(navTabs.length).toBeGreaterThanOrEqual(3);

            // Check for specific tabs
            expect(document.getElementById('timer-tab')).toBeTruthy();
            expect(document.getElementById('tasks-tab')).toBeTruthy();
            expect(document.getElementById('team-tab')).toBeTruthy();
        });

        test('should have copy link button and leave button', () => {
            const copy = document.querySelector('#copy-link-btn');
            const leave = document.querySelector('#leave-btn');
            expect(copy).toBeTruthy();
            expect(leave).toBeTruthy();
        });
    });

    describe('Form Validation', () => {
        test('session name input should accept text', () => {
            const sessionInput = document.querySelector('#session-name-input');
            sessionInput.value = 'test-team';
            expect(sessionInput.value).toBe('test-team');
        });

        test('user name input should accept text', () => {
            const userNameInput = document.querySelector('#user-name-setup-input');
            userNameInput.value = 'Test User';
            expect(userNameInput.value).toBe('Test User');
        });

        test('goal input should accept text', () => {
            const goalInput = document.querySelector('#goal-input');
            goalInput.value = 'Complete project';
            expect(goalInput.value).toBe('Complete project');
        });
    });

    describe('Accessibility', () => {
        test('buttons should have proper titles/labels', () => {
            const shuffleBtn = document.querySelector('#shuffle-user-name-btn');
            const leaveBtn = document.querySelector('#leave-btn');

            expect(shuffleBtn.title).toBeTruthy();
            expect(leaveBtn.title).toBeTruthy();
        });

        test('inputs should have proper placeholders', () => {
            const sessionInput = document.querySelector('#session-name-input');
            const userNameInput = document.querySelector('#user-name-setup-input');
            const goalInput = document.querySelector('#goal-input');

            expect(sessionInput.placeholder).toBeTruthy();
            expect(userNameInput.placeholder).toBeTruthy();
            expect(goalInput.placeholder).toBeTruthy();
        });
    });

    describe('CSS Classes', () => {
        test('should have kawaii styling classes', () => {
            const styles = document.querySelector('style').textContent;
            expect(styles).toContain('kawaii-float');
        });

        test('should have proper button styling', () => {
            const startBtn = document.querySelector('#start-session-btn');
            expect(startBtn.classList.length).toBeGreaterThan(0);
        });
    });

    describe('Default Values', () => {
        test('timer should show default 25:00', () => {
            const timerDisplay = document.querySelector('#timer-display');
            expect(timerDisplay.textContent).toContain('25:00');
        });

        test('timer mode should show default focus time', () => {
            const timerModeDisplay = document.querySelector('#timer-mode-display');
            expect(timerModeDisplay.textContent).toContain('Focus Time');
        });
    });
});

describe('PomPom Integration Tests', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
        
        // Mock localStorage
        const localStorageMock = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
        };
        global.localStorage = localStorageMock;
    });

    test('should have consistent theme colors', () => {
        const styles = document.querySelector('style').textContent;
        expect(styles).toContain('linear-gradient');
        expect(styles).toContain('#00A6A6');
    });

    test('should have proper responsive design classes', () => {
        const sessionPage = document.querySelector('#session-page');
        const mainContent = document.querySelector('main');
        
        expect(sessionPage.className).toContain('flex');
        expect(mainContent.className).toContain('flex');
    });
});
