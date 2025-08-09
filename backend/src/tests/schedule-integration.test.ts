/**
 * Schedule Integration Test - Modules 5.1 → 5.4
 * Purpose: End-to-end integration testing across all completed modules
 *
 * Tests the complete data flow:
 * 1. Module 5.1: Data structures and types
 * 2. Module 5.2: Forward Pass (early dates)
 * 3. Module 5.3: Backward Pass (late dates)
 * 4. Module 5.4: Float calculation and critical path analysis
 */

import { beforeEach, describe, expect, it } from '@jest/globals';

// Module 5.2: Forward Pass
import { computeForwardPass } from '../services/cpm-forward-pass-refactored';
import type { ForwardPassResult } from '../services/cpm-forward-pass.utils';

// Module 5.3: Backward Pass
import type { BackwardPassResult } from '../services/cpm-backward-pass.utils';
import { computeBackwardPass } from '../services/cpm-backward-pass.utils';

// Module 5.4: Float and Critical Path Analysis
import { CriticalPathAnalyzer } from '../services/module5.4/CriticalPathAnalyzer';
import { FloatCalculator } from '../services/module5.4/FloatCalculator';
import { Module54Service } from '../services/module5.4/Module54Service';

// Core types from Module 5.1
import type { LogicLink, ScheduledTask, TaskInput } from '../types/schedule';

// Helper function to find tasks by ID with proper typing
function findTaskById(tasks: ScheduledTask[], id: string): ScheduledTask {
  const task = tasks.find((t: ScheduledTask) => t.id === id);
  if (!task) {
    throw new Error(`Task with ID ${id} not found`);
  }
  return task;
}

/**
 * Sample project data for integration testing
 * Represents a realistic construction project with parallel paths
 */
const sampleTasks: TaskInput[] = [
  {
    id: 'A',
    name: 'Project Setup',
    duration: 2,
    wbs: '1.0',
  },
  {
    id: 'B',
    name: 'Foundation Work',
    duration: 5,
    wbs: '2.1',
  },
  {
    id: 'C',
    name: 'Electrical Planning',
    duration: 3,
    wbs: '2.2',
  },
  {
    id: 'D',
    name: 'Frame Construction',
    duration: 8,
    wbs: '3.1',
  },
  {
    id: 'E',
    name: 'Electrical Installation',
    duration: 4,
    wbs: '3.2',
  },
  {
    id: 'F',
    name: 'Final Inspection',
    duration: 1,
    wbs: '4.0',
  },
];

const sampleLogicLinks: LogicLink[] = [
  { id: 'L1', from: 'A', to: 'B', type: 'FS', lag: 0 },
  { id: 'L2', from: 'A', to: 'C', type: 'FS', lag: 0 },
  { id: 'L3', from: 'B', to: 'D', type: 'FS', lag: 1 },
  { id: 'L4', from: 'C', to: 'E', type: 'FS', lag: 0 },
  { id: 'L5', from: 'D', to: 'F', type: 'FS', lag: 0 },
  { id: 'L6', from: 'E', to: 'F', type: 'FS', lag: 0 },
];

describe('🔗 Schedule Integration Test: Modules 5.1 → 5.4', () => {
  let forwardResult: ForwardPassResult;
  let backwardResult: BackwardPassResult;
  let _module54Service: Module54Service; // Prefix with _ to indicate intentionally unused
  let floatCalculator: FloatCalculator;
  let criticalPathAnalyzer: CriticalPathAnalyzer;

  beforeEach(() => {
    _module54Service = new Module54Service({
      epsilon: 0.001,
      enableMultipleCriticalPaths: true,
      enableDetailedValidation: true,
    });
    floatCalculator = new FloatCalculator();
    criticalPathAnalyzer = new CriticalPathAnalyzer();
  });

  describe('📊 Module 5.2: Forward Pass Integration', () => {
    it('should calculate early dates for all tasks', () => {
      const forwardTasks = computeForwardPass(
        sampleTasks,
        sampleLogicLinks,
        '2025-08-07T08:00:00.000Z'
      );

      forwardResult = {
        tasks: forwardTasks,
        projectStartDate: '2025-08-07T08:00:00.000Z',
        projectEndDate: forwardTasks.reduce(
          (latest: string, task: ScheduledTask) => {
            return new Date(task.earlyFinish) > new Date(latest)
              ? task.earlyFinish
              : latest;
          },
          forwardTasks[0].earlyFinish
        ),
      };

      // Verify all tasks have early dates
      expect(forwardResult.tasks).toHaveLength(6);
      forwardResult.tasks.forEach((task: ScheduledTask) => {
        expect(task.earlyStart).toBeDefined();
        expect(task.earlyFinish).toBeDefined();
        expect(new Date(task.earlyStart)).toBeInstanceOf(Date);
        expect(new Date(task.earlyFinish)).toBeInstanceOf(Date);
      });

      // Verify dependency logic: B should start after A finishes
      const taskA = findTaskById(forwardResult.tasks, 'A');
      const taskB = findTaskById(forwardResult.tasks, 'B');
      expect(new Date(taskB.earlyStart).getTime()).toBeGreaterThanOrEqual(
        new Date(taskA.earlyFinish).getTime()
      );
    });
  });

  describe('📉 Module 5.3: Backward Pass Integration', () => {
    it('should calculate late dates based on forward pass results', () => {
      // First run forward pass
      const forwardTasks = computeForwardPass(
        sampleTasks,
        sampleLogicLinks,
        '2025-08-07T08:00:00.000Z'
      );

      forwardResult = {
        tasks: forwardTasks,
        projectStartDate: '2025-08-07T08:00:00.000Z',
        projectEndDate: forwardTasks.reduce(
          (latest: string, task: ScheduledTask) => {
            return new Date(task.earlyFinish) > new Date(latest)
              ? task.earlyFinish
              : latest;
          },
          forwardTasks[0].earlyFinish
        ),
      };

      // Run backward pass
      backwardResult = computeBackwardPass(
        forwardResult.tasks,
        sampleLogicLinks,
        forwardResult.projectEndDate
      );

      // Verify all tasks have late dates
      expect(backwardResult.tasks).toHaveLength(6);
      backwardResult.tasks.forEach((task: ScheduledTask) => {
        expect(task.lateStart).toBeDefined();
        expect(task.lateFinish).toBeDefined();
        expect(task.totalFloat).toBeGreaterThanOrEqual(0);
      });

      // Verify critical path identification
      expect(backwardResult.criticalPath).toBeDefined();
      expect(backwardResult.criticalPath.length).toBeGreaterThan(0);
    });
  });

  describe('🎯 Module 5.4: Float and Critical Path Integration', () => {
    it('should calculate individual task float values', () => {
      // Run full forward and backward passes
      const forwardTasks = computeForwardPass(
        sampleTasks,
        sampleLogicLinks,
        '2025-08-07T08:00:00.000Z'
      );

      forwardResult = {
        tasks: forwardTasks,
        projectStartDate: '2025-08-07T08:00:00.000Z',
        projectEndDate: forwardTasks.reduce(
          (latest: string, task: ScheduledTask) => {
            return new Date(task.earlyFinish) > new Date(latest)
              ? task.earlyFinish
              : latest;
          },
          forwardTasks[0].earlyFinish
        ),
      };

      backwardResult = computeBackwardPass(
        forwardResult.tasks,
        sampleLogicLinks,
        forwardResult.projectEndDate
      );

      // Test individual float calculations using Module 5.4
      const testTask = backwardResult.tasks[0];
      const totalFloat = floatCalculator.calculateTotalFloat({
        id: testTask.id,
        name: testTask.name || '',
        duration: testTask.duration,
        earlyStart: new Date(testTask.earlyStart),
        lateStart: new Date(testTask.lateStart),
        earlyFinish: new Date(testTask.earlyFinish),
        lateFinish: new Date(testTask.lateFinish),
      });

      expect(totalFloat).toBeDefined();
      expect(typeof totalFloat).toBe('number');
      // Note: Float can be negative if project is behind schedule
    });

    it('should analyze critical paths', () => {
      // Run full pipeline first
      const forwardTasks = computeForwardPass(
        sampleTasks,
        sampleLogicLinks,
        '2025-08-07T08:00:00.000Z'
      );

      backwardResult = computeBackwardPass(
        forwardTasks,
        sampleLogicLinks,
        forwardTasks.reduce((latest: string, task: ScheduledTask) => {
          return new Date(task.earlyFinish) > new Date(latest)
            ? task.earlyFinish
            : latest;
        }, forwardTasks[0].earlyFinish)
      );

      // Convert to format expected by critical path analyzer
      const enhancedTasks = backwardResult.tasks.map((task: ScheduledTask) => ({
        id: task.id,
        name: task.name || '',
        duration: task.duration,
        totalFloat: task.totalFloat || 0,
        earlyStart: task.earlyStart,
        earlyFinish: task.earlyFinish,
        lateStart: task.lateStart,
        lateFinish: task.lateFinish,
      }));

      const criticalAnalysis =
        criticalPathAnalyzer.generateCriticalPathAnalysis(
          enhancedTasks,
          sampleLogicLinks.map((link) => ({
            id: link.id || `${link.from}-${link.to}`,
            from: link.from,
            to: link.to,
            type: link.type,
            lag: link.lag || 0,
          }))
        );

      expect(criticalAnalysis).toBeDefined();
      expect(criticalAnalysis.longestPath).toBeDefined();
    });
  });

  describe('🔄 End-to-End Integration Workflow', () => {
    it('should execute complete scheduling pipeline with data consistency', () => {
      // Step 1: Forward Pass (Module 5.2)
      const forwardTasks = computeForwardPass(
        sampleTasks,
        sampleLogicLinks,
        '2025-08-07T08:00:00.000Z'
      );

      // Step 2: Backward Pass (Module 5.3)
      const projectEndDate = forwardTasks.reduce(
        (latest: string, task: ScheduledTask) => {
          return new Date(task.earlyFinish) > new Date(latest)
            ? task.earlyFinish
            : latest;
        },
        forwardTasks[0].earlyFinish
      );

      const backwardTasks = computeBackwardPass(
        forwardTasks,
        sampleLogicLinks,
        projectEndDate
      );

      // Step 3: Individual Float Analysis (Module 5.4)
      const firstTask = backwardTasks.tasks[0];
      const totalFloat = floatCalculator.calculateTotalFloat({
        id: firstTask.id,
        name: firstTask.name || '',
        duration: firstTask.duration,
        earlyStart: new Date(firstTask.earlyStart),
        lateStart: new Date(firstTask.lateStart),
        earlyFinish: new Date(firstTask.earlyFinish),
        lateFinish: new Date(firstTask.lateFinish),
      });

      // Comprehensive validation
      expect(backwardTasks.tasks.length).toBe(sampleTasks.length);
      expect(totalFloat).toBeDefined();
      expect(typeof totalFloat).toBe('number');

      // Data integrity checks - all float values should be consistent
      backwardTasks.tasks.forEach((task: ScheduledTask) => {
        expect(task.totalFloat).toBeDefined();
        expect(typeof task.totalFloat).toBe('number');
      });

      console.log('✅ Integration Test Summary:');
      console.log(`   📊 Tasks processed: ${backwardTasks.tasks.length}`);
      console.log(
        `   🎯 Critical path length: ${backwardTasks.criticalPath.length}`
      );
      console.log(`   📈 Sample total float: ${totalFloat.toFixed(2)} days`);
    });
  });

  describe('🧪 Error Handling and Edge Cases', () => {
    it('should handle empty task lists gracefully', () => {
      const emptyTasks: TaskInput[] = [];
      const emptyLinks: LogicLink[] = [];

      const forwardResult = computeForwardPass(
        emptyTasks,
        emptyLinks,
        '2025-08-07T08:00:00.000Z'
      );
      expect(forwardResult).toHaveLength(0);
    });

    it('should validate task date consistency', () => {
      const forwardTasks = computeForwardPass(
        sampleTasks,
        sampleLogicLinks,
        '2025-08-07T08:00:00.000Z'
      );

      // Verify early start ≤ early finish for all tasks
      forwardTasks.forEach((task: ScheduledTask) => {
        expect(new Date(task.earlyStart).getTime()).toBeLessThanOrEqual(
          new Date(task.earlyFinish).getTime()
        );
      });
    });
  });
});
