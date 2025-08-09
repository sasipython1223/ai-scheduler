/**
 * Module 7.1 - Constraint-Aware Engine
 *
 * Public API exports for constraint-aware scheduling engine.
 *
 * This module provides the core orchestration for constraint-aware scheduling,
 * combining Module 5's scheduling engine with Module 6's constraint validation
 * and adding intelligent optimization and repair capabilities.
 */

// Core orchestrator
export { ConstraintAwareScheduler } from './constraint-aware-scheduler';
export type {
  ConstraintSchedulingInput,
  ConstraintSchedulingResult,
  OptimizeOptions,
  Resource,
  ScheduleEngine,
  ScheduleGraph,
  Task,
  ValidationEngine,
  ValidationReport,
  Violation,
} from './constraint-aware-scheduler';

// Constraint evaluation
export { ConstraintEvaluator } from './constraint-evaluator';
export type { ImpactSummary } from './constraint-evaluator';

// Schedule optimization
export { ScheduleOptimizer } from './schedule-optimizer';
export type {
  OptimizationStrategy,
  OptimizedSchedule,
} from './schedule-optimizer';

// Optimization strategies
export { BaselineStrategy } from './strategies/baseline-strategy';
export { ComprehensiveStrategy } from './strategies/comprehensive-strategy';

// Import classes for factory function
import type {
  ScheduleEngine,
  ValidationEngine,
} from './constraint-aware-scheduler';
import { ConstraintAwareScheduler } from './constraint-aware-scheduler';
import { ConstraintEvaluator } from './constraint-evaluator';
import { ScheduleOptimizer } from './schedule-optimizer';
import { BaselineStrategy } from './strategies/baseline-strategy';
import { ComprehensiveStrategy } from './strategies/comprehensive-strategy';

/**
 * Creates a fully configured constraint-aware scheduler with default strategies.
 *
 * @param scheduleEngine - Core scheduling engine from Module 5
 * @param validationEngine - Constraint validation engine from Module 6
 * @returns Configured scheduler ready for constraint-aware scheduling
 *
 * @example
 * ```typescript
 * const scheduler = createConstraintAwareScheduler(scheduleEngine, validationEngine);
 * const result = await scheduler.executeConstraintAwareScheduling({
 *   tasks: [{ id: 'T1', duration: 5, deps: ['T0'] }],
 *   options: { maxIterations: 10 }
 * });
 * ```
 */
export function createConstraintAwareScheduler(
  scheduleEngine: ScheduleEngine,
  validationEngine: ValidationEngine
): ConstraintAwareScheduler {
  // Set up constraint evaluator
  const constraintEvaluator = new ConstraintEvaluator(validationEngine);

  // Set up schedule optimizer with default strategies
  const scheduleOptimizer = new ScheduleOptimizer();
  scheduleOptimizer.registerStrategy(new BaselineStrategy());
  scheduleOptimizer.registerStrategy(new ComprehensiveStrategy());

  // Create and return configured scheduler
  return new ConstraintAwareScheduler(
    scheduleEngine,
    constraintEvaluator,
    scheduleOptimizer
  );
}

/**
 * Module 7.1 version and metadata.
 */
export const MODULE_INFO = {
  name: 'constraint-aware-engine',
  version: '7.1.0',
  description: 'Constraint-aware scheduling engine with optimization',
  dependencies: {
    'module-5': 'schedule-engine',
    'module-6': 'constraint-validation',
  },
} as const;
