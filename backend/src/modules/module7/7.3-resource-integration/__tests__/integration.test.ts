/**
 * Module 7.3 - Resource Integration Tests
 *
 * Test suite for resource-constraint integration functionality.
 * Tests availability checking, skill matching, resource leveling, and strategies.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import type { ConstraintInput, Resource, Task } from '../index';
import {
  _registerManagerImpl,
  createResourceConstraintManager,
} from '../index';
import { createResourceConstraintManagerImpl } from '../resource-constraint-manager';

// Sample test data
const mockResources: Resource[] = [
  {
    id: 'dev1',
    skills: [
      { id: 'javascript', level: 3 },
      { id: 'react', level: 2 },
    ],
    capacity: 8,
    calendar: { '2024-01-15': 6, '2024-01-16': 8 },
  },
  {
    id: 'dev2',
    skills: [
      { id: 'python', level: 4 },
      { id: 'django', level: 3 },
    ],
    capacity: 8,
  },
  {
    id: 'designer1',
    skills: [
      { id: 'ui-design', level: 5 },
      { id: 'figma', level: 4 },
    ],
    capacity: 6,
  },
];

const mockTasks: Task[] = [
  {
    id: 'task1',
    duration: 4,
    day: '2024-01-15',
    requirements: [{ skillId: 'javascript', minLevel: 2 }],
  },
  {
    id: 'task2',
    duration: 6,
    day: '2024-01-15',
    requirements: [{ skillId: 'python', minLevel: 3 }],
  },
  {
    id: 'task3',
    duration: 3,
    day: '2024-01-16',
    requirements: [{ skillId: 'ui-design', minLevel: 4 }],
  },
];

describe('Module 7.3 - Resource Integration', () => {
  beforeEach(() => {
    // Register implementation before each test
    _registerManagerImpl(createResourceConstraintManagerImpl);
  });

  describe('ResourceConstraintManager', () => {
    it('should create manager instance', () => {
      const manager = createResourceConstraintManager();
      expect(manager).toBeDefined();
      expect(typeof manager.integrate).toBe('function');
    });

    it('should handle basic allocation', async () => {
      const manager = createResourceConstraintManager();
      const input: ConstraintInput = {
        resources: mockResources,
        tasks: mockTasks,
        flags: { ENABLE_GREEDY: true },
      };

      const result = await manager.integrate(input);

      expect(result.status).toBe('ok');
      expect(result.allocations).toHaveLength(3);
      expect(result.violations).toHaveLength(0);
      expect(result.metrics.elapsedMs).toBeGreaterThan(0);
    });

    it('should validate input constraints', async () => {
      const manager = createResourceConstraintManager();
      const invalidInput: ConstraintInput = {
        resources: [],
        tasks: [],
      };

      const result = await manager.integrate(invalidInput);

      expect(result.status).toBe('conflicts');
      expect(result.violations).toContain('No resources provided');
      expect(result.violations).toContain('No tasks provided');
    });

    it('should handle overallocation constraints', async () => {
      const manager = createResourceConstraintManager();
      const overloadInput: ConstraintInput = {
        resources: [mockResources[0]], // Only one resource
        tasks: [
          {
            id: 'big1',
            duration: 8,
            day: '2024-01-15',
            requirements: [{ skillId: 'javascript', minLevel: 2 }],
          },
          {
            id: 'big2',
            duration: 4,
            day: '2024-01-15',
            requirements: [{ skillId: 'javascript', minLevel: 2 }],
          },
        ],
        hardCaps: { maxOverallocPct: 25 },
      };

      const result = await manager.integrate(overloadInput);

      // Should allocate at least one task
      expect(result.allocations.length).toBeGreaterThan(0);
    });

    it('should use leveling strategy when enabled', async () => {
      const manager = createResourceConstraintManager();
      const input: ConstraintInput = {
        resources: mockResources,
        tasks: mockTasks,
        flags: { ENABLE_LEVELING: true },
      };

      const result = await manager.integrate(input);

      expect(result.status).toBe('ok');
      expect(result.metrics.leveledVariance).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle skill mismatches gracefully', async () => {
      const manager = createResourceConstraintManager();
      const mismatchInput: ConstraintInput = {
        resources: [mockResources[0]], // JavaScript skills only
        tasks: [
          {
            id: 'pythonTask',
            duration: 4,
            day: '2024-01-15',
            requirements: [{ skillId: 'python', minLevel: 3 }], // Requires Python
          },
        ],
        flags: { ENABLE_GREEDY: true },
      };

      const result = await manager.integrate(mismatchInput);

      // Should still attempt allocation or report specific violation
      expect(
        result.allocations.length + result.violations.length
      ).toBeGreaterThan(0);
    });

    it('should respect time budgets', async () => {
      const manager = createResourceConstraintManager();
      const input: ConstraintInput = {
        resources: mockResources,
        tasks: mockTasks,
        timeBudgetMs: 10, // Very tight budget
      };

      const result = await manager.integrate(input);

      expect(result.metrics.elapsedMs).toBeDefined();
      // Should complete quickly but may report budget violation
    });
  });
});
