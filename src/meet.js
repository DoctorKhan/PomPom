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
      windowOpen('https://meet.google.com/new', '_blank');
      showToast('Opening Google Meet...');

      if (OFFLINE_MODE) {
        if (localChat) {
          const msg = `${(userName || getUserNameFromStorage() || 'Someone')} started a Meet. Check the new tab.`;
          localChat.push({ userId: 'local', userName: userName || 'You', text: msg, createdAt: new Date() });
        }
        switchView('chat');
        return;
      }

      // Try Google sign-in to obtain Calendar scope
      let accessToken = null;
      if (GoogleAuthProvider && signInWithPopup && auth) {
        try {
          const provider = new GoogleAuthProvider();
          provider.addScope('https://www.googleapis.com/auth/calendar.events');
          provider.addScope('https://www.googleapis.com/auth/userinfo.email');
          provider.setCustomParameters({ prompt: 'select_account consent' });
          const result = await signInWithPopup(auth, provider);
          const credential = GoogleAuthProvider.credentialFromResult(result);
          accessToken = (credential && credential.accessToken) || null;
        } catch (e) {
          // Proceed without token; we'll post a generic message
        }
      }

      if (!accessToken) {
        // Post a generic message to chat
        if (addDoc && getChatRef && serverTimestamp) {
          const msg = `${(userName || getUserNameFromStorage() || 'Someone')} started a Google Meet.`;
          await addDoc(getChatRef(), { userId: 'unknown', userName: userName || getUserNameFromStorage(), text: msg, createdAt: serverTimestamp() });
        }
        switchView('chat');
        return;
      }

      // Create a quick Calendar event to obtain a Meet link
      const now = new Date();
      const start = new Date(now.getTime() + 60 * 1000);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      const event = {
        summary: `Quick Meet — ${(teamNameInput && teamNameInput.value) || sessionId || 'PomPom'}`,
        description: `Started from PomPom by ${(userName || 'User')}`,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        conferenceData: { createRequest: { requestId: `${Date.now()}-meet` } },
      };
      const resp = await doFetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (!resp || !resp.ok) throw new Error(`Calendar API error ${resp && resp.status}`);
      const data = await resp.json();
      const meetLink = data.hangoutLink || ((data.conferenceData && data.conferenceData.entryPoints) || []).find(e => e.entryPointType === 'video')?.uri || '';
      if (addDoc && getChatRef && serverTimestamp) {
        const msg = `${(userName || getUserNameFromStorage() || 'Someone')} started a Meet: ${meetLink || '(open tab to fetch link)'}`;
        await addDoc(getChatRef(), { userId: 'unknown', userName: userName || getUserNameFromStorage(), text: msg, createdAt: serverTimestamp() });
      }
      switchView('chat');
    } catch (e) {
      // Swallow errors and show toast to avoid crashing UI
      showToast('Could not post Meet link');
    }
  };
}

export { createHandleStartMeet };
