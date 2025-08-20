/**
 * PomPom Basic Functionality Tests
 * Run with: node test.js or npm test
 */

// Mock DOM environment for Node.js testing
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Test results tracking
let testResults = [];
let currentTestSuite = '';

function describe(suiteName, testFn) {
    currentTestSuite = suiteName;
    console.log(`\n📋 ${suiteName}`);
    testFn();
}

function test(testName, testFn) {
    try {
        testFn();
        testResults.push({ suite: currentTestSuite, name: testName, passed: true });
        console.log(`  ✅ ${testName}`);
    } catch (error) {
        testResults.push({ suite: currentTestSuite, name: testName, passed: false, error: error.message });
        console.log(`  ❌ ${testName}: ${error.message}`);
    }
}

function expect(actual) {
    return {
        toBe: (expected) => {
            if (actual !== expected) {
                throw new Error(`Expected ${expected}, got ${actual}`);
            }
        },
        toContain: (expected) => {
            if (!actual.includes(expected)) {
                throw new Error(`Expected "${actual}" to contain "${expected}"`);
            }
        },
        toBeTruthy: () => {
            if (!actual) {
                throw new Error(`Expected ${actual} to be truthy`);
            }
        },
        toBeFalsy: () => {
            if (actual) {
                throw new Error(`Expected ${actual} to be falsy`);
            }
        },
        toBeGreaterThan: (expected) => {
            if (actual <= expected) {
                throw new Error(`Expected ${actual} to be greater than ${expected}`);
            }
        },
        toMatch: (regex) => {
            if (!regex.test(actual)) {
                throw new Error(`Expected "${actual}" to match ${regex}`);
            }
        }
    };
}

// Load and parse the HTML file
function loadPomPomHTML() {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    const dom = new JSDOM(htmlContent, {
        runScripts: "dangerously",
        resources: "usable",
        pretendToBeVisual: true
    });
    
    return dom;
}

// Extract JavaScript functions from HTML
function extractJavaScriptFunctions(dom) {
    const scripts = dom.window.document.querySelectorAll('script');
    let jsContent = '';
    
    scripts.forEach(script => {
        if (!script.src) { // Only inline scripts
            jsContent += script.textContent + '\n';
        }
    });
    
    // Execute the JavaScript in the DOM context
    try {
        dom.window.eval(jsContent);
    } catch (error) {
        console.warn('Warning: Could not execute all JavaScript:', error.message);
    }
    
    return dom.window;
}

// Test suites
describe('Random Name Generation', () => {
    const dom = loadPomPomHTML();
    const window = extractJavaScriptFunctions(dom);
    
    test('generateRandomTeamName should return a string', () => {
        const teamName = window.generateRandomTeamName();
        expect(typeof teamName).toBe('string');
        expect(teamName.length).toBeGreaterThan(0);
    });
    
    test('generateRandomTeamName should contain a hyphen', () => {
        const teamName = window.generateRandomTeamName();
        expect(teamName).toContain('-');
    });
    
    test('generateRandomTeamName should generate different names', () => {
        const name1 = window.generateRandomTeamName();
        const name2 = window.generateRandomTeamName();
        // Note: There's a small chance they could be the same, but very unlikely
        expect(name1 !== name2).toBeTruthy();
    });
    
    test('generateRandomUserName should return a string', () => {
        const userName = window.generateRandomUserName();
        expect(typeof userName).toBe('string');
        expect(userName.length).toBeGreaterThan(0);
    });
    
    test('generateRandomUserName should generate different names', () => {
        const name1 = window.generateRandomUserName();
        const name2 = window.generateRandomUserName();
        expect(name1 !== name2).toBeTruthy();
    });
});

describe('DOM Elements', () => {
    const dom = loadPomPomHTML();
    const document = dom.window.document;
    
    test('landing page should have session name input', () => {
        const sessionInput = document.querySelector('#session-name-input');
        expect(sessionInput).toBeTruthy();
        expect(sessionInput.placeholder.length).toBeGreaterThan(0);
    });
    
    test('landing page should have continue button', () => {
        const continueBtn = document.querySelector('#create-session-btn');
        expect(continueBtn).toBeTruthy();
        expect(continueBtn.textContent).toContain('Continue');
    });
    
    test('name input page should have user name input', () => {
        const userNameInput = document.querySelector('#user-name-setup-input');
        expect(userNameInput).toBeTruthy();
    });
    
    test('name input page should have shuffle button', () => {
        const shuffleBtn = document.querySelector('#shuffle-user-name-btn');
        expect(shuffleBtn).toBeTruthy();
        expect(shuffleBtn.textContent).toContain('🎲');
    });
    
    test('name input page should have start session button', () => {
        const startBtn = document.querySelector('#start-session-btn');
        expect(startBtn).toBeTruthy();
        expect(startBtn.textContent).toContain('Start');
    });
    
    test('session page should have timer display', () => {
        const timerDisplay = document.querySelector('#timer-display');
        expect(timerDisplay).toBeTruthy();
        expect(timerDisplay.textContent).toContain('25:00');
    });
    
    test('session page should have start/pause button', () => {
        const startPauseBtn = document.querySelector('#start-pause-btn');
        expect(startPauseBtn).toBeTruthy();
    });
    
    test('session page should have reset button', () => {
        const resetBtn = document.querySelector('#reset-btn');
        expect(resetBtn).toBeTruthy();
    });
});

describe('Utility Functions', () => {
    const dom = loadPomPomHTML();
    const window = extractJavaScriptFunctions(dom);
    
    test('toSlug should convert text to URL-friendly format', () => {
        if (typeof window.toSlug === 'function') {
            expect(window.toSlug('Hello World')).toBe('hello-world');
            expect(window.toSlug('Test Team Name')).toBe('test-team-name');
            expect(window.toSlug('Special!@#$%Characters')).toMatch(/^[a-z0-9-]+$/);
        }
    });
    
    test('formatTime should format seconds correctly', () => {
        if (typeof window.formatTime === 'function') {
            expect(window.formatTime(1500)).toBe('25:00'); // 25 minutes
            expect(window.formatTime(300)).toBe('5:00');   // 5 minutes
            expect(window.formatTime(65)).toBe('1:05');    // 1 minute 5 seconds
        }
    });
});

describe('Page Navigation', () => {
    const dom = loadPomPomHTML();
    const document = dom.window.document;
    
    test('should have all required page containers', () => {
        const landingPage = document.querySelector('#landing-page');
        const nameInputPage = document.querySelector('#name-input-page');
        const sessionPage = document.querySelector('#session-page');
        
        expect(landingPage).toBeTruthy();
        expect(nameInputPage).toBeTruthy();
        expect(sessionPage).toBeTruthy();
    });
    
    test('initially only landing page should be visible', () => {
        const landingPage = document.querySelector('#landing-page');
        const nameInputPage = document.querySelector('#name-input-page');
        const sessionPage = document.querySelector('#session-page');
        
        expect(landingPage.classList.contains('hidden')).toBeFalsy();
        expect(nameInputPage.classList.contains('hidden')).toBeTruthy();
        expect(sessionPage.classList.contains('hidden')).toBeTruthy();
    });
});

describe('Timer Modes', () => {
    const dom = loadPomPomHTML();
    const document = dom.window.document;
    
    test('should have mode control buttons', () => {
        const pomodoro25 = document.querySelector('[data-mode="pomodoro25"]');
        const pomodoro30 = document.querySelector('[data-mode="pomodoro30"]');
        const shortBreak = document.querySelector('[data-mode="shortBreak"]');
        const longBreak = document.querySelector('[data-mode="longBreak"]');
        
        expect(pomodoro25).toBeTruthy();
        expect(pomodoro30).toBeTruthy();
        expect(shortBreak).toBeTruthy();
        expect(longBreak).toBeTruthy();
    });
});

// Run all tests and show summary
function runTests() {
    console.log('🐕 PomPom Basic Functionality Tests\n');
    
    // All test suites are defined above and run automatically
    
    // Show summary
    const passed = testResults.filter(r => r.passed).length;
    const failed = testResults.filter(r => r.passed === false).length;
    const total = testResults.length;
    
    console.log('\n📊 Test Summary');
    console.log(`Total: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    
    if (failed > 0) {
        console.log('\n❌ Failed Tests:');
        testResults.filter(r => !r.passed).forEach(result => {
            console.log(`  ${result.suite} > ${result.name}: ${result.error}`);
        });
        process.exit(1);
    } else {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests();
}

module.exports = { describe, test, expect, runTests };
