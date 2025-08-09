/**
 * Module 7.4.1 - Resilience Analyzer - Component Entry Point
 *
 * Purpose: Robustness scoring, vulnerability detection, and schedule health monitoring
 *
 * @author AI Scheduler Development Team
 * @version 1.0.0
 */

// ============================================================================
// CORE ANALYZER EXPORTS
// ============================================================================

export { HealthMonitor } from "./health-monitor";
export { ResilienceAnalyzer } from "./resilience-analyzer";
export { VulnerabilityDetector } from "./vulnerability-detector";

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  Bottleneck,
  HealthAlert,
  HealthIndicator,
  HealthStatus,
  ResilienceMetrics,
  RiskFactor,
  RiskImpact,
  RiskLevel,
  RiskSeverity,
  TrendIndicator,
  VulnerabilityReport,
  VulnerableTask,
} from "../shared-types";

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export { analyzeScheduleResilience } from "../utils/analysis-utils";
export { calculateRiskScore } from "../utils/scoring-utils";
export { validateHealthMetrics } from "../utils/validation-utils";

// ============================================================================
// CONSTANTS
// ============================================================================

export const ANALYZER_VERSION = "1.0.0";
export const DEFAULT_ANALYSIS_CONFIG = {
  scoringWeights: {
    criticalPath: 0.3,
    resource: 0.25,
    dependency: 0.2,
    buffer: 0.15,
    complexity: 0.1,
  },
  thresholds: {
    low: 25,
    medium: 50,
    high: 75,
    critical: 90,
  },
  updateInterval: 300, // 5 minutes
} as const;
