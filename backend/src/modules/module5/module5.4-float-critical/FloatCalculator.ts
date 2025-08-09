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
 * - ✅ May exceed 250 lines due to test volume (up to 400 lines acceptable)
 * - 🚫 DO NOT compress or remove test descriptions or documentation
 * - ✅ Prefer readable test sections and clear category headers
 * - ✅ Keep large test files well structured with comment dividers
 * - ✅ Functions may exceed 50 lines for comprehensive test scenarios (up to 75 lines)
 *
 * 💡 If line limit exceeded:
 * - Prompt: "Consider modularizing this file into [X] helper files"
 * - Suggest filenames (e.g., `FloatValidationUtils.ts`, `BatchProcessor.ts`)
 * - Complexity limit: 12 for production, 15 for tests
 */

/**
 * Module 5.4 - FloatCalculator
 * Purpose: Enhanced float computation engine with epsilon precision
 * Requirements:
 * - Use epsilon-based float comparison (0.001)
 * - Support batch processing for large task arrays
 * - Maintain O(V + E) complexity
 * - Provide modular, testable functions
 *
 * ⚠️ NOTICE: This file exceeds 250 lines (333 lines) - Consider modularizing:
 * - FloatCalculationCore.ts (core calculations)
 * - FloatValidationUtils.ts (validation logic)
 * - BatchProcessingHelper.ts (batch operations)
 */

// Local type definitions to avoid import issues
interface Task {
  id: string;
  name: string;
  duration: number;
}

interface LogicLink {
  id: string;
  from: string;
  to: string;
  type: 'FS' | 'SS' | 'FF' | 'SF';
  lag: number;
}

import { FloatBatchResult, FloatData, FloatMetrics } from './types/FloatTypes';
import { ValidationResult } from './types/SharedTypes';
import { buildDependencyMap } from './utils/CriticalPathUtils';
import {
  DEFAULT_EPSILON,
  getAverageFloat,
  getMinFloat,
  isFloatZero,
  roundFloat,
  validateFloatRelationship,
} from './utils/FloatUtils';

/**
 * Extended Task interface with date and float properties
 */
interface TaskWithDates extends Task {
  earlyStart?: Date | null;
  earlyFinish?: Date | null;
  lateStart?: Date | null;
  lateFinish?: Date | null;
  totalFloat?: number;
  freeFloat?: number;
}

/**
 * Configuration for precision handling
 */
export interface PrecisionConfig {
  epsilon: number;
  roundingDecimals: number;
  validateConsistency: boolean;
}

/**
 * Enhanced FloatCalculator with modular design and precision handling
 */
export class FloatCalculator {
  private readonly epsilon: number;
  private readonly precisionConfig: PrecisionConfig;

  constructor(precisionConfig?: Partial<PrecisionConfig>) {
    this.precisionConfig = {
      epsilon: DEFAULT_EPSILON,
      roundingDecimals: 3,
      validateConsistency: true,
      ...precisionConfig,
    };
    this.epsilon = this.precisionConfig.epsilon;
  }

  /**
   * Calculates total float for a single task
   * @param task Task with early and late dates
   * @returns Total float in working days
   */
  public calculateTotalFloat(task: TaskWithDates): number {
    // If the task already has totalFloat calculated, use it
    if (task.totalFloat !== undefined && task.totalFloat !== null) {
      return task.totalFloat;
    }

    if (
      !task.earlyStart ||
      !task.lateStart ||
      !task.earlyFinish ||
      !task.lateFinish
    ) {
      throw new Error(
        `Task ${task.id}: Missing required dates for total float calculation`
      );
    }

    // Total float: difference between late finish and early finish
    // (or equivalently, late start - early start in a properly scheduled project)
    const floatDays =
      (task.lateFinish.getTime() - task.earlyFinish.getTime()) /
      (1000 * 60 * 60 * 24);

    return roundFloat(floatDays, this.precisionConfig.roundingDecimals);
  }

  /**
   * Calculates free float for a single task
   * @param task Task to calculate free float for
   * @param successors Array of successor tasks
   * @param dependencies Array of logic links for lag calculation
   * @returns Free float in working days
   */
  public calculateFreeFloat(
    task: TaskWithDates,
    successors: TaskWithDates[],
    dependencies: LogicLink[] = []
  ): number {
    if (!task.earlyFinish) {
      throw new Error(
        `Task ${task.id}: Missing earlyFinish date for free float calculation`
      );
    }

    // If task has no successors, free float equals total float
    if (successors.length === 0) {
      return task.totalFloat || this.calculateTotalFloat(task);
    }

    const freeFloatValues: number[] = [];

    successors.forEach((successor) => {
      if (!successor.earlyStart) {
        return; // Skip successors without early start dates
      }

      // Find lag for this specific dependency
      const dependency = dependencies.find(
        (dep) => dep.from === task.id && dep.to === successor.id
      );
      const lag = dependency?.lag || 0;

      // Calculate free float for this successor relationship
      const taskFinishTime = task.earlyFinish!.getTime();
      const successorStartTime = successor.earlyStart.getTime();

      const floatDays =
        (successorStartTime - taskFinishTime) / (1000 * 60 * 60 * 24) - lag;
      freeFloatValues.push(floatDays);
    });

    // Free float is the minimum of all successor relationships
    const freeFloat = getMinFloat(freeFloatValues);

    // Ensure free float doesn't exceed total float
    const totalFloat = task.totalFloat || this.calculateTotalFloat(task);
    const constrainedFreeFloat = Math.min(freeFloat, totalFloat);

    return roundFloat(
      Math.max(0, constrainedFreeFloat),
      this.precisionConfig.roundingDecimals
    );
  }

  /**
   * Performs batch float calculation for an array of tasks
   * @param tasks Array of tasks to process
   * @param dependencies Array of logic links
   * @returns Batch processing result
   */
  public calculateBatchFloat(
    tasks: TaskWithDates[],
    dependencies: LogicLink[] = []
  ): FloatBatchResult {
    const startTime = Date.now();
    const processedTasks: FloatData[] = [];
    const errors: string[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Build dependency map for efficient successor lookup
    const { successors } = buildDependencyMap(dependencies);

    tasks.forEach((task) => {
      const result = this.processTaskFloat(
        task,
        tasks,
        dependencies,
        successors,
        startTime
      );

      if (result.success) {
        processedTasks.push(result.floatData!);
        successCount++;
      } else {
        errors.push(result.error!);
        errorCount++;
      }
    });

    const totalProcessingTime = Date.now() - startTime;

    return {
      processedTasks,
      totalProcessingTime,
      successCount,
      errorCount,
      errors,
    };
  }

  /**
   * Process float calculation for a single task within batch context
   * @private
   */
  private processTaskFloat(
    task: TaskWithDates,
    allTasks: TaskWithDates[],
    dependencies: LogicLink[],
    successors: Map<string, string[]>,
    startTime: number
  ): { success: boolean; floatData?: FloatData; error?: string } {
    try {
      // Calculate total float
      const totalFloat = this.calculateTotalFloat(task);

      // Find successor tasks
      const successorIds = successors.get(task.id) || [];
      const successorTasks = allTasks.filter((t) =>
        successorIds.includes(t.id)
      );

      // Calculate free float
      const freeFloat = this.calculateFreeFloat(
        task,
        successorTasks,
        dependencies
      );

      // Validate float relationship
      if (!validateFloatRelationship(totalFloat, freeFloat, this.epsilon)) {
        return {
          success: false,
          error: `Task ${task.id}: Invalid float relationship - free float exceeds total float`,
        };
      }

      // Create float data
      const floatData: FloatData = {
        taskId: task.id,
        totalFloat,
        freeFloat,
        floatRank: this.calculateFloatRank(totalFloat, allTasks.length),
        isNearCritical: isFloatZero(totalFloat, this.epsilon * 3),
        calculationMetadata: {
          calculationMethod: 'enhanced_precision',
          precision: this.epsilon,
          validationPassed: true,
          calculationTime: Date.now() - startTime,
        },
      };

      return { success: true, floatData };
    } catch (error) {
      return {
        success: false,
        error: `Task ${task.id}: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Validates float inputs for a task
   * @param task Task to validate
   * @returns Validation result
   */
  public validateFloatInputs(task: TaskWithDates): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!task.earlyStart) {
      errors.push(`Task ${task.id}: Missing earlyStart date`);
    }
    if (!task.earlyFinish) {
      errors.push(`Task ${task.id}: Missing earlyFinish date`);
    }
    if (!task.lateStart) {
      errors.push(`Task ${task.id}: Missing lateStart date`);
    }
    if (!task.lateFinish) {
      errors.push(`Task ${task.id}: Missing lateFinish date`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generates float metrics for a set of tasks
   * @param tasks Array of tasks with float data
   * @returns Float metrics
   */
  public getFloatMetrics(tasks: TaskWithDates[]): FloatMetrics {
    const totalFloats = tasks
      .map((task) => task.totalFloat || 0)
      .filter((float) => !isNaN(float));

    const criticalTasks = tasks.filter((task) =>
      isFloatZero(task.totalFloat || 0, this.epsilon)
    ).length;

    const nearCriticalTasks = tasks.filter((task) =>
      isFloatZero(task.totalFloat || 0, this.epsilon * 3)
    ).length;

    const averageFloat = getAverageFloat(totalFloats);
    const variance = this.calculateVariance(totalFloats, averageFloat);

    return {
      totalTasks: tasks.length,
      criticalTasks,
      nearCriticalTasks,
      averageFloat: roundFloat(
        averageFloat,
        this.precisionConfig.roundingDecimals
      ),
      floatVariance: roundFloat(
        variance,
        this.precisionConfig.roundingDecimals
      ),
    };
  }

  /**
   * Calculates float rank for relative comparison
   * @param totalFloat Total float value
   * @param totalTasks Total number of tasks in project
   * @returns Float rank (0-100)
   */
  private calculateFloatRank(totalFloat: number, _totalTasks: number): number {
    // Simple ranking: tasks with less float get higher rank
    const maxRank = 100;
    const floatThreshold = 10; // Days

    if (isFloatZero(totalFloat, this.epsilon)) {
      return maxRank; // Critical tasks get highest rank
    }

    const rank = Math.max(0, maxRank - (totalFloat / floatThreshold) * 20);
    return roundFloat(rank, 0);
  }

  /**
   * Calculates variance for float distribution
   * @param values Array of float values
   * @param mean Mean value
   * @returns Variance
   */
  private calculateVariance(values: number[], mean: number): number {
    if (values.length === 0) return 0;

    const squaredDifferences = values.map((value) => Math.pow(value - mean, 2));
    return (
      squaredDifferences.reduce((sum, diff) => sum + diff, 0) / values.length
    );
  }
}
