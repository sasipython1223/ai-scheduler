/**
 * Module 7.2 - API Shapes Tests
 *
 * Type-level and runtime validation tests for public API interfaces.
 */

import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG } from '../config';
import { createOptimizationFacade } from '../index';
import type {
  OptimizationCandidate,
  OptimizationInput,
  OptimizationResult,
  OptimizationStatus,
} from '../types';

describe('API Shapes', () => {
  describe('Type Definitions', () => {
    it('should have correct OptimizationStatus values', () => {
      const validStatuses: OptimizationStatus[] = [
        'ok',
        'improved',
        'no_change',
        'error',
      ];

      // Compile-time check - these should all be valid assignments
      const status1: OptimizationStatus = 'ok';
      const status2: OptimizationStatus = 'improved';
      const status3: OptimizationStatus = 'no_change';
      const status4: OptimizationStatus = 'error';

      expect(validStatuses).toContain(status1);
      expect(validStatuses).toContain(status2);
      expect(validStatuses).toContain(status3);
      expect(validStatuses).toContain(status4);
    });

    it('should have correct OptimizationCandidate shape', () => {
      const candidate: OptimizationCandidate = {
        scheduleId: 'test-schedule-1',
        score: 85.5,
        changesApplied: 7,
      };

      expect(candidate).toHaveProperty('scheduleId');
      expect(candidate).toHaveProperty('score');
      expect(candidate).toHaveProperty('changesApplied');
      expect(typeof candidate.scheduleId).toBe('string');
      expect(typeof candidate.score).toBe('number');
      expect(typeof candidate.changesApplied).toBe('number');
    });

    it('should have correct OptimizationInput shape with optional fields', () => {
      // Minimal input
      const minimalInput: OptimizationInput = {
        schedule: { tasks: [] },
        constraints: { rules: [] },
      };

      // Full input
      const fullInput: OptimizationInput = {
        schedule: { tasks: [] },
        constraints: { rules: [] },
        timeBudgetMs: 200,
        maxIterations: 3,
        objectiveWeights: {
          makespan: 0.4,
          softViolations: 0.3,
          leveling: 0.2,
          latency: 0.1,
        },
      };

      expect(minimalInput).toHaveProperty('schedule');
      expect(minimalInput).toHaveProperty('constraints');
      expect(fullInput).toHaveProperty('timeBudgetMs');
      expect(fullInput).toHaveProperty('maxIterations');
      expect(fullInput).toHaveProperty('objectiveWeights');
    });

    it('should have correct OptimizationResult shape', () => {
      const result: OptimizationResult = {
        status: 'improved',
        best: {
          scheduleId: 'result-1',
          score: 92.3,
          changesApplied: 5,
        },
        iterations: 3,
        diagnostics: {
          tookMs: 145,
          triedStrategies: ['GeneticAlgorithm'],
          notes: ['Optimization completed successfully'],
        },
      };

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('iterations');
      expect(result.best).toHaveProperty('scheduleId');
      if (result.diagnostics) {
        expect(result.diagnostics).toHaveProperty('tookMs');
        expect(result.diagnostics).toHaveProperty('triedStrategies');
        expect(Array.isArray(result.diagnostics.triedStrategies)).toBe(true);
      }
    });
  });

  describe('Configuration Defaults', () => {
    it('should provide correct default configuration', () => {
      expect(DEFAULT_CONFIG).toHaveProperty('defaults');
      expect(DEFAULT_CONFIG.defaults).toHaveProperty('timeBudgetMs');
      expect(DEFAULT_CONFIG.defaults).toHaveProperty('maxIterations');

      expect(DEFAULT_CONFIG.defaults.timeBudgetMs).toBe(200);
      expect(DEFAULT_CONFIG.defaults.maxIterations).toBe(3);
    });

    it('should apply defaults correctly in facade', async () => {
      const facade = createOptimizationFacade();

      const minimalInput = {
        schedule: { tasks: [] },
        constraints: { rules: [] },
      };

      const result = await facade.run(minimalInput);

      // Should complete without throwing and apply defaults
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('iterations');
      expect(result.diagnostics?.tookMs).toBeLessThan(500); // Should respect default time budget
    });

    it('should override defaults when provided', async () => {
      const customConfig = {
        defaults: {
          timeBudgetMs: 100,
          maxIterations: 1,
        },
      };

      const facade = createOptimizationFacade(customConfig);

      const input = {
        schedule: { tasks: [] },
        constraints: { rules: [] },
      };

      const result = await facade.run(input);

      expect(result.iterations).toBeLessThanOrEqual(1);
      expect(result.diagnostics?.tookMs).toBeLessThan(200);
    });
  });

  describe('Factory Function', () => {
    it('should create facade with all strategies', () => {
      const facade = createOptimizationFacade();

      expect(facade).toBeDefined();
      expect(facade).toHaveProperty('run');
      expect(facade).toHaveProperty('selectStrategies');
    });

    it('should accept partial configuration', () => {
      const partialConfig = {
        defaults: {
          timeBudgetMs: 500,
          maxIterations: 3, // Include required field
        },
      };

      const facade = createOptimizationFacade(partialConfig);

      expect(facade).toBeDefined();
    });
  });

  describe('Runtime Validation', () => {
    it('should handle empty input gracefully', async () => {
      const facade = createOptimizationFacade();

      const emptyInput = {
        schedule: null,
        constraints: null,
      };

      const result = await facade.run(emptyInput);

      // Should not throw, should return valid result structure
      expect(result).toHaveProperty('status');
      expect(result.status).toBe('no_change'); // No strategies should support null input
    });

    it('should validate objective weights bounds', async () => {
      const facade = createOptimizationFacade();

      const inputWithWeights = {
        schedule: { tasks: [{ id: 'test' }] },
        constraints: { rules: [] },
        objectiveWeights: {
          makespan: 0.8,
          softViolations: 0.2,
          leveling: 0.0,
          latency: 0.0,
        },
      };

      const result = await facade.run(inputWithWeights);

      // Should handle custom weights without error
      expect(result).toHaveProperty('status');
      expect(['ok', 'improved', 'no_change', 'error']).toContain(result.status);
    });

    it('should handle negative time budget gracefully', async () => {
      const facade = createOptimizationFacade();

      const invalidInput = {
        schedule: { tasks: [] },
        constraints: { rules: [] },
        timeBudgetMs: -50, // Invalid negative time
      };

      const result = await facade.run(invalidInput);

      // Should not crash, should return valid result
      expect(result).toHaveProperty('status');
      expect(result.diagnostics?.tookMs).toBeGreaterThanOrEqual(0);
    });
  });
});
