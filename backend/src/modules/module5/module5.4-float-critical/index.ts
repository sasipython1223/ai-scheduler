/**
 * Module 5.4 - Float & Critical Path Analysis
 * Purpose: Main exports for Module 5.4 services and types
 *
 * This module provides:
 * - Float calculation services (total float, free float)
 * - Critical path analysis and detection
 * - Task flag assignment based on float values
 * - Comprehensive orchestration through Module54Service
 *
 * Key Features:
 * - Epsilon-based precision (0.001) for float comparisons
 * - Multiple critical path detection support
 * - O(V + E) algorithm complexity maintenance
 * - Clean architecture with separation of concerns
 */

// Core Services
export { AnalyzerConfig, CriticalPathAnalyzer } from './CriticalPathAnalyzer';
export { FloatCalculator, PrecisionConfig } from './FloatCalculator';
export { Module54Config, Module54Service } from './Module54Service';
export {
  FlagAssignment,
  FlagConfiguration,
  FlagSummary,
  FlagType,
  TaskFlag,
  TaskFlagAssigner,
} from './TaskFlagAssigner';

// Helper Classes
export { CriticalPathHelpers } from './CriticalPathHelpers';

// Type Definitions
export * from './types/CriticalPathTypes';
export * from './types/FlagTypes';
export * from './types/FloatTypes';
export * from './types/SharedTypes';

// Utility Functions
export * from './utils/CriticalPathUtils';
export * from './utils/FloatUtils';
export * from './utils/ValidationUtils';

// Constants
export { DEFAULT_EPSILON } from './utils/FloatUtils';

/**
 * Module 5.4 Quick Start Example:
 *
 * ```typescript
 * import { Module54Service } from './module5.4';
 *
 * const service = new Module54Service({
 *   epsilon: 0.001,
 *   enableMultipleCriticalPaths: true,
 *   enableDetailedValidation: true
 * });
 *
 * const input = {
 *   tasks: [...],
 *   dependencies: [...],
 *   forwardPassResult: {...},
 *   backwardPassResult: {...}
 * };
 *
 * const result = await service.executeModule54(input);
 * console.log('Critical paths:', result.criticalPathAnalysis.criticalPaths.length);
 * console.log('Tasks with flags:', result.tasksWithFlags.length);
 * ```
 */
