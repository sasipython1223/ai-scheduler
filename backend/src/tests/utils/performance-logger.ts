/**
 * Performance Test Utilities - Performance Logger
 * Module 5.6: Log performance metrics and generate reports
 */

import { writeFile } from 'fs/promises';
import { resolve } from 'path';

/**
 * Performance metrics data structure
 */
export interface PerformanceMetrics {
  taskCount: number;
  dependencyCount: number;
  complexity: 'simple' | 'complex';
  executionTimeMs: number;
  memoryUsageMB: number;
  memoryPeakMB: number;
  throughputTasksPerSecond: number;
  isValidResult: boolean;
  errorCount: number;
  timestamp: string;
  nodeVersion: string;
  platform: string;
}

/**
 * Performance test results collection
 */
export interface PerformanceTestResults {
  testRun: {
    id: string;
    startTime: string;
    endTime: string;
    duration: number;
  };
  scenarios: PerformanceMetrics[];
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    averageExecutionTime: number;
    totalMemoryUsed: number;
  };
}

/**
 * Memory usage tracker
 */
export class MemoryTracker {
  private initialMemory: number;
  private peakMemory: number;

  constructor() {
    this.initialMemory = process.memoryUsage().heapUsed;
    this.peakMemory = this.initialMemory;
  }

  /**
   * Update peak memory if current usage is higher
   */
  public updatePeak(): void {
    const currentMemory = process.memoryUsage().heapUsed;
    if (currentMemory > this.peakMemory) {
      this.peakMemory = currentMemory;
    }
  }

  /**
   * Get current memory usage in MB
   */
  public getCurrentUsageMB(): number {
    return (process.memoryUsage().heapUsed - this.initialMemory) / 1024 / 1024;
  }

  /**
   * Get peak memory usage in MB
   */
  public getPeakUsageMB(): number {
    return (this.peakMemory - this.initialMemory) / 1024 / 1024;
  }

  /**
   * Reset tracking
   */
  public reset(): void {
    this.initialMemory = process.memoryUsage().heapUsed;
    this.peakMemory = this.initialMemory;
  }
}

/**
 * Performance logger for test metrics
 */
export class PerformanceLogger {
  private metrics: PerformanceMetrics[] = [];
  private testRunId: string;
  private startTime: number;

  constructor() {
    this.testRunId = `perf-${Date.now()}`;
    this.startTime = Date.now();
  }

  /**
   * Log performance metrics for a test scenario
   */
  public logMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    this.logToConsole(metrics);
  }

  /**
   * Log metrics to console with formatting
   */
  private logToConsole(metrics: PerformanceMetrics): void {
    const {
      taskCount,
      dependencyCount,
      complexity,
      executionTimeMs,
      memoryUsageMB,
      memoryPeakMB,
      throughputTasksPerSecond,
      isValidResult,
      errorCount,
    } = metrics;

    console.log(`\n🚀 Performance Test Result (${complexity.toUpperCase()})`);
    console.log('='.repeat(50));
    console.log(`📊 Tasks: ${taskCount.toLocaleString()}`);
    console.log(`🔗 Dependencies: ${dependencyCount.toLocaleString()}`);
    console.log(`⏱️  Execution Time: ${executionTimeMs.toFixed(2)} ms`);
    console.log(`💾 Memory Used: ${memoryUsageMB.toFixed(2)} MB`);
    console.log(`📈 Peak Memory: ${memoryPeakMB.toFixed(2)} MB`);
    console.log(
      `⚡ Throughput: ${throughputTasksPerSecond.toFixed(0)} tasks/sec`
    );
    console.log(`✅ Result Valid: ${isValidResult ? '✓' : '✗'}`);
    console.log(`❌ Errors: ${errorCount}`);

    // Performance thresholds
    const thresholds = this.getPerformanceThresholds(taskCount);
    this.logThresholdComparison(executionTimeMs, memoryUsageMB, thresholds);
  }

  /**
   * Get performance thresholds for different task counts
   */
  private getPerformanceThresholds(taskCount: number) {
    if (taskCount <= 1000) {
      return { timeMs: 500, memoryMB: 50 };
    } else if (taskCount <= 5000) {
      return { timeMs: 1500, memoryMB: 200 };
    } else if (taskCount <= 10000) {
      return { timeMs: 3000, memoryMB: 500 };
    } else {
      return { timeMs: 5000, memoryMB: 1000 };
    }
  }

  /**
   * Log threshold comparison
   */
  private logThresholdComparison(
    executionTimeMs: number,
    memoryUsageMB: number,
    thresholds: { timeMs: number; memoryMB: number }
  ): void {
    const timeStatus =
      executionTimeMs <= thresholds.timeMs ? '✅ PASS' : '⚠️  SLOW';
    const memoryStatus =
      memoryUsageMB <= thresholds.memoryMB ? '✅ PASS' : '⚠️  HIGH';

    console.log(`📊 Performance vs Thresholds:`);
    console.log(`   Time: ${timeStatus} (≤ ${thresholds.timeMs}ms)`);
    console.log(`   Memory: ${memoryStatus} (≤ ${thresholds.memoryMB}MB)`);
  }

  /**
   * Generate final performance report
   */
  public generateReport(): PerformanceTestResults {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;

    const summary = {
      totalTests: this.metrics.length,
      passedTests: this.metrics.filter((m) => m.isValidResult).length,
      failedTests: this.metrics.filter((m) => !m.isValidResult).length,
      averageExecutionTime:
        this.metrics.reduce((sum, m) => sum + m.executionTimeMs, 0) /
        this.metrics.length,
      totalMemoryUsed: this.metrics.reduce(
        (sum, m) => sum + m.memoryUsageMB,
        0
      ),
    };

    return {
      testRun: {
        id: this.testRunId,
        startTime: new Date(this.startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration: totalDuration,
      },
      scenarios: this.metrics,
      summary,
    };
  }

  /**
   * Save performance report to file
   */
  public async saveReport(outputPath?: string): Promise<string> {
    const report = this.generateReport();
    const fileName = outputPath || `performance-report-${this.testRunId}.json`;
    const filePath = resolve(process.cwd(), fileName);

    await writeFile(filePath, JSON.stringify(report, null, 2));

    console.log(`\n📊 Performance report saved: ${filePath}`);
    return filePath;
  }

  /**
   * Generate markdown summary report
   */
  public generateMarkdownSummary(): string {
    const report = this.generateReport();
    const { testRun, scenarios, summary } = report;

    let markdown = `# 📈 Performance Test Report\n\n`;
    markdown += `**Test Run ID:** ${testRun.id}\n`;
    markdown += `**Duration:** ${(testRun.duration / 1000).toFixed(2)}s\n`;
    markdown += `**Timestamp:** ${testRun.startTime}\n\n`;

    markdown += `## 📊 Summary\n\n`;
    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| Total Tests | ${summary.totalTests} |\n`;
    markdown += `| Passed | ${summary.passedTests} |\n`;
    markdown += `| Failed | ${summary.failedTests} |\n`;
    markdown += `| Avg Execution Time | ${summary.averageExecutionTime.toFixed(2)}ms |\n`;
    markdown += `| Total Memory Used | ${summary.totalMemoryUsed.toFixed(2)}MB |\n\n`;

    markdown += `## 🚀 Test Results\n\n`;
    scenarios.forEach((scenario, index) => {
      markdown += `### Test ${index + 1}: ${scenario.taskCount.toLocaleString()} Tasks (${scenario.complexity})\n\n`;
      markdown += `- **Execution Time:** ${scenario.executionTimeMs.toFixed(2)}ms\n`;
      markdown += `- **Memory Usage:** ${scenario.memoryUsageMB.toFixed(2)}MB\n`;
      markdown += `- **Peak Memory:** ${scenario.memoryPeakMB.toFixed(2)}MB\n`;
      markdown += `- **Throughput:** ${scenario.throughputTasksPerSecond.toFixed(0)} tasks/sec\n`;
      markdown += `- **Dependencies:** ${scenario.dependencyCount.toLocaleString()}\n`;
      markdown += `- **Status:** ${scenario.isValidResult ? '✅ PASS' : '❌ FAIL'}\n\n`;
    });

    return markdown;
  }
}

/**
 * Create performance metrics object
 */
export function createPerformanceMetrics(params: {
  taskCount: number;
  dependencyCount: number;
  complexity: 'simple' | 'complex';
  executionTimeMs: number;
  memoryUsageMB: number;
  memoryPeakMB: number;
  isValidResult: boolean;
  errorCount?: number;
}): PerformanceMetrics {
  const {
    taskCount,
    dependencyCount,
    complexity,
    executionTimeMs,
    memoryUsageMB,
    memoryPeakMB,
    isValidResult,
    errorCount = 0,
  } = params;

  const throughputTasksPerSecond = taskCount / (executionTimeMs / 1000);

  return {
    taskCount,
    dependencyCount,
    complexity,
    executionTimeMs,
    memoryUsageMB,
    memoryPeakMB,
    throughputTasksPerSecond,
    isValidResult,
    errorCount,
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
  };
}
