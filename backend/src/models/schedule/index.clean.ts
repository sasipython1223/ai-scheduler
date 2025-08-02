/**
 * Schedule Models Module Index
 * AI Scheduler - Module 5.1: Data Models
 *
 * Central exports for all schedule-related models and utilities
 */

// Task Model
export { createTask, Task, validateTask } from './task.model.js';

// Logic Link Model
export {
  createLogicLink,
  LogicLinkModel,
  validateLogicLink,
} from './logicLink.model.js';

// Dependency Detection Utilities
export {
  buildDependencyGraph,
  checkCircularDependency,
  DependencyDetector,
  getPredecessors,
  getSuccessors,
} from './dependency.util.js';

// WBS Model
export { createWBSManager, WBSManager } from './wbs.model.js';

// WBS Parsing Utilities
export {
  parseWBSFromTasks,
  sortWBSCodes,
  validateWBSCode,
  validateWBSHierarchy,
  WBSCodeValidator,
  WBSParser,
} from './wbsParsing.util.js';

// Working Days Utility
export {
  addWorkingDays,
  calculateWorkingDays,
  createUSWorkingDaysCalculator,
  createWorkingDaysCalculator,
  DEFAULT_WORKING_CONFIG,
  isWorkingDay,
  WorkingDaysCalculator,
  WorkingDaysConfig,
} from './workingDays.util.js';

// Holiday Management
export {
  getHolidaysForYear,
  HOLIDAY_REGIONS,
  HolidayManager,
  HolidayRegion,
  isBusinessDay,
  isHoliday,
} from './holiday.util.js';

// Schedule Engine
export {
  createScheduleEngine,
  createScheduleEngineWithConfig,
  ScheduleEngine,
} from './scheduleEngine.model.js';

// Schedule Validation Utilities
export {
  getDefaultCalculationOptions,
  isValidationSuccessful,
  ScheduleUtils,
  validateScheduleRequest,
} from './scheduleValidation.util.js';

// Re-export types for convenience
export type {
  CalculationOptions,
  LogicLink,
  LogicType,
  ScheduleCalculationRequest,
  ScheduledTask,
  TaskConstraint,
  TaskInput,
  TaskPriority,
  TaskStatus,
  ValidationResult,
  WBSNode,
  WBSStructure,
} from '../../types/scheduleTypes.js';
