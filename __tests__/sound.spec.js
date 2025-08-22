// TDD tests for gong and ding sound
// Ensure the sound helpers are loaded into the JSDOM window
require('../src/sound');

// Use real timers to avoid interference from suites that switch to fake timers
jest.useRealTimers();

describe('Sound Functions', () => {
    it('should expose playGong and playDing', () => {
        expect(typeof window.playGong).toBe('function');
        expect(typeof window.playDing).toBe('function');
    });
    it('should play gong sound and set __LAST_GONG_PLAYED', () => {
        window.__LAST_GONG_PLAYED = 0;
        window.playGong();
        expect(window.__LAST_GONG_PLAYED).toBeGreaterThan(0);
    });
    it('should play ding sound and set __LAST_DING_PLAYED', () => {
        window.__LAST_DING_PLAYED = 0;
        window.playDing();
        expect(window.__LAST_DING_PLAYED).toBeGreaterThan(0);
    });

    it('prefers WebAudio when audioCtx is available and sound is enabled', () => {
        // Arrange: mock audio context and spy on HTMLAudio construction
        const AudioOriginal = window.Audio;
        const AudioSpy = jest.fn();
        window.Audio = AudioSpy;
        window.isSoundEnabled = true;
        window.audioCtx = {
            currentTime: 0,
            createOscillator: jest.fn(() => ({
                type: 'sine',
                frequency: { setValueAtTime: jest.fn() },
                connect: jest.fn(), start: jest.fn(), stop: jest.fn(),
            })),
            createGain: jest.fn(() => ({
                gain: { setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn() },
                connect: jest.fn(),
            })),
            destination: {},
            state: 'running',
        };

        // Act
        window.playGong();

        // Assert: should NOT fall back to HTMLAudio when WebAudio is present
        expect(AudioSpy).not.toHaveBeenCalled();

        // Cleanup
        window.Audio = AudioOriginal;
        delete window.audioCtx;
        delete window.isSoundEnabled;
    });
});
