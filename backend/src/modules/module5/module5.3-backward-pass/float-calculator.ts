/**
 * Module 5.3: Float Calculation Utilities
 *
 * Handles all float computation responsibilities for CPM backward pass
 */

import { WorkingDaysCalculator } from '@/models/schedule/workingDays.util';
import { LogicLink } from '@/modules/module5/shared-types';
import { EnhancedScheduledTask } from '@/types/schedule/backward-pass.types';

export class FloatCalculator {
  private workingDaysCalculator: WorkingDaysCalculator;

  constructor(workingDaysCalculator: WorkingDaysCalculator) {
    this.workingDaysCalculator = workingDaysCalculator;
  }

  /**
   * Calculate total and free float for all tasks
   */
  public calculateFloatValues(
    tasks: EnhancedScheduledTask[],
    successorMap: Map<string, LogicLink[]>,
    calculateWorkingDaysDifference: (
      startDate: string,
      endDate: string
    ) => number
  ): void {
    const taskMap = new Map(tasks.map((task) => [task.id, task]));

    for (const task of tasks) {
      if (
        !task.earlyStart ||
        !task.lateStart ||
        !task.earlyFinish ||
        !task.lateFinish
      ) {
        continue;
      }

      // Calculate Total Float: Late Start - Early Start (difference in working days)
      task.totalFloat = calculateWorkingDaysDifference(
        task.earlyStart,
        task.lateStart
      );

      // Calculate Free Float: minimum slack to successors
      task.freeFloat = this.calculateFreeFloat(task, successorMap, taskMap);

      // Mark as critical if total float is zero or negative (behind schedule)
      // Use small epsilon to handle floating point precision issues
      task.isCritical = task.totalFloat <= 0.001;
    }
  }

  /**
   * Calculate free float for a task
   */
  private calculateFreeFloat(
    task: EnhancedScheduledTask,
    successorMap: Map<string, LogicLink[]>,
    taskMap: Map<string, EnhancedScheduledTask>
  ): number {
    const successorLinks = successorMap.get(task.id) || [];

    if (successorLinks.length === 0) {
      // Terminal task: free float = total float
      return task.totalFloat || 0;
    }

    let minFreeFloat = Infinity;

    for (const link of successorLinks) {
      const successor = taskMap.get(link.to);
      if (!successor || !successor.earlyStart) {
        continue;
      }

      const availableFloat = this.calculateAvailableFloat(
        task,
        link,
        successor
      );
      minFreeFloat = Math.min(minFreeFloat, availableFloat);
    }

    return minFreeFloat === Infinity ? 0 : Math.max(0, minFreeFloat);
  }

  /**
   * Calculate available float between predecessor and successor
   */
  private calculateAvailableFloat(
    predecessor: EnhancedScheduledTask,
    link: LogicLink,
    successor: EnhancedScheduledTask
  ): number {
    if (!predecessor.earlyFinish || !successor.earlyStart) {
      return 0;
    }

    const lag = link.lag || 0;

    switch (link.type) {
      case 'FS':
        return this.calculateFinishToStartFloat(predecessor, successor, lag);
      case 'SS':
        return this.calculateStartToStartFloat(predecessor, successor, lag);
      case 'FF':
        return this.calculateFinishToFinishFloat(predecessor, successor, lag);
      case 'SF':
        return this.calculateStartToFinishFloat(predecessor, successor, lag);
      default:
        return 0;
    }
  }

  private calculateFinishToStartFloat(
    predecessor: EnhancedScheduledTask,
    successor: EnhancedScheduledTask,
    lag: number
  ): number {
    const requiredDate = this.workingDaysCalculator.addWorkingDays(
      predecessor.earlyFinish!,
      lag + 1
    );
    return this.workingDaysCalculator.calculateWorkingDays(
      requiredDate,
      successor.earlyStart!
    );
  }

  private calculateStartToStartFloat(
    predecessor: EnhancedScheduledTask,
    successor: EnhancedScheduledTask,
    lag: number
  ): number {
    const requiredDate = this.workingDaysCalculator.addWorkingDays(
      predecessor.earlyStart!,
      lag
    );
    return this.workingDaysCalculator.calculateWorkingDays(
      requiredDate,
      successor.earlyStart!
    );
  }

  private calculateFinishToFinishFloat(
    predecessor: EnhancedScheduledTask,
    successor: EnhancedScheduledTask,
    lag: number
  ): number {
    const requiredDate = this.workingDaysCalculator.addWorkingDays(
      predecessor.earlyFinish!,
      lag
    );
    return this.workingDaysCalculator.calculateWorkingDays(
      requiredDate,
      successor.earlyFinish!
    );
  }

  private calculateStartToFinishFloat(
    predecessor: EnhancedScheduledTask,
    successor: EnhancedScheduledTask,
    lag: number
  ): number {
    const requiredDate = this.workingDaysCalculator.addWorkingDays(
      predecessor.earlyStart!,
      lag
    );
    return this.workingDaysCalculator.calculateWorkingDays(
      requiredDate,
      successor.earlyFinish!
    );
  }
}
