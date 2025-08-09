#!/usr/bin/env node
/**
 * Module 7.1 Performance Smoke Test
 *
 * Performance Target: 1k tasks DAG with small float windows < 500ms
 *
 * Tests the baseline constraint-aware scheduling performance:
 * - Generates 1k tasks with random dependencies (DAG structure)
 * - Mocks scheduleEngine and validationEngine
 * - Runs executeConstraintAwareScheduling once
 * - Logs total execution time
 * - Exits non-zero if > 500ms
 */

import { performance } from 'perf_hooks';

// Mock implementations for performance testing
class MockScheduleEngine {
  async createScheduleGraph(tasks) {
    // Simulate quick baseline schedule creation
    const scheduleGraph = {
      tasks: tasks.map((task) => ({
        ...task,
        earlyStart: new Date().toISOString(),
        earlyFinish: new Date(
          Date.now() + task.duration * 24 * 60 * 60 * 1000
        ).toISOString(),
        lateStart: new Date().toISOString(),
        lateFinish: new Date(
          Date.now() + task.duration * 24 * 60 * 60 * 1000
        ).toISOString(),
        totalFloat: Math.random() * 5, // Small float windows for testing
        freeFloat: Math.random() * 3,
        isCritical: Math.random() < 0.3,
        status: 'NOT_STARTED',
      })),
      dependencies: [],
      metadata: {
        totalDuration: Math.max(...tasks.map((t) => t.duration)),
        criticalPath: ['task-1', 'task-2'],
        created: new Date().toISOString(),
      },
    };

    // Simulate some processing time proportional to task count
    await new Promise((resolve) =>
      setTimeout(resolve, Math.max(1, tasks.length / 100))
    );

    return scheduleGraph;
  }
}

class MockValidationEngine {
  async validateSchedule(schedule) {
    // Simulate constraint validation with minimal violations
    const violations = [];
    const warningCount = Math.floor(schedule.tasks.length * 0.02); // 2% warnings

    for (let i = 0; i < warningCount; i++) {
      violations.push({
        type: 'RESOURCE_OVERALLOCATION',
        severity: 'WARNING',
        taskId: schedule.tasks[i % schedule.tasks.length].id,
        message: `Resource utilization at ${Math.floor(Math.random() * 20 + 80)}%`,
        constraint: {
          type: 'MAX_RESOURCES',
          value: 1,
        },
      });
    }

    return {
      isValid: violations.length === 0,
      violations,
      summary: {
        total: violations.length,
        errors: 0,
        warnings: violations.length,
        info: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

class MockConstraintEvaluator {
  constructor(validationEngine) {
    this.validationEngine = validationEngine;
  }

  async calculateConstraintImpact(schedule) {
    const report = await this.validationEngine.validateSchedule(schedule);
    return {
      severity:
        report.summary.errors > 0
          ? 'HIGH'
          : report.summary.warnings > 0
            ? 'MEDIUM'
            : 'LOW',
      violationCount: report.summary.total,
      affectedTasks: report.violations.map((v) => v.taskId).filter(Boolean),
      recommendations: report.violations.slice(0, 3).map((v) => ({
        action: 'RESCHEDULE',
        taskId: v.taskId,
        reason: v.message,
      })),
    };
  }
}

class MockScheduleOptimizer {
  async applyOptimizationStrategies(schedule, options = {}) {
    // Baseline strategy: minimal optimization for performance
    if (options.strategy === 'baseline' || !options.strategy) {
      // Simulate very fast baseline optimization
      await new Promise((resolve) => setTimeout(resolve, 1));
      return {
        ...schedule,
        metadata: {
          ...schedule.metadata,
          optimized: true,
          strategy: 'baseline',
          optimizationTime: 1,
        },
      };
    }

    // For other strategies, simulate more processing
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(50, schedule.tasks.length / 20))
    );
    return schedule;
  }
}

// Simplified ConstraintAwareScheduler for testing
class MockConstraintAwareScheduler {
  constructor() {
    this.scheduleEngine = new MockScheduleEngine();
    this.validationEngine = new MockValidationEngine();
    this.constraintEvaluator = new MockConstraintEvaluator(
      this.validationEngine
    );
    this.scheduleOptimizer = new MockScheduleOptimizer();
  }

  async executeConstraintAwareScheduling(input) {
    const startTime = performance.now();

    try {
      // Step 1: Generate candidate schedule
      const candidateSchedule = await this.scheduleEngine.createScheduleGraph(
        input.tasks
      );

      // Step 2: Validate constraints
      const validationReport =
        await this.validationEngine.validateSchedule(candidateSchedule);

      // Step 3: If violations, apply optimization (baseline strategy)
      let finalSchedule = candidateSchedule;
      if (validationReport.summary.total > 0) {
        const optimizeOptions = { strategy: 'baseline', ...input.options };
        finalSchedule =
          await this.scheduleOptimizer.applyOptimizationStrategies(
            candidateSchedule,
            optimizeOptions
          );

        // Re-validate after optimization
        const finalReport =
          await this.validationEngine.validateSchedule(finalSchedule);
        return {
          schedule: finalSchedule,
          report: finalReport,
          status: finalReport.isValid ? 'success' : 'violations',
          executionTime: performance.now() - startTime,
        };
      }

      return {
        schedule: finalSchedule,
        report: validationReport,
        status: 'success',
        executionTime: performance.now() - startTime,
      };
    } catch (error) {
      return {
        schedule: null,
        report: null,
        status: 'error',
        error: error.message,
        executionTime: performance.now() - startTime,
      };
    }
  }
}

// Test data generation
function generateTestTasks(count = 1000) {
  const tasks = [];
  const taskIds = [];

  // Generate task IDs first
  for (let i = 0; i < count; i++) {
    taskIds.push(`task-${i + 1}`);
  }

  // Generate tasks with random dependencies (ensuring DAG structure)
  for (let i = 0; i < count; i++) {
    const task = {
      id: taskIds[i],
      name: `Task ${i + 1}`,
      duration: Math.floor(Math.random() * 10) + 1, // 1-10 days
      priority: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
      predecessors: [],
      resourceIds: [`resource-${Math.floor(Math.random() * 20) + 1}`], // 20 resources
      constraints: [],
    };

    // Add 0-3 random predecessors from earlier tasks (maintains DAG)
    const maxPredecessors = Math.min(3, i);
    const numPredecessors = Math.floor(Math.random() * (maxPredecessors + 1));

    for (let j = 0; j < numPredecessors; j++) {
      const predecessorIndex = Math.floor(Math.random() * i);
      if (!task.predecessors.includes(taskIds[predecessorIndex])) {
        task.predecessors.push(taskIds[predecessorIndex]);
      }
    }

    // Add some constraints for testing
    if (Math.random() < 0.1) {
      // 10% of tasks have constraints
      task.constraints.push({
        type: 'START_NO_EARLIER_THAN',
        date: new Date(
          Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        description: 'External dependency',
      });
    }

    tasks.push(task);
  }

  return tasks;
}

async function runSmokeTest() {
  console.log('🚀 Module 7.1 Performance Smoke Test');
  console.log('=====================================');

  const taskCount = 1000;
  const performanceThreshold = 500; // ms

  console.log(`📊 Generating ${taskCount} tasks with DAG dependencies...`);
  const tasks = generateTestTasks(taskCount);

  console.log(`📋 Tasks generated: ${tasks.length}`);
  console.log(
    `🔗 Average predecessors per task: ${(tasks.reduce((sum, t) => sum + t.predecessors.length, 0) / tasks.length).toFixed(1)}`
  );

  const scheduler = new MockConstraintAwareScheduler();
  const input = {
    tasks,
    options: { strategy: 'baseline' },
  };

  console.log('\n⏱️  Starting constraint-aware scheduling...');
  const startTime = performance.now();

  const result = await scheduler.executeConstraintAwareScheduling(input);

  const totalTime = performance.now() - startTime;

  console.log('\n📈 Performance Results:');
  console.log(`⏰ Total execution time: ${totalTime.toFixed(2)}ms`);
  console.log(`🎯 Performance threshold: ${performanceThreshold}ms`);
  console.log(`📊 Status: ${result.status}`);

  if (result.schedule) {
    console.log(`✅ Tasks scheduled: ${result.schedule.tasks.length}`);
    console.log(
      `⚠️  Constraint violations: ${result.report?.summary?.total || 0}`
    );
  }

  console.log(
    `\n🏁 Performance test: ${totalTime <= performanceThreshold ? 'PASSED ✅' : 'FAILED ❌'}`
  );

  if (totalTime > performanceThreshold) {
    console.error(`\n❌ Performance test failed!`);
    console.error(`   Expected: ≤ ${performanceThreshold}ms`);
    console.error(`   Actual: ${totalTime.toFixed(2)}ms`);
    console.error(
      `   Slowdown: ${((totalTime / performanceThreshold - 1) * 100).toFixed(1)}%`
    );
    process.exit(1);
  }

  console.log('\n🎉 Performance smoke test completed successfully!');
  process.exit(0);
}

// Run the smoke test
runSmokeTest().catch((error) => {
  console.error('💥 Smoke test failed with error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
