/**
 * Test Case Summary Table Generator (for Modules 5.1 + 5.2)
 * AI Scheduler - Auto-generate markdown tables showing test inputs and outputs
 */

import * as fs from 'fs';
import * as path from 'path';
import { ForwardPassCalculator } from '../services/cpm-forward-pass';
import {
  LogicLink,
  LogicType,
  TaskInput,
  TaskPriority,
} from '../types/scheduleTypes';

describe('📊 Test Case Summary Table Generator', () => {
  let calculator: ForwardPassCalculator;

  beforeEach(() => {
    calculator = new ForwardPassCalculator();
  });

  /**
   * Helper function to create a task
   */
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

  /**
   * Helper function to create a logic link
   */
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

  describe('Forward Pass Test Scenarios', () => {
    it('should generate summary tables for all test scenarios', () => {
      let markdownContent = '# CPM Forward Pass Test Case Summary\n\n';
      markdownContent +=
        'This document shows the input data and computed results for all CPM forward pass test scenarios.\n\n';

      // Scenario 1: Single Task
      const scenario1Tasks = [createTask('A', 'Single Task', 5)];
      const scenario1Links: LogicLink[] = [];
      markdownContent += generateTestTable(
        'Scenario 1: Single Task',
        scenario1Tasks,
        scenario1Links
      );

      // Scenario 2: Simple Linear Chain (A → B → C)
      const scenario2Tasks = [
        createTask('A', 'Analysis', 3),
        createTask('B', 'Design', 2),
        createTask('C', 'Implementation', 4),
      ];
      const scenario2Links = [createLink('A', 'B'), createLink('B', 'C')];
      markdownContent += generateTestTable(
        'Scenario 2: Simple Linear Chain (A → B → C)',
        scenario2Tasks,
        scenario2Links
      );

      // Scenario 3: Parallel Paths with Convergence
      const scenario3Tasks = [
        createTask('A', 'Requirements', 5),
        createTask('B', 'Architecture', 7),
        createTask('C', 'Integration', 3),
      ];
      const scenario3Links = [createLink('A', 'C'), createLink('B', 'C')];
      markdownContent += generateTestTable(
        'Scenario 3: Parallel Paths with Convergence',
        scenario3Tasks,
        scenario3Links
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
      markdownContent += generateTestTable(
        'Scenario 4: Different Logic Link Types',
        scenario4Tasks,
        scenario4Links
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
      markdownContent += generateTestTable(
        'Scenario 5: Lag Values (Delay and Overlap)',
        scenario5Tasks,
        scenario5Links
      );

      // Scenario 6: Milestone Tasks
      const scenario6Tasks = [
        createTask('A', 'Development', 5),
        createTask('B', 'Milestone: Phase 1 Complete', 0),
        createTask('C', 'Testing', 3),
      ];
      const scenario6Links = [createLink('A', 'B'), createLink('B', 'C')];
      markdownContent += generateTestTable(
        'Scenario 6: Milestone Tasks (Zero Duration)',
        scenario6Tasks,
        scenario6Links
      );

      // Scenario 7: Complex Mixed Dependencies
      const scenario7Tasks = [
        createTask('A', 'Planning', 2),
        createTask('B', 'Design UI', 4),
        createTask('C', 'Design API', 3),
        createTask('D', 'Development', 6),
        createTask('E', 'Testing', 2),
      ];
      const scenario7Links = [
        createLink('A', 'B'),
        createLink('A', 'C'),
        createLink('B', 'D', 'SS', 1), // Start-to-Start with 1-day lag
        createLink('C', 'D'),
        createLink('D', 'E'),
      ];
      markdownContent += generateTestTable(
        'Scenario 7: Complex Mixed Dependencies',
        scenario7Tasks,
        scenario7Links
      );

      // Write to markdown file
      const outputPath = path.join(
        __dirname,
        '../../docs/test-case-summary.md'
      );
      const docsDir = path.dirname(outputPath);

      // Create docs directory if it doesn't exist
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, markdownContent, 'utf8');

      console.log(`\n📊 Test Case Summary Table Generated!`);
      console.log(`📁 File location: ${outputPath}`);
      console.log(
        `🔍 Contains ${scenario7Tasks.length + scenario6Tasks.length + scenario5Tasks.length + scenario4Tasks.length + scenario3Tasks.length + scenario2Tasks.length + scenario1Tasks.length} total tasks across 7 scenarios`
      );

      // Also log a sample to console for immediate viewing
      console.log('\n📋 Sample Table (Scenario 2):');
      console.log(
        generateTestTable('Linear Chain Sample', scenario2Tasks, scenario2Links)
      );

      expect(fs.existsSync(outputPath)).toBe(true);
    });

    it('should generate comparison table between test scenarios', () => {
      const scenarios = [
        {
          name: 'Single Task',
          tasks: [createTask('A', 'Single Task', 5)],
          links: [] as LogicLink[],
        },
        {
          name: 'Linear Chain',
          tasks: [
            createTask('A', 'Task A', 3),
            createTask('B', 'Task B', 2),
            createTask('C', 'Task C', 4),
          ],
          links: [createLink('A', 'B'), createLink('B', 'C')],
        },
        {
          name: 'Parallel Paths',
          tasks: [
            createTask('A', 'Path A', 5),
            createTask('B', 'Path B', 7),
            createTask('C', 'Convergence', 3),
          ],
          links: [createLink('A', 'C'), createLink('B', 'C')],
        },
      ];

      let comparisonTable = '\n## Scenario Comparison Summary\n\n';
      comparisonTable +=
        '| Scenario | Tasks | Links | Project Duration (Days) | Critical Path |\n';
      comparisonTable +=
        '|----------|-------|-------|-------------------------|---------------|\n';

      for (const scenario of scenarios) {
        const result = calculator.computeForwardPass(
          scenario.tasks,
          scenario.links
        );

        const projectStart = new Date(result.projectStartDate);
        const projectEnd = new Date(result.projectEndDate);
        const durationMs = projectEnd.getTime() - projectStart.getTime();
        const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

        // Simple critical path detection (tasks with zero total float would be critical)
        const criticalTasks = result.tasks.filter((t) => t.totalFloat === 0);
        const criticalPath =
          criticalTasks.map((t) => t.id).join(' → ') || 'N/A';

        comparisonTable += `| ${scenario.name} | ${scenario.tasks.length} | ${scenario.links.length} | ${durationDays} | ${criticalPath} |\n`;
      }

      console.log(comparisonTable);

      expect(scenarios.length).toBeGreaterThan(0);
    });
  });
});
