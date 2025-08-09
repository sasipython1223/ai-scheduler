/**
 * Holiday Management Utilities
 * AI Scheduler - Module 5.1: Holiday Calendar Management
 *
 * Holiday calculation and management utilities
 */

/**
 * Holiday management utilities
 */
export class HolidayManager {
  /**
   * Get common US federal holidays for a year
   */
  public static getUSFederalHolidays(year: number): string[] {
    const holidays: string[] = [];

    // New Year's Day
    holidays.push(`${year}-01-01`);

    // Independence Day
    holidays.push(`${year}-07-04`);

    // Christmas Day
    holidays.push(`${year}-12-25`);

    // Memorial Day (last Monday in May)
    const memorialDay = this.getLastMondayInMay(year);
    holidays.push(memorialDay);

    // Labor Day (first Monday in September)
    const laborDay = this.getFirstMondayInSeptember(year);
    holidays.push(laborDay);

    // Thanksgiving (fourth Thursday in November)
    const thanksgiving = this.getFourthThursdayInNovember(year);
    holidays.push(thanksgiving);

    return holidays;
  }

  /**
   * Get international holidays for a year
   */
  public static getInternationalHolidays(year: number): string[] {
    const holidays: string[] = [];

    // New Year's Day
    holidays.push(`${year}-01-01`);

    // Christmas Day
    holidays.push(`${year}-12-25`);

    // Boxing Day (Dec 26)
    holidays.push(`${year}-12-26`);

    return holidays;
  }

  /**
   * Get custom company holidays
   */
  public static getCompanyHolidays(
    year: number,
    companyType: 'US' | 'INTERNATIONAL' = 'US'
  ): string[] {
    if (companyType === 'US') {
      return this.getUSFederalHolidays(year);
    }
    return this.getInternationalHolidays(year);
  }

  private static getLastMondayInMay(year: number): string {
    const date = new Date(year, 4, 31); // May 31st
    while (date.getDay() !== 1) {
      // Find Monday
      date.setDate(date.getDate() - 1);
    }
    return date.toISOString().split('T')[0];
  }

  private static getFirstMondayInSeptember(year: number): string {
    const date = new Date(year, 8, 1); // September 1st
    while (date.getDay() !== 1) {
      // Find Monday
      date.setDate(date.getDate() + 1);
    }
    return date.toISOString().split('T')[0];
  }

  private static getFourthThursdayInNovember(year: number): string {
    const date = new Date(year, 10, 1); // November 1st
    while (date.getDay() !== 4) {
      // Find Thursday
      date.setDate(date.getDate() + 1);
    }
    date.setDate(date.getDate() + 21); // Add 3 weeks
    return date.toISOString().split('T')[0];
  }

  /**
   * Check if a date is a weekend (Saturday or Sunday)
   */
  public static isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  }

  /**
   * Get next business day (skipping weekends)
   */
  public static getNextBusinessDay(date: Date): Date {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    while (this.isWeekend(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1);
    }

    return nextDay;
  }

  /**
   * Get previous business day (skipping weekends)
   */
  public static getPreviousBusinessDay(date: Date): Date {
    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);

    while (this.isWeekend(prevDay)) {
      prevDay.setDate(prevDay.getDate() - 1);
    }

    return prevDay;
  }

  /**
   * Get Easter Sunday for a given year
   */
  public static getEasterSunday(year: number): string {
    // Using the algorithm for Gregorian calendar
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');

    return `${year}-${monthStr}-${dayStr}`;
  }
}

/**
 * Regional holiday configurations
 */
export const HOLIDAY_REGIONS = {
  US: 'US',
  INTERNATIONAL: 'INTERNATIONAL',
  UK: 'UK',
  EU: 'EU',
  CANADA: 'CANADA',
} as const;

export type HolidayRegion =
  (typeof HOLIDAY_REGIONS)[keyof typeof HOLIDAY_REGIONS];

/**
 * Utility functions for holiday management
 */
export function getHolidaysForYear(
  year: number,
  region: HolidayRegion = 'US'
): string[] {
  switch (region) {
    case 'US':
      return HolidayManager.getUSFederalHolidays(year);
    case 'INTERNATIONAL':
      return HolidayManager.getInternationalHolidays(year);
    default:
      return HolidayManager.getUSFederalHolidays(year);
  }
}

export function isHoliday(date: Date, holidays: string[]): boolean {
  const dateString = date.toISOString().split('T')[0];
  return holidays.includes(dateString);
}

export function isBusinessDay(date: Date, holidays: string[] = []): boolean {
  return !HolidayManager.isWeekend(date) && !isHoliday(date, holidays);
}
