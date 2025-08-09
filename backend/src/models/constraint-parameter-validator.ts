/**
 * Module 6.1: Constraint Parameter Validation
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Parameter validation utilities for constraints
 * Dependencies: constraint-types.ts
 */

import {
  ConstraintType,
  DateConstraintParams,
  DurationConstraintParams,
} from '../types/constraint-types.js';

/**
 * Validation Result Interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Constraint Parameter Validator
 */
export class ConstraintParameterValidator {
  /**
   * Validate constraint parameters based on type
   */
  static validateParameters(
    type: ConstraintType,
    parameters:
      | DateConstraintParams
      | DurationConstraintParams
      | Record<string, unknown>
  ): ValidationResult {
    switch (type) {
      case ConstraintType.FINISH_NO_LATER_THAN:
      case ConstraintType.START_NO_EARLIER_THAN:
      case ConstraintType.MUST_FINISH_ON:
      case ConstraintType.MUST_START_ON:
        return this.validateDateParameters(parameters as DateConstraintParams);

      case ConstraintType.MIN_DURATION:
      case ConstraintType.MAX_DURATION:
      case ConstraintType.FIXED_DURATION:
        return this.validateDurationParameters(
          type,
          parameters as DurationConstraintParams
        );

      default:
        return {
          isValid: false,
          errors: [`Validation not implemented for constraint type: ${type}`],
        };
    }
  }

  /**
   * Validate date constraint parameters
   */
  private static validateDateParameters(
    parameters: DateConstraintParams
  ): ValidationResult {
    const errors: string[] = [];

    if (!parameters.targetDate) {
      errors.push('targetDate is required for date constraints');
    } else if (!(parameters.targetDate instanceof Date)) {
      errors.push('targetDate must be a valid Date object');
    } else if (isNaN(parameters.targetDate.getTime())) {
      errors.push('targetDate must be a valid date');
    }

    if (parameters.tolerance !== undefined && parameters.tolerance < 0) {
      errors.push('tolerance must be non-negative');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate duration constraint parameters
   */
  private static validateDurationParameters(
    type: ConstraintType,
    parameters: DurationConstraintParams
  ): ValidationResult {
    const errors: string[] = [];

    if (!parameters.unit) {
      errors.push('unit is required for duration constraints');
    } else if (!['DAYS', 'HOURS', 'WEEKS'].includes(parameters.unit)) {
      errors.push('unit must be one of: DAYS, HOURS, WEEKS');
    }

    // Type-specific validations
    if (type === ConstraintType.MIN_DURATION) {
      errors.push(...this.validateMinDuration(parameters));
    } else if (type === ConstraintType.MAX_DURATION) {
      errors.push(...this.validateMaxDuration(parameters));
    } else if (type === ConstraintType.FIXED_DURATION) {
      errors.push(...this.validateFixedDuration(parameters));
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate minimum duration parameters
   */
  private static validateMinDuration(
    parameters: DurationConstraintParams
  ): string[] {
    const errors: string[] = [];
    const typedParams = parameters as DurationConstraintParams & {
      minDuration?: number;
    };

    if (typeof typedParams.minDuration !== 'number') {
      errors.push('minDuration must be a number');
    } else if (typedParams.minDuration <= 0) {
      errors.push('minDuration must be positive');
    }

    return errors;
  }

  /**
   * Validate maximum duration parameters
   */
  private static validateMaxDuration(
    parameters: DurationConstraintParams
  ): string[] {
    const errors: string[] = [];
    const typedParams = parameters as DurationConstraintParams & {
      maxDuration?: number;
    };

    if (typeof typedParams.maxDuration !== 'number') {
      errors.push('maxDuration must be a number');
    } else if (typedParams.maxDuration <= 0) {
      errors.push('maxDuration must be positive');
    }

    return errors;
  }

  /**
   * Validate fixed duration parameters
   */
  private static validateFixedDuration(
    parameters: DurationConstraintParams
  ): string[] {
    const errors: string[] = [];
    const typedParams = parameters as DurationConstraintParams & {
      fixedDuration?: number;
    };

    if (typeof typedParams.fixedDuration !== 'number') {
      errors.push('fixedDuration must be a number');
    } else if (typedParams.fixedDuration <= 0) {
      errors.push('fixedDuration must be positive');
    }

    return errors;
  }

  /**
   * Check if parameters match constraint type
   */
  static isParameterTypeMatch(
    type: ConstraintType,
    parameters:
      | DateConstraintParams
      | DurationConstraintParams
      | Record<string, unknown>
  ): boolean {
    const dateTypes = [
      ConstraintType.FINISH_NO_LATER_THAN,
      ConstraintType.START_NO_EARLIER_THAN,
      ConstraintType.MUST_FINISH_ON,
      ConstraintType.MUST_START_ON,
    ];

    const durationTypes = [
      ConstraintType.MIN_DURATION,
      ConstraintType.MAX_DURATION,
      ConstraintType.FIXED_DURATION,
    ];

    if (dateTypes.includes(type)) {
      return 'targetDate' in parameters;
    }

    if (durationTypes.includes(type)) {
      return 'unit' in parameters;
    }

    return false;
  }
}
