/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const { waitFor, fireEvent } = require('@testing-library/dom');

function read(rel) { 
    return fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8'); 
}

function loadIndexIntoDom() {
    const html = read('index.html');
    document.open();
    document.write(html);
    document.close();

    // Execute inline script content
    const scripts = Array.from(document.querySelectorAll('script'));
    scripts.forEach((s) => {
        const code = (s.textContent || '').trim();
        if (code && !code.includes('cdn.tailwindcss.com') && !s.src) {
            try {
                // eslint-disable-next-line no-eval
                window.eval(code);
            } catch (error) {
                console.warn('Script execution error:', error.message);
            }
        }
    });

    return Promise.resolve();
}

describe('Timer Screen Task Creation', () => {
    beforeEach(async () => {
        // Reset DOM and globals for each test
        document.body.innerHTML = '';
        document.head.innerHTML = '';
        
        // Clear any existing global variables
        delete window.switchMainView;
        delete window.addTask;
        delete window.tasks;
        
        await loadIndexIntoDom();

        // Manually start session for testing
        const welcomePage = document.getElementById('welcome-page');
        const sessionPage = document.getElementById('session-page');

        if (welcomePage) {
            welcomePage.classList.add('hidden');
        }
        if (sessionPage) {
            sessionPage.classList.remove('hidden');
        }

        // Initialize tasks array for testing
        window.tasks = [];

        // Ensure we start on timer view
        const timerTab = document.getElementById('timer-tab');
        if (timerTab) {
            fireEvent.click(timerTab);
        }
    });

    describe('Task Creation Interface on Timer Screen', () => {
        test('timer screen has task creation input and button', async () => {
            await waitFor(() => {
                const timerMainView = document.getElementById('timer-main-view');
                expect(timerMainView).toBeTruthy();
                expect(timerMainView.classList.contains('hidden')).toBe(false);
            });
            
            // Check for task creation elements on timer screen
            const timerTaskInput = document.getElementById('timer-task-input');
            const timerAddTaskBtn = document.getElementById('timer-add-task-btn');
            
            expect(timerTaskInput).toBeTruthy();
            expect(timerAddTaskBtn).toBeTruthy();
            expect(timerTaskInput.placeholder).toContain('Add a task');
        });

        test('can add task from timer screen', async () => {
            await waitFor(() => {
                const timerMainView = document.getElementById('timer-main-view');
                expect(timerMainView.classList.contains('hidden')).toBe(false);
            });
            
            const timerTaskInput = document.getElementById('timer-task-input');
            const timerAddTaskBtn = document.getElementById('timer-add-task-btn');
            
            // Add a task
            timerTaskInput.value = 'New task from timer';
            fireEvent.click(timerAddTaskBtn);
            
            // Check if task was added to global tasks array
            await waitFor(() => {
                expect(window.tasks).toBeDefined();
                expect(window.tasks.length).toBeGreaterThan(0);
                expect(window.tasks.some(task => task.text === 'New task from timer')).toBe(true);
            });
            
            // Input should be cleared
            expect(timerTaskInput.value).toBe('');
        });

        test('can add task with Enter key from timer screen', async () => {
            await waitFor(() => {
                const timerMainView = document.getElementById('timer-main-view');
                expect(timerMainView.classList.contains('hidden')).toBe(false);
            });
            
            const timerTaskInput = document.getElementById('timer-task-input');
            
            // Add a task with Enter key
            timerTaskInput.value = 'Task added with Enter';
            fireEvent.keyPress(timerTaskInput, { key: 'Enter', code: 'Enter', charCode: 13 });
            
            // Check if task was added
            await waitFor(() => {
                expect(window.tasks).toBeDefined();
                expect(window.tasks.some(task => task.text === 'Task added with Enter')).toBe(true);
            });
        });

        test('added task appears in tasks tab', async () => {
            // Add task from timer screen
            await waitFor(() => {
                const timerMainView = document.getElementById('timer-main-view');
                expect(timerMainView.classList.contains('hidden')).toBe(false);
            });
            
            const timerTaskInput = document.getElementById('timer-task-input');
            const timerAddTaskBtn = document.getElementById('timer-add-task-btn');
            
            timerTaskInput.value = 'Cross-tab task';
            fireEvent.click(timerAddTaskBtn);
            
            // Switch to tasks tab
            const tasksTab = document.getElementById('tasks-tab');
            fireEvent.click(tasksTab);
            
            await waitFor(() => {
                const tasksMainView = document.getElementById('tasks-main-view');
                expect(tasksMainView.classList.contains('hidden')).toBe(false);
            });
            
            // Check if task appears in tasks list
            const todoList = document.getElementById('todo-list');
            await waitFor(() => {
                expect(todoList.textContent).toContain('Cross-tab task');
            });
        });

        test('shows current task on timer screen', async () => {
            // Add a task first
            await waitFor(() => {
                const timerMainView = document.getElementById('timer-main-view');
                expect(timerMainView.classList.contains('hidden')).toBe(false);
            });
            
            const timerTaskInput = document.getElementById('timer-task-input');
            const timerAddTaskBtn = document.getElementById('timer-add-task-btn');
            
            timerTaskInput.value = 'Current working task';
            fireEvent.click(timerAddTaskBtn);
            
            // Check if current task is displayed on timer screen
            const currentTaskDisplay = document.getElementById('timer-current-task');
            await waitFor(() => {
                expect(currentTaskDisplay).toBeTruthy();
                expect(currentTaskDisplay.textContent).toContain('Current working task');
            });
        });

        test('can complete task from timer screen', async () => {
            // Add a task first
            await waitFor(() => {
                const timerMainView = document.getElementById('timer-main-view');
                expect(timerMainView.classList.contains('hidden')).toBe(false);
            });
            
            const timerTaskInput = document.getElementById('timer-task-input');
            const timerAddTaskBtn = document.getElementById('timer-add-task-btn');
            
            timerTaskInput.value = 'Task to complete';
            fireEvent.click(timerAddTaskBtn);
            
            // Find and click complete button on timer screen
            const timerCompleteTaskBtn = document.getElementById('timer-complete-task-btn');
            expect(timerCompleteTaskBtn).toBeTruthy();
            
            fireEvent.click(timerCompleteTaskBtn);
            
            // Check if task was marked as completed
            await waitFor(() => {
                const completedTask = window.tasks.find(task => task.text === 'Task to complete');
                expect(completedTask).toBeTruthy();
                expect(completedTask.completed).toBe(true);
            });
        });
    });

    describe('Timer and Task Integration', () => {
        test('starting timer with current task updates task status', async () => {
            // Add a task first
            await waitFor(() => {
                const timerMainView = document.getElementById('timer-main-view');
                expect(timerMainView.classList.contains('hidden')).toBe(false);
            });
            
            const timerTaskInput = document.getElementById('timer-task-input');
            const timerAddTaskBtn = document.getElementById('timer-add-task-btn');
            
            timerTaskInput.value = 'Task with timer';
            fireEvent.click(timerAddTaskBtn);
            
            // Start timer
            const startTimerBtn = document.getElementById('start-pause-btn');
            fireEvent.click(startTimerBtn);
            
            // Check if task is marked as in progress
            await waitFor(() => {
                const task = window.tasks.find(task => task.text === 'Task with timer');
                expect(task).toBeTruthy();
                expect(task.inProgress).toBe(true);
            });
        });
    });
});
