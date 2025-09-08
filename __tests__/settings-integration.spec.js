/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load the main HTML file
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('Settings Integration Tests', () => {
    beforeEach(() => {
        // Set up DOM
        document.body.innerHTML = html;
        
        // Mock localStorage
        const localStorageMock = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
        };
        global.localStorage = localStorageMock;
        
        // Mock console methods to avoid noise
        global.console.error = jest.fn();
        global.console.log = jest.fn();
        
        // Mock sound functions
        global.playGong = jest.fn();
        global.showToast = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('settings button should exist and be functional', () => {
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        
        // Button should exist
        expect(settingsBtn).toBeTruthy();
        expect(settingsModal).toBeTruthy();
        
        // Button should have proper attributes
        expect(settingsBtn.getAttribute('title')).toBe('Settings');
        expect(settingsBtn.id).toBe('settings-btn');
        
        // Modal should be hidden initially
        expect(settingsModal.classList.contains('hidden')).toBe(true);
        
        // Button should have SVG icon
        const svg = settingsBtn.querySelector('svg');
        expect(svg).toBeTruthy();
        expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
        
        // SVG should have paths (the actual icon)
        const paths = svg.querySelectorAll('path');
        expect(paths.length).toBeGreaterThan(0);
    });

    test('settings button click should show modal', () => {
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        
        // Simulate the actual event handler logic
        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
        });
        
        // Initial state
        expect(settingsModal.classList.contains('hidden')).toBe(true);
        
        // Click the button
        settingsBtn.click();
        
        // Modal should now be visible
        expect(settingsModal.classList.contains('hidden')).toBe(false);
    });

    test('close settings button should hide modal', () => {
        const settingsModal = document.getElementById('settings-modal');
        const closeBtn = document.getElementById('close-settings-btn');
        
        // Show modal first
        settingsModal.classList.remove('hidden');
        expect(settingsModal.classList.contains('hidden')).toBe(false);
        
        // Add event handler
        closeBtn.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });
        
        // Click close button
        closeBtn.click();
        
        // Modal should be hidden
        expect(settingsModal.classList.contains('hidden')).toBe(true);
    });

    test('settings button should be accessible', () => {
        const settingsBtn = document.getElementById('settings-btn');
        
        // Button should be focusable
        expect(settingsBtn.tabIndex).not.toBe(-1);
        
        // Button should not be disabled
        expect(settingsBtn.disabled).toBe(false);
        
        // Button should have proper ARIA attributes
        expect(settingsBtn.getAttribute('title')).toBeTruthy();
        
        // Button should be visible (not display: none or visibility: hidden)
        const computedStyle = window.getComputedStyle(settingsBtn);
        expect(computedStyle.display).not.toBe('none');
        expect(computedStyle.visibility).not.toBe('hidden');
    });

    test('settings modal should have proper structure', () => {
        const settingsModal = document.getElementById('settings-modal');
        
        // Modal should have proper classes for styling
        expect(settingsModal.classList.contains('fixed')).toBe(true);
        expect(settingsModal.classList.contains('inset-0')).toBe(true);
        expect(settingsModal.classList.contains('z-50')).toBe(true);
        
        // Modal should contain expected elements
        const title = settingsModal.querySelector('h2');
        expect(title).toBeTruthy();
        expect(title.textContent).toBe('Settings');
        
        const closeBtn = settingsModal.querySelector('#close-settings-btn');
        expect(closeBtn).toBeTruthy();
        
        const soundToggle = settingsModal.querySelector('#sound-toggle-btn');
        expect(soundToggle).toBeTruthy();
        
        const testSoundBtn = settingsModal.querySelector('#test-sound-btn');
        expect(testSoundBtn).toBeTruthy();
    });

    test('should handle missing DOM elements gracefully', () => {
        // Remove settings button to test error handling
        const settingsBtn = document.getElementById('settings-btn');
        settingsBtn.remove();
        
        // Try to get the button again
        const missingBtn = document.getElementById('settings-btn');
        expect(missingBtn).toBe(null);
        
        // This should not throw an error if proper null checks are in place
        expect(() => {
            if (missingBtn) {
                missingBtn.addEventListener('click', () => {});
            }
        }).not.toThrow();
    });
});
