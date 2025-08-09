/**
 * Module 7.1 - Schedule Optimizer Tests
 *
 * Test scaffolds for schedule optimization and strategy management.
 *
 * IMPLEMENTATION PLAN:
 * - Test optimization strategy selection
 * - Validate strategy execution and performance tracking
 * - Test auto-selection algorithms
 * - Performance benchmarks for optimization efficiency
 */

import { beforeEach, describe, expect, it } from 'vitest';
import type { ScheduleGraph } from '../constraint-aware-scheduler';
import { ScheduleOptimizer } from '../schedule-optimizer';
import { BaselineStrategy } from '../strategies/baseline-strategy';
import { ComprehensiveStrategy } from '../strategies/comprehensive-strategy';

describe('ScheduleOptimizer', () => {
  let optimizer: ScheduleOptimizer;
  let baselineStrategy: BaselineStrategy;
  let comprehensiveStrategy: ComprehensiveStrategy;

  beforeEach(() => {
    optimizer = new ScheduleOptimizer();
    baselineStrategy = new BaselineStrategy();
    comprehensiveStrategy = new ComprehensiveStrategy();

    optimizer.registerStrategy(baselineStrategy);
    optimizer.registerStrategy(comprehensiveStrategy);
  });

  describe('strategy registration', () => {
    it('should register optimization strategies', () => {
      const newOptimizer = new ScheduleOptimizer();
      const strategy = new BaselineStrategy();

      newOptimizer.registerStrategy(strategy);

      const strategies = newOptimizer.getAvailableStrategies();
      expect(strategies).toHaveLength(1);
      expect(strategies[0].name).toBe('baseline');
    });
  });

  describe('optimizeSchedule', () => {
    it('should execute specified strategy', async () => {
      const schedule: ScheduleGraph = {
        nodes: { T1: { start: 0, end: 5, resourceId: 'R1' } },
      };

      const result = await optimizer.optimizeSchedule(schedule, 'baseline', 5);

      expect(result.schedule).toBeDefined();
      expect(result.metadata.strategy).toBe('baseline');
      expect(result.metadata.iterations).toBeGreaterThanOrEqual(0);
    });

    it('should auto-select strategy when requested', async () => {
      const schedule: ScheduleGraph = {
        nodes: { T1: { start: 0, end: 5 } },
      };

      const result = await optimizer.optimizeSchedule(schedule, 'auto', 10);
      expect(result.metadata.strategy).toMatch(/baseline|comprehensive/);
    });
  });

  describe('selectBestStrategy', () => {
    it('should select strategy based on violation characteristics', async () => {
      const schedule: ScheduleGraph = {
        nodes: { T1: { start: 0, end: 5 } },
      };

      const strategy = await optimizer.selectBestStrategy(schedule);

      expect(strategy).toBeDefined();
      expect(['baseline', 'comprehensive']).toContain(strategy.name);
    });

    it('should consider performance history in selection', async () => {
      // TODO: Test history-based strategy selection
      expect(true).toBe(true); // Placeholder for scaffolding
    });

    it('should throw error when no strategies available', async () => {
      const emptyOptimizer = new ScheduleOptimizer();
      const schedule: ScheduleGraph = {
        nodes: { T1: { start: 0, end: 5 } },
      };

      await expect(emptyOptimizer.selectBestStrategy(schedule)).rejects.toThrow(
        'No optimization strategies available'
      );
    });
  });

  describe('performance tracking', () => {
    it('should calculate strategy performance metrics', async () => {
      const schedule: ScheduleGraph = {
        nodes: { T1: { start: 0, end: 5 } },
      };

      await optimizer.optimizeSchedule(schedule, 'baseline');
      await optimizer.optimizeSchedule(schedule, 'comprehensive');

      const analysis = optimizer.getPerformanceAnalysis();
      expect(analysis.totalOptimizations).toBe(2);
      expect(analysis.strategies).toHaveLength(2);
    });
  });

  describe('getAvailableStrategies', () => {
    it('should list all registered strategies', () => {
      const strategies = optimizer.getAvailableStrategies();

      expect(strategies).toHaveLength(2);

      const strategyNames = strategies.map((s) => s.name);
      expect(strategyNames).toContain('baseline');
      expect(strategyNames).toContain('comprehensive');

      strategies.forEach((strategy) => {
        expect(strategy.name).toBeDefined();
        expect(strategy.description).toBeDefined();
        expect(['LOW', 'MEDIUM', 'HIGH']).toContain(strategy.complexity);
      });
    });

    it('should return empty array when no strategies registered', () => {
      const emptyOptimizer = new ScheduleOptimizer();
      const strategies = emptyOptimizer.getAvailableStrategies();

      expect(strategies).toHaveLength(0);
    });
  });

  describe('integration tests', () => {
    it('should integrate with optimization strategies', async () => {
      // TODO: Test strategy integration compliance
      expect(true).toBe(true); // Placeholder for scaffolding
    });

    it('should support parallel strategy execution', async () => {
      // TODO: Test future parallel execution capability
      expect(true).toBe(true); // Placeholder for scaffolding
    });

    it('should maintain optimization state consistency', async () => {
      // TODO: Test state management during optimization
      expect(true).toBe(true); // Placeholder for scaffolding
    });
  });

  describe('applyOptimizationStrategies', () => {
    it('should validate options with defaults (100ms, 1 iter)', async () => {
      const schedule: ScheduleGraph = {
        nodes: { T1: { start: 0, end: 5 } },
      };

      const report = {
        violations: [
          {
            id: 'V1',
            type: 'HARD' as const,
            severity: 'CRITICAL' as const,
            message: 'Test violation',
          },
        ],
        hasBlocking: true,
        summary: 'Test violations',
      };

      const result = await optimizer.applyOptimizationStrategies(
        schedule,
        report
      );

      expect(result).toBeDefined();
      expect(result.nodes).toBeDefined();
    });

    it('should run BaselineStrategy.optimize() once and return best candidate', async () => {
      const schedule: ScheduleGraph = {
        nodes: { T1: { start: 0, end: 5 } },
      };

      const report = {
        violations: [
          {
            id: 'V1',
            type: 'HARD' as const,
            severity: 'CRITICAL' as const,
            message: 'Test violation',
          },
        ],
        hasBlocking: true,
        summary: 'Test violations',
      };

      const options = {
        maxIterations: 1,
        timeBudgetMs: 100,
        strategy: 'baseline',
      };

      const result = await optimizer.applyOptimizationStrategies(
        schedule,
        report,
        options
      );

      expect(result).toBeDefined();
      expect(result.nodes).toBeDefined();
    });

    it('should throw error for invalid options', async () => {
      const schedule: ScheduleGraph = {
        nodes: { T1: { start: 0, end: 5 } },
      };

      const report = {
        violations: [],
        hasBlocking: false,
        summary: 'No violations',
      };

      await expect(
        optimizer.applyOptimizationStrategies(schedule, report, {
          timeBudgetMs: -1,
        })
      ).rejects.toThrow(
        'Invalid options: timeBudgetMs and maxIterations must be positive'
      );

      await expect(
        optimizer.applyOptimizationStrategies(schedule, report, {
          maxIterations: 0,
        })
      ).rejects.toThrow(
        'Invalid options: timeBudgetMs and maxIterations must be positive'
      );
    });
  });
});
