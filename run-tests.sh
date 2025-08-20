#!/bin/bash

# PomPom Test Runner
# Makes it easy to run different types of tests

echo "🐕 PomPom Test Runner"
echo "===================="

if [ "$1" = "basic" ]; then
    echo "Running basic functionality tests..."
    npx jest basic.test.js --verbose
elif [ "$1" = "integration" ]; then
    echo "Running integration tests..."
    npx jest integration.test.js --verbose
elif [ "$1" = "userflow" ]; then
    echo "Running user flow tests..."
    npx jest userflow.test.js --verbose
elif [ "$1" = "all" ]; then
    echo "Running all Jest tests..."
    npm run test:jest
elif [ "$1" = "browser" ]; then
    echo "Opening browser tests..."
    open http://localhost:8000/test-basic.html
elif [ "$1" = "quick" ]; then
    echo "Running quick test suite (basic + integration)..."
    npx jest basic.test.js integration.test.js --verbose
else
    echo "Usage: ./run-tests.sh [option]"
    echo ""
    echo "Options:"
    echo "  basic       - Run basic functionality tests (28 tests)"
    echo "  integration - Run integration tests (25 tests)"
    echo "  userflow    - Run user flow tests (35 tests)"
    echo "  all         - Run all Jest tests (110 tests)"
    echo "  quick       - Run basic + integration (53 tests)"
    echo "  browser     - Open browser-based tests"
    echo ""
    echo "Examples:"
    echo "  ./run-tests.sh basic"
    echo "  ./run-tests.sh all"
    echo "  ./run-tests.sh quick"
fi
