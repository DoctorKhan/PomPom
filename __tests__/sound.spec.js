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
});
