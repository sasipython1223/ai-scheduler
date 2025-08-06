/**
 * Module 5.4 Error Handling Utilities
 * Purpose: Helper functions for creating error results and handling error states
 */

import { CriticalPathAnalysis } from '../types/CriticalPathTypes';
import { FloatAnalysis } from '../types/FloatTypes';
import {
  EnhancedTask,
  Module54Input,
  Module54Result,
  RiskLevel,
} from '../types/SharedTypes';

/**
 * Creates a default FloatAnalysis for error states
 */
function createDefaultFloatAnalysis(): FloatAnalysis {
  return {
    totalFloatDistribution: {
      zero: 0,
      low: 0,
      medium: 0,
      high: 0,
      averageFloat: 0,
      maxFloat: 0,
      minFloat: 0,
    },
    freeFloatDistribution: {
      zero: 0,
      low: 0,
      medium: 0,
      high: 0,
      averageFloat: 0,
      maxFloat: 0,
      minFloat: 0,
    },
    nearCriticalTasks: [],
    floatBufferAnalysis: {
      totalAvailableFloat: 0,
      averageFloatPerTask: 0,
      criticalPathBuffer: 0,
      riskMitigationCapacity: 0,
    },
    riskAssessment: {
      highRiskTasks: [],
      mediumRiskTasks: [],
      lowRiskTasks: [],
      overallRiskLevel: 'LOW',
    },
  };
}

/**
 * Creates an error result for Module54
 */
export function createErrorResult(
  input: Module54Input,
  error: Error,
  processingTime: number
): Module54Result {
  return {
    tasksWithFlags: createErrorTasks(
      input.tasks as Array<{
        id: string;
        name: string;
        duration: number;
        [key: string]: unknown;
      }>
    ),
    criticalPathAnalysis: createErrorCriticalPathAnalysis(),
    floatAnalysis: createDefaultFloatAnalysis(),
    performanceMetrics: {
      executionTime: processingTime,
      memoryUsage: 0,
      tasksProcessed: 0,
      algorithmComplexity: 'ERROR',
    },
    qualityMetrics: {
      floatConsistencyScore: 0,
      criticalPathValidityScore: 0,
      dataIntegrityScore: 0,
      overallQualityScore: 0,
    },
    processingTime,
    success: false,
    errors: [error.message],
    warnings: [],
  };
}

/**
 * Creates error state tasks
 */
export function createErrorTasks(
  tasks: Array<{
    id: string;
    name: string;
    duration: number;
    [key: string]: unknown;
  }>
): EnhancedTask[] {
  return tasks.map((task) => ({
    ...task,
    totalFloat: 0,
    freeFloat: 0,
    independentFloat: 0,
    isCritical: false,
    floatRank: 0, // Add missing floatRank property
    flags: [],
    earlyStart: new Date(),
    earlyFinish: new Date(),
    lateStart: new Date(),
    lateFinish: new Date(),
    riskLevel: RiskLevel.LOW,
  }));
}

/**
 * Creates error critical path analysis
 */
export function createErrorCriticalPathAnalysis(): CriticalPathAnalysis {
  return {
    criticalPaths: [],
    totalCriticalTasks: 0,
    longestPath: {
      id: 'error-path',
      tasks: [],
      totalDuration: 0,
      startDate: new Date(),
      endDate: new Date(),
      pathLength: 0,
      isLongest: true,
      riskLevel: 'LOW',
    },
    shortestCriticalPath: {
      id: 'error-path',
      tasks: [],
      totalDuration: 0,
      startDate: new Date(),
      endDate: new Date(),
      pathLength: 0,
      isLongest: false,
      riskLevel: 'LOW',
    },
    pathIntersections: [],
    criticalityMetrics: {
      totalCriticalPaths: 0,
      averagePathLength: 0,
      criticalPathDensity: 0,
      pathComplexityScore: 0,
    },
  };
}
