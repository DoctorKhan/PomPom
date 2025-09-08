/**
 * Chat functionality and messaging
 */

(function() {

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

function showStatusInline(message, kind = 'success') {
    const status = document.getElementById('extension-status');
    if (!status) return false;
    let container = status.querySelector('.status-inline-messages');
    if (!container) {
        container = document.createElement('div');
        container.className = 'status-inline-messages mt-2 space-y-2';
        status.appendChild(container);
    }
    const div = document.createElement('div');
    div.className = `badge ${kind === 'success' ? 'badge-success' : 'badge-error'}`;
    div.textContent = message;
    container.appendChild(div);
    // Auto-fade and remove
    setTimeout(() => {
        div.style.transition = 'opacity 300ms ease';
        div.style.opacity = '0';
        setTimeout(() => div.remove(), 320);
    }, 2000);
    return true;
}

function copyShareLink() {
    const sessionId = window.PomPomMain?.sessionId || 'default-session';
    const shareUrl = `${window.location.origin}${window.location.pathname}?session=${sessionId}`;

    const onSuccess = () => {
        // Inline popup in the status section (like index-old UX)
        const shown = showStatusInline('✅ Share link copied to clipboard!');
        if (!shown && window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('Share link copied to clipboard!');
        }
    };
    const onError = (err) => {
        console.error('Failed to copy link: ', err);
        if (!showStatusInline('❌ Could not copy link.', 'error') && window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('Could not copy link.');
        }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(onSuccess).catch(onError);
    } else {
        onError(new Error('Clipboard API not available'));
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

})();
