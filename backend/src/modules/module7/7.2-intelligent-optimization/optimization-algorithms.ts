/**
 * Module 7.2 - Optimization Algorithms Façade
 *
 * Main interface for intelligent optimization with strategy orchestration,
 * time budget enforcement, and result aggregation.
 */

import {
  AlgorithmContext,
  createBaselineCandidate,
  selectBestCandidate,
} from './algorithm-context';
import type { OptimizationConfig } from './config';
import { DEFAULT_CONFIG } from './config';
import type { OptimizationStrategy } from './strategies/optimization-strategy';
import type {
  OptimizationCandidate,
  OptimizationInput,
  OptimizationResult,
} from './types';

/**
 * Façade class for optimization algorithm orchestration
 */
export class OptimizationFacade {
  private readonly strategies: OptimizationStrategy[];
  private readonly config: OptimizationConfig;

  constructor(
    strategies: OptimizationStrategy[] = [],
    config: Partial<OptimizationConfig> = {}
  ) {
    this.strategies = strategies;
    this.config = {
      defaults: {
        timeBudgetMs:
          config.defaults?.timeBudgetMs ?? DEFAULT_CONFIG.defaults.timeBudgetMs,
        maxIterations:
          config.defaults?.maxIterations ??
          DEFAULT_CONFIG.defaults.maxIterations,
      },
    };
  }

  /**
   * Select strategies that support the given input
   * Order: GA → SA → ML by default, filtered by supports()
   */
  selectStrategies(input: OptimizationInput): OptimizationStrategy[] {
    // Define preferred order: GA first, then SA, then ML
    const preferredOrder = [
      'GeneticAlgorithm',
      'SimulatedAnnealing',
      'MLOptimization',
    ];

    const supportedStrategies = this.strategies.filter((strategy) =>
      strategy.supports(input)
    );

    // Sort by preferred order
    return supportedStrategies.sort((a, b) => {
      const aIndex = preferredOrder.indexOf(a.name);
      const bIndex = preferredOrder.indexOf(b.name);

      // If both are in preferred order, use that order
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }

      // If only one is in preferred order, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      // If neither is in preferred order, maintain current order
      return 0;
    });
  }

  /**
   * Run optimization with strategy orchestration and time budget enforcement
   */
  async run(input: OptimizationInput): Promise<OptimizationResult> {
    const startTime = Date.now();

    try {
      // Merge defaults from config
      const mergedInput = this.mergeDefaults(input);
      const context = new AlgorithmContext(mergedInput.timeBudgetMs!);

      // Select and run strategies
      const selectedStrategies = this.selectStrategies(mergedInput);
      const results = await this.executeStrategies(
        selectedStrategies,
        mergedInput,
        context
      );

      // Determine result status and best candidate
      const { status, best } = this.analyzeResults(results, mergedInput);

      return {
        status,
        best,
        iterations: results.length,
        diagnostics: {
          tookMs: Date.now() - startTime,
          triedStrategies: results.map((r) => r.strategy),
          notes: this.generateDiagnosticNotes(results, selectedStrategies),
        },
      };
    } catch (error) {
      return {
        status: 'error',
        iterations: 0,
        diagnostics: {
          tookMs: Date.now() - startTime,
          triedStrategies: [],
          notes: ['Unexpected error during optimization'],
        },
        errorMessage:
          error instanceof Error ? error.message : 'Unknown optimization error',
      };
    }
  }

  /**
   * Merge input with default configuration values
   */
  private mergeDefaults(input: OptimizationInput): OptimizationInput {
    return {
      ...input,
      timeBudgetMs: input.timeBudgetMs ?? this.config.defaults.timeBudgetMs,
      maxIterations: input.maxIterations ?? this.config.defaults.maxIterations,
      objectiveWeights: input.objectiveWeights ?? {
        makespan: 0.4,
        softViolations: 0.3,
        leveling: 0.2,
        latency: 0.1,
      },
    };
  }

  /**
   * Execute strategies in order until time or iterations run out
   */
  private async executeStrategies(
    strategies: OptimizationStrategy[],
    input: OptimizationInput,
    context: AlgorithmContext
  ): Promise<Array<{ strategy: string; candidate?: OptimizationCandidate }>> {
    const results: Array<{
      strategy: string;
      candidate?: OptimizationCandidate;
    }> = [];
    let iterationsUsed = 0;
    const maxIterations = input.maxIterations!;

    for (const strategy of strategies) {
      if (context.isTimeExceeded() || iterationsUsed >= maxIterations) {
        break;
      }

      try {
        const candidate = await strategy.optimize(input);
        results.push({
          strategy: strategy.name,
          candidate,
        });
        iterationsUsed++;
      } catch {
        // Strategy failed, continue with next one
        results.push({
          strategy: strategy.name,
          candidate: undefined,
        });
      }
    }

    return results;
  }

  /**
   * Analyze results and determine status
   */
  private analyzeResults(
    results: Array<{ strategy: string; candidate?: OptimizationCandidate }>,
    _input: OptimizationInput
  ): { status: OptimizationResult['status']; best?: OptimizationCandidate } {
    const candidates = results
      .map((r) => r.candidate)
      .filter((c): c is OptimizationCandidate => c !== undefined);

    if (candidates.length === 0) {
      return { status: 'no_change' };
    }

    const best = selectBestCandidate(candidates);
    if (!best) {
      return { status: 'no_change' };
    }

    // Compare against baseline (score = 0)
    const baseline = createBaselineCandidate('baseline');
    if (best.score > baseline.score) {
      return { status: 'improved', best };
    }

    return { status: 'no_change', best };
  }

  /**
   * Generate diagnostic notes for the optimization run
   */
  private generateDiagnosticNotes(
    results: Array<{ strategy: string; candidate?: OptimizationCandidate }>,
    selectedStrategies: OptimizationStrategy[]
  ): string[] {
    const notes: string[] = [];

    const successfulRuns = results.filter(
      (r) => r.candidate !== undefined
    ).length;
    const totalSelected = selectedStrategies.length;

    notes.push(
      `${successfulRuns}/${totalSelected} strategies completed successfully`
    );

    if (selectedStrategies.length === 0) {
      notes.push('No strategies supported the input parameters');
    }

    const failedStrategies = results
      .filter((r) => r.candidate === undefined)
      .map((r) => r.strategy);

    if (failedStrategies.length > 0) {
      notes.push(`Failed strategies: ${failedStrategies.join(', ')}`);
    }

    return notes;
  }
}
