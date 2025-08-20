#!/bin/bash

# PomPom Test Monitor
# This script helps you monitor test results in real-time

echo "🔍 PomPom Test Monitor"
echo "====================="

if [ ! -f "test-results.log" ]; then
    echo "📝 Creating test-results.log file..."
    touch test-results.log
fi

echo "📊 Monitoring test results from: test-results.log"
echo "💡 Tip: Run './run test' in another terminal to start tests"
echo "🛑 Press Ctrl+C to stop monitoring"
echo ""

# Monitor the log file
if command -v tail &> /dev/null; then
    tail -f test-results.log
else
    echo "❌ 'tail' command not found. Please install it to monitor logs in real-time."
    echo "📖 You can manually check the log file: cat test-results.log"
fi
