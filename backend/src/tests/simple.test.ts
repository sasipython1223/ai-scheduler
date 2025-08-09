/**
 * Simple Module 5.1 Test
 * AI Scheduler - Module 5.1: Basic functionality test
 */

import { LogicLinkModel } from '../models/schedule/logicLink.model';
import { Task } from '../models/schedule/task.model';
import { WorkingDaysCalculator } from '../models/schedule/workingDays.util';
import { LogicType, TaskPriority } from '../types/scheduleTypes';

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
  });

  describe('Logic Link Model', () => {
    it('should create a logic link', () => {
      const linkData = {
        id: 'LINK-1',
        from: 'A',
        to: 'B',
        type: 'FS' as LogicType,
        lag: 0,
      };

      const link = new LogicLinkModel(linkData);
      const data = link.getData();

      expect(data.id).toBe('LINK-1');
      expect(data.from).toBe('A');
      expect(data.to).toBe('B');
      expect(link.getLinkType()).toBe('FS');
    });

    it('should identify link types correctly', () => {
      const fsLink = new LogicLinkModel({
        id: 'FS-1',
        from: 'A',
        to: 'B',
        type: 'FS' as LogicType,
        lag: 0,
      });

      expect(fsLink.isFinishToStart()).toBe(true);
      expect(fsLink.isStartToStart()).toBe(false);
    });
  });

  describe('Working Days Calculator', () => {
    it('should identify working days', () => {
      const calculator = new WorkingDaysCalculator();

      expect(calculator.isWorkingDay(new Date('2025-08-04'))).toBe(true); // Monday
      expect(calculator.isWorkingDay(new Date('2025-08-02'))).toBe(false); // Saturday
    });

    it('should calculate working days between dates', () => {
      const calculator = new WorkingDaysCalculator();

      const workingDays = calculator.calculateWorkingDays(
        '2025-08-04T09:00:00.000Z', // Monday
        '2025-08-08T17:00:00.000Z' // Friday
      );

      expect(workingDays).toBe(5);
    });
  });
});
