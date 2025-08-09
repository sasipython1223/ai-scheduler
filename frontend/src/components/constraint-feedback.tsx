/**
 * @fileoverview Constraint Feedback UI Component
 *
 * Purpose: Renders error/warning icons next to task rows based on constraint violations
 * Features:
 * - 4 severity levels (CRITICAL → LOW) with color badges
 * - Accessibility compliant (aria-labels)
 * - Clean Code compliance (< 200 LOC, JSDoc)
 *
 * @module ConstraintFeedback
 */

import React from 'react';
import type {
  ConstraintViolation,
  ViolationSeverity,
} from './constraint-types';
import {
  SEVERITY_CONFIG,
  getHighestSeverity,
  groupViolationsBySeverity,
} from './constraint-types';

/**
 * Props for ConstraintFeedback component
 */
export interface ConstraintFeedbackProps {
  /** Task ID to show violations for */
  taskId: string;
  /** List of violations for this task */
  violations: ConstraintViolation[];
  /** Compact display mode */
  compact?: boolean;
  /** Click handler for violation badges */
  onViolationClick?: (violation: ConstraintViolation) => void;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Individual violation badge component
 */
const ViolationBadge: React.FC<{
  severity: ViolationSeverity;
  count: number;
  violations: ConstraintViolation[];
  compact: boolean;
  onClick?: (violation: ConstraintViolation) => void;
}> = ({ severity, count, violations, compact, onClick }) => {
  const config = SEVERITY_CONFIG[severity];

  const handleClick = () => {
    if (onClick && violations.length > 0) onClick(violations[0]);
  };

  const badgeStyle = {
    backgroundColor: config.bgColor,
    color: config.color,
    border: `1px solid ${config.color}`,
    borderRadius: '12px',
    padding: compact ? '2px 6px' : '4px 8px',
    fontSize: compact ? '10px' : '12px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    cursor: onClick ? 'pointer' : 'default',
    marginRight: '4px',
  };

  return (
    <span
      style={badgeStyle}
      onClick={handleClick}
      role="button"
      tabIndex={onClick ? 0 : -1}
      aria-label={`${config.label} violations: ${count}. ${violations.map((v) => v.message).join(', ')}`}
      title={violations
        .map((v) => `${v.message}: ${v.description || 'No description'}`)
        .join('\n')}
    >
      <span role="img" aria-label={config.label}>
        {config.icon}
      </span>
      {!compact && <span>{count}</span>}
    </span>
  );
};

/**
 * Main ConstraintFeedback Component
 *
 * Displays constraint violation indicators for a specific task.
 * Shows badges for each severity level with violation counts.
 */
export const ConstraintFeedback: React.FC<ConstraintFeedbackProps> = ({
  taskId,
  violations,
  compact = false,
  onViolationClick,
  className = '',
}) => {
  // Filter violations for this task
  const taskViolations = violations.filter((v) => v.taskId === taskId);

  if (taskViolations.length === 0) return null;

  // Group violations by severity
  const groupedViolations = groupViolationsBySeverity(taskViolations);
  const highestSeverity = getHighestSeverity(taskViolations);

  return (
    <div
      className={`constraint-feedback ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        flexWrap: 'wrap',
      }}
      role="alert"
      aria-label={`Task has ${taskViolations.length} constraint violations. Highest severity: ${highestSeverity}`}
    >
      {Object.entries(groupedViolations)
        .sort(
          ([a], [b]) =>
            SEVERITY_CONFIG[b as ViolationSeverity].priority -
            SEVERITY_CONFIG[a as ViolationSeverity].priority
        )
        .map(([severity, violationGroup]) => (
          <ViolationBadge
            key={severity}
            severity={severity as ViolationSeverity}
            count={violationGroup.length}
            violations={violationGroup}
            compact={compact}
            onClick={onViolationClick}
          />
        ))}

      {compact && taskViolations.length > 1 && (
        <span
          style={{ fontSize: '10px', color: '#6B7280', marginLeft: '2px' }}
          aria-label={`Total violations: ${taskViolations.length}`}
        >
          +{taskViolations.length - 1}
        </span>
      )}
    </div>
  );
};

/**
 * Simplified constraint indicator for minimal display
 */
export const ConstraintIndicator: React.FC<{
  hasViolations: boolean;
  severity?: ViolationSeverity;
  count?: number;
}> = ({ hasViolations, severity = 'INFO', count = 0 }) => {
  if (!hasViolations) return null;

  const config = SEVERITY_CONFIG[severity];

  return (
    <span
      style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: config.color,
        display: 'inline-block',
        marginLeft: '4px',
      }}
      aria-label={`Has ${count} ${config.label.toLowerCase()} violations`}
      title={`${count} ${config.label.toLowerCase()} violations`}
    />
  );
};

export default ConstraintFeedback;
export type { ConstraintViolation, ViolationSeverity };
