/**
 * Working Days Calculator Module
 * Core class for working day calculations and business day logic
 */

import { DEFAULT_WORKING_CONFIG, WorkingDaysConfig } from './config';
import { WorkingDaysValidator } from './validator';

/**
 * Main calculator class for working day operations
 */
export class WorkingDaysCalculator {
  private config: WorkingDaysConfig;
  private validator: WorkingDaysValidator;

  constructor(config?: Partial<WorkingDaysConfig>) {
    this.config = { ...DEFAULT_WORKING_CONFIG, ...config };
    this.validator = new WorkingDaysValidator(this.config);
  }

  /**
   * Calculate the number of working days between two dates
   */
  public calculateWorkingDays(start: string, finish: string): number {
    const startDate = new Date(start);
    const finishDate = new Date(finish);

    // Handle invalid dates
    if (isNaN(startDate.getTime()) || isNaN(finishDate.getTime())) {
      return 0;
    }

    // Handle same date
    if (start === finish) {
      return this.isWorkingDay(startDate) ? 1 : 0;
    }

    // Handle reversed dates
    if (startDate > finishDate) {
      return 0;
    }

    // Use UTC date components for consistency
    const startDateOnly = new Date(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate()
    );

    const endDateOnly = new Date(
      finishDate.getUTCFullYear(),
      finishDate.getUTCMonth(),
      finishDate.getUTCDate()
    );

    let workingDays = 0;
    const currentDate = new Date(startDateOnly);

    while (currentDate <= endDateOnly) {
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
    // Handle invalid date
    const date = new Date(startDate);
    if (isNaN(date.getTime())) {
      return startDate; // Return original if invalid
    }

    // Handle zero working days
    if (workingDays === 0) {
      return startDate;
    }

    // Handle negative working days as subtraction
    if (workingDays < 0) {
      return this.subtractWorkingDays(startDate, Math.abs(workingDays));
    }

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
    // Handle invalid date
    const originalDate = new Date(endDate);
    if (isNaN(originalDate.getTime())) {
      return endDate; // Return original if invalid
    }

    // Handle zero working days
    if (workingDays === 0) {
      return endDate;
    }

    // Handle negative working days as addition
    if (workingDays < 0) {
      return this.addWorkingDays(endDate, Math.abs(workingDays));
    }

    // Use UTC extraction for consistency with calculateWorkingDays
    const date = new Date(
      originalDate.getUTCFullYear(),
      originalDate.getUTCMonth(),
      originalDate.getUTCDate()
    );

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
    return this.validator.isWorkingDay(date);
  }

  /**
   * Check if a date is a holiday
   */
  public isHoliday(date: Date): boolean {
    return this.validator.isHoliday(date);
  }

  /**
   * Check if a date is a weekend
   */
  public isWeekend(date: Date): boolean {
    return this.validator.isWeekend(date);
  }

  /**
   * Calculate working hours between dates
   */
  public calculateWorkingHours(start: string, finish: string): number {
    const workingDays = this.calculateWorkingDays(start, finish);
    return workingDays * this.config.workingHoursPerDay;
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
   * Update working days configuration
   */
  public updateConfig(config: Partial<WorkingDaysConfig>): void {
    this.config = { ...this.config, ...config };
    this.validator = new WorkingDaysValidator(this.config);
  }

  /**
   * Get current configuration
   */
  public getConfig(): WorkingDaysConfig {
    return { ...this.config };
  }
}
