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

function tryWebAudioBeep({ freq = 880, duration = 0.25, decay = 0.2 } = {}) {
  try {
    if (typeof window === 'undefined') return false;
    const enabled = !!window.isSoundEnabled;
    const ctx = window.audioCtx;
    if (!enabled || !ctx) return false;
    const now = ctx.currentTime || 0;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gain.gain.linearRampToValueAtTime(0.0, now + duration + decay);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + decay + 0.01);
    return true;
  } catch (_) {
    return false;
  }
}

function playGong() {
  // Prefer WebAudio if available and enabled (used in tests and real app when toggled on)
  const usedWA = tryWebAudioBeep({ freq: 392, duration: 0.35, decay: 0.3 }); // G4-ish
  if (!usedWA) {
    try { safePlay('https://cdn.jsdelivr.net/gh/DoctorKhan/pompom-assets/gong.mp3'); } catch {}
  }
  try { if (typeof window !== 'undefined') window.__LAST_GONG_PLAYED = Date.now(); } catch {}
}

function playDing() {
  // Prefer WebAudio if available and enabled
  const usedWA = tryWebAudioBeep({ freq: 988, duration: 0.18, decay: 0.12 }); // B5-ish
  if (!usedWA) {
    try { safePlay('https://cdn.jsdelivr.net/gh/DoctorKhan/pompom-assets/ding.mp3'); } catch {}
  }
  try { if (typeof window !== 'undefined') window.__LAST_DING_PLAYED = Date.now(); } catch {}
}

try {
  if (typeof window !== 'undefined') {
    window.playGong = window.playGong || playGong;
    window.playDing = window.playDing || playDing;
  }
} catch {}

module.exports = { playGong, playDing };

