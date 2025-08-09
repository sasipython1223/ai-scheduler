/**
 * STRICT RULES for Module 7.3:
 * - ≤220 LOC per file. Split helpers instead of growing files.
 * - No `any`. Keep types narrow and explicit.
 * - No throwing for business errors; return {status, violations}.
 * - Pure functions in strategies and allocation logic.
 * - Deterministic outputs (stable sort/tie-break).
 * - Keep algorithmic complexity reasonable (target O(T log R)).
 */

/**
 * Module 7.3 - Greedy Skill-Fit Strategy
 *
 * Fast, greedy allocation strategy that matches tasks to resources
 * based on skill compatibility and availability.
 */

import { getAvailability } from '../availability-checker';
import type {
  Allocation,
  ConstraintInput,
  IntegrationResult,
  Resource,
  Task,
} from '../index';
import { getBestSkillMatches } from '../skill-based-allocation';

/**
 * Greedy skill-fit allocation strategy
 * @param input Constraint input with resources and tasks
 * @returns Integration result with allocations and violations
 */
export function greedySkillFitStrategy(
  input: ConstraintInput
): IntegrationResult {
  const allocations: Allocation[] = [];
  const violations: string[] = [];
  const remainingTasks = [...input.tasks];
  const resourceAssignments: Record<string, Record<string, number>> = {};
  const startTime = Date.now();

  // Initialize resource assignments tracking
  for (const resource of input.resources) {
    resourceAssignments[resource.id] = {};
  }

  // Sort tasks by duration (longer tasks first) for better allocation
  remainingTasks.sort((a, b) => {
    if (b.duration !== a.duration) {
      return b.duration - a.duration;
    }
    return a.id.localeCompare(b.id); // Deterministic tie-breaking
  });

  // Process each task greedily
  for (const task of remainingTasks) {
    const allocation = allocateTaskGreedy(
      task,
      input.resources,
      resourceAssignments,
      input.hardCaps?.maxOverallocPct || 50
    );

    if (allocation) {
      allocations.push(allocation);

      // Update resource assignments
      const existing =
        resourceAssignments[allocation.resourceId][task.day] || 0;
      resourceAssignments[allocation.resourceId][task.day] =
        existing + task.duration;
    } else {
      violations.push(
        `Failed to allocate task ${task.id}: no suitable resource found`
      );
    }
  }

  const elapsedMs = Date.now() - startTime;

  return {
    status: violations.length === 0 ? 'ok' : 'conflicts',
    allocations,
    violations,
    metrics: {
      elapsedMs,
      leveledVariance: 0, // Not calculated in this simple strategy
    },
  };
}

/**
 * Allocate a single task using greedy approach
 * @param task Task to allocate
 * @param resources Available resources
 * @param assignments Current assignments tracking
 * @param maxOverallocPct Maximum overallocation percentage allowed
 * @returns Allocation decision or null if no allocation possible
 */
function allocateTaskGreedy(
  task: Task,
  resources: Resource[],
  assignments: Record<string, Record<string, number>>,
  maxOverallocPct: number
): Allocation | null {
  // Get best skill matches for this task
  const matches = getBestSkillMatches(resources, task, resources.length);

  // Try to allocate to best matching resource that has availability
  for (const match of matches) {
    const resource = resources.find((r) => r.id === match.resourceId);
    if (!resource) continue;

    // Check if allocation would violate constraints
    const currentAssignment = assignments[resource.id][task.day] || 0;
    const newAssignment = currentAssignment + task.duration;
    const available = getAvailability(resource, task.day);

    // Allow some overallocation based on maxOverallocPct
    const maxAllowed = available * (1 + maxOverallocPct / 100);

    if (newAssignment <= maxAllowed) {
      return {
        taskId: task.id,
        resourceId: resource.id,
        hours: task.duration,
        reason: `Skill match: ${match.totalScore.toFixed(1)}, utilization: ${available > 0 ? ((newAssignment / available) * 100).toFixed(1) : 0}%`,
      };
    }
  }

  // If no perfect allocation found, try to allocate to least overallocated option
  return allocateToLeastOverallocated(task, matches, resources, assignments);
}

/**
 * Fallback allocation to least overallocated resource
 * @param task Task to allocate
 * @param matches Skill matches sorted by score
 * @param resources Available resources
 * @param assignments Current assignments
 * @returns Best fallback allocation or null
 */
function allocateToLeastOverallocated(
  task: Task,
  matches: ReturnType<typeof getBestSkillMatches>,
  resources: Resource[],
  assignments: Record<string, Record<string, number>>
): Allocation | null {
  let bestOption: Allocation | null = null;
  let leastOverallocation = Number.MAX_VALUE;

  for (const match of matches) {
    const resource = resources.find((r) => r.id === match.resourceId);
    if (!resource) continue;

    const currentAssignment = assignments[resource.id][task.day] || 0;
    const newAssignment = currentAssignment + task.duration;
    const available = getAvailability(resource, task.day);

    const overallocation = Math.max(0, newAssignment - available);

    // Prefer less overallocation, break ties with skill score
    if (
      overallocation < leastOverallocation ||
      (overallocation === leastOverallocation &&
        match.totalScore >
          parseFloat(bestOption?.reason?.split(': ')[1] || '0'))
    ) {
      leastOverallocation = overallocation;
      bestOption = {
        taskId: task.id,
        resourceId: resource.id,
        hours: task.duration,
        reason: `Fallback allocation, skill match: ${match.totalScore.toFixed(1)}, overallocation: ${overallocation.toFixed(1)}h`,
      };
    }
  }

  return bestOption;
}
