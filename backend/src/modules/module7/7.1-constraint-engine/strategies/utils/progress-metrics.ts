/**
 * Module 7.1 - Progress Metrics Utility
 *
 * IMPLEMENTATION PLAN:
 *
 * Purpose: Performance tracking and efficiency calculation for optimization strategies.
 *
 * API:
 * - Metrics class for strategy performance tracking
 * - Timer utilities for performance measurement
 * - History management for strategy selection
 */

export interface PerformanceRecord {
  strategy: string;
  violations: number;
  improvement: number;
  timeElapsed: number;
}

export interface StrategyStats {
  improvements: number[];
  times: number[];
}

export interface PerformanceAnalysis {
  strategies: Array<{
    name: string;
    uses: number;
    avgImprovement: number;
    avgTime: number;
    efficiency: number;
  }>;
  totalOptimizations: number;
}

/**
 * Manages performance metrics and history for optimization strategies.
 *
 * Tracks strategy effectiveness over time to improve auto-selection
 * algorithms and provide performance insights.
 */
export class Metrics {
  private performanceHistory: PerformanceRecord[] = [];

  /**
   * Records a strategy execution result for future analysis.
   *
   * @param record - Performance record to store
   */
  recordPerformance(record: PerformanceRecord): void {
    this.performanceHistory.push(record);
  }

  /**
   * Calculates performance history bonus for strategy selection.
   *
   * @param strategyName - Name of strategy to evaluate
   * @returns History-based performance bonus (0-1)
   */
  calculateHistoryBonus(strategyName: string): number {
    const strategyHistory = this.performanceHistory
      .filter((h) => h.strategy === strategyName)
      .slice(-5); // Last 5 uses

    if (strategyHistory.length === 0) {
      return 0.5; // Neutral for unknown strategies
    }

    const avgImprovement =
      strategyHistory.reduce((sum, h) => sum + h.improvement, 0) /
      strategyHistory.length;
    const avgTime =
      strategyHistory.reduce((sum, h) => sum + h.timeElapsed, 0) /
      strategyHistory.length;

    // Balance improvement vs speed (prefer faster strategies with good results)
    const efficiencyScore = avgImprovement / Math.log(avgTime + 1);

    return Math.min(1, Math.max(0, efficiencyScore / 10)); // Normalize to 0-1
  }

  /**
   * Provides detailed strategy performance analysis.
   *
   * @returns Summary of strategy effectiveness and usage patterns
   */
  getPerformanceAnalysis(): PerformanceAnalysis {
    const strategyStats = new Map<string, StrategyStats>();

    for (const record of this.performanceHistory) {
      if (!strategyStats.has(record.strategy)) {
        strategyStats.set(record.strategy, { improvements: [], times: [] });
      }
      const stats = strategyStats.get(record.strategy)!;
      stats.improvements.push(record.improvement);
      stats.times.push(record.timeElapsed);
    }

    const strategies: Array<{
      name: string;
      uses: number;
      avgImprovement: number;
      avgTime: number;
      efficiency: number;
    }> = [];

    strategyStats.forEach((stats, name) => {
      const avgImprovement =
        stats.improvements.reduce((a, b) => a + b, 0) /
        stats.improvements.length;
      const avgTime =
        stats.times.reduce((a, b) => a + b, 0) / stats.times.length;

      strategies.push({
        name,
        uses: stats.improvements.length,
        avgImprovement,
        avgTime,
        efficiency: avgImprovement / Math.log(avgTime + 1),
      });
    });

    return {
      strategies,
      totalOptimizations: this.performanceHistory.length,
    };
  }

  /**
   * Clears performance history (useful for testing or reset scenarios).
   */
  clearHistory(): void {
    this.performanceHistory = [];
  }

  /**
   * Gets the total number of recorded optimizations.
   *
   * @returns Total optimization count
   */
  getTotalOptimizations(): number {
    return this.performanceHistory.length;
  }
}

/**
 * Timer utility for measuring optimization performance.
 */
export class Timer {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Gets elapsed time since timer creation.
   *
   * @returns Elapsed time in milliseconds
   */
  getElapsed(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Resets the timer to current time.
   */
  reset(): void {
    this.startTime = Date.now();
  }
}

/**
 * Creates a new timer instance.
 *
 * @returns New timer starting from current time
 */
export function startTimer(): Timer {
  return new Timer();
}

/**
 * Calculates elapsed time from a timer.
 *
 * @param timer - Timer instance to measure
 * @returns Elapsed time in milliseconds
 */
export function endTimer(timer: Timer): number {
  return timer.getElapsed();
}
