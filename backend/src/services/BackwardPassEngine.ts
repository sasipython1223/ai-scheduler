/**
 * Module 5.3: Backward Pass Engine
 *
 * Handles the step-by-step backward pass processing logic
 */

import { WorkingDaysCalculator } from '../models/schedule/workingDays.util';
import { LogicLink } from '../types/schedule';
import { EnhancedScheduledTask } from '../types/schedule/backward-pass.types';
import { calculateConstrainedDates } from './cpm-constraint-calculations';
import { DateUtils } from './DateUtils';
import { GraphUtils } from './GraphUtils';

export class BackwardPassEngine {
  private dateUtils: DateUtils;
  private workingDaysCalculator: WorkingDaysCalculator;

  constructor(workingDaysCalculator: WorkingDaysCalculator) {
    this.workingDaysCalculator = workingDaysCalculator;
    this.dateUtils = new DateUtils(workingDaysCalculator);
  }

  /**
   * Perform backward pass calculation to determine late dates
   */
  public performBackwardPass(
    tasks: EnhancedScheduledTask[],
    successorMap: Map<string, LogicLink[]>,
    projectEndDate: string,
    skipValidation: boolean = false
  ): void {
    // Create task lookup map
    const taskMap = new Map(tasks.map((task) => [task.id, task]));

    // Initialize terminal tasks (tasks with no successors)
    this.initializeTerminalTasks(tasks, successorMap, projectEndDate);

    // Get tasks in topological order (forward dependency order)
    const forwardOrder = GraphUtils.getTopologicalOrder(
      tasks,
      successorMap,
      skipValidation
    );

    // For backward pass, we need the reverse of forward order
    const processingOrder = [...forwardOrder].reverse();

    // Process tasks in multiple iterations until all late dates are calculated
    // This handles cases where dependencies create processing order conflicts
    let maxIterations = tasks.length;
    let currentIteration = 0;
    let tasksProcessed = 0;

    do {
      tasksProcessed = 0;
      currentIteration++;

      for (const taskId of processingOrder) {
        const task = taskMap.get(taskId);
        if (!task) {
          continue;
        }

        if (task.lateFinish) {
          continue; // Skip if already processed
        }

        this.calculateTaskLateDates(task, successorMap, taskMap);

        if (task.lateFinish) {
          tasksProcessed++;
        }
      }
    } while (tasksProcessed > 0 && currentIteration < maxIterations);
  }

  /**
   * Initialize late dates for terminal tasks (no successors)
   */
  private initializeTerminalTasks(
    tasks: EnhancedScheduledTask[],
    successorMap: Map<string, LogicLink[]>,
    projectEndDate: string
  ): void {
    for (const task of tasks) {
      const hasSuccessors =
        successorMap.has(task.id) && successorMap.get(task.id)!.length > 0;

      if (!hasSuccessors) {
        // Terminal task: late finish = project end date
        task.lateFinish = projectEndDate;

        // Calculate late start from late finish
        if (task.duration === 0) {
          // Milestone: late start = late finish
          task.lateStart = task.lateFinish;
        } else {
          // Regular task: late start = late finish - duration working days
          // Use custom subtraction to avoid timezone issues in working days calculator
          task.lateStart = this.dateUtils.subtractWorkingDaysFixed(
            task.lateFinish,
            task.duration
          );
        }
      }
    }

    // Special handling for tasks that should be driven by project end
    // even if they have successors (like in SS relationships where the
    // predecessor might be the critical path driver)
    this.handleProjectDriverTasks(tasks, successorMap, projectEndDate);
  }

  /**
   * Handle tasks that should be driven by project end date
   * even if they have successors
   */
  private handleProjectDriverTasks(
    tasks: EnhancedScheduledTask[],
    successorMap: Map<string, LogicLink[]>,
    projectEndDate: string
  ): void {
    for (const task of tasks) {
      if (task.lateFinish) {
        continue; // Already processed as terminal
      }

      const successorLinks = successorMap.get(task.id) || [];

      // Check if all successors are SS relationships
      const hasOnlySSSuccessors =
        successorLinks.length > 0 &&
        successorLinks.every((link) => link.type === 'SS');

      if (hasOnlySSSuccessors) {
        // For SS-only relationships, the predecessor might be the project driver
        // Check if this task's early finish aligns with project end
        if (task.earlyFinish === projectEndDate) {
          task.lateFinish = projectEndDate;

          if (task.duration === 0) {
            task.lateStart = task.lateFinish;
          } else {
            task.lateStart = this.dateUtils.subtractWorkingDaysFixed(
              task.lateFinish,
              task.duration
            );
          }
        }
      }
    }
  }

  /**
   * Calculate late dates for a specific task based on its successors
   */
  private calculateTaskLateDates(
    task: EnhancedScheduledTask,
    successorMap: Map<string, LogicLink[]>,
    taskMap: Map<string, EnhancedScheduledTask>
  ): void {
    const successorLinks = successorMap.get(task.id) || [];
    let earliestLateFinish: string | null = null;
    let earliestLateStart: string | null = null;

    // Process each successor relationship
    for (const link of successorLinks) {
      const successor = taskMap.get(link.to);
      if (!successor || !successor.lateStart || !successor.lateFinish) {
        continue; // Skip if successor not processed yet
      }

      const { constrainedLateStart, constrainedLateFinish } =
        calculateConstrainedDates(
          link,
          successor,
          task,
          this.workingDaysCalculator,
          this.dateUtils.subtractWorkingDaysFixed.bind(this.dateUtils)
        );

      // Take the earliest (most constraining) late dates
      if (
        !earliestLateFinish ||
        DateUtils.isEarlierDate(constrainedLateFinish, earliestLateFinish)
      ) {
        earliestLateFinish = constrainedLateFinish;
      }

      if (
        !earliestLateStart ||
        DateUtils.isEarlierDate(constrainedLateStart, earliestLateStart)
      ) {
        earliestLateStart = constrainedLateStart;
      }
    }

    // Set the most constraining late dates
    if (earliestLateFinish) {
      task.lateFinish = earliestLateFinish;
    }

    if (earliestLateStart) {
      task.lateStart = earliestLateStart;
    } else if (task.lateFinish) {
      // Calculate late start from late finish if not directly constrained
      if (task.duration === 0) {
        task.lateStart = task.lateFinish;
      } else {
        task.lateStart = this.dateUtils.subtractWorkingDaysFixed(
          task.lateFinish,
          task.duration
        );
      }
    }
  }
}
