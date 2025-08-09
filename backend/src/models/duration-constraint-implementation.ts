/**
 * Module 6.9: Duration Constraint Implementation
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Duration-based constraint validation implementation
 * Dependencies: constraint-models.ts, constraint-types.ts
 */

import {
  DurationConstraintParams,
  ViolationSuggestion,
} from '../types/constraint-types.js';
import { BaseConstraint, ValidationContext } from './constraint-models.js';

/**
 * Duration-based Constraint Implementation
 */
export class DurationConstraint extends BaseConstraint {
  private get durationParams(): DurationConstraintParams {
    return this.parameters as DurationConstraintParams;
  }

  validate(context: ValidationContext) {
    if (!context.currentDuration) {
      return this.createViolation(
        'Missing duration for constraint validation',
        'N/A',
        this.getExpectedDuration(),
        context
      );
    }

    const actualDays = this.convertToStandardUnit(context.currentDuration);
    const validation = this.validateDuration(actualDays);

    if (validation) {
      return this.createViolation(
        validation.message,
        actualDays,
        validation.expectedValue,
        context,
        validation.suggestions
      );
    }

    return null;
  }

  private getExpectedDuration() {
    const { fixedDuration, minDuration, maxDuration } = this.durationParams;
    return fixedDuration || minDuration || maxDuration || 0;
  }

  private convertToStandardUnit(duration: number): number {
    const { unit } = this.durationParams;
    switch (unit) {
      case 'HOURS':
        return duration / 8;
      case 'WEEKS':
        return duration * 7;
      default:
        return duration;
    }
  }

  private validateDuration(actualDays: number) {
    const { minDuration, maxDuration, fixedDuration, unit } =
      this.durationParams;

    if (fixedDuration && actualDays !== fixedDuration) {
      return {
        message: `Task duration (${actualDays} ${unit.toLowerCase()}) must be exactly ${fixedDuration} ${unit.toLowerCase()}`,
        expectedValue: fixedDuration,
        suggestions: this.generateDurationSuggestions(
          actualDays,
          fixedDuration
        ),
      };
    }

    if (minDuration && actualDays < minDuration) {
      return {
        message: `Task duration (${actualDays} ${unit.toLowerCase()}) is below minimum ${minDuration} ${unit.toLowerCase()}`,
        expectedValue: minDuration,
        suggestions: this.generateDurationSuggestions(actualDays, minDuration),
      };
    }

    if (maxDuration && actualDays > maxDuration) {
      return {
        message: `Task duration (${actualDays} ${unit.toLowerCase()}) exceeds maximum ${maxDuration} ${unit.toLowerCase()}`,
        expectedValue: maxDuration,
        suggestions: this.generateDurationSuggestions(actualDays, maxDuration),
      };
    }

    return null;
  }

  private generateDurationSuggestions(
    actualDuration: number,
    targetDuration: number
  ): ViolationSuggestion[] {
    return [
      {
        id: `adjust-duration-${this.id}`,
        type: 'CHANGE_DURATION',
        description: `Adjust task duration to ${targetDuration} ${this.durationParams.unit.toLowerCase()}`,
        impact: actualDuration > targetDuration ? 'LOW' : 'MEDIUM',
        proposedChanges: [
          {
            taskId: this.targetTaskId || '',
            field: 'duration',
            currentValue: actualDuration,
            proposedValue: targetDuration,
          },
        ],
        canAutoApply: true,
        confidence: 90,
      },
    ];
  }
}
