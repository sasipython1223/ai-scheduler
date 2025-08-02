/**
 * Jest Test Setup
 * AI Scheduler - Module 5.1: Test Configuration
 */

// Global test configuration and setup
global.console = {
  ...console,
  // Suppress debug logs during testing unless explicitly needed
  debug: jest.fn(),
  log: console.log,
  warn: console.warn,
  error: console.error,
};

// Setup global test timeout
jest.setTimeout(10000);

// Mock performance API for Node.js if not available
if (typeof performance === 'undefined') {
  (global as unknown as { performance: { now(): number } }).performance = {
    now: () => Date.now(),
  };
}

// Setup timezone for consistent date testing
process.env.TZ = 'UTC';

export {};
