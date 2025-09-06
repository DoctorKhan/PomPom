#!/usr/bin/env node

// Simple test runner to verify our fixes
const { execSync } = require('child_process');

console.log('🧪 Running PomPom Tests...\n');

try {
  // Run Jest with explicit output
  const result = execSync('node_modules/.bin/jest __tests__/ui.spec.js --verbose --no-coverage --forceExit', {
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: 60000
  });

  console.log('✅ Test Results:');
  console.log(result);

} catch (error) {
  console.log('❌ Test Results:');
  console.log(error.stdout || error.message);

  if (error.stderr) {
    console.log('\n🔍 Error Details:');
    console.log(error.stderr);
  }

  // Show exit code for debugging
  console.log(`\n📊 Exit Code: ${error.status || 'unknown'}`);
}

console.log('\n🏁 Test run complete!');
