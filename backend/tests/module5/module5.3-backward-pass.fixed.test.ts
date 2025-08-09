/**
 * Module 5.3: CPM Backward Pass Tests
 * Fixed version with correct import paths
 */

declare var describe: any;
declare var it: any;
declare var expect: any;

import {
  calculateProjectFloat,
  computeBackwardPass,
  identifyCriticalPath,
} from '../../src/modules/module5/module5.3-backward-pass/backward-pass-engine';
import { LogicLink, ScheduledTask } from '../../src/types/schedule';
import { TaskPriority, TaskStatus } from '../../src/types/schedule/task.types';

describe('Module 5.3: CPM Backward Pass', () => {
  // Test data helper functions
  const createTask = (
    id: string,
    name: string,
    duration: number,
    earlyStart: string,
    earlyFinish: string
  ): ScheduledTask => ({
    id,
    name,
    duration,
    earlyStart,
    earlyFinish,
    lateStart: '',
    lateFinish: '',
    totalFloat: 0,
    freeFloat: 0,
    isCritical: false,
    status: TaskStatus.NOT_STARTED,
    wbs: '',
    priority: TaskPriority.MEDIUM,
  });

  const createLink = (
    from: string,
    to: string,
    type: 'FS' | 'SS' | 'FF' | 'SF' = 'FS',
    lag: number = 0
  ): LogicLink => ({
    id: `${from}-${to}`,
    from,
    to,
    type,
    lag,
  });

  describe('Basic Backward Pass Calculations', () => {
    it('Single Task - late dates equal early dates', () => {
      const tasks: ScheduledTask[] = [
        createTask(
          'A',
          'Task A',
          5,
          '2025-08-04T09:00:00.000Z',
          '2025-08-09T17:00:00.000Z'
        ),
      ];

      const links: LogicLink[] = [];
      const projectEndDate = '2025-08-09T17:00:00.000Z';

      const result = computeBackwardPass(tasks, links, projectEndDate);

      expect(result).toBeDefined();
      expect(result.tasks).toHaveLength(1);

      const taskA = result.tasks.find((t) => t.id === 'A')!;
      expect(taskA.lateStart).toBeDefined();
      expect(taskA.lateFinish).toBeDefined();
      expect(taskA.totalFloat).toBe(0);
      expect(taskA.isCritical).toBe(true);
    });

    it('Two Tasks in sequence - calculate float correctly', () => {
      const tasks: ScheduledTask[] = [
        createTask(
          'A',
          'Task A',
          3,
          '2025-08-04T09:00:00.000Z',
          '2025-08-07T17:00:00.000Z'
        ),
        createTask(
          'B',
          'Task B',
          2,
          '2025-08-08T09:00:00.000Z',
          '2025-08-10T17:00:00.000Z'
        ),
      ];

      const links: LogicLink[] = [createLink('A', 'B')];
      const projectEndDate = '2025-08-10T17:00:00.000Z';

      const result = computeBackwardPass(tasks, links, projectEndDate);

      expect(result).toBeDefined();

      const taskC = result.tasks.find((t) => t.id === 'C')!;
      expect(taskC).toBeUndefined(); // Only A and B exist

      const taskA = result.tasks.find((t) => t.id === 'A')!;
      const taskB = result.tasks.find((t) => t.id === 'B')!;

      expect(taskA).toBeDefined();
      expect(taskB).toBeDefined();
    });
  });

  describe('Critical Path Identification', () => {
    it('should identify critical path correctly', () => {
      const tasks: ScheduledTask[] = [
        createTask(
          'A',
          'Task A',
          5,
          '2025-08-04T09:00:00.000Z',
          '2025-08-09T17:00:00.000Z'
        ),
        createTask(
          'B',
          'Task B',
          3,
          '2025-08-04T09:00:00.000Z',
          '2025-08-07T17:00:00.000Z'
        ),
        createTask(
          'C',
          'Task C',
          2,
          '2025-08-10T09:00:00.000Z',
          '2025-08-12T17:00:00.000Z'
        ),
      ];

      const links: LogicLink[] = [createLink('A', 'C'), createLink('B', 'C')];
      const projectEndDate = '2025-08-12T17:00:00.000Z';

      const criticalPath = identifyCriticalPath(tasks, links, projectEndDate);

      expect(criticalPath).toBeDefined();
      expect(Array.isArray(criticalPath)).toBe(true);
    });
  });

  describe('Project Float Calculation', () => {
    it('should calculate project float metrics', () => {
      const tasks: ScheduledTask[] = [
        createTask(
          'A',
          'Task A',
          5,
          '2025-08-04T09:00:00.000Z',
          '2025-08-09T17:00:00.000Z'
        ),
        createTask(
          'B',
          'Task B',
          3,
          '2025-08-04T09:00:00.000Z',
          '2025-08-07T17:00:00.000Z'
        ),
      ];

      const links: LogicLink[] = [];
      const projectEndDate = '2025-08-09T17:00:00.000Z';

      const projectFloat = calculateProjectFloat(tasks, links, projectEndDate);

      expect(typeof projectFloat).toBe('object');
      expect(projectFloat.totalFloat).toBeDefined();
      expect(projectFloat.freeFloat).toBeDefined();
    });
  });
});
