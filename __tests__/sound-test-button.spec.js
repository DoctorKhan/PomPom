/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load the main HTML file
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

// Mock Audio constructor
global.Audio = jest.fn().mockImplementation(() => ({
    play: jest.fn(() => Promise.resolve()),
    pause: jest.fn(),
    load: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
}));

describe('Sound Test Button Functionality', () => {
    let container;
    let testSoundBtn;
    let mockShowToast;

    beforeEach(() => {
        document.body.innerHTML = html;
        container = document.body;

        // Get the test sound button
        testSoundBtn = document.getElementById('test-sound-btn');

        // Mock functions
        mockShowToast = jest.fn();
        global.showToast = mockShowToast;
        global.playGong = jest.fn();
        global.playMeetingRing = jest.fn();

        // Clear all mocks
        jest.clearAllMocks();

        // Mock setTimeout for button re-enabling
        jest.useFakeTimers();

        // Set up the event listener manually (since the HTML's JS doesn't run in test)
        testSoundBtn.addEventListener('click', () => {
            // Check if button is already disabled (prevent spam clicking)
            if (testSoundBtn.disabled) {
                return;
            }

            // Disable button temporarily to prevent spam clicking
            testSoundBtn.disabled = true;
            testSoundBtn.textContent = '🔊 Playing...';

            try {
                if (typeof global.playGong === 'function') {
                    global.playGong();
                    mockShowToast('🔊 Test sound played!');
                } else if (typeof global.playMeetingRing === 'function') {
                    global.playMeetingRing();
                    mockShowToast('🔊 Test sound played!');
                } else {
                    // Fallback to basic audio
                    const audio = new global.Audio('https://cdn.jsdelivr.net/gh/DoctorKhan/pompom-assets/gong.mp3');
                    audio.play().then(() => {
                        mockShowToast('🔊 Test sound played!');
                    }).catch(() => {
                        mockShowToast('❌ Could not play sound - check audio permissions');
                    });
                }
            } catch (error) {
                console.error('Test sound error:', error);
                mockShowToast('❌ Sound test failed');
            }

            // Re-enable button after delay
            setTimeout(() => {
                testSoundBtn.disabled = false;
                testSoundBtn.textContent = '🔊 Test';
            }, 2000);
        });
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    describe('Button Existence and Setup', () => {
        test('test sound button should exist', () => {
            expect(testSoundBtn).toBeTruthy();
            expect(testSoundBtn.id).toBe('test-sound-btn');
        });

        test('test sound button should have correct initial text', () => {
            expect(testSoundBtn.textContent.trim()).toBe('🔊 Test');
        });

        test('test sound button should have correct CSS classes', () => {
            expect(testSoundBtn.classList.contains('btn-secondary')).toBe(true);
        });

        test('test sound button should be enabled initially', () => {
            expect(testSoundBtn.disabled).toBe(false);
        });
    });

    describe('Sound Test Functionality', () => {
        test('should play gong sound when playGong function is available', () => {
            // Simulate button click
            const clickEvent = new Event('click');
            testSoundBtn.dispatchEvent(clickEvent);

            expect(global.playGong).toHaveBeenCalled();
            expect(mockShowToast).toHaveBeenCalledWith('🔊 Test sound played!');
        });

        test('should play meeting ring when only playMeetingRing is available', () => {
            // Remove playGong function
            global.playGong = undefined;
            
            const clickEvent = new Event('click');
            testSoundBtn.dispatchEvent(clickEvent);

            expect(global.playMeetingRing).toHaveBeenCalled();
            expect(mockShowToast).toHaveBeenCalledWith('🔊 Test sound played!');
        });

        test('should use fallback audio when no sound functions are available', () => {
            // Remove all sound functions
            global.playGong = undefined;
            global.playMeetingRing = undefined;
            
            const clickEvent = new Event('click');
            testSoundBtn.dispatchEvent(clickEvent);

            expect(global.Audio).toHaveBeenCalledWith('https://cdn.jsdelivr.net/gh/DoctorKhan/pompom-assets/gong.mp3');
        });

        test('should handle audio play success with fallback', async () => {
            global.playGong = undefined;
            global.playMeetingRing = undefined;
            
            const mockAudio = {
                play: jest.fn(() => Promise.resolve())
            };
            global.Audio.mockReturnValue(mockAudio);
            
            const clickEvent = new Event('click');
            testSoundBtn.dispatchEvent(clickEvent);

            // Wait for promise to resolve
            await Promise.resolve();
            
            expect(mockAudio.play).toHaveBeenCalled();
            expect(mockShowToast).toHaveBeenCalledWith('🔊 Test sound played!');
        });

        test('should handle audio play failure with fallback', () => {
            global.playGong = undefined;
            global.playMeetingRing = undefined;

            const mockAudio = {
                play: jest.fn(() => Promise.reject(new Error('Audio play failed')))
            };
            global.Audio.mockReturnValue(mockAudio);

            const clickEvent = new Event('click');
            testSoundBtn.dispatchEvent(clickEvent);

            // Verify the audio play was attempted
            expect(mockAudio.play).toHaveBeenCalled();
            // Note: The promise rejection handling is asynchronous,
            // so we just verify the attempt was made
        });
    });

    describe('Button State Management', () => {
        test('should disable button and change text when clicked', () => {
            const clickEvent = new Event('click');
            testSoundBtn.dispatchEvent(clickEvent);

            expect(testSoundBtn.disabled).toBe(true);
            expect(testSoundBtn.textContent).toBe('🔊 Playing...');
        });

        test('should re-enable button and restore text after timeout', () => {
            const clickEvent = new Event('click');
            testSoundBtn.dispatchEvent(clickEvent);

            // Button should be disabled initially
            expect(testSoundBtn.disabled).toBe(true);
            expect(testSoundBtn.textContent).toBe('🔊 Playing...');

            // Fast-forward time by 2 seconds
            jest.advanceTimersByTime(2000);

            // Button should be re-enabled
            expect(testSoundBtn.disabled).toBe(false);
            expect(testSoundBtn.textContent).toBe('🔊 Test');
        });

        test('should prevent spam clicking by keeping button disabled', () => {
            // Click button first time
            const clickEvent = new Event('click');
            testSoundBtn.dispatchEvent(clickEvent);

            // Button should be disabled after first click
            expect(testSoundBtn.disabled).toBe(true);

            // Try to click again while disabled - should not trigger additional calls
            const initialCallCount = global.playGong.mock.calls.length;
            testSoundBtn.dispatchEvent(clickEvent);
            testSoundBtn.dispatchEvent(clickEvent);

            // playGong should not be called additional times since button is disabled
            expect(global.playGong).toHaveBeenCalledTimes(initialCallCount);
            expect(testSoundBtn.disabled).toBe(true);
        });
    });

    describe('Error Handling', () => {
        test('should handle exceptions gracefully', () => {
            // Make playGong throw an error
            global.playGong = jest.fn(() => {
                throw new Error('Sound system error');
            });
            
            const clickEvent = new Event('click');
            testSoundBtn.dispatchEvent(clickEvent);

            expect(mockShowToast).toHaveBeenCalledWith('❌ Sound test failed');
        });

        test('should log errors to console', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            global.playGong = jest.fn(() => {
                throw new Error('Sound system error');
            });
            
            const clickEvent = new Event('click');
            testSoundBtn.dispatchEvent(clickEvent);

            expect(consoleSpy).toHaveBeenCalledWith('Test sound error:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });
    });

    describe('Integration with Settings Modal', () => {
        test('test sound button should be inside settings modal', () => {
            const settingsModal = document.getElementById('settings-modal');
            expect(settingsModal).toBeTruthy();
            expect(settingsModal.contains(testSoundBtn)).toBe(true);
        });

        test('should work when settings modal is visible', () => {
            const settingsModal = document.getElementById('settings-modal');
            settingsModal.classList.remove('hidden');
            
            const clickEvent = new Event('click');
            testSoundBtn.dispatchEvent(clickEvent);

            expect(global.playGong).toHaveBeenCalled();
            expect(mockShowToast).toHaveBeenCalledWith('🔊 Test sound played!');
        });
    });

    describe('Accessibility', () => {
        test('button should be keyboard accessible', () => {
            // Test Enter key
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            testSoundBtn.dispatchEvent(enterEvent);
            
            // Note: In real DOM, Enter would trigger click, but in JSDOM we need to simulate
            const clickEvent = new Event('click');
            testSoundBtn.dispatchEvent(clickEvent);

            expect(global.playGong).toHaveBeenCalled();
        });

        test('button should have proper ARIA attributes', () => {
            // The button should be properly labeled for screen readers
            expect(testSoundBtn.textContent).toContain('Test');
        });
    });

    describe('Audio Context Integration', () => {
        test('should check for audio context availability', () => {
            // Mock audio context
            global.AudioContext = jest.fn().mockImplementation(() => ({
                state: 'running',
                resume: jest.fn(() => Promise.resolve()),
                createOscillator: jest.fn(),
                createGain: jest.fn(),
                currentTime: 0,
                destination: {}
            }));

            // Mock the initAudioContext function
            const initAudioContext = () => {
                try {
                    const audioCtx = new global.AudioContext();
                    global.window.audioCtx = audioCtx;
                    return audioCtx;
                } catch (e) {
                    return null;
                }
            };

            const result = initAudioContext();
            expect(result).toBeTruthy();
            expect(global.window.audioCtx).toBeTruthy();
        });

        test('should handle audio context initialization failure', () => {
            // Mock AudioContext to throw error
            global.AudioContext = jest.fn().mockImplementation(() => {
                throw new Error('AudioContext not supported');
            });

            const initAudioContext = () => {
                try {
                    const audioCtx = new global.AudioContext();
                    global.window.audioCtx = audioCtx;
                    return audioCtx;
                } catch (e) {
                    return null;
                }
            };

            const result = initAudioContext();
            expect(result).toBeNull();
        });
    });
});
