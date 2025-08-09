/**
 * Performance Test Utilities - Task Generator
 * Module 5.6: Generate large mock task sets for performance testing
 */

import type { LogicLink, TaskInput } from '../../../types/schedule';
import { TaskPriority } from '../../../types/schedule';

/**
 * Generate a large number of tasks for performance testing
 */
export function generateTasks(count: number): TaskInput[] {
  const tasks: TaskInput[] = [];

  for (let i = 0; i < count; i++) {
    tasks.push({
      id: `T${i + 1}`,
      name: `Task ${i + 1}`,
      duration: Math.floor(Math.random() * 5) + 1, // 1-5 days
      wbs: `WBS.${Math.floor(i / 100) + 1}.${(i % 100) + 1}`,
      predecessors: i === 0 ? [] : [`T${i}`], // Simple linear dependency
    });
  }

  return tasks;
}

/**
 * Generate complex task dependencies for stress testing
 */
export function generateComplexTasks(count: number): TaskInput[] {
  const tasks: TaskInput[] = [];

  for (let i = 0; i < count; i++) {
    const predecessors: string[] = [];

    // Create more complex dependency patterns
    if (i > 0) {
      // Add immediate predecessor
      predecessors.push(`T${i}`);

      // Add some random dependencies for complexity
      if (i > 10 && Math.random() > 0.7) {
        const randomPred = Math.floor(Math.random() * (i - 1)) + 1;
        predecessors.push(`T${randomPred}`);
      }
    }

    tasks.push({
      id: `T${i + 1}`,
      name: `Complex Task ${i + 1}`,
      duration: Math.floor(Math.random() * 10) + 1, // 1-10 days
      wbs: `WBS.${Math.floor(i / 50) + 1}.${Math.floor((i % 50) / 10) + 1}.${(i % 10) + 1}`,
      predecessors,
      priority:
        i % 3 === 0
          ? TaskPriority.HIGH
          : i % 3 === 1
            ? TaskPriority.MEDIUM
            : TaskPriority.LOW,
    });
  }

  return tasks;
}

/**
 * Generate logic links from task predecessors
 */
export function generateLogicLinks(tasks: TaskInput[]): LogicLink[] {
  const links: LogicLink[] = [];

  tasks.forEach((task) => {
    if (task.predecessors && task.predecessors.length > 0) {
      task.predecessors.forEach((pred) => {
        links.push({
          id: `${pred}-${task.id}`,
          from: pred,
          to: task.id,
          type: 'FS', // Finish-to-Start
          lag: 0,
        });
      });
    }
  });

  return links;
}

/**
 * Generate test scenario with tasks and dependencies
 */
export function generateTestScenario(
  taskCount: number,
  complexity: 'simple' | 'complex' = 'simple'
) {
  const tasks =
    complexity === 'complex'
      ? generateComplexTasks(taskCount)
      : generateTasks(taskCount);

  const logicLinks = generateLogicLinks(tasks);

  return {
    tasks,
    logicLinks,
    metadata: {
      taskCount,
      dependencyCount: logicLinks.length,
      complexity,
      generatedAt: new Date().toISOString(),
    },
  };
}
