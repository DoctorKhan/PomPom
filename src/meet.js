// Generate a Google Meet-style meeting ID
function generateMeetingId() {
  // Google Meet IDs are typically in format: xxx-xxxx-xxx
  // Using random characters that are URL-safe
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const randomChar = () => chars[Math.floor(Math.random() * chars.length)];

  return `${randomChar()}${randomChar()}${randomChar()}-${randomChar()}${randomChar()}${randomChar()}${randomChar()}-${randomChar()}${randomChar()}${randomChar()}`;
}

// Alternative: Generate a more unique meeting room name
function generateMeetingRoom() {
  const adjectives = ['quick', 'team', 'daily', 'sync', 'focus', 'sprint', 'standup'];
  const nouns = ['meeting', 'chat', 'session', 'call', 'huddle', 'sync', 'connect'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);

  return `${adj}-${noun}-${num}`;
}

// Factory to create a Start Google Meet handler with injected dependencies for easy testing
// deps: {
//   OFFLINE_MODE, windowOpen, showToast, localChat, getUserNameFromStorage, userName,
//   switchView, GoogleAuthProvider, signInWithPopup, auth,
//   addDoc, getChatRef, serverTimestamp, doFetch, teamNameInput, sessionId
// }
function createHandleStartMeet(deps) {
  const {
    OFFLINE_MODE,
    windowOpen = (url, target) => window.open(url, target),
    showToast = () => {},
    localChat = null,
    getUserNameFromStorage = () => 'User',
    userName = '',
    switchView = () => {},
    GoogleAuthProvider,
    signInWithPopup,
    auth,
    addDoc,
    getChatRef,
    serverTimestamp = () => new Date(),
    doFetch = (url, opts) => fetch(url, opts),
    teamNameInput = null,
    sessionId = ''
  } = deps || {};

  return async function handleStartMeet() {
    try {
      // Strategy 1: Use Google Meet's "new" endpoint to create a real meeting
      const meetWindow = windowOpen('https://meet.google.com/new', '_blank');
      showToast('Opening Google Meet...');

      // Strategy 2: Try to capture the actual meeting URL
      let actualMeetUrl = 'https://meet.google.com/new';
      let meetingId = 'new';

      // Attempt to get the real URL after the redirect (limited by CORS)
      if (meetWindow && !meetWindow.closed) {
        // Try to detect when the URL changes from /new to the actual meeting ID
        const urlCheckInterval = setInterval(() => {
          try {
            if (meetWindow.location && meetWindow.location.href &&
                meetWindow.location.href !== 'https://meet.google.com/new' &&
                meetWindow.location.href !== 'about:blank') {
              actualMeetUrl = meetWindow.location.href;
              // Extract meeting ID from URL
              const match = actualMeetUrl.match(/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
              if (match) {
                meetingId = match[1];
              }
              clearInterval(urlCheckInterval);
            }
          } catch (e) {
            // Cross-origin restriction - can't access the URL
            // This is expected behavior for security reasons
            clearInterval(urlCheckInterval);
          }
        }, 500);

        // Stop trying after 10 seconds
        setTimeout(() => {
          clearInterval(urlCheckInterval);
        }, 10000);
      }

      if (OFFLINE_MODE) {
        if (localChat) {
          const msg = `${(userName || getUserNameFromStorage() || 'Someone')} started a Meet. Meeting URL will be available in the opened tab.`;
          localChat.push({ userId: 'local', userName: userName || 'You', text: msg, createdAt: new Date() });
        }
        switchView('chat');
        return { success: true, meetingUrl: actualMeetUrl, meetingId: meetingId };
      }

      // Post the meeting URL to chat
      if (addDoc && getChatRef && serverTimestamp) {
        const msg = `${(userName || getUserNameFromStorage() || 'Someone')} started a Google Meet: ${actualMeetUrl}`;
        await addDoc(getChatRef(), {
          userId: 'system',
          userName: userName || getUserNameFromStorage(),
          text: msg,
          createdAt: serverTimestamp(),
          meetingUrl: actualMeetUrl // Store the meeting URL for easy access
        });
      }

      switchView('chat');

      // Return the meeting URL for further use
      return {
        success: true,
        meetingUrl: actualMeetUrl,
        meetingId: meetingId
      };
    } catch (e) {
      // Swallow errors and show toast to avoid crashing UI
      showToast('Could not post Meet link');
    }
  };
}

export { createHandleStartMeet };
