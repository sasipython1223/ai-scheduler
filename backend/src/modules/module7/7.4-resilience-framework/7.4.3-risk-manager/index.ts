/**
 * Module 7.4.3 - Risk Manager - Component Entry Point
 *
 * Purpose: Real-time risk monitoring, automated mitigation, and response coordination
 *
 * @author AI Scheduler Development Team
 * @version 1.0.0
 */

// ============================================================================
// CORE MANAGER EXPORTS
// ============================================================================

export { MitigationEngine } from "./mitigation-engine";
export { RiskManager } from "./risk-manager";
export { RiskMonitor } from "./risk-monitor";

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  ActionPriority,
  MitigationAction,
  MitigationResult,
  MitigationStrategy,
  RiskAlert,
  RiskCategory,
  RiskContext,
  RiskDataPoint,
  RiskIndicator,
  RiskSeverity,
  ScheduleImpact,
  SideEffect,
  TrendDirection,
} from "../shared-types";

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export { executeMitigationStrategies } from "../utils/mitigation-utils";
export { monitorRealTimeIndicators } from "../utils/monitoring-utils";
export { validateRiskIndicators } from "../utils/validation-utils";

// ============================================================================
// CONSTANTS
// ============================================================================

export const MANAGER_VERSION = "1.0.0";
export const DEFAULT_RISK_CONFIG = {
  monitoringInterval: 60000, // 1 minute
  alertRetention: 30, // 30 days
  autoMitigation: false,
  escalationLevels: ["info", "low", "medium", "high", "critical"],
} as const;
