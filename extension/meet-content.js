// Google Meet Content Script
// Monitors Google Meet pages for URL changes and meeting events

console.log('PomPom Meeting Helper: Google Meet content script loaded');

let lastUrl = window.location.href;
let urlCheckInterval;

// Function to check for URL changes
function checkUrlChange() {
  const currentUrl = window.location.href;
  
  if (currentUrl !== lastUrl) {
    console.log('PomPom Extension: Google Meet URL changed:', currentUrl);
    lastUrl = currentUrl;
    
    // Check if this is a real meeting room (not /new)
    const meetingMatch = currentUrl.match(/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
    
    if (meetingMatch) {
      const meetingId = meetingMatch[1];
      console.log('PomPom Extension: Meeting room detected:', meetingId);
      
      // Send to background script
      chrome.runtime.sendMessage({
        action: 'meetingRoomDetected',
        meetingUrl: currentUrl,
        meetingId: meetingId,
        timestamp: Date.now()
      });
    }
  }
}

// Start monitoring URL changes
function startUrlMonitoring() {
  // Check immediately
  checkUrlChange();
  
  // Check periodically
  urlCheckInterval = setInterval(checkUrlChange, 1000);
  
  // Also listen for navigation events
  window.addEventListener('popstate', checkUrlChange);
  
  // Monitor for DOM changes that might indicate navigation
  const observer = new MutationObserver((mutations) => {
    // Check if the URL might have changed
    setTimeout(checkUrlChange, 100);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Wait for page to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startUrlMonitoring);
} else {
  startUrlMonitoring();
}

// Enhanced meeting detection
function detectMeetingStart() {
  // Look for meeting UI elements
  const meetingElements = [
    '[data-meeting-title]',
    '[aria-label*="meeting"]',
    '.google-meet-room',
    '[jsname="HlFzId"]' // Google Meet specific element
  ];
  
  for (const selector of meetingElements) {
    if (document.querySelector(selector)) {
      console.log('PomPom Extension: Meeting UI detected');
      checkUrlChange();
      break;
    }
  }
}

// Check for meeting UI periodically
setInterval(detectMeetingStart, 2000);

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkMeetingStatus') {
    const currentUrl = window.location.href;
    const meetingMatch = currentUrl.match(/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
    
    sendResponse({
      url: currentUrl,
      meetingId: meetingMatch ? meetingMatch[1] : null,
      isInMeeting: !!meetingMatch
    });
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (urlCheckInterval) {
    clearInterval(urlCheckInterval);
  }
});
