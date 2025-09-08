/**
 * View management for sidebar and main content areas
 */

// --- DOM Elements ---
const participantsView = document.getElementById('participants-view');
const tasksView = document.getElementById('tasks-view');
const plannerView = document.getElementById('planner-view');
const viewButtons = document.querySelectorAll('.view-btn');

// --- View Functions ---
function switchView(view) {
    // Hide all views
    [participantsView, tasksView, plannerView].forEach(v => {
        if (v) v.classList.add('hidden');
    });
    
    // Remove active class from all buttons
    viewButtons.forEach(b => {
        if (b) b.classList.remove('active');
    });

    // Show selected view and activate button
    const targetButton = document.querySelector(`[data-view="${view}"]`);
    const targetView = document.getElementById(`${view}-view`);
    
    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    if (targetView) {
        targetView.classList.remove('hidden');
    }

    // Load planner content if needed
    if (view === 'planner' && plannerView && !plannerView.dataset.loaded) {
        loadPlannerContent();
    }
}

function loadPlannerContent() {
    if (!plannerView) return;
    
    fetch('src/daily-planner.html')
        .then(response => response.text())
        .then(html => {
            const container = document.getElementById('calendar-container');
            if (container) {
                // Parse the fetched HTML so we can execute any <script> tags it contains
                const tmp = document.createElement('div');
                tmp.innerHTML = html;
                const scripts = Array.from(tmp.querySelectorAll('script'));
                
                // Remove scripts from the fragment before inserting HTML
                scripts.forEach(s => s.parentNode && s.parentNode.removeChild(s));
                
                // Insert the HTML content
                container.innerHTML = '';
                while (tmp.firstChild) container.appendChild(tmp.firstChild);
                
                // Execute scripts by re-inserting them so the browser runs them
                scripts.forEach(oldScript => {
                    const newScript = document.createElement('script');
                    if (oldScript.src) {
                        newScript.src = oldScript.src;
                    } else {
                        newScript.textContent = oldScript.textContent || '';
                    }
                    container.appendChild(newScript);
                });
                
                // Trigger DOMContentLoaded for any listeners defined inside the injected HTML
                try {
                    const evt = new Event('DOMContentLoaded');
                    document.dispatchEvent(evt);
                } catch (e) {
                    console.warn('Could not dispatch DOMContentLoaded for calendar', e);
                }
            }
            plannerView.dataset.loaded = true;
        })
        .catch(error => {
            console.error('Failed to load calendar:', error);
            const container = document.getElementById('calendar-container');
            if (container) {
                container.innerHTML = '<p class="text-red-400">Could not load planner. Please try again later.</p>';
            }
        });
}

// --- Event Listeners ---
function initializeViewsEventListeners() {
    // Sidebar view buttons
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            if (view) {
                switchView(view);
            }
        });
    });
}

// --- Initialization ---
function initializeViews() {
    initializeViewsEventListeners();
    
    // Set default view
    switchView('participants');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeViews);
} else {
    initializeViews();
}

// Export functions for use by other modules
window.PomPomViews = {
    switchView,
    loadPlannerContent
};
