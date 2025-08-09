/**
 * 📈 Module 5.6 – Schedule Engine Performance Testing
 * ----------------------------------------------------
 * Purpose:
 * - Benchmark CPM engine on large datasets (1K, 5K, 10K tasks)
 * - Profile memory usage and execution time
 * - Output metrics for reporting and optimization
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import type {
  ScheduleCalculationRequest,
  SchedulePipelineResult,
} from '../../src/modules/module5/module5.1-core-engine/schedule-core';
import { ScheduleEngine } from '../../src/modules/module5/module5.1-core-engine/schedule-core';
import { generateTestScenario } from '../../src/modules/module5/module5.6-performance/performance-generator';
import {
  MemoryTracker,
  PerformanceLogger,
  createPerformanceMetrics,
} from '../../src/modules/module5/module5.6-performance/performance-logger';

/**
 * Performance test configuration
 */
const PERFORMANCE_CONFIG = {
  taskCounts: [1000, 5000, 10000],
  complexities: ['simple', 'complex'] as const,
  maxExecutionTimeMs: {
    1000: 500, // 1K tasks should complete under 500ms
    5000: 1500, // 5K tasks should complete under 1.5s
    10000: 3000, // 10K tasks should complete under 3s
  },
  maxMemoryUsageMB: {
    1000: 50, // 1K tasks should use under 50MB
    5000: 200, // 5K tasks should use under 200MB
    10000: 500, // 10K tasks should use under 500MB
  },
};

/**
 * Validate schedule result integrity
 */
function validateScheduleResult(
  result: SchedulePipelineResult,
  expectedTaskCount: number
): boolean {
  if (!result || !result.success) {
    return false;
  }

  if (!result.tasks || result.tasks.length !== expectedTaskCount) {
    return false;
  }

  // Check that all tasks have required scheduling properties
  for (const task of result.tasks) {
    if (
      !task.earlyStart ||
      !task.earlyFinish ||
      !task.lateStart ||
      !task.lateFinish
    ) {
      return false;
    }

    if (
      typeof task.totalFloat !== 'number' ||
      typeof task.freeFloat !== 'number'
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Execute a single performance test
 */
async function executePerformanceTest(
  scheduleEngine: ScheduleEngine,
  taskCount: number,
  complexity: 'simple' | 'complex'
) {
  const scenario = generateTestScenario(taskCount, complexity);
  const memoryTracker = new MemoryTracker();

  const request: ScheduleCalculationRequest = {
    tasks: scenario.tasks,
    logicLinks: scenario.logicLinks,
    projectStartDate: new Date().toISOString(),
    options: { epsilon: 0.01, includeWeekends: false },
  };

  const startTime = performance.now();
  let result: SchedulePipelineResult;
  let errorCount = 0;

  try {
    result = await scheduleEngine.runFullSchedulePipeline(request);
    memoryTracker.updatePeak();
  } catch (error) {
    errorCount = 1;
    console.error(
      `❌ Test failed for ${taskCount} ${complexity} tasks:`,
      error
    );
    throw error;
  }

  const endTime = performance.now();
  const executionTimeMs = endTime - startTime;
  const memoryUsageMB = memoryTracker.getCurrentUsageMB();
  const memoryPeakMB = memoryTracker.getPeakUsageMB();
  const isValidResult = validateScheduleResult(result, taskCount);

  return {
    result,
    metrics: createPerformanceMetrics({
      taskCount,
      dependencyCount: scenario.metadata.dependencyCount,
      complexity,
      executionTimeMs,
      memoryUsageMB,
      memoryPeakMB,
      isValidResult,
      errorCount,
    }),
    executionTimeMs,
    memoryUsageMB,
  };
}

describe('📊 Performance Tests - Schedule Engine', () => {
  let performanceLogger: PerformanceLogger;
  let scheduleEngine: ScheduleEngine;

  beforeAll(() => {
    performanceLogger = new PerformanceLogger();
    scheduleEngine = new ScheduleEngine({
      epsilon: 0.01,
      includeWeekends: false,
    });
    console.log('\n🚀 Starting Schedule Engine Performance Tests');
  });

  afterAll(async () => {
    const report = performanceLogger.generateReport();
    await performanceLogger.saveReport();

    console.log('\n📊 Performance Test Summary');
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.passedTests}`);
    console.log(
      `Average Time: ${report.summary.averageExecutionTime.toFixed(2)}ms`
    );
  });

  describe('Basic Performance Tests', () => {
    PERFORMANCE_CONFIG.taskCounts.forEach((taskCount) => {
      it(`should schedule ${taskCount.toLocaleString()} simple tasks efficiently`, async () => {
        const testResult = await executePerformanceTest(
          scheduleEngine,
          taskCount,
          'simple'
        );
        const { result, metrics, executionTimeMs, memoryUsageMB } = testResult;

        performanceLogger.logMetrics(metrics);

        const maxTime =
          PERFORMANCE_CONFIG.maxExecutionTimeMs[
            taskCount as keyof typeof PERFORMANCE_CONFIG.maxExecutionTimeMs
          ];
        const maxMemory =
          PERFORMANCE_CONFIG.maxMemoryUsageMB[
            taskCount as keyof typeof PERFORMANCE_CONFIG.maxMemoryUsageMB
          ];

        expect(executionTimeMs).toBeLessThanOrEqual(maxTime);
        expect(memoryUsageMB).toBeLessThanOrEqual(maxMemory);
        expect(metrics.isValidResult).toBe(true);
        expect(result.success).toBe(true);
        expect(result.tasks.length).toBe(taskCount);
      });
    });
  });
});

describe('Complex Performance Tests', () => {
  let performanceLogger: PerformanceLogger;
  let scheduleEngine: ScheduleEngine;

  beforeAll(() => {
    performanceLogger = new PerformanceLogger();
    scheduleEngine = new ScheduleEngine({
      epsilon: 0.01,
      includeWeekends: false,
    });
  });

  PERFORMANCE_CONFIG.taskCounts.forEach((taskCount) => {
    it(`should schedule ${taskCount.toLocaleString()} complex tasks efficiently`, async () => {
      const testResult = await executePerformanceTest(
        scheduleEngine,
        taskCount,
        'complex'
      );
      const { result, metrics } = testResult;

      performanceLogger.logMetrics(metrics);

      expect(metrics.isValidResult).toBe(true);
      expect(result.success).toBe(true);
      expect(result.tasks.length).toBe(taskCount);
    });
  });
});

describe('Consistency Tests', () => {
  let scheduleEngine: ScheduleEngine;

  beforeAll(() => {
    scheduleEngine = new ScheduleEngine({
      epsilon: 0.01,
      includeWeekends: false,
    });
  });

  it('should maintain consistent performance across multiple runs', async () => {
    const runs = 3;
    const taskCount = 1000;
    const executionTimes: number[] = [];

    for (let run = 0; run < runs; run++) {
      const testResult = await executePerformanceTest(
        scheduleEngine,
        taskCount,
        'simple'
      );
      executionTimes.push(testResult.executionTimeMs);
      expect(testResult.result.success).toBe(true);
    }

    const avgTime = executionTimes.reduce((a, b) => a + b, 0) / runs;
    const maxTime = Math.max(...executionTimes);
    const minTime = Math.min(...executionTimes);
    const variance = ((maxTime - minTime) / avgTime) * 100;

    console.log(`\n🔄 Consistency Test: Variance ${variance.toFixed(1)}%`);
    expect(variance).toBeLessThan(50);
  });
});

describe('Throughput Benchmarks', () => {
  let scheduleEngine: ScheduleEngine;

  beforeAll(() => {
    scheduleEngine = new ScheduleEngine({
      epsilon: 0.01,
      includeWeekends: false,
    });
  });

  it('should achieve minimum throughput targets', async () => {
    const throughputTests = [
      { taskCount: 1000, minThroughput: 1000 },
      { taskCount: 5000, minThroughput: 2000 },
    ];

    for (const test of throughputTests) {
      const testResult = await executePerformanceTest(
        scheduleEngine,
        test.taskCount,
        'simple'
      );
      const throughput = test.taskCount / (testResult.executionTimeMs / 1000);

      console.log(
        `\n⚡ Throughput (${test.taskCount} tasks): ${throughput.toFixed(0)} tasks/sec`
      );
      expect(testResult.result.success).toBe(true);
    }
  });
});
