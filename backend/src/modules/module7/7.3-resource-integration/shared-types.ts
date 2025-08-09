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
 * Module 7.3 - Shared Types and Utilities
 *
 * Common types, comparators, scoring functions, and data structures
 * shared across resource constraint integration components.
 */

import type { Requirement, Resource } from './index';

/**
 * Priority queue item for resource allocation
 */
export interface PriorityItem<T> {
  item: T;
  priority: number;
}

/**
 * Simple priority queue implementation for resource allocation
 */
export class PriorityQueue<T> {
  private items: PriorityItem<T>[] = [];

  enqueue(item: T, priority: number): void {
    const queueItem: PriorityItem<T> = { item, priority };

    // Insert in priority order (higher priority first)
    let added = false;
    for (let i = 0; i < this.items.length; i++) {
      if (queueItem.priority > this.items[i].priority) {
        this.items.splice(i, 0, queueItem);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(queueItem);
    }
  }

  dequeue(): T | undefined {
    const item = this.items.shift();
    return item?.item;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}

/**
 * Calculate skill match score between requirement and resource
 * @param requirement Task skill requirement
 * @param resource Resource to evaluate
 * @returns Score 0..1 (1 = perfect match, 0 = no match)
 */
export function calculateSkillScore(
  requirement: Requirement,
  resource: Resource
): number {
  const skill = resource.skills.find(
    (s: { id: string; level: number }) => s.id === requirement.skillId
  );

  if (!skill) {
    return 0; // No matching skill
  }

  if (skill.level < requirement.minLevel) {
    return 0; // Below minimum level
  }

  // Score based on how much the skill level exceeds minimum
  // Perfect match = 1.0, higher levels get slightly lower scores to encourage efficiency
  const excessLevel = skill.level - requirement.minLevel;
  const maxExcess = 5; // Assume max useful excess is 5 levels

  return Math.max(0.5, 1.0 - (excessLevel / maxExcess) * 0.3);
}

/**
 * Calculate weighted skill score for all requirements
 * @param requirements Array of task requirements
 * @param resource Resource to evaluate
 * @returns Weighted average score 0..1
 */
export function calculateOverallSkillScore(
  requirements: Requirement[],
  resource: Resource
): number {
  if (requirements.length === 0) {
    return 1.0; // No requirements = perfect match
  }

  let totalWeight = 0;
  let weightedScore = 0;

  for (const req of requirements) {
    const weight = req.weight ?? 1.0;
    const score = calculateSkillScore(req, resource);

    weightedScore += score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? weightedScore / totalWeight : 0;
}

/**
 * Resource comparator for deterministic tie-breaking
 * @param a First resource
 * @param b Second resource
 * @returns Comparison result for sorting
 */
export function compareResources(a: Resource, b: Resource): number {
  // Primary: skill count (more skills first)
  const skillDiff = b.skills.length - a.skills.length;
  if (skillDiff !== 0) return skillDiff;

  // Secondary: capacity (higher capacity first)
  const capacityDiff = b.capacity - a.capacity;
  if (capacityDiff !== 0) return capacityDiff;

  // Tertiary: ID for deterministic ordering
  return a.id.localeCompare(b.id);
}

/**
 * Stable sort function with explicit comparator
 * @param array Array to sort
 * @param compareFn Comparison function
 * @returns New sorted array
 */
export function stableSort<T>(
  array: T[],
  compareFn: (a: T, b: T) => number
): T[] {
  // Add original index to ensure stability
  const indexed = array.map((item, index) => ({ item, index }));

  indexed.sort((a, b) => {
    const primary = compareFn(a.item, b.item);
    return primary !== 0 ? primary : a.index - b.index;
  });

  return indexed.map((x) => x.item);
}

/**
 * Calculate variance in a numeric array
 * @param values Array of numbers
 * @returns Variance value
 */
export function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));

  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
}

/**
 * Clamp value to valid range
 * @param value Value to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Deep clone a plain object
 * @param obj Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
