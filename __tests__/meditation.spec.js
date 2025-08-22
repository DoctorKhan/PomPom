// TDD for meditation break sounds
// Tests a controller that handles break start/end gongs and interval dings

jest.useFakeTimers();

describe('Meditation Controller', () => {
  const create = (enabled = true) => {
    const calls = { gong: 0, ding: 0, init: 0 };
    const deps = {
      isEnabled: () => enabled,
      intervalMin: () => 1, // minutes
      initAudioAndNotifications: () => { calls.init++; },
      playGong: () => { calls.gong++; },
      playDing: () => { calls.ding++; },
      setIntervalFn: (fn, ms) => setInterval(fn, ms),
      clearIntervalFn: (id) => clearInterval(id),
    };
    const { createMeditationController } = require('../src/meditation');
    const ctl = createMeditationController(deps);
    return { ctl, calls };
  };

  test('onBreakStart: should init audio and play a gong when enabled', () => {
    const { ctl, calls } = create(true);
    ctl.onBreakStart();
    expect(calls.init).toBe(1);
    expect(calls.gong).toBe(1);
  });

  test('interval dings should occur at the configured cadence', () => {
    const { ctl, calls } = create(true);
    ctl.onBreakStart();
    jest.advanceTimersByTime(60 * 1000);
    expect(calls.ding).toBeGreaterThanOrEqual(1);
    jest.advanceTimersByTime(60 * 1000);
    expect(calls.ding).toBeGreaterThanOrEqual(2);
  });

  test('onBreakEnd: should stop interval and play a gong', () => {
    const { ctl, calls } = create(true);
    ctl.onBreakStart();
    jest.advanceTimersByTime(60 * 1000);
    ctl.onBreakEnd();
    const dingsAfterEnd = calls.ding;
    expect(calls.gong).toBe(2);
    jest.advanceTimersByTime(5 * 60 * 1000);
    expect(calls.ding).toBe(dingsAfterEnd);
  });

  test('disabled: should not play sounds or schedule timers', () => {
    const { ctl, calls } = create(false);
    ctl.onBreakStart();
    jest.advanceTimersByTime(2 * 60 * 1000);
    ctl.onBreakEnd();
    expect(calls.init).toBe(0);
    expect(calls.gong).toBe(0);
    expect(calls.ding).toBe(0);
  });
});

