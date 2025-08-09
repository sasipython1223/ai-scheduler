/**
 * Module 7.4.2 - Contingency Planner - Component Entry Point
 * 
 * Purpose: Scenario modeling, alternative schedule generation, and contingency planning
 * 
 * @author AI Scheduler Development Team
 * @version 1.0.0
 */

// ============================================================================
// CORE PLANNER EXPORTS
// ============================================================================

export { ContingencyPlanner } from './contingency-planner';
export { ScenarioModeler } from './scenario-modeler';
export { AlternativeGenerator } from './alternative-generator';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  ContingencyScenario,
  ContingencyPlan,
  ScenarioTrigger,
  AlternativeScheduleOptions,
  ScenarioResult,
  SimulationResult,
  AlternativeOutcome,
  ResourceRequirement,
  PlanCost,
  CostBreakdown,
  CostConstraint,
  QualityThreshold,
  ScenarioCategory
} from '../shared-types';

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export { generateScenarios } from '../utils/scenario-utils';
export { simulateOutcomes } from '../utils/simulation-utils';
export { validateContingencyPlan } from '../utils/validation-utils';

// ============================================================================
// CONSTANTS
// ============================================================================

export const PLANNER_VERSION = '1.0.0';
export const DEFAULT_PLANNING_CONFIG = {
  maxAlternatives: 5,
  scenarioTimeout: 30000, // 30 seconds
  validationStrict: true,
  simulationIterations: 1000
} as const;
