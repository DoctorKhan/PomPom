/**
 * @jest-environment jsdom
 */

function setupDom() {
  document.body.innerHTML = `
    <div id="app">
      <div id="chat-messages"></div>
      <button id="start-meet-btn">📹 Start Meeting</button>
    </div>`;
}

describe('Meet UI: start meeting', () => {
  function setDocumentReadyComplete() {
    Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });
  }

  beforeEach(() => {
    jest.resetModules();
    setupDom();
    setDocumentReadyComplete();
    // Stub toast
    window.PomPomMain = { showToast: jest.fn(), sessionId: 'test-session', userName: 'Tester' };
  });

  test('when popup is blocked (window.open returns null), shows manual link and toast', async () => {
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(null);
    require('../js/meet.js');
    // Call the handler directly to avoid DOMContentLoaded timing
    await window.PomPomMeet.handleStartMeeting();
    expect(openSpy).toHaveBeenCalled();
    const chat = document.getElementById('chat-messages');
    expect(chat.textContent).toContain('https://meet.google.com/new');
    expect(window.PomPomMain.showToast).toHaveBeenCalled();
  });
});

