// Audio and Sound Functionality
// Handles sound settings, audio context, and sound effects

(function() {
  'use strict';

  let audioCtx = null;
  let isSoundEnabled = true;

  // Initialize sound settings from localStorage
  function initSoundSettings() {
    try {
      const stored = localStorage.getItem('pompom_sound_enabled');
      isSoundEnabled = stored === null ? true : stored === 'true';
      
      // Make sound settings available globally
      window.isSoundEnabled = isSoundEnabled;
      
      // Update UI if sound toggle exists
      updateSoundToggleUI();
      
    } catch (e) {
      console.warn('Could not load sound settings:', e);
      isSoundEnabled = true;
    }
  }

  // Initialize audio context
  function initAudioContext() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        window.audioCtx = audioCtx;
      }
      
      // Resume context if suspended (required by some browsers)
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      return audioCtx;
    } catch (e) {
      console.warn('Could not initialize audio context:', e);
      return null;
    }
  }

  // Initialize audio context on first user interaction
  function initAudioOnInteraction() {
    initAudioContext();
    // Remove listeners after first initialization
    document.removeEventListener('click', initAudioOnInteraction);
    document.removeEventListener('keydown', initAudioOnInteraction);
    document.removeEventListener('touchstart', initAudioOnInteraction);
  }

  // Play notification sound
  function playNotificationSound(type = 'default') {
    if (!isSoundEnabled) return;

    try {
      const ctx = initAudioContext();
      if (!ctx) return;

      // Create different sounds for different notifications
      const frequencies = {
        default: [800, 600, 400],
        complete: [523, 659, 784], // C, E, G chord
        break: [440, 554, 659],    // A, C#, E chord
        warning: [300, 300, 300]   // Low warning tone
      };

      const freq = frequencies[type] || frequencies.default;
      
      freq.forEach((f, i) => {
        setTimeout(() => {
          playTone(ctx, f, 0.1, 0.3);
        }, i * 150);
      });

    } catch (e) {
      console.warn('Could not play notification sound:', e);
    }
  }

  // Play a tone with given frequency and duration
  function playTone(ctx, frequency, duration, volume = 0.3) {
    try {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);

    } catch (e) {
      console.warn('Could not play tone:', e);
    }
  }

  // Play gong sound for timer completion
  function playGong() {
    if (!isSoundEnabled) return;

    try {
      const ctx = initAudioContext();
      if (!ctx) return;

      // Create a more complex gong-like sound
      const frequencies = [200, 300, 400, 500, 600];
      const duration = 2;

      frequencies.forEach((freq, i) => {
        setTimeout(() => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          oscillator.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(ctx.destination);

          oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
          oscillator.type = 'triangle';

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, ctx.currentTime);

          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + duration);
        }, i * 100);
      });

    } catch (e) {
      console.warn('Could not play gong sound:', e);
    }
  }

  // Toggle sound on/off
  function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    
    try {
      localStorage.setItem('pompom_sound_enabled', isSoundEnabled.toString());
      window.isSoundEnabled = isSoundEnabled;
    } catch (e) {
      console.warn('Could not save sound setting:', e);
    }

    updateSoundToggleUI();
    
    // Play a test sound when enabling
    if (isSoundEnabled) {
      playNotificationSound('default');
    }

    return isSoundEnabled;
  }

  // Update sound toggle UI
  function updateSoundToggleUI() {
    const toggleBtn = document.getElementById('sound-toggle-btn');
    const toggleIcon = document.getElementById('sound-toggle-icon');
    const toggleText = document.getElementById('sound-toggle-text');

    if (toggleBtn) {
      toggleBtn.classList.toggle('active', isSoundEnabled);
      toggleBtn.setAttribute('aria-pressed', isSoundEnabled.toString());
    }

    if (toggleIcon) {
      toggleIcon.textContent = isSoundEnabled ? '🔊' : '🔇';
    }

    if (toggleText) {
      toggleText.textContent = isSoundEnabled ? 'Sound On' : 'Sound Off';
    }
  }

  // Test sound function
  function testSound() {
    if (!isSoundEnabled) {
      toggleSound(); // Enable sound first
    }
    playNotificationSound('complete');
  }

  // Initialize audio system
  function initAudio() {
    initSoundSettings();
    
    // Add event listeners for user interaction
    document.addEventListener('click', initAudioOnInteraction);
    document.addEventListener('keydown', initAudioOnInteraction);
    document.addEventListener('touchstart', initAudioOnInteraction);

    // Add sound toggle event listener
    const toggleBtn = document.getElementById('sound-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleSound);
    }

    // Add test sound button listener
    const testBtn = document.getElementById('sound-test-btn');
    if (testBtn) {
      testBtn.addEventListener('click', testSound);
    }
  }

  // Export functions globally
  if (typeof window !== 'undefined') {
    window.AudioModule = {
      init: initAudio,
      playNotificationSound,
      playGong,
      toggleSound,
      testSound,
      get isSoundEnabled() { return isSoundEnabled; }
    };

    // Legacy global functions for compatibility
    window.playGong = playGong;
    window.playNotificationSound = playNotificationSound;
    window.toggleSound = toggleSound;
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAudio);
  } else {
    initAudio();
  }

})();
