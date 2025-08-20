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

        test('should have continue button on landing page', () => {
            const continueBtn = document.querySelector('#create-session-btn');
            expect(continueBtn).toBeTruthy();
            expect(continueBtn.textContent).toContain('Continue');
        });

        test('should have user name input on name input page', () => {
            const userNameInput = document.querySelector('#user-name-setup-input');
            expect(userNameInput).toBeTruthy();
            expect(userNameInput.placeholder).toBeTruthy();
        });

        test('should have shuffle button (dice) on name input page', () => {
            const shuffleBtn = document.querySelector('#shuffle-user-name-btn');
            expect(shuffleBtn).toBeTruthy();
            expect(shuffleBtn.textContent).toContain('🎲');
            expect(shuffleBtn.title).toContain('Random');
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

        test('should have goal input on session page', () => {
            const goalInput = document.querySelector('#goal-input');
            expect(goalInput).toBeTruthy();
            expect(goalInput.placeholder).toBeTruthy();
        });

        test('should have leave button in session page sidebar', () => {
            const leaveBtn = document.querySelector('#leave-btn');
            expect(leaveBtn).toBeTruthy();
            expect(leaveBtn.title).toContain('Leave');
        });
    });

    describe('Page Structure', () => {
        test('should have all required page containers', () => {
            const landingPage = document.querySelector('#landing-page');
            const nameInputPage = document.querySelector('#name-input-page');
            const sessionPage = document.querySelector('#session-page');

            expect(landingPage).toBeTruthy();
            expect(nameInputPage).toBeTruthy();
            expect(sessionPage).toBeTruthy();
        });

        test('initially only landing page should be visible', () => {
            const landingPage = document.querySelector('#landing-page');
            const nameInputPage = document.querySelector('#name-input-page');
            const sessionPage = document.querySelector('#session-page');

            expect(landingPage.classList.contains('hidden')).toBeFalsy();
            expect(nameInputPage.classList.contains('hidden')).toBeTruthy();
            expect(sessionPage.classList.contains('hidden')).toBeTruthy();
        });

        test('should have glassmorphism styling on session page', () => {
            const sessionPage = document.querySelector('#session-page');
            expect(sessionPage.classList.contains('glassmorphism')).toBeTruthy();
        });
    });

    describe('Timer Modes', () => {
        test('should have pomodoro mode buttons', () => {
            const pomodoro25 = document.querySelector('[data-mode="pomodoro25"]');
            const pomodoro30 = document.querySelector('[data-mode="pomodoro30"]');
            const pomodoro45 = document.querySelector('[data-mode="pomodoro45"]');

            expect(pomodoro25).toBeTruthy();
            expect(pomodoro30).toBeTruthy();
            expect(pomodoro45).toBeTruthy();

            expect(pomodoro25.textContent).toContain('25m');
            expect(pomodoro30.textContent).toContain('30m');
            expect(pomodoro45.textContent).toContain('45m');
        });

        test('should have break mode buttons', () => {
            const shortBreak = document.querySelector('[data-mode="shortBreak"]');
            const longBreak = document.querySelector('[data-mode="longBreak"]');

            expect(shortBreak).toBeTruthy();
            expect(longBreak).toBeTruthy();
        });
    });

    describe('Navigation Elements', () => {
        test('should have navigation buttons in sidebar', () => {
            const timerViewBtn = document.querySelector('#timer-view-btn');
            const participantsViewBtn = document.querySelector('#participants-view-btn');
            const chatViewBtn = document.querySelector('#chat-view-btn');

            expect(timerViewBtn).toBeTruthy();
            expect(participantsViewBtn).toBeTruthy();
            expect(chatViewBtn).toBeTruthy();
        });

        test('should have user avatar in sidebar', () => {
            const userAvatar = document.querySelector('#user-avatar');
            expect(userAvatar).toBeTruthy();
            expect(userAvatar.classList.contains('cursor-pointer')).toBeTruthy();
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
            const timerViewBtn = document.querySelector('#timer-view-btn');

            expect(shuffleBtn.title).toBeTruthy();
            expect(leaveBtn.title).toBeTruthy();
            expect(timerViewBtn.title).toBeTruthy();
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
            expect(styles).toContain('glassmorphism');
        });

        test('should have proper button styling', () => {
            const startBtn = document.querySelector('#start-session-btn');
            const continueBtn = document.querySelector('#create-session-btn');

            expect(startBtn.classList.length).toBeGreaterThan(0);
            expect(continueBtn.classList.length).toBeGreaterThan(0);
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
            expect(timerModeDisplay.textContent).toContain('25m');
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

        // Check for current blue color theme
        expect(styles).toContain('#0ea5e9'); // Sky blue color
        // New palette uses gradients between sky and blue
        expect(styles).toContain('#3b82f6'); // Blue for gradients
        expect(styles).toContain('linear-gradient');
    });

    test('should have proper responsive design classes', () => {
        const sessionPage = document.querySelector('#session-page');
        const mainContent = document.querySelector('main');
        
        expect(sessionPage.className).toContain('flex');
        expect(mainContent.className).toContain('flex');
    });
});
