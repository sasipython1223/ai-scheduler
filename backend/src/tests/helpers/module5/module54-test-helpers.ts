/**
 * Module 5.4 Test Helpers
 * Purpose: Extracted helper functions for Module 5.4 test cases
 * Reduces function complexity and improves maintainability
 */

export interface TestTask {
  id: string;
  name: string;
  duration: number;
  earlyStart: Date;
  earlyFinish: Date;
  lateStart: Date;
  lateFinish: Date;
}

export interface TestTaskFlag {
  taskId: string;
  isCritical: boolean;
  isNearCritical: boolean;
  totalFloat: number;
  freeFloat: number;
}

export interface CreateTestTaskParams {
  id: string;
  name: string;
  duration: number;
  earlyStart: string;
  earlyFinish: string;
  lateStart: string;
  lateFinish: string;
}

/**
 * Create standard test task with dates
 */
export function createTestTask(params: CreateTestTaskParams): TestTask {
  return {
    id: params.id,
    name: params.name,
    duration: params.duration,
    earlyStart: new Date(params.earlyStart),
    earlyFinish: new Date(params.earlyFinish),
    lateStart: new Date(params.lateStart),
    lateFinish: new Date(params.lateFinish),
  };
}

/**
 * Create test tasks for service integration testing
 */
export function createServiceIntegrationTestTasks(): TestTask[] {
  return [
    createTestTask({
      id: 'T1',
      name: 'Task 1',
      duration: 3,
      earlyStart: '2024-01-01',
      earlyFinish: '2024-01-04',
      lateStart: '2024-01-01',
      lateFinish: '2024-01-04',
    }),
    createTestTask({
      id: 'T2',
      name: 'Task 2',
      duration: 2,
      earlyStart: '2024-01-04',
      earlyFinish: '2024-01-06',
      lateStart: '2024-01-05',
      lateFinish: '2024-01-07',
    }),
    createTestTask({
      id: 'T3',
      name: 'Task 3',
      duration: 4,
      earlyStart: '2024-01-06',
      earlyFinish: '2024-01-10',
      lateStart: '2024-01-07',
      lateFinish: '2024-01-11',
    }),
  ];
}

/**
 * Validate service integration result
 */
export function validateServiceIntegrationResult(
  result: Record<string, unknown>
): void {
  expect(result).toBeDefined();
  expect(result.success).toBe(true);
  expect(result.tasks).toBeDefined();
  expect(result.floatAnalysis).toBeDefined();
  expect(result.criticalPathAnalysis).toBeDefined();
  expect(result.performanceMetrics).toBeDefined();
}

/**
 * Create test dependencies for service integration
 */
export function createServiceIntegrationDependencies(): Array<
  Record<string, unknown>
> {
  return [
    {
      id: 'D1',
      from: 'T1',
      to: 'T2',
      type: 'FS',
      lag: 0,
    },
    {
      id: 'D2',
      from: 'T2',
      to: 'T3',
      type: 'FS',
      lag: 1,
    },
  ];
}

/**
 * Create forward pass result for testing
 */
export function createTestForwardPassResult(
  tasks: TestTask[]
): Record<string, unknown> {
  return {
    tasks: tasks,
    projectStartDate: new Date('2024-01-01'),
    projectEndDate: new Date('2024-01-11'),
  };
}

/**
 * Create backward pass result for testing
 */
export function createTestBackwardPassResult(
  tasks: TestTask[]
): Record<string, unknown> {
  return {
    tasks: tasks,
    criticalPath: tasks.filter((t) => t.id === 'T1' || t.id === 'T3'),
    totalProjectFloat: 0,
  };
}

/**
 * Run complete service integration test scenario
 */
export function runCompleteServiceIntegrationTest(
  module54Service: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const tasks = createServiceIntegrationTestTasks();
  const dependencies = createServiceIntegrationDependencies();
  const forwardPassResult = createTestForwardPassResult(tasks);
  const backwardPassResult = createTestBackwardPassResult(tasks);

  const input = {
    tasks,
    dependencies,
    forwardPassResult,
    backwardPassResult,
  };

  return (module54Service as any).processModule54(input);
}

/**
 * Create batch float calculation test data
 */
export function createBatchFloatTestData(): TestTask[] {
  return [
    createTestTask({
      id: 'T1',
      name: 'Task 1',
      duration: 2,
      earlyStart: '2024-01-01',
      earlyFinish: '2024-01-03',
      lateStart: '2024-01-01',
      lateFinish: '2024-01-03',
    }),
    createTestTask({
      id: 'T2',
      name: 'Task 2',
      duration: 3,
      earlyStart: '2024-01-03',
      earlyFinish: '2024-01-06',
      lateStart: '2024-01-04',
      lateFinish: '2024-01-07',
    }),
    createTestTask({
      id: 'T3',
      name: 'Task 3',
      duration: 1,
      earlyStart: '2024-01-06',
      earlyFinish: '2024-01-07',
      lateStart: '2024-01-08',
      lateFinish: '2024-01-09',
    }),
  ];
}

/**
 * Validate batch float calculation results
 */
export function validateBatchFloatResults(results: unknown[]): void {
  expect(results).toHaveLength(3);
  results.forEach((result, index) => {
    const r = result as Record<string, unknown>;
    expect(r.taskId).toBe(`T${index + 1}`);
    expect(typeof r.totalFloat).toBe('number');
    expect(typeof r.freeFloat).toBe('number');
  });
}

/**
 * Create critical path analyzer test scenario
 */
export function createCriticalPathTestScenario(): {
  tasks: TestTask[];
  expectedCriticalTasks: string[];
} {
  return {
    tasks: [
      createTestTask({
        id: 'A',
        name: 'Start',
        duration: 1,
        earlyStart: '2024-01-01',
        earlyFinish: '2024-01-02',
        lateStart: '2024-01-01',
        lateFinish: '2024-01-02',
      }),
      createTestTask({
        id: 'B',
        name: 'Critical',
        duration: 5,
        earlyStart: '2024-01-02',
        earlyFinish: '2024-01-07',
        lateStart: '2024-01-02',
        lateFinish: '2024-01-07',
      }),
      createTestTask({
        id: 'C',
        name: 'Non-Critical',
        duration: 2,
        earlyStart: '2024-01-02',
        earlyFinish: '2024-01-04',
        lateStart: '2024-01-05',
        lateFinish: '2024-01-07',
      }),
      createTestTask({
        id: 'D',
        name: 'End',
        duration: 1,
        earlyStart: '2024-01-07',
        earlyFinish: '2024-01-08',
        lateStart: '2024-01-07',
        lateFinish: '2024-01-08',
      }),
    ],
    expectedCriticalTasks: ['A', 'B', 'D'],
  };
}

/**
 * Validate critical path analysis
 */
export function validateCriticalPathAnalysis(
  analysis: Record<string, unknown>,
  expectedCriticalTasks: string[]
): void {
  expect(analysis).toBeDefined();
  const paths = analysis.criticalPaths as Array<Record<string, unknown>>;
  expect(paths).toBeDefined();
  expect(paths.length).toBeGreaterThan(0);

  const allCriticalTasks = paths.flatMap((path) => path.tasks as string[]);
  expectedCriticalTasks.forEach((taskId) => {
    expect(allCriticalTasks).toContain(taskId);
  });
}

/**
 * Create flag assignment test data
 */
export function createFlagAssignmentTestData(): TestTaskFlag[] {
  return [
    {
      taskId: 'T1',
      isCritical: true,
      isNearCritical: false,
      totalFloat: 0,
      freeFloat: 0,
    },
    {
      taskId: 'T2',
      isCritical: false,
      isNearCritical: true,
      totalFloat: 2,
      freeFloat: 1,
    },
    {
      taskId: 'T3',
      isCritical: false,
      isNearCritical: false,
      totalFloat: 5,
      freeFloat: 3,
    },
  ];
}

/**
 * Validate flag assignment results
 */
export function validateFlagAssignment(flags: TestTaskFlag[]): void {
  const criticalFlags = flags.filter((f) => f.isCritical);
  const nearCriticalFlags = flags.filter((f) => f.isNearCritical);

  expect(criticalFlags.length).toBeGreaterThan(0);
  expect(nearCriticalFlags.length).toBeGreaterThan(0);

  criticalFlags.forEach((flag) => {
    expect(flag.totalFloat).toBeCloseTo(0, 1);
  });
}

/**
 * Create configuration consistency test scenario
 */
export function createConfigurationTestScenario(): Record<string, unknown> {
  return {
    epsilon: 0.001,
    nearCriticalThreshold: 3.0,
    enableDetailedLogging: false,
    performanceMode: true,
  };
}

/**
 * Validate configuration consistency
 */
export function validateConfigurationConsistency(
  config: Record<string, unknown>
): void {
  expect(config.epsilon).toBeDefined();
  expect(config.nearCriticalThreshold).toBeDefined();
  expect(typeof config.enableDetailedLogging).toBe('boolean');
  expect(typeof config.performanceMode).toBe('boolean');
}
