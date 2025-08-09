/**
 * Module 6.2: Constraint Factory Utilities (Core)
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Core constraint factory utilities and validation
 * Dependencies: constraint-types.ts, constraint-models.ts, constraint-parameter-validator.ts
 */

import {
  ConstraintCategory,
  ConstraintRule,
  ConstraintScope,
  ConstraintType,
  DateConstraintParams,
  DurationConstraintParams,
  ViolationSeverity,
} from '../types/constraint-types.js';
import { BaseConstraint } from './constraint-models.js';
import {
  ConstraintParameterValidator,
  ValidationResult,
} from './constraint-parameter-validator.js';
import { QuickConstraintCreator } from './quick-constraint-creator.js';

/**
 * Core Constraint Factory Utilities
 */
export class ConstraintFactoryUtils {
  /**
   * Create constraint from configuration (public method)
   */
  public static createConstraintFromConfig(
    config: ConstraintRule
  ): BaseConstraint {
    // TODO: Implement constraint instantiation once constraint classes are available
    // For now, throw an error indicating incomplete implementation
    throw new Error(
      `Constraint creation not yet implemented for type: ${config.type}. ` +
        'Implementation classes need to be created and imported.'
    );
  }

  /**
   * Create multiple constraints from configurations
   */
  static createMultipleConstraints(rules: ConstraintRule[]): BaseConstraint[] {
    return rules.map((rule) => this.createConstraintFromConfig(rule));
  }

  /**
   * Validate constraint parameters
   */
  static validateConstraintParameters(
    type: ConstraintType,
    parameters: Record<string, unknown>
  ): ValidationResult {
    return ConstraintParameterValidator.validateParameters(type, parameters);
  }

  /**
   * Create quick date constraint (delegated to QuickConstraintCreator)
   */
  static createDateConstraint(
    type:
      | ConstraintType.FINISH_NO_LATER_THAN
      | ConstraintType.START_NO_EARLIER_THAN
      | ConstraintType.MUST_FINISH_ON
      | ConstraintType.MUST_START_ON,
    targetDate: Date,
    taskId: string,
    options: Parameters<
      typeof QuickConstraintCreator.createDateConstraint
    >[3] = {}
  ): BaseConstraint {
    return QuickConstraintCreator.createDateConstraint(
      type,
      targetDate,
      taskId,
      options
    );
  }

  /**
   * Create quick duration constraint (delegated to QuickConstraintCreator)
   */
  static createDurationConstraint(
    type:
      | ConstraintType.MIN_DURATION
      | ConstraintType.MAX_DURATION
      | ConstraintType.FIXED_DURATION,
    duration: number,
    taskId: string,
    options: Parameters<
      typeof QuickConstraintCreator.createDurationConstraint
    >[3] = {}
  ): BaseConstraint {
    return QuickConstraintCreator.createDurationConstraint(
      type,
      duration,
      taskId,
      options
    );
  }

  /**
   * Infer constraint category from type
   */
  static inferCategory(type: ConstraintType): ConstraintCategory {
    switch (type) {
      case ConstraintType.MUST_FINISH_ON:
      case ConstraintType.MUST_START_ON:
      case ConstraintType.FIXED_DURATION:
      case ConstraintType.MANDATORY_DEPENDENCY:
        return ConstraintCategory.HARD;

      case ConstraintType.WORK_CALENDAR_ONLY:
      case ConstraintType.EXCLUDE_HOLIDAYS:
      case ConstraintType.PREFERRED_WORK_DAYS:
        return ConstraintCategory.CALENDAR;

      default:
        return ConstraintCategory.SOFT;
    }
  }

  /**
   * Create multiple constraints for a task (delegated to QuickConstraintCreator)
   */
  static createTaskConstraints(
    taskId: string,
    constraints: Array<{
      type: ConstraintType;
      parameters: DateConstraintParams | DurationConstraintParams;
      options?: {
        name?: string;
        severity?: ViolationSeverity;
      };
    }>
  ): BaseConstraint[] {
    return QuickConstraintCreator.createTaskConstraints(taskId, constraints);
  }

  /**
   * Validate constraint rule structure
   */
  static validateConstraintRule(rule: ConstraintRule): ValidationResult {
    const errors: string[] = [];

    // Required fields validation
    if (!rule.id) errors.push('Constraint ID is required');
    if (!rule.name) errors.push('Constraint name is required');
    if (!rule.type) errors.push('Constraint type is required');
    if (!rule.category) errors.push('Constraint category is required');
    if (!rule.scope) errors.push('Constraint scope is required');

    // Parameters validation
    if (!rule.parameters) {
      errors.push('Constraint parameters are required');
    } else {
      const paramValidation = this.validateConstraintParameters(
        rule.type,
        rule.parameters as Record<string, unknown>
      );
      if (!paramValidation.isValid) {
        errors.push(...paramValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create constraint rule template
   */
  static createConstraintRuleTemplate(
    type: ConstraintType,
    taskId: string,
    overrides: Partial<ConstraintRule> = {}
  ): ConstraintRule {
    const defaults = this.getConstraintDefaults(type, taskId);
    return { ...defaults, ...overrides };
  }

  /**
   * Get default values for constraint rule
   */
  private static getConstraintDefaults(type: ConstraintType, taskId: string) {
    return {
      id: `constraint-${Date.now()}`,
      name: `${type} constraint`,
      description: `Constraint of type ${type}`,
      type,
      category: this.inferCategory(type),
      severity: ViolationSeverity.WARNING,
      scope: ConstraintScope.TASK,
      targetTaskId: taskId,
      parameters: {},
      isActive: true,
      createdDate: new Date(),
      modifiedDate: new Date(),
      createdBy: 'system',
    };
  }
}

// Re-export quick constraint creator for convenience
export { QuickConstraintCreator } from './quick-constraint-creator.js';
