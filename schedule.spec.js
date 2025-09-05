// schedule.spec.js
// Unit tests for team-synced timer and individual session goals

const firebase = require('firebase-mock');
const { JSDOM } = require('jsdom');

// Mock Firestore
const mockFirestore = new firebase.MockFirestore();
const mockSdk = new firebase.MockFirebaseSdk(
  null,
  () => mockFirestore,
  null,
  null,
  null
);

// Mock DOM
const dom = new JSDOM(`<!DOCTYPE html><body><div id="main-schedule"></div><div id="timer-display"></div></body>`);
global.document = dom.window.document;
global.window = dom.window;

// Import schedule.js logic (assume refactored for testability)
// For real tests, export functions from schedule.js and import here
// For this mock, we'll define simplified versions

let events = [];
let timerState = { running: false, timeLeft: 1500, lastUpdate: Date.now() };
let goals = {};

function addEvent(type, time, label) {
  events.push({ type, time: new Date(time), label });
}

function setTeamTimerState(state) {
  timerState = { ...state };
}

function setUserGoal(user, goal) {
  goals[user] = goal;
}

function renderGoals(goalsObj) {
  const goalsList = document.createElement('ul');
  Object.entries(goalsObj).forEach(([user, goal]) => {
    const li = document.createElement('li');
    li.textContent = `${user}: ${goal}`;
    goalsList.appendChild(li);
  });
  return goalsList;
}

// Tests

describe('Team Schedule', () => {
  beforeEach(() => {
    events = [];
    timerState = { running: false, timeLeft: 1500, lastUpdate: Date.now() };
    goals = {};
  });

  test('addEvent adds an event', () => {
    addEvent('meeting', '2025-09-01T10:00', 'Team Sync');
    expect(events.length).toBe(1);
    expect(events[0].type).toBe('meeting');
    expect(events[0].label).toBe('Team Sync');
  });

  test('setTeamTimerState updates timer for team', () => {
    setTeamTimerState({ running: true, timeLeft: 1200, lastUpdate: Date.now() });
    expect(timerState.running).toBe(true);
    expect(timerState.timeLeft).toBe(1200);
  });

  test('setUserGoal sets individual goal', () => {
    setUserGoal('alice', 'Finish report');
    setUserGoal('bob', 'Review PRs');
    expect(goals['alice']).toBe('Finish report');
    expect(goals['bob']).toBe('Review PRs');
  });

  test('renderGoals displays all user goals', () => {
    setUserGoal('alice', 'Finish report');
    setUserGoal('bob', 'Review PRs');
    const list = renderGoals(goals);
    expect(list.children.length).toBe(2);
    expect(list.textContent).toContain('alice: Finish report');
    expect(list.textContent).toContain('bob: Review PRs');
  });
});
