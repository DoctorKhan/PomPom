/**
 * AI integration and smart actions functionality
 */

(function() {

// --- DOM Elements ---
const smartActionsBtn = document.getElementById('smart-actions-btn');
const smartActionsMenu = document.getElementById('smart-actions-menu');
const refineTaskAction = document.getElementById('refine-task-action');
const breakdownTaskAction = document.getElementById('breakdown-task-action');
const summarizeChatAction = document.getElementById('summarize-chat-action');
const icebreakerAction = document.getElementById('icebreaker-action');
const breakdownTaskBtn = document.getElementById('breakdown-task-btn');

// AI Agent elements
const aiAgentBtn = document.getElementById('ai-agent-btn');
const aiAgentPopup = document.getElementById('ai-agent-popup');
const aiAgentInput = document.getElementById('ai-agent-input');
const aiAgentSend = document.getElementById('ai-agent-send');
const aiAgentMessages = document.getElementById('ai-agent-messages');

// Chat elements
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');

// --- Groq API Helper (via backend proxy) ---
async function callGroqAPI(prompt) {
    try {
        const body = {
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: 'Respond ONLY with compact JSON. No prose.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 200
        };
        const response = await fetch('/api/groq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error(`Groq API error ${response.status}`);
        const data = await response.json();
        return data?.choices?.[0]?.message?.content || '';
    } catch (error) {
        console.error('Groq call failed:', error);
        if (window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('AI is unavailable right now. Please try again later.');
        }
        return null;
    }
}

/**
 * Robustly extracts a JSON object from a string that may contain Markdown fences.
 */
function extractJSON(text) {
    if (!text) return null;
    // Match the JSON content inside the Markdown code block
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (e) {
            console.error("Failed to parse extracted JSON:", e);
            return null;
        }
    }
    // If no Markdown block, try parsing the whole string
    try {
        return JSON.parse(text);
    } catch (e) {
        // Not a raw JSON string
    }
    return null;
}

// --- Smart Actions Functions ---
function toggleSmartActionsMenu() {
    if (smartActionsMenu) {
        smartActionsMenu.classList.toggle('hidden');
    }
}

function hideSmartActionsMenu() {
    if (smartActionsMenu) {
        smartActionsMenu.classList.add('hidden');
    }
}

async function refineCurrentTask() {
    const currentTask = window.PomPomTasks?.getCurrentTask();
    if (!currentTask) {
        if (window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('No current task to refine');
        }
        return;
    }

    if (refineTaskAction) {
        refineTaskAction.innerHTML = '<div class="spinner w-3 h-3"></div> Refining...';
        refineTaskAction.disabled = true;
    }

    const prompt = `Please refine and improve this task description to be more specific, actionable, and clear. Keep it concise but make it better: "${currentTask.text}"`;
    const refinedTask = await callGroqAPI(prompt);
    
    if (refinedTask) {
        currentTask.text = refinedTask;
        if (window.PomPomTasks?.updateCurrentTaskDisplay) {
            window.PomPomTasks.updateCurrentTaskDisplay();
        }
        if (window.PomPomTasks?.renderTasks) {
            window.PomPomTasks.renderTasks();
        }
        if (window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('✨ Task refined!');
        }
    }

    if (refineTaskAction) {
        refineTaskAction.innerHTML = '✨ Refine Current Task';
        refineTaskAction.disabled = false;
    }
    hideSmartActionsMenu();
}

async function breakdownCurrentTask() {
    const currentTask = window.PomPomTasks?.getCurrentTask();
    if (!currentTask) {
        if (window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('No current task to break down');
        }
        return;
    }

    if (breakdownTaskAction) {
        breakdownTaskAction.innerHTML = '<div class="spinner w-3 h-3"></div> Breaking down...';
        breakdownTaskAction.disabled = true;
    }

    const prompt = `Break down this task into 3-5 smaller, actionable sub-tasks. Present them as a simple list: "${currentTask.text}"`;
    const breakdown = await callGroqAPI(prompt);
    
    if (breakdown) {
        const tasks = window.PomPomMain?.tasks || [];
        // Remove the original task
        const index = tasks.indexOf(currentTask);
        tasks.splice(index, 1);

        // Add the breakdown as separate tasks
        const subTasks = breakdown.split('\n').filter(task => task.trim() && task.includes('-') || task.match(/^\d+\./));
        subTasks.forEach(subTask => {
            const cleanTask = subTask.replace(/^[-*•\d.)\s]+/, '').trim();
            if (cleanTask) {
                tasks.push({ text: cleanTask, completed: false });
            }
        });

        if (window.PomPomTasks?.updateCurrentTaskDisplay) {
            window.PomPomTasks.updateCurrentTaskDisplay();
        }
        if (window.PomPomTasks?.renderTasks) {
            window.PomPomTasks.renderTasks();
        }
        if (window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('📋 Task broken down!');
        }
    }

    if (breakdownTaskAction) {
        breakdownTaskAction.innerHTML = '📋 Break Down Task';
        breakdownTaskAction.disabled = false;
    }
    hideSmartActionsMenu();
}

async function summarizeChatFromActions() {
    if (!chatMessages) return;
    
    const messages = Array.from(chatMessages.children).map(el => el.textContent).join('\n');
    if (messages.length < 50) {
        if (window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('Not enough chat history to summarize');
        }
        return;
    }

    if (summarizeChatAction) {
        summarizeChatAction.innerHTML = '<div class="spinner w-3 h-3"></div> Summarizing...';
        summarizeChatAction.disabled = true;
    }

    const prompt = `Summarize the key decisions, action items, and overall sentiment of the following chat conversation. Present it in a few bullet points.\n\nChat History:\n${messages}`;
    const summary = await callGroqAPI(prompt);
    
    if (summary) {
        const summaryEl = document.createElement('div');
        summaryEl.className = 'p-2 bg-teal-900/50 rounded-lg text-xs italic mt-2';
        summaryEl.textContent = `✨ Summary: ${summary}`;
        chatMessages.appendChild(summaryEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        if (window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('📝 Chat summarized!');
        }
    }

    if (summarizeChatAction) {
        summarizeChatAction.innerHTML = '📝 Summarize Chat';
        summarizeChatAction.disabled = false;
    }
    hideSmartActionsMenu();
}

async function generateIcebreakerFromActions() {
    if (icebreakerAction) {
        icebreakerAction.innerHTML = '<div class="spinner w-3 h-3"></div> Generating...';
        icebreakerAction.disabled = true;
    }

    const prompt = 'Generate a fun, safe-for-work icebreaker question for a remote team to discuss.';
    const question = await callGroqAPI(prompt);
    
    if (question && chatInput) {
        chatInput.value = question.replace(/"/g, '');
        if (window.PomPomMain?.showToast) {
            window.PomPomMain.showToast('🧊 Icebreaker generated!');
        }
    }

    if (icebreakerAction) {
        icebreakerAction.innerHTML = '🧊 Generate Icebreaker';
        icebreakerAction.disabled = false;
    }
    hideSmartActionsMenu();
}

// --- AI Agent Functions ---
// Simple message helper for agent panel
function aiAgentAppend(role, text) {
    if (!aiAgentMessages) return;
    
    const row = document.createElement('div');
    row.className = role === 'user' ? 'text-right' : 'text-left';
    const bubble = document.createElement('div');
    bubble.className = 'inline-block px-3 py-2 rounded-lg ' + (role === 'user' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white');
    bubble.textContent = text;
    row.appendChild(bubble);
    aiAgentMessages.appendChild(row);
    aiAgentMessages.scrollTop = aiAgentMessages.scrollHeight;
}

// Agent command executor: parse intent then act on UI
async function aiAgentHandle(inputText) {
    aiAgentAppend('user', inputText);
    // Ask Groq to classify intent to minimal JSON
    const prompt = `You are a UI assistant. Given a natural language instruction, output ONLY compact JSON with fields: action, text, index, mode. Actions: add_task, start_timer, pause_timer, reset_timer, reorder_tasks, delete_task, suggest_task. index is zero-based for reorder/delete; mode is one of pomodoro25, shortBreak, longBreak for switching modes. Example: {"action":"add_task","text":"Implement login"}. Instruction: ${inputText}`;
    let content = await callGroqAPI(prompt);
    const cmd = extractJSON(content) || {};
    let resultMsg = '';
    
    try {
        const tasks = window.PomPomMain?.tasks || [];
        
        switch ((cmd.action || '').toLowerCase()) {
            case 'add_task': {
                const t = (cmd.text || '').trim();
                if (t) { 
                    tasks.unshift({ text: t, completed: false }); 
                    if (window.PomPomTasks?.renderTasks) {
                        window.PomPomTasks.renderTasks();
                    }
                }
                resultMsg = t ? `Added task: ${t}` : 'No task text provided';
                break;
            }
            case 'suggest_task': {
                const idea = (cmd.text || '').trim() || (aiAgentInput?.value || '').trim();
                if (idea) {
                    const result = await callGroqAPI(`Break this into 2-4 subtasks as a JSON array of short strings: ${idea}`);
                    const arr = extractJSON(result);
                    if (Array.isArray(arr) && arr.length) {
                        arr.reverse().forEach(txt => tasks.unshift({ text: String(txt), completed: false }));
                        if (window.PomPomTasks?.renderTasks) {
                            window.PomPomTasks.renderTasks();
                        }
                        resultMsg = `Added ${arr.length} subtasks.`;
                    } else {
                        tasks.unshift({ text: idea, completed: false });
                        if (window.PomPomTasks?.renderTasks) {
                            window.PomPomTasks.renderTasks();
                        }
                        resultMsg = 'Added as a single task.';
                    }
                } else resultMsg = 'No idea provided';
                break;
            }
            case 'start_timer': 
                if (typeof startTimer === 'function') startTimer(); 
                resultMsg = 'Timer started'; 
                break;
            case 'pause_timer': 
                if (typeof pauseTimer === 'function') pauseTimer(); 
                resultMsg = 'Timer paused'; 
                break;
            case 'reset_timer': 
                if (typeof resetTimer === 'function') resetTimer(); 
                resultMsg = 'Timer reset'; 
                break;
            case 'delete_task': {
                const i = Number(cmd.index);
                if (Number.isInteger(i) && i>=0 && i<tasks.length) {
                    const [del] = tasks.splice(i,1);
                    if (window.PomPomTasks?.renderTasks) {
                        window.PomPomTasks.renderTasks();
                    }
                    resultMsg = `Deleted task: ${del.text}`;
                } else resultMsg = 'Invalid index';
                break;
            }
            case 'set_mode': {
                const m = String(cmd.mode||'');
                if (['pomodoro25','shortBreak','longBreak'].includes(m) && typeof setMode === 'function') { 
                    setMode(m); 
                    resultMsg = `Mode set to ${m}`; 
                }
                else resultMsg = 'Invalid mode';
                break;
            }
            default:
                // Unknown action: treat as a normal chat dialog.
                const reply = await callGroqAPI(`You are a helpful teammate. Respond conversationally to: ${JSON.stringify(inputText)}`);
                resultMsg = reply || '…';
        }
    } catch (e) {
        console.error('Agent error', e);
        resultMsg = 'Action failed.';
    }
    aiAgentAppend('assistant', resultMsg);
}

// --- Event Listeners ---
function initializeAIEventListeners() {
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (smartActionsBtn && smartActionsMenu && 
            !smartActionsBtn.contains(e.target) && !smartActionsMenu.contains(e.target)) {
            hideSmartActionsMenu();
        }
    });

    // Smart Actions event listeners
    if (smartActionsBtn) {
        smartActionsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSmartActionsMenu();
        });
    }

    if (refineTaskAction) {
        refineTaskAction.addEventListener('click', refineCurrentTask);
    }

    if (breakdownTaskAction) {
        breakdownTaskAction.addEventListener('click', breakdownCurrentTask);
    }

    if (summarizeChatAction) {
        summarizeChatAction.addEventListener('click', summarizeChatFromActions);
    }

    if (icebreakerAction) {
        icebreakerAction.addEventListener('click', generateIcebreakerFromActions);
    }

    // AI Agent toggle
    if (aiAgentBtn) {
        aiAgentBtn.addEventListener('click', () => {
            if (aiAgentPopup) {
                aiAgentPopup.classList.toggle('hidden');
            }
        });
    }

    if (aiAgentSend) {
        aiAgentSend.addEventListener('click', async () => {
            const txt = (aiAgentInput?.value || '').trim();
            if (!txt) return;
            if (aiAgentInput) aiAgentInput.value = '';
            await aiAgentHandle(txt);
        });
    }

    if (aiAgentInput) {
        aiAgentInput.addEventListener('keypress', async (e) => { 
            if (e.key==='Enter') { 
                e.preventDefault(); 
                if (aiAgentSend) aiAgentSend.click(); 
            }
        });
    }

    // Breakdown task button (in tasks view)
    if (breakdownTaskBtn) {
        breakdownTaskBtn.addEventListener('click', async () => {
            const tasks = window.PomPomMain?.tasks || [];
            const topTask = tasks.find(t => !t.completed);
            if (!topTask) {
                if (window.PomPomMain?.showToast) {
                    window.PomPomMain.showToast("No task to break down.");
                }
                return;
            }

            breakdownTaskBtn.innerHTML = `<div class="spinner"></div>`;
            breakdownTaskBtn.disabled = true;

            const prompt = `Based on the user's task "${topTask.text}", break it down into a JSON array of 2-4 specific, actionable sub-tasks. The user is in a team setting. The JSON should be an array of strings. Example: for "build login page", return ["Design UI in Figma", "Develop HTML/CSS structure", "Implement form validation", "Connect to authentication API"]. Return ONLY the JSON array.`;
            const result = await callGroqAPI(prompt);
            const subtasks = extractJSON(result);

            if (subtasks && Array.isArray(subtasks)) {
                const topTaskIndex = tasks.findIndex(t => t === topTask);
                if (topTaskIndex > -1) {
                    const newTasks = subtasks.map(t => ({ text: t, completed: false }));
                    tasks.splice(topTaskIndex, 1, ...newTasks);
                    if (window.PomPomMain?.showToast) {
                        window.PomPomMain.showToast("Task broken down by AI.");
                    }
                }
            } else {
                if (window.PomPomMain?.showToast) {
                    window.PomPomMain.showToast("AI couldn't break down the task.");
                }
            }

            if (window.PomPomTasks?.renderTasks) {
                window.PomPomTasks.renderTasks();
            }
            breakdownTaskBtn.innerHTML = `✨ Break down`;
            breakdownTaskBtn.disabled = false;
        });
    }
}

// --- Initialization ---
function initializeAI() {
    initializeAIEventListeners();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAI);
} else {
    initializeAI();
}

// Export functions for use by other modules
window.PomPomAI = {
    callGroqAPI,
    extractJSON,
    refineCurrentTask,
    breakdownCurrentTask,
    summarizeChatFromActions,
    generateIcebreakerFromActions,
    aiAgentHandle
};

})();
