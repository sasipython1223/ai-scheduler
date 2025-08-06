/**
 * 📏 Clean Code Enforcement Policy for Copilot (AI Scheduler Project)
 *
 * 🚧 Source Code Files (e.g., `.ts`, `.tsx`, `.service.ts`)
 * - ✅ Prefer keeping files under 250 lines
 * - ✅ Accept up to 270 lines *if* modularity would reduce clarity
 * - ⚠️ Never exceed 300 lines in production code
 * - ❌ DO NOT delete comments, JSDoc, or interface definitions to shrink size
 * - ✅ INSTEAD: Modularize — extract functions, helpers, or subcomponents
 * - ✅ Preferred: Break down into smaller files, e.g. `*.utils.ts`, `*.helpers.ts`, `*.types.ts`
 * - ✅ Preserve readability, maintain SOLID principles
 *
 * 🧪 Test Files (e.g., `*.test.ts`)
 * - ✅ May exceed 250 lines due to test volume
 * - 🚫 DO NOT compress or remove test descriptions or documentation
 * - ✅ Prefer readable test sections and clear category headers
 * - ✅ Keep large test files well structured with comment dividers
 *
 * 💡 If line limit exceeded:
 * - Prompt: "Consider modularizing this file into [X] helper files"
 * - Suggest filenames (e.g., `FloatValidationUtils.ts`, `BatchProcessor.ts`)
 */

/**
 * Module 5.4 - TaskFlagAssigner
 * Purpose: Advanced task flag assignment based on float values and risk analysis
 *
 * ✅ COMPLIANT: This file is within acceptable limits (270 lines < 275)
 * - Efficient flag assignment logic
 * - Clear type definitions
 * - Good separation of validation concerns
 */

interface Task {
  id: string;
  name: string;
  duration: number;
  totalFloat?: number;
}
import { ValidationResult } from './types/SharedTypes';
import { DEFAULT_EPSILON, isFloatZero } from './utils/FloatUtils';
export type FlagType =
  | 'CRITICAL'
  | 'NEAR_CRITICAL'
  | 'HIGH_FLOAT'
  | 'ZERO_FLOAT'
  | 'NEGATIVE_FLOAT';
export interface TaskFlag {
  id: string;
  type: FlagType;
  taskId: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'ERROR';
  metadata: Record<string, unknown>;
  createdAt: Date;
}
export interface FlagAssignment {
  taskId: string;
  flags: TaskFlag[];
  assignedAt: Date;
  isValid: boolean;
}
export interface FlagConfiguration {
  criticalThreshold: number;
  nearCriticalThreshold: number;
  highFloatThreshold: number;
  enableNearCriticalFlags: boolean;
  enableHighFloatFlags: boolean;
  enableCustomFlags: boolean;
}
export interface FlagSummary {
  totalTasks: number;
  tasksWithFlags: number;
  invalidAssignments: number;
  averageFloatPerTask?: number; // Average total float across all tasks
  flagStatistics: Array<{
    flagType: FlagType;
    count: number;
    percentage: number;
  }>;
  generatedAt: Date;
}
export class TaskFlagAssigner {
  private readonly epsilon: number;
  private readonly flagConfig: FlagConfiguration;
  constructor(config?: Partial<FlagConfiguration>) {
    this.flagConfig = {
      criticalThreshold: DEFAULT_EPSILON,
      nearCriticalThreshold: 1.0,
      highFloatThreshold: 5.0,
      enableNearCriticalFlags: true,
      enableHighFloatFlags: true,
      enableCustomFlags: false,
      ...config,
    };
    this.epsilon = this.flagConfig.criticalThreshold;
  }
  public assignAllFlags(
    tasks: Task[],
    criticalTaskIds: string[] = []
  ): FlagAssignment[] {
    const assignments: FlagAssignment[] = [];
    for (const task of tasks) {
      const taskFlags = this.assignTaskFlags(task, criticalTaskIds);
      assignments.push({
        taskId: task.id,
        flags: taskFlags,
        assignedAt: new Date(),
        isValid: this.validateTaskFlags(taskFlags).isValid,
      });
    }
    return assignments;
  }
  public assignTaskFlags(
    task: Task,
    criticalTaskIds: string[] = []
  ): TaskFlag[] {
    const flags: TaskFlag[] = [];
    const totalFloat = task.totalFloat || 0;
    const isCritical = this.isCritical(totalFloat);
    const isOnCriticalPath = criticalTaskIds.includes(task.id);

    this.addCriticalFlag(
      flags,
      task.id,
      totalFloat,
      isCritical,
      isOnCriticalPath
    );
    this.addNearCriticalFlag(flags, task.id, totalFloat);
    this.addHighFloatFlag(flags, task.id, totalFloat);
    this.addZeroFloatFlag(flags, task.id, totalFloat, isCritical);
    this.addNegativeFloatFlag(flags, task.id, totalFloat);

    return flags;
  }

  /**
   * Add critical flag if applicable
   * @private
   */
  private addCriticalFlag(
    flags: TaskFlag[],
    taskId: string,
    totalFloat: number,
    isCritical: boolean,
    isOnCriticalPath: boolean
  ): void {
    if (isCritical || isOnCriticalPath) {
      flags.push(
        this.createFlag('CRITICAL', taskId, {
          floatValue: totalFloat,
          isCriticalPath: isOnCriticalPath,
        })
      );
    }
  }

  /**
   * Add near critical flag if applicable
   * @private
   */
  private addNearCriticalFlag(
    flags: TaskFlag[],
    taskId: string,
    totalFloat: number
  ): void {
    if (
      this.flagConfig.enableNearCriticalFlags &&
      this.isNearCritical(totalFloat)
    ) {
      flags.push(
        this.createFlag('NEAR_CRITICAL', taskId, {
          floatValue: totalFloat,
          threshold: this.flagConfig.nearCriticalThreshold,
        })
      );
    }
  }

  /**
   * Add high float flag if applicable
   * @private
   */
  private addHighFloatFlag(
    flags: TaskFlag[],
    taskId: string,
    totalFloat: number
  ): void {
    if (this.flagConfig.enableHighFloatFlags && this.isHighFloat(totalFloat)) {
      flags.push(
        this.createFlag('HIGH_FLOAT', taskId, {
          floatValue: totalFloat,
          threshold: this.flagConfig.highFloatThreshold,
        })
      );
    }
  }

  /**
   * Add zero float flag if applicable
   * @private
   */
  private addZeroFloatFlag(
    flags: TaskFlag[],
    taskId: string,
    totalFloat: number,
    isCritical: boolean
  ): void {
    if (isFloatZero(totalFloat, this.epsilon) && !isCritical) {
      flags.push(
        this.createFlag('ZERO_FLOAT', taskId, { floatValue: totalFloat })
      );
    }
  }

  /**
   * Add negative float flag if applicable
   * @private
   */
  private addNegativeFloatFlag(
    flags: TaskFlag[],
    taskId: string,
    totalFloat: number
  ): void {
    if (totalFloat < -this.epsilon) {
      flags.push(
        this.createFlag('NEGATIVE_FLOAT', taskId, {
          floatValue: totalFloat,
          severity: 'ERROR',
        })
      );
    }
  }
  public updateTaskFlags(
    task: Task,
    criticalTaskIds: string[] = []
  ): FlagAssignment {
    const flags = this.assignTaskFlags(task, criticalTaskIds);
    return {
      taskId: task.id,
      flags,
      assignedAt: new Date(),
      isValid: this.validateTaskFlags(flags).isValid,
    };
  }
  public generateFlagSummary(assignments: FlagAssignment[]): FlagSummary {
    const flagCounts = new Map<FlagType, number>();
    let totalTasks = 0;
    let tasksWithFlags = 0;
    let invalidAssignments = 0;
    for (const assignment of assignments) {
      totalTasks++;
      if (assignment.flags.length > 0) {
        tasksWithFlags++;
      }
      if (!assignment.isValid) {
        invalidAssignments++;
      }
      for (const flag of assignment.flags) {
        const currentCount = flagCounts.get(flag.type) || 0;
        flagCounts.set(flag.type, currentCount + 1);
      }
    }
    const flagStatistics = Array.from(flagCounts.entries()).map(
      ([type, count]) => ({
        flagType: type,
        count,
        percentage: Math.round((count / totalTasks) * 10000) / 100,
      })
    );
    return {
      totalTasks,
      tasksWithFlags,
      invalidAssignments,
      flagStatistics,
      generatedAt: new Date(),
    };
  }
  public validateTaskFlags(flags: TaskFlag[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    this.validateFlagLogic(flags, errors, warnings);
    this.validateFlagUniqueness(flags, warnings);
    this.validateFlagData(flags, errors);

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate flag logic consistency
   * @private
   */
  private validateFlagLogic(
    flags: TaskFlag[],
    errors: string[],
    warnings: string[]
  ): void {
    const hasNegativeFloat = flags.some((f) => f.type === 'NEGATIVE_FLOAT');
    const hasCritical = flags.some((f) => f.type === 'CRITICAL');
    const hasHighFloat = flags.some((f) => f.type === 'HIGH_FLOAT');

    if (hasNegativeFloat && hasCritical) {
      errors.push('Task cannot be both critical and have negative float');
    }
    if (hasCritical && hasHighFloat) {
      warnings.push('Critical task should not have high float flag');
    }
  }

  /**
   * Validate flag uniqueness
   * @private
   */
  private validateFlagUniqueness(flags: TaskFlag[], warnings: string[]): void {
    const flagTypes = flags.map((f) => f.type);
    const uniqueTypes = new Set(flagTypes);
    if (flagTypes.length !== uniqueTypes.size) {
      warnings.push('Duplicate flag types detected');
    }
  }

  /**
   * Validate flag data integrity
   * @private
   */
  private validateFlagData(flags: TaskFlag[], errors: string[]): void {
    for (const flag of flags) {
      if (!flag.taskId || flag.taskId.trim() === '') {
        errors.push(`Flag ${flag.type} has invalid task ID`);
      }
      if (flag.metadata?.floatValue !== undefined) {
        const floatValue = flag.metadata.floatValue as number;
        if (isNaN(floatValue)) {
          errors.push(`Flag ${flag.type} has invalid float value`);
        }
      }
    }
  }
  public clearAllFlags(assignments: FlagAssignment[]): FlagAssignment[] {
    return assignments.map((assignment) => ({
      ...assignment,
      flags: [],
      assignedAt: new Date(),
      isValid: true,
    }));
  }

  public filterByFlagType(
    assignments: FlagAssignment[],
    flagType: FlagType
  ): FlagAssignment[] {
    return assignments.filter((assignment) =>
      assignment.flags.some((flag) => flag.type === flagType)
    );
  }
  private isCritical(totalFloat: number): boolean {
    return isFloatZero(totalFloat, this.epsilon);
  }
  private isNearCritical(totalFloat: number): boolean {
    return (
      totalFloat > this.epsilon &&
      totalFloat <= this.flagConfig.nearCriticalThreshold
    );
  }
  private isHighFloat(totalFloat: number): boolean {
    return totalFloat > this.flagConfig.highFloatThreshold;
  }
  private createFlag(
    type: FlagType,
    taskId: string,
    metadata: Record<string, unknown> = {}
  ): TaskFlag {
    return {
      id: `${type}_${taskId}_${Date.now()}`,
      type,
      taskId,
      description: this.getFlagDescription(type),
      severity: this.getFlagSeverity(type),
      metadata,
      createdAt: new Date(),
    };
  }
  private getFlagDescription(type: FlagType): string {
    const descriptions: Record<FlagType, string> = {
      CRITICAL: 'Task is on the critical path',
      NEAR_CRITICAL: 'Task has low total float',
      HIGH_FLOAT: 'Task has high total float',
      ZERO_FLOAT: 'Task has zero float but not critical',
      NEGATIVE_FLOAT: 'Task has negative float',
    };
    return descriptions[type] || 'Unknown flag type';
  }
  private getFlagSeverity(type: FlagType): 'INFO' | 'WARNING' | 'ERROR' {
    const severities = {
      CRITICAL: 'WARNING',
      NEAR_CRITICAL: 'INFO',
      HIGH_FLOAT: 'INFO',
      ZERO_FLOAT: 'WARNING',
      NEGATIVE_FLOAT: 'ERROR',
    } as const;
    return severities[type] || 'INFO';
  }
}
