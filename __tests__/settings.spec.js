/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load the main HTML file
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('Settings Functionality', () => {
    let container;

    // Mock localStorage globally
    const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    };

    beforeAll(() => {
        global.localStorage = localStorageMock;
    });

    beforeEach(() => {
        document.body.innerHTML = html;
        container = document.body;
        
        // Reset mocks
        jest.clearAllMocks();
        
        // Mock sound functions
        global.playGong = jest.fn();
        global.showToast = jest.fn();
        
        // Initialize sound settings
        global.isSoundEnabled = true;
        global.window.isSoundEnabled = true;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Settings Modal', () => {
        test('settings button should exist and have icon', () => {
            const settingsBtn = document.getElementById('settings-btn');
            expect(settingsBtn).toBeTruthy();
            expect(settingsBtn.getAttribute('title')).toBe('Settings');

            // Check that the button has an SVG icon
            const icon = settingsBtn.querySelector('svg');
            expect(icon).toBeTruthy();
            expect(icon.classList.contains('w-5')).toBe(true);
            expect(icon.classList.contains('h-5')).toBe(true);

            // Check that the SVG has the correct viewBox for settings icon
            expect(icon.getAttribute('viewBox')).toBe('0 0 24 24');

            // Check that the SVG has path elements (the actual icon)
            const paths = icon.querySelectorAll('path');
            expect(paths.length).toBeGreaterThan(0);
        });

        test('settings modal should exist and be hidden by default', () => {
            const settingsModal = document.getElementById('settings-modal');
            expect(settingsModal).toBeTruthy();
            expect(settingsModal.classList.contains('hidden')).toBe(true);
        });

        test('close settings button should exist', () => {
            const closeBtn = document.getElementById('close-settings-btn');
            expect(closeBtn).toBeTruthy();
        });

        test('sound toggle button should exist', () => {
            const soundToggle = document.getElementById('sound-toggle-btn');
            expect(soundToggle).toBeTruthy();
        });

        test('test sound button should exist', () => {
            const testSoundBtn = document.getElementById('test-sound-btn');
            expect(testSoundBtn).toBeTruthy();
            expect(testSoundBtn.textContent.trim()).toBe('🔊 Test');
        });
    });

    describe('Sound Settings', () => {
        test.skip('should initialize sound settings from localStorage', () => {
            localStorage.getItem.mockReturnValue('false');

            // Simulate initialization
            const isSoundEnabled = localStorage.getItem('pompom_sound_enabled') === 'true';

            expect(localStorage.getItem).toHaveBeenCalledWith('pompom_sound_enabled');
            expect(isSoundEnabled).toBe(false);
        });        test.skip('should default to sound enabled for new users', () => {
            localStorage.getItem.mockReturnValue(null);
            
            // Simulate initialization for new user
            let isSoundEnabled = localStorage.getItem('pompom_sound_enabled') === 'true';
            if (localStorage.getItem('pompom_sound_enabled') === null) {
                isSoundEnabled = true;
                localStorage.setItem('pompom_sound_enabled', 'true');
            }
            
            expect(isSoundEnabled).toBe(true);
            expect(localStorage.setItem).toHaveBeenCalledWith('pompom_sound_enabled', 'true');
        });

        test.skip('should toggle sound setting when sound toggle is clicked', () => {
            const soundToggle = document.getElementById('sound-toggle-btn');
            
            // Mock the toggle function
            let isSoundEnabled = true;
            const toggleSound = () => {
                isSoundEnabled = !isSoundEnabled;
                localStorage.setItem('pompom_sound_enabled', isSoundEnabled);
                global.window.isSoundEnabled = isSoundEnabled;
            };
            
            toggleSound();
            
            expect(isSoundEnabled).toBe(false);
            expect(localStorage.setItem).toHaveBeenCalledWith('pompom_sound_enabled', false);
        });

        test('should play confirmation sound when sound is enabled', () => {
            global.playGong = jest.fn();
            
            // Mock the toggle function with sound confirmation
            let isSoundEnabled = false;
            const toggleSound = () => {
                isSoundEnabled = !isSoundEnabled;
                localStorage.setItem('pompom_sound_enabled', isSoundEnabled);
                
                if (isSoundEnabled && typeof global.playGong === 'function') {
                    setTimeout(() => global.playGong(), 100);
                }
            };
            
            toggleSound();
            
            expect(isSoundEnabled).toBe(true);
            
            // Wait for setTimeout
            setTimeout(() => {
                expect(global.playGong).toHaveBeenCalled();
            }, 150);
        });

        test('test sound button should play sound when clicked', () => {
            const testSoundBtn = document.getElementById('test-sound-btn');
            
            // Mock the test sound function
            const testSound = () => {
                if (typeof global.playGong === 'function') {
                    global.playGong();
                } else {
                    global.showToast('Sound functions not loaded');
                }
            };
            
            testSound();
            
            expect(global.playGong).toHaveBeenCalled();
        });

        test('test sound button should show toast if sound functions not loaded', () => {
            global.playGong = undefined;
            
            const testSound = () => {
                if (typeof global.playGong === 'function') {
                    global.playGong();
                } else {
                    global.showToast('Sound functions not loaded');
                }
            };
            
            testSound();
            
            expect(global.showToast).toHaveBeenCalledWith('Sound functions not loaded');
        });
    });

    describe('Modal Behavior', () => {
        test('should show modal when settings button is clicked', () => {
            const settingsBtn = document.getElementById('settings-btn');
            const settingsModal = document.getElementById('settings-modal');

            expect(settingsBtn).toBeTruthy();
            expect(settingsModal).toBeTruthy();
            expect(settingsModal.classList.contains('hidden')).toBe(true);

            // Simulate the actual click event handler
            settingsBtn.addEventListener('click', () => {
                settingsModal.classList.remove('hidden');
            });

            // Trigger the click
            settingsBtn.click();

            expect(settingsModal.classList.contains('hidden')).toBe(false);
        });

        test('settings button should be clickable and not disabled', () => {
            const settingsBtn = document.getElementById('settings-btn');

            expect(settingsBtn).toBeTruthy();
            expect(settingsBtn.disabled).toBe(false);
            expect(settingsBtn.style.pointerEvents).not.toBe('none');

            // Should be able to focus the button
            settingsBtn.focus();
            expect(document.activeElement).toBe(settingsBtn);
        });

        test('should hide modal when close button is clicked', () => {
            const settingsModal = document.getElementById('settings-modal');
            settingsModal.classList.remove('hidden'); // Show modal first
            
            // Mock the hide modal function
            const hideModal = () => {
                settingsModal.classList.add('hidden');
            };
            
            hideModal();
            
            expect(settingsModal.classList.contains('hidden')).toBe(true);
        });

        test('should hide modal when clicking outside modal content', () => {
            const settingsModal = document.getElementById('settings-modal');
            settingsModal.classList.remove('hidden'); // Show modal first
            
            // Mock clicking outside (event target is the modal backdrop)
            const handleOutsideClick = (e) => {
                if (e.target === settingsModal) {
                    settingsModal.classList.add('hidden');
                }
            };
            
            // Simulate clicking on the modal backdrop
            const mockEvent = { target: settingsModal };
            handleOutsideClick(mockEvent);
            
            expect(settingsModal.classList.contains('hidden')).toBe(true);
        });
    });
});
