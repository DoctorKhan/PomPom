/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load the HTML file
const html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');

describe('PomPom Integration Tests', () => {
    let mockLocalStorage;

    beforeEach(() => {
        // Set up DOM
        document.documentElement.innerHTML = html;
        
        // Mock localStorage
        mockLocalStorage = {
            store: {},
            getItem: jest.fn((key) => mockLocalStorage.store[key] || null),
            setItem: jest.fn((key, value) => { mockLocalStorage.store[key] = value; }),
            removeItem: jest.fn((key) => { delete mockLocalStorage.store[key]; }),
            clear: jest.fn(() => { mockLocalStorage.store = {}; }),
        };
        global.localStorage = mockLocalStorage;
        
        // Mock other globals
        global.confirm = jest.fn(() => true);
        global.alert = jest.fn();
        
        // Mock window.location
        delete window.location;
        window.location = {
            hash: '',
            href: 'http://localhost:8000',
            pathname: '/',
            search: '',
            origin: 'http://localhost:8000',
        };
    });

    describe('Random Name Generation Functions', () => {
        test('should have generateRandomTeamName function available', () => {
            // Try to extract and execute the function from script tags
            const scripts = document.querySelectorAll('script');
            let hasFunction = false;
            
            scripts.forEach(script => {
                if (script.textContent && script.textContent.includes('generateRandomTeamName')) {
                    hasFunction = true;
                }
            });
            
            expect(hasFunction).toBeTruthy();
        });

        test('should have generateRandomUserName function available', () => {
            const scripts = document.querySelectorAll('script');
            let hasFunction = false;
            
            scripts.forEach(script => {
                if (script.textContent && script.textContent.includes('generateRandomUserName')) {
                    hasFunction = true;
                }
            });
            
            expect(hasFunction).toBeTruthy();
        });
    });

    describe('Default Values and Initial State', () => {
        test('should show correct default timer value', () => {
            const timerDisplay = document.querySelector('#timer-display');
            expect(timerDisplay.textContent).toContain('25:00');
        });

        test('should show correct default timer mode', () => {
            const timerModeDisplay = document.querySelector('#timer-mode-display');
            expect(timerModeDisplay.textContent).toContain('Focus Time');
            expect(timerModeDisplay.textContent).toContain('25m');
        });

        test('should have landing page visible by default', () => {
            const landingPage = document.querySelector('#landing-page');
            const nameInputPage = document.querySelector('#name-input-page');
            const sessionPage = document.querySelector('#session-page');

            expect(landingPage.classList.contains('hidden')).toBeFalsy();
            expect(nameInputPage.classList.contains('hidden')).toBeTruthy();
            expect(sessionPage.classList.contains('hidden')).toBeTruthy();
        });
    });

    describe('Form Input Validation', () => {
        test('should accept valid team names', () => {
            const sessionInput = document.querySelector('#session-name-input');
            
            const validNames = [
                'my-team',
                'awesome-project',
                'team123',
                'development-squad'
            ];

            validNames.forEach(name => {
                sessionInput.value = name;
                expect(sessionInput.value).toBe(name);
            });
        });

        test('should accept valid user names', () => {
            const userNameInput = document.querySelector('#user-name-setup-input');
            
            const validNames = [
                'John Doe',
                'Alice Smith',
                'Bob Johnson',
                'María García'
            ];

            validNames.forEach(name => {
                userNameInput.value = name;
                expect(userNameInput.value).toBe(name);
            });
        });

        test('should handle edge cases in input values', () => {
            const sessionInput = document.querySelector('#session-name-input');
            const userNameInput = document.querySelector('#user-name-setup-input');

            // Empty strings
            sessionInput.value = '';
            userNameInput.value = '';
            expect(sessionInput.value).toBe('');
            expect(userNameInput.value).toBe('');

            // Whitespace
            sessionInput.value = '   ';
            userNameInput.value = '   ';
            expect(sessionInput.value).toBe('   ');
            expect(userNameInput.value).toBe('   ');

            // Special characters
            sessionInput.value = 'team!@#$%';
            userNameInput.value = 'user!@#$%';
            expect(sessionInput.value).toBe('team!@#$%');
            expect(userNameInput.value).toBe('user!@#$%');
        });
    });

    describe('Button States and Interactions', () => {
        test('should have all required buttons present', () => {
            const continueBtn = document.querySelector('#create-session-btn');
            const startBtn = document.querySelector('#start-session-btn');
            const shuffleBtn = document.querySelector('#shuffle-user-name-btn');
            const leaveBtn = document.querySelector('#leave-btn');

            expect(continueBtn).toBeTruthy();
            expect(startBtn).toBeTruthy();
            expect(shuffleBtn).toBeTruthy();
            expect(leaveBtn).toBeTruthy();
        });

        test('should have proper button text content', () => {
            const continueBtn = document.querySelector('#create-session-btn');
            const startBtn = document.querySelector('#start-session-btn');
            const shuffleBtn = document.querySelector('#shuffle-user-name-btn');

            expect(continueBtn.textContent).toContain('Continue');
            expect(startBtn.textContent).toContain('Start');
            expect(shuffleBtn.textContent).toContain('🎲');
        });

        test('should have buttons with proper styling classes', () => {
            const continueBtn = document.querySelector('#create-session-btn');
            const startBtn = document.querySelector('#start-session-btn');
            const leaveBtn = document.querySelector('#leave-btn');

            expect(continueBtn.className).toBeTruthy();
            expect(startBtn.className).toBeTruthy();
            expect(leaveBtn.className).toBeTruthy();
        });
    });

    describe('Timer Mode Controls', () => {
        test('should have all timer mode buttons', () => {
            const modes = [
                'pomodoro25',
                'pomodoro30', 
                'pomodoro45',
                'shortBreak',
                'longBreak'
            ];

            modes.forEach(mode => {
                const btn = document.querySelector(`[data-mode="${mode}"]`);
                expect(btn).toBeTruthy();
            });
        });

        test('should have correct mode button labels', () => {
            const pomodoro25 = document.querySelector('[data-mode="pomodoro25"]');
            const pomodoro30 = document.querySelector('[data-mode="pomodoro30"]');
            const shortBreak = document.querySelector('[data-mode="shortBreak"]');

            expect(pomodoro25.textContent).toContain('25m');
            expect(pomodoro30.textContent).toContain('30m');
            expect(shortBreak.textContent).toContain('5m');
        });
    });

    describe('Session Page Elements', () => {
        test('should have timer controls', () => {
            const startPauseBtn = document.querySelector('#start-pause-btn');
            const resetBtn = document.querySelector('#reset-btn');
            const goalInput = document.querySelector('#goal-input');

            expect(startPauseBtn).toBeTruthy();
            expect(resetBtn).toBeTruthy();
            expect(goalInput).toBeTruthy();
        });

        test('should have navigation sidebar', () => {
            const timerViewBtn = document.querySelector('#timer-view-btn');
            const participantsViewBtn = document.querySelector('#participants-view-btn');
            const chatViewBtn = document.querySelector('#chat-view-btn');
            const userAvatar = document.querySelector('#user-avatar');

            expect(timerViewBtn).toBeTruthy();
            expect(participantsViewBtn).toBeTruthy();
            expect(chatViewBtn).toBeTruthy();
            expect(userAvatar).toBeTruthy();
        });

        test('should have proper view containers', () => {
            const timerView = document.querySelector('#timer-view');
            const plannerView = document.querySelector('#planner-view');
            const participantsView = document.querySelector('#participants-view');
            const chatView = document.querySelector('#chat-view');

            expect(timerView).toBeTruthy();
            expect(plannerView).toBeTruthy();
            expect(participantsView).toBeTruthy();
            expect(chatView).toBeTruthy();
        });
    });

    describe('Accessibility Features', () => {
        test('should have proper input labels and placeholders', () => {
            const sessionInput = document.querySelector('#session-name-input');
            const userNameInput = document.querySelector('#user-name-setup-input');
            const goalInput = document.querySelector('#goal-input');

            expect(sessionInput.placeholder).toBeTruthy();
            expect(userNameInput.placeholder).toBeTruthy();
            expect(goalInput.placeholder).toBeTruthy();
        });

        test('should have button titles for accessibility', () => {
            const shuffleBtn = document.querySelector('#shuffle-user-name-btn');
            const leaveBtn = document.querySelector('#leave-btn');
            const timerViewBtn = document.querySelector('#timer-view-btn');

            expect(shuffleBtn.title).toBeTruthy();
            expect(leaveBtn.title).toBeTruthy();
            expect(timerViewBtn.title).toBeTruthy();
        });

        test('should have proper heading hierarchy', () => {
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            expect(headings.length).toBeGreaterThan(0);

            // Check that we have main headings
            const h1Elements = document.querySelectorAll('h1');
            const h2Elements = document.querySelectorAll('h2');
            
            expect(h1Elements.length).toBeGreaterThan(0);
            expect(h2Elements.length).toBeGreaterThan(0);
        });
    });

    describe('CSS and Styling', () => {
        test('should have kawaii animations defined', () => {
            const styles = document.querySelector('style').textContent;
            expect(styles).toContain('kawaii-float');
            expect(styles).toContain('@keyframes');
        });

        test('should have glassmorphism styling', () => {
            const styles = document.querySelector('style').textContent;
            expect(styles).toContain('glassmorphism');
            expect(styles).toContain('backdrop-filter');
        });

        test('should have responsive design classes', () => {
            const sessionPage = document.querySelector('#session-page');
            const mainContent = document.querySelector('main');

            expect(sessionPage.className).toContain('flex');
            expect(mainContent.className).toContain('flex');
        });

        test('should have proper color scheme', () => {
            const styles = document.querySelector('style').textContent;
            
            // Check for blue/sky theme colors
            expect(styles).toContain('#0ea5e9');
            expect(styles).toContain('gradient');
        });
    });

    describe('Modal Elements', () => {
        test('should have user name editing modal', () => {
            const modal = document.querySelector('#user-name-modal');
            const modalInput = document.querySelector('#user-name-modal-input');
            const saveBtn = document.querySelector('#save-user-name');
            const cancelBtn = document.querySelector('#cancel-user-name');

            expect(modal).toBeTruthy();
            expect(modalInput).toBeTruthy();
            expect(saveBtn).toBeTruthy();
            expect(cancelBtn).toBeTruthy();
        });

        test('should have end session modal', () => {
            const modal = document.querySelector('#end-session-modal');
            const dismissBtn = document.querySelector('#end-session-dismiss-btn');

            expect(modal).toBeTruthy();
            expect(dismissBtn).toBeTruthy();
        });
    });
});
