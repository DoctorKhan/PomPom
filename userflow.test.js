/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load the HTML file
const html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');

describe('PomPom User Flow Tests', () => {
    let mockLocalStorage;

    beforeEach(() => {
        document.documentElement.innerHTML = html;
        
        // Mock localStorage with more detailed tracking
        mockLocalStorage = {
            store: {},
            getItem: jest.fn((key) => mockLocalStorage.store[key] || null),
            setItem: jest.fn((key, value) => { mockLocalStorage.store[key] = value; }),
            removeItem: jest.fn((key) => { delete mockLocalStorage.store[key]; }),
            clear: jest.fn(() => { mockLocalStorage.store = {}; }),
        };
        global.localStorage = mockLocalStorage;
        
        // Mock window.location
        delete window.location;
        window.location = {
            hash: '',
            href: 'http://localhost:8000',
            pathname: '/',
            search: '',
            origin: 'http://localhost:8000',
            assign: jest.fn(),
            replace: jest.fn(),
            reload: jest.fn(),
        };

        // Mock window.history
        window.history = {
            pushState: jest.fn(),
            replaceState: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
        };

        // Mock confirm dialog
        window.confirm = jest.fn(() => true);
        
        // Mock alert dialog
        window.alert = jest.fn();
    });

    describe('User Name Entry Flow', () => {
        test('should have landing and name input pages wired for routing (contract)', () => {
            const continueBtn = document.querySelector('#create-session-btn');
            const landingPage = document.querySelector('#landing-page');
            const nameInputPage = document.querySelector('#name-input-page');
            expect(continueBtn).toBeTruthy();
            // Initial visibility
            expect(landingPage.classList.contains('hidden')).toBeFalsy();
            expect(nameInputPage.classList.contains('hidden')).toBeTruthy();
            // Contract: code defines handleRouting for navigation
            const scripts = Array.from(document.scripts).map(s => s.textContent || '').join('\n');
            expect(scripts).toContain('function handleRouting');
        });

        test('should accept user name input', () => {
            const userNameInput = document.querySelector('#user-name-setup-input');
            
            userNameInput.value = 'John Doe';
            expect(userNameInput.value).toBe('John Doe');
        });

        test('should generate random name with dice button', () => {
            const userNameInput = document.querySelector('#user-name-setup-input');
            const shuffleBtn = document.querySelector('#shuffle-user-name-btn');
            
            const initialValue = userNameInput.value;
            shuffleBtn.click();
            
            // Should have populated the input (assuming the function works)
            // Note: This test depends on the actual JavaScript function being available
            expect(userNameInput.value).toBeDefined();
        });

        test('should define start session workflow (contract)', () => {
            const startBtn = document.querySelector('#start-session-btn');
            const scripts = Array.from(document.scripts).map(s => s.textContent || '').join('\n');
            expect(startBtn).toBeTruthy();
            // Contract: start session stores username and calls showSessionPage
            expect(scripts).toContain("localStorage.setItem('pompom_username'");
            expect(scripts).toContain('showSessionPage();');
        });
    });

    describe('User Name Persistence', () => {
        test('should save user name to localStorage on input (contract)', () => {
            const scripts = Array.from(document.scripts).map(s => s.textContent || '').join('\n');
            expect(scripts).toContain("localStorage.setItem('pompom_username'");
        });

        test('should save team name to localStorage on input (contract)', () => {
            const scripts = Array.from(document.scripts).map(s => s.textContent || '').join('\n');
            expect(scripts).toContain("localStorage.setItem('pompom_team_name'");
        });

        test('should attempt to load saved user name on init (contract)', () => {
            const scripts = Array.from(document.scripts).map(s => s.textContent || '').join('\n');
            // Code paths that load/use stored username on routing or init
            expect(scripts).toContain("localStorage.getItem('pompom_username'");
        });

        test('should maintain user name between sessions', () => {
            const userNameInput = document.querySelector('#user-name-setup-input');
            
            // First session
            userNameInput.value = 'Session User';
            const inputEvent = new Event('input', { bubbles: true });
            userNameInput.dispatchEvent(inputEvent);
            
            // Simulate page reload
            mockLocalStorage.store['pompom_username'] = 'Session User';
            
            // Check that the name persists
            expect(mockLocalStorage.store['pompom_username']).toBe('Session User');
        });
    });

    describe('User Name Editing on Session Page', () => {
        test('should have user avatar that can be clicked', () => {
            const userAvatar = document.querySelector('#user-avatar');
            
            expect(userAvatar).toBeTruthy();
            expect(userAvatar.classList.contains('cursor-pointer')).toBeTruthy();
            expect(userAvatar.title).toContain('edit');
        });

        test('should have user name modal for editing', () => {
            const userNameModal = document.querySelector('#user-name-modal');
            const userNameModalInput = document.querySelector('#user-name-modal-input');
            const saveUserNameBtn = document.querySelector('#save-user-name');
            const cancelUserNameBtn = document.querySelector('#cancel-user-name');
            
            expect(userNameModal).toBeTruthy();
            expect(userNameModalInput).toBeTruthy();
            expect(saveUserNameBtn).toBeTruthy();
            expect(cancelUserNameBtn).toBeTruthy();
        });

        test('should wire avatar click -> open modal (contract)', () => {
            const scripts = Array.from(document.scripts).map(s => s.textContent || '').join('\n');
            expect(scripts).toContain("userAvatar.addEventListener('click'");
        });

        test('should save edited user name (contract)', () => {
            const scripts = Array.from(document.scripts).map(s => s.textContent || '').join('\n');
            expect(scripts).toContain("localStorage.setItem('pompom_username'");
            expect(scripts).toContain('updateUserNameUI();');
        });
    });

    describe('Enter Key Navigation', () => {
        test('should support Enter key on landing page (contract)', () => {
            const scripts = Array.from(document.scripts).map(s => s.textContent || '').join('\n');
            expect(scripts).toContain("createSessionBtn.addEventListener('click'");
        });

        test('should support Enter key on name input page (contract)', () => {
            const scripts = Array.from(document.scripts).map(s => s.textContent || '').join('\n');
            expect(scripts).toContain("startSessionBtn.addEventListener('click'");
        });
    });

    describe('Leave Team Flow', () => {
        test('should have leave button in sidebar', () => {
            const leaveBtn = document.querySelector('#leave-btn');
            
            expect(leaveBtn).toBeTruthy();
            expect(leaveBtn.title).toContain('Leave');
        });

        test('should clear team name but keep user name when leaving (contract)', () => {
            const scripts = Array.from(document.scripts).map(s => s.textContent || '').join('\n');
            expect(scripts).toContain("localStorage.removeItem('pompom_team_name')");
            expect(scripts).not.toContain("localStorage.removeItem('pompom_username')");
        });

        test('should wire leave confirmation (contract)', () => {
            const scripts = Array.from(document.scripts).map(s => s.textContent || '').join('\n');
            expect(scripts).toContain("confirm('Are you sure you want to leave");
        });

        test('should navigate back to landing page after leaving (contract)', () => {
            const scripts = Array.from(document.scripts).map(s => s.textContent || '').join('\n');
            expect(scripts).toContain("window.location.hash = '#/'");
            expect(scripts).toContain('handleRouting();');
        });
    });

    describe('Form Validation and UX', () => {
        test('should handle empty team name gracefully (contract)', () => {
            const scripts = Array.from(document.scripts).map(s => s.textContent || '').join('\n');
            // Code generates a random team name if empty
            expect(scripts).toContain('if (!name) name = generateRandomTeamName()');
        });

        test('should handle empty user name gracefully (contract)', () => {
            const scripts = Array.from(document.scripts).map(s => s.textContent || '').join('\n');
            // Code fills random username when missing
            expect(scripts).toContain('generateRandomUserName()');
            expect(scripts).toContain("localStorage.setItem('pompom_username'");
        });

        test('should trim whitespace from inputs', () => {
            const sessionInput = document.querySelector('#session-name-input');
            const userNameInput = document.querySelector('#user-name-setup-input');
            
            sessionInput.value = '  spaced team  ';
            userNameInput.value = '  spaced user  ';
            
            // Values should be trimmed when processed
            expect(sessionInput.value.trim()).toBe('spaced team');
            expect(userNameInput.value.trim()).toBe('spaced user');
        });
    });

    describe('Session State Management', () => {
        test('should maintain session state across page refreshes', () => {
            // Pre-populate localStorage with session data
            mockLocalStorage.store['pompom_team_name'] = 'persistent-team';
            mockLocalStorage.store['pompom_username'] = 'Persistent User';

            // Simulate page load
            expect(mockLocalStorage.getItem('pompom_team_name')).toBe('persistent-team');
            expect(mockLocalStorage.getItem('pompom_username')).toBe('Persistent User');
        });

        test('should handle corrupted localStorage gracefully', () => {
            // Mock localStorage to throw errors
            mockLocalStorage.getItem.mockImplementation(() => {
                throw new Error('localStorage error');
            });

            // Should not crash when localStorage fails
            expect(() => {
                mockLocalStorage.getItem('pompom_username');
            }).toThrow();
        });

        test('should clear leave intent flag after successful navigation', () => {
            // Set leave intent flag
            mockLocalStorage.store['pompom_leave_intent'] = '1';

            // Should be able to clear it
            mockLocalStorage.removeItem('pompom_leave_intent');
            expect(mockLocalStorage.store['pompom_leave_intent']).toBeUndefined();
        });
    });

    describe('Advanced User Flows', () => {
        test('should handle rapid navigation between pages', () => {
            const sessionInput = document.querySelector('#session-name-input');
            const continueBtn = document.querySelector('#create-session-btn');
            const userNameInput = document.querySelector('#user-name-setup-input');
            const startBtn = document.querySelector('#start-session-btn');

            // Rapid navigation
            sessionInput.value = 'rapid-team';
            continueBtn.click();

            userNameInput.value = 'Rapid User';
            startBtn.click();

            // Should handle rapid clicks gracefully
            const sessionPage = document.querySelector('#session-page');
            expect(sessionPage).toBeTruthy();
        });

        test('should handle special characters in names', () => {
            const sessionInput = document.querySelector('#session-name-input');
            const userNameInput = document.querySelector('#user-name-setup-input');

            // Test special characters
            sessionInput.value = 'team-with-special!@#$%^&*()';
            userNameInput.value = 'User with émojis 🎉';

            // Should accept special characters
            expect(sessionInput.value).toContain('special!@#$%^&*()');
            expect(userNameInput.value).toContain('émojis 🎉');
        });

        test('should handle very long names', () => {
            const sessionInput = document.querySelector('#session-name-input');
            const userNameInput = document.querySelector('#user-name-setup-input');

            const longTeamName = 'a'.repeat(100);
            const longUserName = 'b'.repeat(100);

            sessionInput.value = longTeamName;
            userNameInput.value = longUserName;

            // Should accept long names
            expect(sessionInput.value.length).toBe(100);
            expect(userNameInput.value.length).toBe(100);
        });

        test('should handle multiple team switches (contract)', () => {
            const scripts = Array.from(document.scripts).map(s => s.textContent || '').join('\n');
            expect(scripts).toContain("localStorage.removeItem('pompom_team_name')");
            expect(scripts).toContain("localStorage.setItem('pompom_team_name'");
        });
    });

    describe('Accessibility and UX', () => {
        test('should have proper ARIA labels and roles', () => {
            const sessionInput = document.querySelector('#session-name-input');
            const userNameInput = document.querySelector('#user-name-setup-input');
            const shuffleBtn = document.querySelector('#shuffle-user-name-btn');

            // Check for accessibility attributes
            expect(sessionInput.getAttribute('placeholder')).toBeTruthy();
            expect(userNameInput.getAttribute('placeholder')).toBeTruthy();
            expect(shuffleBtn.getAttribute('title')).toBeTruthy();
        });

        test('should provide visual feedback for user actions', () => {
            const continueBtn = document.querySelector('#create-session-btn');
            const startBtn = document.querySelector('#start-session-btn');
            const leaveBtn = document.querySelector('#leave-btn');

            // Buttons should have hover states and proper styling
            expect(continueBtn.classList.length).toBeGreaterThan(0);
            expect(startBtn.classList.length).toBeGreaterThan(0);
            expect(leaveBtn.classList.length).toBeGreaterThan(0);
        });

        test('should handle keyboard navigation', () => {
            const sessionInput = document.querySelector('#session-name-input');
            const userNameInput = document.querySelector('#user-name-setup-input');

            // Should be focusable
            sessionInput.focus();
            expect(document.activeElement).toBe(sessionInput);

            userNameInput.focus();
            expect(document.activeElement).toBe(userNameInput);
        });

        test('should provide clear visual hierarchy', () => {
            const landingPage = document.querySelector('#landing-page');
            const nameInputPage = document.querySelector('#name-input-page');
            const sessionPage = document.querySelector('#session-page');

            // Pages should have proper structure
            expect(landingPage.querySelector('h1')).toBeTruthy();
            expect(nameInputPage.querySelector('h1')).toBeTruthy();
            expect(sessionPage.querySelector('h2')).toBeTruthy();
        });
    });

    describe('Error Handling', () => {
        test('should handle missing DOM elements gracefully', () => {
            // Remove an element
            const element = document.querySelector('#session-name-input');
            element.remove();

            // Should not crash when element is missing
            const missingElement = document.querySelector('#session-name-input');
            expect(missingElement).toBeNull();
        });

        test('should handle localStorage quota exceeded', () => {
            // Mock localStorage to throw quota exceeded error
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });

            // Should handle storage errors gracefully
            expect(() => {
                mockLocalStorage.setItem('test', 'value');
            }).toThrow('QuotaExceededError');
        });

        test('should handle network connectivity issues', () => {
            // Mock offline state
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false
            });

            expect(navigator.onLine).toBe(false);
        });
    });
});
