/**
 * Working Days Configuration Manager Module
 * Handles configuration management for working day calculators
 */

import { WorkingDaysConfig } from './config';

/**
 * Configuration manager for working days calculator
 */
export class WorkingDaysConfigManager {
  private config: WorkingDaysConfig;

  constructor(config: WorkingDaysConfig) {
    this.config = config;
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

  /**
   * Add holidays to the configuration
   */
  public addHolidays(holidays: string[]): void {
    this.config.holidays = [...this.config.holidays, ...holidays];
  }

  /**
   * Remove holidays from the configuration
   */
  public removeHolidays(holidays: string[]): void {
    this.config.holidays = this.config.holidays.filter(
      (holiday) => !holidays.includes(holiday)
    );
  }

  /**
   * Set working days (0-6, where 0 is Sunday)
   */
  public setWorkingDays(workingDays: number[]): void {
    this.config.workingDays = [...workingDays];
  }

  /**
   * Set working hours per day
   */
  public setWorkingHoursPerDay(hours: number): void {
    this.config.workingHoursPerDay = hours;
  }

  /**
   * Reset configuration to defaults
   */
  public resetToDefaults(defaultConfig: WorkingDaysConfig): void {
    this.config = { ...defaultConfig };
  }
}
