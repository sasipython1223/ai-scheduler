/**
 * Working Days Utility Functions Module
 * Standalone utility functions for common working day operations
 */

import { WorkingDaysCalculator } from './calculator';
import { DEFAULT_WORKING_CONFIG, WorkingDaysConfig } from './config';
import { HolidayManager } from './holiday-manager';

/**
 * Calculate working days between two dates (simple version)
 */
export function calculateWorkingDays(start: string, finish: string): number {
  const calculator = new WorkingDaysCalculator();
  return calculator.calculateWorkingDays(start, finish);
}

/**
 * Add working days to a date (simple version)
 */
export function addWorkingDays(startDate: string, workingDays: number): string {
  const calculator = new WorkingDaysCalculator();
  return calculator.addWorkingDays(startDate, workingDays);
}

/**
 * Create working days calculator with custom configuration
 */
export function createWorkingDaysCalculator(
  config?: Partial<WorkingDaysConfig>
): WorkingDaysCalculator {
  const fullConfig = { ...DEFAULT_WORKING_CONFIG, ...config };
  return new WorkingDaysCalculator(fullConfig);
}

/**
 * Check if a date string represents a working day
 */
export function isWorkingDay(
  dateString: string,
  config?: WorkingDaysConfig
): boolean {
  const calculator = new WorkingDaysCalculator(config);
  return calculator.isWorkingDay(new Date(dateString));
}

/**
 * Create working days calculator with US holidays
 */
export function createUSWorkingDaysCalculator(
  year?: number
): WorkingDaysCalculator {
  const currentYear = year || new Date().getFullYear();
  const holidays = HolidayManager.getUSFederalHolidays(currentYear);

  return new WorkingDaysCalculator({
    ...DEFAULT_WORKING_CONFIG,
    holidays,
  });
}
