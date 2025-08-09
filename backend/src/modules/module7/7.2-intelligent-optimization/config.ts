/**
 * Module 7.2 - Configuration and Feature Flags
 *
 * Centralized configuration for optimization algorithms and feature toggles.
 */

export const ENABLE_INTELLIGENT_OPTIMIZATION = true;
export const ENABLE_GA = true;
export const ENABLE_SA = false;
export const ENABLE_ML = false;

/**
 * Configuration for optimization behavior
 */
export interface OptimizationConfig {
  defaults: {
    timeBudgetMs: number; // 200
    maxIterations: number; // 3
  };
}

/**
 * Partial configuration for overrides
 */
export interface PartialOptimizationConfig {
  defaults?: {
    timeBudgetMs?: number;
    maxIterations?: number;
  };
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: OptimizationConfig = {
  defaults: {
    timeBudgetMs: 200,
    maxIterations: 3,
  },
} as const;
