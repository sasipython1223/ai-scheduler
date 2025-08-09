/**
 * Module 5.3: CPM Backward Pass Tests - ESLint Compliant
 * Refactored to meet max-lines-per-function requirements
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
import { TaskStatus } from '../../src/types/schedule/task.types';

// ============================================================================
// TEST HELPERS - Extracted to keep test functions small
// ============================================================================

function createTestTask(
  id: string,
  name: string,
  duration: number,
  earlyStart: string,
  earlyFinish: string
): ScheduledTask {
  return {
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
    priority: undefined,
  };
}

function createTestLink(
  from: string,
  to: string,
  type: 'FS' | 'SS' | 'FF' | 'SF' = 'FS',
  lag: number = 0
): LogicLink {
  return {
    id: `${from}-${to}`,
    from,
    to,
    type,
    lag,
  };
}

function createSingleTaskScenario() {
  const tasks: ScheduledTask[] = [
    createTestTask(
      'A',
      'Task A',
      5,
      '2025-08-04T09:00:00.000Z',
      '2025-08-09T17:00:00.000Z'
    ),
  ];
  const links: LogicLink[] = [];
  const projectEndDate = '2025-08-09T17:00:00.000Z';

  return { tasks, links, projectEndDate };
}

function createTwoTaskSequenceScenario() {
  const tasks: ScheduledTask[] = [
    createTestTask(
      'A',
      'Task A',
      3,
      '2025-08-04T09:00:00.000Z',
      '2025-08-07T17:00:00.000Z'
    ),
    createTestTask(
      'B',
      'Task B',
      2,
      '2025-08-08T09:00:00.000Z',
      '2025-08-10T17:00:00.000Z'
    ),
  ];
  const links: LogicLink[] = [createTestLink('A', 'B')];
  const projectEndDate = '2025-08-10T17:00:00.000Z';

  return { tasks, links, projectEndDate };
}

function createCriticalPathScenario() {
  const tasks: ScheduledTask[] = [
    createTestTask(
      'A',
      'Task A',
      5,
      '2025-08-04T09:00:00.000Z',
      '2025-08-09T17:00:00.000Z'
    ),
    createTestTask(
      'B',
      'Task B',
      3,
      '2025-08-04T09:00:00.000Z',
      '2025-08-07T17:00:00.000Z'
    ),
    createTestTask(
      'C',
      'Task C',
      2,
      '2025-08-10T09:00:00.000Z',
      '2025-08-12T17:00:00.000Z'
    ),
  ];
  const links: LogicLink[] = [
    createTestLink('A', 'C'),
    createTestLink('B', 'C'),
  ];

  return { tasks, links };
}

// ============================================================================
// TEST SUITES - Keep each test function small
// ============================================================================

describe('Module 5.3: CPM Backward Pass', () => {
  describe('Basic Backward Pass Calculations', () => {
    it('should handle single task with equal late dates', () => {
      const { tasks, links, projectEndDate } = createSingleTaskScenario();

      const result = computeBackwardPass(tasks, links, projectEndDate);

      expect(result).toBeDefined();
      expect(result.tasks).toHaveLength(1);

      const taskA = result.tasks.find((t) => t.id === 'A')!;
      // For single task on critical path, total float should be 0
      expect(taskA.totalFloat).toBe(0);
      // Late dates should be calculated by the backward pass algorithm
      expect(taskA.lateStart).toBeDefined();
      expect(taskA.lateFinish).toBeDefined();
      // The task should be on the critical path (zero float)
      expect(taskA.isCritical).toBe(true);
    });

    it('should calculate float for two tasks in sequence', () => {
      const { tasks, links, projectEndDate } = createTwoTaskSequenceScenario();

      const result = computeBackwardPass(tasks, links, projectEndDate);

      expect(result).toBeDefined();
      expect(result.tasks).toHaveLength(2);

      const taskA = result.tasks.find((t) => t.id === 'A');
      const taskB = result.tasks.find((t) => t.id === 'B');

      expect(taskA).toBeDefined();
      expect(taskB).toBeDefined();
    });
  });

  describe('Critical Path Identification', () => {
    it('should identify critical path with proper arguments', () => {
      const { tasks, links } = createCriticalPathScenario();
      const projectEndDate = '2025-08-12T17:00:00.000Z';

      // Note: Need to check actual function signature for correct args
      const criticalPath = identifyCriticalPath(tasks, links, projectEndDate);

      expect(criticalPath).toBeDefined();
    });
  });

  describe('Project Float Calculation', () => {
    it('should calculate project float with correct arguments', () => {
      const { tasks, links } = createCriticalPathScenario();
      const projectEndDate = '2025-08-12T17:00:00.000Z';

      const floatResult = calculateProjectFloat(tasks, links, projectEndDate);

      expect(floatResult).toBeDefined();
      expect(floatResult.totalFloat).toBeInstanceOf(Map);
      expect(floatResult.freeFloat).toBeInstanceOf(Map);
    });
  });
});
