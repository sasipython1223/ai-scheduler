/**
 * CPM Date Calculator - Date and time calculations for forward pass
 * AI Scheduler - Module 5.2: Supporting utilities for schedule calculations
 */

import { WorkingDaysCalculator } from '../models/schedule/workingDays.util';
import { ScheduledTask } from '../types/scheduleTypes';

/**
 * Project start date constant for forward pass calculations
 */
export const DEFAULT_PROJECT_START = '2025-08-04T09:00:00.000Z'; // Monday

/**
 * Date calculation utilities for CPM forward pass
 */
export class CpmDateCalculator {
  private workingDaysCalc: WorkingDaysCalculator;

  constructor() {
    this.workingDaysCalc = new WorkingDaysCalculator();
  }

  /**
   * Calculate early finish date based on early start and duration
   *
   * @param earlyStart - Task early start date (ISO string)
   * @param duration - Task duration in working days
   * @returns Early finish date (ISO string)
   */
  calculateEarlyFinish(earlyStart: string, duration: number): string {
    if (duration <= 0) {
      return earlyStart;
    }

    // Add working days to early start date
    const earlyFinishDate = this.workingDaysCalc.addWorkingDays(
      earlyStart,
      duration
    );

    return earlyFinishDate;
  }

  /**
   * Calculate project end date from all scheduled tasks
   *
   * @param tasks - Array of scheduled tasks
   * @returns Latest finish date among all tasks (ISO string)
   */
  calculateProjectEndDate(tasks: ScheduledTask[]): string {
    let latestFinish = DEFAULT_PROJECT_START;

    for (const task of tasks) {
      if (
        new Date(task.earlyFinish).getTime() > new Date(latestFinish).getTime()
      ) {
        latestFinish = task.earlyFinish;
      }
    }

    return latestFinish;
  }
}
