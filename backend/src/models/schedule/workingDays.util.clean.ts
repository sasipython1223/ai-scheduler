/**
 * Working Days Utility
 * AI Scheduler - Module 5.1: Calendar and Business Day Management
 *
 * Core working day calculations and calendar operations
 */

import { HolidayManager } from './holiday.util.js';

/**
 * Working days configuration
 */
export interface WorkingDaysConfig {
  workingDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  holidays: string[]; // Array of ISO date strings
  workingHoursPerDay: number;
}

/**
 * Default working days configuration (Monday-Friday)
 */
export const DEFAULT_WORKING_CONFIG: WorkingDaysConfig = {
  workingDays: [1, 2, 3, 4, 5], // Monday through Friday
  holidays: [],
  workingHoursPerDay: 8,
};

/**
 * Working days calculator with holiday support
 */
export class WorkingDaysCalculator {
  constructor(private config: WorkingDaysConfig = DEFAULT_WORKING_CONFIG) {}

  /**
   * Calculate working days between two dates
   */
  public calculateWorkingDays(start: string, finish: string): number {
    const startDate = new Date(start);
    const finishDate = new Date(finish);
    let workingDays = 0;

    if (startDate > finishDate) {
      return 0;
    }

    const currentDate = new Date(startDate);
    while (currentDate <= finishDate) {
      if (this.isWorkingDay(currentDate)) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }

  /**
   * Add working days to a date
   */
  public addWorkingDays(startDate: string, workingDays: number): string {
    const date = new Date(startDate);
    let daysAdded = 0;

    while (daysAdded < workingDays) {
      date.setDate(date.getDate() + 1);
      if (this.isWorkingDay(date)) {
        daysAdded++;
      }
    }

    return date.toISOString();
  }

  /**
   * Subtract working days from a date
   */
  public subtractWorkingDays(endDate: string, workingDays: number): string {
    const date = new Date(endDate);
    let daysSubtracted = 0;

    while (daysSubtracted < workingDays) {
      date.setDate(date.getDate() - 1);
      if (this.isWorkingDay(date)) {
        daysSubtracted++;
      }
    }

    return date.toISOString();
  }

  /**
   * Check if a date is a working day
   */
  public isWorkingDay(date: Date): boolean {
    const dayOfWeek = date.getDay();
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Check if it's a configured working day
    if (!this.config.workingDays.includes(dayOfWeek)) {
      return false;
    }

    // Check if it's a holiday
    if (this.config.holidays.includes(dateString)) {
      return false;
    }

    return true;
  }

  /**
   * Check if a date is a holiday
   */
  public isHoliday(date: Date): boolean {
    const dateString = date.toISOString().split('T')[0];
    return this.config.holidays.includes(dateString);
  }

  /**
   * Check if a date is a weekend
   */
  public isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return !this.config.workingDays.includes(dayOfWeek);
  }

  /**
   * Get next working day from a given date
   */
  public getNextWorkingDay(date: string): string {
    return this.addWorkingDays(date, 1);
  }

  /**
   * Get previous working day from a given date
   */
  public getPreviousWorkingDay(date: string): string {
    return this.subtractWorkingDays(date, 1);
  }

  /**
   * Calculate working hours between dates
   */
  public calculateWorkingHours(start: string, finish: string): number {
    const workingDays = this.calculateWorkingDays(start, finish);
    return workingDays * this.config.workingHoursPerDay;
  }

  /**
   * Update working days configuration
   */
  public updateConfig(config: Partial<WorkingDaysConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): WorkingDaysConfig {
    return { ...this.config };
  }
}

/**
 * Utility functions for working day operations
 */

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
