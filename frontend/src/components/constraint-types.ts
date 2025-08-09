/**
 * @fileoverview Constraint Types and Utilities
 *
 * Shared types and utility functions for constraint feedback system
 */

/**
 * Severity levels for constraint violations
 */
export type ViolationSeverity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO';

/**
 * Individual constraint violation information
 */
export interface ConstraintViolation {
  id: string;
  constraintId: string;
  taskId: string;
  severity: ViolationSeverity;
  message: string;
  description?: string;
  canAutoFix?: boolean;
}

/**
 * Severity configuration for styling and behavior
 */
export const SEVERITY_CONFIG = {
  CRITICAL: {
    color: '#DC2626',
    bgColor: '#FEE2E2',
    icon: '🔴',
    label: 'Critical',
    priority: 4,
  },
  ERROR: {
    color: '#EA580C',
    bgColor: '#FED7AA',
    icon: '🔶',
    label: 'Error',
    priority: 3,
  },
  WARNING: {
    color: '#D97706',
    bgColor: '#FEF3C7',
    icon: '⚠️',
    label: 'Warning',
    priority: 2,
  },
  INFO: {
    color: '#2563EB',
    bgColor: '#DBEAFE',
    icon: 'ℹ️',
    label: 'Info',
    priority: 1,
  },
} as const;

/**
 * Get the highest severity violation for a task
 */
export function getHighestSeverity(
  violations: ConstraintViolation[]
): ViolationSeverity | null {
  if (violations.length === 0) return null;

  return violations.reduce((highest, current) => {
    const currentPriority = SEVERITY_CONFIG[current.severity].priority;
    const highestPriority = SEVERITY_CONFIG[highest].priority;
    return currentPriority > highestPriority ? current.severity : highest;
  }, violations[0].severity);
}

/**
 * Group violations by severity
 */
export function groupViolationsBySeverity(violations: ConstraintViolation[]) {
  return violations.reduce(
    (groups, violation) => {
      const severity = violation.severity;
      if (!groups[severity]) groups[severity] = [];
      groups[severity].push(violation);
      return groups;
    },
    {} as Record<ViolationSeverity, ConstraintViolation[]>
  );
}
