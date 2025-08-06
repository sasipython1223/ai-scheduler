/**
 * Critical Path Validation Utilities
 *
 * This module contains validation and calculation utilities
 * extracted from CriticalPathAnalyzer to reduce file size
 * and improve modularity.
 */

import { isFloatZero } from '../utils/FloatUtils.js';

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
  lag?: number;
}

interface CriticalPath {
  id: string;
  tasks: Task[];
  totalDuration: number;
  totalFloat: number;
  isComplete: boolean;
}

/**
 * Checks if a task is critical based on total float
 * @param task Task to check
 * @param epsilon Tolerance for float comparison
 * @returns True if task is critical
 */
export function isCriticalTask(task: Task, epsilon: number): boolean {
  return isFloatZero(task.totalFloat || 0, epsilon);
}

/**
 * Validates if all tasks in a path sequence are properly connected
 * @param pathTaskIds Array of task IDs in sequence
 * @param dependencies Array of logic links
 * @returns True if path is valid
 */
export function validateCriticalPathSequence(
  pathTaskIds: string[],
  dependencies: LogicLink[]
): boolean {
  if (pathTaskIds.length < 2) {
    return true; // Single task is always valid
  }

  // Build dependency map for quick lookups
  const dependencyMap = new Map<string, string[]>();
  for (const dep of dependencies) {
    if (!dependencyMap.has(dep.from)) {
      dependencyMap.set(dep.from, []);
    }
    dependencyMap.get(dep.from)!.push(dep.to);
  }

  // Check each consecutive pair in the path
  for (let i = 0; i < pathTaskIds.length - 1; i++) {
    const currentTask = pathTaskIds[i];
    const nextTask = pathTaskIds[i + 1];

    const successors = dependencyMap.get(currentTask) || [];
    if (!successors.includes(nextTask)) {
      return false; // No direct connection found
    }
  }

  return true;
}

/**
 * Builds a dependency map for efficient path traversal
 * @param dependencies Array of logic links
 * @returns Maps for successors and predecessors
 */
export function buildDependencyMap(dependencies: LogicLink[]): {
  successors: Map<string, string[]>;
  predecessors: Map<string, string[]>;
} {
  const successors = new Map<string, string[]>();
  const predecessors = new Map<string, string[]>();

  for (const dep of dependencies) {
    // Add to successors map
    if (!successors.has(dep.from)) {
      successors.set(dep.from, []);
    }
    successors.get(dep.from)!.push(dep.to);

    // Add to predecessors map
    if (!predecessors.has(dep.to)) {
      predecessors.set(dep.to, []);
    }
    predecessors.get(dep.to)!.push(dep.from);
  }

  return { successors, predecessors };
}

/**
 * Finds all possible paths between two tasks
 * @param startId Starting task ID
 * @param endId Ending task ID
 * @param successors Map of task successors
 * @returns Array of paths (each path is an array of task IDs)
 */
export function findAllPaths(
  startId: string,
  endId: string,
  successors: Map<string, string[]>
): string[][] {
  const paths: string[][] = [];
  const visited = new Set<string>();

  function dfs(currentId: string, currentPath: string[]) {
    if (currentId === endId) {
      paths.push([...currentPath, currentId]);
      return;
    }

    if (visited.has(currentId)) {
      return; // Avoid cycles
    }

    visited.add(currentId);
    const nextTasks = successors.get(currentId) || [];

    for (const nextId of nextTasks) {
      dfs(nextId, [...currentPath, currentId]);
    }

    visited.delete(currentId);
  }

  dfs(startId, []);
  return paths;
}

/**
 * Sorts critical paths by priority (longest paths first)
 * @param paths Array of critical paths
 * @returns Sorted array of critical paths
 */
export function sortPathsByPriority(paths: CriticalPath[]): CriticalPath[] {
  return paths.sort((a, b) => {
    // Primary sort: by total duration (longest first)
    if (b.totalDuration !== a.totalDuration) {
      return b.totalDuration - a.totalDuration;
    }

    // Secondary sort: by task count (most tasks first)
    if (b.tasks.length !== a.tasks.length) {
      return b.tasks.length - a.tasks.length;
    }

    // Tertiary sort: by total float (least float first, most critical)
    return a.totalFloat - b.totalFloat;
  });
}
