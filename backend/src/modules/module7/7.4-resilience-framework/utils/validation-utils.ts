/**
 * Module 7.4 - Validation Utilities
 *
 * Purpose: Utility functions for validating schedules, plans, and configurations
 *
 * @author AI Scheduler Development Team
 * @version 1.0.0
 */

import type {
  ContingencyPlan,
  HealthIndicator,
  ResilienceMetrics,
  RiskIndicator,
  Schedule,
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from "../shared-types";

/**
 * Validate health metrics for consistency and accuracy
 */
export async function validateHealthMetrics(
  indicators: HealthIndicator[],
): Promise<ValidationResult> {
  // TODO: Implement health metrics validation
  // - Check indicator value ranges
  // - Validate metric consistency
  // - Verify trend calculations
  // - Check for data anomalies
  // - Return validation result

  throw new Error("validateHealthMetrics not yet implemented");
}

/**
 * Validate contingency plan feasibility
 */
export async function validateContingencyPlan(
  plan: ContingencyPlan,
  originalSchedule: Schedule,
): Promise<ValidationResult> {
  // TODO: Implement contingency plan validation
  // - Check plan feasibility
  // - Validate resource availability
  // - Verify timeline constraints
  // - Assess budget compliance
  // - Check quality requirements
  // - Return validation result

  throw new Error("validateContingencyPlan not yet implemented");
}

/**
 * Validate risk indicators
 */
export async function validateRiskIndicators(
  indicators: RiskIndicator[],
): Promise<ValidationResult> {
  // TODO: Implement risk indicator validation
  // - Check indicator definitions
  // - Validate threshold values
  // - Verify calculation methods
  // - Check data quality
  // - Return validation result

  throw new Error("validateRiskIndicators not yet implemented");
}

/**
 * Validate schedule structure and data
 */
export async function validateSchedule(
  schedule: Schedule,
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  let score = 100;

  // Basic structure validation
  if (!schedule.id || schedule.id.trim() === "") {
    errors.push({
      code: "MISSING_SCHEDULE_ID",
      message: "Schedule must have a valid ID",
      field: "id",
      severity: "error",
    });
    score -= 20;
  }

  if (!schedule.name || schedule.name.trim() === "") {
    errors.push({
      code: "MISSING_SCHEDULE_NAME",
      message: "Schedule must have a valid name",
      field: "name",
      severity: "error",
    });
    score -= 10;
  }

  if (!schedule.tasks || schedule.tasks.length === 0) {
    errors.push({
      code: "NO_TASKS",
      message: "Schedule must contain at least one task",
      field: "tasks",
      severity: "error",
    });
    score -= 30;
  }

  if (!schedule.resources || schedule.resources.length === 0) {
    warnings.push({
      code: "NO_RESOURCES",
      message: "Schedule has no resources defined",
      recommendation: "Consider adding resources for better planning",
    });
    score -= 5;
  }

  // Task validation
  if (schedule.tasks) {
    for (const task of schedule.tasks) {
      if (!task.id || task.id.trim() === "") {
        errors.push({
          code: "MISSING_TASK_ID",
          message: `Task must have a valid ID`,
          field: "tasks",
          severity: "error",
        });
        score -= 5;
      }

      if (task.duration <= 0) {
        errors.push({
          code: "INVALID_TASK_DURATION",
          message: `Task ${task.id} has invalid duration: ${task.duration}`,
          field: "tasks",
          severity: "error",
        });
        score -= 5;
      }

      // Check for circular dependencies
      if (task.dependencies.includes(task.id)) {
        errors.push({
          code: "CIRCULAR_DEPENDENCY",
          message: `Task ${task.id} has circular dependency on itself`,
          field: "tasks",
          severity: "error",
        });
        score -= 10;
      }
    }
  }

  // Resource validation
  if (schedule.resources) {
    for (const resource of schedule.resources) {
      if (!resource.id || resource.id.trim() === "") {
        errors.push({
          code: "MISSING_RESOURCE_ID",
          message: "Resource must have a valid ID",
          field: "resources",
          severity: "error",
        });
        score -= 5;
      }

      if (resource.capacity <= 0) {
        errors.push({
          code: "INVALID_RESOURCE_CAPACITY",
          message: `Resource ${resource.id} has invalid capacity: ${resource.capacity}`,
          field: "resources",
          severity: "error",
        });
        score -= 5;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
  };
}

/**
 * Validate resilience metrics
 */
export async function validateResilienceMetrics(
  metrics: ResilienceMetrics,
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  let score = 100;

  // Check score ranges (should be 0-100)
  const scoreFields = [
    "overallScore",
    "criticalPathRisk",
    "resourceRisk",
    "dependencyRisk",
    "bufferSufficiency",
  ];

  for (const field of scoreFields) {
    const value = metrics[field as keyof ResilienceMetrics] as number;
    if (typeof value !== "number" || value < 0 || value > 100) {
      errors.push({
        code: "INVALID_SCORE_RANGE",
        message: `${field} must be between 0 and 100, got: ${value}`,
        field,
        severity: "error",
      });
      score -= 15;
    }
  }

  // Check complexity factor (should be > 0)
  if (metrics.complexityFactor <= 0) {
    errors.push({
      code: "INVALID_COMPLEXITY_FACTOR",
      message: `Complexity factor must be positive, got: ${metrics.complexityFactor}`,
      field: "complexityFactor",
      severity: "error",
    });
    score -= 10;
  }

  // Check stability index (should be 0-100)
  if (metrics.stabilityIndex < 0 || metrics.stabilityIndex > 100) {
    errors.push({
      code: "INVALID_STABILITY_INDEX",
      message: `Stability index must be between 0 and 100, got: ${metrics.stabilityIndex}`,
      field: "stabilityIndex",
      severity: "error",
    });
    score -= 10;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
  };
}

/**
 * Validate configuration settings
 */
export async function validateConfiguration(
  config: unknown,
): Promise<ValidationResult> {
  // TODO: Implement configuration validation
  // - Check required fields
  // - Validate value ranges
  // - Check configuration consistency
  // - Return validation result

  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: 100,
  };
}

/**
 * Validate data quality
 */
export async function validateDataQuality(
  data: unknown[],
  requiredFields: string[],
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  let score = 100;

  if (!Array.isArray(data)) {
    errors.push({
      code: "INVALID_DATA_TYPE",
      message: "Data must be an array",
      severity: "error",
    });
    return { isValid: false, errors, warnings, score: 0 };
  }

  if (data.length === 0) {
    warnings.push({
      code: "EMPTY_DATA",
      message: "Data array is empty",
      recommendation: "Provide data for validation",
    });
    score -= 10;
  }

  // Check for required fields in each data item
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (typeof item !== "object" || item === null) {
      errors.push({
        code: "INVALID_DATA_ITEM",
        message: `Data item at index ${i} is not an object`,
        severity: "error",
      });
      score -= 5;
      continue;
    }

    for (const field of requiredFields) {
      if (!(field in (item as Record<string, unknown>))) {
        errors.push({
          code: "MISSING_REQUIRED_FIELD",
          message: `Data item at index ${i} is missing required field: ${field}`,
          field,
          severity: "error",
        });
        score -= 2;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
  };
}

/**
 * Check for circular dependencies in tasks
 */
export function checkCircularDependencies(
  tasks: Array<{ id: string; dependencies: string[] }>,
): string[] {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const circularDeps: string[] = [];

  function dfs(taskId: string): boolean {
    if (recursionStack.has(taskId)) {
      circularDeps.push(taskId);
      return true;
    }

    if (visited.has(taskId)) {
      return false;
    }

    visited.add(taskId);
    recursionStack.add(taskId);

    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      for (const depId of task.dependencies) {
        if (dfs(depId)) {
          return true;
        }
      }
    }

    recursionStack.delete(taskId);
    return false;
  }

  for (const task of tasks) {
    if (!visited.has(task.id)) {
      dfs(task.id);
    }
  }

  return circularDeps;
}
