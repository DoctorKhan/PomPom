// Sound helpers for gong and ding with safe fallbacks for test environments
// Exports functions and attaches them to window if available.

function safePlay(url) {
  try {
    const a = new Audio(url);
    // Play may reject in headless/test; ignore
    const p = a.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch (_) {
    // No Audio in environment; ignore
  }
}

function playGong() {
  try { safePlay('https://cdn.jsdelivr.net/gh/DoctorKhan/pompom-assets/gong.mp3'); } catch {}
  try { if (typeof window !== 'undefined') window.__LAST_GONG_PLAYED = Date.now(); } catch {}
}

function playDing() {
  try { safePlay('https://cdn.jsdelivr.net/gh/DoctorKhan/pompom-assets/ding.mp3'); } catch {}
  try { if (typeof window !== 'undefined') window.__LAST_DING_PLAYED = Date.now(); } catch {}
}

try {
  if (typeof window !== 'undefined') {
    window.playGong = window.playGong || playGong;
    window.playDing = window.playDing || playDing;
  }
} catch {}

module.exports = { playGong, playDing };

