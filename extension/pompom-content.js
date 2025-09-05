// PomPom Content Script - Runs on PomPom website
// Handles communication between PomPom app and the extension

console.log('PomPom Meeting Helper: Content script loaded');

// Register this tab with the background script
chrome.runtime.sendMessage({ action: 'registerPomPomTab' });

// Listen for meeting URLs from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'meetingUrlCaptured') {
    console.log('PomPom Extension: Received meeting URL:', request.meetingUrl);
    
    // Send to the PomPom app
    window.postMessage({
      type: 'POMPOM_MEETING_URL_CAPTURED',
      meetingUrl: request.meetingUrl,
      meetingId: request.meetingId,
      timestamp: request.timestamp
    }, '*');
    
    sendResponse({ success: true });
  }
});

// Listen for messages from PomPom app
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  if (event.data.type === 'POMPOM_START_MEETING_CAPTURE') {
    console.log('PomPom Extension: Starting meeting capture');
    
    // Notify background script
    chrome.runtime.sendMessage({ 
      action: 'startMeetingCapture',
      sessionId: event.data.sessionId,
      userName: event.data.userName
    });
  }
  
  if (event.data.type === 'POMPOM_GET_LATEST_MEETING') {
    // Get the most recent meeting URL
    chrome.runtime.sendMessage({ action: 'getLatestMeeting' }, (response) => {
      window.postMessage({
        type: 'POMPOM_LATEST_MEETING_RESPONSE',
        meeting: response.meeting
      }, '*');
    });
  }
  
  if (event.data.type === 'POMPOM_CHECK_EXTENSION') {
    // Respond that extension is installed and working
    window.postMessage({
      type: 'POMPOM_EXTENSION_STATUS',
      installed: true,
      version: chrome.runtime.getManifest().version
    }, '*');
  }
});

// Inject helper script into page context
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
script.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

// Show extension status in PomPom
function showExtensionStatus() {
  const statusDiv = document.createElement('div');
  statusDiv.id = 'pompom-extension-status';
  statusDiv.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #10B981;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;
  statusDiv.textContent = '✓ PomPom Extension Active';
  document.body.appendChild(statusDiv);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (statusDiv.parentNode) {
      statusDiv.parentNode.removeChild(statusDiv);
    }
  }, 3000);
}

// Show status when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showExtensionStatus);
} else {
  showExtensionStatus();
}
