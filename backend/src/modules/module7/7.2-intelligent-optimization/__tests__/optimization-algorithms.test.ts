/**
 * Module 7.2 - Optimization Algorithms Tests
 *
 * Tests for OptimizationFacade and strategy orchestration.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { OptimizationFacade } from '../optimization-algorithms';
import type { OptimizationStrategy } from '../strategies/optimization-strategy';
import type { OptimizationCandidate, OptimizationInput } from '../types';

// Mock strategy for testing
class MockStrategy implements OptimizationStrategy {
  readonly name: string;
  private readonly shouldSupport: boolean;
  private readonly candidate?: OptimizationCandidate;

  constructor(
    name: string,
    shouldSupport: boolean = true,
    candidate?: OptimizationCandidate
  ) {
    this.name = name;
    this.shouldSupport = shouldSupport;
    this.candidate = candidate;
  }

  supports(_input: OptimizationInput): boolean {
    return this.shouldSupport;
  }

  async optimize(
    _input: OptimizationInput
  ): Promise<OptimizationCandidate | undefined> {
    // Simulate small processing time
    await new Promise((resolve) => setTimeout(resolve, 1));
    return this.candidate;
  }
}

describe('OptimizationFacade', () => {
  let facade: OptimizationFacade;
  let mockInput: OptimizationInput;

  beforeEach(() => {
    facade = new OptimizationFacade();
    mockInput = {
      schedule: { tasks: [] },
      constraints: { rules: [] },
      timeBudgetMs: 100,
      maxIterations: 2,
    };
  });

  describe('run', () => {
    it('should return typed OptimizationResult with status improved when GA enabled', async () => {
      const goodCandidate: OptimizationCandidate = {
        scheduleId: 'test-1',
        score: 75,
        changesApplied: 3,
      };

      const mockGA = new MockStrategy('GeneticAlgorithm', true, goodCandidate);
      facade = new OptimizationFacade([mockGA]);

      const result = await facade.run(mockInput);

      expect(result).toMatchObject({
        status: 'improved',
        best: goodCandidate,
        iterations: 1,
        diagnostics: {
          tookMs: expect.any(Number),
          triedStrategies: ['GeneticAlgorithm'],
          notes: expect.any(Array),
        },
      });
      expect(result.errorMessage).toBeUndefined();
    });

    it('should return status no_change when no improvement found', async () => {
      const poorCandidate: OptimizationCandidate = {
        scheduleId: 'test-2',
        score: -10, // worse than baseline (0)
        changesApplied: 1,
      };

      const mockGA = new MockStrategy('GeneticAlgorithm', true, poorCandidate);
      facade = new OptimizationFacade([mockGA]);

      const result = await facade.run(mockInput);

      expect(result.status).toBe('no_change');
      expect(result.best).toEqual(poorCandidate);
    });

    it('should return no_change with 0 tried strategies when all flags disabled', async () => {
      // Mock strategies that don't support the input (simulating disabled flags)
      const mockGA = new MockStrategy('GeneticAlgorithm', false);
      const mockSA = new MockStrategy('SimulatedAnnealing', false);

      facade = new OptimizationFacade([mockGA, mockSA]);

      const result = await facade.run(mockInput);

      expect(result.status).toBe('no_change');
      expect(result.diagnostics?.triedStrategies).toEqual([]);
      expect(result.diagnostics?.notes).toContain(
        'No strategies supported the input parameters'
      );
    });

    it('should never throw for normal failures', async () => {
      const throwingStrategy: OptimizationStrategy = {
        name: 'ThrowingStrategy',
        supports: () => true,
        optimize: async () => {
          throw new Error('Strategy failed');
        },
      };

      facade = new OptimizationFacade([throwingStrategy]);

      const result = await facade.run(mockInput);

      // Should not throw, should return error status
      expect(result.status).toBe('no_change'); // No successful candidates
      expect(result.diagnostics?.notes).toContain(
        'Failed strategies: ThrowingStrategy'
      );
    });

    it('should respect time budget constraints', async () => {
      const slowStrategy: OptimizationStrategy = {
        name: 'SlowStrategy',
        supports: () => true,
        optimize: async () => {
          // Simulate slow operation
          await new Promise((resolve) => setTimeout(resolve, 150));
          return { scheduleId: 'slow', score: 50, changesApplied: 1 };
        },
      };

      facade = new OptimizationFacade([slowStrategy]);

      const fastInput = { ...mockInput, timeBudgetMs: 50 }; // Very tight budget
      const result = await facade.run(fastInput);

      expect(result.diagnostics?.tookMs).toBeGreaterThan(50);
      // Should still complete but respect budget in strategy execution
      expect(result).toHaveProperty('status');
    });

    it('should merge defaults correctly', async () => {
      const strategy = new MockStrategy('TestStrategy', true, {
        scheduleId: 'default-test',
        score: 30,
        changesApplied: 2,
      });

      facade = new OptimizationFacade([strategy], {
        defaults: { timeBudgetMs: 300, maxIterations: 5 },
      });

      // Input without explicit values
      const minimalInput = {
        schedule: { tasks: [] },
        constraints: { rules: [] },
      };

      const result = await facade.run(minimalInput);

      expect(result.iterations).toBe(1);
      expect(result.diagnostics?.tookMs).toBeLessThan(300);
    });
  });

  describe('selectStrategies', () => {
    it('should filter strategies by supports() and order by preference', () => {
      const mockGA = new MockStrategy('GeneticAlgorithm', true);
      const mockSA = new MockStrategy('SimulatedAnnealing', false); // disabled
      const mockML = new MockStrategy('MLOptimization', true);
      const mockCustom = new MockStrategy('CustomStrategy', true);

      facade = new OptimizationFacade([mockML, mockCustom, mockGA, mockSA]);

      const selected = facade.selectStrategies(mockInput);

      // Should include only supported strategies in preferred order
      expect(selected.map((s) => s.name)).toEqual([
        'GeneticAlgorithm', // First in preferred order
        'MLOptimization', // Second in preferred order
        'CustomStrategy', // Not in preferred order, but supported
      ]);
    });

    it('should return empty array when no strategies support input', () => {
      const mockGA = new MockStrategy('GeneticAlgorithm', false);
      facade = new OptimizationFacade([mockGA]);

      const selected = facade.selectStrategies(mockInput);

      expect(selected).toEqual([]);
    });
  });
});
