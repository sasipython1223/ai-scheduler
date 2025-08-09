/**
 * Module 6.2: Constraint Validator Implementation
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Core constraint validation engine
 * Dependencies: Module 6.1 constraint types and models
 */

import {
  BaseConstraintModel,
  ConstraintCollection,
} from '../module6.1-constraint-types/constraint-models.js';
import {
  IConstraintValidationResult,
  ITaskForValidation,
} from '../shared-types.js';

/**
 * Validation options configuration
 */
export interface ValidationOptions {
  skipSoftConstraints?: boolean;
  skipInactiveConstraints?: boolean;
  stopOnFirstCritical?: boolean;
  includeWarnings?: boolean;
  includeInfo?: boolean;
  maxViolations?: number;
}

/**
 * Core constraint validator class
 */
export class ConstraintValidator {
  private constraints: ConstraintCollection;
  private options: ValidationOptions;

  constructor(
    constraints: BaseConstraintModel[] = [],
    options: ValidationOptions = {}
  ) {
    this.constraints = new ConstraintCollection(constraints);
    this.options = {
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
  public validateTask(task: ITaskForValidation): IConstraintValidationResult {
    // Implementation will be added in detailed development
    return {
      isValid: true,
      totalConstraints: 0,
      violationCount: 0,
      criticalViolations: [],
      errorViolations: [],
      warningViolations: [],
      infoViolations: [],
      validationDuration: 0,
      suggestionsGenerated: 0,
      autoFixable: 0,
      context: {
        projectId: task.projectId,
        calculatedAt: new Date(),
        engineVersion: '6.2.0',
        taskCount: 1,
        dependencyCount: task.dependencies?.length || 0,
        userTriggered: true,
        batchValidation: false,
      },
    };
  }

  /**
   * Validate multiple tasks in batch
   */
  public validateTasks(
    tasks: ITaskForValidation[]
  ): IConstraintValidationResult {
    // Implementation will be added in detailed development
    return this.validateTask(tasks[0] || ({} as ITaskForValidation));
  }

  /**
   * Add constraint to validator
   */
  public addConstraint(constraint: BaseConstraintModel): void {
    this.constraints.add(constraint);
  }

  /**
   * Remove constraint from validator
   */
  public removeConstraint(constraintId: string): boolean {
    return this.constraints.remove(constraintId);
  }

  /**
   * Update validation options
   */
  public updateOptions(newOptions: Partial<ValidationOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Get constraint statistics
   */
  public getStatistics() {
    return {
      totalConstraints: this.constraints.getAll().length,
      activeConstraints: this.constraints.getActiveCount(),
    };
  }
}
