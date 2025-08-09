/**
 * Module 5.4 - Float Utilities
 * Purpose: Reusable float calculation utilities with epsilon precision
 * Requirements:
 * - Use epsilon-based float comparison (0.001)
 * - Pure functions for testability
 * - Maintain clean separation of concerns
 */

/**
 * Default epsilon value for float comparisons
 */
export const DEFAULT_EPSILON = 0.001;

/**
 * Performs epsilon-based comparison for floating-point numbers
 * @param value1 First value to compare
 * @param value2 Second value to compare
 * @param epsilon Precision threshold (default: 0.001)
 * @returns True if values are equal within epsilon tolerance
 */
export function isFloatEqual(
  value1: number,
  value2: number,
  epsilon: number = DEFAULT_EPSILON
): boolean {
  return Math.abs(value1 - value2) < epsilon;
}

/**
 * Checks if a float value is effectively zero using epsilon comparison
 * @param value Value to check
 * @param epsilon Precision threshold (default: 0.001)
 * @returns True if value is zero within epsilon tolerance
 */
export function isFloatZero(
  value: number,
  epsilon: number = DEFAULT_EPSILON
): boolean {
  return Math.abs(value) < epsilon;
}

/**
 * Rounds a float value to the specified decimal places
 * @param value Value to round
 * @param decimals Number of decimal places (default: 3)
 * @returns Rounded value
 */
export function roundFloat(value: number, decimals: number = 3): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Validates that free float is less than or equal to total float
 * @param totalFloat Total float value
 * @param freeFloat Free float value
 * @param epsilon Precision threshold (default: 0.001)
 * @returns True if relationship is valid
 */
export function validateFloatRelationship(
  totalFloat: number,
  freeFloat: number,
  epsilon: number = DEFAULT_EPSILON
): boolean {
  return freeFloat <= totalFloat + epsilon;
}

/**
 * Calculates the minimum value from an array of numbers
 * @param values Array of values
 * @returns Minimum value or 0 if array is empty
 */
export function getMinFloat(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.min(...values);
}

/**
 * Calculates the maximum value from an array of numbers
 * @param values Array of values
 * @returns Maximum value or 0 if array is empty
 */
export function getMaxFloat(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values);
}

/**
 * Calculates the average of an array of numbers
 * @param values Array of values
 * @returns Average value or 0 if array is empty
 */
export function getAverageFloat(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Converts working days to calendar days based on a simple 5-day work week
 * @param workingDays Number of working days
 * @returns Equivalent calendar days
 */
export function workingDaysToCalendarDays(workingDays: number): number {
  // Simple conversion: 5 working days = 7 calendar days
  return Math.ceil((workingDays * 7) / 5);
}

/**
 * Validates that a float value is within acceptable bounds
 * @param value Float value to validate
 * @param minValue Minimum acceptable value (default: -1000)
 * @param maxValue Maximum acceptable value (default: 1000)
 * @returns True if value is within bounds
 */
export function isFloatWithinBounds(
  value: number,
  minValue: number = -1000,
  maxValue: number = 1000
): boolean {
  return (
    value >= minValue && value <= maxValue && !isNaN(value) && isFinite(value)
  );
}

/**
 * Determines risk level based on float value
 * @param totalFloat Total float value
 * @param thresholds Risk level thresholds
 * @returns Risk level classification
 */
export function getFloatRiskLevel(
  totalFloat: number,
  thresholds = { critical: 1, high: 3, medium: 7 }
): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (totalFloat <= thresholds.critical) return 'CRITICAL';
  if (totalFloat <= thresholds.high) return 'HIGH';
  if (totalFloat <= thresholds.medium) return 'MEDIUM';
  return 'LOW';
}
