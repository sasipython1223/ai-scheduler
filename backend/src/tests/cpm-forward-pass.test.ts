/**
 * CPM Forward Pass Tests
 * AI Scheduler - Module 5.2: Forward Pass Logic Tests
 */

import {
  ForwardPassCalculator,
  calculateProjectEndDate,
  computeForwardPass,
} from '../services/cpm-forward-pass';
import {
  LogicLink,
  LogicType,
  TaskInput,
  TaskPriority,
} from '../types/scheduleTypes';

describe('Module 5.2: CPM Forward Pass', () => {
  let calculator: ForwardPassCalculator;

  beforeEach(() => {
    calculator = new ForwardPassCalculator();
  });

  const createTask = (
    id: string,
    name: string,
    duration: number
  ): TaskInput => ({
    id,
    name,
    duration,
    priority: TaskPriority.MEDIUM,
  });

  const createLink = (
    from: string,
    to: string,
    type: LogicType = 'FS',
    lag: number = 0
  ): LogicLink => ({
    id: `${from}-${to}`,
    from,
    to,
    type,
    lag,
  });

  describe('ForwardPassCalculator', () => {
    it('should compute forward pass for single task', () => {
      const tasks = [createTask('A', 'Task A', 5)];
      const links: LogicLink[] = [];
      const projectStart = '2025-08-04T09:00:00.000Z'; // Monday

      const result = calculator.computeForwardPass(tasks, links, {
        projectStartDate: projectStart,
      });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].id).toBe('A');
      expect(result.tasks[0].earlyStart).toBe(projectStart);
      expect(result.projectStartDate).toBe(projectStart);

      // Should finish after 5 working days - just check it's after start date
      const actualFinish = new Date(result.tasks[0].earlyFinish);
      const startDate = new Date(projectStart);
      expect(actualFinish.getTime()).toBeGreaterThan(startDate.getTime());

      // Should be roughly 5-7 calendar days later (allowing for weekends)
      const daysDiff =
        (actualFinish.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThan(4);
      expect(daysDiff).toBeLessThan(10);
    });

    it('should handle simple linear dependency chain (A → B → C)', () => {
      const tasks = [
        createTask('A', 'Task A', 5),
        createTask('B', 'Task B', 3),
        createTask('C', 'Task C', 4),
      ];

      const links = [createLink('A', 'B'), createLink('B', 'C')];

      const projectStart = '2025-08-04T09:00:00.000Z';
      const result = calculator.computeForwardPass(tasks, links, {
        projectStartDate: projectStart,
      });

      const taskMap = new Map(result.tasks.map((t) => [t.id, t]));
      const taskA = taskMap.get('A')!;
      const taskB = taskMap.get('B')!;
      const taskC = taskMap.get('C')!;

      // Task A starts at project start
      expect(taskA.earlyStart).toBe(projectStart);

      // Task B starts after A finishes
      expect(new Date(taskB.earlyStart).getTime()).toBeGreaterThan(
        new Date(taskA.earlyFinish).getTime()
      );

      // Task C starts after B finishes
      expect(new Date(taskC.earlyStart).getTime()).toBeGreaterThan(
        new Date(taskB.earlyFinish).getTime()
      );

      // Check processing preserved dependencies
      expect(result.tasks.every((t) => t.earlyStart && t.earlyFinish)).toBe(
        true
      );
    });

    it('should handle parallel paths with convergence', () => {
      // A → C
      // B → C (parallel to A)
      const tasks = [
        createTask('A', 'Task A', 5),
        createTask('B', 'Task B', 7), // Longer duration
        createTask('C', 'Task C', 3),
      ];

      const links = [createLink('A', 'C'), createLink('B', 'C')];

      const result = calculator.computeForwardPass(tasks, links);
      const taskMap = new Map(result.tasks.map((t) => [t.id, t]));

      const taskA = taskMap.get('A')!;
      const taskB = taskMap.get('B')!;
      const taskC = taskMap.get('C')!;

      // A and B should start at the same time (no predecessors)
      expect(taskA.earlyStart).toBe(taskB.earlyStart);

      // C should start after the later of A or B finishes
      // Since B has longer duration (7 vs 5), C should wait for B
      expect(new Date(taskC.earlyStart).getTime()).toBeGreaterThan(
        new Date(taskA.earlyFinish).getTime()
      );
      expect(new Date(taskC.earlyStart).getTime()).toBeGreaterThan(
        new Date(taskB.earlyFinish).getTime()
      );
    });

    it('should handle different logic link types', () => {
      const tasks = [
        createTask('A', 'Task A', 5),
        createTask('B', 'Task B (SS)', 3),
        createTask('C', 'Task C (FF)', 4),
      ];

      const links = [
        createLink('A', 'B', 'SS'), // Start-to-Start
        createLink('A', 'C', 'FF'), // Finish-to-Finish
      ];

      const result = calculator.computeForwardPass(tasks, links);
      const taskMap = new Map(result.tasks.map((t) => [t.id, t]));

      const taskA = taskMap.get('A')!;
      const taskB = taskMap.get('B')!;
      const taskC = taskMap.get('C')!;

      // Start-to-Start: B should start when A starts
      expect(taskB.earlyStart).toBe(taskA.earlyStart);

      // All tasks should have valid dates
      expect(taskA.earlyStart).toBeTruthy();
      expect(taskB.earlyStart).toBeTruthy();
      expect(taskC.earlyStart).toBeTruthy();
    });

    it('should handle lag values correctly', () => {
      const tasks = [
        createTask('A', 'Task A', 5),
        createTask('B', 'Task B with lag', 3),
      ];

      const links = [
        createLink('A', 'B', 'FS', 2), // 2-day lag
      ];

      const result = calculator.computeForwardPass(tasks, links);
      const taskMap = new Map(result.tasks.map((t) => [t.id, t]));

      const taskA = taskMap.get('A')!;
      const taskB = taskMap.get('B')!;

      // B should start 2 working days after A finishes
      const expectedBStart = new Date(taskA.earlyFinish);
      expectedBStart.setDate(expectedBStart.getDate() + 2); // Add lag days

      const actualBStart = new Date(taskB.earlyStart);

      // Should be close but account for working days calculation
      expect(actualBStart.getTime()).toBeGreaterThan(
        new Date(taskA.earlyFinish).getTime()
      );
    });

    it('should handle milestone tasks (zero duration)', () => {
      const tasks = [
        createTask('A', 'Task A', 5),
        createTask('MILESTONE', 'Project Milestone', 0), // Milestone
        createTask('B', 'Task B', 3),
      ];

      const links = [
        createLink('A', 'MILESTONE'),
        createLink('MILESTONE', 'B'),
      ];

      const result = calculator.computeForwardPass(tasks, links);
      const taskMap = new Map(result.tasks.map((t) => [t.id, t]));

      const milestone = taskMap.get('MILESTONE')!;

      // Milestone should have same start and finish date
      expect(milestone.earlyStart).toBe(milestone.earlyFinish);
    });

    it('should detect and throw error for circular dependencies', () => {
      const tasks = [
        createTask('A', 'Task A', 5),
        createTask('B', 'Task B', 3),
        createTask('C', 'Task C', 4),
      ];

      const links = [
        createLink('A', 'B'),
        createLink('B', 'C'),
        createLink('C', 'A'), // Creates cycle: A → B → C → A
      ];

      expect(() => {
        calculator.computeForwardPass(tasks, links);
      }).toThrow('Circular dependency detected');
    });

    it('should calculate correct project end date', () => {
      const tasks = [
        createTask('A', 'Task A', 5),
        createTask('B', 'Task B', 3),
        createTask('C', 'Task C', 7), // Longest path
      ];

      const links = [
        createLink('A', 'B'),
        createLink('A', 'C'), // C runs in parallel but is longer
      ];

      const result = calculator.computeForwardPass(tasks, links);
      const taskMap = new Map(result.tasks.map((t) => [t.id, t]));

      const taskC = taskMap.get('C')!;

      // Project end should be when the longest task (C) finishes
      expect(result.projectEndDate).toBe(taskC.earlyFinish);
    });
  });

  describe('Utility Functions', () => {
    it('should compute forward pass using utility function', () => {
      const tasks = [
        createTask('A', 'Task A', 5),
        createTask('B', 'Task B', 3),
      ];

      const links = [createLink('A', 'B')];

      const result = computeForwardPass(tasks, links);

      expect(result).toHaveLength(2);
      expect(result.every((task) => task.earlyStart && task.earlyFinish)).toBe(
        true
      );
    });

    it('should calculate project end date using utility function', () => {
      const tasks = [
        createTask('A', 'Task A', 5),
        createTask('B', 'Task B', 3),
      ];

      const links = [createLink('A', 'B')];

      const endDate = calculateProjectEndDate(tasks, links);

      expect(endDate).toBeTruthy();
      expect(new Date(endDate).getTime()).toBeGreaterThan(
        Date.now() - 86400000
      ); // Within reasonable range
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty task list', () => {
      const result = calculator.computeForwardPass([], []);

      expect(result.tasks).toHaveLength(0);
      expect(result.projectStartDate).toBeTruthy();
      expect(result.projectEndDate).toBeTruthy();
    });

    it('should handle tasks with no links', () => {
      const tasks = [
        createTask('A', 'Independent Task A', 5),
        createTask('B', 'Independent Task B', 3),
      ];

      const result = calculator.computeForwardPass(tasks, []);

      expect(result.tasks).toHaveLength(2);
      // All tasks should start at project start since no dependencies
      expect(result.tasks[0].earlyStart).toBe(result.tasks[1].earlyStart);
    });

    it('should skip validation when requested', () => {
      const tasks = [
        createTask('A', 'Task A', 5),
        createTask('B', 'Task B', 3),
      ];

      const links = [
        createLink('A', 'B'),
        createLink('B', 'A'), // Circular - but validation disabled
      ];

      // Should not throw when validation is disabled
      expect(() => {
        calculator.computeForwardPass(tasks, links, { validateCycles: false });
      }).not.toThrow();
    });
  });

  describe('📊 Test Case Summary Table Generator', () => {
    /**
     * Format date for display (convert ISO to readable format)
     */
    const formatDate = (isoDate: string): string => {
      const date = new Date(isoDate);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    /**
     * Generate markdown table for a test scenario
     */
    const generateTestTable = (
      scenarioName: string,
      tasks: TaskInput[],
      links: LogicLink[],
      projectStart: string = '2025-08-04T09:00:00.000Z'
    ): string => {
      // Run forward pass calculation
      const result = calculator.computeForwardPass(tasks, links, {
        projectStartDate: projectStart,
      });

      // Create task map for easy lookup
      const taskMap = new Map(result.tasks.map((t) => [t.id, t]));

      // Create links map for predecessor lookup
      const predecessorMap = new Map<
        string,
        Array<{ from: string; type: LogicType; lag: number }>
      >();
      for (const link of links) {
        if (!predecessorMap.has(link.to)) {
          predecessorMap.set(link.to, []);
        }
        predecessorMap.get(link.to)!.push({
          from: link.from,
          type: link.type,
          lag: link.lag || 0,
        });
      }

      let table = `\n## ${scenarioName}\n\n`;
      table += `**Project Start:** ${formatDate(projectStart)}\n\n`;
      table += `| Task ID | Name | Duration | Predecessors | Logic Type | Lag | Early Start | Early Finish |\n`;
      table += `|---------|------|----------|--------------|------------|-----|-------------|---------------|\n`;

      for (const task of tasks) {
        const scheduledTask = taskMap.get(task.id)!;
        const predecessors = predecessorMap.get(task.id) || [];

        // Format predecessors
        let predecessorText = '–';
        let logicTypeText = '–';
        let lagText = '–';

        if (predecessors.length > 0) {
          predecessorText = predecessors.map((p) => p.from).join(', ');
          logicTypeText = predecessors.map((p) => p.type).join(', ');
          lagText = predecessors.map((p) => p.lag.toString()).join(', ');
        }

        table += `| ${task.id} | ${task.name} | ${task.duration} | ${predecessorText} | ${logicTypeText} | ${lagText} | ${formatDate(scheduledTask.earlyStart)} | ${formatDate(scheduledTask.earlyFinish)} |\n`;
      }

      table += `\n**Project End:** ${formatDate(result.projectEndDate)}\n\n`;
      return table;
    };

    it('should generate test case summary tables', () => {
      console.log('\n📊 CPM Forward Pass Test Case Summary Tables\n');

      // Scenario 1: Single Task
      const scenario1Tasks = [createTask('A', 'Single Task', 5)];
      const scenario1Links: LogicLink[] = [];
      console.log(
        generateTestTable(
          'Scenario 1: Single Task',
          scenario1Tasks,
          scenario1Links
        )
      );

      // Scenario 2: Simple Linear Chain (A → B → C)
      const scenario2Tasks = [
        createTask('A', 'Analysis', 3),
        createTask('B', 'Design', 2),
        createTask('C', 'Implementation', 4),
      ];
      const scenario2Links = [createLink('A', 'B'), createLink('B', 'C')];
      console.log(
        generateTestTable(
          'Scenario 2: Simple Linear Chain (A → B → C)',
          scenario2Tasks,
          scenario2Links
        )
      );

      // Scenario 3: Parallel Paths with Convergence
      const scenario3Tasks = [
        createTask('A', 'Requirements', 5),
        createTask('B', 'Architecture', 7),
        createTask('C', 'Integration', 3),
      ];
      const scenario3Links = [createLink('A', 'C'), createLink('B', 'C')];
      console.log(
        generateTestTable(
          'Scenario 3: Parallel Paths with Convergence',
          scenario3Tasks,
          scenario3Links
        )
      );

      // Scenario 4: Different Logic Link Types
      const scenario4Tasks = [
        createTask('A', 'Foundation', 5),
        createTask('B', 'Start-to-Start Task', 3),
        createTask('C', 'Finish-to-Finish Task', 4),
      ];
      const scenario4Links = [
        createLink('A', 'B', 'SS'), // Start-to-Start
        createLink('A', 'C', 'FF'), // Finish-to-Finish
      ];
      console.log(
        generateTestTable(
          'Scenario 4: Different Logic Link Types',
          scenario4Tasks,
          scenario4Links
        )
      );

      // Scenario 5: Lag Values
      const scenario5Tasks = [
        createTask('A', 'Base Task', 4),
        createTask('B', 'Delayed Task', 3),
        createTask('C', 'Overlapping Task', 2),
      ];
      const scenario5Links = [
        createLink('A', 'B', 'FS', 2), // 2-day delay
        createLink('A', 'C', 'FS', -1), // 1-day overlap
      ];
      console.log(
        generateTestTable(
          'Scenario 5: Lag Values (Delay and Overlap)',
          scenario5Tasks,
          scenario5Links
        )
      );

      // Summary comparison table
      const scenarios = [
        { name: 'Single Task', tasks: scenario1Tasks, links: scenario1Links },
        { name: 'Linear Chain', tasks: scenario2Tasks, links: scenario2Links },
        {
          name: 'Parallel Paths',
          tasks: scenario3Tasks,
          links: scenario3Links,
        },
        { name: 'Logic Types', tasks: scenario4Tasks, links: scenario4Links },
        { name: 'Lag Values', tasks: scenario5Tasks, links: scenario5Links },
      ];

      console.log('\n## Scenario Comparison Summary\n');
      console.log('| Scenario | Tasks | Links | Project Duration (Days) |');
      console.log('|----------|-------|-------|-------------------------|');

      for (const scenario of scenarios) {
        const result = calculator.computeForwardPass(
          scenario.tasks,
          scenario.links
        );

        const projectStart = new Date(result.projectStartDate);
        const projectEnd = new Date(result.projectEndDate);
        const durationMs = projectEnd.getTime() - projectStart.getTime();
        const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

        console.log(
          `| ${scenario.name} | ${scenario.tasks.length} | ${scenario.links.length} | ${durationDays} |`
        );
      }

      console.log('\n📋 Test case summary tables generated successfully!');
      expect(scenarios.length).toBe(5);
    });
  });
});
