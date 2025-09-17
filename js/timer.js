// Timer Functionality
// Handles Pomodoro timer, modes, and timer-related UI updates

(function() {
  'use strict';

  // Timer configuration
  const MODE_DURATIONS = {
    pomodoro25: { seconds: 25 * 60, label: 'Focus Time', color: '#14b8a6' },
    shortBreak: { seconds: 5 * 60, label: 'Short Break', color: '#f59e0b' },
    longBreak: { seconds: 15 * 60, label: 'Long Break', color: '#8b5cf6' },
  };

  // Timer state - simple 3-state system
  let currentMode = 'pomodoro25';
  let timerInterval = null;
  let running = false;
  let targetEndTs = 0;

  // DOM elements
  let startPauseBtn, resetBtn, timerDisplay, timerModeDisplay;

  // Initialize timer elements
  function initTimerElements() {
    startPauseBtn = document.getElementById('start-pause-btn');
    resetBtn = document.getElementById('reset-btn');
    timerDisplay = document.getElementById('timer-display');
    timerModeDisplay = document.getElementById('timer-mode-display');
  }

  // Get current remaining seconds - always derived from current mode and running state
  function getRemainingSeconds() {
    if (!running) {
      // When stopped, show full duration for current mode
      return MODE_DURATIONS[currentMode].seconds;
    } else {
      // When running, calculate from target end time
      const now = Date.now();
      const leftMs = Math.max(0, targetEndTs - now);
      return Math.ceil(leftMs / 1000);
    }
  }

  // Format time as MM:SS
  function fmtTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // Update timer display and UI
  function renderTimer() {
    if (!timerDisplay || !timerModeDisplay) return;

    const seconds = getRemainingSeconds();
    const timeText = fmtTime(seconds);

    timerDisplay.textContent = timeText;
    timerModeDisplay.textContent = MODE_DURATIONS[currentMode].label;

    // Update start/pause button with icons and text
    const startPauseText = document.getElementById('start-pause-text');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');

    if (running) {
      if (startPauseText) startPauseText.textContent = 'Pause';
      if (playIcon) playIcon.classList.add('hidden');
      if (pauseIcon) pauseIcon.classList.remove('hidden');
      // Add timer active animation
      if (timerDisplay) timerDisplay.classList.add('timer-active');
    } else {
      if (startPauseText) startPauseText.textContent = 'Start';
      if (playIcon) playIcon.classList.remove('hidden');
      if (pauseIcon) pauseIcon.classList.add('hidden');
      // Remove timer active animation
      if (timerDisplay) timerDisplay.classList.remove('timer-active');
    }

    // Update progress ring
    updateProgressRing();

    // Update document title with timer
    updateDocumentTitle();
  }

  // Update progress ring animation
  function updateProgressRing() {
    const progressRing = document.getElementById('timer-progress-ring');
    if (!progressRing) return;

    const totalSeconds = MODE_DURATIONS[currentMode].seconds;
    const progress = (totalSeconds - getRemainingSeconds()) / totalSeconds;
    const circumference = 2 * Math.PI * 45; // radius = 45
    const offset = circumference - (progress * circumference);

    progressRing.style.strokeDashoffset = offset;
    progressRing.style.stroke = MODE_DURATIONS[currentMode].color;
  }

  // Update document title with timer status
  function updateDocumentTitle() {
    const timeStr = fmtTime(getRemainingSeconds());
    const modeStr = MODE_DURATIONS[currentMode].label;
    const statusStr = running ? '⏱️' : '⏸️';
    
    document.title = `${statusStr} ${timeStr} - ${modeStr} | PomPom`;
  }

  // Timer tick function
  function tick() {
    const remaining = getRemainingSeconds();
    renderTimer();

    if (remaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      running = false;
      
      // Play completion sound
      try {
        if (typeof window.playGong === 'function') {
          window.playGong();
        } else if (typeof window.AudioModule !== 'undefined') {
          window.AudioModule.playNotificationSound('complete');
        }
      } catch (e) {
        console.warn('Could not play completion sound:', e);
      }

      // Timer is now stateless - just render the display
      renderTimer();

      // Show completion notification
      showTimerCompleteNotification();

      // Trigger timer complete event
      const event = new CustomEvent('timerComplete', {
        detail: { mode: currentMode, duration: MODE_DURATIONS[currentMode].seconds }
      });
      document.dispatchEvent(event);
    }
  }

  // Show timer completion notification
  function showTimerCompleteNotification() {
    const modeLabel = MODE_DURATIONS[currentMode].label;
    const message = `${modeLabel} completed! 🎉`;
    
    // Show toast notification
    if (typeof window.showToast === 'function') {
      window.showToast(message);
    }

    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('PomPom Timer', {
        body: message,
        icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ctext y="0.9em" font-size="90"%3E🐩%3C/text%3E%3C/svg%3E',
        badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ctext y="0.9em" font-size="90"%3E🐩%3C/text%3E%3C/svg%3E'
      });
    }
  }

  // Start timer
  function startTimer() {
    if (running) return;

    // Mark current task as in progress
    if (typeof window.TaskModule !== 'undefined') {
      window.TaskModule.markCurrentTaskInProgress();
    }

    running = true;
    const duration = MODE_DURATIONS[currentMode].seconds;
    targetEndTs = Date.now() + duration * 1000;
    renderTimer();
    timerInterval = setInterval(tick, 250);

    // Trigger timer start event
    const event = new CustomEvent('timerStart', {
      detail: { mode: currentMode, duration: duration }
    });
    document.dispatchEvent(event);
  }

  // Pause timer
  function pauseTimer() {
    if (!running) return;

    running = false;
    clearInterval(timerInterval);
    timerInterval = null;
    renderTimer();

    // Trigger timer pause event
    const event = new CustomEvent('timerPause', {
      detail: { mode: currentMode, remainingSeconds: getRemainingSeconds() }
    });
    document.dispatchEvent(event);
  }

  // Reset timer
  function resetTimer() {
    running = false;
    clearInterval(timerInterval);
    timerInterval = null;
    renderTimer();

    // Trigger timer reset event
    const event = new CustomEvent('timerReset', {
      detail: { mode: currentMode }
    });
    document.dispatchEvent(event);
  }

  // Toggle timer (start/pause)
  function toggleTimer() {
    if (running) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  // Set timer mode
  function setMode(mode) {
    if (!MODE_DURATIONS[mode]) return;

    const wasRunning = running;
    if (wasRunning) pauseTimer();

    currentMode = mode;
    renderTimer();
    updateModeButtons();

    // Trigger mode change event
    const event = new CustomEvent('timerModeChange', {
      detail: { mode: currentMode, wasRunning }
    });
    document.dispatchEvent(event);
  }

  // Update mode button states
  function updateModeButtons() {
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
      const btnMode = btn.dataset.mode;
      if (btnMode === currentMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Initialize timer functionality
  function initTimer() {
    initTimerElements();

    // Timer is now stateless - no initialization needed

    // Add event listeners
    if (startPauseBtn) {
      startPauseBtn.addEventListener('click', toggleTimer);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', resetTimer);
    }

    // Bind clicks only within the mode controls container and to explicit mode buttons
    const modeControls = document.getElementById('mode-controls');
    if (modeControls) {
      modeControls.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest ? e.target.closest('.mode-btn[data-mode]') : null;
        if (!btn) return;
        e.preventDefault();
        const mode = btn.dataset.mode;
        if (mode && MODE_DURATIONS[mode]) setMode(mode);
      });
    } else {
      // Fallback: direct bindings
      document.querySelectorAll('.mode-btn[data-mode]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const mode = btn.dataset.mode;
          if (mode && MODE_DURATIONS[mode]) setMode(mode);
        });
      });
    }

    // Initialize display
    renderTimer();
    updateModeButtons();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  // Export timer module
  if (typeof window !== 'undefined') {
    window.TimerModule = {
      init: initTimer,
      start: startTimer,
      pause: pauseTimer,
      reset: resetTimer,
      toggle: toggleTimer,
      setMode: setMode,
      getCurrentMode: () => currentMode,
      getRemainingSeconds: getRemainingSeconds,
      isRunning: () => running,
      getModeConfig: (mode) => MODE_DURATIONS[mode] || null
    };
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTimer);
  } else {
    initTimer();
  }

})();
