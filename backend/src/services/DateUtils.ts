/**
 * Module 5.3: Date Utilities
 *
 * Centralizes and reuses date-related calculations for CPM processing
 */

import { WorkingDaysCalculator } from '../models/schedule/workingDays.util';

export class DateUtils {
  private workingDaysCalculator: WorkingDaysCalculator;

  constructor(workingDaysCalculator: WorkingDaysCalculator) {
    this.workingDaysCalculator = workingDaysCalculator;
  }

  /**
   * Fixed subtraction of working days that preserves timezone
   * Workaround for timezone issues in the working days calculator
   */
  public subtractWorkingDaysFixed(
    endDate: string,
    workingDays: number
  ): string {
    if (workingDays === 0) {
      return endDate;
    }

    // Use the same date handling as addWorkingDays for consistency
    const date = new Date(endDate);
    if (isNaN(date.getTime())) {
      return endDate;
    }

    let daysSubtracted = 0;

    while (daysSubtracted < workingDays) {
      date.setUTCDate(date.getUTCDate() - 1);

      // Check if this date is a working day using the calculator's logic
      if (this.workingDaysCalculator.isWorkingDay(date)) {
        daysSubtracted++;
      }
    }

    return date.toISOString();
  }

  /**
   * Calculate the difference in working days between two dates
   * Returns 0 if dates are the same, positive if second date is later
   * This calculates the difference in working day positions, not days between
   */
  public calculateWorkingDaysDifference(
    startDate: string,
    endDate: string
  ): number {
    if (startDate === endDate) {
      return 0;
    }

    // Use the working days calculator to get consistent results
    return this.workingDaysCalculator.calculateWorkingDays(startDate, endDate);
  }

  /**
   * Check if first date is earlier than second date
   */
  public static isEarlierDate(date1: string, date2: string): boolean {
    return new Date(date1).getTime() < new Date(date2).getTime();
  }

  /**
   * Validate if a string is a valid ISO date format
   */
  public static isValidISODate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.includes('T');
  }
}
