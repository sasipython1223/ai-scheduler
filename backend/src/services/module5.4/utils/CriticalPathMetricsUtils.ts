/**
 * Critical Path Metrics Utilities
 *
 * This module contains metrics calculation utilities
 * extracted from CriticalPathAnalyzer to reduce file size
 * and improve modularity.
 */

import { CriticalPath, PathMetrics } from '../types/CriticalPathTypes';

/**
 * Calculates comprehensive metrics for critical paths
 * @param paths Array of critical paths
 * @returns Calculated metrics
 */
export function calculateCriticalPathMetrics(
  paths: CriticalPath[]
): PathMetrics {
  if (paths.length === 0) {
    return {
      duration: 0,
      taskCount: 0,
      complexityScore: 0,
      riskScore: 0,
    };
  }

  const totalDuration = paths.reduce(
    (sum, path) => sum + path.totalDuration,
    0
  );
  const totalTasks = paths.reduce((sum, path) => sum + path.pathLength, 0);
  const averageDuration = totalDuration / paths.length;
  const averageTaskCount = totalTasks / paths.length;

  // Complexity based on number of paths and interconnections
  const complexityScore = Math.min(
    100,
    paths.length * 15 + averageTaskCount * 2
  );

  // Risk based on path length and duration
  const riskScore = Math.min(
    100,
    averageDuration / 20 + (averageTaskCount / 5) * 10
  );

  return {
    duration: Math.round(averageDuration * 100) / 100,
    taskCount: Math.round(averageTaskCount),
    complexityScore: Math.round(complexityScore),
    riskScore: Math.round(riskScore),
  };
}

/**
 * Calculates path density for critical path analysis
 * @param paths Array of critical paths
 * @param totalTasks Total number of tasks in project
 * @returns Path density ratio
 */
export function calculatePathDensity(
  paths: CriticalPath[],
  totalTasks: number
): number {
  if (totalTasks === 0 || paths.length === 0) {
    return 0;
  }

  const uniqueCriticalTasks = new Set<string>();
  for (const path of paths) {
    for (const taskId of path.tasks) {
      uniqueCriticalTasks.add(taskId);
    }
  }

  return Math.round((uniqueCriticalTasks.size / totalTasks) * 100) / 100;
}

/**
 * Calculates average path length across all critical paths
 * @param paths Array of critical paths
 * @returns Average path length
 */
export function calculateAveragePathLength(paths: CriticalPath[]): number {
  if (paths.length === 0) {
    return 0;
  }

  const totalLength = paths.reduce((sum, path) => sum + path.pathLength, 0);
  return Math.round((totalLength / paths.length) * 100) / 100;
}

/**
 * Calculates complexity score for critical path network
 * @param paths Array of critical paths
 * @returns Complexity score (0-100)
 */
export function calculateComplexityScore(paths: CriticalPath[]): number {
  if (paths.length === 0) {
    return 0;
  }

  const pathCount = paths.length;
  const averageLength = calculateAveragePathLength(paths);
  const maxPathLength = Math.max(...paths.map((p) => p.pathLength));

  // Base complexity on number of paths, average length, and max length
  const baseScore = pathCount * 10;
  const lengthScore = averageLength * 3;
  const maxLengthScore = maxPathLength * 2;

  return Math.min(100, Math.round(baseScore + lengthScore + maxLengthScore));
}
