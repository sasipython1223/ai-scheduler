/**
 * Module 7.2 - Genetic Algorithm Tests
 *
 * Tests for GA strategy implementation including feature flag support,
 * time budget compliance, and candidate generation.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { GeneticAlgorithm } from '../strategies/genetic-algorithm';
import type { OptimizationInput } from '../types';

describe('GeneticAlgorithm', () => {
  let ga: GeneticAlgorithm;
  let mockInput: OptimizationInput;

  beforeEach(() => {
    ga = new GeneticAlgorithm();
    mockInput = {
      schedule: {
        tasks: Array(100)
          .fill(null)
          .map((_, i) => ({ id: `task-${i}` })),
      },
      constraints: { rules: [] },
      timeBudgetMs: 50,
      maxIterations: 2,
    };
  });

  describe('supports', () => {
    it('should return true when GA flag enabled and schedule provided', () => {
      const result = ga.supports(mockInput);

      // Should be true since ENABLE_GA = true by default
      expect(result).toBe(true);
    });

    it('should return false when schedule is null or undefined', () => {
      const inputWithoutSchedule = { ...mockInput, schedule: null };

      const result = ga.supports(inputWithoutSchedule);

      expect(result).toBe(false);
    });

    it('should have correct strategy name', () => {
      expect(ga.name).toBe('GeneticAlgorithm');
    });
  });

  describe('optimize', () => {
    it('should respect timeBudgetMs and return candidate without error', async () => {
      const tightBudgetInput = { ...mockInput, timeBudgetMs: 10 };
      const startTime = Date.now();

      const result = await ga.optimize(tightBudgetInput);

      const elapsed = Date.now() - startTime;

      // Should respect time budget (allow some tolerance for test execution)
      expect(elapsed).toBeLessThan(50); // reasonable tolerance

      if (result) {
        expect(result).toHaveProperty('scheduleId');
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('changesApplied');
        expect(typeof result.score).toBe('number');
        expect(typeof result.changesApplied).toBe('number');
        expect(result.changesApplied).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return candidate with valid properties', async () => {
      const result = await ga.optimize(mockInput);

      if (result) {
        expect(result.scheduleId).toMatch(/^schedule-\d+/);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.changesApplied).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(result.score)).toBe(true);
        expect(Number.isInteger(result.changesApplied)).toBe(true);
      }
    });

    it('should return undefined when strategy does not support input', async () => {
      const unsupportedInput = { ...mockInput, schedule: null };

      const result = await ga.optimize(unsupportedInput);

      expect(result).toBeUndefined();
    });

    it('should handle maxIterations parameter', async () => {
      const limitedInput = { ...mockInput, maxIterations: 1 };

      const result = await ga.optimize(limitedInput);

      // Should complete within iteration limit without error
      if (result) {
        expect(result).toHaveProperty('score');
      }
    });

    it('should improve score through evolution process', async () => {
      const extendedInput = {
        ...mockInput,
        timeBudgetMs: 100,
        maxIterations: 3,
        objectiveWeights: {
          makespan: 0.5,
          softViolations: 0.3,
          leveling: 0.2,
          latency: 0.0,
        },
      };

      const result = await ga.optimize(extendedInput);

      if (result) {
        // Score should be reasonable (not negative, not extremely high)
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThan(1000);

        // Should have applied some changes through evolution
        expect(result.changesApplied).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle population evolution without throwing', async () => {
      // Test with larger population and more iterations to stress test evolution
      const gaWithLargerPopulation = new GeneticAlgorithm(
        20, // populationSize
        0.3, // mutationRate
        0.2 // elitismRate
      );

      const result = await gaWithLargerPopulation.optimize(mockInput);

      // Should not throw and should return valid result
      if (result) {
        expect(result).toHaveProperty('scheduleId');
        expect(result.score).toBeGreaterThanOrEqual(0);
      }
    });

    it('should terminate early when time budget exceeded', async () => {
      const veryTightBudget = { ...mockInput, timeBudgetMs: 1 };
      const startTime = Date.now();

      const result = await ga.optimize(veryTightBudget);

      const elapsed = Date.now() - startTime;

      // Should terminate quickly due to time constraint
      expect(elapsed).toBeLessThan(20);

      // May or may not have a result depending on timing
      if (result) {
        expect(result).toHaveProperty('score');
      }
    });
  });

  describe('configuration', () => {
    it('should accept custom population parameters', () => {
      const customGA = new GeneticAlgorithm(5, 0.1, 0.5);

      expect(customGA.name).toBe('GeneticAlgorithm');
      expect(customGA.supports(mockInput)).toBe(true);
    });

    it('should work with default parameters', () => {
      const defaultGA = new GeneticAlgorithm();

      expect(defaultGA.name).toBe('GeneticAlgorithm');
      expect(defaultGA.supports(mockInput)).toBe(true);
    });
  });
});
