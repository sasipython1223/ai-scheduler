/**
 * CPM Forward Pass Service
 * AI Scheduler - Module 5.2: Forward Pass Logic for Schedule Engine
 *
 * Computes earlyStart and earlyFinish dates for each task using Critical Path Method (CPM)
 */

import { DependencyDetector } from '../models/schedule/dependency.util';
import { WorkingDaysCalculator } from '../models/schedule/workingDays.util';
import {
  LogicLink,
  LogicType,
  ScheduledTask,
  TaskInput,
  TaskStatus,
} from '../types/scheduleTypes';

/**
 * Project start date constant for forward pass calculations
 */
const DEFAULT_PROJECT_START = '2025-08-04T09:00:00.000Z'; // Monday

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
 * CPM Forward Pass Calculator
 *
 * Implements the Critical Path Method forward pass algorithm to compute
 * early start and early finish dates for all tasks in the project
 */
export class ForwardPassCalculator {
  private workingDaysCalc: WorkingDaysCalculator;

  constructor() {
    this.workingDaysCalc = new WorkingDaysCalculator();
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
    const allTaskIds = this.includeOrphanTasks(taskIds, processOrder);

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
    const projectEndDate = this.calculateProjectEndDate(scheduledTasks);

    return {
      tasks: Array.from(taskMap.values()),
      projectStartDate,
      projectEndDate,
    };
  }

  /**
   * Validate that no circular dependencies exist
   */
  private validateNoCycles(links: LogicLink[]): void {
    // Test each link to see if it would create a cycle
    for (const testLink of links) {
      const otherLinks = links.filter((link) => link.id !== testLink.id);
      const hasCycle = DependencyDetector.checkCircularDependency(
        otherLinks,
        testLink
      );

      if (hasCycle) {
        throw new Error(
          `Circular dependency detected involving link: ${testLink.from} → ${testLink.to}`
        );
      }
    }
  }

  /**
   * Include tasks that have no dependencies in processing order
   */
  private includeOrphanTasks(
    allTaskIds: string[],
    processOrder: string[]
  ): string[] {
    const orderedSet = new Set(processOrder);
    const orphanTasks = allTaskIds.filter((id) => !orderedSet.has(id));

    return [...orphanTasks, ...processOrder];
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
   * Compute early start and early finish for a single task
   */
  private computeTaskEarlyDates(
    task: ScheduledTask,
    links: LogicLink[],
    taskMap: Map<string, ScheduledTask>
  ): void {
    // Get all predecessor links for this task
    const predecessorLinks = links.filter((link) => link.to === task.id);

    if (predecessorLinks.length === 0) {
      // No predecessors - task can start at project start
      // earlyStart is already set to project start in initialization
      task.earlyFinish = this.calculateEarlyFinish(
        task.earlyStart,
        task.duration
      );
      return;
    }

    // Find the latest constraint from all predecessors
    const latestConstraint = this.findLatestPredecessorConstraint(
      predecessorLinks,
      taskMap
    );

    task.earlyStart = latestConstraint;
    task.earlyFinish = this.calculateEarlyFinish(
      task.earlyStart,
      task.duration
    );
  }

  /**
   * Find the latest constraint date from all predecessor tasks
   */
  private findLatestPredecessorConstraint(
    predecessorLinks: LogicLink[],
    taskMap: Map<string, ScheduledTask>
  ): string {
    let latestDate = '';

    for (const link of predecessorLinks) {
      const predecessorTask = taskMap.get(link.from);
      if (!predecessorTask) continue;

      const constraintDate = this.calculateConstraintDate(
        predecessorTask,
        link.type,
        link.lag || 0
      );

      if (!latestDate || new Date(constraintDate) > new Date(latestDate)) {
        latestDate = constraintDate;
      }
    }

    return latestDate;
  }

  /**
   * Calculate constraint date based on link type and lag
   */
  private calculateConstraintDate(
    predecessorTask: ScheduledTask,
    linkType: LogicType,
    lag: number
  ): string {
    let baseDate: string;

    switch (linkType) {
      case 'FS': // Finish-to-Start
        // Successor starts the day after predecessor finishes
        baseDate = this.workingDaysCalc.addWorkingDays(
          predecessorTask.earlyFinish,
          1
        );
        break;
      case 'SS': // Start-to-Start
        baseDate = predecessorTask.earlyStart;
        break;
      case 'FF': // Finish-to-Finish (used in backward pass)
        baseDate = predecessorTask.earlyFinish;
        break;
      case 'SF': // Start-to-Finish (rare)
        baseDate = predecessorTask.earlyStart;
        break;
      default:
        baseDate = this.workingDaysCalc.addWorkingDays(
          predecessorTask.earlyFinish,
          1
        );
    }

    // Apply additional lag (positive = delay, negative = overlap)
    if (lag !== 0) {
      return this.workingDaysCalc.addWorkingDays(baseDate, lag);
    }

    return baseDate;
  }

  /**
   * Calculate early finish date from early start and duration
   */
  private calculateEarlyFinish(earlyStart: string, duration: number): string {
    if (duration <= 0) {
      // Milestone task - same start and finish
      return earlyStart;
    }

    return this.workingDaysCalc.addWorkingDays(earlyStart, duration);
  }

  /**
   * Calculate overall project end date
   */
  private calculateProjectEndDate(tasks: ScheduledTask[]): string {
    if (tasks.length === 0) {
      return DEFAULT_PROJECT_START;
    }

    let latestFinish = '';

    for (const task of tasks) {
      if (
        !latestFinish ||
        new Date(task.earlyFinish) > new Date(latestFinish)
      ) {
        latestFinish = task.earlyFinish;
      }
    }

    return latestFinish;
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

/**
 * Utility function to get project end date from forward pass
 *
 * @param tasks - Array of task inputs
 * @param links - Array of logic links
 * @param projectStartDate - Project start date
 * @returns Project end date (ISO string)
 */
export function calculateProjectEndDate(
  tasks: TaskInput[],
  links: LogicLink[],
  projectStartDate?: string
): string {
  const calculator = new ForwardPassCalculator();
  const result = calculator.computeForwardPass(tasks, links, {
    projectStartDate,
  });
  return result.projectEndDate;
}
