/**
 * Module 6.3: Constraint Propagator Implementation
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Constraint propagation and schedule recalculation logic
 * Dependencies: shared-types.ts
 */

import { ITaskForValidation } from '../shared-types.js';

/**
 * Propagation options
 */
export interface PropagationOptions {
  propagateForward?: boolean;
  propagateBackward?: boolean;
  respectDependencies?: boolean;
  maintainCriticalPath?: boolean;
}

/**
 * Propagation result
 */
export interface PropagationResult {
  success: boolean;
  affectedTasks: string[];
  propagationChain: Array<{
    taskId: string;
    reason: string;
    changeType: 'DATE' | 'DURATION' | 'DEPENDENCY';
  }>;
  warnings: string[];
}

/**
 * Constraint propagator class
 */
export class ConstraintPropagator {
  private options: PropagationOptions;

  constructor(options: PropagationOptions = {}) {
    this.options = {
      propagateForward: true,
      propagateBackward: true,
      respectDependencies: true,
      maintainCriticalPath: true,
      ...options,
    };
  }

  /**
   * Propagate constraint changes through schedule
   */
  public propagateConstraintChanges(
    tasks: ITaskForValidation[],
    changedTaskId: string,
    changeType: 'DATE' | 'DURATION' | 'DEPENDENCY'
  ): PropagationResult {
    const affectedTasks: string[] = [changedTaskId];
    const propagationChain: PropagationResult['propagationChain'] = [];
    const warnings: string[] = [];

    try {
      // Find tasks that might be affected by this change
      const dependentTasks = this.findDependentTasks(tasks, changedTaskId);

      if (this.options.propagateForward) {
        const forwardAffected = this.propagateForward(
          tasks,
          changedTaskId,
          dependentTasks
        );
        affectedTasks.push(...forwardAffected);
        propagationChain.push({
          taskId: changedTaskId,
          reason: 'Forward propagation',
          changeType,
        });
      }

      if (this.options.propagateBackward) {
        const backwardAffected = this.propagateBackward(tasks, changedTaskId);
        affectedTasks.push(...backwardAffected);
        propagationChain.push({
          taskId: changedTaskId,
          reason: 'Backward propagation',
          changeType,
        });
      }

      return {
        success: true,
        affectedTasks: Array.from(new Set(affectedTasks)), // Remove duplicates
        propagationChain,
        warnings,
      };
    } catch (error) {
      return {
        success: false,
        affectedTasks: [changedTaskId],
        propagationChain,
        warnings: [
          `Propagation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  /**
   * Calculate propagation impact
   */
  public calculatePropagationImpact(
    tasks: ITaskForValidation[],
    proposedChanges: Array<{
      taskId: string;
      field: string;
      newValue: string | number | Date;
    }>
  ): PropagationResult {
    const allAffectedTasks: string[] = [];
    const allPropagationChains: PropagationResult['propagationChain'] = [];
    const allWarnings: string[] = [];

    for (const change of proposedChanges) {
      const changeType = this.inferChangeType(change.field);
      const result = this.propagateConstraintChanges(
        tasks,
        change.taskId,
        changeType
      );

      allAffectedTasks.push(...result.affectedTasks);
      allPropagationChains.push(...result.propagationChain);
      allWarnings.push(...result.warnings);
    }

    return {
      success: allWarnings.length === 0,
      affectedTasks: Array.from(new Set(allAffectedTasks)),
      propagationChain: allPropagationChains,
      warnings: allWarnings,
    };
  }

  /**
   * Update propagation options
   */
  public updateOptions(newOptions: Partial<PropagationOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  // Private helper methods

  private findDependentTasks(
    tasks: ITaskForValidation[],
    taskId: string
  ): ITaskForValidation[] {
    return tasks.filter((task) =>
      task.dependencies?.some((dep) => dep.predecessorId === taskId)
    );
  }

  private propagateForward(
    tasks: ITaskForValidation[],
    changedTaskId: string,
    dependentTasks: ITaskForValidation[]
  ): string[] {
    // Placeholder implementation for forward propagation
    return dependentTasks.map((task) => task.id);
  }

  private propagateBackward(
    tasks: ITaskForValidation[],
    changedTaskId: string
  ): string[] {
    // Placeholder implementation for backward propagation
    const task = tasks.find((t) => t.id === changedTaskId);
    if (!task?.dependencies) return [];

    return task.dependencies.map((dep) => dep.predecessorId);
  }

  private inferChangeType(field: string): 'DATE' | 'DURATION' | 'DEPENDENCY' {
    if (field.includes('Date')) return 'DATE';
    if (field.includes('duration')) return 'DURATION';
    if (field.includes('dependency')) return 'DEPENDENCY';
    return 'DATE'; // Default
  }
}
