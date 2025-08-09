/**
 * CPM Forward Pass Service - Refactored
 * AI Scheduler - Module 5.2: Forward Pass Logic for Schedule Engine
 *
 * Computes earlyStart and earlyFinish dates for each task using Critical Path Method (CPM)
 * Refactored to follow Clean Code principles with modular architecture
 */

import { DependencyDetector } from '../../../models/schedule/dependency.util';
import { WorkingDaysCalculator } from '../../../models/schedule/workingDays.util';
import {
  LogicLink,
  ScheduledTask,
  TaskInput,
  TaskStatus,
} from '../shared-types';

// Import utility functions from existing utils
import {
  DEFAULT_PROJECT_START,
  includeOrphanTasks,
  calculateProjectEndDate as utilsCalculateProjectEndDate,
} from './forward-pass-utils';

/**
 * Forward pass computation result
 */
interface ForwardPassResult {
  tasks: ScheduledTask[];
  projectStartDate: string;
  projectEndDate: string;
}

/**
 * Forward pass configuration options
 */
interface ForwardPassOptions {
  projectStartDate?: string;
  calendarId?: string;
  validateCycles?: boolean;
}

/**
 * CPM Forward Pass Calculator - Refactored
 *
 * Implements the Critical Path Method forward pass algorithm to compute
 * early start and early finish dates for all tasks in the project.
 * Uses existing utility functions for consistency.
 */
export class ForwardPassCalculator {
  private workingDaysCalculator: WorkingDaysCalculator;

  constructor() {
    this.workingDaysCalculator = new WorkingDaysCalculator();
  }

  /**
   * Compute forward pass for all tasks
   *
   * @param tasks - Array of task inputs
   * @param links - Array of logic links between tasks
   * @param options - Forward pass configuration options
   * @returns Forward pass computation results
   */
  public computeForwardPass(
    tasks: TaskInput[],
    links: LogicLink[],
    options: ForwardPassOptions = {}
  ): ForwardPassResult {
    const { projectStartDate = DEFAULT_PROJECT_START, validateCycles = true } =
      options;

    // Step 1: Validate for circular dependencies
    if (validateCycles) {
      this.validateNoCycles(links);
    }

    // Step 2: Get topological order for safe processing
    const taskIds = tasks.map((task) => task.id);
    const processOrder = DependencyDetector.getTopologicalOrder(links);

    // Include tasks without dependencies
    const allTaskIds = includeOrphanTasks(taskIds, processOrder);

    // Step 3: Initialize scheduled tasks
    const scheduledTasks = this.initializeScheduledTasks(
      tasks,
      projectStartDate
    );
    const taskMap = new Map(scheduledTasks.map((task) => [task.id, task]));

    // Step 4: Process tasks in dependency order
    for (const taskId of allTaskIds) {
      const task = taskMap.get(taskId);
      if (!task) continue;

      this.computeTaskEarlyDates(task, links, taskMap);
    }

    // Step 5: Determine project end date
    const projectEndDate = utilsCalculateProjectEndDate(
      Array.from(taskMap.values())
    );

    return {
      tasks: Array.from(taskMap.values()),
      projectStartDate,
      projectEndDate,
    };
  }

  /**
   * Initialize scheduled tasks with default values
   */
  private initializeScheduledTasks(
    tasks: TaskInput[],
    projectStartDate: string
  ): ScheduledTask[] {
    return tasks.map((task) => ({
      ...task,
      earlyStart: projectStartDate,
      earlyFinish: projectStartDate,
      lateStart: projectStartDate,
      lateFinish: projectStartDate,
      totalFloat: 0,
      freeFloat: 0,
      isCritical: false,
      status: TaskStatus.NOT_STARTED,
    }));
  }

  /**
   * Validate that there are no circular dependencies
   */
  private validateNoCycles(links: LogicLink[]): void {
    // Create a test link to check if the entire set has cycles
    // We can test by checking if any link creates a cycle with the rest
    for (const link of links) {
      const otherLinks = links.filter((l) => l !== link);
      if (DependencyDetector.checkCircularDependency(otherLinks, link)) {
        throw new Error('Circular dependency detected in task relationships');
      }
    }
  }

  /**
   * Compute early start and early finish dates for a single task
   */
  private computeTaskEarlyDates(
    task: ScheduledTask,
    links: LogicLink[],
    taskMap: Map<string, ScheduledTask>
  ): void {
    // Find the latest constraint from predecessors
    const latestEarlyStart = this.findLatestPredecessorConstraint(
      task,
      links,
      taskMap
    );

    // Update task early start
    task.earlyStart = latestEarlyStart;

    // Calculate early finish based on duration
    task.earlyFinish = this.workingDaysCalculator.addWorkingDays(
      task.earlyStart,
      task.duration
    );
  }

  /**
   * Find the latest early finish from all predecessor tasks
   */
  private findLatestPredecessorConstraint(
    task: ScheduledTask,
    links: LogicLink[],
    taskMap: Map<string, ScheduledTask>
  ): string {
    let latestDate = task.earlyStart;

    // Find all links where this task is the successor
    const predecessorLinks = links.filter((link) => link.to === task.id);

    for (const link of predecessorLinks) {
      const predecessor = taskMap.get(link.from);
      if (!predecessor) continue;

      // Calculate constraint date based on logic type
      let constraintDate = predecessor.earlyFinish;

      switch (link.type) {
        case 'FS': // Finish-to-Start
          constraintDate = this.workingDaysCalculator.addWorkingDays(
            predecessor.earlyFinish,
            link.lag || 0
          );
          break;
        case 'SS': // Start-to-Start
          constraintDate = this.workingDaysCalculator.addWorkingDays(
            predecessor.earlyStart,
            link.lag || 0
          );
          break;
        case 'FF': // Finish-to-Finish
          constraintDate = this.workingDaysCalculator.addWorkingDays(
            predecessor.earlyFinish,
            (link.lag || 0) - task.duration
          );
          break;
        case 'SF': // Start-to-Finish
          constraintDate = this.workingDaysCalculator.addWorkingDays(
            predecessor.earlyStart,
            (link.lag || 0) - task.duration
          );
          break;
      }

      // Take the latest constraint
      if (new Date(constraintDate) > new Date(latestDate)) {
        latestDate = constraintDate;
      }
    }

    return latestDate;
  }
}

/**
 * Utility function for computing forward pass
 *
 * @param tasks - Array of task inputs
 * @param links - Array of logic links
 * @param projectStartDate - Project start date (ISO string)
 * @returns Array of scheduled tasks with early dates computed
 */
export function computeForwardPass(
  tasks: TaskInput[],
  links: LogicLink[],
  projectStartDate?: string
): ScheduledTask[] {
  const calculator = new ForwardPassCalculator();
  const result = calculator.computeForwardPass(tasks, links, {
    projectStartDate,
  });
  return result.tasks;
}
