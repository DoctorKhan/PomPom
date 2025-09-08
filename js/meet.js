/**
 * Meeting functionality and integration
 */

// --- DOM Elements ---
const startMeetBtn = document.getElementById('start-meet-btn');
const chatMessages = document.getElementById('chat-messages');

// --- Meet Functions ---
function updateChatWithMeetingUrl(meetingUrl) {
    if (!chatMessages) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = 'p-2 bg-teal-900/50 rounded-lg text-sm';
    messageEl.innerHTML = `
        <div class="flex items-center gap-2 mb-1">
            <span class="text-teal-300">📹</span>
            <span class="font-medium text-white">Meeting Started</span>
        </div>
        <div class="text-gray-300">
            <a href="${meetingUrl}" target="_blank" class="text-teal-300 hover:text-teal-200 underline">
                Join Meeting: ${meetingUrl}
            </a>
        </div>
    `;
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showGenericMeetingMessage() {
    if (!chatMessages) return;

    const messageEl = document.createElement('div');
    messageEl.className = 'p-2 bg-teal-900/50 rounded-lg text-sm';
    messageEl.innerHTML = `
        <div class="flex items-center gap-2 mb-1">
            <span class="text-teal-300">📹</span>
            <span class="font-medium text-white">Meeting Started</span>
        </div>
        <div class="text-gray-300">
            Google Meet opened in new tab. Share the meeting URL with your team when ready.
        </div>
    `;
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showManualMeetingLink() {
    if (!chatMessages) return;
    const div = document.createElement('div');
    div.className = 'p-2 bg-white/5 rounded-lg text-sm border border-white/10';
    div.innerHTML = `
      <div class="mb-1 text-gray-200 font-medium">Pop-up blocked</div>
      <div class="text-gray-300">
        Click to open: <a href="https://meet.google.com/new" target="_blank" class="text-teal-300 underline hover:text-teal-200">https://meet.google.com/new</a>
      </div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// --- Meet Module Loading ---
async function loadMeetModule() {
    // This function is no longer needed as the module is loaded via a script tag.
    // The logic has been simplified.
}

// --- Start Meeting Handler ---
async function handleStartMeeting() {
    if (!startMeetBtn) return;
    
    try {
        // Disable button to prevent multiple clicks
        startMeetBtn.disabled = true;
        startMeetBtn.textContent = '📹 Starting...';

        // Play ringing sound for all users (if available)
        if (typeof playMeetingRing === 'function') {
            playMeetingRing();
        }

        const sessionId = window.PomPomMain?.sessionId || 'default-session';
        const userName = window.PomPomMain?.userName || 'Anonymous';
        const extensionAvailable = (window.PomPomExtension?.isExtensionAvailable && window.PomPomExtension.isExtensionAvailable())
          || (typeof window.PomPomExtension?.extensionAvailable === 'boolean' ? window.PomPomExtension.extensionAvailable : false);

        // Check if extension is available for automatic URL capture
        if (extensionAvailable && typeof window.pomPomExtensionCaptureMeeting === 'function') {
            if (window.PomPomMain?.showToast) {
                window.PomPomMain.showToast('🚀 Starting meeting with extension...');
            }

            // Use extension to capture meeting URL
            const capturePromise = window.pomPomExtensionCaptureMeeting(sessionId, userName);

            // Open Google Meet
            const meetWindow = window.open('https://meet.google.com/new', '_blank');

            // If pop-up blocked, provide manual link immediately
            if (!meetWindow) {
                showManualMeetingLink();
                if (window.PomPomMain?.showToast) {
                    window.PomPomMain.showToast('Popup blocked — click the link in chat to open Meet');
                }
            }

            // Wait for URL capture (with timeout)
            try {
                const result = await Promise.race([
                    capturePromise,
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
                ]);

                if (result.success) {
                    updateChatWithMeetingUrl(result.meetingUrl);
                    if (window.PomPomMain?.showToast) {
                        window.PomPomMain.showToast('✅ Meeting URL captured automatically!');
                    }
                } else {
                    showGenericMeetingMessage();
                    if (window.PomPomMain?.showToast) {
                        window.PomPomMain.showToast('⚠️ Could not capture URL automatically');
                    }
                }
            } catch (error) {
                console.log('Extension capture failed:', error);
                showGenericMeetingMessage();
                if (window.PomPomMain?.showToast) {
                    window.PomPomMain.showToast('⚠️ Extension capture timed out');
                }
            }
        } else {
            // Fallback to manual capture method
            if (window.PomPomMain?.showToast) {
                window.PomPomMain.showToast('Opening Google Meet...');
            }

            // Open Google Meet and let it generate a real meeting room
            const meetWindow = window.open('https://meet.google.com/new', '_blank');

            // Try to capture the actual meeting URL after Google creates it
            let actualMeetUrl = null;
            let meetingId = null;

            if (meetWindow) {
                // Try to get the real meeting URL (limited by browser security)
                const checkForUrl = () => {
                    try {
                        if (meetWindow.location && meetWindow.location.href &&
                            meetWindow.location.href.includes('meet.google.com/') &&
                            !meetWindow.location.href.includes('/new')) {
                            actualMeetUrl = meetWindow.location.href;
                            meetingId = actualMeetUrl.split('/').pop();
                            return true;
                        }
                    } catch (e) {
                        // Cross-origin restrictions prevent access
                    }
                    return false;
                };

                // Poll for URL changes (limited by browser security)
                let attempts = 0;
                const maxAttempts = 20; // 10 seconds max
                const pollInterval = setInterval(() => {
                    attempts++;
                    if (checkForUrl() || attempts >= maxAttempts) {
                        clearInterval(pollInterval);
                        
                        if (actualMeetUrl) {
                            updateChatWithMeetingUrl(actualMeetUrl);
                            if (window.PomPomMain?.showToast) {
                                window.PomPomMain.showToast('✅ Meeting URL captured!');
                            }
                        } else {
                            showGenericMeetingMessage();
                            if (window.PomPomMain?.showToast) {
                                window.PomPomMain.showToast('📹 Meeting opened - share URL manually');
                            }
                        }
                    }
                }, 500);
            } else {
                showManualMeetingLink();
                if (window.PomPomMain?.showToast) {
                    window.PomPomMain.showToast('Popup blocked — click the link in chat to open Meet');
                }
            }
        }
    } catch (error) {
        console.error('Error starting meeting:', error);
        if (window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('❌ Failed to start meeting');
        }
    } finally {
        // Re-enable button after a delay
        setTimeout(() => {
            if (startMeetBtn) {
                startMeetBtn.disabled = false;
                startMeetBtn.textContent = '📹 Start Meeting';
            }
        }, 3000);
    }
}

// --- Event Listeners ---
function initializeMeetEventListeners() {
    // Start Meeting functionality
    if (startMeetBtn) {
        startMeetBtn.addEventListener('click', handleStartMeeting);
    }
}

// --- Initialization ---
async function initializeMeet() {
    // Load meet module
    await loadMeetModule();
    
    // Initialize event listeners
    initializeMeetEventListeners();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMeet);
} else {
    initializeMeet();
}

// Export functions for use by other modules
window.PomPomMeet = {
    updateChatWithMeetingUrl,
    showGenericMeetingMessage,
    handleStartMeeting
};
