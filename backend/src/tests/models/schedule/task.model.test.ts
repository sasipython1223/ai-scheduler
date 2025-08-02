/**
 * Task Model Unit Tests
 * AI Scheduler - Module 5.1: Task Model Tests
 */

import {
  createTask,
  Task,
  validateTask,
} from '../../../models/schedule/task.model';
import { TaskInput } from '../../../types/scheduleTypes';
import {
  createTestTask,
  invalidTaskData,
  mockTasks,
} from '../../fixtures/mockScheduleProject';

describe('Task Model', () => {
  describe('Task class', () => {
    let validTask: Task;

    beforeEach(() => {
      validTask = new Task(mockTasks[1]); // Requirements Analysis task
    });

    it('should create task with valid input', () => {
      const data = validTask.getData();
      expect(data.id).toBe('B');
      expect(data.name).toBe('Requirements Analysis');
      expect(validTask.getDuration()).toBe(5);
      expect(data.wbs).toBe('1.1');
    });

    it('should validate required fields correctly', () => {
      const validationResults = validTask.validate();
      expect(validationResults).toEqual([]);
    });

    it('should detect predecessors correctly', () => {
      expect(validTask.hasPredecessors()).toBe(true);
      const data = validTask.getData();
      expect(data.predecessors).toEqual(['A']);
    });

    it('should calculate WBS level correctly', () => {
      expect(validTask.getWBSLevel()).toBe(2); // 1.1 is level 2
    });

    it('should check if task is milestone', () => {
      const milestone = new Task(mockTasks[0]); // Project Start (duration 0)
      expect(milestone.isMilestone()).toBe(true);
      expect(validTask.isMilestone()).toBe(false);
    });

    it('should get task priority', () => {
      expect(validTask.getPriority()).toBe('HIGH');
    });

    it('should get task resources', () => {
      const resources = validTask.getResources();
      expect(resources).toEqual(['BA001', 'PM001']);
    });

    it('should check if task is summary task', () => {
      expect(validTask.isSummaryTask()).toBe(true); // Has WBS
    });

    it('should update task data', () => {
      validTask.update({ duration: 10 });
      expect(validTask.getDuration()).toBe(10);
    });
  });

  describe('validateTask function', () => {
    it('should accept valid task input', () => {
      const results = validateTask(mockTasks[1]);
      expect(results).toEqual([]);
    });

    it('should reject task with missing ID', () => {
      const results = validateTask(invalidTaskData.missingId as TaskInput);
      expect(results).toContainEqual(
        expect.objectContaining({
          field: 'id',
          isValid: false,
          message: 'Task ID is required',
        })
      );
    });

    it('should reject task with missing name', () => {
      const results = validateTask(invalidTaskData.missingName as TaskInput);
      expect(results).toContainEqual(
        expect.objectContaining({
          field: 'name',
          isValid: false,
          message: 'Task name is required',
        })
      );
    });

    it('should reject task with negative or zero duration', () => {
      const results = validateTask(
        invalidTaskData.negativeDuration as TaskInput
      );
      expect(results).toContainEqual(
        expect.objectContaining({
          field: 'duration',
          isValid: false,
          message: 'Duration must be greater than 0',
        })
      );
    });

    it('should validate date formats', () => {
      const invalidDate = createTestTask({
        start: 'invalid-date',
        finish: '2025-13-45', // Invalid date
      });
      const results = validateTask(invalidDate);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.field === 'start')).toBe(true);
      expect(results.some((r) => r.field === 'finish')).toBe(true);
    });

    it('should accept valid ISO date strings', () => {
      const validDate = createTestTask({
        start: '2025-08-01T09:00:00.000Z',
        finish: '2025-08-05T17:00:00.000Z',
      });
      const results = validateTask(validDate);
      expect(
        results.filter((r) => r.field === 'start' || r.field === 'finish')
      ).toEqual([]);
    });
  });

  describe('createTask function', () => {
    it('should create task with minimal data', () => {
      const minimalInput = {
        id: 'MIN-1',
        name: 'Minimal Task',
        duration: 3,
      };

      const task = createTask(minimalInput);
      const data = task.getData();
      expect(data.id).toBe('MIN-1');
      expect(data.name).toBe('Minimal Task');
      expect(task.getDuration()).toBe(3);
      expect(task.hasPredecessors()).toBe(false);
      expect(data.wbs).toBeUndefined();
    });

    it('should preserve all provided values', () => {
      const fullTask = createTask(mockTasks[2]); // System Design
      const data = fullTask.getData();
      expect(data.id).toBe('C');
      expect(data.name).toBe('System Design');
      expect(fullTask.getDuration()).toBe(8);
      expect(data.predecessors).toEqual(['B']);
      expect(data.wbs).toBe('1.2');
    });

    it('should validate input during creation', () => {
      expect(() =>
        createTask(invalidTaskData.missingId as TaskInput)
      ).toThrow(); // Should throw because validation fails
    });
  });

  describe('Edge cases', () => {
    it('should handle very long task names', () => {
      const longName = 'A'.repeat(1000);
      const task = createTestTask({ name: longName });
      const results = validateTask(task);
      expect(results.filter((r) => r.field === 'name')).toEqual([]);
    });

    it('should handle very large durations', () => {
      const task = createTestTask({ duration: 999999 });
      const results = validateTask(task);
      expect(results.filter((r) => r.field === 'duration')).toEqual([]);
    });

    it('should handle many predecessors', () => {
      const manyPreds = Array.from({ length: 100 }, (_, i) => `PRED-${i}`);
      const task = createTestTask({ predecessors: manyPreds });
      const results = validateTask(task);
      expect(results.filter((r) => r.field === 'predecessors')).toEqual([]);
    });

    it('should handle special characters in names', () => {
      const specialName = 'Task with émojis 🚀 and symbols @#$%';
      const task = createTestTask({ name: specialName });
      const results = validateTask(task);
      expect(results.filter((r) => r.field === 'name')).toEqual([]);
    });

    it('should handle deep WBS levels', () => {
      const deepWBS = '1.2.3.4.5.6.7.8.9.10';
      const task = createTestTask({ wbs: deepWBS });
      const results = validateTask(task);
      expect(results.filter((r) => r.field === 'wbs')).toEqual([]);
      const taskObj = createTask(task);
      expect(taskObj.getWBSLevel()).toBe(10);
    });

    it('should handle no WBS code', () => {
      const task = createTestTask({ wbs: undefined });
      const taskObj = createTask(task);
      expect(taskObj.getWBSLevel()).toBe(0);
      expect(taskObj.isSummaryTask()).toBe(false);
    });

    it('should handle default priority', () => {
      const task = createTestTask({ priority: undefined });
      const taskObj = createTask(task);
      expect(taskObj.getPriority()).toBe('MEDIUM');
    });

    it('should handle no resources', () => {
      const task = createTestTask({ resourceIds: undefined });
      const taskObj = createTask(task);
      expect(taskObj.getResources()).toEqual([]);
    });
  });
});
