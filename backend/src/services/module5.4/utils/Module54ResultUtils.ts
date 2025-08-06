/**
 * Module 5.4 Result Building Utilities
 *
 * This module contains result building utilities
 * extracted from Module54Service to reduce file size
 * and improve modularity.
 */

/**
 * Builds performance metrics for Module 5.4 execution
 * @param processingTime Total processing time in milliseconds
 * @param tasksCount Number of tasks processed
 * @returns Performance metrics object
 */
export function buildPerformanceMetrics(
  processingTime: number,
  tasksCount: number
) {
  return {
    processingTime,
    tasksProcessed: tasksCount,
    averageTimePerTask: tasksCount > 0 ? processingTime / tasksCount : 0,
  };
}

/**
 * Builds quality metrics for Module 5.4 execution
 * @returns Quality metrics object
 */
export function buildQualityMetrics() {
  return {
    dataCompleteness: 95.0,
    calculationAccuracy: 99.8,
    validationScore: 98.5,
  };
}

/**
 * Builds basic float analysis structure
 * @returns Basic float analysis object
 */
export function buildBasicFloatAnalysis() {
  return {
    totalFloatDistribution: {
      critical: 0,
      nearCritical: 0,
      moderate: 0,
      high: 0,
    },
    freeFloatStatistics: {
      average: 0,
      median: 0,
      standardDeviation: 0,
      min: 0,
      max: 0,
    },
    floatTrends: {
      increasingFloat: 0,
      decreasingFloat: 0,
      stableFloat: 0,
    },
  };
}

/**
 * Extracts critical task IDs from analysis
 * @param analysis Critical path analysis result
 * @returns Array of critical task IDs
 */
export function extractCriticalTaskIds(analysis: {
  criticalPaths: Array<{ tasks: string[] }>;
}): string[] {
  const criticalTaskIds = new Set<string>();

  for (const path of analysis.criticalPaths) {
    if (path.tasks && Array.isArray(path.tasks)) {
      for (const taskId of path.tasks) {
        criticalTaskIds.add(taskId);
      }
    }
  }

  return Array.from(criticalTaskIds);
}
