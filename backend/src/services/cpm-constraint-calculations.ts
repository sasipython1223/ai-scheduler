/**
 * Module 5.3: CPM Backward Pass Constraint Calculations
 *
 * Utility functions for calculating constrained dates in backward pass
 */

import { WorkingDaysCalculator } from '../models/schedule/workingDays.util';
import { LogicLink } from '../types/schedule';
import { EnhancedScheduledTask } from '../types/schedule/backward-pass.types';

/**
 * Calculate constrained dates for a predecessor task based on successor constraints
 */
export function calculateConstrainedDates(
  link: LogicLink,
  successor: EnhancedScheduledTask,
  predecessor: EnhancedScheduledTask,
  workingDaysCalculator: WorkingDaysCalculator,
  subtractWorkingDaysFixed: (date: string, days: number) => string
): { constrainedLateStart: string; constrainedLateFinish: string } {
  const lag = link.lag || 0;

  switch (link.type) {
    case 'FS': {
      // Finish-to-Start
      const constrainedLateFinish = subtractWorkingDaysFixed(
        successor.lateStart!,
        lag
      );
      const constrainedLateStart = subtractWorkingDaysFixed(
        constrainedLateFinish,
        Math.max(0, predecessor.duration)
      );
      return { constrainedLateStart, constrainedLateFinish };
    }

    case 'SS': {
      // Start-to-Start
      const constrainedLateStart = subtractWorkingDaysFixed(
        successor.lateStart!,
        lag
      );
      const constrainedLateFinish = workingDaysCalculator.addWorkingDays(
        constrainedLateStart,
        Math.max(0, predecessor.duration)
      );
      return { constrainedLateStart, constrainedLateFinish };
    }

    case 'FF': {
      // Finish-to-Finish
      const constrainedLateFinish = subtractWorkingDaysFixed(
        successor.lateFinish!,
        lag
      );
      const constrainedLateStart = subtractWorkingDaysFixed(
        constrainedLateFinish,
        Math.max(0, predecessor.duration)
      );
      return { constrainedLateStart, constrainedLateFinish };
    }

    case 'SF': {
      // Start-to-Finish
      const constrainedLateStart = subtractWorkingDaysFixed(
        successor.lateFinish!,
        lag
      );
      const constrainedLateFinish = workingDaysCalculator.addWorkingDays(
        constrainedLateStart,
        Math.max(0, predecessor.duration)
      );
      return { constrainedLateStart, constrainedLateFinish };
    }

    default:
      throw new Error(`Unsupported logic type: ${link.type}`);
  }
}
