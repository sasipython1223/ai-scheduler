#!/usr/bin/env node

/**
 * Quick test runner for ES modules
 * Handles the module resolution for our comprehensive test suite
 */

import { spawn } from 'child_process';
import path from 'path';

const testFile = 'src/services/module5.4/extended-test-modular.ts';
const testPath = path.resolve(testFile);

console.log('🚀 Running Clean Code Architecture Tests...');
console.log(`📁 Test file: ${testPath}`);

// Use ts-node with proper ES module support
const child = spawn('npx', ['tsx', testFile], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd(),
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Test execution completed successfully!');
  } else {
    console.log(`❌ Test execution failed with code ${code}`);
  }
  process.exit(code);
});

child.on('error', (err) => {
  console.error('Failed to start test process:', err);
  process.exit(1);
});
