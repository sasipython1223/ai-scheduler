/**
 * Module 6.3: Constraint Optimizer Implementation
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Integration with CPM engine for constraint-aware scheduling
 * Dependencies: Module 6.2 validation engine, Module 5 schedule engine
 */

import { ConstraintValidator } from '../module6.2-validation-engine/constraint-validator.js';
import {
  IConstraintValidationResult,
  ITaskForValidation,
} from '../shared-types.js';

/**
 * Optimization options
 */
export interface OptimizationOptions {
  maxIterations?: number;
  allowSoftViolations?: boolean;
  prioritizeScheduleStability?: boolean;
  autoApplyFixes?: boolean;
}

/**
 * Optimization result
 */
export interface OptimizationResult {
  success: boolean;
  originalTasks: ITaskForValidation[];
  optimizedTasks: ITaskForValidation[];
  violationsResolved: number;
  violationsRemaining: number;
  iterations: number;
  optimizationDuration: number;
  appliedChanges: Array<{
    taskId: string;
    field: string;
    oldValue: string | number | Date;
    newValue: string | number | Date;
  }>;
}

/**
 * Constraint optimizer class
 */
export class ConstraintOptimizer {
  private validator: ConstraintValidator;
  private options: OptimizationOptions;

  constructor(
    validator: ConstraintValidator,
    options: OptimizationOptions = {}
  ) {
    this.validator = validator;
    this.options = {
      maxIterations: 10,
      allowSoftViolations: true,
      prioritizeScheduleStability: true,
      autoApplyFixes: false,
      ...options,
    };
  }

  /**
   * Optimize schedule to resolve constraint violations
   */
  public async optimizeSchedule(
    tasks: ITaskForValidation[]
  ): Promise<OptimizationResult> {
    const startTime = Date.now();
    let currentTasks = [...tasks];
    let iterations = 0;
    const appliedChanges: OptimizationResult['appliedChanges'] = [];

    // Initial validation
    const initialResult = this.validator.validateTasks(currentTasks);

    // If no violations, return early
    if (initialResult.isValid) {
      return {
        success: true,
        originalTasks: tasks,
        optimizedTasks: currentTasks,
        violationsResolved: 0,
        violationsRemaining: 0,
        iterations: 0,
        optimizationDuration: Date.now() - startTime,
        appliedChanges: [],
      };
    }

    // Optimization loop (placeholder implementation)
    while (iterations < (this.options.maxIterations || 10)) {
      const validationResult = this.validator.validateTasks(currentTasks);

      if (validationResult.isValid) {
        break;
      }

      // Apply constraint resolution logic here
      // This is a placeholder - detailed implementation will follow
      iterations++;
    }

    const finalResult = this.validator.validateTasks(currentTasks);

    return {
      success: finalResult.isValid,
      originalTasks: tasks,
      optimizedTasks: currentTasks,
      violationsResolved:
        initialResult.violationCount - finalResult.violationCount,
      violationsRemaining: finalResult.violationCount,
      iterations,
      optimizationDuration: Date.now() - startTime,
      appliedChanges,
    };
  }

  /**
   * Check if schedule can be optimized
   */
  public canOptimize(validationResult: IConstraintValidationResult): boolean {
    // Can optimize if there are auto-fixable suggestions
    return validationResult.autoFixable > 0;
  }

  /**
   * Get optimization recommendations
   */
  public getOptimizationRecommendations(
    validationResult: IConstraintValidationResult
  ): string[] {
    const recommendations: string[] = [];

    if (validationResult.criticalViolations.length > 0) {
      recommendations.push('Resolve critical violations first');
    }

    if (validationResult.autoFixable > 0) {
      recommendations.push(
        `${validationResult.autoFixable} auto-fixable suggestions available`
      );
    }

    return recommendations;
  }

  /**
   * Update optimization options
   */
  public updateOptions(newOptions: Partial<OptimizationOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }
}
