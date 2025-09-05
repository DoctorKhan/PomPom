/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const { waitFor } = require('@testing-library/dom');

// Load the HTML file
const html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');

// Helper to set up DOM and execute script
const setupDOMAndScript = () => {
    document.documentElement.innerHTML = html;
    const scriptEl = document.querySelector('script[type="module"]');
    if (scriptEl && scriptEl.textContent) {
        try {
            new Function(scriptEl.textContent)();
        } catch (e) {
            console.error("Error executing script in test", e);
        }
    }
};

describe('AI Functionality (Groq)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDOMAndScript();
        
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ choices: [{ message: { content: '[]' } }] }),
        }));

        document.getElementById('user-name-setup-input').value = 'Test User';
        document.getElementById('start-session-btn').click();
    });

    test('should break down the top task when "Break down" is clicked', async () => {
        const mockSubtasks = ['Design UI in Figma', 'Develop HTML/CSS structure'];
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ choices: [{ message: { content: JSON.stringify(mockSubtasks) } }] }),
        });

        document.querySelector('[data-view="tasks"]').click();

        const todoIdeaInput = document.getElementById('todo-idea-input');
        const todoAddBtn = document.getElementById('todo-add-btn');
        const todoList = document.getElementById('todo-list');
        const breakdownTaskBtn = document.getElementById('breakdown-task-btn');

        todoIdeaInput.value = 'build login page';
        todoAddBtn.click();

        expect(todoList.children.length).toBe(1);
        expect(todoList.textContent).toContain('build login page');

        breakdownTaskBtn.click();

        await waitFor(() => {
            expect(todoList.children.length).toBe(2);
        });

        expect(fetch).toHaveBeenCalledWith('/api/groq', expect.any(Object));
        const fetchBody = JSON.parse(fetch.mock.calls[0][1].body);
        expect(fetchBody.messages[1].content).toContain('Based on the user\'s task "build login page"');

        expect(todoList.textContent).not.toContain('build login page');
        expect(todoList.textContent).toContain('Design UI in Figma');
    }, 10000);

    test('should summarize chat messages', async () => {
        const mockSummary = 'Key decision: move to microservices.';
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ choices: [{ message: { content: mockSummary } }] }),
        });

        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = '<div>User A: We should refactor.</div><div>User B: I agree, let us move to microservices.</div>';
        
        const summarizeChatBtn = document.getElementById('summarize-chat-btn');
        summarizeChatBtn.click();

        await waitFor(() => {
            expect(chatMessages.textContent).toContain(mockSummary);
        });

        expect(fetch).toHaveBeenCalledWith('/api/groq', expect.any(Object));
    }, 10000);

    test('should generate an icebreaker question', async () => {
        const mockQuestion = 'What is your favorite travel destination?';
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ choices: [{ message: { content: `"${mockQuestion}"` } }] }),
        });

        const icebreakerBtn = document.getElementById('icebreaker-btn');
        const chatInput = document.getElementById('chat-input');

        icebreakerBtn.click();

        await waitFor(() => {
            expect(chatInput.value).toBe(mockQuestion);
        });

        expect(fetch).toHaveBeenCalledWith('/api/groq', expect.any(Object));
    }, 10000);
});
