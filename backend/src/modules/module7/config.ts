/**
 * Module 7.x Configuration
 * Centralized configuration for capacity management and leveling algorithms
 */

// Numeric stability constants
export const EPS = 1e-7; // Floating-point comparison tolerance
export const CAP_MARGIN = 0.02; // 2% capacity headroom for stress scenarios (prod default)

// Leveling algorithm weights
export const LEVELING_ALPHA = 0.5; // Load ratio penalty weight
export const LEVELING_BETA = 0.1; // Above-median load penalty weight

// Performance budgets
export const POST_REPAIR_BUDGET_MS = 20; // Time budget for post-pass repair
export const VARIANCE_IMPROVEMENT_THRESHOLD = 0.01; // Minimum variance improvement to continue

// Capacity validation settings
export const MAX_OVERALLOC_PCT_THRESHOLD = 0; // CI gate: fail if any overallocation detected
export const PERFORMANCE_REGRESSION_THRESHOLD = 0.1; // 10% performance regression tolerance

// Algorithm iteration limits
export const MAX_LEVELING_ITERATIONS = 200;
export const STAGNATION_LIMIT_SMALL = 15;
export const STAGNATION_LIMIT_LARGE = 20;

export interface ModuleConfig {
  eps: number;
  capMargin: number;
  levelingAlpha: number;
  levelingBeta: number;
  postRepairBudgetMs: number;
  varianceThreshold: number;
}

export const getDefaultConfig = (): ModuleConfig => ({
  eps: EPS,
  capMargin: CAP_MARGIN,
  levelingAlpha: LEVELING_ALPHA,
  levelingBeta: LEVELING_BETA,
  postRepairBudgetMs: POST_REPAIR_BUDGET_MS,
  varianceThreshold: VARIANCE_IMPROVEMENT_THRESHOLD,
});
