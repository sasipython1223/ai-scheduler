/**
 * Working Days Validation Module
 * Provides date validation and checking utilities
 */

import { WorkingDaysConfig } from './config';

/**
 * Date validation and checking utilities
 */
export class WorkingDaysValidator {
  private config: WorkingDaysConfig;

  constructor(config: WorkingDaysConfig) {
    this.config = config;
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
   * Check if a date is a working day
   */
  public isWorkingDay(date: Date): boolean {
    // Handle invalid dates gracefully
    if (isNaN(date.getTime())) {
      return false;
    }

    const dayOfWeek = date.getDay();
    const dateString = date.toISOString().split('T')[0];

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
   * Validate date string
   */
  public isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Get configuration
   */
  public getConfig(): WorkingDaysConfig {
    return { ...this.config };
  }
}
