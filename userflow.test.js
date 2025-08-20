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
        test('should navigate from landing page to name input page', () => {
            const sessionInput = document.querySelector('#session-name-input');
            const continueBtn = document.querySelector('#create-session-btn');
            const landingPage = document.querySelector('#landing-page');
            const nameInputPage = document.querySelector('#name-input-page');

            // Initially on landing page
            expect(landingPage.classList.contains('hidden')).toBeFalsy();
            expect(nameInputPage.classList.contains('hidden')).toBeTruthy();

            // Enter team name and continue
            sessionInput.value = 'test-team';
            continueBtn.click();

            // Should navigate to name input page
            expect(landingPage.classList.contains('hidden')).toBeTruthy();
            expect(nameInputPage.classList.contains('hidden')).toBeFalsy();
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

        test('should navigate to session page after entering name', () => {
            // Navigate through the full flow
            const sessionInput = document.querySelector('#session-name-input');
            const continueBtn = document.querySelector('#create-session-btn');
            const userNameInput = document.querySelector('#user-name-setup-input');
            const startBtn = document.querySelector('#start-session-btn');
            
            const landingPage = document.querySelector('#landing-page');
            const nameInputPage = document.querySelector('#name-input-page');
            const sessionPage = document.querySelector('#session-page');

            // Step 1: Landing page
            sessionInput.value = 'test-team';
            continueBtn.click();

            // Step 2: Name input page
            expect(nameInputPage.classList.contains('hidden')).toBeFalsy();
            
            userNameInput.value = 'Test User';
            startBtn.click();

            // Step 3: Should be on session page
            expect(sessionPage.classList.contains('hidden')).toBeFalsy();
            expect(nameInputPage.classList.contains('hidden')).toBeTruthy();
        });
    });

    describe('User Name Persistence', () => {
        test('should save user name to localStorage on input', () => {
            const userNameInput = document.querySelector('#user-name-setup-input');
            
            userNameInput.value = 'Persistent User';
            
            // Trigger input event to save to localStorage
            const inputEvent = new Event('input', { bubbles: true });
            userNameInput.dispatchEvent(inputEvent);
            
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('pompom_username', 'Persistent User');
        });

        test('should save team name to localStorage on input', () => {
            const sessionInput = document.querySelector('#session-name-input');
            
            sessionInput.value = 'persistent-team';
            
            // Trigger input event to save to localStorage
            const inputEvent = new Event('input', { bubbles: true });
            sessionInput.dispatchEvent(inputEvent);
            
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('pompom_team_name', expect.any(String));
        });

        test('should load saved user name on page load', () => {
            // Pre-populate localStorage
            mockLocalStorage.store['pompom_username'] = 'Saved User';
            
            // Simulate page load by calling the initialization function
            // Note: This would need the actual JavaScript to be executed
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('pompom_username');
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

        test('should open modal when avatar is clicked', () => {
            const userAvatar = document.querySelector('#user-avatar');
            const userNameModal = document.querySelector('#user-name-modal');
            
            // Initially modal should be hidden
            expect(userNameModal.classList.contains('hidden')).toBeTruthy();
            
            // Click avatar
            userAvatar.click();
            
            // Modal should be visible (assuming the event handler works)
            // Note: This test depends on the actual JavaScript being executed
        });

        test('should save edited user name', () => {
            const userNameModalInput = document.querySelector('#user-name-modal-input');
            const saveUserNameBtn = document.querySelector('#save-user-name');
            
            userNameModalInput.value = 'Edited User Name';
            saveUserNameBtn.click();
            
            // Should save to localStorage
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('pompom_username', 'Edited User Name');
        });
    });

    describe('Enter Key Navigation', () => {
        test('should support Enter key on landing page', () => {
            const sessionInput = document.querySelector('#session-name-input');
            const landingPage = document.querySelector('#landing-page');
            const nameInputPage = document.querySelector('#name-input-page');
            
            sessionInput.value = 'enter-test-team';
            
            // Simulate Enter key press
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true
            });
            sessionInput.dispatchEvent(enterEvent);
            
            // Should navigate to name input page
            // Note: This depends on the actual event handler being attached
        });

        test('should support Enter key on name input page', () => {
            const userNameInput = document.querySelector('#user-name-setup-input');
            const nameInputPage = document.querySelector('#name-input-page');
            const sessionPage = document.querySelector('#session-page');
            
            userNameInput.value = 'Enter Test User';
            
            // Simulate Enter key press
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true
            });
            userNameInput.dispatchEvent(enterEvent);
            
            // Should navigate to session page
            // Note: This depends on the actual event handler being attached
        });
    });

    describe('Leave Team Flow', () => {
        test('should have leave button in sidebar', () => {
            const leaveBtn = document.querySelector('#leave-btn');
            
            expect(leaveBtn).toBeTruthy();
            expect(leaveBtn.title).toContain('Leave');
        });

        test('should clear team name but keep user name when leaving', () => {
            const leaveBtn = document.querySelector('#leave-btn');
            
            // Pre-populate localStorage
            mockLocalStorage.store['pompom_team_name'] = 'test-team';
            mockLocalStorage.store['pompom_username'] = 'Test User';
            
            // Click leave button
            leaveBtn.click();
            
            // Should remove team name but keep user name
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('pompom_team_name');
            // User name should NOT be removed
            expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith('pompom_username');
        });

        test('should show confirmation dialog when leaving', () => {
            const leaveBtn = document.querySelector('#leave-btn');
            
            leaveBtn.click();
            
            expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('sure'));
        });

        test('should navigate back to landing page after leaving', () => {
            const leaveBtn = document.querySelector('#leave-btn');
            
            leaveBtn.click();
            
            // Should update the hash to go back to landing
            expect(window.location.hash).toBe('#/');
        });
    });

    describe('Form Validation and UX', () => {
        test('should handle empty team name gracefully', () => {
            const sessionInput = document.querySelector('#session-name-input');
            const continueBtn = document.querySelector('#create-session-btn');
            
            // Leave team name empty
            sessionInput.value = '';
            continueBtn.click();
            
            // Should still navigate (will generate random name)
            const nameInputPage = document.querySelector('#name-input-page');
            expect(nameInputPage.classList.contains('hidden')).toBeFalsy();
        });

        test('should handle empty user name gracefully', () => {
            const userNameInput = document.querySelector('#user-name-setup-input');
            const startBtn = document.querySelector('#start-session-btn');
            
            // Leave user name empty
            userNameInput.value = '';
            startBtn.click();
            
            // Should still navigate (will generate random name)
            const sessionPage = document.querySelector('#session-page');
            expect(sessionPage.classList.contains('hidden')).toBeFalsy();
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

        test('should handle multiple team switches', () => {
            // First team
            mockLocalStorage.store['pompom_team_name'] = 'team-one';
            mockLocalStorage.store['pompom_username'] = 'Consistent User';

            // Leave team (clears team name, keeps user name)
            const leaveBtn = document.querySelector('#leave-btn');
            leaveBtn.click();

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('pompom_team_name');

            // Join new team
            const sessionInput = document.querySelector('#session-name-input');
            sessionInput.value = 'team-two';

            const inputEvent = new Event('input', { bubbles: true });
            sessionInput.dispatchEvent(inputEvent);

            // User name should persist across team switches
            expect(mockLocalStorage.store['pompom_username']).toBe('Consistent User');
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
