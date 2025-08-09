/**
 * @fileoverview Test suite for ConstraintFeedback component - Basic rendering tests
 * Tests UI rendering and basic interaction behavior
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
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
  {
    id: 'violation-3',
    constraintId: 'constraint-3',
    taskId: 'task-2',
    severity: 'ERROR',
    message: 'Resource conflict detected',
    description: 'Resource is overallocated',
    canAutoFix: true,
  },
];

describe('ConstraintFeedback Component - Basic Rendering', () => {
  it('should render nothing when no violations exist for task', () => {
    const { container } = render(
      <ConstraintFeedback
        taskId="task-nonexistent"
        violations={mockViolations}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render violation badges for task with violations', () => {
    render(<ConstraintFeedback taskId="task-1" violations={mockViolations} />);

    // Should show both CRITICAL and WARNING badges
    expect(screen.getByLabelText(/Critical violations: 1/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Warning violations: 1/)).toBeInTheDocument();
  });

  it('should display violation count in badges when not in compact mode', () => {
    render(
      <ConstraintFeedback
        taskId="task-1"
        violations={mockViolations}
        compact={false}
      />
    );

    // Should show count numbers - use getAllByText since there are multiple "1"s
    const countElements = screen.getAllByText('1');
    expect(countElements.length).toBeGreaterThan(0);
  });

  it('should hide violation count in compact mode', () => {
    render(
      <ConstraintFeedback
        taskId="task-1"
        violations={mockViolations}
        compact={true}
      />
    );

    // Should not show count numbers
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('should display badges in priority order (Critical first)', () => {
    render(<ConstraintFeedback taskId="task-1" violations={mockViolations} />);

    const badges = screen.getAllByRole('button');

    // First badge should be Critical (🔴)
    expect(badges[0]).toHaveTextContent('🔴');
    // Second badge should be Warning (⚠️)
    expect(badges[1]).toHaveTextContent('⚠️');
  });

  it('should have proper ARIA labels', () => {
    render(<ConstraintFeedback taskId="task-1" violations={mockViolations} />);

    // Container should have alert role
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Should have descriptive aria-label
    expect(
      screen.getByLabelText(/Task has 2 constraint violations/)
    ).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <ConstraintFeedback
        taskId="task-1"
        violations={mockViolations}
        className="custom-class"
      />
    );

    expect(screen.getByRole('alert')).toHaveClass(
      'constraint-feedback',
      'custom-class'
    );
  });
});

describe('ConstraintFeedback Component - Compact Mode', () => {
  it('should show summary indicator for multiple violations in compact mode', () => {
    render(
      <ConstraintFeedback
        taskId="task-1"
        violations={mockViolations}
        compact={true}
      />
    );

    // Should show "+1" for additional violations
    expect(screen.getByLabelText(/Total violations: 2/)).toBeInTheDocument();
  });

  it('should not show summary indicator for single violation in compact mode', () => {
    const singleViolation = [mockViolations[0]];
    render(
      <ConstraintFeedback
        taskId="task-1"
        violations={singleViolation}
        compact={true}
      />
    );

    // Should not show summary indicator
    expect(screen.queryByLabelText(/Total violations/)).not.toBeInTheDocument();
  });
});
