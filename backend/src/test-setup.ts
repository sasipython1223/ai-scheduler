/**
 * Jest test setup for Module 7.x regression testing
 */

// Global test configuration
process.env.NODE_ENV = "test";

// Increase test timeout for performance tests
jest.setTimeout(30000);

// Mock console methods to reduce noise in test output (except for performance logging)
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

console.log = (...args: any[]) => {
  // Allow performance-related logs through
  if (
    args.some(
      (arg) =>
        typeof arg === "string" &&
        (arg.includes("Performance:") ||
          arg.includes("performance:") ||
          arg.includes("ms") ||
          arg.includes("Memory usage:") ||
          arg.includes("algorithm:") ||
          arg.includes("strategy:")),
    )
  ) {
    originalConsoleLog(...args);
  }
  // Suppress other logs during testing
};

console.warn = (...args: any[]) => {
  // Allow warnings through in test environment
  originalConsoleWarn(...args);
};

// Global test utilities
(global as any).testHelpers = {
  // Add any global test utilities here
  mockDate: (dateString: string) => {
    const mockDate = new Date(dateString);
    jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);
  },

  restoreDate: () => {
    (global.Date as any).mockRestore?.();
  },
};

// Cleanup after each test
afterEach(() => {
  // Restore any mocked functions
  jest.restoreAllMocks();

  // Force garbage collection if available (helps with memory tests)
  if (global.gc) {
    global.gc();
  }
});

// Global error handling for async tests
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit the process during tests
});

// Add custom Jest matchers if needed
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
