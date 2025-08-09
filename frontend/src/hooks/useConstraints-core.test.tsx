/**
 * @fileoverview Test suite for useConstraints hook - Core functionality
 * Tests constraint state management and filtering logic
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import type {
  ConstraintViolation,
  ViolationSeverity,
} from '../components/constraint-types';
import { useConstraints } from './useConstraints';

// Mock violations data for testing
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

// Test component that uses the hook
function TestComponent({
  violations,
  taskId,
  minSeverity,
}: {
  violations: ConstraintViolation[];
  taskId?: string;
  minSeverity?: ViolationSeverity;
}) {
  const constraints = useConstraints(violations, { minSeverity });

  return (
    <div data-testid="constraints-output">
      <div data-testid="has-violation">
        {taskId ? constraints.hasViolation(taskId).toString() : 'no-task'}
      </div>
      <div data-testid="violations-count">
        {taskId ? constraints.getViolations(taskId).length : 0}
      </div>
      <div data-testid="severity">
        {taskId ? constraints.getSeverity(taskId) || 'none' : 'none'}
      </div>
      <div data-testid="messages">
        {taskId ? constraints.getMessages(taskId).join(', ') : ''}
      </div>
      <div data-testid="task-summary">
        {taskId ? JSON.stringify(constraints.getTaskSummary(taskId)) : '{}'}
      </div>
      <div data-testid="affected-tasks">
        {constraints.affectedTaskIds.join(', ')}
      </div>
      <div data-testid="total-violations">{constraints.totalViolations}</div>
    </div>
  );
}

describe('useConstraints Hook', () => {
  it('should initialize with provided violations', () => {
    render(createElement(TestComponent, { violations: [], taskId: 'task-1' }));

    expect(screen.getByTestId('has-violation')).toHaveTextContent('false');
    expect(screen.getByTestId('violations-count')).toHaveTextContent('0');
  });

  it('should handle provided violations', () => {
    render(
      createElement(TestComponent, {
        violations: mockViolations,
        taskId: 'task-1',
      })
    );

    expect(screen.getByTestId('has-violation')).toHaveTextContent('true');
    expect(screen.getByTestId('violations-count')).toHaveTextContent('2');
  });

  it('should return highest severity for task', () => {
    render(
      createElement(TestComponent, {
        violations: mockViolations,
        taskId: 'task-1',
      })
    );

    expect(screen.getByTestId('severity')).toHaveTextContent('CRITICAL');
  });

  it('should return all messages for task', () => {
    render(
      createElement(TestComponent, {
        violations: mockViolations,
        taskId: 'task-1',
      })
    );

    const messages = screen.getByTestId('messages').textContent;
    expect(messages).toContain('Task starts too early');
    expect(messages).toContain('Duration may be optimized');
  });

  it('should return correct task summary', () => {
    render(
      createElement(TestComponent, {
        violations: mockViolations,
        taskId: 'task-1',
      })
    );

    const summaryText = screen.getByTestId('task-summary').textContent;
    expect(summaryText).toBeTruthy();

    const summary = JSON.parse(summaryText!);
    expect(summary.taskId).toBe('task-1');
    expect(summary.violationCount).toBe(2);
    expect(summary.highestSeverity).toBe('CRITICAL');
    expect(summary.canAutoFix).toBe(true);
  });

  it('should return affected task IDs', () => {
    render(createElement(TestComponent, { violations: mockViolations }));

    const affectedTasks = screen.getByTestId('affected-tasks').textContent;
    expect(affectedTasks).toContain('task-1');
    expect(affectedTasks).toContain('task-2');
  });

  it('should return total violations count', () => {
    render(createElement(TestComponent, { violations: mockViolations }));

    expect(screen.getByTestId('total-violations')).toHaveTextContent('3');
  });

  it('should handle empty task ID gracefully', () => {
    render(
      createElement(TestComponent, { violations: mockViolations, taskId: '' })
    );

    expect(screen.getByTestId('has-violation')).toHaveTextContent('false');
    expect(screen.getByTestId('violations-count')).toHaveTextContent('0');
  });
});
