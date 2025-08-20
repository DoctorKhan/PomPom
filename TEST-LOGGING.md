# PomPom Test Logging System

## Overview

The PomPom app now includes a comprehensive test logging system that captures browser test results, console logs, and errors to a file for easy monitoring and debugging.

## Features

- ✅ **Automatic Log Capture**: All test results are automatically saved to `test-results.log`
- ✅ **Real-time Monitoring**: Live log output during test execution
- ✅ **Error Tracking**: Captures JavaScript errors, warnings, and unhandled exceptions
- ✅ **Structured Logging**: JSON data support for detailed debugging information
- ✅ **Test Organization**: Logs are organized by test name for easy filtering

## How to Use

### Running Tests with Logging

```bash
# Start tests with automatic logging
./run test

# The system will:
# 1. Clear previous test logs
# 2. Start the Node.js server with logging endpoint
# 3. Open the test page in your browser
# 4. Show live log output in the terminal
```

### Monitoring Test Results

```bash
# Option 1: Use the built-in monitor (runs automatically with ./run test)
# Live output is shown in the terminal

# Option 2: Use the dedicated monitor script
./monitor-tests.sh

# Option 3: Manual monitoring
tail -f test-results.log

# Option 4: View all logs at once
cat test-results.log
```

### Log File Format

Each log entry includes:
- **Timestamp**: ISO 8601 format
- **Level**: INFO, WARN, ERROR
- **Test Name**: Identifies which test generated the log
- **Message**: Human-readable description
- **Data**: Optional JSON data for debugging

Example log entries:
```
[2025-08-19T19:12:20.931Z] INFO [landing-page-test] ✅ Main app loaded successfully
[2025-08-19T19:12:25.123Z] ERROR [session-flow-test] ❌ Element not found | {"element":"team-name-input"}
[2025-08-19T19:12:30.456Z] WARN [todo-inline-test] ⚠️ Cross-origin restrictions detected
```

## Test Types

The system captures logs from:

1. **Landing Page Tests**: Basic app loading and UI verification
2. **Session Flow Tests**: Team setup and navigation testing
3. **Todo Inline Tests**: Interactive feature testing
4. **Console Errors**: Automatic capture of JavaScript errors
5. **Unhandled Exceptions**: Promise rejections and runtime errors

## Debugging with Logs

### Finding Specific Issues
```bash
# Filter by test name
grep "landing-page-test" test-results.log

# Filter by log level
grep "ERROR" test-results.log

# Filter by time range (today's logs)
grep "$(date +%Y-%m-%d)" test-results.log
```

### Common Log Patterns

- `✅` - Successful test steps
- `❌` - Test failures
- `⚠️` - Warnings or partial failures
- `🔗` - URL or navigation tests
- `📊` - Data validation tests

## API Endpoint

The logging system uses a REST API endpoint:

```
POST /api/test-log
Content-Type: application/json

{
  "level": "info|warn|error",
  "message": "Log message",
  "testName": "test-identifier",
  "timestamp": "2025-08-19T19:12:20.931Z",
  "data": { "optional": "debug data" }
}
```

## Files

- `test-results.log` - Main log file (auto-created)
- `test.html` - Test runner with logging integration
- `server.js` - Includes `/api/test-log` endpoint
- `monitor-tests.sh` - Standalone log monitor script
- `run` - Updated test runner with logging support

## Benefits for ADHD-Friendly Development

- **Reduced Cognitive Load**: No need to watch multiple browser tabs
- **Clear Feedback**: Immediate visual confirmation of test results
- **Historical Tracking**: Easy to review what went wrong and when
- **Focused Debugging**: Filter logs to focus on specific issues
- **Automated Capture**: No manual log copying or screenshot taking

## Troubleshooting

### No Logs Appearing
1. Ensure Node.js server is running (`./run test`)
2. Check that `test-results.log` file exists and is writable
3. Verify browser can reach `http://localhost:8000/api/test-log`

### Permission Issues
```bash
# Make scripts executable
chmod +x run monitor-tests.sh

# Ensure log file is writable
touch test-results.log
chmod 644 test-results.log
```

### Server Issues
```bash
# Check if port 8000 is available
lsof -i :8000

# Kill existing processes if needed
pkill -f "node server.js"
```
