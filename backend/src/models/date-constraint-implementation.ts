/**
 * Module 6.8: Date Constraint Implementation
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Date-based constraint validation implementation
 * Dependencies: constraint-models.ts, constraint-types.ts
 */

import {
  ConstraintType,
  DateConstraintParams,
  ViolationSuggestion,
} from '../types/constraint-types.js';
import { BaseConstraint, ValidationContext } from './constraint-models.js';

/**
 * Date-based Constraint Implementation
 */
export class DateConstraint extends BaseConstraint {
  private get dateParams(): DateConstraintParams {
    return this.parameters as DateConstraintParams;
  }

  validate(context: ValidationContext) {
    const { targetDate, tolerance = 0 } = this.dateParams;

    const dateInfo = this.getDateInfo(context);
    if (!dateInfo.actualDate) {
      return this.createViolation(
        `Missing ${dateInfo.comparison} date for constraint validation`,
        'N/A',
        this.formatDate(targetDate),
        context
      );
    }

    const violation = this.checkDateViolation(
      dateInfo.actualDate,
      targetDate,
      tolerance
    );
    if (violation) {
      return this.createViolation(
        violation.message,
        this.formatDate(dateInfo.actualDate),
        this.formatDate(targetDate),
        context,
        violation.suggestions
      );
    }

    return null;
  }

  private getDateInfo(context: ValidationContext) {
    switch (this.type) {
      case ConstraintType.FINISH_NO_LATER_THAN:
      case ConstraintType.MUST_FINISH_ON:
        return {
          actualDate: context.currentFinishDate,
          comparison: 'finish',
        };
      case ConstraintType.START_NO_EARLIER_THAN:
      case ConstraintType.MUST_START_ON:
        return {
          actualDate: context.currentStartDate,
          comparison: 'start',
        };
      default:
        return {
          actualDate: undefined,
          comparison: 'unknown',
        };
    }
  }

  private checkDateViolation(
    actualDate: Date,
    targetDate: Date,
    tolerance: number
  ) {
    const daysDiff = Math.ceil(
      (actualDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    switch (this.type) {
      case ConstraintType.FINISH_NO_LATER_THAN:
        return this.validateFinishNoLaterThan(
          daysDiff,
          tolerance,
          actualDate,
          targetDate
        );

      case ConstraintType.START_NO_EARLIER_THAN:
        return this.validateStartNoEarlierThan(
          daysDiff,
          tolerance,
          actualDate,
          targetDate
        );

      case ConstraintType.MUST_FINISH_ON:
      case ConstraintType.MUST_START_ON:
        return this.validateMustDate(
          daysDiff,
          tolerance,
          actualDate,
          targetDate
        );

      default:
        return null;
    }
  }

  private validateFinishNoLaterThan(
    daysDiff: number,
    tolerance: number,
    actualDate: Date,
    targetDate: Date
  ) {
    if (daysDiff > tolerance) {
      return {
        message: `Task finishes ${daysDiff} day(s) after the latest allowed date`,
        suggestions: this.generateDateSuggestions(
          'FINISH',
          actualDate,
          targetDate
        ),
      };
    }
    return null;
  }

  private validateStartNoEarlierThan(
    daysDiff: number,
    tolerance: number,
    actualDate: Date,
    targetDate: Date
  ) {
    if (daysDiff < -tolerance) {
      return {
        message: `Task starts ${Math.abs(daysDiff)} day(s) before the earliest allowed date`,
        suggestions: this.generateDateSuggestions(
          'START',
          actualDate,
          targetDate
        ),
      };
    }
    return null;
  }

  private validateMustDate(
    daysDiff: number,
    tolerance: number,
    actualDate: Date,
    targetDate: Date
  ) {
    if (Math.abs(daysDiff) > tolerance) {
      const dateType = this.type.includes('START') ? 'start' : 'finish';
      return {
        message: `Task ${dateType} date deviates by ${Math.abs(daysDiff)} day(s)`,
        suggestions: this.generateDateSuggestions(
          this.type.includes('START') ? 'START' : 'FINISH',
          actualDate,
          targetDate
        ),
      };
    }
    return null;
  }

  private generateDateSuggestions(
    dateType: 'START' | 'FINISH',
    actualDate: Date,
    targetDate: Date
  ): ViolationSuggestion[] {
    return [
      {
        id: `adjust-${dateType.toLowerCase()}-date`,
        type: 'ADJUST_DATE',
        description: `Adjust task ${dateType.toLowerCase()} date to ${this.formatDate(targetDate)}`,
        impact: 'MEDIUM',
        proposedChanges: [
          {
            taskId: this.targetTaskId || '',
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

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
