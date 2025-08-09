/**
 * Schedule Engine Pipeline Utilities
 * Purpose: Helper functions for building pipeline results
 */

import { ScheduledTask } from '../types/schedule/task.types';

/**
 * Float analysis result structure
 */
export interface FloatAnalysisResult {
  totalFloatDistribution: Record<string, number>;
  freeFloatDistribution: Record<string, number>;
  averageTotalFloat: number;
  averageFreeFloat: number;
}

/**
 * Critical path analysis result structure
 */
export interface CriticalPathAnalysisResult {
  longestPath: string[];
  totalPaths: number;
  criticalDuration: number;
}

/**
 * Flag summary result structure
 */
export interface FlagSummaryResult {
  critical: number;
  nearCritical: number;
  highFloat: number;
  total: number;
}

/**
 * Performance metrics result structure
 */
export interface PerformanceMetricsResult {
  processingTimeMs: number;
  tasksProcessed: number;
  dependenciesProcessed: number;
}

/**
 * Calculate float distribution for tasks
 */
export function calculateFloatDistribution(
  tasks: ScheduledTask[],
  type: 'total' | 'free'
): Record<string, number> {
  const distribution: Record<string, number> = {};

  tasks.forEach((task) => {
    const floatValue =
      type === 'total' ? task.totalFloat || 0 : task.freeFloat || 0;
    const range = getFloatRange(floatValue);
    distribution[range] = (distribution[range] || 0) + 1;
  });

  return distribution;
}

/**
 * Calculate average float for tasks
 */
export function calculateAverageFloat(
  tasks: ScheduledTask[],
  type: 'total' | 'free'
): number {
  if (tasks.length === 0) return 0;

  const totalFloat = tasks.reduce((sum, task) => {
    return (
      sum + (type === 'total' ? task.totalFloat || 0 : task.freeFloat || 0)
    );
  }, 0);

  return totalFloat / tasks.length;
}

/**
 * Calculate critical duration from task IDs
 */
export function calculateCriticalDurationFromIds(
  tasks: ScheduledTask[],
  criticalPathIds: string[]
): number {
  return criticalPathIds.reduce((totalDuration, taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    return totalDuration + (task?.duration || 0);
  }, 0);
}

/**
 * Get float range category
 */
function getFloatRange(floatValue: number): string {
  if (floatValue === 0) return 'zero';
  if (floatValue <= 1) return 'low';
  if (floatValue <= 5) return 'medium';
  return 'high';
}
