/**
 * Module 6: Constraint Optimizer - Main Export Index
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Central export hub for all Module 6 functionality
 * Dependencies: All Module 6 submodules
 */

// Shared types and interfaces
export * from './shared-types.js';

// Module 6.1: Constraint Types and Models
export * from './module6.1-constraint-types/index.js';

// Module 6.2: Validation Engine
export * from './module6.2-validation-engine/index.js';

// Module 6.3: Integration and Optimization
export * from './module6.3-integration/index.js';

/**
 * Module 6 Version and Metadata
 */
export const MODULE_6_INFO = {
  version: '6.0.0',
  name: 'Constraint Optimizer',
  description: 'Constraint-aware scheduling with validation and optimization',
  submodules: [
    '6.1-constraint-types',
    '6.2-validation-engine',
    '6.3-integration',
  ],
  dependencies: ['module5 (Schedule Engine)'],
  features: [
    'Hard/Soft constraint validation',
    'Automatic violation detection',
    'Resolution suggestion engine',
    'Schedule optimization integration',
    'Real-time constraint feedback',
  ],
} as const;
