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
// Note: We now query DOM elements during initialization (after DOMContentLoaded)

// --- Settings Functions ---
function updateSoundToggleUI() {
    // Modal toggle
    const modalBtn = document.getElementById('sound-toggle-btn');
    const modalKnob = modalBtn ? modalBtn.querySelector('#sound-toggle-slider') : null;
    if (modalBtn) {
        if (isSoundEnabled) {
            modalBtn.classList.add('bg-teal-500');
            modalBtn.classList.remove('bg-gray-600');
            if (modalKnob) modalKnob.style.transform = 'translateX(24px)';
        } else {
            modalBtn.classList.remove('bg-teal-500');
            modalBtn.classList.add('bg-gray-600');
            if (modalKnob) modalKnob.style.transform = 'translateX(0px)';
        }
    }

    // Inline toggle in header
    const inlineBtn = document.getElementById('sound-toggle-btn-inline');
    const iconEl = document.getElementById('sound-toggle-icon-inline');
    const textEl = document.getElementById('sound-toggle-text-inline');
    if (iconEl) iconEl.textContent = isSoundEnabled ? '🔊' : '🔇';
    if (textEl) textEl.textContent = isSoundEnabled ? 'Sound On' : 'Sound Off';
    if (inlineBtn) {
        inlineBtn.classList.toggle('active', isSoundEnabled);
        inlineBtn.setAttribute('aria-pressed', String(isSoundEnabled));
    }

    // Update global variable for other modules (sound.js, etc.)
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

async function testSound() {
    if (!isSoundEnabled) {
        if (window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('Sound is disabled. Enable it first.');
        }
        return;
    }

    const btn = document.getElementById('test-sound-btn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = '🔊 Playing...';
    }

    try {
        // Initialize audio context if needed
        initAudioContext();

        let soundPlayed = false;

        // Prefer WebAudio-based sounds (better quality)
        if (typeof playGong === 'function' && isSoundEnabled) {
            playGong();
            soundPlayed = true;
            if (window.PomPomMain?.showToast) window.PomPomMain.showToast('🔊 Gong sound played!');
        } else if (typeof playMeetingRing === 'function' && isSoundEnabled) {
            playMeetingRing();
            soundPlayed = true;
            if (window.PomPomMain?.showToast) window.PomPomMain.showToast('🔊 Meeting ring played!');
        } else {
            // Fallback to basic audio file
            try {
                const audio = new Audio('https://cdn.jsdelivr.net/gh/DoctorKhan/pompom-assets/gong.mp3');
                audio.volume = 0.5;
                await audio.play();
                soundPlayed = true;
                if (window.PomPomMain?.showToast) window.PomPomMain.showToast('🔊 Fallback audio played!');
            } catch (audioError) {
                console.warn('Audio play failed:', audioError);
                if (window.PomPomMain?.showToast) window.PomPomMain.showToast('❌ Could not play sound');
            }
        }

        if (!soundPlayed) {
            if (!isSoundEnabled) {
                if (window.PomPomMain?.showToast) window.PomPomMain.showToast('🔇 Sound is disabled - enable it first');
            } else {
                if (window.PomPomMain?.showToast) window.PomPomMain.showToast('❌ No sound functions available');
            }
        }
    } catch (error) {
        console.error('Test sound error:', error);
        if (window.PomPomMain?.showToast) window.PomPomMain.showToast('❌ Sound test failed');
    } finally {
        setTimeout(() => {
            if (btn) {
                btn.disabled = false;
                btn.textContent = '🔊 Test';
            }
        }, 2000);
    }
}

function showAudioDiagnostics() {
    const out = document.getElementById('audio-diagnostics-output');
    if (!out) {
        alert('Audio Diagnostics output area not found.');
        return;
    }

    const rows = [];

    // Check sound setting
    rows.push({ ok: !!isSoundEnabled, text: `Sound Enabled: ${isSoundEnabled ? 'Yes' : 'No'}` });

    // Check audio context
    if (audioCtx) {
        rows.push({ ok: true, text: `Audio Context: ${audioCtx.state}` });
        rows.push({ ok: true, text: `Sample Rate: ${audioCtx.sampleRate}Hz` });
    } else {
        rows.push({ ok: false, text: 'Audio Context: Not initialized' });
    }

    // Check browser support
    const webAudioSupported = ('AudioContext' in window) || ('webkitAudioContext' in window);
    rows.push({ ok: !!webAudioSupported, text: `Web Audio API: ${webAudioSupported ? 'Supported' : 'Not Supported'}` });

    // Check sound functions
    ;['playGong', 'playDing', 'playMeetingRing'].forEach(fn => {
        rows.push({ ok: typeof window[fn] === 'function', text: `${fn}: ${typeof window[fn] === 'function' ? 'Available' : 'Missing'}` });
    });

    // Render in green/red badges under the section
    out.innerHTML = '';
    rows.forEach((r) => {
        const div = document.createElement('div');
        div.className = `text-sm px-3 py-2 rounded ${r.ok ? 'bg-emerald-600/70 text-white' : 'bg-red-600/70 text-white'}`;
        div.textContent = r.text;
        out.appendChild(div);
    });
}

// --- Event Listeners ---
function initializeSettingsEventListeners() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const testSoundBtn = document.getElementById('test-sound-btn');
    const audioDiagnosticsBtn = document.getElementById('audio-diagnostics-btn');

    // Collect both toggles explicitly (header + modal)
    const soundToggleBtns = [
        document.getElementById('sound-toggle-btn-inline'),
        document.getElementById('sound-toggle-btn'),
    ].filter(Boolean);

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

    // Sound toggle buttons (inline + modal)
    soundToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            isSoundEnabled = !isSoundEnabled;
            localStorage.setItem('pompom_sound_enabled', String(isSoundEnabled));
            updateSoundToggleUI();
        });
    });

    // Inline header button accessibility
    const inlineBtn = document.getElementById('sound-toggle-btn-inline');
    if (inlineBtn) inlineBtn.setAttribute('role', 'button');

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
