// PomPom Meeting Helper - Background Script
// Monitors Google Meet tabs and captures meeting URLs

let pomPomTabs = new Set();
let meetingTabs = new Map(); // tabId -> meeting info

// Track PomPom tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && (tab.url.includes('localhost:8000') || tab.url.includes('pompom.app'))) {
    pomPomTabs.add(tabId);
  }
});

// Clean up closed tabs
chrome.tabs.onRemoved.addListener((tabId) => {
  pomPomTabs.delete(tabId);
  meetingTabs.delete(tabId);
});

// Monitor Google Meet tabs for URL changes
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only process Google Meet tabs
  if (!tab.url || !tab.url.includes('meet.google.com')) {
    return;
  }

  // Check if URL changed to a real meeting room (not /new)
  if (changeInfo.url && changeInfo.status === 'complete') {
    const meetingMatch = tab.url.match(/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
    
    if (meetingMatch) {
      const meetingId = meetingMatch[1];
      const meetingUrl = tab.url;
      
      console.log('PomPom Extension: Captured meeting URL:', meetingUrl);
      
      // Store meeting info
      meetingTabs.set(tabId, {
        url: meetingUrl,
        id: meetingId,
        timestamp: Date.now()
      });

      // Store in chrome.storage for popup
      chrome.storage.local.get(['meetingCount'], (result) => {
        const count = (result.meetingCount || 0) + 1;
        chrome.storage.local.set({
          meetingCount: count,
          lastMeeting: {
            url: meetingUrl,
            id: meetingId,
            timestamp: Date.now()
          }
        });
      });
      
      // Send to all PomPom tabs
      for (const pomPomTabId of pomPomTabs) {
        try {
          await chrome.tabs.sendMessage(pomPomTabId, {
            action: 'meetingUrlCaptured',
            meetingUrl: meetingUrl,
            meetingId: meetingId,
            timestamp: Date.now()
          });
        } catch (error) {
          // Tab might be closed or not ready
          pomPomTabs.delete(pomPomTabId);
        }
      }
      
      // Show notification
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
      
      // Clear badge after 3 seconds
      setTimeout(() => {
        chrome.action.setBadgeText({ text: '' });
      }, 3000);
    }
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'registerPomPomTab') {
    pomPomTabs.add(sender.tab.id);
    sendResponse({ success: true });
    return true; // Keep message channel open
  }

  if (request.action === 'getLatestMeeting') {
    // Find the most recent meeting
    let latestMeeting = null;
    let latestTime = 0;

    for (const meeting of meetingTabs.values()) {
      if (meeting.timestamp > latestTime) {
        latestMeeting = meeting;
        latestTime = meeting.timestamp;
      }
    }

    sendResponse({ meeting: latestMeeting });
    return true; // Keep message channel open
  }

  if (request.action === 'startMeetingCapture') {
    // PomPom is starting a meeting, prepare to capture
    console.log('PomPom Extension: Ready to capture meeting URL');
    sendResponse({ success: true });
    return true; // Keep message channel open
  }

  if (request.action === 'test') {
    // Test message for popup
    sendResponse({ success: true, message: 'Extension is working' });
    return true; // Keep message channel open
  }
});

// Initialize
chrome.runtime.onInstalled.addListener(() => {
  console.log('PomPom Meeting Helper installed');
  
  // Set initial badge
  chrome.action.setBadgeText({ text: '' });
  
  // Store installation info
  chrome.storage.local.set({
    installed: true,
    installDate: Date.now(),
    version: chrome.runtime.getManifest().version
  });
});
