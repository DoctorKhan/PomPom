// Firebase Firestore integration for shared team tasks
let db;
let eventsUnsub = null;

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

window.addEventListener('DOMContentLoaded', () => {
  // ...existing code...
  initFirebase();
  // ...existing code...
  function showMainScreen() {
    // ...existing code...
    if (db && team) subscribeTeamEvents(team);
    // ...existing code...
  }
  // ...existing code...
});