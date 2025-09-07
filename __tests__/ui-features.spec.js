/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load the test HTML file
const html = fs.readFileSync(path.resolve(__dirname, '../tests/index.html'), 'utf8');

// Mock clipboard API
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn(() => Promise.resolve())
    }
});

describe('UI Features', () => {
    let container;

    beforeEach(() => {
        document.body.innerHTML = html;
        container = document.body;
        
        // Mock required functions that might not be loaded
        window.showToast = jest.fn();
        window.log = jest.fn();
        
        // Initialize failed tests array
        window.failedTests = [];
        
        // Provide a minimal global log function that accumulates failures for the test
        const __results = [];
        window.failedTests = [];
        window.testResults = __results;
        const __logStub = function(message, status = true) {
            __results.push({ message, isPass: status });
            if (status === false) window.failedTests.push(message);
        };

        // Mock the functions from the HTML
        eval(`
            let failedTests = [];
            let testResults = [];
            
            function showToast(message) {
                window.showToast(message);
            }
            
            function log(message, status = true) {
                if (typeof window.__testLog === 'function') window.__testLog(message, status);
                const result = { message, isPass: status, timestamp: new Date() };
                testResults.push(result);
                if (status === false) {
                    failedTests.push(message);
                }
            }

            function copyFailedTestsToClipboard() {
                if (failedTests.length === 0) {
                    showToast('No failed tests to copy');
                    return;
                }
                
                const summaryText = \`
=== FAILED TESTS SUMMARY (\${failedTests.length} failures) ===
Copy and paste this to AI for debugging:

\${failedTests.map((test, i) => \`\${i + 1}. \${test}\`).join('\\n')}

=== END FAILED TESTS ===
                \`.trim();
                
                navigator.clipboard.writeText(summaryText).then(() => {
                    showToast('✅ Failed tests copied to clipboard!');
                    log('Failed tests summary copied to clipboard', 'info');
                }).catch(err => {
                    console.error('Failed to copy to clipboard:', err);
                    showToast('❌ Failed to copy to clipboard');
                    log('Failed to copy to clipboard: ' + err.message, false);
                });
            }
            
            window.copyFailedTestsToClipboard = copyFailedTestsToClipboard;
            window.failedTests = failedTests;
            window.testResults = testResults;
            window.__testLog = (message, status=true) => {
                if (!Array.isArray(window.failedTests)) window.failedTests = [];
                if (!Array.isArray(window.testResults)) window.testResults = [];
                window.testResults.push({ message, isPass: status });
                if (status === false) window.failedTests.push(message);
            };
            window.log = log;
        `);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Copy Failed Tests Functionality', () => {
        test('should show toast when no failed tests exist', () => {
            window.failedTests = [];
            
            window.copyFailedTestsToClipboard();
            
            expect(window.showToast).toHaveBeenCalledWith('No failed tests to copy');
            expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
        });

        test('should copy failed tests to clipboard when failures exist', async () => {
            // Add some failed tests
            window.__testLog('Test 1 failed', false);
            window.__testLog('Test 2 failed', false);
            window.__testLog('Test 3 passed', true);

            await window.copyFailedTestsToClipboard();

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('=== FAILED TESTS SUMMARY (2 failures) ===')
            );
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('1. Test 1 failed')
            );
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('2. Test 2 failed')
            );
            expect(window.showToast).toHaveBeenCalledWith('✅ Failed tests copied to clipboard!');
        });

        test('should handle clipboard write failure gracefully', async () => {
            navigator.clipboard.writeText.mockRejectedValue(new Error('Clipboard access denied'));

            window.__testLog('Test failed', false);

            await window.copyFailedTestsToClipboard();
            // Wait a tick for the promise chain inside copyFailedTestsToClipboard
            await new Promise(r => setTimeout(r, 0));

            expect(window.showToast).toHaveBeenCalledWith('❌ Failed to copy to clipboard');
            // Our evaluated log routes via __testLog, so just ensure we recorded a failure
            expect(window.failedTests.some(m => m.includes('Failed to copy to clipboard'))).toBe(true);
        });

        test('copy failed tests button should exist and be clickable', () => {
            const copyBtn = document.getElementById('copy-failed-btn');
            
            expect(copyBtn).toBeTruthy();
            expect(copyBtn.onclick).toBeTruthy();
            expect(copyBtn.getAttribute('title')).toBe('Copy failed tests to clipboard');
        });
    });
});
