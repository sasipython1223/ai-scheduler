/**
 * @fileoverview Test setup configuration for Vitest
 * Configures testing environment and global imports
 */

import "@testing-library/jest-dom";

// Configure global test environment
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }) as MediaQueryList;

// Mock window.getComputedStyle
Object.defineProperty(window, "getComputedStyle", {
  value: () => ({
    getPropertyValue: () => "",
  }),
});

// Fix for React 19 testing with jsdom
(global as any).IS_REACT_ACT_ENVIRONMENT = true;
