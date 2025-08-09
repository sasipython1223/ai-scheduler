/**
 * Module 6.1: Duration Constraint Validation Logic
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Duration constraint validation utilities and helpers
 * Dependencies: constraint-types.ts
 */

import {
  ConstraintType,
  DurationConstraintParams,
  ViolationSuggestion,
} from '../types/constraint-types.js';

/**
 * Duration Validation Result
 */
export interface DurationValidationResult {
  message: string;
  suggestions: ViolationSuggestion[];
}

/**
 * Duration Constraint Validation Utilities
 */
export class DurationConstraintValidator {
  /**
   * Check for duration constraint violations
   */
  static checkDurationViolation(
    type: ConstraintType,
    parameters: DurationConstraintParams,
    currentDuration: number,
    targetTaskId?: string
  ): DurationValidationResult | null {
    const { unit } = parameters;
    const actualDuration = this.convertToStandardUnit(currentDuration, unit);

    switch (type) {
      case ConstraintType.FIXED_DURATION:
        return this.validateFixedDuration(
          parameters,
          actualDuration,
          targetTaskId
        );

      case ConstraintType.MIN_DURATION:
        return this.validateMinDuration(
          parameters,
          actualDuration,
          targetTaskId
        );

      case ConstraintType.MAX_DURATION:
        return this.validateMaxDuration(
          parameters,
          actualDuration,
          targetTaskId
        );

      default:
        return null;
    }
  }

  /**
   * Convert duration to standard unit for comparison
   */
  private static convertToStandardUnit(duration: number, unit: string): number {
    switch (unit) {
      case 'HOURS':
        return duration / (1000 * 60 * 60); // Convert ms to hours
      case 'DAYS':
        return duration / (1000 * 60 * 60 * 24); // Convert ms to days
      case 'WEEKS':
        return duration / (1000 * 60 * 60 * 24 * 7); // Convert ms to weeks
      default:
        return duration;
    }
  }

  /**
   * Validate fixed duration constraint
   */
  private static validateFixedDuration(
    parameters: DurationConstraintParams,
    actualDuration: number,
    targetTaskId?: string
  ): DurationValidationResult | null {
    const typedParams = parameters as DurationConstraintParams & {
      fixedDuration: number;
    };
    const { fixedDuration, unit } = typedParams;

    if (actualDuration !== fixedDuration) {
      return {
        message: `Task duration (${actualDuration} ${unit.toLowerCase()}) must be exactly ${fixedDuration} ${unit.toLowerCase()}`,
        suggestions: this.generateDurationSuggestions(
          'FIXED',
          fixedDuration,
          unit,
          targetTaskId
        ),
      };
    }
    return null;
  }

  /**
   * Validate minimum duration constraint
   */
  private static validateMinDuration(
    parameters: DurationConstraintParams,
    actualDuration: number,
    targetTaskId?: string
  ): DurationValidationResult | null {
    const typedParams = parameters as DurationConstraintParams & {
      minDuration: number;
    };
    const { minDuration, unit } = typedParams;

    if (actualDuration < minDuration) {
      return {
        message: `Task duration (${actualDuration} ${unit.toLowerCase()}) is below minimum ${minDuration} ${unit.toLowerCase()}`,
        suggestions: this.generateDurationSuggestions(
          'MIN',
          minDuration,
          unit,
          targetTaskId
        ),
      };
    }
    return null;
  }

  /**
   * Validate maximum duration constraint
   */
  private static validateMaxDuration(
    parameters: DurationConstraintParams,
    actualDuration: number,
    targetTaskId?: string
  ): DurationValidationResult | null {
    const typedParams = parameters as DurationConstraintParams & {
      maxDuration: number;
    };
    const { maxDuration, unit } = typedParams;

    if (actualDuration > maxDuration) {
      return {
        message: `Task duration (${actualDuration} ${unit.toLowerCase()}) exceeds maximum ${maxDuration} ${unit.toLowerCase()}`,
        suggestions: this.generateDurationSuggestions(
          'MAX',
          maxDuration,
          unit,
          targetTaskId
        ),
      };
    }
    return null;
  }

  /**
   * Generate duration adjustment suggestions
   */
  private static generateDurationSuggestions(
    constraintType: 'FIXED' | 'MIN' | 'MAX',
    targetDuration: number,
    unit: string,
    targetTaskId?: string
  ): ViolationSuggestion[] {
    return [
      {
        id: `adjust-duration-${constraintType.toLowerCase()}`,
        type: 'CHANGE_DURATION',
        description: `Adjust task duration to ${targetDuration} ${unit.toLowerCase()}`,
        impact: 'MEDIUM',
        proposedChanges: [
          {
            taskId: targetTaskId || '',
            field: 'duration',
            currentValue: 'current',
            proposedValue: targetDuration.toString(),
          },
        ],
        canAutoApply: false, // Duration changes affect schedule
        confidence: 70,
      },
      {
        id: `reassign-resource-${constraintType.toLowerCase()}`,
        type: 'REASSIGN_RESOURCE',
        description: `Consider reassigning resources to meet duration constraint`,
        impact: 'HIGH',
        proposedChanges: [
          {
            taskId: targetTaskId || '',
            field: 'resources',
            currentValue: 'current',
            proposedValue: 'optimized',
          },
        ],
        canAutoApply: false,
        confidence: 60,
      },
    ];
  }

  /**
   * Get duration constraint parameters safely
   */
  static getDurationParams(
    type: ConstraintType,
    parameters: DurationConstraintParams
  ): {
    minDuration?: number;
    maxDuration?: number;
    fixedDuration?: number;
    unit: string;
  } {
    const { unit } = parameters;
    const result: Record<string, unknown> = { unit };

    const typedParams = parameters as DurationConstraintParams & {
      minDuration?: number;
      maxDuration?: number;
      fixedDuration?: number;
    };

    switch (type) {
      case ConstraintType.MIN_DURATION:
        result.minDuration = typedParams.minDuration;
        break;
      case ConstraintType.MAX_DURATION:
        result.maxDuration = typedParams.maxDuration;
        break;
      case ConstraintType.FIXED_DURATION:
        result.fixedDuration = typedParams.fixedDuration;
        break;
    }

    return result as {
      minDuration?: number;
      maxDuration?: number;
      fixedDuration?: number;
      unit: string;
    };
  }
}
