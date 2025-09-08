/**
 * PomPom Extension Integration
 */

// --- Extension State ---
let extensionAvailable = false;
let extensionVersion = null;

// --- Extension Functions ---
function isExtensionAvailable() { return !!extensionAvailable; }
// Check for extension availability (robust, works on hosted domains)
async function checkExtensionAvailability() {
    try {
        // 1) Direct API from content script
        if (typeof window.pomPomExtensionCheck === 'function') {
            const status = await window.pomPomExtensionCheck();
            extensionAvailable = !!status?.installed;
            extensionVersion = status?.version || null;
        }

        // 2) Global flag injected by content script
        if (!extensionAvailable && window.POMPOM_EXTENSION_AVAILABLE) {
            extensionAvailable = true;
        }

        // 3) PostMessage handshake (extension should reply with a PONG)
        if (!extensionAvailable && typeof window !== 'undefined') {
            window.postMessage({ source: 'PomPomWebApp', type: 'POMPOM_EXTENSION_PING' }, '*');
        }
    } catch (error) {
        console.log('Extension not available:', error);
        extensionAvailable = false;
    }

    updateExtensionUI();
}

// Update extension UI based on availability
function updateExtensionUI() {
    const status = document.getElementById('extension-status');
    const statusText = document.getElementById('extension-status-text');
    const settingsStatus = document.getElementById('extension-settings-status');
    const installBtn = document.getElementById('extension-install-btn');

    if (extensionAvailable) {
        // Subtle status indicator
        if (status && statusText) {
            status.classList.remove('hidden');
            statusText.textContent = 'Extension: Active';
            statusText.className = 'text-xs text-green-400';
        }

        // Settings modal status
        if (settingsStatus) {
            settingsStatus.textContent = `Extension active${extensionVersion ? ` (v${extensionVersion})` : ''} - Meeting URLs will be captured automatically`;
            settingsStatus.className = 'text-green-400 text-sm';
        }

        // Hide install button
        if (installBtn) {
            installBtn.classList.add('hidden');
        }
    } else {
        // Subtle status indicator
        if (status && statusText) {
            status.classList.remove('hidden');
            statusText.textContent = 'Extension: Not installed';
            statusText.className = 'text-xs text-gray-400';
        }

        // Settings modal status
        if (settingsStatus) {
            settingsStatus.textContent = 'Install the Chrome extension for automatic meeting URL capture';
            settingsStatus.className = 'text-gray-400 text-sm';
        }

        // Show install button
        if (installBtn) {
            installBtn.classList.remove('hidden');
        }
    }
}

// Handle captured meeting URL from extension
function handleCapturedMeetingUrl(meetingUrl, meetingId) {
    console.log('PomPom: Received meeting URL from extension:', meetingUrl);
    if (typeof updateChatWithMeetingUrl === 'function') {
        updateChatWithMeetingUrl(meetingUrl);
    }
    if (window.PomPomMain?.showToast) {
        window.PomPomMain.showToast('✅ Meeting URL captured by extension!');
    }
}

// Extension install handlers
function setupExtensionButtons() {
    const installBtn = document.getElementById('extension-install-btn');
    const helpBtn = document.getElementById('extension-help-btn');

    if (installBtn) {
        installBtn.addEventListener('click', () => {
            window.open('extension-install.html', '_blank');
        });
    }

    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            window.open('extension-install.html', '_blank');
        });
    }
}

// --- Event Listeners ---
function initializeExtensionEventListeners() {
    // Listen for extension events
    window.addEventListener('pomPomMeetingUrlCaptured', (event) => {
        const { meetingUrl, meetingId } = event.detail;
        handleCapturedMeetingUrl(meetingUrl, meetingId);
    });

    // Also check when extension might be installed
    window.addEventListener('pomPomExtensionReady', checkExtensionAvailability);

    // Handshake via postMessage from the extension
    window.addEventListener('message', (e) => {
        try {
            const data = e.data || {};
            if (data && data.source === 'PomPomExtension' && data.type === 'POMPOM_EXTENSION_PONG') {
                extensionAvailable = true;
                extensionVersion = data.version || null;
                updateExtensionUI();
            }
        } catch (_) { /* ignore */ }
    });

    // Setup extension buttons
    setupExtensionButtons();
}

// --- Initialization ---
function initializeExtension() {
    initializeExtensionEventListeners();

    // Check extension availability on page load and keep retrying briefly
    setTimeout(checkExtensionAvailability, 500);
    let attempts = 0;
    const maxAttempts = 30; // ~15s at 500ms interval
    const interval = setInterval(() => {
        if (extensionAvailable || attempts >= maxAttempts) {
            clearInterval(interval);
            return;
        }
        attempts++;
        checkExtensionAvailability();
    }, 500);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}

// Make functions available globally for extension communication
window.handleCapturedMeetingUrl = handleCapturedMeetingUrl;

// Export functions for use by other modules
window.PomPomExtension = {
    // dynamic getter to avoid stale snapshot
    isExtensionAvailable,
    get extensionAvailable() { return !!extensionAvailable; },
    get extensionVersion() { return extensionVersion; },
    checkExtensionAvailability,
    updateExtensionUI,
    handleCapturedMeetingUrl
};
