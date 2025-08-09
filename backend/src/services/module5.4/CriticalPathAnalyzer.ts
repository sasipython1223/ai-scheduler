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
 * Module 5.4 - CriticalPathAnalyzer
 * Purpose: Dedicated critical path detection and analysis service
 * Requirements:
 * - Support multiple critical path detection
 * - Use epsilon-based comparison (0.001)
 * - Validate path continuity and connections
 * - Maintain O(V + E) complexity
 *
 * ⚠️ NOTICE: This file exceeds 250 lines (318 lines) - Consider modularizing:
 * - CriticalPathCore.ts (core detection logic)
 * - PathValidationUtils.ts (validation functions)
 * - CriticalPathTypes.ts (type definitions)
 */

// Local type definitions
interface Task {
  id: string;
  name: string;
  duration: number;
  totalFloat?: number;
}

interface LogicLink {
  id: string;
  from: string;
  to: string;
  type: 'FS' | 'SS' | 'FF' | 'SF';
  lag: number;
}

import { CriticalPathHelpers } from './CriticalPathHelpers';
import { CriticalPath, CriticalPathAnalysis } from './types/CriticalPathTypes';
import { ValidationResult } from './types/SharedTypes';
import { calculateCriticalPathMetrics } from './utils/CriticalPathMetricsUtils';
import {
  buildDependencyMap,
  detectPathIntersections,
  findAllPaths,
  sortPathsByPriority,
  validateCriticalPathSequence,
} from './utils/CriticalPathUtils';
import { DEFAULT_EPSILON, isFloatZero } from './utils/FloatUtils';

/**
 * Configuration for critical path analysis
 */
export interface AnalyzerConfig {
  epsilon: number;
  enableMultiplePaths: boolean;
  maxPathsToAnalyze: number;
  validatePathContinuity: boolean;
}

/**
 * CriticalPathAnalyzer - Comprehensive critical path detection and analysis
 */
export class CriticalPathAnalyzer {
  private readonly epsilon: number;
  private readonly config: AnalyzerConfig;

  constructor(config?: Partial<AnalyzerConfig>) {
    this.config = {
      epsilon: DEFAULT_EPSILON,
      enableMultiplePaths: true,
      maxPathsToAnalyze: 10,
      validatePathContinuity: true,
      ...config,
    };
    this.epsilon = this.config.epsilon;
  }

  /**
   * Identifies all critical tasks in the project
   * @param tasks Array of tasks with total float calculated
   * @returns Array of critical tasks
   */
  public identifyCriticalTasks(tasks: Task[]): Task[] {
    return tasks.filter((task) => this.isCritical(task));
  }

  /**
   * Builds critical path sequences from critical tasks
   * @param tasks Array of all tasks
   * @param dependencies Array of logic links
   * @returns Array of critical paths
   */
  public buildCriticalPathSequences(
    tasks: Task[],
    dependencies: LogicLink[]
  ): CriticalPath[] {
    const criticalTasks = this.identifyCriticalTasks(tasks);

    if (criticalTasks.length === 0) {
      return [];
    }

    const { successors, predecessors } = buildDependencyMap(dependencies);
    const { startTasks, endTasks } = this.identifyPathBoundaries(
      criticalTasks,
      successors,
      predecessors
    );

    const criticalPaths = this.generateAllCriticalPaths({
      startTasks,
      endTasks,
      criticalTasks,
      allTasks: tasks,
      dependencies,
      successors,
    });

    return this.processAndLimitPaths(criticalPaths);
  }

  /**
   * Identifies start and end tasks for critical path analysis
   */
  private identifyPathBoundaries(
    criticalTasks: Task[],
    successors: Map<string, string[]>,
    predecessors: Map<string, string[]>
  ): { startTasks: Task[]; endTasks: Task[] } {
    const startTasks = criticalTasks.filter((task) => {
      const taskPredecessors = predecessors.get(task.id) || [];
      return !taskPredecessors.some((predId) =>
        criticalTasks.some((ct) => ct.id === predId)
      );
    });

    const endTasks = criticalTasks.filter((task) => {
      const taskSuccessors = successors.get(task.id) || [];
      return !taskSuccessors.some((succId) =>
        criticalTasks.some((ct) => ct.id === succId)
      );
    });

    return { startTasks, endTasks };
  }

  /**
   * Generates all valid critical paths between start and end tasks
   */
  private generateAllCriticalPaths(params: {
    startTasks: Task[];
    endTasks: Task[];
    criticalTasks: Task[];
    allTasks: Task[];
    dependencies: LogicLink[];
    successors: Map<string, string[]>;
  }): CriticalPath[] {
    const criticalPaths: CriticalPath[] = [];
    const {
      startTasks,
      endTasks,
      criticalTasks,
      allTasks,
      dependencies,
      successors,
    } = params;

    for (const startTask of startTasks) {
      for (const endTask of endTasks) {
        const paths = findAllPaths(startTask.id, endTask.id, successors);
        this.validateAndAddPaths(
          paths,
          criticalTasks,
          allTasks,
          dependencies,
          criticalPaths
        );
      }
    }

    return criticalPaths;
  }

  /**
   * Validates path sequences and adds valid ones to the collection
   */
  private validateAndAddPaths(
    paths: string[][],
    criticalTasks: Task[],
    allTasks: Task[],
    dependencies: LogicLink[],
    criticalPaths: CriticalPath[]
  ): void {
    for (const pathTaskIds of paths) {
      const isValidCriticalPath = pathTaskIds.every((taskId) =>
        criticalTasks.some((ct) => ct.id === taskId)
      );

      if (!isValidCriticalPath) continue;

      if (this.config.validatePathContinuity) {
        const isValidSequence = validateCriticalPathSequence(
          pathTaskIds,
          dependencies
        );
        if (isValidSequence) {
          const criticalPath = CriticalPathHelpers.createCriticalPath(
            pathTaskIds,
            allTasks
          );
          criticalPaths.push(criticalPath);
        }
      } else {
        const criticalPath = CriticalPathHelpers.createCriticalPath(
          pathTaskIds,
          allTasks
        );
        criticalPaths.push(criticalPath);
      }
    }
  }

  /**
   * Processes paths by removing duplicates and applying limits
   */
  private processAndLimitPaths(criticalPaths: CriticalPath[]): CriticalPath[] {
    const uniquePaths = CriticalPathHelpers.removeDuplicatePaths(criticalPaths);
    const sortedPaths = sortPathsByPriority(uniquePaths);
    return sortedPaths.slice(0, this.config.maxPathsToAnalyze);
  }

  /**
   * Detects multiple critical paths in complex networks
   * @param tasks Array of all tasks
   * @param dependencies Array of logic links
   * @returns Array of critical path sets
   */
  public detectMultipleCriticalPaths(
    tasks: Task[],
    dependencies: LogicLink[]
  ): CriticalPath[] {
    if (!this.config.enableMultiplePaths) {
      const paths = this.buildCriticalPathSequences(tasks, dependencies);
      return paths.length > 0 ? [paths[0]] : [];
    }

    return this.buildCriticalPathSequences(tasks, dependencies);
  }

  /**
   * Calculates comprehensive metrics for critical paths
   * @param paths Array of critical paths
   * @returns Path metrics
   */
  /**
   * Validates critical path continuity
   * @param path Critical path to validate
   * @param dependencies Array of logic links
   * @returns Validation result
   */
  public validateCriticalPathContinuity(
    path: CriticalPath,
    dependencies: LogicLink[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (path.tasks.length === 0) {
      errors.push('Critical path contains no tasks');
      return { isValid: false, errors, warnings };
    }

    if (path.tasks.length === 1) {
      warnings.push('Critical path contains only one task');
      return { isValid: true, errors, warnings };
    }

    // Validate sequence continuity
    const isValidSequence = validateCriticalPathSequence(
      path.tasks,
      dependencies
    );

    if (!isValidSequence) {
      errors.push(`Critical path ${path.id} has invalid task sequence`);
    }

    // Validate path dates
    if (path.startDate >= path.endDate) {
      errors.push(`Critical path ${path.id} has invalid date range`);
    }

    // Validate duration consistency
    if (path.totalDuration <= 0) {
      errors.push(`Critical path ${path.id} has invalid duration`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generates comprehensive critical path analysis
   * @param tasks Array of all tasks
   * @param dependencies Array of logic links
   * @returns Complete critical path analysis
   */
  public generateCriticalPathAnalysis(
    tasks: Task[],
    dependencies: LogicLink[]
  ): CriticalPathAnalysis {
    const criticalPaths = this.detectMultipleCriticalPaths(tasks, dependencies);
    const criticalTasks = this.identifyCriticalTasks(tasks);

    const pathIntersections = detectPathIntersections(criticalPaths);
    const longestPath = CriticalPathHelpers.findLongestPath(criticalPaths);
    const shortestCriticalPath =
      CriticalPathHelpers.findShortestPath(criticalPaths);

    return {
      criticalPaths,
      totalCriticalTasks: criticalTasks.length,
      longestPath: longestPath || CriticalPathHelpers.createEmptyPath(),
      shortestCriticalPath:
        shortestCriticalPath || CriticalPathHelpers.createEmptyPath(),
      pathIntersections,
      criticalityMetrics: {
        totalCriticalPaths: criticalPaths.length,
        averagePathLength:
          CriticalPathHelpers.calculateAveragePathLength(criticalPaths),
        criticalPathDensity: CriticalPathHelpers.calculatePathDensity(
          criticalPaths,
          tasks.length
        ),
        pathComplexityScore:
          calculateCriticalPathMetrics(criticalPaths).complexityScore,
      },
    };
  }

  /**
   * Checks if a task is critical based on total float
   * @param task Task to check
   * @returns True if task is critical
   */
  private isCritical(task: Task): boolean {
    return isFloatZero(task.totalFloat || 0, this.epsilon);
  }
}
