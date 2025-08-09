/**
 * @fileoverview useConstraints Hook
 *
 * Purpose: React hook for managing constraint validation state
 * Features:
 * - Accept list of violations per task
 * - Expose methods: hasViolation(taskId), getSeverity(taskId), getMessages(taskId)
 * - Clean Code compliance (< 200 LOC, JSDoc)
 *
 * @module useConstraints
 */

import { useCallback, useMemo } from 'react';
import type {
  ConstraintViolation,
  ViolationSeverity,
} from '../components/constraint-types';
import { getHighestSeverity } from '../components/constraint-types';

/**
 * Hook configuration options
 */
export interface UseConstraintsOptions {
  /** Filter violations by minimum severity */
  minSeverity?: ViolationSeverity;
  /** Enable debugging logs */
  debug?: boolean;
}

/**
 * Task constraint summary
 */
export interface TaskConstraintSummary {
  taskId: string;
  hasViolations: boolean;
  violationCount: number;
  highestSeverity: ViolationSeverity | null;
  violations: ConstraintViolation[];
}

/**
 * Hook return value
 */
export interface UseConstraintsReturn {
  /** Check if task has any violations */
  hasViolation: (taskId: string) => boolean;
  /** Get highest severity for task */
  getSeverity: (taskId: string) => ViolationSeverity | null;
  /** Get all violation messages for task */
  getMessages: (taskId: string) => string[];
  /** Get all violations for task */
  getViolations: (taskId: string) => ConstraintViolation[];
  /** Get violation count for task */
  getViolationCount: (taskId: string) => number;
  /** Get task summary */
  getTaskSummary: (taskId: string) => TaskConstraintSummary;
  /** Get all task summaries */
  getAllTaskSummaries: () => TaskConstraintSummary[];
  /** Total violation count across all tasks */
  totalViolations: number;
  /** List of all unique task IDs with violations */
  affectedTaskIds: string[];
}

/**
 * React hook for managing constraint violations
 *
 * @param violations - Array of constraint violations
 * @param options - Hook configuration options
 * @returns Constraint management functions and data
 */
export const useConstraints = (
  violations: ConstraintViolation[],
  options: UseConstraintsOptions = {}
): UseConstraintsReturn => {
  const { minSeverity, debug = false } = options;

  // Filter violations by minimum severity if specified
  const filteredViolations = useMemo(() => {
    if (!minSeverity) return violations;

    const severityPriority = {
      INFO: 1,
      WARNING: 2,
      ERROR: 3,
      CRITICAL: 4,
    };

    const minPriority = severityPriority[minSeverity];
    return violations.filter(
      (v) => severityPriority[v.severity] >= minPriority
    );
  }, [violations, minSeverity]);

  // Group violations by task ID
  const violationsByTask = useMemo(() => {
    return filteredViolations.reduce(
      (groups, violation) => {
        const taskId = violation.taskId;
        if (!groups[taskId]) {
          groups[taskId] = [];
        }
        groups[taskId].push(violation);
        return groups;
      },
      {} as Record<string, ConstraintViolation[]>
    );
  }, [filteredViolations]);

  // Get unique task IDs with violations
  const affectedTaskIds = useMemo(() => {
    return Object.keys(violationsByTask);
  }, [violationsByTask]);

  // Total violation count
  const totalViolations = useMemo(() => {
    return filteredViolations.length;
  }, [filteredViolations]);

  // Check if task has any violations
  const hasViolation = useCallback(
    (taskId: string): boolean => Boolean(violationsByTask[taskId]?.length),
    [violationsByTask]
  );

  // Get highest severity for task
  const getSeverity = useCallback(
    (taskId: string): ViolationSeverity | null => {
      const taskViolations = violationsByTask[taskId] || [];
      return getHighestSeverity(taskViolations);
    },
    [violationsByTask]
  );

  // Get all violation messages for task
  const getMessages = useCallback(
    (taskId: string): string[] => {
      const taskViolations = violationsByTask[taskId] || [];
      return taskViolations.map((v) => v.message);
    },
    [violationsByTask]
  );

  // Get all violations for task
  const getViolations = useCallback(
    (taskId: string): ConstraintViolation[] => violationsByTask[taskId] || [],
    [violationsByTask]
  );

  // Get violation count for task
  const getViolationCount = useCallback(
    (taskId: string): number => violationsByTask[taskId]?.length || 0,
    [violationsByTask]
  );

  // Get task constraint summary
  const getTaskSummary = useCallback(
    (taskId: string): TaskConstraintSummary => {
      const violations = violationsByTask[taskId] || [];
      const summary = {
        taskId,
        hasViolations: violations.length > 0,
        violationCount: violations.length,
        highestSeverity: getHighestSeverity(violations),
        violations,
      };

      if (debug) {
        console.log(`[useConstraints] getTaskSummary(${taskId}):`, summary);
      }

      return summary;
    },
    [violationsByTask, debug]
  );

  // Get all task summaries
  const getAllTaskSummaries = useCallback((): TaskConstraintSummary[] => {
    return affectedTaskIds.map((taskId) => getTaskSummary(taskId));
  }, [affectedTaskIds, getTaskSummary]);

  return {
    hasViolation,
    getSeverity,
    getMessages,
    getViolations,
    getViolationCount,
    getTaskSummary,
    getAllTaskSummaries,
    totalViolations,
    affectedTaskIds,
  };
};
