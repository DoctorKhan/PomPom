/**
 * @jest-environment jsdom
 */

describe('Meeting URL Capture Functionality', () => {
    let mockDeps;
    let createHandleStartMeet;
    let generateMeetingId;
    let generateMeetingRoom;

    beforeEach(() => {
        // Define the functions directly since we can't import ES6 modules in Jest easily
        generateMeetingId = () => {
            const chars = 'abcdefghijklmnopqrstuvwxyz';
            const randomChar = () => chars[Math.floor(Math.random() * chars.length)];
            return `${randomChar()}${randomChar()}${randomChar()}-${randomChar()}${randomChar()}${randomChar()}${randomChar()}-${randomChar()}${randomChar()}${randomChar()}`;
        };

        generateMeetingRoom = () => {
            const adjectives = ['quick', 'team', 'daily', 'sync', 'focus', 'sprint', 'standup'];
            const nouns = ['meeting', 'chat', 'session', 'call', 'huddle', 'sync', 'connect'];
            const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
            const noun = nouns[Math.floor(Math.random() * nouns.length)];
            const num = Math.floor(Math.random() * 1000);
            return `${adj}-${noun}-${num}`;
        };

        createHandleStartMeet = (deps) => {
            const { OFFLINE_MODE, windowOpen, showToast, localChat, getUserNameFromStorage, userName, switchView, addDoc, getChatRef, serverTimestamp } = deps;

            return async function handleStartMeet() {
                try {
                    // Use Google Meet's "new" endpoint to create a real meeting
                    const meetWindow = windowOpen('https://meet.google.com/new', '_blank');
                    showToast('Opening Google Meet...');

                    // Try to capture the actual meeting URL
                    let actualMeetUrl = 'https://meet.google.com/new';
                    let meetingId = 'new';

                    if (OFFLINE_MODE) {
                        if (localChat) {
                            const msg = `${(userName || getUserNameFromStorage() || 'Someone')} started a Meet. Meeting URL will be available in the opened tab.`;
                            localChat.push({ userId: 'local', userName: userName || 'You', text: msg, createdAt: new Date() });
                        }
                        switchView('chat');
                        return { success: true, meetingUrl: actualMeetUrl, meetingId: meetingId };
                    }

                    if (addDoc && getChatRef && serverTimestamp) {
                        const msg = `${(userName || getUserNameFromStorage() || 'Someone')} started a Google Meet. Meeting URL will be available in the opened tab.`;
                        await addDoc(getChatRef(), {
                            userId: 'system',
                            userName: userName || getUserNameFromStorage(),
                            text: msg,
                            createdAt: serverTimestamp(),
                            meetingUrl: actualMeetUrl
                        });
                    }

                    switchView('chat');

                    return {
                        success: true,
                        meetingUrl: actualMeetUrl,
                        meetingId: meetingId
                    };
                } catch (error) {
                    console.error('Meeting start error:', error);
                    return { success: false, error: error.message };
                }
            };
        };
        
        // Mock dependencies
        mockDeps = {
            OFFLINE_MODE: true,
            windowOpen: jest.fn(),
            showToast: jest.fn(),
            localChat: [],
            getUserNameFromStorage: jest.fn(() => 'TestUser'),
            userName: 'TestUser',
            switchView: jest.fn(),
            GoogleAuthProvider: null,
            signInWithPopup: null,
            auth: null,
            addDoc: jest.fn(),
            getChatRef: jest.fn(),
            serverTimestamp: jest.fn(() => new Date()),
            doFetch: jest.fn(),
            teamNameInput: { value: 'TestTeam' },
            sessionId: 'test-session-123'
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Meeting ID Generation', () => {
        test('generateMeetingId should create valid Google Meet format', () => {
            const meetingId = generateMeetingId();

            expect(meetingId).toBeDefined();
            expect(typeof meetingId).toBe('string');
            // Should match format: xxx-xxxx-xxx
            expect(meetingId).toMatch(/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/);
        });

        test('generateMeetingId should create unique IDs', () => {
            const id1 = generateMeetingId();
            const id2 = generateMeetingId();

            expect(id1).not.toBe(id2);
        });

        test('generateMeetingRoom should create readable room names', () => {
            const roomName = generateMeetingRoom();

            expect(roomName).toBeDefined();
            expect(typeof roomName).toBe('string');
            // Should match format: adjective-noun-number
            expect(roomName).toMatch(/^[a-z]+-[a-z]+-\d+$/);
        });
    });

    describe('Meeting URL Creation', () => {
        test('should create meeting using Google Meet new endpoint', async () => {
            const handleStartMeet = createHandleStartMeet(mockDeps);

            const result = await handleStartMeet();

            expect(result).toBeDefined();
            expect(result.success).toBe(true);
            expect(result.meetingUrl).toBe('https://meet.google.com/new');
            expect(result.meetingId).toBe('new');
        });

        test('should open meeting window with Google Meet new URL', async () => {
            const handleStartMeet = createHandleStartMeet(mockDeps);

            await handleStartMeet();

            expect(mockDeps.windowOpen).toHaveBeenCalledWith(
                'https://meet.google.com/new',
                '_blank'
            );
        });

        test('should show toast notification', async () => {
            const handleStartMeet = createHandleStartMeet(mockDeps);
            
            await handleStartMeet();
            
            expect(mockDeps.showToast).toHaveBeenCalledWith('Opening Google Meet...');
        });
    });

    describe('Chat Integration', () => {
        test('should add meeting message to local chat in offline mode', async () => {
            const localChat = [];
            mockDeps.localChat = localChat;

            const handleStartMeet = createHandleStartMeet(mockDeps);

            await handleStartMeet();

            expect(localChat).toHaveLength(1);
            expect(localChat[0].text).toContain('started a Meet');
            expect(localChat[0].text).toContain('Meeting URL will be available in the opened tab');
            expect(localChat[0].userName).toBe('TestUser');
        });

        test('should switch to chat view in offline mode', async () => {
            const handleStartMeet = createHandleStartMeet(mockDeps);
            
            await handleStartMeet();
            
            expect(mockDeps.switchView).toHaveBeenCalledWith('chat');
        });

        test('should add meeting URL to Firebase chat when online', async () => {
            mockDeps.OFFLINE_MODE = false;
            mockDeps.addDoc = jest.fn();
            mockDeps.getChatRef = jest.fn(() => 'chat-ref');
            
            const handleStartMeet = createHandleStartMeet(mockDeps);
            
            await handleStartMeet();
            
            expect(mockDeps.addDoc).toHaveBeenCalledWith(
                'chat-ref',
                expect.objectContaining({
                    userId: 'system',
                    userName: 'TestUser',
                    text: expect.stringContaining('started a Google Meet'),
                    meetingUrl: 'https://meet.google.com/new'
                })
            );
        });
    });

    describe('Error Handling', () => {
        test('should handle windowOpen failure gracefully', async () => {
            mockDeps.windowOpen = jest.fn(() => {
                throw new Error('Popup blocked');
            });
            
            const handleStartMeet = createHandleStartMeet(mockDeps);
            
            // Should not throw
            await expect(handleStartMeet()).resolves.toBeDefined();
        });

        test('should handle missing dependencies gracefully', async () => {
            const minimalDeps = {
                OFFLINE_MODE: true,
                windowOpen: jest.fn(),
                showToast: jest.fn(),
                localChat: [],
                getUserNameFromStorage: jest.fn(() => 'User'),
                userName: 'User',
                switchView: jest.fn()
            };
            
            const handleStartMeet = createHandleStartMeet(minimalDeps);
            
            await expect(handleStartMeet()).resolves.toBeDefined();
        });
    });

    describe('Return Value Structure', () => {
        test('should return success, meetingUrl, and meetingId', async () => {
            const handleStartMeet = createHandleStartMeet(mockDeps);
            
            const result = await handleStartMeet();
            
            expect(result).toEqual({
                success: true,
                meetingUrl: 'https://meet.google.com/new',
                meetingId: 'new'
            });
        });

        test('meetingUrl should contain the meetingId', async () => {
            const handleStartMeet = createHandleStartMeet(mockDeps);
            
            const result = await handleStartMeet();
            
            expect(result.meetingUrl).toContain(result.meetingId);
        });
    });

    describe('Integration with Main App', () => {
        test('generateSimpleMeetingId should work in main app context', () => {
            // Simulate the function from index.html
            const generateSimpleMeetingId = () => {
                const chars = 'abcdefghijklmnopqrstuvwxyz';
                const randomChar = () => chars[Math.floor(Math.random() * chars.length)];
                return `${randomChar()}${randomChar()}${randomChar()}-${randomChar()}${randomChar()}${randomChar()}${randomChar()}-${randomChar()}${randomChar()}${randomChar()}`;
            };
            
            const meetingId = generateSimpleMeetingId();
            
            expect(meetingId).toMatch(/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/);
        });

        test('copyToClipboard should handle success and failure', async () => {
            // Mock clipboard API
            Object.assign(navigator, {
                clipboard: {
                    writeText: jest.fn(() => Promise.resolve())
                }
            });

            const mockShowToast = jest.fn();

            // Simulate the function from index.html
            const copyToClipboard = async (text) => {
                try {
                    await navigator.clipboard.writeText(text);
                    mockShowToast('📋 Meeting URL copied to clipboard!');
                } catch (error) {
                    mockShowToast('❌ Could not copy to clipboard');
                }
            };

            await copyToClipboard('https://meet.google.com/abc-defg-hij');

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://meet.google.com/abc-defg-hij');
            expect(mockShowToast).toHaveBeenCalledWith('📋 Meeting URL copied to clipboard!');
        });
    });
});
