/**
 * Module 5.3: CPM Backward Pass Implementation
 *
 * Implements the Critical Path Method Backward Pass algorithm to calculate:
 * - Late Start dates for all tasks
 * - Late Finish dates for all tasks
 * - Total Float (schedule flexibility)
 * - Free Float (independent task flexibility)
 * - Critical Path identification
 *
 * Supports all PMI-standard logic types: FS, SS, FF, SF with lag values
 */

import { WorkingDaysCalculator } from '../models/schedule/workingDays.util';
import { LogicLink, ScheduledTask } from '../types/schedule';
import {
  BackwardPassOptions,
  BackwardPassResult,
  EnhancedScheduledTask,
} from '../types/schedule/backward-pass.types';
import { BackwardPassEngine } from './BackwardPassEngine';
import { DateUtils } from './DateUtils';
import { FloatCalculator } from './FloatCalculator';
import { GraphUtils } from './GraphUtils';

/**
 * Module 5.3: CPM Backward Pass Implementation
 *
 * Implements the Critical Path Method Backward Pass algorithm to calculate:
 * - Late Start dates for all tasks
 * - Late Finish dates for all tasks
 * - Total Float (schedule flexibility)
 * - Free Float (independent task flexibility)
 * - Critical Path identification
 *
 * Supports all PMI-standard logic types: FS, SS, FF, SF with lag values
 */

/**
 * CPM Backward Pass Service
 *
 * Orchestrates the backward pass calculation using modular components
 */
export class CPMBackwardPassService {
  private workingDaysCalculator: WorkingDaysCalculator;
  private dateUtils: DateUtils;
  private floatCalculator: FloatCalculator;
  private backwardPassEngine: BackwardPassEngine;

  constructor(_calendarId?: string) {
    this.workingDaysCalculator = new WorkingDaysCalculator();
    this.dateUtils = new DateUtils(this.workingDaysCalculator);
    this.floatCalculator = new FloatCalculator(this.workingDaysCalculator);
    this.backwardPassEngine = new BackwardPassEngine(
      this.workingDaysCalculator
    );
  }

  /**
   * Main backward pass calculation method
   *
   * @param tasks - Tasks with early dates from forward pass
   * @param links - Logic links between tasks
   * @param projectEndDate - Project completion date from forward pass
   * @param options - Calculation options
   * @returns Complete backward pass analysis
   */
  public calculateBackwardPass(
    tasks: ScheduledTask[],
    links: LogicLink[],
    projectEndDate: string,
    options: BackwardPassOptions = {}
  ): BackwardPassResult {
    // Validate inputs unless skipped
    if (!options.skipValidation) {
      this.validateInputs(tasks, links, projectEndDate);
    }

    // Initialize enhanced tasks with forward pass data
    const enhancedTasks = this.initializeEnhancedTasks(tasks);

    // Build successor relationships for backward processing
    const successorMap = GraphUtils.buildSuccessorMap(links);

    // Calculate late dates using backward pass algorithm
    this.backwardPassEngine.performBackwardPass(
      enhancedTasks,
      successorMap,
      projectEndDate,
      options.skipValidation || false
    );

    // Calculate float values
    this.floatCalculator.calculateFloatValues(
      enhancedTasks,
      successorMap,
      this.dateUtils.calculateWorkingDaysDifference.bind(this.dateUtils)
    );

    // Identify critical path
    const criticalPath = this.identifyCriticalPath(enhancedTasks);

    // Build result maps
    const totalFloat = this.buildFloatMap(enhancedTasks, 'totalFloat');
    const freeFloat = this.buildFloatMap(enhancedTasks, 'freeFloat');

    return {
      tasks: enhancedTasks,
      projectEndDate,
      criticalPath,
      totalFloat,
      freeFloat,
      criticalPathLength: criticalPath.length,
    };
  }

  /**
   * Validate inputs for backward pass calculation
   */
  private validateInputs(
    tasks: ScheduledTask[],
    links: LogicLink[],
    projectEndDate: string
  ): void {
    if (!tasks || tasks.length === 0) {
      throw new Error(
        'Tasks array cannot be empty for backward pass calculation'
      );
    }

    if (!projectEndDate || !DateUtils.isValidISODate(projectEndDate)) {
      throw new Error('Invalid project end date provided');
    }

    // Verify all tasks have early dates from forward pass
    for (const task of tasks) {
      if (!task.earlyStart || !task.earlyFinish) {
        throw new Error(
          `Task ${task.id} missing early dates from forward pass`
        );
      }
    }

    // Detect circular dependencies
    if (GraphUtils.hasCircularDependencies(tasks, links)) {
      throw new Error('Circular dependency detected in project network');
    }
  }

  /**
   * Initialize enhanced tasks with forward pass data
   */
  private initializeEnhancedTasks(
    tasks: ScheduledTask[]
  ): EnhancedScheduledTask[] {
    return tasks.map((task) => ({
      ...task,
      // Late dates will be calculated during backward pass
      // Float values will be calculated after late dates
      totalFloat: 0,
      freeFloat: 0,
      isCritical: false,
    }));
  }

  /**
   * Identify critical path (sequence of tasks with zero total float)
   */
  private identifyCriticalPath(tasks: EnhancedScheduledTask[]): string[] {
    // Find all critical tasks (zero or negative float)
    const criticalTasks = tasks.filter((task) => task.isCritical);

    if (criticalTasks.length === 0) {
      return [];
    }

    // If all tasks are critical (like in linear chains), return full sequence
    if (criticalTasks.length === tasks.length) {
      return criticalTasks
        .sort((a, b) => {
          if (!a.earlyStart || !b.earlyStart) return 0;
          return (
            new Date(a.earlyStart).getTime() - new Date(b.earlyStart).getTime()
          );
        })
        .map((task) => task.id);
    }

    // For complex networks, find the longest path through critical tasks
    // For now, sort critical tasks by early start date to get the sequence
    return criticalTasks
      .sort((a, b) => {
        if (!a.earlyStart || !b.earlyStart) return 0;
        return (
          new Date(a.earlyStart).getTime() - new Date(b.earlyStart).getTime()
        );
      })
      .map((task) => task.id);
  }

  /**
   * Build float value map for result
   */
  private buildFloatMap(
    tasks: EnhancedScheduledTask[],
    floatType: 'totalFloat' | 'freeFloat'
  ): Map<string, number> {
    const floatMap = new Map<string, number>();

    for (const task of tasks) {
      const floatValue = task[floatType] || 0;
      floatMap.set(task.id, floatValue);
    }

    return floatMap;
  }
}
