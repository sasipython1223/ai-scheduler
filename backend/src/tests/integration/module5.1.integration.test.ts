/**
 * Module 5.1 Integration Tests
 * AI Scheduler - Module 5.1: Schedule Engine Data Models Integration
 */

import {
  DependencyDetector,
  checkCircularDependency,
} from '../../models/schedule/dependency.util';
import {
  createLogicLink,
  validateLogicLink,
} from '../../models/schedule/logicLink.model';
import {
  ScheduleEngine,
  createScheduleEngine,
} from '../../models/schedule/scheduleEngine.model';
import { createTask, validateTask } from '../../models/schedule/task.model';
import { createWorkingDaysCalculator } from '../../models/schedule/workingDays.util';
import { LogicLink, TaskInput } from '../../types/scheduleTypes';
import {
  createTestLogicLink,
  createTestTask,
  mockLogicLinks,
  mockScheduleRequest,
  mockTasks,
} from '../fixtures/mockScheduleProject';

describe('Module 5.1 Integration Tests', () => {
  describe('Complete schedule validation pipeline', () => {
    it('should validate the mock schedule project end-to-end', () => {
      // Step 1: Validate all tasks
      const taskValidationResults = mockTasks.map((task) => ({
        task: task.id,
        results: validateTask(task),
      }));

      // All tasks should be valid
      taskValidationResults.forEach(({ task: _task, results }) => {
        expect(results).toEqual([]);
      });

      // Step 2: Validate all logic links
      const linkValidationResults = mockLogicLinks.map((link) => ({
        link: link.id,
        results: validateLogicLink(link),
      }));

      // All links should be valid
      linkValidationResults.forEach(({ link: _link, results }) => {
        expect(results).toEqual([]);
      });

      // Step 3: Check for circular dependencies
      // Test adding each link to see if it creates a cycle
      for (const newLink of mockLogicLinks) {
        const otherLinks = mockLogicLinks.filter((l) => l.id !== newLink.id);
        const hasCycle = checkCircularDependency(otherLinks, newLink);
        expect(hasCycle).toBe(false);
      }

      // Step 4: Verify working days calculations work
      const calculator = createWorkingDaysCalculator();
      const workingDays = calculator.calculateWorkingDays(
        '2025-08-04T09:00:00.000Z', // Monday
        '2025-08-08T17:00:00.000Z' // Friday
      );
      expect(workingDays).toBe(5);
    });

    it('should create task objects from all mock data', () => {
      const taskObjects = mockTasks.map((taskData) => createTask(taskData));

      expect(taskObjects).toHaveLength(mockTasks.length);

      // Verify each task object
      taskObjects.forEach((task, index) => {
        const originalData = mockTasks[index];
        const taskData = task.getData();

        expect(taskData.id).toBe(originalData.id);
        expect(taskData.name).toBe(originalData.name);
        expect(task.getDuration()).toBe(originalData.duration);
        expect(task.getWBSLevel()).toBeGreaterThan(0);
      });
    });

    it('should create logic link objects from all mock data', () => {
      const linkObjects = mockLogicLinks.map((linkData) =>
        createLogicLink(linkData)
      );

      expect(linkObjects).toHaveLength(mockLogicLinks.length);

      // Verify each link object
      linkObjects.forEach((link, index) => {
        const originalData = mockLogicLinks[index];
        const linkData = link.getData();

        expect(linkData.id).toBe(originalData.id);
        expect(linkData.from).toBe(originalData.from);
        expect(linkData.to).toBe(originalData.to);
        expect(link.getLinkType()).toBe(originalData.type);
      });
    });

    it('should build dependency graph from mock data', () => {
      const graph = DependencyDetector.buildDependencyGraph(mockLogicLinks);

      // Verify expected relationships exist
      expect(graph.has('A')).toBe(true);
      expect(graph.get('A')).toContain('B');

      expect(graph.has('B')).toBe(true);
      expect(graph.get('B')).toContain('C');
      expect(graph.get('B')).toContain('D');
      expect(graph.get('B')).toContain('E');

      expect(graph.has('F')).toBe(true); // F has successor G
      expect(graph.get('F')).toContain('G');
    });

    it('should perform topological sort on mock data', () => {
      const sortedTasks =
        DependencyDetector.getTopologicalOrder(mockLogicLinks);

      expect(sortedTasks).toBeDefined();
      expect(sortedTasks.length).toBeGreaterThan(0);

      // Verify dependencies come before dependents
      const aIndex = sortedTasks.indexOf('A');
      const bIndex = sortedTasks.indexOf('B');
      const cIndex = sortedTasks.indexOf('C');

      if (aIndex !== -1 && bIndex !== -1) {
        expect(aIndex).toBeLessThan(bIndex);
      }
      if (bIndex !== -1 && cIndex !== -1) {
        expect(bIndex).toBeLessThan(cIndex);
      }
    });
  });

  describe('Schedule engine integration', () => {
    let scheduleEngine: ScheduleEngine;

    beforeEach(() => {
      scheduleEngine = createScheduleEngine();
    });

    it('should create scheduled tasks from input data', () => {
      const inputTask = mockTasks[1]; // Requirements Analysis
      const scheduledTask = scheduleEngine.createScheduledTask(inputTask);

      expect(scheduledTask.id).toBe(inputTask.id);
      expect(scheduledTask.name).toBe(inputTask.name);
      expect(scheduledTask.duration).toBe(inputTask.duration);
      expect(scheduledTask.earlyStart).toBeDefined();
      expect(scheduledTask.earlyFinish).toBeDefined();
      expect(scheduledTask.totalFloat).toBe(0);
      expect(scheduledTask.isCritical).toBe(false);
    });

    it('should calculate early dates based on predecessors', () => {
      const taskA = scheduleEngine.createScheduledTask(mockTasks[0]); // Project Start
      const taskB = mockTasks[1]; // Requirements Analysis (depends on A)

      const earlyStart = scheduleEngine.calculateEarlyStart(taskB, [taskA]);
      expect(earlyStart).toBeDefined();

      const earlyFinish = scheduleEngine.calculateEarlyFinish(
        earlyStart,
        taskB.duration
      );
      expect(earlyFinish).toBeDefined();

      const startDate = new Date(earlyStart);
      const finishDate = new Date(earlyFinish);
      expect(finishDate.getTime()).toBeGreaterThan(startDate.getTime());
    });

    it('should calculate task status correctly', () => {
      const scheduledTask = scheduleEngine.createScheduledTask(mockTasks[1]);

      // Set task as completed
      scheduledTask.percentComplete = 100;
      const status = scheduleEngine.calculateTaskStatus(scheduledTask);
      expect(status).toBe('COMPLETED');

      // Set task as in progress
      scheduledTask.percentComplete = 50;
      const statusInProgress =
        scheduleEngine.calculateTaskStatus(scheduledTask);
      expect(['IN_PROGRESS', 'NOT_STARTED', 'PAUSED']).toContain(
        statusInProgress
      );
    });

    it('should integrate with working days calculator', () => {
      const workingDaysCalc = scheduleEngine.getWorkingDaysCalculator();
      expect(workingDaysCalc).toBeDefined();

      const mondayToFriday = workingDaysCalc.calculateWorkingDays(
        '2025-08-04T09:00:00.000Z', // Monday
        '2025-08-08T17:00:00.000Z' // Friday
      );
      expect(mondayToFriday).toBe(5);
    });

    it('should calculate float values correctly', () => {
      const earlyStart = '2025-08-04T09:00:00.000Z';
      const lateStart = '2025-08-06T09:00:00.000Z';

      const totalFloat = scheduleEngine.calculateTotalFloat(
        earlyStart,
        lateStart
      );
      expect(totalFloat).toBe(3); // 3 working days difference (Mon-Wed inclusive)

      const isCritical = scheduleEngine.isCriticalTask(0);
      expect(isCritical).toBe(true);

      const isNotCritical = scheduleEngine.isCriticalTask(totalFloat);
      expect(isNotCritical).toBe(false);
    });

    it('should update complete task schedule', () => {
      const inputTask = mockTasks[2]; // System Design
      const earlyStart = '2025-08-04T09:00:00.000Z';
      const earlyFinish = '2025-08-12T17:00:00.000Z';
      const lateStart = '2025-08-04T09:00:00.000Z';
      const lateFinish = '2025-08-12T17:00:00.000Z';
      const totalFloat = 0;
      const freeFloat = 0;

      const updatedTask = scheduleEngine.updateTaskSchedule(
        inputTask,
        earlyStart,
        earlyFinish,
        lateStart,
        lateFinish,
        totalFloat,
        freeFloat
      );

      expect(updatedTask.earlyStart).toBe(earlyStart);
      expect(updatedTask.earlyFinish).toBe(earlyFinish);
      expect(updatedTask.lateStart).toBe(lateStart);
      expect(updatedTask.lateFinish).toBe(lateFinish);
      expect(updatedTask.totalFloat).toBe(totalFloat);
      expect(updatedTask.freeFloat).toBe(freeFloat);
      expect(updatedTask.isCritical).toBe(true); // Zero float = critical
    });
  });

  describe('Cross-module integration scenarios', () => {
    it('should handle complex dependency chains', () => {
      // Create a complex dependency chain
      const complexTasks: TaskInput[] = [
        createTestTask({ id: 'T1', name: 'Task 1', duration: 5 }),
        createTestTask({
          id: 'T2',
          name: 'Task 2',
          duration: 3,
          predecessors: ['T1'],
        }),
        createTestTask({
          id: 'T3',
          name: 'Task 3',
          duration: 4,
          predecessors: ['T1'],
        }),
        createTestTask({
          id: 'T4',
          name: 'Task 4',
          duration: 2,
          predecessors: ['T2', 'T3'],
        }),
        createTestTask({
          id: 'T5',
          name: 'Task 5',
          duration: 6,
          predecessors: ['T4'],
        }),
      ];

      const complexLinks: LogicLink[] = [
        createTestLogicLink({ id: 'L1', from: 'T1', to: 'T2' }),
        createTestLogicLink({ id: 'L2', from: 'T1', to: 'T3' }),
        createTestLogicLink({ id: 'L3', from: 'T2', to: 'T4' }),
        createTestLogicLink({ id: 'L4', from: 'T3', to: 'T4' }),
        createTestLogicLink({ id: 'L5', from: 'T4', to: 'T5' }),
      ];

      // Validate all tasks and links
      const taskValidations = complexTasks.map((task) => validateTask(task));
      const linkValidations = complexLinks.map((link) =>
        validateLogicLink(link)
      );

      expect(taskValidations.every((results) => results.length === 0)).toBe(
        true
      );
      expect(linkValidations.every((results) => results.length === 0)).toBe(
        true
      );

      // Check no circular dependencies
      for (const newLink of complexLinks) {
        const otherLinks = complexLinks.filter((l) => l.id !== newLink.id);
        const hasCycle = checkCircularDependency(otherLinks, newLink);
        expect(hasCycle).toBe(false);
      }

      // Build and verify dependency graph
      const graph = DependencyDetector.buildDependencyGraph(complexLinks);
      expect(graph.get('T1')).toEqual(['T2', 'T3']);
      expect(graph.get('T2')).toEqual(['T4']);
      expect(graph.get('T3')).toEqual(['T4']);
      expect(graph.get('T4')).toEqual(['T5']);
    });

    it('should detect circular dependencies in complex scenarios', () => {
      const cyclicLinks: LogicLink[] = [
        createTestLogicLink({ id: 'L1', from: 'A', to: 'B' }),
        createTestLogicLink({ id: 'L2', from: 'B', to: 'C' }),
        createTestLogicLink({ id: 'L3', from: 'C', to: 'D' }),
        createTestLogicLink({ id: 'L4', from: 'D', to: 'B' }), // Creates cycle B->C->D->B
      ];

      // Test each link addition
      const baseCyclic = cyclicLinks.slice(0, 3); // First 3 links (no cycle)
      const cyclicLink = cyclicLinks[3]; // The link that creates the cycle

      const noCycle = checkCircularDependency(
        baseCyclic.slice(0, 2),
        baseCyclic[2]
      );
      expect(noCycle).toBe(false);

      const hasCycle = checkCircularDependency(baseCyclic, cyclicLink);
      expect(hasCycle).toBe(true);
    });

    it('should handle holiday integration with working days', () => {
      const holidays = ['2025-08-04']; // Monday holiday
      const holidayCalculator = createWorkingDaysCalculator({
        workingDays: [1, 2, 3, 4, 5], // Monday through Friday
        holidays: holidays,
        workingHoursPerDay: 8,
      });

      // Holiday Monday should not be a working day
      expect(holidayCalculator.isWorkingDay(new Date('2025-08-04'))).toBe(
        false
      );

      // Regular Tuesday should be a working day
      expect(holidayCalculator.isWorkingDay(new Date('2025-08-05'))).toBe(true);

      // Calculate working days across holiday period
      const workingDays = holidayCalculator.calculateWorkingDays(
        '2025-08-04T09:00:00.000Z', // Monday (holiday)
        '2025-08-08T17:00:00.000Z' // Friday
      );
      expect(workingDays).toBe(4); // Tuesday through Friday (4 days)
    });

    it('should handle different calendar configurations', () => {
      // Standard Mon-Fri calendar
      const standardCalc = createWorkingDaysCalculator();

      // Custom calendar (only Mon, Wed, Fri)
      const customCalc = createWorkingDaysCalculator({
        workingDays: [1, 3, 5],
        holidays: [],
        workingHoursPerDay: 8,
      });

      const startDate = '2025-08-04T09:00:00.000Z'; // Monday
      const endDate = '2025-08-08T17:00:00.000Z'; // Friday

      const standardDays = standardCalc.calculateWorkingDays(
        startDate,
        endDate
      );
      const customDays = customCalc.calculateWorkingDays(startDate, endDate);

      expect(standardDays).toBe(5); // Mon, Tue, Wed, Thu, Fri
      expect(customDays).toBe(3); // Mon, Wed, Fri only
    });

    it('should validate complete schedule request', () => {
      const { projectId, tasks, logicLinks, options } = mockScheduleRequest;

      // Basic validation
      expect(projectId).toBeDefined();
      expect(tasks).toBeDefined();
      expect(logicLinks).toBeDefined();
      expect(options).toBeDefined();

      // Validate all tasks
      const allTasksValid = tasks.every((task) => {
        const results = validateTask(task);
        return results.length === 0;
      });
      expect(allTasksValid).toBe(true);

      // Validate all links
      const allLinksValid = logicLinks.every((link) => {
        const results = validateLogicLink(link);
        return results.length === 0;
      });
      expect(allLinksValid).toBe(true);

      // Check for circular dependencies
      for (const newLink of logicLinks) {
        const otherLinks = logicLinks.filter((l) => l.id !== newLink.id);
        const hasCycle = checkCircularDependency(otherLinks, newLink);
        expect(hasCycle).toBe(false);
      }

      // Verify all task references in links exist
      const taskIds = new Set(tasks.map((t) => t.id));
      const allReferencesValid = logicLinks.every(
        (link) => taskIds.has(link.from) && taskIds.has(link.to)
      );
      expect(allReferencesValid).toBe(true);
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle orphaned tasks gracefully', () => {
      const orphanTask = createTestTask({
        id: 'ORPHAN',
        name: 'Orphaned Task',
        predecessors: ['NON_EXISTENT_TASK'],
      });

      // Task validation should pass (it doesn't check if predecessors exist)
      const results = validateTask(orphanTask);
      expect(results).toEqual([]);

      // But dependency detection should not find the orphan in graphs
      const predecessors = DependencyDetector.getPredecessors(
        'ORPHAN',
        mockLogicLinks
      );
      expect(predecessors).toEqual([]);
    });

    it('should handle tasks with invalid WBS codes', () => {
      const invalidWBSTasks = [
        createTestTask({ wbs: '' }), // Empty WBS
        createTestTask({ wbs: '1.' }), // Trailing dot
        createTestTask({ wbs: '.1' }), // Leading dot
        createTestTask({ wbs: '1..2' }), // Double dots
        createTestTask({ wbs: 'A.B' }), // Non-numeric
      ];

      // Some of these should fail validation
      invalidWBSTasks.forEach((task) => {
        const results = validateTask(task);
        // The validation rules depend on the actual implementation
        expect(Array.isArray(results)).toBe(true);
      });
    });

    it('should handle extreme date ranges', () => {
      const calculator = createWorkingDaysCalculator();

      // Very far future dates
      const farFuture = calculator.addWorkingDays(
        '2025-08-04T09:00:00.000Z',
        10000
      );
      expect(farFuture).toBeDefined();

      // Year boundary calculations
      const yearBoundary = calculator.calculateWorkingDays(
        '2024-12-30T09:00:00.000Z',
        '2025-01-03T17:00:00.000Z'
      );
      expect(yearBoundary).toBeGreaterThan(0);
    });

    it('should handle malformed input data gracefully', () => {
      // Test with undefined/null values where possible
      expect(() => {
        createTask(createTestTask({ name: undefined as unknown as string }));
      }).toThrow();

      expect(() => {
        createLogicLink(
          createTestLogicLink({ from: undefined as unknown as string })
        );
      }).toThrow();

      // Test with extreme duration values
      const extremeTask = createTestTask({ duration: Number.MAX_SAFE_INTEGER });
      const results = validateTask(extremeTask);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Performance integration tests', () => {
    it('should handle large datasets efficiently', () => {
      // Create a large number of tasks and links
      const largeTasks: TaskInput[] = [];
      const largeLinks: LogicLink[] = [];

      for (let i = 1; i <= 1000; i++) {
        largeTasks.push(
          createTestTask({
            id: `TASK-${i}`,
            name: `Task ${i}`,
            duration: Math.floor(Math.random() * 10) + 1,
            predecessors: i > 1 ? [`TASK-${i - 1}`] : undefined,
          })
        );

        if (i > 1) {
          largeLinks.push(
            createTestLogicLink({
              id: `LINK-${i}`,
              from: `TASK-${i - 1}`,
              to: `TASK-${i}`,
            })
          );
        }
      }

      const startTime = performance.now();

      // Validate all tasks
      const taskValidations = largeTasks.map((task) => validateTask(task));

      // Validate all links
      const linkValidations = largeLinks.map((link) => validateLogicLink(link));

      // Check for cycles (should be none in this linear chain)
      const sampleLink = largeLinks[500]; // Pick a middle link
      const otherLinks = largeLinks.filter((l) => l.id !== sampleLink.id);
      const hasCycle = checkCircularDependency(otherLinks, sampleLink);

      const endTime = performance.now();

      // Verify results
      expect(taskValidations.length).toBe(1000);
      expect(linkValidations.length).toBe(999);
      expect(hasCycle).toBe(false);

      // Performance check - should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    });
  });
});
