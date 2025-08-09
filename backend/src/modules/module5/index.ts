/**
 * Module 5 - Schedule Engine
 * Main entry point for all Module 5 components
 */

// Core Engine (Module 5.1)
export { ScheduleEngine } from './module5.1-core-engine/schedule-core';
export {
  calculateAverageFloat,
  calculateCriticalDurationFromIds,
  calculateFloatDistribution,
} from './module5.1-core-engine/schedule-math';

// Forward Pass (Module 5.2)
export {
  computeForwardPass,
  ForwardPassCalculator,
} from './module5.2-forward-pass/forward-pass-engine';
export {
  calculateConstraintDate,
  calculateProjectEndDate,
  DEFAULT_PROJECT_START,
  findLatestConstraintDate,
  includeOrphanTasks,
} from './module5.2-forward-pass/forward-pass-utils';

// Backward Pass (Module 5.3)
export {
  calculateProjectFloat,
  computeBackwardPass,
  identifyCriticalPath,
} from './module5.3-backward-pass/backward-pass-engine';
export { BackwardPassEngine } from './module5.3-backward-pass/backward-pass-processor';
export { FloatCalculator } from './module5.3-backward-pass/float-calculator';

// Float/Critical Analysis (Module 5.4)
export { CriticalPathAnalyzer } from './module5.4-float-critical/CriticalPathAnalyzer';
export { FloatCalculator as AdvancedFloatCalculator } from './module5.4-float-critical/FloatCalculator';
export { TaskFlagAssigner } from './module5.4-float-critical/TaskFlagAssigner';

// API (Module 5.5)
export {
  createScheduleRoutes,
  ScheduleApiRoutes,
} from './module5.5-api/schedule-api.route';
export { ScheduleController } from './module5.5-api/schedule-controller';
export { ScheduleService } from './module5.5-api/schedule-service';
export { ScheduleValidator } from './module5.5-api/schedule-validator';

// Performance Testing (Module 5.6)
export {
  generateComplexTasks,
  generateLogicLinks,
  generateTasks,
  generateTestScenario,
} from './module5.6-performance/performance-generator';
export {
  createPerformanceMetrics,
  MemoryTracker,
  PerformanceLogger,
} from './module5.6-performance/performance-logger';

// Shared Types
export * from './shared-types';

// Re-export commonly used types for convenience
export type {
  BackwardPassResult,
  CriticalPathAnalysisResult,
  FloatAnalysisResult,
  ForwardPassResult,
  ScheduleApiResponse,
} from './shared-types';
