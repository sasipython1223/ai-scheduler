/**
 * Module 7.2 - Optimization Strategy Interface
 *
 * Common interface for all optimization algorithms.
 */

import type { OptimizationCandidate, OptimizationInput } from '../types';

/**
 * Base interface for optimization strategies
 */
export interface OptimizationStrategy {
  readonly name: string;
  supports(input: OptimizationInput): boolean;
  optimize(
    input: OptimizationInput
  ): Promise<OptimizationCandidate | undefined>;
}
