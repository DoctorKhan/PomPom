// Main PomPom Application Module
// Handles core application state and initialization

class PomPomApp {
    constructor() {
        this.state = {
            currentView: 'timer',
            session: null,
            user: null,
            tasks: [],
            timer: {
                running: false,
                remainingSeconds: 1500, // 25 minutes
                currentMode: 'pomodoro25',
                interval: null,
                targetEndTs: null
            },
            chat: {
                messages: []
            },
            taskFilter: 'all'
        };
        
        this.elements = {};
        this.initialized = false;
    }

    // Initialize the application
    async init() {
        if (this.initialized) return;
        
        try {
            this.cacheElements();
            this.setupEventListeners();
            this.loadState();
            this.render();
            this.initialized = true;
            console.log('PomPom app initialized successfully');
        } catch (error) {
            console.error('Failed to initialize PomPom app:', error);
        }
    }

    // Cache frequently used DOM elements
    cacheElements() {
        const elementIds = [
            'app', 'welcome-page', 'session-page',
            'timer-main-view', 'tasks-main-view', 'team-main-view', 'calendar-main-view',
            'timer-display', 'timer-mode-display', 'start-pause-btn', 'reset-btn',
            'current-task-display', 'timer-current-task',
            'todo-list', 'todo-idea-input', 'todo-add-btn',
            'timer-task-input', 'timer-add-task-btn', 'timer-complete-task-btn',
            'team-chat-container', 'team-chat-messages', 'team-chat-input', 'team-chat-send-btn',
            'chat-popup', 'chat-popup-btn', 'ai-agent-popup', 'ai-agent-btn'
        ];

        elementIds.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });

        // Cache tab elements
        ['timer', 'tasks', 'team', 'calendar'].forEach(tab => {
            this.elements[`${tab}-tab`] = document.getElementById(`${tab}-tab`);
        });
    }

    // Set up event listeners
    setupEventListeners() {
        // Tab navigation
        Object.keys(this.elements).forEach(key => {
            if (key.endsWith('-tab') && this.elements[key]) {
                this.elements[key].addEventListener('click', () => {
                    const view = key.replace('-tab', '');
                    this.switchView(view);
                });
            }
        });

        // Timer controls
        if (this.elements['start-pause-btn']) {
            this.elements['start-pause-btn'].addEventListener('click', () => {
                this.toggleTimer();
            });
        }

        if (this.elements['reset-btn']) {
            this.elements['reset-btn'].addEventListener('click', () => {
                this.resetTimer();
            });
        }

        // Task management
        if (this.elements['todo-add-btn']) {
            this.elements['todo-add-btn'].addEventListener('click', () => {
                this.addTask(this.elements['todo-idea-input'].value);
            });
        }

        if (this.elements['todo-idea-input']) {
            this.elements['todo-idea-input'].addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addTask(e.target.value);
                }
            });
        }

        // Timer screen task creation
        if (this.elements['timer-add-task-btn']) {
            this.elements['timer-add-task-btn'].addEventListener('click', () => {
                this.addTask(this.elements['timer-task-input'].value, 'timer');
            });
        }

        if (this.elements['timer-task-input']) {
            this.elements['timer-task-input'].addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addTask(e.target.value, 'timer');
                }
            });
        }

        // Team chat
        if (this.elements['team-chat-send-btn']) {
            this.elements['team-chat-send-btn'].addEventListener('click', () => {
                this.sendChatMessage(this.elements['team-chat-input'].value);
            });
        }

        if (this.elements['team-chat-input']) {
            this.elements['team-chat-input'].addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage(e.target.value);
                }
            });
        }

        // Task filters
        ['filter-all', 'filter-active', 'filter-completed'].forEach(filterId => {
            const filterBtn = document.getElementById(filterId);
            if (filterBtn) {
                filterBtn.addEventListener('click', () => {
                    this.setTaskFilter(filterId.replace('filter-', ''));
                });
            }
        });
    }

    setTaskFilter(filter) {
        this.state.taskFilter = filter;
        
        // Update filter button states
        ['filter-all', 'filter-active', 'filter-completed'].forEach(filterId => {
            const btn = document.getElementById(filterId);
            if (btn) {
                if (filterId === `filter-${filter}`) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });

        this.renderTasks();
    }

    // Switch between main views
    switchView(view) {
        this.state.currentView = view;
        
        // Hide all views
        ['timer', 'tasks', 'team', 'calendar'].forEach(v => {
            const element = this.elements[`${v}-main-view`];
            if (element) {
                element.classList.add('hidden');
            }
        });

        // Show selected view
        const targetView = this.elements[`${view}-main-view`];
        if (targetView) {
            targetView.classList.remove('hidden');
        }

        // Update tab states
        ['timer', 'tasks', 'team', 'calendar'].forEach(v => {
            const tab = this.elements[`${v}-tab`];
            if (tab) {
                if (v === view) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            }
        });
    }

    // Timer functionality
    toggleTimer() {
        if (this.state.timer.running) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        if (this.state.timer.running) return;

        // Mark current task as in progress
        const currentTask = this.state.tasks.find(task => !task.completed);
        if (currentTask) {
            currentTask.inProgress = true;
            this.updateTaskDisplays();
        }

        this.state.timer.running = true;
        this.state.timer.targetEndTs = Date.now() + this.state.timer.remainingSeconds * 1000;
        this.renderTimer();
        this.state.timer.interval = setInterval(() => this.timerTick(), 250);
    }

    pauseTimer() {
        this.state.timer.running = false;
        if (this.state.timer.interval) {
            clearInterval(this.state.timer.interval);
            this.state.timer.interval = null;
        }
        this.renderTimer();
    }

    resetTimer() {
        this.pauseTimer();
        this.state.timer.remainingSeconds = this.getModeDuration();
        this.renderTimer();
    }

    timerTick() {
        // DISABLED: Conflicting with js/timer.js - let the main timer module handle ticking
        // const now = Date.now();
        // const leftMs = Math.max(0, this.state.timer.targetEndTs - now);
        // this.state.timer.remainingSeconds = Math.ceil(leftMs / 1000);
        // this.renderTimer();

        // if (this.state.timer.remainingSeconds <= 0) {
        //     this.timerComplete();
        // }
    }

    timerComplete() {
        this.pauseTimer();
        this.state.timer.remainingSeconds = this.getModeDuration();
        this.renderTimer();
        
        // Play completion sound if available
        try {
            if (typeof window !== 'undefined' && typeof window.playGong === 'function') {
                window.playGong();
            }
        } catch (error) {
            console.warn('Could not play completion sound:', error);
        }
    }

    getModeDuration() {
        const durations = {
            'pomodoro25': 1500,
            'shortBreak': 300,
            'longBreak': 900
        };
        return durations[this.state.timer.currentMode] || 1500;
    }

    renderTimer() {
        // DISABLED: Conflicting with js/timer.js - let the main timer module handle display
        // if (this.elements['timer-display']) {
        //     this.elements['timer-display'].textContent = this.formatTime(this.state.timer.remainingSeconds);
        // }

        // if (this.elements['start-pause-btn']) {
        //     this.elements['start-pause-btn'].textContent = this.state.timer.running ? 'Pause' : 'Start';
        // }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Task management
    addTask(text, source = 'tasks') {
        if (!text || !text.trim()) return;

        const task = {
            id: Date.now().toString(),
            text: text.trim(),
            completed: false,
            inProgress: false,
            priority: 'medium', // Default priority
            createdAt: new Date().toISOString()
        };

        this.state.tasks.push(task);
        this.renderTasks();
        this.updateTaskDisplays();

        // Clear input
        if (source === 'timer' && this.elements['timer-task-input']) {
            this.elements['timer-task-input'].value = '';
        } else if (this.elements['todo-idea-input']) {
            this.elements['todo-idea-input'].value = '';
        }

        this.showToast('Task added successfully!');
    }

    renderTasks() {
        if (!this.elements['todo-list']) return;

        const todoList = this.elements['todo-list'];
        const emptyState = document.getElementById('empty-state');
        
        todoList.innerHTML = '';

        // Show empty state if no tasks
        if (this.state.tasks.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        } else {
            if (emptyState) emptyState.classList.add('hidden');
        }

        // Apply current filter
        const currentFilter = this.state.taskFilter || 'all';
        let filteredTasks = this.state.tasks;

        switch (currentFilter) {
            case 'active':
                filteredTasks = this.state.tasks.filter(task => !task.completed);
                break;
            case 'completed':
                filteredTasks = this.state.tasks.filter(task => task.completed);
                break;
            default:
                filteredTasks = this.state.tasks;
        }

        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            todoList.appendChild(taskElement);
        });

        // Update task stats
        this.updateTaskStats();
    }

    updateTaskStats() {
        const totalTasks = this.state.tasks.length;
        const completedTasks = this.state.tasks.filter(t => t.completed).length;
        const remainingTasks = totalTasks - completedTasks;

        const totalElement = document.getElementById('total-tasks-count');
        const completedElement = document.getElementById('completed-tasks-count');
        const remainingElement = document.getElementById('remaining-tasks-count');

        if (totalElement) totalElement.textContent = totalTasks;
        if (completedElement) completedElement.textContent = completedTasks;
        if (remainingElement) remainingElement.textContent = remainingTasks;
    }

    createTaskElement(task) {
        const div = document.createElement('div');
        const isCurrentTask = this.state.tasks.find(t => !t.completed) === task;
        
        div.className = `task-item ${task.completed ? 'completed' : ''} ${isCurrentTask ? 'current-task' : ''}`;
        div.innerHTML = `
            <div class="task-content">
                <div class="flex items-start gap-3 flex-1">
                    <div class="task-priority ${task.priority || 'medium'}"></div>
                    <div class="flex-1">
                        <div class="task-text ${task.completed ? 'completed' : ''}">${task.text}</div>
                        ${isCurrentTask ? '<div class="text-xs text-cyan-400 font-medium mt-1">← Current Focus Task</div>' : ''}
                        ${task.completed ? '<div class="text-xs text-green-400 font-medium mt-1">✓ Completed</div>' : ''}
                    </div>
                </div>
                <div class="task-actions">
                    ${!task.completed ? `
                        <button class="task-action-btn complete-task-btn" data-task-id="${task.id}" title="Mark as complete">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                            </svg>
                        </button>
                        <button class="task-action-btn edit-task-btn" data-task-id="${task.id}" title="Edit task">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                            </svg>
                        </button>
                    ` : ''}
                    <button class="task-action-btn delete-task-btn" data-task-id="${task.id}" title="Delete task">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        const completeBtn = div.querySelector('.complete-task-btn');
        const editBtn = div.querySelector('.edit-task-btn');
        const deleteBtn = div.querySelector('.delete-task-btn');

        if (completeBtn) {
            completeBtn.addEventListener('click', () => this.completeTask(task.id));
        }

        if (editBtn) {
            editBtn.addEventListener('click', () => this.editTask(task.id));
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
        }

        return div;
    }

    completeTask(taskId) {
        const task = this.state.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = true;
            task.inProgress = false;
            this.renderTasks();
            this.updateTaskDisplays();
            this.showToast('Task completed! 🎉');
        }
    }

    editTask(taskId) {
        const task = this.state.tasks.find(t => t.id === taskId);
        if (!task) return;

        const newText = prompt('Edit task:', task.text);
        if (newText && newText.trim() !== '') {
            task.text = newText.trim();
            this.renderTasks();
            this.updateTaskDisplays();
            this.showToast('Task updated!');
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.state.tasks = this.state.tasks.filter(t => t.id !== taskId);
            this.renderTasks();
            this.updateTaskDisplays();
            this.showToast('Task deleted!');
        }
    }

    updateTaskDisplays() {
        const currentTask = this.state.tasks.find(task => !task.completed);
        
        // Update main timer display
        if (this.elements['current-task-display']) {
            this.elements['current-task-display'].textContent = currentTask ? 
                currentTask.text : 'No task selected - add a task to get started';
        }

        // Update timer screen display
        if (this.elements['timer-current-task']) {
            if (currentTask) {
                this.elements['timer-current-task'].textContent = currentTask.text;
                this.elements['timer-current-task'].classList.remove('hidden');
            } else {
                this.elements['timer-current-task'].classList.add('hidden');
            }
        }

        // Update complete button state
        if (this.elements['timer-complete-task-btn']) {
            this.elements['timer-complete-task-btn'].disabled = !currentTask;
        }
    }

    // Chat functionality
    sendChatMessage(text) {
        if (!text || !text.trim()) return;

        const message = {
            id: Date.now().toString(),
            text: text.trim(),
            user: this.state.user?.name || 'Anonymous',
            timestamp: new Date().toISOString()
        };

        this.state.chat.messages.push(message);
        this.renderChatMessages();

        // Clear input
        if (this.elements['team-chat-input']) {
            this.elements['team-chat-input'].value = '';
        }
    }

    renderChatMessages() {
        if (!this.elements['team-chat-messages']) return;

        const messagesContainer = this.elements['team-chat-messages'];
        messagesContainer.innerHTML = '';

        if (this.state.chat.messages.length === 0) {
            messagesContainer.innerHTML = '<div class="text-gray-400 text-center text-xs">Team chat messages will appear here</div>';
            return;
        }

        this.state.chat.messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'chat-message p-2 bg-white/5 rounded text-sm';
            messageElement.innerHTML = `
                <div class="font-semibold text-teal-400">${message.user}</div>
                <div class="text-white">${message.text}</div>
                <div class="text-xs text-gray-400 mt-1">${new Date(message.timestamp).toLocaleTimeString()}</div>
            `;
            messagesContainer.appendChild(messageElement);
        });

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Utility methods
    showToast(message) {
        // Simple toast implementation
        console.log('Toast:', message);
        // TODO: Implement actual toast UI
    }

    loadState() {
        // Load state from localStorage if available
        try {
            const saved = localStorage.getItem('pompom-state');
            if (saved) {
                const state = JSON.parse(saved);
                this.state = { ...this.state, ...state };
            }
        } catch (error) {
            console.warn('Could not load saved state:', error);
        }
    }

    saveState() {
        // Save state to localStorage
        try {
            localStorage.setItem('pompom-state', JSON.stringify(this.state));
        } catch (error) {
            console.warn('Could not save state:', error);
        }
    }

    render() {
        this.renderTimer();
        this.renderTasks();
        this.renderChatMessages();
        this.updateTaskDisplays();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PomPomApp;
} else {
    window.PomPomApp = PomPomApp;
}
