// Injected script - Runs in page context to access PomPom app functions
// This bridges the gap between content script and the actual PomPom app

(function() {
  'use strict';
  
  console.log('PomPom Extension: Injected script loaded');
  
  // Global flag to indicate extension is available
  window.POMPOM_EXTENSION_AVAILABLE = true;
  
  // Enhanced meeting URL capture function
  window.pomPomExtensionCaptureMeeting = function(sessionId, userName) {
    console.log('PomPom Extension: Starting meeting capture for', userName);
    
    // Notify content script
    window.postMessage({
      type: 'POMPOM_START_MEETING_CAPTURE',
      sessionId: sessionId,
      userName: userName
    }, '*');
    
    return new Promise((resolve) => {
      // Listen for captured URL
      const listener = (event) => {
        if (event.data.type === 'POMPOM_MEETING_URL_CAPTURED') {
          window.removeEventListener('message', listener);
          resolve({
            success: true,
            meetingUrl: event.data.meetingUrl,
            meetingId: event.data.meetingId,
            timestamp: event.data.timestamp
          });
        }
      };
      
      window.addEventListener('message', listener);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        window.removeEventListener('message', listener);
        resolve({
          success: false,
          error: 'Timeout waiting for meeting URL'
        });
      }, 30000);
    });
  };
  
  // Get latest captured meeting
  window.pomPomExtensionGetLatestMeeting = function() {
    return new Promise((resolve) => {
      window.postMessage({
        type: 'POMPOM_GET_LATEST_MEETING'
      }, '*');
      
      const listener = (event) => {
        if (event.data.type === 'POMPOM_LATEST_MEETING_RESPONSE') {
          window.removeEventListener('message', listener);
          resolve(event.data.meeting);
        }
      };
      
      window.addEventListener('message', listener);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        window.removeEventListener('message', listener);
        resolve(null);
      }, 5000);
    });
  };
  
  // Check extension status
  window.pomPomExtensionCheck = function() {
    return new Promise((resolve) => {
      window.postMessage({
        type: 'POMPOM_CHECK_EXTENSION'
      }, '*');
      
      const listener = (event) => {
        if (event.data.type === 'POMPOM_EXTENSION_STATUS') {
          window.removeEventListener('message', listener);
          resolve({
            installed: event.data.installed,
            version: event.data.version
          });
        }
      };
      
      window.addEventListener('message', listener);
      
      // Timeout after 2 seconds
      setTimeout(() => {
        window.removeEventListener('message', listener);
        resolve({
          installed: false,
          error: 'Extension not responding'
        });
      }, 2000);
    });
  };
  
  // Auto-capture meeting URLs when they're detected
  window.addEventListener('message', (event) => {
    if (event.data.type === 'POMPOM_MEETING_URL_CAPTURED') {
      console.log('PomPom Extension: Auto-captured meeting URL:', event.data.meetingUrl);
      
      // Trigger PomPom's meeting URL handler if it exists
      if (typeof window.handleCapturedMeetingUrl === 'function') {
        window.handleCapturedMeetingUrl(event.data.meetingUrl, event.data.meetingId);
      }
      
      // Also dispatch a custom event
      const customEvent = new CustomEvent('pomPomMeetingUrlCaptured', {
        detail: {
          meetingUrl: event.data.meetingUrl,
          meetingId: event.data.meetingId,
          timestamp: event.data.timestamp
        }
      });
      window.dispatchEvent(customEvent);
    }
  });
  
  // Notify that injected script is ready
  window.dispatchEvent(new CustomEvent('pomPomExtensionReady'));
  
})();
