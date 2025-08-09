/**
 * Working Days Module - Central Export Hub
 * Provides unified access to all working day utilities and classes
 */

// Configuration exports
export { DEFAULT_WORKING_CONFIG, WorkingDaysConfig } from './config';

// Core calculator exports
export { WorkingDaysCalculator } from './calculator';

// Validation exports
export { WorkingDaysValidator } from './validator';

// Holiday management exports
export { HolidayManager } from './holiday-manager';

// Configuration manager exports
export { WorkingDaysConfigManager } from './config-manager';

// Utility function exports
export {
  addWorkingDays,
  calculateWorkingDays,
  createUSWorkingDaysCalculator,
  createWorkingDaysCalculator,
  isWorkingDay,
} from './utilities';

// Re-export main class as default export for convenience
export { WorkingDaysCalculator as default } from './calculator';
