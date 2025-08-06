/**
 * Module 5.4 Test Suite
 * Purpose: Comprehensive test coverage for float calculation and critical path analysis
 * Tests: Basic functionality, edge cases, integration scenarios
 */

import { CriticalPathAnalyzer } from '../CriticalPathAnalyzer';
import { FloatCalculator } from '../FloatCalculator';
import { Module54Service } from '../Module54Service';
import { TaskFlagAssigner } from '../TaskFlagAssigner';
import { calculateCriticalPathMetrics } from '../utils/CriticalPathMetricsUtils';
import { DEFAULT_EPSILON } from '../utils/FloatUtils';

// Helper functions for test data generation
function _createTestTask(id: string, duration: number, totalFloat: number = 0) {
  return {
    id,
    name: `Task ${id}`,
    duration,
    totalFloat,
  };
}

function _createTestDependency(from: string, to: string, lag: number = 0) {
  return {
    id: `${from}-${to}`,
    from,
    to,
    type: 'FS' as const,
    lag,
  };
}

describe('Module 5.4 - Float Calculator Tests', () => {
  let _module54Service: Module54Service;
  let floatCalculator: FloatCalculator;
  let _criticalPathAnalyzer: CriticalPathAnalyzer;
  let _taskFlagAssigner: TaskFlagAssigner;

  beforeEach(() => {
    _module54Service = new Module54Service();
    floatCalculator = new FloatCalculator();
    _criticalPathAnalyzer = new CriticalPathAnalyzer();
    _taskFlagAssigner = new TaskFlagAssigner();
  });

  describe('Basic Float Calculations', () => {
    it('should calculate total float correctly', () => {
      const task = {
        id: 'T1',
        name: 'Test Task',
        duration: 5,
        earlyStart: new Date('2024-01-01'),
        earlyFinish: new Date('2024-01-05'),
        lateStart: new Date('2024-01-03'),
        lateFinish: new Date('2024-01-08'),
      };

      const totalFloat = floatCalculator.calculateTotalFloat(task);
      expect(totalFloat).toBe(3);
    });

    it('should identify critical tasks (zero float)', () => {
      const task = {
        id: 'T1',
        name: 'Critical Task',
        duration: 5,
        earlyStart: new Date('2024-01-01'),
        earlyFinish: new Date('2024-01-05'),
        lateStart: new Date('2024-01-01'),
        lateFinish: new Date('2024-01-05'),
      };

      const totalFloat = floatCalculator.calculateTotalFloat(task);
      expect(Math.abs(totalFloat)).toBeLessThan(DEFAULT_EPSILON);
    });

    it('should calculate free float correctly', () => {
      const task = {
        id: 'T1',
        name: 'Test Task',
        duration: 5,
        earlyStart: new Date('2024-01-01'),
        earlyFinish: new Date('2024-01-05'),
        lateStart: new Date('2024-01-01'),
        lateFinish: new Date('2024-01-05'),
      };

      const successors: never[] = [];
      const freeFloat = floatCalculator.calculateFreeFloat(task, successors);
      expect(typeof freeFloat).toBe('number');
      expect(freeFloat).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Batch Float Operations', () => {
    it('should handle batch float calculations', () => {
      const tasks = [
        {
          id: 'T1',
          name: 'Task 1',
          duration: 3,
          earlyStart: new Date('2024-01-01'),
          earlyFinish: new Date('2024-01-03'),
          lateStart: new Date('2024-01-01'),
          lateFinish: new Date('2024-01-03'),
        },
        {
          id: 'T2',
          name: 'Task 2',
          duration: 5,
          earlyStart: new Date('2024-01-04'),
          earlyFinish: new Date('2024-01-08'),
          lateStart: new Date('2024-01-04'),
          lateFinish: new Date('2024-01-08'),
        },
        {
          id: 'T3',
          name: 'Task 3',
          duration: 2,
          earlyStart: new Date('2024-01-09'),
          earlyFinish: new Date('2024-01-10'),
          lateStart: new Date('2024-01-09'),
          lateFinish: new Date('2024-01-10'),
        },
      ];

      const dependencies: never[] = [];
      const result = floatCalculator.calculateBatchFloat(tasks, dependencies);

      expect(result.processedTasks.length).toBe(tasks.length);
      expect(result.successCount).toBe(tasks.length);
      expect(result.errors.length).toBe(0);
    });
  });
});

describe('Module 5.4 - Critical Path Analyzer Tests', () => {
  let _module54Service: Module54Service;
  let _floatCalculator: FloatCalculator;
  let criticalPathAnalyzer: CriticalPathAnalyzer;
  let _taskFlagAssigner: TaskFlagAssigner;

  beforeEach(() => {
    _module54Service = new Module54Service();
    _floatCalculator = new FloatCalculator();
    criticalPathAnalyzer = new CriticalPathAnalyzer();
    _taskFlagAssigner = new TaskFlagAssigner();
  });

  it('should identify critical tasks', () => {
    const tasks = [
      { id: 'T1', name: 'Task 1', duration: 3, totalFloat: 0 },
      { id: 'T2', name: 'Task 2', duration: 5, totalFloat: 2 },
      { id: 'T3', name: 'Task 3', duration: 2, totalFloat: 0 },
    ];

    const criticalTasks = criticalPathAnalyzer.identifyCriticalTasks(tasks);
    expect(criticalTasks.length).toBe(2);
    expect(criticalTasks.map((t: { id: string }) => t.id)).toEqual([
      'T1',
      'T3',
    ]);
  });

  it('should build critical path sequences', () => {
    const tasks = [
      { id: 'T1', name: 'Task 1', duration: 3, totalFloat: 0 },
      { id: 'T2', name: 'Task 2', duration: 5, totalFloat: 0 },
    ];

    const dependencies = [
      { id: 'L1', from: 'T1', to: 'T2', type: 'FS' as const, lag: 0 },
    ];

    const paths = criticalPathAnalyzer.buildCriticalPathSequences(
      tasks,
      dependencies
    );
    expect(paths.length).toBeGreaterThan(0);
    expect(paths[0].tasks).toContain('T1');
    expect(paths[0].tasks).toContain('T2');
  });
});

describe('Module 5.4 - Critical Path Metrics Tests', () => {
  let _module54Service: Module54Service;
  let _floatCalculator: FloatCalculator;
  let criticalPathAnalyzer: CriticalPathAnalyzer;
  let _taskFlagAssigner: TaskFlagAssigner;

  beforeEach(() => {
    _module54Service = new Module54Service();
    _floatCalculator = new FloatCalculator();
    criticalPathAnalyzer = new CriticalPathAnalyzer();
    _taskFlagAssigner = new TaskFlagAssigner();
  });

  it('should calculate path metrics', () => {
    const paths = [
      {
        id: 'PATH1',
        tasks: ['T1', 'T2'],
        totalDuration: 8,
        startDate: new Date(),
        endDate: new Date(),
        pathLength: 2,
        isLongest: true,
        riskLevel: 'MEDIUM' as const,
      },
    ];

    const metrics = calculateCriticalPathMetrics(paths);
    expect(metrics.duration).toBe(8);
    expect(metrics.taskCount).toBe(2);
    expect(metrics.complexityScore).toBeGreaterThan(0);
  });

  it('should validate path continuity', () => {
    const path = {
      id: 'PATH1',
      tasks: ['T1', 'T2'],
      totalDuration: 8,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-09'),
      pathLength: 2,
      isLongest: true,
      riskLevel: 'MEDIUM' as const,
    };

    const dependencies = [
      { id: 'L1', from: 'T1', to: 'T2', type: 'FS' as const, lag: 0 },
    ];

    const validation = criticalPathAnalyzer.validateCriticalPathContinuity(
      path,
      dependencies
    );
    expect(validation.isValid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });
});

describe('Module 5.4 - Task Flag Assignment Tests', () => {
  let _module54Service: Module54Service;
  let _floatCalculator: FloatCalculator;
  let _criticalPathAnalyzer: CriticalPathAnalyzer;
  let taskFlagAssigner: TaskFlagAssigner;

  beforeEach(() => {
    _module54Service = new Module54Service();
    _floatCalculator = new FloatCalculator();
    _criticalPathAnalyzer = new CriticalPathAnalyzer();
    taskFlagAssigner = new TaskFlagAssigner();
  });

  it('should assign critical flags correctly', () => {
    const task = {
      id: 'T1',
      name: 'Critical Task',
      duration: 5,
      totalFloat: 0,
    };
    const criticalTaskIds = ['T1'];

    const flags = taskFlagAssigner.assignTaskFlags(task, criticalTaskIds);
    expect(flags.length).toBeGreaterThan(0);
    expect(flags.some((f: { type: string }) => f.type === 'CRITICAL')).toBe(
      true
    );
  });

  it('should assign near-critical flags', () => {
    const task = {
      id: 'T2',
      name: 'Near Critical',
      duration: 3,
      totalFloat: 0.5,
    };
    const flags = taskFlagAssigner.assignTaskFlags(task, []);
    expect(
      flags.some((f: { type: string }) => f.type === 'NEAR_CRITICAL')
    ).toBe(true);
  });

  it('should assign high float flags', () => {
    const task = {
      id: 'T3',
      name: 'High Float',
      duration: 2,
      totalFloat: 10,
    };
    const flags = taskFlagAssigner.assignTaskFlags(task, []);
    expect(flags.some((f: { type: string }) => f.type === 'HIGH_FLOAT')).toBe(
      true
    );
  });
});

describe('Module 5.4 - Task Flag Summary Tests', () => {
  let _module54Service: Module54Service;
  let _floatCalculator: FloatCalculator;
  let _criticalPathAnalyzer: CriticalPathAnalyzer;
  let taskFlagAssigner: TaskFlagAssigner;

  beforeEach(() => {
    _module54Service = new Module54Service();
    _floatCalculator = new FloatCalculator();
    _criticalPathAnalyzer = new CriticalPathAnalyzer();
    taskFlagAssigner = new TaskFlagAssigner();
  });

  it('should generate flag summary', () => {
    const assignments = [
      {
        taskId: 'T1',
        flags: [
          {
            id: 'F1',
            type: 'CRITICAL' as const,
            taskId: 'T1',
            description: '',
            severity: 'WARNING' as const,
            metadata: {},
            createdAt: new Date(),
          },
        ],
        assignedAt: new Date(),
        isValid: true,
      },
    ];

    const summary = taskFlagAssigner.generateFlagSummary(assignments);
    expect(summary.totalTasks).toBe(1);
    expect(summary.tasksWithFlags).toBe(1);
    expect(summary.flagStatistics.length).toBeGreaterThan(0);
  });

  it('should validate flag consistency', () => {
    const flags = [
      {
        id: 'F1',
        type: 'CRITICAL' as const,
        taskId: 'T1',
        description: '',
        severity: 'WARNING' as const,
        metadata: { floatValue: 0 },
        createdAt: new Date(),
      },
    ];

    const validation = taskFlagAssigner.validateTaskFlags(flags);
    expect(validation.isValid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });
});

describe('Module 5.4 - Service Integration Tests', () => {
  let module54Service: Module54Service;
  let _floatCalculator: FloatCalculator;
  let _criticalPathAnalyzer: CriticalPathAnalyzer;
  let _taskFlagAssigner: TaskFlagAssigner;

  beforeEach(() => {
    module54Service = new Module54Service();
    _floatCalculator = new FloatCalculator();
    _criticalPathAnalyzer = new CriticalPathAnalyzer();
    _taskFlagAssigner = new TaskFlagAssigner();
  });

  it('should execute complete Module 5.4 process', async () => {
    const input = {
      tasks: [
        {
          id: 'T1',
          name: 'Task 1',
          duration: 3,
          earlyStart: new Date('2024-01-01'),
          earlyFinish: new Date('2024-01-04'),
          lateStart: new Date('2024-01-01'),
          lateFinish: new Date('2024-01-04'),
        },
        {
          id: 'T2',
          name: 'Task 2',
          duration: 5,
          earlyStart: new Date('2024-01-04'),
          earlyFinish: new Date('2024-01-09'),
          lateStart: new Date('2024-01-04'),
          lateFinish: new Date('2024-01-09'),
        },
      ],
      dependencies: [
        { id: 'L1', from: 'T1', to: 'T2', type: 'FS' as const, lag: 0 },
      ],
      forwardPassResult: {
        tasks: [],
        projectStartDate: new Date('2024-01-01'),
        projectEndDate: new Date('2024-01-09'),
      },
      backwardPassResult: {
        tasks: [],
        criticalPath: [],
        totalProjectFloat: 0,
      },
    };

    const result = await module54Service.executeModule54(input);
    expect(result.success).toBe(true);
    expect(result.tasksWithFlags.length).toBe(2);
    expect(result.errors.length).toBe(0);
  });

  it('should handle errors gracefully', async () => {
    const invalidInput = {
      tasks: [],
      dependencies: [],
      forwardPassResult: {
        tasks: [],
        projectStartDate: new Date(),
        projectEndDate: new Date(),
      },
      backwardPassResult: {
        tasks: [],
        criticalPath: [],
        totalProjectFloat: 0,
      },
    };

    const result = await module54Service.executeModule54(invalidInput);
    expect(result.success).toBe(true);
    expect(result.tasksWithFlags.length).toBe(0);
  });

  it('should maintain configuration consistency', () => {
    const config = module54Service.getConfiguration();
    expect(config.epsilon).toBe(DEFAULT_EPSILON);
    expect(typeof config.enableMultipleCriticalPaths).toBe('boolean');
    expect(typeof config.enableDetailedValidation).toBe('boolean');
  });
});

describe('Module 5.4 - Edge Cases and Error Handling', () => {
  let _module54Service: Module54Service;
  let _floatCalculator: FloatCalculator;
  let criticalPathAnalyzer: CriticalPathAnalyzer;
  let taskFlagAssigner: TaskFlagAssigner;

  beforeEach(() => {
    _module54Service = new Module54Service();
    _floatCalculator = new FloatCalculator();
    criticalPathAnalyzer = new CriticalPathAnalyzer();
    taskFlagAssigner = new TaskFlagAssigner();
  });

  it('should handle empty task arrays', () => {
    const criticalTasks = criticalPathAnalyzer.identifyCriticalTasks([]);
    expect(criticalTasks.length).toBe(0);
  });

  it('should handle missing float values', () => {
    const task = { id: 'T1', name: 'Task without float', duration: 5 };
    const flags = taskFlagAssigner.assignTaskFlags(task, []);
    expect(flags.length).toBeGreaterThan(0);
  });

  it('should handle negative float values', () => {
    const task = {
      id: 'T1',
      name: 'Negative Float',
      duration: 5,
      totalFloat: -2,
    };
    const flags = taskFlagAssigner.assignTaskFlags(task, []);
    expect(
      flags.some((f: { type: string }) => f.type === 'NEGATIVE_FLOAT')
    ).toBe(true);
  });

  it('should handle circular dependencies gracefully', () => {
    const tasks = [
      { id: 'T1', name: 'Task 1', duration: 3, totalFloat: 0 },
      { id: 'T2', name: 'Task 2', duration: 5, totalFloat: 0 },
    ];

    const circularDeps = [
      { id: 'L1', from: 'T1', to: 'T2', type: 'FS' as const, lag: 0 },
      { id: 'L2', from: 'T2', to: 'T1', type: 'FS' as const, lag: 0 },
    ];

    const paths = criticalPathAnalyzer.buildCriticalPathSequences(
      tasks,
      circularDeps
    );
    expect(Array.isArray(paths)).toBe(true);
  });
});
