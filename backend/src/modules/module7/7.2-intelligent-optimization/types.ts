/**
 * Module 7.2 - Intelligent Optimization Types
 *
 * Core type definitions for optimization algorithms and results.
 * Supports multiple optimization strategies with feature flag control.
 */

export type OptimizationStatus = 'ok' | 'improved' | 'no_change' | 'error';

/**
 * Represents a candidate solution during optimization
 */
export interface OptimizationCandidate {
  scheduleId: string;
  score: number; // higher is better
  changesApplied: number; // count of mutations/ops
}

/**
 * Input parameters for optimization algorithms
 */
export interface OptimizationInput {
  schedule: unknown; // opaque graph from Module 5
  constraints: unknown; // opaque constraint set from Module 6
  timeBudgetMs?: number; // default 200
  maxIterations?: number; // default 3
  objectiveWeights?: {
    makespan?: number; // 0..1
    softViolations?: number; // 0..1
    leveling?: number; // 0..1
    latency?: number; // 0..1
  };
}

/**
 * Result of optimization operation with diagnostics
 */
export interface OptimizationResult {
  status: OptimizationStatus;
  best?: OptimizationCandidate;
  iterations: number;
  diagnostics?: {
    tookMs: number;
    triedStrategies: string[];
    notes?: string[];
  };
  errorMessage?: string;
}
