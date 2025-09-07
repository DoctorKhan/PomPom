import { createHandleStartMeet } from '../src/meet.js';

function makeDeps(overrides = {}) {
  const pushed = [];
  const deps = {
    OFFLINE_MODE: true,
    windowOpen: jest.fn(),
    showToast: jest.fn(),
    localChat: pushed,
    getUserNameFromStorage: () => 'Tester',
    userName: 'Alice',
    switchView: jest.fn(),
    GoogleAuthProvider: class {
      addScope() {}
      setCustomParameters() {}
      static credentialFromResult() { return { accessToken: 'token123' }; }
    },
    signInWithPopup: jest.fn(async () => ({})),
    auth: {},
    addDoc: jest.fn(async () => {}),
    getChatRef: jest.fn(() => ({ ref: 'chat' })),
    serverTimestamp: () => new Date('2025-08-18T12:00:00Z'),
    doFetch: jest.fn(async () => ({ ok: true, json: async () => ({ hangoutLink: 'https://meet.google.com/xyz' }) })),
    teamNameInput: { value: 'Fluffy Team' },
    sessionId: 'fluffy-team',
    ...overrides,
  };
  deps._pushed = pushed;
  return deps;
}

describe('handleStartMeet', () => {
  test('offline: opens meet and pushes local chat message', async () => {
    const deps = makeDeps({ OFFLINE_MODE: true });
    const handler = createHandleStartMeet(deps);
    await handler();
    expect(deps.windowOpen).toHaveBeenCalledWith('https://meet.google.com/new', '_blank');
    expect(deps._pushed.length).toBe(1);
    expect(deps._pushed[0].text).toMatch(/started a Meet/i);
    expect(deps.switchView).toHaveBeenCalledWith('chat');
  });

  test('online (no token): posts generic message via addDoc', async () => {
    const deps = makeDeps({ OFFLINE_MODE: false, signInWithPopup: jest.fn(async () => { throw new Error('popup blocked'); }) });
    const handler = createHandleStartMeet(deps);
    await handler();
    expect(deps.windowOpen).toHaveBeenCalled();
    expect(deps.addDoc).toHaveBeenCalled();
    const args = deps.addDoc.mock.calls[0][1];
    expect(args.text).toMatch(/started a Google Meet/i);
    expect(deps.switchView).toHaveBeenCalledWith('chat');
  });

  test('online (with token): creates event and posts meet link', async () => {
    const deps = makeDeps({ OFFLINE_MODE: false });
    const handler = createHandleStartMeet(deps);
    await handler();
    expect(deps.doFetch).toHaveBeenCalled();
    expect(deps.addDoc).toHaveBeenCalled();
    const args = deps.addDoc.mock.calls[0][1];
    expect(args.text).toMatch(/https:\/\/meet.google.com/);
    expect(deps.switchView).toHaveBeenCalledWith('chat');
  });

  test('error path: shows toast on failure', async () => {
    const deps = makeDeps({ OFFLINE_MODE: false, doFetch: jest.fn(async () => ({ ok: false, status: 500 })) });
    const handler = createHandleStartMeet(deps);
    await handler();
    expect(deps.showToast).toHaveBeenCalled();
  });
});
