/**
 * Module 6.2: Validation Engine - Export Index
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Export constraint validation and reporting functionality
 */

// Core validation engine (will be implemented)
export * from './constraint-validator.js';

// Violation reporting utilities (will be implemented)
export * from './violation-reporter.js';

/**
 * Submodule 6.2 Metadata
 */
export const MODULE_6_2_INFO = {
  version: '6.2.0',
  name: 'Validation Engine',
  description: 'Constraint validation logic and violation reporting',
  estimatedLOC: 200,
  status: 'PLANNED',
} as const;
