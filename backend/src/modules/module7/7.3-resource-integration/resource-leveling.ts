/**
 * STRICT RULES for Module 7.3:
 * - ≤220 LOC per file. Split helpers instead of growing files.
 * - No `any`. Keep types narrow and explicit.
 * - No throwing for business errors; return {status, violations}.
 * - Pure functions in strategies and leveling logic.
 * - Deterministic outputs (stable sort/tie-break).
 * - Keep algorithmic complexity reasonable (target O(T log R)).
 */

/**
 * Module 7.3 - Resource Leveling
 *
 * Functions to analyze and balance resource workload distribution.
 * Provides metrics and algorithms for smoothing resource allocation.
 */

import type { Resource } from './index';
import { calculateVariance } from './shared-types';

/**
 * Resource utilization for a specific day
 */
export interface DayUtilization {
  day: string;
  resourceId: string;
  capacity: number;
  allocated: number;
  utilization: number; // percentage
  overallocation: number; // hours over capacity
}

/**
 * Workload distribution analysis for a resource
 */
export interface WorkloadAnalysis {
  resourceId: string;
  totalCapacity: number;
  totalAllocated: number;
  averageUtilization: number;
  utilizationVariance: number;
  peakUtilization: number;
  overallocatedDays: number;
  totalOverallocation: number;
  dailyUtilization: DayUtilization[];
}

/**
 * Calculate resource utilization for multiple days
 * @param resource Resource to analyze
 * @param assignments Map of day -> allocated hours
 * @param days Days to analyze
 * @returns Daily utilization breakdown
 */
export function calculateDailyUtilization(
  resource: Resource,
  assignments: Record<string, number>,
  days: string[]
): DayUtilization[] {
  return days.map((day) => {
    const allocated = assignments[day] || 0;
    const capacity = resource.calendar?.[day] ?? resource.capacity;
    const utilization = capacity > 0 ? (allocated / capacity) * 100 : 0;
    const overallocation = Math.max(0, allocated - capacity);

    return {
      day,
      resourceId: resource.id,
      capacity,
      allocated,
      utilization,
      overallocation,
    };
  });
}

/**
 * Analyze workload distribution for a resource
 * @param resource Resource to analyze
 * @param assignments Map of day -> allocated hours
 * @param days Days to analyze
 * @returns Comprehensive workload analysis
 */
export function analyzeWorkload(
  resource: Resource,
  assignments: Record<string, number>,
  days: string[]
): WorkloadAnalysis {
  const dailyUtilization = calculateDailyUtilization(
    resource,
    assignments,
    days
  );

  const totalCapacity = dailyUtilization.reduce(
    (sum, day) => sum + day.capacity,
    0
  );
  const totalAllocated = dailyUtilization.reduce(
    (sum, day) => sum + day.allocated,
    0
  );
  const averageUtilization =
    dailyUtilization.length > 0
      ? dailyUtilization.reduce((sum, day) => sum + day.utilization, 0) /
        dailyUtilization.length
      : 0;

  const utilizations = dailyUtilization.map((day) => day.utilization);
  const utilizationVariance = calculateVariance(utilizations);
  const peakUtilization = Math.max(...utilizations, 0);

  const overallocatedDays = dailyUtilization.filter(
    (day) => day.overallocation > 0
  ).length;
  const totalOverallocation = dailyUtilization.reduce(
    (sum, day) => sum + day.overallocation,
    0
  );

  return {
    resourceId: resource.id,
    totalCapacity,
    totalAllocated,
    averageUtilization,
    utilizationVariance,
    peakUtilization,
    overallocatedDays,
    totalOverallocation,
    dailyUtilization,
  };
}

/**
 * Calculate workload balance score across multiple resources
 * @param workloadAnalyses Array of workload analyses
 * @returns Balance score (lower = more balanced)
 */
export function calculateWorkloadBalance(
  workloadAnalyses: WorkloadAnalysis[]
): number {
  if (workloadAnalyses.length === 0) return 0;

  const utilizations = workloadAnalyses.map(
    (analysis) => analysis.averageUtilization
  );
  const overallocations = workloadAnalyses.map(
    (analysis) => analysis.totalOverallocation
  );

  // Balance is combination of utilization variance and total overallocation
  const utilizationVariance = calculateVariance(utilizations);
  const totalOverallocation = overallocations.reduce(
    (sum, val) => sum + val,
    0
  );

  return utilizationVariance + totalOverallocation * 10; // Weight overallocation heavily
}

/**
 * Find the least loaded resource for a given day
 * @param resources Available resources
 * @param assignments Current assignments map
 * @param day Target day
 * @returns Resource with lowest utilization on the day
 */
export function findLeastLoadedResource(
  resources: Resource[],
  assignments: Record<string, Record<string, number>>, // resourceId -> day -> hours
  day: string
): Resource | null {
  if (resources.length === 0) return null;

  let leastLoaded = resources[0];
  let minUtilization = Number.MAX_VALUE;

  for (const resource of resources) {
    const resourceAssignments = assignments[resource.id] || {};
    const dailyUtil = calculateDailyUtilization(resource, resourceAssignments, [
      day,
    ]);

    if (dailyUtil.length > 0) {
      const utilization = dailyUtil[0].utilization;

      // Prefer resource with lower utilization, break ties by resource ID for determinism
      if (
        utilization < minUtilization ||
        (utilization === minUtilization && resource.id < leastLoaded.id)
      ) {
        minUtilization = utilization;
        leastLoaded = resource;
      }
    }
  }

  return leastLoaded;
}

/**
 * Get overallocated resources on a specific day
 * @param resources Resources to check
 * @param assignments Current assignments
 * @param day Target day
 * @returns Array of overallocated resources with excess hours
 */
export function getOverallocatedResources(
  resources: Resource[],
  assignments: Record<string, Record<string, number>>,
  day: string
): Array<{ resource: Resource; excess: number }> {
  const overallocated: Array<{ resource: Resource; excess: number }> = [];

  for (const resource of resources) {
    const resourceAssignments = assignments[resource.id] || {};
    const dailyUtil = calculateDailyUtilization(resource, resourceAssignments, [
      day,
    ]);

    if (dailyUtil.length > 0 && dailyUtil[0].overallocation > 0) {
      overallocated.push({
        resource,
        excess: dailyUtil[0].overallocation,
      });
    }
  }

  // Sort by excess hours (descending) for priority handling
  overallocated.sort((a, b) => b.excess - a.excess);

  return overallocated;
}

/**
 * Calculate smoothness score for resource allocation
 * @param workloadAnalysis Workload analysis for a resource
 * @returns Smoothness score (lower = smoother, better)
 */
export function calculateSmoothness(
  workloadAnalysis: WorkloadAnalysis
): number {
  // Smoothness is inverse of utilization variance
  return (
    workloadAnalysis.utilizationVariance +
    workloadAnalysis.totalOverallocation * 5
  ); // Penalty for overallocation
}
