// Firebase Firestore integration for shared team tasks
let db;
let eventsUnsub = null;

// Firestore timer sync
let timerUnsub = null;
let timerState = { running: false, timeLeft: 1500, lastUpdate: Date.now() };

function initFirebase() {
  if (window.firebase && window.firebase.firestore) {
    db = window.firebase.firestore();
  } else if (window.firebase && window.firebase.initializeApp) {
    window.firebase.initializeApp(window.firebaseConfig);
    db = window.firebase.firestore();
  } else {
    console.warn('Firebase not loaded');
  }
}

function subscribeTeamEvents(team) {
  if (!db || !team) return;
  if (eventsUnsub) eventsUnsub();
  eventsUnsub = db.collection('teams').doc(team).collection('events')
    .orderBy('time')
    .onSnapshot(snapshot => {
      events.length = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        events.push({
          id: doc.id,
          type: data.type,
          time: new Date(data.time),
          label: data.label,
          triggered: data.triggered || false
        });
      });
      renderEvents();
    });
}

function addEvent(type, time, label) {
  // Prevent duplicates: same label and time
  const duplicate = events.some(e => e.label === label && e.time.toISOString() === new Date(time).toISOString());
  if (duplicate) {
    showToast('Duplicate task not added!');
    return;
  }
  if (db && team) {
    db.collection('teams').doc(team).collection('events').add({
      type,
      time: new Date(time).toISOString(),
      label,
      triggered: false
    });
  } else {
    events.push({ type, time: new Date(time), label });
    renderEvents();
  }
  showToast('Event added!');
}

function subscribeTeamTimer(team) {
  if (!db || !team) return;
  if (timerUnsub) timerUnsub();
  timerUnsub = db.collection('teams').doc(team).onSnapshot(doc => {
    const data = doc.data();
    if (data && data.timer) {
      timerState = data.timer;
      updateTimerUI();
    }
  });
}

function setTeamTimerState(state) {
  if (db && team) {
    db.collection('teams').doc(team).set({ timer: state }, { merge: true });
  }
}

function updateTimerUI() {
  const timerDisplay = document.getElementById('timer-display');
  if (timerDisplay) {
    const min = Math.floor(timerState.timeLeft / 60);
    const sec = timerState.timeLeft % 60;
    timerDisplay.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
  }
}

// Session goals per user
function setUserGoal(goal) {
  if (db && team && username) {
    db.collection('teams').doc(team).collection('goals').doc(username).set({ goal });
  }
}

function subscribeTeamGoals(team) {
  if (!db || !team) return;
  db.collection('teams').doc(team).collection('goals').onSnapshot(snapshot => {
    const goals = [];
    snapshot.forEach(doc => {
      goals.push({ user: doc.id, goal: doc.data().goal });
    });
    renderGoals(goals);
  });
}

function renderGoals(goals) {
  let goalsList = document.getElementById('goals-list');
  if (!goalsList) {
    goalsList = document.createElement('ul');
    goalsList.id = 'goals-list';
    goalsList.style.marginTop = '1em';
    document.getElementById('main-schedule').appendChild(goalsList);
  }
  goalsList.innerHTML = '';
  goals.forEach(g => {
    const li = document.createElement('li');
    li.textContent = `${g.user}: ${g.goal}`;
    goalsList.appendChild(li);
  });
}

function renderEvents() {
  const list = document.getElementById('event-list');
  list.innerHTML = '';
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = '1em';
  list.style.maxHeight = '300px';
  list.style.overflowY = 'auto';
  if (events.length === 0) {
    const emptyMsg = document.createElement('li');
    emptyMsg.textContent = 'No events scheduled yet.';
    emptyMsg.style.color = '#888';
    emptyMsg.style.padding = '1em';
    emptyMsg.style.background = '#f5faff';
    emptyMsg.style.borderRadius = '12px';
    emptyMsg.style.textAlign = 'center';
    list.appendChild(emptyMsg);
    return;
  }
  events.forEach((event, idx) => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.justifyContent = 'space-between';
    li.style.background = '#fafdff';
    li.style.borderRadius = '12px';
    li.style.boxShadow = '0 2px 8px rgba(56,189,248,0.08)';
    li.style.padding = '1em';
    li.style.fontSize = '1.15em';
    li.style.border = '1px solid #e0f7fa';
    li.style.margin = '0';
    // Task text
    const text = document.createElement('span');
    text.textContent = `${event.label}`;
    text.style.flex = '1';
    text.style.color = '#256fa1';
    text.style.fontWeight = '500';
    // Status indicator (checkbox)
    const status = document.createElement('input');
    status.type = 'checkbox';
    status.style.width = '22px';
    status.style.height = '22px';
    status.style.marginLeft = '1em';
    status.checked = !!event.completed;
    status.onclick = () => {
      event.completed = status.checked;
      li.style.opacity = event.completed ? '0.5' : '1';
    };
    li.appendChild(text);
    li.appendChild(status);
    list.appendChild(li);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  // ...existing code...
  initFirebase();
  // ...existing code...
  function showMainScreen() {
    // ...existing code...
    if (db && team) {
      subscribeTeamEvents(team);
      subscribeTeamTimer(team);
      subscribeTeamGoals(team);
    }
    // Timer controls
    const startBtn = document.querySelector('#timer-card .btn-primary');
    const pauseBtn = document.querySelector('#timer-card .btn-secondary');
    if (startBtn) {
      startBtn.onclick = () => {
        timerState.running = true;
        timerState.lastUpdate = Date.now();
        setTeamTimerState(timerState);
      };
    }
    if (pauseBtn) {
      pauseBtn.onclick = () => {
        timerState.running = false;
        setTeamTimerState(timerState);
      };
    }
    // Session goal input
    let goalInput = document.getElementById('session-goal-input');
    if (!goalInput) {
      goalInput = document.createElement('input');
      goalInput.id = 'session-goal-input';
      goalInput.type = 'text';
      goalInput.placeholder = 'Your session goal';
      goalInput.style.marginTop = '1em';
      goalInput.style.padding = '0.7em';
      goalInput.style.borderRadius = '8px';
      goalInput.style.border = '1px solid #b3e0ff';
      document.getElementById('main-schedule').appendChild(goalInput);
    }
    goalInput.onchange = () => {
      setUserGoal(goalInput.value);
    };
  }
  // ...existing code...
});