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
 * Module 7.3 - Minimal Leveling Strategy
 *
 * Advanced allocation strategy that attempts to minimize workload variance
 * across resources while respecting skill requirements.
 */

import { getAvailability } from '../availability-checker';
import type {
  Allocation,
  ConstraintInput,
  IntegrationResult,
  Resource,
  Task,
} from '../index';
import {
  analyzeWorkload,
  calculateWorkloadBalance,
  findLeastLoadedResource,
} from '../resource-leveling';
import { getBestSkillMatches } from '../skill-based-allocation';

/**
 * Minimal leveling allocation strategy
 * @param input Constraint input with resources and tasks
 * @returns Integration result with balanced allocations
 */
export function minimalLevelingStrategy(
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

  // Sort tasks by priority: shorter duration first to allow more flexibility
  remainingTasks.sort((a, b) => {
    if (a.duration !== b.duration) {
      return a.duration - b.duration; // Shorter tasks first
    }
    return a.id.localeCompare(b.id); // Deterministic tie-breaking
  });

  // Process each task with leveling considerations
  for (const task of remainingTasks) {
    const allocation = allocateTaskWithLeveling(
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
        `Failed to allocate task ${task.id}: no suitable resource with acceptable leveling`
      );
    }
  }

  // Calculate final leveling variance
  const workloadAnalyses = input.resources.map((resource) => {
    const days = Array.from(new Set(input.tasks.map((t) => t.day)));
    return analyzeWorkload(
      resource,
      resourceAssignments[resource.id] || {},
      days
    );
  });

  const leveledVariance = calculateWorkloadBalance(workloadAnalyses);
  const elapsedMs = Date.now() - startTime;

  return {
    status: violations.length === 0 ? 'ok' : 'conflicts',
    allocations,
    violations,
    metrics: {
      elapsedMs,
      leveledVariance,
    },
  };
}

/**
 * Allocate task considering workload leveling
 * @param task Task to allocate
 * @param resources Available resources
 * @param assignments Current assignments
 * @param maxOverallocPct Maximum overallocation percentage
 * @returns Allocation with leveling consideration
 */
function allocateTaskWithLeveling(
  task: Task,
  resources: Resource[],
  assignments: Record<string, Record<string, number>>,
  maxOverallocPct: number
): Allocation | null {
  // Get resources that can handle this task
  const matches = getBestSkillMatches(resources, task, resources.length);
  const capableResources = matches
    .filter((match) => match.hasAllRequiredSkills)
    .map((match) => resources.find((r) => r.id === match.resourceId))
    .filter((r): r is Resource => r !== undefined);

  if (capableResources.length === 0) {
    // Fallback to any resource with partial skill match
    return allocateToBestPartialMatch(
      task,
      matches,
      resources,
      assignments,
      maxOverallocPct
    );
  }

  // Find the least loaded capable resource for this day
  const leastLoaded = findLeastLoadedResource(
    capableResources,
    assignments,
    task.day
  );

  if (leastLoaded) {
    const currentAssignment = assignments[leastLoaded.id][task.day] || 0;
    const newAssignment = currentAssignment + task.duration;
    const available = getAvailability(leastLoaded, task.day);
    const maxAllowed = available * (1 + maxOverallocPct / 100);

    if (newAssignment <= maxAllowed) {
      const skillMatch = matches.find((m) => m.resourceId === leastLoaded.id);
      return {
        taskId: task.id,
        resourceId: leastLoaded.id,
        hours: task.duration,
        reason: `Leveled allocation, skill: ${skillMatch?.totalScore.toFixed(1) || 0}, utilization: ${available > 0 ? ((newAssignment / available) * 100).toFixed(1) : 0}%`,
      };
    }
  }

  // If leveling fails, fallback to best skill match
  return allocateToBestPartialMatch(
    task,
    matches,
    resources,
    assignments,
    maxOverallocPct
  );
}

/**
 * Fallback allocation to best partial skill match
 * @param task Task to allocate
 * @param matches All skill matches
 * @param resources All resources
 * @param assignments Current assignments
 * @param maxOverallocPct Maximum overallocation
 * @returns Best available allocation
 */
function allocateToBestPartialMatch(
  task: Task,
  matches: ReturnType<typeof getBestSkillMatches>,
  resources: Resource[],
  assignments: Record<string, Record<string, number>>,
  maxOverallocPct: number
): Allocation | null {
  for (const match of matches) {
    const resource = resources.find((r) => r.id === match.resourceId);
    if (!resource) continue;

    const currentAssignment = assignments[resource.id][task.day] || 0;
    const newAssignment = currentAssignment + task.duration;
    const available = getAvailability(resource, task.day);
    const maxAllowed = available * (1 + maxOverallocPct / 100);

    if (newAssignment <= maxAllowed) {
      return {
        taskId: task.id,
        resourceId: resource.id,
        hours: task.duration,
        reason: `Partial skill match: ${match.totalScore.toFixed(1)}, missing skills: ${match.missingSkills.length}`,
      };
    }
  }

  return null; // No feasible allocation found
}
