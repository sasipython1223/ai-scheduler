/**
 * @fileoverview Test suite for ConstraintFeedback component - Core functionality
 * Tests basic rendering and main features
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConstraintFeedback, ConstraintIndicator } from './constraint-feedback';
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

describe('ConstraintFeedback Component', () => {
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

    expect(screen.getByLabelText(/Critical violations: 1/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Warning violations: 1/)).toBeInTheDocument();
  });

  it('should have proper ARIA labels', () => {
    render(<ConstraintFeedback taskId="task-1" violations={mockViolations} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Task has 2 constraint violations/)
    ).toBeInTheDocument();
  });
});

describe('ConstraintIndicator Component', () => {
  it('should render nothing when hasViolations is false', () => {
    const { container } = render(<ConstraintIndicator hasViolations={false} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render indicator when hasViolations is true', () => {
    render(<ConstraintIndicator hasViolations={true} count={1} />);

    expect(screen.getByLabelText(/Has 1 info violations/)).toBeInTheDocument();
  });

  it('should use specified severity for styling', () => {
    render(
      <ConstraintIndicator hasViolations={true} severity="CRITICAL" count={3} />
    );

    const indicator = screen.getByLabelText(/Has 3 critical violations/);
    // Check if the element has inline style with the critical color (RGB format)
    expect(indicator).toHaveAttribute('style');
    const style = indicator.getAttribute('style');
    expect(style).toContain('rgb(220, 38, 38)');
  });
});
