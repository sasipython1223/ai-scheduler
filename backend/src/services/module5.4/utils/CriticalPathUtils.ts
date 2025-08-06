/**
 * Module 5.4 - Critical Path Utilities
 * Purpose: Reusable utilities for critical path analysis and validation
 * Requirements:
 * - Support multiple critical path detection
 * - Validate path continuity and connections
 * - Maintain O(V + E) complexity
 */

import { LogicLink, Task } from '../../../types/schedule';
import { CriticalPath, PathMetrics } from '../types/CriticalPathTypes';
import { DEFAULT_EPSILON, isFloatZero } from './FloatUtils';

/**
 * Extended Task interface with float properties
 */
interface TaskWithFloat extends Task {
  totalFloat?: number;
  freeFloat?: number;
}

/**
 * Determines if a task is critical based on its total float
 * @param task Task to evaluate
 * @param epsilon Precision threshold (default: 0.001)
 * @returns True if task is critical
 */
export function isCriticalTask(
  task: TaskWithFloat,
  epsilon: number = DEFAULT_EPSILON
): boolean {
  const totalFloat = task.totalFloat || 0;
  return isFloatZero(totalFloat, epsilon);
}

/**
 * Filters tasks to return only critical ones
 * @param tasks Array of tasks to filter
 * @param epsilon Precision threshold (default: 0.001)
 * @returns Array of critical tasks
 */
export function filterCriticalTasks(
  tasks: TaskWithFloat[],
  epsilon: number = DEFAULT_EPSILON
): TaskWithFloat[] {
  return tasks.filter((task) => isCriticalTask(task, epsilon));
}

/**
 * Builds dependency map for efficient path traversal
 * @param dependencies Array of logic links
 * @returns Map of task successors and predecessors
 */
export function buildDependencyMap(dependencies: LogicLink[]): {
  successors: Map<string, string[]>;
  predecessors: Map<string, string[]>;
} {
  const successors = new Map<string, string[]>();
  const predecessors = new Map<string, string[]>();

  dependencies.forEach((dep) => {
    const from = dep.from;
    const to = dep.to;

    if (!successors.has(from)) successors.set(from, []);
    if (!predecessors.has(to)) predecessors.set(to, []);

    successors.get(from)!.push(to);
    predecessors.get(to)!.push(from);
  });

  return { successors, predecessors };
}

/**
 * Validates that a sequence of tasks forms a valid critical path
 * @param taskSequence Array of task IDs in sequence
 * @param dependencies Array of logic links
 * @returns True if sequence forms valid path
 */
export function validateCriticalPathSequence(
  taskSequence: string[],
  dependencies: LogicLink[]
): boolean {
  if (taskSequence.length <= 1) return true;

  const { successors } = buildDependencyMap(dependencies);

  for (let i = 0; i < taskSequence.length - 1; i++) {
    const currentTask = taskSequence[i];
    const nextTask = taskSequence[i + 1];

    const taskSuccessors = successors.get(currentTask) || [];
    if (!taskSuccessors.includes(nextTask)) {
      return false;
    }
  }

  return true;
}

/**
 * Finds all possible paths from start to end task
 * @param startTask Starting task ID
 * @param endTask Ending task ID
 * @param successors Map of task successors
 * @param visited Set of visited tasks (for cycle detection)
 * @returns Array of possible paths
 */
export function findAllPaths(
  startTask: string,
  endTask: string,
  successors: Map<string, string[]>,
  visited: Set<string> = new Set()
): string[][] {
  if (startTask === endTask) {
    return [[startTask]];
  }

  if (visited.has(startTask)) {
    return []; // Cycle detected
  }

  visited.add(startTask);
  const paths: string[][] = [];
  const taskSuccessors = successors.get(startTask) || [];

  for (const successor of taskSuccessors) {
    const subPaths = findAllPaths(
      successor,
      endTask,
      successors,
      new Set(visited)
    );
    for (const subPath of subPaths) {
      paths.push([startTask, ...subPath]);
    }
  }

  visited.delete(startTask);
  return paths;
}

/**
 * Calculates metrics for a critical path
 * @param path Critical path object
 * @param tasks Array of all tasks
 * @returns Path metrics
 */
export function calculatePathMetrics(
  path: CriticalPath,
  tasks: Task[]
): PathMetrics {
  const pathTasks = tasks.filter((task) => path.tasks.includes(task.id));
  const totalDuration = pathTasks.reduce(
    (sum, task) => sum + (task.duration || 0),
    0
  );
  const taskCount = pathTasks.length;

  // Simple complexity score based on task count and dependencies
  const complexityScore = taskCount * 1.5;

  // Risk score based on duration and complexity
  const riskScore = Math.min(100, totalDuration / 10 + complexityScore);

  return {
    duration: totalDuration,
    taskCount,
    complexityScore,
    riskScore,
  };
}

/**
 * Detects intersections between multiple critical paths
 * @param paths Array of critical paths
 * @returns Array of path intersections
 */
export function detectPathIntersections(paths: CriticalPath[]): Array<{
  pathIds: string[];
  intersectionTasks: string[];
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}> {
  const intersections: Array<{
    pathIds: string[];
    intersectionTasks: string[];
    impactLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  }> = [];

  for (let i = 0; i < paths.length; i++) {
    for (let j = i + 1; j < paths.length; j++) {
      const path1 = paths[i];
      const path2 = paths[j];

      const commonTasks = path1.tasks.filter((task) =>
        path2.tasks.includes(task)
      );

      if (commonTasks.length > 0) {
        const impactLevel =
          commonTasks.length > 2
            ? 'HIGH'
            : commonTasks.length > 1
              ? 'MEDIUM'
              : 'LOW';

        intersections.push({
          pathIds: [path1.id, path2.id],
          intersectionTasks: commonTasks,
          impactLevel,
        });
      }
    }
  }

  return intersections;
}

/**
 * Generates a unique ID for a critical path
 * @param taskIds Array of task IDs in the path
 * @returns Unique path ID
 */
export function generatePathId(taskIds: string[]): string {
  return `CP_${taskIds.join('_')}_${Date.now()}`;
}

/**
 * Sorts critical paths by priority (longest first, then by complexity)
 * @param paths Array of critical paths
 * @returns Sorted array of paths
 */
export function sortPathsByPriority(paths: CriticalPath[]): CriticalPath[] {
  return [...paths].sort((a, b) => {
    // First sort by duration (longest first)
    if (a.totalDuration !== b.totalDuration) {
      return b.totalDuration - a.totalDuration;
    }

    // Then by task count (more tasks first)
    return b.pathLength - a.pathLength;
  });
}
