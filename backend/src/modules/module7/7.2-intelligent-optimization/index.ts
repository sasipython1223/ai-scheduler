/**
 * Module 7.2 - Intelligent Optimization Public API
 *
 * Exports all public interfaces, types, and factory functions for
 * intelligent optimization algorithms.
 */

// Re-export core types
export type {
  OptimizationCandidate,
  OptimizationInput,
  OptimizationResult,
  OptimizationStatus,
} from './types';

// Re-export strategy interface
export type { OptimizationStrategy } from './strategies/optimization-strategy';

// Re-export configuration types
export type { OptimizationConfig } from './config';

// Re-export main façade class
export { OptimizationFacade } from './optimization-algorithms';

// Re-export feature flags (readonly)
export {
  ENABLE_GA,
  ENABLE_INTELLIGENT_OPTIMIZATION,
  ENABLE_ML,
  ENABLE_SA,
} from './config';

// Import strategy implementations
import type { OptimizationConfig } from './config';
import { OptimizationFacade } from './optimization-algorithms';
import { GeneticAlgorithm } from './strategies/genetic-algorithm';
import { MLOptimization } from './strategies/ml-optimization';
import { SimulatedAnnealing } from './strategies/simulated-annealing';

/**
 * Factory function to create OptimizationFacade with all strategies wired
 *
 * @param config - Optional partial configuration to override defaults
 * @returns Configured OptimizationFacade instance with GA, SA, and ML strategies
 */
export function createOptimizationFacade(
  config?: Partial<OptimizationConfig>
): OptimizationFacade {
  const strategies = [
    new GeneticAlgorithm(),
    new SimulatedAnnealing(),
    new MLOptimization(),
  ];

  return new OptimizationFacade(strategies, config);
}
