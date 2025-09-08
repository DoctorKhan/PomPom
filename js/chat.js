/**
 * Chat functionality and messaging
 */

// --- DOM Elements ---
const chatPopupBtn = document.getElementById('chat-popup-btn');
const chatPopup = document.getElementById('chat-popup');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const copyLinkBtn = document.getElementById('copy-link-btn');

// --- Chat Functions ---
function addChatMessage(message, type = 'user') {
    if (!chatMessages) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = `p-2 rounded-lg text-sm ${type === 'system' ? 'bg-teal-900/50' : 'bg-white/10'}`;
    messageEl.textContent = message;
    
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addSystemMessage(message) {
    addChatMessage(message, 'system');
}

function sendChatMessage() {
    if (!chatInput) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    addChatMessage(message, 'user');
    chatInput.value = '';
    
    // Here you could add logic to send the message to other team members
    // For now, it's just a local chat interface
}

function copyShareLink() {
    const sessionId = window.PomPomMain?.sessionId || 'default-session';
    const shareUrl = `${window.location.origin}${window.location.pathname}?session=${sessionId}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            if (window.PomPomMain?.showToast) {
                window.PomPomMain.showToast('Share link copied to clipboard!');
            }
        }).catch(err => {
            console.error('Failed to copy link: ', err);
            if (window.PomPomMain?.showToast) {
                window.PomPomMain.showToast('Could not copy link.');
            }
        });
    } else {
        if (window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('Clipboard access is not available.');
        }
    }
}

// --- Event Listeners ---
function initializeChatEventListeners() {
    // Chat popup toggle
    if (chatPopupBtn) {
        chatPopupBtn.addEventListener('click', () => {
            if (chatPopup) {
                chatPopup.classList.toggle('hidden');
            }
        });
    }

    // Chat input handling
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }

    // Copy link button
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', copyShareLink);
    }
}

// --- Initialization ---
function initializeChat() {
    initializeChatEventListeners();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChat);
} else {
    initializeChat();
}

// Export functions for use by other modules
window.PomPomChat = {
    addChatMessage,
    addSystemMessage,
    sendChatMessage,
    copyShareLink
};
