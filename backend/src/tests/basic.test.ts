/**
 * Module 5.1 Basic Test
 * AI Scheduler - Module 5.1: Core functionality test
 */

import { Task } from '../models/schedule/task.model';
import { TaskPriority } from '../types/scheduleTypes';

describe('Module 5.1 Basic Tests', () => {
  describe('Task Model', () => {
    it('should create a task', () => {
      const taskData = {
        id: 'TEST-1',
        name: 'Test Task',
        duration: 5,
        wbs: '1.1',
        priority: TaskPriority.HIGH,
        resourceIds: ['RES-1'],
      };

      const task = new Task(taskData);
      const data = task.getData();

      expect(data.id).toBe('TEST-1');
      expect(data.name).toBe('Test Task');
      expect(task.getDuration()).toBe(5);
      expect(task.getWBSLevel()).toBe(2);
    });

    it('should validate task data', () => {
      const validTask = {
        id: 'VALID-1',
        name: 'Valid Task',
        duration: 3,
      };

      const task = new Task(validTask);
      const results = task.validate();

      expect(results).toEqual([]);
    });

    it('should detect invalid task data', () => {
      const invalidTask = {
        id: '',
        name: 'Invalid Task',
        duration: 5,
      };

      const task = new Task(invalidTask);
      const results = task.validate();

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].field).toBe('id');
      expect(results[0].isValid).toBe(false);
    });

    it('should calculate WBS levels correctly', () => {
      const testCases = [
        { wbs: '1', expected: 1 },
        { wbs: '1.1', expected: 2 },
        { wbs: '1.2.3', expected: 3 },
        { wbs: '1.2.3.4', expected: 4 },
      ];

      testCases.forEach(({ wbs, expected }) => {
        const task = new Task({
          id: `TEST-${wbs}`,
          name: 'Test Task',
          duration: 1,
          wbs,
        });

        expect(task.getWBSLevel()).toBe(expected);
      });
    });

    it('should identify predecessors correctly', () => {
      const taskWithPreds = new Task({
        id: 'TASK-A',
        name: 'Task A',
        duration: 3,
        predecessors: ['TASK-B', 'TASK-C'],
      });

      expect(taskWithPreds.hasPredecessors()).toBe(true);
      expect(taskWithPreds.getData().predecessors).toEqual([
        'TASK-B',
        'TASK-C',
      ]);
    });

    it('should handle tasks without predecessors', () => {
      const taskNoPreds = new Task({
        id: 'TASK-START',
        name: 'Start Task',
        duration: 2,
      });

      expect(taskNoPreds.hasPredecessors()).toBe(false);
      expect(taskNoPreds.getData().predecessors).toBeUndefined();
    });
  });
});
