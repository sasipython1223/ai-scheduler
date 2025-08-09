/**
 * Task Flag Assignment Utilities
 *
 * This module contains flag assignment utilities
 * extracted from TaskFlagAssigner to reduce file size
 * and improve modularity.
 */

import { isFloatZero } from '../utils/FloatUtils.js';

/**
 * Determines if a task should have a critical flag based on total float
 * @param totalFloat Task's total float value
 * @param epsilon Tolerance for float comparison
 * @returns True if task is critical
 */
export function shouldAddCriticalFlag(
  totalFloat: number,
  epsilon: number
): boolean {
  return isFloatZero(totalFloat, epsilon);
}

/**
 * Determines if a task should have a near-critical flag
 * @param totalFloat Task's total float value
 * @param epsilon Tolerance for float comparison
 * @param nearCriticalThreshold Threshold for near-critical classification
 * @returns True if task is near-critical
 */
export function shouldAddNearCriticalFlag(
  totalFloat: number,
  epsilon: number,
  nearCriticalThreshold: number
): boolean {
  return (
    !isFloatZero(totalFloat, epsilon) &&
    totalFloat > 0 &&
    totalFloat <= nearCriticalThreshold
  );
}

/**
 * Determines if a task should have a high float flag
 * @param totalFloat Task's total float value
 * @param highFloatThreshold Threshold for high float classification
 * @returns True if task has high float
 */
export function shouldAddHighFloatFlag(
  totalFloat: number,
  highFloatThreshold: number
): boolean {
  return totalFloat > highFloatThreshold;
}

/**
 * Determines if a task should have a zero float flag
 * @param totalFloat Task's total float value
 * @param epsilon Tolerance for float comparison
 * @returns True if task has exactly zero float
 */
export function shouldAddZeroFloatFlag(
  totalFloat: number,
  epsilon: number
): boolean {
  return isFloatZero(totalFloat, epsilon);
}

/**
 * Determines if a task should have a negative float flag
 * @param totalFloat Task's total float value
 * @returns True if task has negative float
 */
export function shouldAddNegativeFloatFlag(totalFloat: number): boolean {
  return totalFloat < 0;
}

/**
 * Validates flag uniqueness and reports conflicts
 * @param flagCounts Map of task ID to flag type counts
 * @param warnings Array to collect warnings
 */
export function validateFlagUniqueness(
  flagCounts: Map<string, Map<string, number>>,
  warnings: string[]
): void {
  for (const [taskId, flagTypes] of flagCounts) {
    for (const [flagType, count] of flagTypes) {
      if (count > 1) {
        warnings.push(
          `Task ${taskId} has ${count} duplicate ${flagType} flags`
        );
      }
    }
  }
}

/**
 * Calculates flag priority based on flag type
 * @param flagType Type of flag
 * @returns Priority level (higher number = higher priority)
 */
export function calculateFlagPriority(flagType: string): number {
  const priorityMap: Record<string, number> = {
    CRITICAL: 100,
    NEGATIVE_FLOAT: 90,
    ZERO_FLOAT: 80,
    NEAR_CRITICAL: 70,
    HIGH_FLOAT: 60,
  };

  return priorityMap[flagType] || 50;
}
