/**
 * Working Days Utility - Legacy Compatibility Module
 * Re-exports from modular working-days utilities for backward compatibility
 */

// Re-export all types and utilities from the modular structure
export {
  WorkingDaysConfig,
  DEFAULT_WORKING_CONFIG,
  WorkingDaysCalculator,
  HolidayManager,
  WorkingDaysConfigManager,
  calculateWorkingDays,
  addWorkingDays,
  createWorkingDaysCalculator,
  isWorkingDay,
  createUSWorkingDaysCalculator,
} from '../../utils/working-days';

// Export default calculator for convenience
export { default } from '../../utils/working-days';
