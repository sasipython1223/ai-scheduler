/**
 * Module 7.3 - Performance Tests
 *
 * Performance benchmarks to ensure sub-500ms for 1000 tasks locally.
 */

import { describe, expect, it } from 'vitest';
import type { ConstraintInput, Resource, Task } from '../index';
import {
  _registerManagerImpl,
  createResourceConstraintManager,
} from '../index';
import { createResourceConstraintManagerImpl } from '../resource-constraint-manager';

/**
 * Generate test data for performance testing
 */
function generateTestData(
  numResources: number,
  numTasks: number
): { resources: Resource[]; tasks: Task[] } {
  const skillTypes = [
    'javascript',
    'python',
    'java',
    'react',
    'angular',
    'node',
    'django',
    'spring',
  ];

  const resources: Resource[] = [];
  for (let i = 0; i < numResources; i++) {
    const numSkills = Math.floor(Math.random() * 4) + 2; // 2-5 skills per resource
    const skills: Array<{ id: string; level: number }> = [];

    for (let j = 0; j < numSkills; j++) {
      const skillId = skillTypes[Math.floor(Math.random() * skillTypes.length)];
      const level = Math.floor(Math.random() * 5) + 1; // 1-5 level

      if (!skills.some((s) => s.id === skillId)) {
        skills.push({ id: skillId, level });
      }
    }

    resources.push({
      id: `resource-${i}`,
      skills,
      capacity: 8,
      calendar:
        Math.random() > 0.3
          ? undefined
          : { '2024-01-15': Math.floor(Math.random() * 8) + 1 },
    });
  }

  const tasks: Task[] = [];
  const days = [
    '2024-01-15',
    '2024-01-16',
    '2024-01-17',
    '2024-01-18',
    '2024-01-19',
  ];

  for (let i = 0; i < numTasks; i++) {
    const numReqs = Math.floor(Math.random() * 3) + 1; // 1-3 requirements per task
    const requirements: Array<{ skillId: string; minLevel: number }> = [];

    for (let j = 0; j < numReqs; j++) {
      const skillId = skillTypes[Math.floor(Math.random() * skillTypes.length)];
      const minLevel = Math.floor(Math.random() * 4) + 1; // 1-4 min level

      if (!requirements.some((r) => r.skillId === skillId)) {
        requirements.push({ skillId, minLevel });
      }
    }

    tasks.push({
      id: `task-${i}`,
      duration: Math.floor(Math.random() * 6) + 1, // 1-6 hours
      day: days[Math.floor(Math.random() * days.length)],
      requirements,
    });
  }

  return { resources, tasks };
}

describe('Performance Tests', () => {
  beforeEach(() => {
    _registerManagerImpl(createResourceConstraintManagerImpl);
  });

  it('should handle 100 tasks under 100ms', async () => {
    const { resources, tasks } = generateTestData(20, 100);
    const manager = createResourceConstraintManager();

    const input: ConstraintInput = {
      resources,
      tasks,
      flags: { ENABLE_GREEDY: true },
      timeBudgetMs: 1000,
    };

    const startTime = performance.now();
    const result = await manager.integrate(input);
    const elapsedMs = performance.now() - startTime;

    expect(elapsedMs).toBeLessThan(100);
    expect(result.allocations.length).toBeGreaterThan(0);
    console.log(
      `100 tasks: ${elapsedMs.toFixed(1)}ms, ${result.allocations.length}/${tasks.length} allocated`
    );
  });

  it('should handle 500 tasks under 250ms', async () => {
    const { resources, tasks } = generateTestData(50, 500);
    const manager = createResourceConstraintManager();

    const input: ConstraintInput = {
      resources,
      tasks,
      flags: { ENABLE_GREEDY: true },
      timeBudgetMs: 5000,
    };

    const startTime = performance.now();
    const result = await manager.integrate(input);
    const elapsedMs = performance.now() - startTime;

    expect(elapsedMs).toBeLessThan(250);
    expect(result.allocations.length).toBeGreaterThan(0);
    console.log(
      `500 tasks: ${elapsedMs.toFixed(1)}ms, ${result.allocations.length}/${tasks.length} allocated`
    );
  });

  it('should handle 1000 tasks under 500ms (acceptance criteria)', async () => {
    const { resources, tasks } = generateTestData(100, 1000);
    const manager = createResourceConstraintManager();

    const input: ConstraintInput = {
      resources,
      tasks,
      flags: { ENABLE_GREEDY: true },
      timeBudgetMs: 10000,
    };

    const startTime = performance.now();
    const result = await manager.integrate(input);
    const elapsedMs = performance.now() - startTime;

    expect(elapsedMs).toBeLessThan(500);
    expect(result.allocations.length).toBeGreaterThan(0);
    expect(result.status).toMatch(/ok|conflicts/);

    console.log(
      `1000 tasks: ${elapsedMs.toFixed(1)}ms, ${result.allocations.length}/${tasks.length} allocated`
    );
    console.log(
      `Efficiency: ${((result.allocations.length / tasks.length) * 100).toFixed(1)}% tasks allocated`
    );
  });

  it('should handle leveling strategy within reasonable time', async () => {
    const { resources, tasks } = generateTestData(30, 200);
    const manager = createResourceConstraintManager();

    const input: ConstraintInput = {
      resources,
      tasks,
      flags: { ENABLE_LEVELING: true },
      timeBudgetMs: 2000,
    };

    const startTime = performance.now();
    const result = await manager.integrate(input);
    const elapsedMs = performance.now() - startTime;

    expect(elapsedMs).toBeLessThan(1000); // More lenient for leveling
    expect(result.allocations.length).toBeGreaterThan(0);
    expect(result.metrics.leveledVariance).toBeGreaterThanOrEqual(0);

    console.log(
      `Leveling 200 tasks: ${elapsedMs.toFixed(1)}ms, variance: ${result.metrics.leveledVariance.toFixed(2)}`
    );
  });

  it('should handle hybrid strategy efficiently', async () => {
    const { resources, tasks } = generateTestData(40, 300);
    const manager = createResourceConstraintManager();

    const input: ConstraintInput = {
      resources,
      tasks,
      flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: true },
      timeBudgetMs: 3000,
    };

    const startTime = performance.now();
    const result = await manager.integrate(input);
    const elapsedMs = performance.now() - startTime;

    expect(elapsedMs).toBeLessThan(1500);
    expect(result.allocations.length).toBeGreaterThan(0);

    console.log(
      `Hybrid 300 tasks: ${elapsedMs.toFixed(1)}ms, ${result.allocations.length}/${tasks.length} allocated`
    );
  });

  it('should demonstrate linear scaling characteristics', async () => {
    const sizes = [50, 100, 200];
    const timings: number[] = [];

    for (const size of sizes) {
      const { resources, tasks } = generateTestData(Math.floor(size / 5), size);
      const manager = createResourceConstraintManager();

      const input: ConstraintInput = {
        resources,
        tasks,
        flags: { ENABLE_GREEDY: true },
      };

      const startTime = performance.now();
      await manager.integrate(input);
      const elapsedMs = performance.now() - startTime;

      timings.push(elapsedMs);
      console.log(`${size} tasks: ${elapsedMs.toFixed(1)}ms`);
    }

    // Check that timing doesn't grow exponentially
    const ratio1 = timings[1] / timings[0]; // 100/50 ratio
    const ratio2 = timings[2] / timings[1]; // 200/100 ratio

    expect(ratio1).toBeLessThan(5); // Should not be more than 5x slower
    expect(ratio2).toBeLessThan(5);

    console.log(`Scaling ratios: ${ratio1.toFixed(2)}x, ${ratio2.toFixed(2)}x`);
  });
});
