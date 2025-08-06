/**
 * Working Days Configuration Module
 * Handles configuration types and default settings for working day calculations
 */

export interface WorkingDaysConfig {
  workingDays: number[]; // Days of the week that are working days (0 = Sunday, 1 = Monday, etc.)
  holidays: string[]; // Array of holiday dates in YYYY-MM-DD format
  workingHoursPerDay: number; // Number of working hours per day
}

/**
 * Default working days configuration
 * Monday through Friday (1-5), 8 hours per day, no holidays
 */
export const DEFAULT_WORKING_CONFIG: WorkingDaysConfig = {
  workingDays: [1, 2, 3, 4, 5], // Monday through Friday
  holidays: [], // No holidays by default
  workingHoursPerDay: 8, // Standard 8-hour workday
};
