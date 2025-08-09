/**
 * Module 5.3: Backward Pass Processor
 *
 * Handles the step-by-step backward pass processing logic
 */

import { WorkingDaysCalculator } from '@/models/schedule/workingDays.util';
import { LogicLink } from '@/modules/module5/shared-types';
import { DateUtils } from '@/services/DateUtils';
import { GraphUtils } from '@/services/GraphUtils';
import { EnhancedScheduledTask } from '@/types/schedule/backward-pass.types';

export class BackwardPassEngine {
  private dateUtils: DateUtils;
  private graphUtils: GraphUtils;
  private workingDaysCalculator: WorkingDaysCalculator;

  constructor(workingDaysCalculator?: WorkingDaysCalculator) {
    this.workingDaysCalculator =
      workingDaysCalculator || new WorkingDaysCalculator();
    this.dateUtils = new DateUtils(this.workingDaysCalculator);
    this.graphUtils = new GraphUtils();
  }

  /**
   * Process backward pass calculations
   */
  processBackwardPass(
    tasks: EnhancedScheduledTask[],
    _links: LogicLink[],
    projectEndDate: string
  ): {
    processedTasks: EnhancedScheduledTask[];
    criticalPath: string[];
  } {
    // Initialize late dates with project end date
    const processedTasks = this.initializeLateStartFinish(
      tasks,
      projectEndDate
    );

    // Calculate late dates working backwards
    const tasksWithLateDates = this.calculateTaskLateDates(processedTasks);

    // Calculate float values
    const tasksWithFloat = this.calculateFloatValues(tasksWithLateDates);

    // Identify critical path
    const criticalPath = this.identifyCriticalPath(tasksWithFloat);

    return {
      processedTasks: tasksWithFloat,
      criticalPath,
    };
  }

  private initializeLateStartFinish(
    tasks: EnhancedScheduledTask[],
    projectEndDate: string
  ): EnhancedScheduledTask[] {
    return tasks.map((task) => ({
      ...task,
      lateFinish: task.lateFinish || projectEndDate,
      lateStart: task.lateStart || projectEndDate,
    }));
  }

  private calculateTaskLateDates(
    tasks: EnhancedScheduledTask[]
  ): EnhancedScheduledTask[] {
    // Simplified implementation - in real scenario would implement full CPM logic
    return tasks.map((task) => {
      if (!task.lateStart && task.lateFinish && task.duration) {
        const lateStart = this.workingDaysCalculator.subtractWorkingDays(
          task.lateFinish,
          task.duration
        );
        return {
          ...task,
          lateStart: lateStart,
        };
      }
      return task;
    });
  }

  private calculateFloatValues(
    tasks: EnhancedScheduledTask[]
  ): EnhancedScheduledTask[] {
    return tasks.map((task) => {
      const totalFloat = this.calculateTotalFloat(task);
      const freeFloat = this.calculateFreeFloat(task);

      return {
        ...task,
        totalFloat,
        freeFloat,
        isCritical: totalFloat <= 0.001, // Epsilon comparison
      };
    });
  }

  private calculateTotalFloat(task: EnhancedScheduledTask): number {
    if (!task.earlyStart || !task.lateStart) return 0;

    const earlyStartDate = new Date(task.earlyStart);
    const lateStartDate = new Date(task.lateStart);

    // Simple date difference in days - would use working days calculator in real implementation
    const diffTime = lateStartDate.getTime() - earlyStartDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return Math.max(0, diffDays);
  }

  private calculateFreeFloat(task: EnhancedScheduledTask): number {
    // Simplified - would need successor information for accurate calculation
    return Math.min(this.calculateTotalFloat(task), 0);
  }

  private identifyCriticalPath(tasks: EnhancedScheduledTask[]): string[] {
    return tasks
      .filter((task) => task.isCritical)
      .map((task) => task.id)
      .sort();
  }
}
