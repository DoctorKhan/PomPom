/**
 * Task management functionality
 */

// --- DOM Elements ---
const currentTaskDisplay = document.getElementById('current-task-display');
const completeCurrentTaskBtn = document.getElementById('complete-current-task-btn');
const nextTaskBtn = document.getElementById('next-task-btn');
const todoIdeaInput = document.getElementById('todo-idea-input');
const todoAddBtn = document.getElementById('todo-add-btn');
const todoList = document.getElementById('todo-list');
const breakdownTaskBtn = document.getElementById('breakdown-task-btn');

// Timer screen task elements
const timerTaskInput = document.getElementById('timer-task-input');
const timerAddTaskBtn = document.getElementById('timer-add-task-btn');
const timerCompleteTaskBtn = document.getElementById('timer-complete-task-btn');

// --- Task Functions ---
function getCurrentTask() {
    const tasks = window.PomPomMain?.tasks || [];
    return tasks.find(task => !task.completed) || null;
}

function updateCurrentTaskDisplay() {
    const tasks = window.PomPomMain?.tasks || [];
    const currentTask = getCurrentTask();
    
    if (currentTaskDisplay) {
        if (currentTask) {
            currentTaskDisplay.innerHTML = `
                <div class="current-task-highlight p-4 rounded-lg text-center">
                    <div class="text-sm text-teal-300 mb-1">Currently Working On</div>
                    <div class="text-white font-medium">${currentTask.text}</div>
                </div>
            `;
            currentTaskDisplay.className = "min-h-[3rem] flex items-center justify-center";
            if (completeCurrentTaskBtn) completeCurrentTaskBtn.disabled = false;
            if (nextTaskBtn) nextTaskBtn.disabled = false;
        } else {
            currentTaskDisplay.innerHTML = `
                <div class="p-4 rounded-lg text-center bg-white/5 border border-white/10">
                    <div class="text-gray-400 text-sm">No active tasks</div>
                    <div class="text-gray-500 text-xs mt-1">Add a task to get started</div>
                </div>
            `;
            currentTaskDisplay.className = "min-h-[3rem] flex items-center justify-center";
            if (completeCurrentTaskBtn) completeCurrentTaskBtn.disabled = true;
            if (nextTaskBtn) nextTaskBtn.disabled = true;
        }
    }
}

function updateTimerCurrentTask() {
    const tasks = window.PomPomMain?.tasks || [];
    const currentTask = tasks.find(task => !task.completed);
    const currentTaskDisplay = document.getElementById('current-task-display');
    const currentTaskSection = document.getElementById('current-task-section');
    const addTaskSection = document.getElementById('add-task-section');
    const taskActions = document.getElementById('task-actions');

    if (currentTask) {
        // Show current task section, hide add task section
        if (currentTaskSection) {
            currentTaskSection.classList.remove('hidden');
        }
        if (addTaskSection) {
            addTaskSection.classList.add('hidden');
        }
        if (taskActions) {
            taskActions.classList.remove('hidden');
        }

        // Update task display
        if (currentTaskDisplay) {
            currentTaskDisplay.innerHTML = `<span class="text-white">${currentTask.text}</span>`;
        }

        // Enable task action buttons
        if (timerCompleteTaskBtn) {
            timerCompleteTaskBtn.disabled = false;
        }
        if (nextTaskBtn) {
            nextTaskBtn.disabled = false;
        }
    } else {
        // Show add task section, hide current task section
        if (currentTaskSection) {
            currentTaskSection.classList.add('hidden');
        }
        if (addTaskSection) {
            addTaskSection.classList.remove('hidden');
        }
        if (taskActions) {
            taskActions.classList.add('hidden');
        }

        // Disable task action buttons
        if (timerCompleteTaskBtn) {
            timerCompleteTaskBtn.disabled = true;
        }
        if (nextTaskBtn) {
            nextTaskBtn.disabled = true;
        }
    }
}

function completeCurrentTask() {
    const currentTask = getCurrentTask();
    if (currentTask) {
        currentTask.completed = true;
        updateCurrentTaskDisplay();
        renderTasks();
        if (window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('✅ Task completed! Great work!');
        }
    }
}

function moveToNextTask() {
    const tasks = window.PomPomMain?.tasks || [];
    const currentTask = getCurrentTask();
    if (currentTask) {
        // Move current task to end of list
        const index = tasks.indexOf(currentTask);
        const movedTask = tasks.splice(index, 1)[0];
        tasks.push(movedTask);
        updateCurrentTaskDisplay();
        renderTasks();
        if (window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('→ Moved to next task');
        }
    }
}

function renderTasks() {
    const tasks = window.PomPomMain?.tasks || [];
    
    if (!todoList) return;
    
    todoList.innerHTML = '';
    if (tasks.length === 0) {
        todoList.innerHTML = `<p class="text-gray-400 text-sm">No tasks yet. Add one!</p>`;
        updateCurrentTaskDisplay(); // Update timer display when no tasks
        return;
    }
    
    tasks.forEach((task, index) => {
        const taskEl = document.createElement('div');
        taskEl.className = `task-item p-3 rounded-lg flex justify-between items-center ${task.completed ? 'bg-white/5 text-gray-500 completed' : 'bg-white/10'} group transition-all hover:bg-white/15`;
        taskEl.innerHTML = `
            <div class="flex-1 flex items-center gap-3">
                <button data-index="${index}" class="toggle-task-btn w-5 h-5 rounded border-2 border-gray-400 flex items-center justify-center ${task.completed ? 'bg-teal-500 border-teal-500' : ''} hover:border-teal-400 transition">
                    ${task.completed ? '<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>' : ''}
                </button>
                <span class="task-text flex-1 cursor-pointer ${task.completed ? 'line-through' : ''} hover:text-teal-300 transition" data-index="${index}" title="Click to edit">${task.text}</span>
            </div>
            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button data-index="${index}" class="delete-task-btn text-red-400 px-2 py-1 rounded hover:bg-red-500/20 transition">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `;
        todoList.appendChild(taskEl);
    });
    
    updateCurrentTaskDisplay(); // Update timer display after rendering tasks
    updateTimerCurrentTask(); // Update timer screen current task display
}

// --- Inline Task Editing ---
function startTaskEdit(index) {
    const tasks = window.PomPomMain?.tasks || [];
    const task = tasks[index];
    const taskElements = todoList?.querySelectorAll('.task-text');
    const taskElement = taskElements?.[index];
    
    if (!taskElement) return;

    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.value = task.text;
    input.className = 'form-input flex-1 rounded px-2 py-1 text-sm bg-white/10 border border-teal-400 text-white';
    
    // Replace text with input
    const parent = taskElement.parentElement;
    parent.replaceChild(input, taskElement);
    
    // Focus and select text
    input.focus();
    input.select();

    // Handle save/cancel
    const saveEdit = () => {
        const newText = input.value.trim();
        if (newText && newText !== task.text) {
            task.text = newText;
            if (window.PomPomMain?.showToast) {
                window.PomPomMain.showToast('✏️ Task updated!');
            }
        }
        renderTasks();
        updateCurrentTaskDisplay();
    };

    const cancelEdit = () => {
        renderTasks();
    };

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit();
        }
    });
}

// --- Event Listeners ---
function initializeTaskEventListeners() {
    // Timer-task integration event listeners
    if (completeCurrentTaskBtn) {
        completeCurrentTaskBtn.addEventListener('click', completeCurrentTask);
    }

    if (nextTaskBtn) {
        nextTaskBtn.addEventListener('click', moveToNextTask);
    }

    // Timer screen task completion
    if (timerCompleteTaskBtn) {
        timerCompleteTaskBtn.addEventListener('click', () => {
            const tasks = window.PomPomMain?.tasks || [];
            const currentTask = tasks.find(task => !task.completed);
            if (currentTask) {
                currentTask.completed = true;
                currentTask.inProgress = false;
                renderTasks();
                updateTimerCurrentTask();
                if (window.PomPomMain?.showToast) {
                    window.PomPomMain.showToast('Task completed!');
                }
            }
        });
    }

    // Task list interactions
    if (todoList) {
        todoList.addEventListener('click', (e) => {
            const tasks = window.PomPomMain?.tasks || [];
            const index = parseInt(e.target.dataset.index);
            
            if (e.target.classList.contains('toggle-task-btn')) {
                tasks[index].completed = !tasks[index].completed;
                renderTasks();
                updateCurrentTaskDisplay();
            } else if (e.target.classList.contains('delete-task-btn')) {
                tasks.splice(index, 1);
                renderTasks();
                updateCurrentTaskDisplay();
                if (window.PomPomMain?.showToast) {
                    window.PomPomMain.showToast('🗑️ Task deleted');
                }
            } else if (e.target.classList.contains('task-text')) {
                startTaskEdit(index);
            }
        });
    }
}

// --- Initialization ---
function initializeTasks() {
    initializeTaskEventListeners();
    renderTasks();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTasks);
} else {
    initializeTasks();
}

// Export functions for use by other modules
window.PomPomTasks = {
    getCurrentTask,
    updateCurrentTaskDisplay,
    updateTimerCurrentTask,
    completeCurrentTask,
    moveToNextTask,
    renderTasks,
    startTaskEdit
};
