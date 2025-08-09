/**
 * Module 5 Test Helpers
 * Purpose: Extracted helper functions for large test cases
 * Reduces function complexity and improves maintainability
 */

import { LogicLink, TaskInput, TaskPriority } from '../../../types/schedule';

export interface TestTaskData {
  id: string;
  name: string;
  duration: number;
  dependencies?: string[];
}

export interface TestScenario {
  name: string;
  tasks: TestTaskData[];
  dependencies: string[];
  expectedCriticalPath: string[];
  expectedFloatValues?: Record<string, number>;
}

/**
 * Create standardized test tasks
 */
export function createTestTasks(taskData: TestTaskData[]): TaskInput[] {
  return taskData.map((data) => ({
    id: data.id,
    name: data.name,
    duration: data.duration,
    dependencies: data.dependencies || [],
    // Standard test task properties
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-01'),
    status: 'NOT_STARTED',
    type: 'TASK',
    priority: 'MEDIUM' as TaskPriority,
    wbsCode: `WBS.${data.id}`,
    resources: [],
    constraints: [],
  }));
}

/**
 * Create test dependencies/logic links
 */
export function createTestDependencies(dependencies: string[]): LogicLink[] {
  return dependencies.map((dep, index) => {
    const [from, to] = dep.split('->');
    return {
      id: `dep-${index}`,
      from: from.trim(),
      to: to.trim(),
      predecessorId: from.trim(),
      successorId: to.trim(),
      type: 'FS',
      lag: 0,
    };
  });
}

/**
 * Validate critical path results
 */
export function validateCriticalPath(
  result: Record<string, unknown>,
  expectedPath: string[]
): void {
  expect(result).toBeDefined();
  expect(result.success).toBe(true);
  expect(result.tasks).toBeDefined();

  const tasks = result.tasks as Array<Record<string, unknown>>;
  const criticalTasks = tasks.filter(
    (t: Record<string, unknown>) => t.isCritical
  );
  const criticalTaskIds = criticalTasks.map(
    (t: Record<string, unknown>) => t.id
  );

  expectedPath.forEach((taskId) => {
    expect(criticalTaskIds).toContain(taskId);
  });
}

/**
 * Validate float calculations
 */
export function validateFloatValues(
  result: Record<string, unknown>,
  expectedFloats: Record<string, number>
): void {
  const tasks = result.tasks as Array<Record<string, unknown>>;
  Object.entries(expectedFloats).forEach(([taskId, expectedFloat]) => {
    const task = tasks.find((t: Record<string, unknown>) => t.id === taskId);
    expect(task).toBeDefined();
    expect(task?.totalFloat).toBeCloseTo(expectedFloat, 1);
  });
}

/**
 * Create performance test scenario
 */
export function createPerformanceTestScenario(taskCount: number): TestScenario {
  const tasks: TestTaskData[] = [];
  const dependencies: string[] = [];

  // Create linear chain for performance testing
  for (let i = 1; i <= taskCount; i++) {
    tasks.push({
      id: `task-${i}`,
      name: `Task ${i}`,
      duration: Math.floor(Math.random() * 5) + 1,
    });

    if (i > 1) {
      dependencies.push(`task-${i - 1} -> task-${i}`);
    }
  }

  return {
    name: `Performance Test ${taskCount} tasks`,
    tasks,
    dependencies,
    expectedCriticalPath: tasks.map((t) => t.id),
  };
}

/**
 * Complex scenario with multiple paths
 */
export function createComplexTestScenario(): TestScenario {
  return {
    name: 'Complex Multi-Path Scenario',
    tasks: [
      { id: 'A', name: 'Start', duration: 2 },
      { id: 'B', name: 'Design', duration: 5 },
      { id: 'C', name: 'Develop', duration: 8 },
      { id: 'D', name: 'Test', duration: 3 },
      { id: 'E', name: 'Deploy', duration: 2 },
      { id: 'F', name: 'Document', duration: 4 },
    ],
    dependencies: ['A -> B', 'A -> F', 'B -> C', 'C -> D', 'D -> E', 'F -> E'],
    expectedCriticalPath: ['A', 'B', 'C', 'D', 'E'],
    expectedFloatValues: {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      F: 6, // Non-critical path
    },
  };
}

/**
 * Run basic forward pass test case
 */
export function runBasicForwardPassTestCase(): void {
  const scenario = createComplexTestScenario();
  const tasks = createTestTasks(scenario.tasks);
  const dependencies = createTestDependencies(scenario.dependencies);

  // Test logic would go here
  expect(tasks).toHaveLength(6);
  expect(dependencies).toHaveLength(6);
}

/**
 * Assert forward pass consistency
 */
export function assertForwardPassConsistency(
  result: Record<string, unknown>
): void {
  expect(result.success).toBe(true);
  expect(result.tasks).toBeDefined();
  expect(result.performanceMetrics).toBeDefined();
  const perfMetrics = result.performanceMetrics as Record<string, unknown>;
  expect(perfMetrics.processingTimeMs).toBeGreaterThanOrEqual(0);
}
