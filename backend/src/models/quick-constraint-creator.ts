/**
 * Module 6.7: Quick Constraint Creators
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Quick constraint creation utilities for common cases
 * Dependencies: constraint-types.ts, constraint-models.ts
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

/**
 * Quick Date Constraint Creation Options
 */
export interface QuickDateConstraintOptions {
  tolerance?: number;
  severity?: ViolationSeverity;
  name?: string;
}

/**
 * Quick Duration Constraint Creation Options
 */
export interface QuickDurationConstraintOptions {
  tolerance?: number;
  severity?: ViolationSeverity;
  name?: string;
  unit?: 'DAYS' | 'HOURS' | 'WEEKS';
}

/**
 * Quick Constraint Creators
 */
export class QuickConstraintCreator {
  /**
   * Create quick date constraint
   */
  static createDateConstraint(
    type:
      | ConstraintType.FINISH_NO_LATER_THAN
      | ConstraintType.START_NO_EARLIER_THAN
      | ConstraintType.MUST_FINISH_ON
      | ConstraintType.MUST_START_ON,
    targetDate: Date,
    taskId: string,
    options: QuickDateConstraintOptions = {}
  ): BaseConstraint {
    const params: DateConstraintParams = {
      targetDate,
      tolerance: options.tolerance || 0,
    };

    const _config: ConstraintRule = {
      id: `date-constraint-${Date.now()}`,
      name: options.name || `${type} ${targetDate.toISOString().split('T')[0]}`,
      description: `Task must ${type.toLowerCase().replace(/_/g, ' ')} ${targetDate.toDateString()}`,
      type,
      category:
        type === ConstraintType.MUST_FINISH_ON ||
        type === ConstraintType.MUST_START_ON
          ? ConstraintCategory.HARD
          : ConstraintCategory.SOFT,
      severity: options.severity || ViolationSeverity.WARNING,
      scope: ConstraintScope.TASK,
      targetTaskId: taskId,
      parameters: params,
      isActive: true,
      createdDate: new Date(),
      modifiedDate: new Date(),
      createdBy: 'factory',
    };

    // TODO: Replace with actual constraint instantiation
    throw new Error(
      `Quick date constraint creation not yet implemented for type: ${type}. ` +
        'Implementation classes need to be created and imported.'
    );
  }

  /**
   * Create quick duration constraint
   */
  static createDurationConstraint(
    type:
      | ConstraintType.MIN_DURATION
      | ConstraintType.MAX_DURATION
      | ConstraintType.FIXED_DURATION,
    duration: number,
    taskId: string,
    options: QuickDurationConstraintOptions = {}
  ): BaseConstraint {
    const params = this.buildDurationParams(type, duration, options);
    const _config = this.buildDurationConstraintConfig(
      type,
      duration,
      taskId,
      params,
      options
    );

    // TODO: Replace with actual constraint instantiation
    throw new Error(
      `Quick duration constraint creation not yet implemented for type: ${type}. ` +
        'Implementation classes need to be created and imported.'
    );
  }

  /**
   * Build duration constraint parameters
   */
  private static buildDurationParams(
    type:
      | ConstraintType.MIN_DURATION
      | ConstraintType.MAX_DURATION
      | ConstraintType.FIXED_DURATION,
    duration: number,
    options: QuickDurationConstraintOptions
  ): DurationConstraintParams {
    const unit = options.unit || 'DAYS';
    const baseParams = { unit, tolerance: options.tolerance || 0 };

    switch (type) {
      case ConstraintType.MIN_DURATION:
        return {
          ...baseParams,
          minDuration: duration,
        } as DurationConstraintParams;
      case ConstraintType.MAX_DURATION:
        return {
          ...baseParams,
          maxDuration: duration,
        } as DurationConstraintParams;
      case ConstraintType.FIXED_DURATION:
        return {
          ...baseParams,
          fixedDuration: duration,
        } as DurationConstraintParams;
      default:
        throw new Error(`Unsupported duration constraint type: ${type}`);
    }
  }

  /**
   * Build duration constraint configuration
   */
  private static buildDurationConstraintConfig(
    type: ConstraintType,
    duration: number,
    taskId: string,
    params: DurationConstraintParams,
    options: QuickDurationConstraintOptions
  ): ConstraintRule {
    return {
      id: `duration-constraint-${Date.now()}`,
      name: options.name || `${type} ${duration} ${options.unit || 'DAYS'}`,
      description: `Task must have ${type.toLowerCase().replace(/_/g, ' ')} of ${duration} ${(options.unit || 'DAYS').toLowerCase()}`,
      type,
      category:
        type === ConstraintType.FIXED_DURATION
          ? ConstraintCategory.HARD
          : ConstraintCategory.SOFT,
      severity: options.severity || ViolationSeverity.WARNING,
      scope: ConstraintScope.TASK,
      targetTaskId: taskId,
      parameters: params,
      isActive: true,
      createdDate: new Date(),
      modifiedDate: new Date(),
      createdBy: 'factory',
    };
  }

  /**
   * Create multiple constraints for a task
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
    return constraints.map((constraintDef) => {
      const _config: ConstraintRule = {
        id: `constraint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: constraintDef.options?.name || `${constraintDef.type} constraint`,
        description: `Generated constraint for task ${taskId}`,
        type: constraintDef.type,
        category: this.inferCategory(constraintDef.type),
        severity: constraintDef.options?.severity || ViolationSeverity.WARNING,
        scope: ConstraintScope.TASK,
        targetTaskId: taskId,
        parameters: constraintDef.parameters,
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'batch-factory',
      };

      // TODO: Replace with actual constraint instantiation
      throw new Error(
        `Batch constraint creation not yet implemented for type: ${constraintDef.type}. ` +
          'Implementation classes need to be created and imported.'
      );
    });
  }

  /**
   * Infer constraint category from type
   */
  private static inferCategory(type: ConstraintType): ConstraintCategory {
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
}
