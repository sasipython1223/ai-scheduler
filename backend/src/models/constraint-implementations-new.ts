/**
 * Module 6.1: Constraint Implementations (Re-exports)
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Main entry point for constraint implementations
 * Dependencies: date-constraint-implementation.ts, duration-constraint-implementation.ts
 */

// Re-export all constraint implementations
export { DateConstraint } from './date-constraint-implementation.js';
export { DurationConstraint } from './duration-constraint-implementation.js';

// For backward compatibility, maintain the same exports that external code expects
export type {
  ConstraintType,
  DateConstraintParams,
  DurationConstraintParams,
  ViolationSuggestion,
} from '../types/constraint-types.js';
export type { ValidationContext } from './constraint-models.js';
