/**
 * Module 6.3: Integration and Optimization - Export Index
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Export constraint optimizer and CPM integration functionality
 */

// Constraint optimizer engine (will be implemented)
export * from './constraint-optimizer.js';

// Constraint propagation logic (will be implemented)
export * from './constraint-propagator.js';

/**
 * Submodule 6.3 Metadata
 */
export const MODULE_6_3_INFO = {
  version: '6.3.0',
  name: 'Integration and Optimization',
  description: 'CPM integration and constraint-aware optimization',
  estimatedLOC: 180,
  status: 'PLANNED',
} as const;
