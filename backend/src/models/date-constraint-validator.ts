/**
 * Module 6.1: Date Constraint Validation Logic
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Date constraint validation utilities and helpers
 * Dependencies: constraint-types.ts
 */

import {
  ConstraintType,
  ViolationSuggestion,
} from '../types/constraint-types.js';

/**
 * Date Validation Result
 */
export interface DateValidationResult {
  message: string;
  suggestions: ViolationSuggestion[];
}

/**
 * Date Information Interface
 */
export interface DateInfo {
  actualDate: Date | null;
  comparison: string;
}

/**
 * Date Constraint Validation Utilities
 */
export class DateConstraintValidator {
  /**
   * Check for date constraint violations
   */
  static checkDateViolation(
    type: ConstraintType,
    actualDate: Date,
    targetDate: Date,
    tolerance: number,
    targetTaskId?: string
  ): DateValidationResult | null {
    const daysDiff = this.calculateDaysDifference(actualDate, targetDate);

    switch (type) {
      case ConstraintType.FINISH_NO_LATER_THAN:
        return this.validateFinishNoLaterThan(
          daysDiff,
          tolerance,
          actualDate,
          targetDate,
          targetTaskId
        );

      case ConstraintType.START_NO_EARLIER_THAN:
        return this.validateStartNoEarlierThan(
          daysDiff,
          tolerance,
          actualDate,
          targetDate,
          targetTaskId
        );

      case ConstraintType.MUST_FINISH_ON:
      case ConstraintType.MUST_START_ON:
        return this.validateMustDate(type, {
          daysDiff,
          tolerance,
          actualDate,
          targetDate,
          targetTaskId,
        });

      default:
        return null;
    }
  }

  /**
   * Calculate days difference between dates
   */
  private static calculateDaysDifference(actual: Date, target: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((actual.getTime() - target.getTime()) / msPerDay);
  }

  /**
   * Validate finish no later than constraint
   */
  private static validateFinishNoLaterThan(
    daysDiff: number,
    tolerance: number,
    actualDate: Date,
    targetDate: Date,
    targetTaskId?: string
  ): DateValidationResult | null {
    if (daysDiff > tolerance) {
      return {
        message: `Task finishes ${daysDiff} day(s) after the latest allowed date`,
        suggestions: this.generateDateSuggestions(
          'FINISH',
          actualDate,
          targetDate,
          targetTaskId
        ),
      };
    }
    return null;
  }

  /**
   * Validate start no earlier than constraint
   */
  private static validateStartNoEarlierThan(
    daysDiff: number,
    tolerance: number,
    actualDate: Date,
    targetDate: Date,
    targetTaskId?: string
  ): DateValidationResult | null {
    if (daysDiff < -tolerance) {
      return {
        message: `Task starts ${Math.abs(daysDiff)} day(s) before the earliest allowed date`,
        suggestions: this.generateDateSuggestions(
          'START',
          actualDate,
          targetDate,
          targetTaskId
        ),
      };
    }
    return null;
  }

  /**
   * Validate must date constraint
   */
  private static validateMustDate(
    type: ConstraintType,
    params: {
      daysDiff: number;
      tolerance: number;
      actualDate: Date;
      targetDate: Date;
      targetTaskId?: string;
    }
  ): DateValidationResult | null {
    const { daysDiff, tolerance, actualDate, targetDate, targetTaskId } =
      params;

    if (Math.abs(daysDiff) > tolerance) {
      const dateType = type.includes('START') ? 'start' : 'finish';
      return {
        message: `Task ${dateType} date deviates by ${Math.abs(daysDiff)} day(s)`,
        suggestions: this.generateDateSuggestions(
          type.includes('START') ? 'START' : 'FINISH',
          actualDate,
          targetDate,
          targetTaskId
        ),
      };
    }
    return null;
  }

  /**
   * Generate date adjustment suggestions
   */
  private static generateDateSuggestions(
    dateType: 'START' | 'FINISH',
    actualDate: Date,
    targetDate: Date,
    targetTaskId?: string
  ): ViolationSuggestion[] {
    return [
      {
        id: `adjust-${dateType.toLowerCase()}-date`,
        type: 'ADJUST_DATE',
        description: `Adjust task ${dateType.toLowerCase()} date to ${this.formatDate(targetDate)}`,
        impact: 'MEDIUM',
        proposedChanges: [
          {
            taskId: targetTaskId || '',
            field: dateType === 'START' ? 'startDate' : 'finishDate',
            currentValue: this.formatDate(actualDate),
            proposedValue: this.formatDate(targetDate),
          },
        ],
        canAutoApply: true,
        confidence: 85,
      },
    ];
  }

  /**
   * Format date for display
   */
  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get date information for constraint validation
   */
  static getDateInfo(
    type: ConstraintType,
    context: {
      currentStartDate?: Date;
      currentFinishDate?: Date;
    }
  ): DateInfo {
    switch (type) {
      case ConstraintType.FINISH_NO_LATER_THAN:
      case ConstraintType.MUST_FINISH_ON:
        return {
          actualDate: context.currentFinishDate || null,
          comparison: 'finish',
        };

      case ConstraintType.START_NO_EARLIER_THAN:
      case ConstraintType.MUST_START_ON:
        return {
          actualDate: context.currentStartDate || null,
          comparison: 'start',
        };

      default:
        return {
          actualDate: null,
          comparison: 'unknown',
        };
    }
  }
}
