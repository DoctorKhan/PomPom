/**
 * Chat functionality and messaging
 */

(function() {

// --- DOM Elements ---
let chatPopupBtn, chatPopup, chatMessages, chatInput, copyLinkBtn;
function cacheChatElements() {
    chatPopupBtn = document.getElementById('chat-popup-btn');
    chatPopup = document.getElementById('chat-popup');
    chatMessages = document.getElementById('chat-messages');
    chatInput = document.getElementById('chat-input');
    copyLinkBtn = document.getElementById('copy-link-btn');
}

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

function isElementVisible(el) {
    if (!el) return false;
    try {
        if (el.getClientRects().length === 0) return false;
        const cs = window.getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') return false;
        return true;
    } catch { return false; }
}

function showStatusInline(message, kind = 'success') {
    const status = document.getElementById('extension-status');
    if (!status) return false;

    // Only show inline if the section is currently visible on screen
    if (!isElementVisible(status)) return false;

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

    // Fallback copy using a temporary textarea (works on non-secure origins)
    const fallbackCopy = (text) => {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'absolute';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            if (ok) onSuccess(); else onError(new Error('execCommand copy failed'));
        } catch (e) {
            onError(e);
        }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(onSuccess).catch(() => fallbackCopy(shareUrl));
    } else {
        fallbackCopy(shareUrl);
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
    cacheChatElements();
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
