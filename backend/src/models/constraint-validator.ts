/**
 * Module 6.6: Constraint Validator
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Main constraint validation orchestrator
 * Dependencies: constraint-types.ts, date-constraint-validator.ts, duration-constraint-validator.ts
 */

import {
  ConstraintParameters,
  ConstraintRule,
  ConstraintType,
  DateConstraintParams,
  DurationConstraintParams,
} from '../types/constraint-types.js';
import { DateConstraintValidator } from './date-constraint-validator.js';
import { DurationConstraintValidator } from './duration-constraint-validator.js';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

/**
 * Task interface (minimal for validation)
 */
export interface TaskForValidation {
  id: string;
  startDate?: Date;
  endDate?: Date;
  duration?: number;
  name: string;
}

/**
 * Main Constraint Validator Class
 */
export class ConstraintValidator {
  private dateValidator: DateConstraintValidator;
  private durationValidator: DurationConstraintValidator;

  constructor() {
    this.dateValidator = new DateConstraintValidator();
    this.durationValidator = new DurationConstraintValidator();
  }

  /**
   * Validate a single constraint against a task
   */
  public validateConstraint(
    constraint: ConstraintRule,
    task: TaskForValidation
  ): ValidationResult {
    try {
      // Quick validation checks
      if (!constraint.isActive) {
        return this.createSuccessResult();
      }

      if (!this.isConstraintApplicable(constraint, task)) {
        return this.createSuccessResult();
      }

      // Route to specific validator based on constraint type
      return this.routeToValidator(constraint, task);
    } catch (error) {
      return this.createErrorResult(
        `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate multiple constraints against a task
   */
  public validateConstraints(
    constraints: ConstraintRule[],
    task: TaskForValidation
  ): ValidationResult[] {
    return constraints.map((constraint) =>
      this.validateConstraint(constraint, task)
    );
  }

  /**
   * Check if constraint is applicable to task
   */
  private isConstraintApplicable(
    constraint: ConstraintRule,
    task: TaskForValidation
  ): boolean {
    // Check scope compatibility
    if (constraint.scope === 'PROJECT' && constraint.targetTaskId !== task.id) {
      return false;
    }

    if (constraint.scope === 'TASK' && constraint.targetTaskId !== task.id) {
      return false;
    }

    return true;
  }

  /**
   * Route validation to specific validator
   */
  private routeToValidator(
    constraint: ConstraintRule,
    task: TaskForValidation
  ): ValidationResult {
    switch (constraint.type) {
      // Date constraints
      case ConstraintType.MUST_START_ON:
      case ConstraintType.MUST_FINISH_ON:
      case ConstraintType.FINISH_NO_LATER_THAN:
      case ConstraintType.START_NO_EARLIER_THAN:
        return this.validateDateConstraint(constraint, task);

      // Duration constraints
      case ConstraintType.MIN_DURATION:
      case ConstraintType.MAX_DURATION:
      case ConstraintType.FIXED_DURATION:
        return this.validateDurationConstraint(constraint, task);

      // Other constraints (basic validation)
      default:
        return this.createSuccessResult();
    }
  }

  /**
   * Validate date constraint
   */
  private validateDateConstraint(
    constraint: ConstraintRule,
    task: TaskForValidation
  ): ValidationResult {
    const _params = constraint.parameters as DateConstraintParams;

    // Basic validation - need actual dates to validate properly
    if (!task.startDate || !task.endDate) {
      return this.createErrorResult(
        'Task must have start and end dates for date constraint validation'
      );
    }

    // TODO: Use DateConstraintValidator static methods once interface is aligned
    return this.createSuccessResult();
  }

  /**
   * Validate duration constraint
   */
  private validateDurationConstraint(
    constraint: ConstraintRule,
    task: TaskForValidation
  ): ValidationResult {
    const _params = constraint.parameters as DurationConstraintParams;

    // Basic validation - need duration to validate properly
    if (!task.duration) {
      return this.createErrorResult(
        'Task must have duration for duration constraint validation'
      );
    }

    // TODO: Use DurationConstraintValidator static methods once interface is aligned
    return this.createSuccessResult();
  }

  /**
   * Validate constraint parameters
   */
  public validateConstraintParameters(
    _type: ConstraintType,
    _parameters: ConstraintParameters
  ): ValidationResult {
    // Basic parameter validation
    // TODO: Implement detailed parameter validation
    return this.createSuccessResult();
  }

  /**
   * Create success result
   */
  private createSuccessResult(): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [],
    };
  }

  /**
   * Create error result
   */
  private createErrorResult(message: string): ValidationResult {
    return {
      isValid: false,
      errors: [message],
      warnings: [],
    };
  }
}

// Re-export specialized validators
export { DateConstraintValidator } from './date-constraint-validator.js';
export { DurationConstraintValidator } from './duration-constraint-validator.js';
