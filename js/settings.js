/**
 * Settings and preferences management
 */

// --- Sound Settings ---
let isSoundEnabled = localStorage.getItem('pompom_sound_enabled') === 'true';
// Default sound ON for first-time users
if (localStorage.getItem('pompom_sound_enabled') === null) {
    isSoundEnabled = true;
    localStorage.setItem('pompom_sound_enabled', 'true');
}
// Make sound settings available globally for sound.js
window.isSoundEnabled = isSoundEnabled;

// Initialize audio context for WebAudio sounds
let audioCtx = null;
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
}
document.addEventListener('click', initAudioOnInteraction);
document.addEventListener('keydown', initAudioOnInteraction);

// --- DOM Elements ---
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const soundToggleBtn = document.getElementById('sound-toggle-btn');
const soundToggleSlider = document.getElementById('sound-toggle-slider');
const testSoundBtn = document.getElementById('test-sound-btn');
const audioDiagnosticsBtn = document.getElementById('audio-diagnostics-btn');

// --- Settings Functions ---
function updateSoundToggleUI() {
    const soundToggleIcon = document.getElementById('sound-toggle-icon');
    const soundToggleText = document.getElementById('sound-toggle-text');
    
    if (soundToggleIcon && soundToggleText) {
        if (isSoundEnabled) {
            soundToggleIcon.textContent = '🔊';
            soundToggleText.textContent = 'Sound On';
        } else {
            soundToggleIcon.textContent = '🔇';
            soundToggleText.textContent = 'Sound Off';
        }
    }
    
    // Update slider if it exists
    if (soundToggleSlider) {
        soundToggleSlider.checked = isSoundEnabled;
    }
    
    // Update global variable
    window.isSoundEnabled = isSoundEnabled;
}

function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('pompom_sound_enabled', isSoundEnabled.toString());
    updateSoundToggleUI();
    
    if (isSoundEnabled) {
        initAudioContext();
        if (window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('🔊 Sound enabled');
        }
    } else {
        if (window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('🔇 Sound disabled');
        }
    }
}

function testSound() {
    if (!isSoundEnabled) {
        if (window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('Sound is disabled. Enable it first.');
        }
        return;
    }
    
    // Test sound using the global playGong function if available
    if (typeof playGong === 'function') {
        playGong();
        if (window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('🔊 Test sound played');
        }
    } else {
        // Fallback beep
        try {
            const ctx = initAudioContext();
            if (ctx) {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.5);
                
                if (window.PomPomMain?.showToast) {
                    window.PomPomMain.showToast('🔊 Test beep played');
                }
            }
        } catch (e) {
            console.error('Could not play test sound:', e);
            if (window.PomPomMain?.showToast) {
                window.PomPomMain.showToast('❌ Could not play test sound');
            }
        }
    }
}

function showAudioDiagnostics() {
    const diagnostics = [];
    
    // Check audio context
    if (audioCtx) {
        diagnostics.push(`Audio Context: ${audioCtx.state}`);
        diagnostics.push(`Sample Rate: ${audioCtx.sampleRate}Hz`);
    } else {
        diagnostics.push('Audio Context: Not initialized');
    }
    
    // Check sound setting
    diagnostics.push(`Sound Enabled: ${isSoundEnabled}`);
    
    // Check browser support
    diagnostics.push(`Web Audio API: ${!!(window.AudioContext || window.webkitAudioContext)}`);
    
    alert('Audio Diagnostics:\n\n' + diagnostics.join('\n'));
}

// --- Event Listeners ---
function initializeSettingsEventListeners() {
    // Settings button event listeners
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            if (settingsModal) {
                settingsModal.classList.remove('hidden');
                updateSoundToggleUI();
                if (typeof updateExtensionUI === 'function') {
                    updateExtensionUI(); // Update extension status when opening settings
                }
            }
        });
    } else {
        console.error('Settings button not found!');
    }

    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => {
            if (settingsModal) {
                settingsModal.classList.add('hidden');
            }
        });
    }

    // Close modal when clicking outside
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
            }
        });
    }

    // Sound toggle button
    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', toggleSound);
    }

    // Sound toggle slider
    if (soundToggleSlider) {
        soundToggleSlider.addEventListener('change', (e) => {
            isSoundEnabled = e.target.checked;
            localStorage.setItem('pompom_sound_enabled', isSoundEnabled.toString());
            updateSoundToggleUI();
        });
    }

    // Test sound button
    if (testSoundBtn) {
        testSoundBtn.addEventListener('click', testSound);
    }

    // Audio diagnostics button
    if (audioDiagnosticsBtn) {
        audioDiagnosticsBtn.addEventListener('click', showAudioDiagnostics);
    }
}

// --- Initialization ---
function initializeSettings() {
    initializeSettingsEventListeners();
    updateSoundToggleUI();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSettings);
} else {
    initializeSettings();
}

// Export functions for use by other modules
window.PomPomSettings = {
    isSoundEnabled,
    toggleSound,
    testSound,
    updateSoundToggleUI,
    initAudioContext
};
