/**
 * Module 6.2: Constraint Validation Engine
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Core validation logic for constraint checking
 * Dependencies: constraint-types.ts, constraint-models.ts
 */

import {
  BaseConstraint,
  ConstraintCollection,
  ValidationContext,
} from '../models/constraint-models.js';
import {
  ConstraintCategory,
  ConstraintValidationResult,
  ConstraintViolation,
  ViolationContext,
  ViolationSeverity,
} from '../types/constraint-types.js';
import {
  TaskValidationInput,
  ValidationOptions,
} from './constraint-validation-utils.js';

/**
 * Core Constraint Validator Class
 */
export class ConstraintValidator {
  private constraints: ConstraintCollection;
  private validationOptions: ValidationOptions;

  constructor(
    constraints: BaseConstraint[] = [],
    options: ValidationOptions = {}
  ) {
    this.constraints = new ConstraintCollection(constraints);
    this.validationOptions = {
      skipSoftConstraints: false,
      skipInactiveConstraints: true,
      stopOnFirstCritical: false,
      includeWarnings: true,
      includeInfo: true,
      maxViolations: 100,
      ...options,
    };
  }

  /**
   * Validate constraints for a single task
   */
  public validateTask(task: TaskValidationInput): ConstraintValidationResult {
    const startTime = Date.now();
    const violations: ConstraintViolation[] = [];

    // Get applicable constraints for this task
    const applicableConstraints = this.getApplicableConstraints(task.id);

    // Create validation context
    const context = this.createValidationContext(task);

    // Create violation context
    const violationContext: ViolationContext = {
      projectId: task.projectId,
      calculatedAt: new Date(),
      engineVersion: '6.2.0',
      taskCount: 1,
      dependencyCount: task.dependencies?.length || 0,
      userTriggered: true,
      batchValidation: false,
    };

    // Validate each constraint
    for (const constraint of applicableConstraints) {
      if (this.shouldSkipConstraint(constraint)) {
        continue;
      }

      const violation = constraint.validate(context);
      if (violation) {
        violations.push(violation);

        // Stop on first critical if configured
        if (
          this.validationOptions.stopOnFirstCritical &&
          violation.severity === ViolationSeverity.CRITICAL
        ) {
          break;
        }

        // Check max violations limit
        if (
          violations.length >= (this.validationOptions.maxViolations || 100)
        ) {
          break;
        }
      }
    }

    return this.createValidationResult(
      violations,
      applicableConstraints.length,
      startTime,
      violationContext
    );
  }

  /**
   * Validate constraints for multiple tasks (batch validation)
   */
  public validateTasks(
    tasks: TaskValidationInput[]
  ): ConstraintValidationResult {
    const startTime = Date.now();
    const allViolations: ConstraintViolation[] = [];
    let totalConstraints = 0;

    for (const task of tasks) {
      const taskResult = this.validateTask(task);
      allViolations.push(...taskResult.criticalViolations);
      allViolations.push(...taskResult.errorViolations);

      if (this.validationOptions.includeWarnings) {
        allViolations.push(...taskResult.warningViolations);
      }

      if (this.validationOptions.includeInfo) {
        allViolations.push(...taskResult.infoViolations);
      }

      totalConstraints += taskResult.totalConstraints;

      // Stop on first critical across all tasks if configured
      if (
        this.validationOptions.stopOnFirstCritical &&
        taskResult.criticalViolations.length > 0
      ) {
        break;
      }
    }

    // Create batch context
    const batchContext: ViolationContext = {
      projectId: tasks[0]?.projectId || 'unknown',
      calculatedAt: new Date(),
      engineVersion: '6.2.0',
      taskCount: tasks.length,
      dependencyCount: tasks.reduce(
        (sum, task) => sum + (task.dependencies?.length || 0),
        0
      ),
      userTriggered: true,
      batchValidation: true,
    };

    return this.createValidationResult(
      allViolations,
      totalConstraints,
      startTime,
      batchContext
    );
  }

  /**
   * Add constraint to validator
   */
  public addConstraint(constraint: BaseConstraint): void {
    this.constraints.add(constraint);
  }

  /**
   * Remove constraint from validator
   */
  public removeConstraint(constraintId: string): boolean {
    return this.constraints.remove(constraintId);
  }

  /**
   * Get constraint statistics
   */
  public getStatistics() {
    return {
      totalConstraints: this.constraints.getAll().length,
      activeConstraints: this.constraints.getActiveCount(),
      hardConstraints: this.constraints.getByCategory(ConstraintCategory.HARD)
        .length,
      softConstraints: this.constraints.getByCategory(ConstraintCategory.SOFT)
        .length,
      calendarConstraints: this.constraints.getByCategory(
        ConstraintCategory.CALENDAR
      ).length,
    };
  }

  /**
   * Update validation options
   */
  public updateOptions(options: Partial<ValidationOptions>): void {
    this.validationOptions = { ...this.validationOptions, ...options };
  }

  // Private helper methods

  private getApplicableConstraints(taskId: string): BaseConstraint[] {
    return this.constraints.getForTask(taskId);
  }

  private shouldSkipConstraint(constraint: BaseConstraint): boolean {
    if (
      this.validationOptions.skipInactiveConstraints &&
      !constraint.isActive
    ) {
      return true;
    }

    if (
      this.validationOptions.skipSoftConstraints &&
      constraint.category === ConstraintCategory.SOFT
    ) {
      return true;
    }

    return false;
  }

  private createValidationContext(
    task: TaskValidationInput
  ): ValidationContext {
    return {
      taskId: task.id,
      currentStartDate: task.startDate,
      currentFinishDate: task.finishDate,
      currentDuration: task.duration,
      calendarId: task.calendarId,
      resourceAssignments: task.resourceAssignments,
      dependencies: task.dependencies,
    };
  }

  private createValidationResult(
    violations: ConstraintViolation[],
    totalConstraints: number,
    startTime: number,
    context: ViolationContext
  ): ConstraintValidationResult {
    // Categorize violations by severity
    const criticalViolations = violations.filter(
      (v) => v.severity === ViolationSeverity.CRITICAL
    );
    const errorViolations = violations.filter(
      (v) => v.severity === ViolationSeverity.ERROR
    );
    const warningViolations = violations.filter(
      (v) => v.severity === ViolationSeverity.WARNING
    );
    const infoViolations = violations.filter(
      (v) => v.severity === ViolationSeverity.INFO
    );

    // Count auto-fixable suggestions
    const suggestionsGenerated = violations.reduce(
      (sum, v) => sum + v.suggestions.length,
      0
    );
    const autoFixable = violations.reduce(
      (sum, v) => sum + v.suggestions.filter((s) => s.canAutoApply).length,
      0
    );

    return {
      isValid: criticalViolations.length === 0 && errorViolations.length === 0,
      totalConstraints,
      violationCount: violations.length,
      criticalViolations,
      errorViolations,
      warningViolations,
      infoViolations,
      validationDuration: Date.now() - startTime,
      suggestionsGenerated,
      autoFixable,
      context,
    };
  }
}
