/**
 * Module 7.1 - Schedule Optimizer
 *
 * IMPLEMENTATION PLAN:
 *
 * Purpose: Manages optimization strategies and iterative repair.
 *
 * API:
 * - optimizeSchedule(schedule, strategy): Promise<OptimizedSchedule>
 * - selectOptimizationStrategy(violations): Promise<OptimizationStrategy>
 *
 * Notes: Strategy pattern for different optimization approaches.
 * Future: May support parallel strategy execution and comparison.
 */

import type {
  OptimizeOptions,
  ScheduleGraph,
  ValidationReport,
} from './constraint-aware-scheduler';
import {
  createPipelineContext,
  getStrategyInfo,
  runPipeline,
  selectBestStrategy,
  type PipelineInput,
} from './strategies/utils/optimizer-pipeline';
import { Metrics } from './strategies/utils/progress-metrics';

// TODO: lift to shared-types.ts when finalized
export interface OptimizedSchedule {
  schedule: ScheduleGraph;
  metadata: {
    strategy: string;
    iterations: number;
    improvementScore: number;
    timeElapsed: number;
  };
}

export interface OptimizationStrategy {
  name: string;
  description: string;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';

  /** Applies the optimization strategy to improve a schedule. */
  optimize(
    schedule: ScheduleGraph,
    violations: ValidationReport,
    maxIterations: number
  ): Promise<OptimizedSchedule>;

  /** Estimates the suitability of this strategy for given violations. */
  assessSuitability(violations: ValidationReport): number;
}

/**
 * Orchestrates schedule optimization using pluggable strategy implementations.
 */
export class ScheduleOptimizer {
  private strategies = new Map<string, OptimizationStrategy>();
  private metrics = new Metrics();

  constructor() {}

  /** Registers an optimization strategy for use. */
  registerStrategy(strategy: OptimizationStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  /** Optimizes a schedule using the specified or auto-selected strategy. */
  async optimizeSchedule(
    schedule: ScheduleGraph,
    strategyName: string = 'auto',
    maxIterations: number = 10
  ): Promise<OptimizedSchedule> {
    const context = createPipelineContext(this.strategies, this.metrics);

    const pipelineInput: PipelineInput = {
      schedule,
      strategyName,
      maxIterations,
      context,
    };

    return await runPipeline(pipelineInput);
  }

  /**
   * Provides detailed strategy performance analysis.
   *
   * Delegates to metrics utility for performance tracking and analysis.
   *
   * @returns Summary of strategy effectiveness and usage patterns
   */
  getPerformanceAnalysis() {
    return this.metrics.getPerformanceAnalysis();
  }

  /** Lists all registered optimization strategies. */
  getAvailableStrategies(): Array<{
    name: string;
    description: string;
    complexity: string;
  }> {
    const context = createPipelineContext(this.strategies, this.metrics);
    return getStrategyInfo(context);
  }

  /** Gets the total number of optimizations performed. */
  getTotalOptimizations(): number {
    return this.metrics.getTotalOptimizations();
  }

  /** Clears performance history (useful for testing or reset scenarios). */
  clearPerformanceHistory(): void {
    this.metrics.clearHistory();
  }

  /** Gets the number of registered strategies. */
  getStrategyCount(): number {
    return this.strategies.size;
  }

  /** Checks if a strategy is registered. */
  hasStrategy(strategyName: string): boolean {
    return this.strategies.has(strategyName);
  }

  /** Removes a strategy from the optimizer. */
  removeStrategy(strategyName: string): boolean {
    return this.strategies.delete(strategyName);
  }

  /** Selects the best optimization strategy for a given schedule. */
  async selectBestStrategy(
    schedule: ScheduleGraph
  ): Promise<OptimizationStrategy> {
    const context = createPipelineContext(this.strategies, this.metrics);
    return await selectBestStrategy(schedule, context);
  }

  /** Applies optimization strategies to improve a schedule with constraint violations. */
  async applyOptimizationStrategies(
    schedule: ScheduleGraph,
    report: ValidationReport,
    options?: OptimizeOptions
  ): Promise<ScheduleGraph> {
    // Validate options with defaults
    const timeBudgetMs = options?.timeBudgetMs ?? 100;
    const maxIterations = options?.maxIterations ?? 1;
    const strategyName = options?.strategy ?? 'baseline';

    if (timeBudgetMs <= 0 || maxIterations <= 0) {
      throw new Error(
        'Invalid options: timeBudgetMs and maxIterations must be positive'
      );
    }

    // Get the baseline strategy
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new Error(`Strategy '${strategyName}' not found`);
    }

    // Run BaselineStrategy.optimize() once and return best candidate
    const optimized = await strategy.optimize(schedule, report, maxIterations);
    return optimized.schedule;
  }
}
