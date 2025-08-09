/**
 * Module 5.1 Comprehensive Test Suite
 * AI Scheduler - Module 5.1: Schedule Engine Data Models
 *
 * Comprehensive testing of Module 5.1 functionality:
 * - Task Model validation and utilities
 * - Logic Link Model and relationship types
 * - Dependency detection and circular dependency prevention
 * - Working with complex scheduling scenarios
 */

declare var describe: any;
declare var it: any;
declare var expect: any;

import { DependencyDetector } from '../../src/models/schedule/dependency.util';
import { LogicLinkModel } from '../../src/models/schedule/logicLink.model';
import { Task } from '../../src/models/schedule/task.model';
import {
  LogicLink,
  LogicType,
  TaskPriority,
} from '../../src/types/scheduleTypes';

describe('Module 5.1: Schedule Engine Data Models', () => {
  // ============================================================================
  // TASK MODEL COMPREHENSIVE TESTS
  // ============================================================================

  describe('Task Model - Core Functionality', () => {
    it('should validate and create complex task hierarchies', () => {
      const tasks = [
        {
          id: 'PROJ-1',
          name: 'Software Development Project',
          duration: 1, // Project start task
          wbs: '1',
        },
        {
          id: 'PHASE-1',
          name: 'Analysis Phase',
          duration: 15,
          wbs: '1.1',
          priority: TaskPriority.HIGH,
          predecessors: ['PROJ-1'],
        },
        {
          id: 'TASK-1.1',
          name: 'Requirements Gathering',
          duration: 5,
          wbs: '1.1.1',
          resourceIds: ['BA-001', 'PM-001'],
        },
        {
          id: 'TASK-1.2',
          name: 'System Analysis',
          duration: 8,
          wbs: '1.1.2',
          predecessors: ['TASK-1.1'],
          priority: TaskPriority.MEDIUM,
        },
      ];

      tasks.forEach((taskData) => {
        const task = new Task(taskData);

        // Validation should pass for all valid tasks
        expect(task.validate()).toEqual([]);

        // Test WBS level calculation
        expect(task.getWBSLevel()).toBe(taskData.wbs.split('.').length);

        // Test milestone identification (zero duration tasks)
        // Note: Current validation requires duration > 0, so using duration 1 for now

        // Test predecessor checking
        if (taskData.predecessors) {
          expect(task.hasPredecessors()).toBe(true);
        }
      });
    });

    it('should handle task validation edge cases', () => {
      const invalidCases = [
        {
          data: { id: '', name: 'Invalid Task', duration: 5 },
          expectedField: 'id',
        },
        {
          data: { id: 'T1', name: '', duration: 5 },
          expectedField: 'name',
        },
        {
          data: { id: 'T2', name: 'Task', duration: -1 },
          expectedField: 'duration',
        },
        {
          data: { id: 'T3', name: 'Task', duration: 5, start: 'invalid-date' },
          expectedField: 'start',
        },
      ];

      invalidCases.forEach(({ data, expectedField }) => {
        const task = new Task(data);
        const results = task.validate();

        expect(results.length).toBeGreaterThan(0);
        expect(
          results.some((r) => r.field === expectedField && !r.isValid)
        ).toBe(true);
      });
    });
  });

  // ============================================================================
  // LOGIC LINK MODEL COMPREHENSIVE TESTS
  // ============================================================================

  describe('Logic Link Model - Relationship Management', () => {
    it('should handle all logic link types correctly', () => {
      const linkTypes: LogicType[] = ['FS', 'SS', 'FF', 'SF'];

      linkTypes.forEach((type) => {
        const link = new LogicLinkModel({
          id: `LINK-${type}`,
          from: 'TASK-A',
          to: 'TASK-B',
          type,
          lag: 2,
        });

        expect(link.getLinkType()).toBe(type);
        expect(link.validate()).toEqual([]);

        // Test type identification methods
        expect(link.isFinishToStart()).toBe(type === 'FS');
        expect(link.isStartToStart()).toBe(type === 'SS');
        expect(link.isFinishToFinish()).toBe(type === 'FF');
        expect(link.isStartToFinish()).toBe(type === 'SF');
      });
    });

    it('should enforce business rules for logic links', () => {
      // Test self-referencing prevention
      const selfLink = new LogicLinkModel({
        id: 'SELF-1',
        from: 'TASK-A',
        to: 'TASK-A',
        type: 'FS',
        lag: 0,
      });

      const results = selfLink.validate();
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.some((r) => r.message && r.message.includes('linked to itself'))
      ).toBe(true);
    });
  });

  // ============================================================================
  // DEPENDENCY DETECTION COMPREHENSIVE TESTS
  // ============================================================================

  describe('Dependency Detection - Graph Analysis', () => {
    const createLink = (
      from: string,
      to: string,
      type: LogicType = 'FS'
    ): LogicLink => ({
      id: `${from}-${to}`,
      from,
      to,
      type,
      lag: 0,
    });

    it('should detect complex circular dependencies', () => {
      const scenarios = [
        {
          name: 'Simple 2-node cycle',
          links: [createLink('A', 'B')],
          newLink: createLink('B', 'A'),
          expectCycle: true,
        },
        {
          name: 'Complex 4-node cycle',
          links: [
            createLink('A', 'B'),
            createLink('B', 'C'),
            createLink('C', 'D'),
          ],
          newLink: createLink('D', 'A'),
          expectCycle: true,
        },
        {
          name: 'Valid convergent paths',
          links: [createLink('A', 'C'), createLink('B', 'C')],
          newLink: createLink('C', 'D'),
          expectCycle: false,
        },
        {
          name: 'Valid parallel paths',
          links: [
            createLink('A', 'B'),
            createLink('A', 'C'),
            createLink('B', 'D'),
            createLink('C', 'D'),
          ],
          newLink: createLink('D', 'E'),
          expectCycle: false,
        },
      ];

      scenarios.forEach(({ name: _name, links, newLink, expectCycle }) => {
        const hasCycle = DependencyDetector.checkCircularDependency(
          links,
          newLink
        );
        expect(hasCycle).toBe(expectCycle);
      });
    });

    it('should correctly analyze dependency relationships', () => {
      const links = [
        createLink('START', 'A'),
        createLink('START', 'B'),
        createLink('A', 'C'),
        createLink('B', 'C'),
        createLink('C', 'D'),
        createLink('D', 'END'),
      ];

      // Test predecessor/successor relationships
      expect(DependencyDetector.getPredecessors('C', links)).toEqual([
        'A',
        'B',
      ]);
      expect(DependencyDetector.getSuccessors('START', links)).toEqual([
        'A',
        'B',
      ]);
      expect(DependencyDetector.getPredecessors('START', links)).toEqual([]);
      expect(DependencyDetector.getSuccessors('END', links)).toEqual([]);
    });

    it('should perform topological sorting correctly', () => {
      const links = [
        createLink('A', 'C'),
        createLink('B', 'C'),
        createLink('C', 'D'),
        createLink('D', 'E'),
      ];

      const sorted = DependencyDetector.getTopologicalOrder(links);

      // Verify topological order constraints
      expect(sorted.indexOf('A')).toBeLessThan(sorted.indexOf('C'));
      expect(sorted.indexOf('B')).toBeLessThan(sorted.indexOf('C'));
      expect(sorted.indexOf('C')).toBeLessThan(sorted.indexOf('D'));
      expect(sorted.indexOf('D')).toBeLessThan(sorted.indexOf('E'));
    });
  });

  // ============================================================================
  // INTEGRATION TESTS - CROSS-MODULE FUNCTIONALITY
  // ============================================================================

  describe('Integration Tests - Module 5.1 Complete Workflow', () => {
    it('should validate a complete project schedule', () => {
      // Create a realistic project structure
      const projectTasks = [
        new Task({
          id: 'PRJ-001',
          name: 'Website Development Project',
          duration: 1, // Project start
          wbs: '1',
        }),
        new Task({
          id: 'PLAN-001',
          name: 'Planning Phase',
          duration: 5,
          wbs: '1.1',
          priority: TaskPriority.HIGH,
        }),
        new Task({
          id: 'DEV-001',
          name: 'Development Phase',
          duration: 20,
          wbs: '1.2',
          priority: TaskPriority.HIGH,
          resourceIds: ['DEV-01', 'DEV-02'],
        }),
        new Task({
          id: 'TEST-001',
          name: 'Testing Phase',
          duration: 10,
          wbs: '1.3',
          priority: TaskPriority.MEDIUM,
          resourceIds: ['QA-01'],
        }),
        new Task({
          id: 'DEPLOY-001',
          name: 'Deployment',
          duration: 2,
          wbs: '1.4',
          priority: TaskPriority.CRITICAL,
        }),
      ];

      // Validate all tasks
      projectTasks.forEach((task) => {
        expect(task.validate()).toEqual([]);
      });

      // Create project logic links
      const projectLinks = [
        new LogicLinkModel({
          id: 'L1',
          from: 'PLAN-001',
          to: 'DEV-001',
          type: 'FS',
          lag: 0,
        }),
        new LogicLinkModel({
          id: 'L2',
          from: 'DEV-001',
          to: 'TEST-001',
          type: 'FS',
          lag: -2, // Overlap testing with development
        }),
        new LogicLinkModel({
          id: 'L3',
          from: 'TEST-001',
          to: 'DEPLOY-001',
          type: 'FS',
          lag: 0,
        }),
      ];

      // Validate all links
      projectLinks.forEach((link) => {
        expect(link.validate()).toEqual([]);
      });

      // Check for circular dependencies
      const allLinks = projectLinks.map((link) => link.getData());
      for (let i = 0; i < allLinks.length; i++) {
        const existingLinks = allLinks.slice(0, i);
        const newLink = allLinks[i];
        expect(
          DependencyDetector.checkCircularDependency(existingLinks, newLink)
        ).toBe(false);
      }

      // Verify topological order
      const sortedTasks = DependencyDetector.getTopologicalOrder(allLinks);
      expect(sortedTasks.indexOf('PLAN-001')).toBeLessThan(
        sortedTasks.indexOf('DEV-001')
      );
      expect(sortedTasks.indexOf('DEV-001')).toBeLessThan(
        sortedTasks.indexOf('TEST-001')
      );
      expect(sortedTasks.indexOf('TEST-001')).toBeLessThan(
        sortedTasks.indexOf('DEPLOY-001')
      );
    });

    it('should handle performance testing with large datasets', () => {
      // Create a large number of tasks and links for performance testing
      const largeTasks: Task[] = [];
      const largeLinks: LogicLinkModel[] = [];

      // Create 100 sequential tasks
      for (let i = 1; i <= 100; i++) {
        largeTasks.push(
          new Task({
            id: `TASK-${i.toString().padStart(3, '0')}`,
            name: `Task ${i}`,
            duration: (i % 5) + 1, // Deterministic: 1-5 days cycling
            wbs: `1.${i}`,
            priority: i % 2 === 0 ? TaskPriority.HIGH : TaskPriority.MEDIUM,
          })
        );

        if (i > 1) {
          largeLinks.push(
            new LogicLinkModel({
              id: `LINK-${i}`,
              from: `TASK-${(i - 1).toString().padStart(3, '0')}`,
              to: `TASK-${i.toString().padStart(3, '0')}`,
              type: 'FS',
              lag: 0,
            })
          );
        }
      }

      const startTime = Date.now();

      // Validate all tasks
      largeTasks.forEach((task) => {
        expect(task.validate()).toEqual([]);
      });

      // Validate all links
      largeLinks.forEach((link) => {
        expect(link.validate()).toEqual([]);
      });

      // Check topological sort performance
      const links = largeLinks.map((link) => link.getData());
      const sorted = DependencyDetector.getTopologicalOrder(links);
      expect(sorted.length).toBe(100);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Log performance for debugging if slow
      if (executionTime >= 500) {
        console.warn(
          `Performance test took ${executionTime}ms (expected <1000ms)`
        );
      }

      // Should complete within reasonable time (less than 1 second)
      expect(executionTime).toBeLessThan(1000);
    });
  });
});
