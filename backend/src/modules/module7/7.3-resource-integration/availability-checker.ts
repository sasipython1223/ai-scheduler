/**
 * STRICT RULES for Module 7.3:
 * - ≤220 LOC per file. Split helpers instead of growing files.
 * - No `any`. Keep types narrow and explicit.
 * - No throwing for business errors; return {status, violations}.
 * - Pure functions in strategies and availability checker.
 * - Deterministic outputs (stable sort/tie-break).
 * - Keep algorithmic complexity reasonable (target O(T log R)).
 */

/**
 * Module 7.3 - Availability Checker
 *
 * Pure functions to compute per-day available hours per resource.
 * Handles capacity/calendar logic and clamps negatives.
 */

import type { Resource } from './index';
import { clamp } from './shared-types';

/**
 * Get available hours for a resource on a specific day
 * @param resource Resource to check
 * @param day ISO date string (YYYY-MM-DD)
 * @returns Available hours (>= 0)
 */
export function getAvailability(resource: Resource, day: string): number {
  // Check calendar override first
  if (resource.calendar && resource.calendar[day] !== undefined) {
    const calendarHours = resource.calendar[day];
    return clamp(calendarHours, 0, resource.capacity);
  }

  // Default to full capacity
  return Math.max(0, resource.capacity);
}

/**
 * Get availability for multiple days
 * @param resource Resource to check
 * @param days Array of ISO date strings
 * @returns Record mapping day to available hours
 */
export function getMultiDayAvailability(
  resource: Resource,
  days: string[]
): Record<string, number> {
  const availability: Record<string, number> = {};

  for (const day of days) {
    availability[day] = getAvailability(resource, day);
  }

  return availability;
}

/**
 * Check if resource has any availability on given day
 * @param resource Resource to check
 * @param day ISO date string
 * @returns True if resource has > 0 hours available
 */
export function hasAvailability(resource: Resource, day: string): boolean {
  return getAvailability(resource, day) > 0;
}

/**
 * Get total availability across multiple days
 * @param resource Resource to check
 * @param days Array of ISO date strings
 * @returns Total available hours across all days
 */
export function getTotalAvailability(
  resource: Resource,
  days: string[]
): number {
  return days.reduce((total, day) => total + getAvailability(resource, day), 0);
}

/**
 * Reduce availability after allocation
 * @param resource Resource to update
 * @param day Day of allocation
 * @param hours Hours allocated
 * @returns New resource with updated calendar
 */
export function reduceAvailability(
  resource: Resource,
  day: string,
  hours: number
): Resource {
  const currentAvailability = getAvailability(resource, day);
  const newAvailability = Math.max(0, currentAvailability - hours);

  return {
    ...resource,
    calendar: {
      ...resource.calendar,
      [day]: newAvailability,
    },
  };
}

/**
 * Check if allocation would exceed resource capacity
 * @param resource Resource to check
 * @param day Day of potential allocation
 * @param hours Hours to allocate
 * @returns True if allocation would exceed available hours
 */
export function wouldExceedCapacity(
  resource: Resource,
  day: string,
  hours: number
): boolean {
  const available = getAvailability(resource, day);
  return hours > available;
}

/**
 * Get utilization percentage for a resource on a day
 * @param resource Resource to check
 * @param day Day to check
 * @param allocatedHours Currently allocated hours
 * @returns Utilization percentage (0-100+)
 */
export function getUtilization(
  resource: Resource,
  day: string,
  allocatedHours: number
): number {
  const capacity = resource.capacity;
  if (capacity === 0) return 0;

  return (allocatedHours / capacity) * 100;
}

/**
 * Get overallocation percentage if any
 * @param resource Resource to check
 * @param day Day to check
 * @param allocatedHours Currently allocated hours
 * @returns Overallocation percentage (0+ if overallocated, 0 if within capacity)
 */
export function getOverallocation(
  resource: Resource,
  day: string,
  allocatedHours: number
): number {
  const available = getAvailability(resource, day);
  if (available === 0) return allocatedHours > 0 ? 100 : 0;

  const excess = allocatedHours - available;
  return excess > 0 ? (excess / available) * 100 : 0;
}
