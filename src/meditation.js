// Meditation controller: centralizes break start/end gongs and interval dings
// This is a pure module that can be unit-tested; wiring into index.html occurs separately.

function createMeditationController({
  isEnabled,
  intervalSec,
  initAudioAndNotifications,
  playGong,
  playDing,
  setIntervalFn = (fn, ms) => setInterval(fn, ms),
  clearIntervalFn = (id) => clearInterval(id),
}) {
  let intervalId = null;

  function onBreakStart() {
    if (!isEnabled()) return;
    try { initAudioAndNotifications && initAudioAndNotifications(); } catch {}
    try { playGong && playGong(); } catch {}
    scheduleNextDing();
  }

  function scheduleNextDing() {
    try { if (intervalId) clearIntervalFn(intervalId); } catch {}
    if (!isEnabled()) return;
    const sec = Math.max(1, Number(intervalSec()) || 60);
    intervalId = setIntervalFn(() => {
      if (!isEnabled()) return;
      try { playDing && playDing(); } catch {}
    }, sec * 1000);
  }

  function onBreakEnd() {
    try { if (intervalId) clearIntervalFn(intervalId); } catch {}
    intervalId = null;
    if (!isEnabled()) return;
    try { playGong && playGong(); } catch {}
  }

  function dispose() {
    try { if (intervalId) clearIntervalFn(intervalId); } catch {}
    intervalId = null;
  }

  return { onBreakStart, onBreakEnd, scheduleNextDing, dispose };
}

module.exports = { createMeditationController };

