/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

// Extend the global namespace to include Vitest globals
declare global {
  namespace Vitest {
    interface GlobalSetupContext {
      provide<T>(key: string, value: T): void;
    }
  }
}

export {};
