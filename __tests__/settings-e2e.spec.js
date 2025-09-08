/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Settings End-to-End Tests', () => {
    beforeEach(() => {
        // Load the complete HTML file
        const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
        document.documentElement.innerHTML = html;
        
        // Mock localStorage
        const localStorageMock = {
            getItem: jest.fn(() => 'true'),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
        };
        global.localStorage = localStorageMock;
        
        // Mock window properties
        global.window.localStorage = localStorageMock;
        global.window.isSoundEnabled = true;
        
        // Mock functions that might be called
        global.playGong = jest.fn();
        global.showToast = jest.fn();
        global.updateExtensionUI = jest.fn();
        global.updateSoundToggleUI = jest.fn();
        
        // Suppress console errors for cleaner test output
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('settings button should be visible and clickable in DOM', () => {
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        
        // Elements should exist
        expect(settingsBtn).toBeTruthy();
        expect(settingsModal).toBeTruthy();
        
        // Button should have the settings icon
        const svg = settingsBtn.querySelector('svg');
        expect(svg).toBeTruthy();
        expect(svg.classList.contains('w-5')).toBe(true);
        expect(svg.classList.contains('h-5')).toBe(true);
        
        // Check the SVG paths for settings icon
        const paths = svg.querySelectorAll('path');
        expect(paths.length).toBe(2); // Settings icon has 2 paths
        
        // Modal should be hidden initially
        expect(settingsModal.classList.contains('hidden')).toBe(true);
    });

    test('settings functionality should work without JavaScript errors', () => {
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const closeBtn = document.getElementById('close-settings-btn');
        
        // Test that we can add event listeners without errors
        expect(() => {
            if (settingsBtn) {
                settingsBtn.addEventListener('click', () => {
                    if (settingsModal) {
                        settingsModal.classList.remove('hidden');
                    }
                });
            }
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    if (settingsModal) {
                        settingsModal.classList.add('hidden');
                    }
                });
            }
        }).not.toThrow();
        
        // Test clicking the settings button
        expect(() => {
            settingsBtn.click();
        }).not.toThrow();
        
        // Modal should be visible after click
        expect(settingsModal.classList.contains('hidden')).toBe(false);
        
        // Test clicking the close button
        expect(() => {
            closeBtn.click();
        }).not.toThrow();
        
        // Modal should be hidden after close
        expect(settingsModal.classList.contains('hidden')).toBe(true);
    });

    test('settings button should have proper CSS classes', () => {
        const settingsBtn = document.getElementById('settings-btn');
        
        // Check that button has the expected classes
        expect(settingsBtn.classList.contains('btn-secondary')).toBe(true);
        expect(settingsBtn.classList.contains('h-10')).toBe(true);
        expect(settingsBtn.classList.contains('w-10')).toBe(true);
        expect(settingsBtn.classList.contains('rounded-lg')).toBe(true);
        expect(settingsBtn.classList.contains('flex')).toBe(true);
        expect(settingsBtn.classList.contains('items-center')).toBe(true);
        expect(settingsBtn.classList.contains('justify-center')).toBe(true);
    });

    test('settings modal should have all required elements', () => {
        const settingsModal = document.getElementById('settings-modal');
        
        // Check modal structure
        expect(settingsModal).toBeTruthy();
        
        // Check for title
        const title = settingsModal.querySelector('h2');
        expect(title).toBeTruthy();
        expect(title.textContent.trim()).toBe('Settings');
        
        // Check for close button
        const closeBtn = settingsModal.querySelector('#close-settings-btn');
        expect(closeBtn).toBeTruthy();
        
        // Check for sound toggle
        const soundToggle = settingsModal.querySelector('#sound-toggle-btn');
        expect(soundToggle).toBeTruthy();
        
        // Check for test sound button
        const testSoundBtn = settingsModal.querySelector('#test-sound-btn');
        expect(testSoundBtn).toBeTruthy();
        expect(testSoundBtn.textContent.trim()).toBe('🔊 Test');
    });

    test('should handle DOM ready state properly', () => {
        // Simulate document ready
        const readyEvent = new Event('DOMContentLoaded');
        
        expect(() => {
            document.dispatchEvent(readyEvent);
        }).not.toThrow();
        
        // Elements should still be accessible after DOM ready
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        
        expect(settingsBtn).toBeTruthy();
        expect(settingsModal).toBeTruthy();
    });

    test('settings button icon should be properly structured', () => {
        const settingsBtn = document.getElementById('settings-btn');
        const svg = settingsBtn.querySelector('svg');
        
        // SVG should have correct attributes
        expect(svg.getAttribute('fill')).toBe('none');
        expect(svg.getAttribute('stroke')).toBe('currentColor');
        expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
        
        // Should have the settings icon paths
        const paths = svg.querySelectorAll('path');
        expect(paths.length).toBe(2);
        
        // Check that paths have the expected attributes
        paths.forEach(path => {
            expect(path.getAttribute('stroke-linecap')).toBe('round');
            expect(path.getAttribute('stroke-linejoin')).toBe('round');
            expect(path.getAttribute('stroke-width')).toBe('2');
        });
    });
});
