/**
 * @fileoverview Test suite for ConstraintFeedback component - Interaction tests
 * Tests click handlers and interactive behavior
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ConstraintFeedback } from './constraint-feedback';
import type { ConstraintViolation } from './constraint-types';

// Mock violations data
const mockViolations: ConstraintViolation[] = [
  {
    id: 'violation-1',
    constraintId: 'constraint-1',
    taskId: 'task-1',
    severity: 'CRITICAL',
    message: 'Task starts too early',
    description: 'Task start date violates project constraint',
    canAutoFix: true,
  },
  {
    id: 'violation-2',
    constraintId: 'constraint-2',
    taskId: 'task-1',
    severity: 'WARNING',
    message: 'Duration may be optimized',
    description: 'Task duration could be reduced',
    canAutoFix: false,
  },
];

describe('ConstraintFeedback Component - Interactions', () => {
  it('should have proper tabIndex for clickable badges', () => {
    const mockOnClick = vi.fn();
    render(
      <ConstraintFeedback
        taskId="task-1"
        violations={mockViolations}
        onViolationClick={mockOnClick}
      />
    );

    const badges = screen.getAllByRole('button');
    badges.forEach((badge: HTMLElement) => {
      expect(badge).toHaveAttribute('tabIndex', '0');
    });
  });

  it('should have proper tabIndex for non-clickable badges', () => {
    render(<ConstraintFeedback taskId="task-1" violations={mockViolations} />);

    const badges = screen.getAllByRole('button');
    badges.forEach((badge: HTMLElement) => {
      expect(badge).toHaveAttribute('tabIndex', '-1');
    });
  });

  it('should call onViolationClick when badge is clicked', () => {
    const mockOnClick = vi.fn();
    render(
      <ConstraintFeedback
        taskId="task-1"
        violations={mockViolations}
        onViolationClick={mockOnClick}
      />
    );

    const criticalBadge = screen.getByLabelText(/Critical violations: 1/);
    fireEvent.click(criticalBadge);

    expect(mockOnClick).toHaveBeenCalledWith(mockViolations[0]);
  });

  it('should not call onViolationClick when no handler provided', () => {
    render(<ConstraintFeedback taskId="task-1" violations={mockViolations} />);

    const criticalBadge = screen.getByLabelText(/Critical violations: 1/);

    // Should not throw error
    expect(() => fireEvent.click(criticalBadge)).not.toThrow();
  });
});
