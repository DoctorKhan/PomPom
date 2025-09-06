// PomPom Extension Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  // Update version
  const manifest = chrome.runtime.getManifest();
  document.getElementById('version').textContent = manifest.version;
  
  // Get current status
  await updateStatus();
  
  // Set up event listeners
  document.getElementById('copy-url').addEventListener('click', copyRecentUrl);
  document.getElementById('open-pompom').addEventListener('click', openPomPom);
  document.getElementById('test-extension').addEventListener('click', testExtension);
  
  // Update status every 2 seconds
  setInterval(updateStatus, 2000);
});

async function updateStatus() {
  try {
    // Get all tabs
    const tabs = await chrome.tabs.query({});
    
    // Count PomPom tabs
    const pomPomTabs = tabs.filter(tab => 
      tab.url && (tab.url.includes('localhost:8000') || tab.url.includes('pompom.app'))
    );
    
    document.getElementById('pompom-tabs').textContent = pomPomTabs.length;
    
    // Get storage data
    const storage = await chrome.storage.local.get(['meetingCount', 'lastMeeting']);
    
    document.getElementById('meetings-captured').textContent = storage.meetingCount || 0;
    
    // Show recent meeting if available
    if (storage.lastMeeting) {
      document.getElementById('recent-meeting').style.display = 'block';
      document.getElementById('recent-url').textContent = storage.lastMeeting.url;
    } else {
      document.getElementById('recent-meeting').style.display = 'none';
    }
    
  } catch (error) {
    console.error('Error updating status:', error);
    document.getElementById('extension-status').textContent = 'Error';
    document.getElementById('extension-status').className = 'status-value inactive';
  }
}

async function copyRecentUrl() {
  try {
    const storage = await chrome.storage.local.get(['lastMeeting']);
    if (storage.lastMeeting) {
      await navigator.clipboard.writeText(storage.lastMeeting.url);
      
      // Show feedback
      const button = document.getElementById('copy-url');
      const originalText = button.textContent;
      button.textContent = '✅ Copied!';
      button.style.background = '#10B981';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '#3B82F6';
      }, 2000);
    }
  } catch (error) {
    console.error('Error copying URL:', error);
  }
}

async function openPomPom() {
  try {
    // Check if PomPom is already open
    const tabs = await chrome.tabs.query({});
    const pomPomTab = tabs.find(tab => 
      tab.url && (tab.url.includes('localhost:8000') || tab.url.includes('pompom.app'))
    );
    
    if (pomPomTab) {
      // Switch to existing tab
      await chrome.tabs.update(pomPomTab.id, { active: true });
      await chrome.windows.update(pomPomTab.windowId, { focused: true });
    } else {
      // Open new tab
      await chrome.tabs.create({ url: 'http://localhost:8000' });
    }
    
    // Close popup
    window.close();
  } catch (error) {
    console.error('Error opening PomPom:', error);
  }
}

async function testExtension() {
  const button = document.getElementById('test-extension');
  const originalText = button.textContent;
  
  try {
    button.textContent = '🔄 Testing...';
    button.disabled = true;
    
    // Test background script communication
    const response = await chrome.runtime.sendMessage({ action: 'test' });
    
    // Test storage
    await chrome.storage.local.set({ testTime: Date.now() });
    const testData = await chrome.storage.local.get(['testTime']);
    
    if (testData.testTime) {
      button.textContent = '✅ Test Passed';
      button.style.background = '#10B981';
    } else {
      throw new Error('Storage test failed');
    }
    
  } catch (error) {
    console.error('Extension test failed:', error);
    button.textContent = '❌ Test Failed';
    button.style.background = '#EF4444';
  }
  
  setTimeout(() => {
    button.textContent = originalText;
    button.style.background = '#374151';
    button.disabled = false;
  }, 3000);
}
