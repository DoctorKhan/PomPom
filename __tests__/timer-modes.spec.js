/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

function loadIndexSkeleton() {
  // Minimal DOM needed by timer.js
  document.body.innerHTML = `
    <div id="app">
      <div id="timer-mode-display"></div>
      <div id="timer-display"></div>
      <button id="start-pause-btn"><span id="start-pause-text"></span><span id="play-icon"></span><span id="pause-icon" class="hidden"></span></button>
      <button id="reset-btn"></button>
      <svg width="0" height="0"><circle id="timer-progress-ring" r="45"></circle></svg>
      <div id="mode-controls">
        <button class="mode-btn" data-mode="pomodoro25">Focus (25m)</button>
        <button class="mode-btn" data-mode="shortBreak">Break (5m)</button>
        <button class="mode-btn" data-mode="longBreak">Long (15m)</button>
      </div>
    </div>`;
}

// Utility to ensure timer.js runs its init immediately
function setDocumentReadyComplete() {
  Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });
}

describe('Timer modes', () => {
  beforeEach(() => {
    jest.resetModules();
    // Clean up any test override that could force 25:00
    delete global.window.__TIMER_SECONDS_OVERRIDE;
    // Fresh DOM
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    setDocumentReadyComplete();
    loadIndexSkeleton();
    // Load the timer module (IIFE attaches to window.TimerModule and auto-inits)
    require('../js/timer.js');
  });

  test('initializes at 25:00 Focus Time', () => {
    const timerDisplay = document.getElementById('timer-display');
    const modeLabel = document.getElementById('timer-mode-display');
    expect(timerDisplay.textContent).toBe('25:00');
    expect(modeLabel.textContent).toContain('Focus');
    expect(window.TimerModule.getCurrentMode()).toBe('pomodoro25');
    expect(window.TimerModule.getRemainingSeconds()).toBe(1500);
  });

  test('setMode("shortBreak") updates to 05:00', () => {
    window.TimerModule.setMode('shortBreak');
    const timerDisplay = document.getElementById('timer-display');
    const modeLabel = document.getElementById('timer-mode-display');
    expect(window.TimerModule.getCurrentMode()).toBe('shortBreak');
    expect(window.TimerModule.getRemainingSeconds()).toBe(300);
    expect(timerDisplay.textContent).toBe('05:00');
    expect(modeLabel.textContent).toContain('Short Break');
  });

  test('setMode("longBreak") updates to 15:00', () => {
    window.TimerModule.setMode('longBreak');
    const timerDisplay = document.getElementById('timer-display');
    const modeLabel = document.getElementById('timer-mode-display');
    expect(window.TimerModule.getCurrentMode()).toBe('longBreak');
    expect(window.TimerModule.getRemainingSeconds()).toBe(900);
    expect(timerDisplay.textContent).toBe('15:00');
    expect(modeLabel.textContent).toContain('Long Break');
  });

  test('clicking Break button switches to 05:00', () => {
    const breakBtn = document.querySelector('.mode-btn[data-mode="shortBreak"]');
    breakBtn.click();
    const timerDisplay = document.getElementById('timer-display');
    expect(window.TimerModule.getCurrentMode()).toBe('shortBreak');
    expect(timerDisplay.textContent).toBe('05:00');
  });

  test('mode switching ignores __TIMER_SECONDS_OVERRIDE test hook', () => {
    // Simulate earlier tests setting an override
    window.__TIMER_SECONDS_OVERRIDE = 1500; // would force 25:00 if not ignored
    window.TimerModule.setMode('shortBreak');
    expect(window.TimerModule.getRemainingSeconds()).toBe(300);
    expect(document.getElementById('timer-display').textContent).toBe('05:00');
  });

  test('starting after switching to Break stays at 05:00', () => {
    window.TimerModule.setMode('shortBreak');
    const startBtn = document.getElementById('start-pause-btn');
    startBtn.click();
    expect(window.TimerModule.isRunning()).toBe(true);
    expect(document.getElementById('timer-display').textContent).toBe('05:00');
  });

  test('starting after switching to Long Break stays at 15:00', () => {
    window.TimerModule.setMode('longBreak');
    const startBtn = document.getElementById('start-pause-btn');
    startBtn.click();
    expect(window.TimerModule.isRunning()).toBe(true);
    expect(document.getElementById('timer-display').textContent).toBe('15:00');
  });

  test('short break counts down correctly as time advances', () => {
    // Prepare DOM and module
    window.TimerModule.setMode('shortBreak');

    // Mock Date.now so advancing timers can reflect elapsed time
    const realNow = Date.now();
    let fakeNow = realNow;
    const nowSpy = jest.spyOn(Date, 'now').mockImplementation(() => fakeNow);

    // Start timer at 05:00
    document.getElementById('start-pause-btn').click();
    expect(window.TimerModule.isRunning()).toBe(true);
    expect(document.getElementById('timer-display').textContent).toBe('05:00');

    // Advance 1 second of wall-clock time, tick once
    fakeNow = realNow + 1000;
    jest.advanceTimersByTime(300); // trigger an interval tick (>=250ms)
    expect(document.getElementById('timer-display').textContent).toBe('04:59');

    // Advance to 61 seconds elapsed -> 05:00 - 61s = 03:59
    fakeNow = realNow + 61_000;
    jest.advanceTimersByTime(300);
    expect(document.getElementById('timer-display').textContent).toBe('03:59');

    nowSpy.mockRestore();
  });

  test('long break counts down correctly as time advances', () => {
    window.TimerModule.setMode('longBreak');

    const realNow = Date.now();
    let fakeNow = realNow;
    const nowSpy = jest.spyOn(Date, 'now').mockImplementation(() => fakeNow);

    // Start timer at 15:00
    document.getElementById('start-pause-btn').click();
    expect(window.TimerModule.isRunning()).toBe(true);
    expect(document.getElementById('timer-display').textContent).toBe('15:00');

    // After 2 seconds -> 14:58
    fakeNow = realNow + 2000;
    jest.advanceTimersByTime(300);
    expect(document.getElementById('timer-display').textContent).toBe('14:58');

    // After 125 seconds -> 15:00 - 2:05 = 12:55
    fakeNow = realNow + 125_000;
    jest.advanceTimersByTime(300);
    expect(document.getElementById('timer-display').textContent).toBe('12:55');

    nowSpy.mockRestore();
  });
});
