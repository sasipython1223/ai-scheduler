/**
 * Module 7.1 - Optimizer Pipeline Utility
 *
 * IMPLEMENTATION PLAN:
 *
 * Purpose: Pure functional pipeline for strategy execution and management.
 *
 * API:
 * - runPipeline() for strategy execution orchestration
 * - Strategy selection algorithms
 * - Optimization workflow coordination
 */

import type {
  ScheduleGraph,
  ValidationReport,
} from '../../constraint-aware-scheduler';
import type { OptimizationStrategy } from '../../schedule-optimizer';
import { endTimer, startTimer, type Metrics } from './progress-metrics';

export interface PipelineContext {
  strategies: Map<string, OptimizationStrategy>;
  metrics: Metrics;
}

export interface PipelineInput {
  schedule: ScheduleGraph;
  strategyName: string;
  maxIterations: number;
  context: PipelineContext;
}

export interface PipelineResult {
  schedule: ScheduleGraph;
  metadata: {
    strategy: string;
    iterations: number;
    improvementScore: number;
    timeElapsed: number;
  };
}

/**
 * Executes an optimization strategy within a controlled pipeline.
 *
 * Pure function that orchestrates strategy execution, performance tracking,
 * and result composition without side effects on the pipeline context.
 *
 * @param input - Pipeline execution parameters
 * @returns Promise resolving to optimization results
 */
export async function runPipeline(
  input: PipelineInput
): Promise<PipelineResult> {
  const { schedule, strategyName, maxIterations, context } = input;
  const timer = startTimer();

  // Auto-select strategy if requested
  let strategy: OptimizationStrategy;

  if (strategyName === 'auto') {
    strategy = await selectBestStrategy(schedule, context);
  } else {
    const selectedStrategy = context.strategies.get(strategyName);
    if (!selectedStrategy) {
      throw new Error(`Unknown optimization strategy: ${strategyName}`);
    }
    strategy = selectedStrategy;
  }

  // TODO: validate schedule and get current violations
  const violations: ValidationReport = {
    violations: [],
    hasBlocking: false,
    summary: 'No violations detected during scaffolding phase',
  };

  // Execute optimization strategy
  const result = await strategy.optimize(schedule, violations, maxIterations);

  const timeElapsed = endTimer(timer);

  // Record performance for future strategy selection
  context.metrics.recordPerformance({
    strategy: strategy.name,
    violations: violations.violations.length,
    improvement: result.metadata.improvementScore,
    timeElapsed,
  });

  return {
    schedule: result.schedule,
    metadata: {
      ...result.metadata,
      timeElapsed,
    },
  };
}

/**
 * Selects the best optimization strategy based on violation analysis.
 *
 * Pure function that uses performance history and violation characteristics
 * to choose the most suitable strategy without modifying context state.
 *
 * @param schedule - Schedule to analyze for strategy selection
 * @param context - Pipeline context with strategies and metrics
 * @returns Promise resolving to best available strategy
 */
export async function selectBestStrategy(
  _schedule: ScheduleGraph,
  context: PipelineContext
): Promise<OptimizationStrategy> {
  // TODO: analyze violations and select appropriate strategy
  const violations: ValidationReport = {
    violations: [],
    hasBlocking: false,
    summary: 'No violations detected during scaffolding phase',
  };

  let bestStrategy: OptimizationStrategy | null = null;
  let bestScore = -1;

  context.strategies.forEach((strategy) => {
    const suitability = strategy.assessSuitability(violations);
    const historyBonus = context.metrics.calculateHistoryBonus(strategy.name);
    const totalScore = suitability * 0.7 + historyBonus * 0.3;

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestStrategy = strategy;
    }
  });

  if (!bestStrategy) {
    throw new Error('No optimization strategies available');
  }

  return bestStrategy;
}

/**
 * Validates pipeline input parameters.
 *
 * @param input - Pipeline input to validate
 * @throws Error if input is invalid
 */
export function validatePipelineInput(input: PipelineInput): void {
  if (!input.schedule) {
    throw new Error('Schedule is required for pipeline execution');
  }

  if (!input.strategyName || input.strategyName.trim() === '') {
    throw new Error('Strategy name is required for pipeline execution');
  }

  if (input.maxIterations < 0) {
    throw new Error('Max iterations must be non-negative');
  }

  if (!input.context || !input.context.strategies || !input.context.metrics) {
    throw new Error('Valid pipeline context is required');
  }
}

/**
 * Creates a pipeline context with strategies and metrics.
 *
 * @param strategies - Map of available optimization strategies
 * @param metrics - Metrics instance for performance tracking
 * @returns Configured pipeline context
 */
export function createPipelineContext(
  strategies: Map<string, OptimizationStrategy>,
  metrics: Metrics
): PipelineContext {
  return {
    strategies,
    metrics,
  };
}

/**
 * Gets a list of available strategy names from context.
 *
 * @param context - Pipeline context
 * @returns Array of strategy names
 */
export function getAvailableStrategyNames(context: PipelineContext): string[] {
  const names: string[] = [];
  context.strategies.forEach((_, name) => {
    names.push(name);
  });
  return names;
}

/**
 * Gets strategy information from context.
 *
 * @param context - Pipeline context
 * @returns Array of strategy information
 */
export function getStrategyInfo(context: PipelineContext): Array<{
  name: string;
  description: string;
  complexity: string;
}> {
  const info: Array<{
    name: string;
    description: string;
    complexity: string;
  }> = [];

  context.strategies.forEach((strategy) => {
    info.push({
      name: strategy.name,
      description: strategy.description,
      complexity: strategy.complexity,
    });
  });

  return info;
}
