/**
 * Schedule Engine Model
 * AI Scheduler - Module 5.1: Schedule Calculation Engine
 *
 * Core schedule calculation engine with CPM algorithms
 */

import {
  ScheduledTask,
  TaskInput,
  TaskStatus,
} from '../../types/scheduleTypes';
import {
  WorkingDaysCalculator,
  createWorkingDaysCalculator,
} from './workingDays.util';

/**
 * Schedule calculation engine with validation and utility methods
 */
export class ScheduleEngine {
  private workingDaysCalculator: WorkingDaysCalculator;

  constructor(
    workingDaysConfig?: Parameters<typeof createWorkingDaysCalculator>[0]
  ) {
    this.workingDaysCalculator = createWorkingDaysCalculator(workingDaysConfig);
  }

  /**
   * Convert TaskInput to ScheduledTask with default values
   */
  public createScheduledTask(input: TaskInput): ScheduledTask {
    const now = new Date().toISOString();

    return {
      ...input,
      earlyStart: input.start || now,
      earlyFinish: input.finish || now,
      lateStart: now,
      lateFinish: now,
      totalFloat: 0,
      freeFloat: 0,
      isCritical: false,
      status: TaskStatus.NOT_STARTED,
      percentComplete: 0,
    };
  }

  /**
   * Calculate early start date based on predecessors
   */
  public calculateEarlyStart(
    task: TaskInput,
    predecessorTasks: ScheduledTask[]
  ): string {
    if (!task.predecessors?.length || !predecessorTasks.length) {
      return task.start || new Date().toISOString();
    }

    // Find the latest early finish from predecessors
    let latestFinish = new Date(task.start || new Date().toISOString());

    for (const predId of task.predecessors) {
      const predTask = predecessorTasks.find((t) => t.id === predId);
      if (predTask) {
        const predFinish = new Date(predTask.earlyFinish);
        if (predFinish > latestFinish) {
          latestFinish = predFinish;
        }
      }
    }

    return latestFinish.toISOString();
  }

  /**
   * Calculate early finish date from early start and duration
   */
  public calculateEarlyFinish(earlyStart: string, duration: number): string {
    return this.workingDaysCalculator.addWorkingDays(earlyStart, duration);
  }

  /**
   * Calculate late finish date based on successors
   */
  public calculateLateFinish(
    task: TaskInput,
    successorTasks: ScheduledTask[]
  ): string {
    if (!successorTasks.length) {
      // If no successors, late finish equals early finish
      const earlyStart = this.calculateEarlyStart(task, []);
      return this.calculateEarlyFinish(earlyStart, task.duration);
    }

    // Find the earliest late start from successors
    let earliestStart = new Date('2099-12-31'); // Far future date

    for (const succTask of successorTasks) {
      const succStart = new Date(succTask.lateStart);
      if (succStart < earliestStart) {
        earliestStart = succStart;
      }
    }

    return earliestStart.toISOString();
  }

  /**
   * Calculate late start date from late finish and duration
   */
  public calculateLateStart(lateFinish: string, duration: number): string {
    return this.workingDaysCalculator.subtractWorkingDays(lateFinish, duration);
  }

  /**
   * Calculate total float (slack) for a task
   */
  public calculateTotalFloat(earlyStart: string, lateStart: string): number {
    return this.workingDaysCalculator.calculateWorkingDays(
      earlyStart,
      lateStart
    );
  }

  /**
   * Calculate free float for a task
   */
  public calculateFreeFloat(
    earlyFinish: string,
    successorEarlyStarts: string[]
  ): number {
    if (!successorEarlyStarts.length) return 0;

    const earliestSuccStart = successorEarlyStarts.reduce(
      (earliest, current) => {
        return new Date(current) < new Date(earliest) ? current : earliest;
      }
    );

    return this.workingDaysCalculator.calculateWorkingDays(
      earlyFinish,
      earliestSuccStart
    );
  }

  /**
   * Determine if task is critical (zero total float)
   */
  public isCriticalTask(totalFloat: number): boolean {
    return totalFloat === 0;
  }

  /**
   * Calculate task status based on dates and progress
   */
  public calculateTaskStatus(
    task: ScheduledTask,
    currentDate: string = new Date().toISOString()
  ): TaskStatus {
    const current = new Date(currentDate);
    const earlyStart = new Date(task.earlyStart);
    const earlyFinish = new Date(task.earlyFinish);

    if ((task.percentComplete || 0) === 100) {
      return TaskStatus.COMPLETED;
    }

    if (current < earlyStart) {
      return TaskStatus.NOT_STARTED;
    }

    if (current >= earlyStart && current <= earlyFinish) {
      return TaskStatus.IN_PROGRESS;
    }

    if (current > earlyFinish && (task.percentComplete || 0) < 100) {
      return TaskStatus.PAUSED; // Using PAUSED to indicate behind schedule
    }

    return TaskStatus.NOT_STARTED;
  }

  /**
   * Update task with calculated schedule values
   */
  public updateTaskSchedule(
    task: TaskInput,
    earlyStart: string,
    earlyFinish: string,
    lateStart: string,
    lateFinish: string,
    totalFloat: number,
    freeFloat: number
  ): ScheduledTask {
    const scheduledTask = this.createScheduledTask(task);

    scheduledTask.earlyStart = earlyStart;
    scheduledTask.earlyFinish = earlyFinish;
    scheduledTask.lateStart = lateStart;
    scheduledTask.lateFinish = lateFinish;
    scheduledTask.totalFloat = totalFloat;
    scheduledTask.freeFloat = freeFloat;
    scheduledTask.isCritical = this.isCriticalTask(totalFloat);
    scheduledTask.status = this.calculateTaskStatus(scheduledTask);

    return scheduledTask;
  }

  /**
   * Get working days calculator
   */
  public getWorkingDaysCalculator(): WorkingDaysCalculator {
    return this.workingDaysCalculator;
  }
}

/**
 * Factory functions for schedule engine
 */

/**
 * Create schedule engine with default configuration
 */
export function createScheduleEngine(): ScheduleEngine {
  return new ScheduleEngine();
}

/**
 * Create schedule engine with custom working days configuration
 */
export function createScheduleEngineWithConfig(
  workingDaysConfig: Parameters<typeof createWorkingDaysCalculator>[0]
): ScheduleEngine {
  return new ScheduleEngine(workingDaysConfig);
}
