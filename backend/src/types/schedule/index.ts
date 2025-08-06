/**
 * Schedule Types - Central Export Module
 * AI Scheduler - Module 5.1: Type Definitions
 *
 * Re-exports all schedule-related types for easy importing
 */

// Task-related exports
export type { ScheduledTask, TaskConstraint, TaskInput } from './task.types.js';

export { ConstraintType, TaskPriority, TaskStatus } from './task.types.js';

// Dependency-related exports
export type { LogicLink, LogicType } from './dependency.types.js';

// WBS-related exports
export type { WBSNode, WBSStructure } from './wbs.types.js';

// Result-related exports
export type {
  CalculationMetadata,
  CriticalPath,
  ScheduleResult,
  ScheduleStatistics,
  ValidationResult,
} from './result.types.js';

// API-related exports
export type {
  CalculationOptions,
  ScheduleApiResponse,
  ScheduleCalculationRequest,
} from './api.types.js';

// Convenience re-exports for backward compatibility
export type {
  ScheduledTask as EnhancedTask,
  TaskInput as Task,
} from './task.types.js';
