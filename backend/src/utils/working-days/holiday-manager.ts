/**
 * Holiday Management Module
 * Provides utilities for managing holidays and holiday calculations
 */

/**
 * Holiday management utilities
 */
export class HolidayManager {
  /**
   * Get US federal holidays for a given year
   */
  public static getUSFederalHolidays(year: number): string[] {
    const holidays: string[] = [];

    // New Year's Day - January 1
    holidays.push(`${year}-01-01`);

    // Martin Luther King Jr. Day - Third Monday in January
    holidays.push(this.getNthWeekdayOfMonth(year, 0, 1, 3)); // 3rd Monday of January

    // Presidents' Day - Third Monday in February
    holidays.push(this.getNthWeekdayOfMonth(year, 1, 1, 3)); // 3rd Monday of February

    // Memorial Day - Last Monday in May
    holidays.push(this.getLastWeekdayOfMonth(year, 4, 1)); // Last Monday of May

    // Independence Day - July 4
    holidays.push(`${year}-07-04`);

    // Labor Day - First Monday in September
    holidays.push(this.getNthWeekdayOfMonth(year, 8, 1, 1)); // 1st Monday of September

    // Columbus Day - Second Monday in October
    holidays.push(this.getNthWeekdayOfMonth(year, 9, 1, 2)); // 2nd Monday of October

    // Veterans Day - November 11
    holidays.push(`${year}-11-11`);

    // Thanksgiving - Fourth Thursday in November
    holidays.push(this.getNthWeekdayOfMonth(year, 10, 4, 4)); // 4th Thursday of November

    // Christmas Day - December 25
    holidays.push(`${year}-12-25`);

    return holidays;
  }

  /**
   * Get the nth occurrence of a weekday in a month
   */
  private static getNthWeekdayOfMonth(
    year: number,
    month: number,
    weekday: number,
    occurrence: number
  ): string {
    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();

    // Calculate days to add to get to the first occurrence of the weekday
    let daysToAdd = (weekday - firstWeekday + 7) % 7;

    // Add days for the nth occurrence
    daysToAdd += (occurrence - 1) * 7;

    const date = new Date(year, month, 1 + daysToAdd);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get the last occurrence of a weekday in a month
   */
  private static getLastWeekdayOfMonth(
    year: number,
    month: number,
    weekday: number
  ): string {
    const lastDay = new Date(year, month + 1, 0); // Last day of the month
    const lastWeekday = lastDay.getDay();

    // Calculate days to subtract to get to the last occurrence of the weekday
    let daysToSubtract = (lastWeekday - weekday + 7) % 7;

    const date = new Date(year, month + 1, 0 - daysToSubtract);
    return date.toISOString().split('T')[0];
  }

  /**
   * Check if a date is a US federal holiday
   */
  public static isUSFederalHoliday(date: Date, year?: number): boolean {
    const holidayYear = year || date.getFullYear();
    const holidays = this.getUSFederalHolidays(holidayYear);
    const dateString = date.toISOString().split('T')[0];
    return holidays.includes(dateString);
  }

  /**
   * Get holidays for a date range
   */
  public static getHolidaysInRange(startDate: Date, endDate: Date): string[] {
    const holidays: string[] = [];
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    for (let year = startYear; year <= endYear; year++) {
      const yearHolidays = this.getUSFederalHolidays(year);
      holidays.push(...yearHolidays);
    }

    // Filter holidays within the date range
    return holidays.filter((holiday) => {
      const holidayDate = new Date(holiday);
      return holidayDate >= startDate && holidayDate <= endDate;
    });
  }
}
