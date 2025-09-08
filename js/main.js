/**
 * Main application initialization and core functionality
 */

// --- App State ---
let sessionId = '';
let userName = '';
let tasks = []; // In-memory task list

// --- DOM Elements ---
const welcomePage = document.getElementById('welcome-page');
const sessionPage = document.getElementById('session-page');
const sessionHeaderName = document.getElementById('session-header-name');
const userNameSetupInput = document.getElementById('user-name-setup-input');
const shuffleUserNameBtn = document.getElementById('shuffle-user-name-btn');
const sessionNameInput = document.getElementById('session-name-input');
const startSessionBtn = document.getElementById('start-session-btn');
const leaveBtn = document.getElementById('leave-btn');
const toastEl = document.getElementById('toast');

// Main tab elements
const timerTab = document.getElementById('timer-tab');
const tasksTab = document.getElementById('tasks-tab');
const teamTab = document.getElementById('team-tab');
const calendarTab = document.getElementById('calendar-tab');
const timerMainView = document.getElementById('timer-main-view');
const tasksMainView = document.getElementById('tasks-main-view');
const teamMainView = document.getElementById('team-main-view');
const calendarMainView = document.getElementById('calendar-main-view');

// --- Auto-populate user name from localStorage ---
function autoPopulateUserName() {
    try {
        const storedUserName = localStorage.getItem('pompom_username');
        if (storedUserName && userNameSetupInput && !userNameSetupInput.value) {
            userNameSetupInput.value = storedUserName;
        }
    } catch (e) {
        // Ignore localStorage errors in some environments
    }
}

// --- Auto-populate team name from localStorage ---
function autoPopulateTeamName() {
    try {
        const storedTeamName = localStorage.getItem('pompom_team_name');
        if (storedTeamName && sessionNameInput && !sessionNameInput.value) {
            sessionNameInput.value = storedTeamName;
        }
    } catch (e) {
        // Ignore localStorage errors in some environments
    }
}

// --- UI Logic ---
function showToast(message) {
    if (toastEl) {
        toastEl.textContent = message;
        toastEl.classList.remove('hidden');
        setTimeout(() => {
            toastEl.classList.add('hidden');
        }, 3000);
    }
}

function switchMainView(view) {
    // Hide all main views
    timerMainView?.classList.add('hidden');
    tasksMainView?.classList.add('hidden');
    teamMainView?.classList.add('hidden');
    calendarMainView?.classList.add('hidden');

    // Remove active class from all tabs
    [timerTab, tasksTab, teamTab, calendarTab].forEach(tab => {
        if (tab) {
            tab.classList.remove('border-teal-400', 'text-white');
            tab.classList.add('border-transparent', 'text-gray-400');
        }
    });

    // Show selected view and activate tab
    let activeTab, activeView;
    switch(view) {
        case 'timer':
            activeTab = timerTab;
            activeView = timerMainView;
            break;
        case 'tasks':
            activeTab = tasksTab;
            activeView = tasksMainView;
            break;
        case 'team':
            activeTab = teamTab;
            activeView = teamMainView;
            break;
        case 'calendar':
            activeTab = calendarTab;
            activeView = calendarMainView;
            break;
    }

    if (activeTab && activeView) {
        activeView.classList.remove('hidden');
        activeTab.classList.remove('border-transparent', 'text-gray-400');
        activeTab.classList.add('border-teal-400', 'text-white');
    }
}

// --- Event Listeners ---
function initializeMainEventListeners() {
    // Shuffle user name button
    shuffleUserNameBtn?.addEventListener('click', () => {
        if (typeof generateRandomUserName === 'function') {
            userNameSetupInput.value = generateRandomUserName();
        }
    });

    // Start session button
    startSessionBtn?.addEventListener('click', () => {
        const name = userNameSetupInput?.value.trim();
        const team = sessionNameInput?.value.trim();
        if (!name) {
            showToast('Please enter your name');
            return;
        }
        userName = name;
        sessionId = team || (typeof generateRandomTeamName === 'function' ? generateRandomTeamName() : 'Team');
        
        // Save to localStorage for auto-population
        try {
            localStorage.setItem('pompom_username', userName);
            localStorage.setItem('pompom_team_name', sessionId);
        } catch (e) {
            // Ignore localStorage errors in some environments
        }
        
        welcomePage?.classList.add('hidden');
        sessionPage?.classList.remove('hidden');
        if (sessionHeaderName) {
            sessionHeaderName.textContent = `Team: ${sessionId}`;
        }
    });

    // Leave session button
    leaveBtn?.addEventListener('click', () => {
        // Reset session state
        sessionId = '';
        userName = '';
        tasks = [];

        // Stop any running timer
        if (typeof resetTimer === 'function') {
            resetTimer();
        }

        // Hide session page and show welcome page
        sessionPage?.classList.add('hidden');
        welcomePage?.classList.remove('hidden');

        // Reset form
        if (userNameSetupInput && typeof generateRandomUserName === 'function') {
            userNameSetupInput.value = generateRandomUserName();
        }
        if (sessionNameInput) {
            sessionNameInput.value = '';
        }

        showToast('Left the session');
    });

    // Main tab event listeners
    timerTab?.addEventListener('click', () => switchMainView('timer'));
    tasksTab?.addEventListener('click', () => switchMainView('tasks'));
    teamTab?.addEventListener('click', () => switchMainView('team'));
    calendarTab?.addEventListener('click', () => switchMainView('calendar'));
}

// --- Initialization ---
function initializeMain() {
    // Auto-populate forms
    autoPopulateUserName();
    autoPopulateTeamName();
    
    // Initialize event listeners
    initializeMainEventListeners();
    
    // Set default view
    switchMainView('timer');
}

// Call auto-population when page loads
if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('DOMContentLoaded', initializeMain);
} else {
    // Fallback for environments without addEventListener
    setTimeout(initializeMain, 100);
}

// Export functions for use by other modules
window.PomPomMain = {
    showToast,
    switchMainView,
    tasks,
    sessionId,
    userName
};
