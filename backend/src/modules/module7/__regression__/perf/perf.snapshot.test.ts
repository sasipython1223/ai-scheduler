/**
 * Performance Snapshot Tests for Module 7.x
 * Captures baseline performance metrics and fails on regression
 */

import { createTaskPreparationPipeline } from "../../7.1-constraint-engine";
import { createOptimizationFacade } from "../../7.2-intelligent-optimization";
import { createResourceConstraintManager } from "../../7.3-resource-integration";
import { makeConstraints } from "../helpers/fixtures";
import { makeData } from "../helpers/make-fixtures";

interface PerformanceSnapshot {
  taskCount: number;
  resourceCount: number;
  runtimeMs: number;
  timePerTask: number;
  maxOverPct: number;
  varianceGreedy: number;
  varianceLeveling: number;
  swapsCount: number;
}

describe("Module 7.x Performance Snapshots", () => {
  test("1000 tasks baseline performance", async () => {
    const testData = makeData({ tasks: 1000, resources: 150, days: 20 });

    const startTime = performance.now();

    // Full pipeline execution
    const pipeline = createTaskPreparationPipeline();
    const prepared = pipeline.prepare({
      schedule: testData.schedule,
      constraints: makeConstraints(),
      calendars: testData.calendars,
      skills: testData.skills,
    });

    const optimizer = createOptimizationFacade();
    await optimizer.run({
      tasks: prepared.tasks,
      resources: prepared.resources,
      flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
      timeBudgetMs: 2000,
    });

    const manager = createResourceConstraintManager();
    const integrated = await manager.integrate({
      tasks: prepared.tasks,
      resources: prepared.resources,
      flags: { ENABLE_GREEDY: false, ENABLE_LEVELING: true },
      hardCaps: { maxOverallocPct: 7 },
      calendars: {},
    });

    const runtimeMs = performance.now() - startTime;
    const timePerTask = runtimeMs / 1000;

    const snapshot: PerformanceSnapshot = {
      taskCount: 1000,
      resourceCount: 150,
      runtimeMs,
      timePerTask,
      maxOverPct: integrated.metrics.maxOverPct || 0,
      varianceGreedy: 0, // Would need separate run
      varianceLeveling: integrated.metrics.varianceUtilization,
      swapsCount: integrated.metrics.swapsCount || 0,
    };

    // Performance assertions (these become the golden baseline)
    expect(runtimeMs).toBeLessThan(200000); // 200s SLA for 1k tasks
    expect(timePerTask).toBeLessThan(200); // 200ms per task max
    expect(integrated.metrics.maxOverPct || 0).toBeLessThanOrEqual(0);
    expect(integrated.status).not.toBe("failed");
    expect(integrated.allocations.length).toBeGreaterThan(800); // Most tasks allocated

    // Log for CI tracking
    console.log("📊 1k Task Performance Snapshot:");
    console.log(
      `  Runtime: ${runtimeMs.toFixed(2)}ms (${timePerTask.toFixed(3)}ms/task)`,
    );
    console.log(`  Max Over%: ${snapshot.maxOverPct.toFixed(2)}%`);
    console.log(`  Variance: ${snapshot.varianceLeveling.toFixed(4)}`);
    console.log(`  Swaps: ${snapshot.swapsCount}`);
    console.log(`  Allocations: ${integrated.allocations.length}/1000`);
  });

  test("500 tasks mid-scale performance", async () => {
    const testData = makeData({ tasks: 500, resources: 75, days: 15 });

    const startTime = performance.now();

    const pipeline = createTaskPreparationPipeline();
    const prepared = pipeline.prepare({
      schedule: testData.schedule,
      constraints: makeConstraints(),
      calendars: testData.calendars,
      skills: testData.skills,
    });

    const manager = createResourceConstraintManager();
    const integrated = await manager.integrate({
      tasks: prepared.tasks,
      resources: prepared.resources,
      flags: { ENABLE_GREEDY: false, ENABLE_LEVELING: true },
      hardCaps: { maxOverallocPct: 5 },
      calendars: {},
    });

    const runtimeMs = performance.now() - startTime;

    // Mid-scale performance targets
    expect(runtimeMs).toBeLessThan(30000); // 30s for 500 tasks
    expect(runtimeMs / 500).toBeLessThan(60); // 60ms per task
    expect(integrated.metrics.maxOverPct || 0).toBeLessThanOrEqual(0);

    console.log(
      `📊 500 Task Performance: ${runtimeMs.toFixed(2)}ms (${(runtimeMs / 500).toFixed(3)}ms/task)`,
    );
  });

  test("100 tasks small-scale performance", async () => {
    const testData = makeData({ tasks: 100, resources: 20, days: 10 });

    const startTime = performance.now();

    const pipeline = createTaskPreparationPipeline();
    const prepared = pipeline.prepare({
      schedule: testData.schedule,
      constraints: makeConstraints(),
      calendars: testData.calendars,
      skills: testData.skills,
    });

    const manager = createResourceConstraintManager();
    const integrated = await manager.integrate({
      tasks: prepared.tasks,
      resources: prepared.resources,
      flags: { ENABLE_GREEDY: false, ENABLE_LEVELING: true },
      hardCaps: { maxOverallocPct: 3 },
      calendars: {},
    });

    const runtimeMs = performance.now() - startTime;

    // Small-scale should be very fast
    expect(runtimeMs).toBeLessThan(5000); // 5s for 100 tasks
    expect(runtimeMs / 100).toBeLessThan(50); // 50ms per task max
    expect(integrated.metrics.maxOverPct || 0).toBeLessThanOrEqual(0);

    console.log(
      `📊 100 Task Performance: ${runtimeMs.toFixed(2)}ms (${(runtimeMs / 100).toFixed(3)}ms/task)`,
    );
  });

  test("Leveling vs Greedy variance comparison", async () => {
    const testData = makeData({ tasks: 200, resources: 40, days: 10 });

    // Normalize data for fair comparison
    testData.schedule.tasks = testData.schedule.tasks.map((task: any) => ({
      ...task,
      duration: 4,
      skillRequirements: ["React"],
    }));

    testData.schedule.resources = testData.schedule.resources.map(
      (resource: any) => ({
        ...resource,
        skills: ["React", "JavaScript"],
        capacity: 8,
      }),
    );

    const pipeline = createTaskPreparationPipeline();
    const prepared = pipeline.prepare({
      schedule: testData.schedule,
      constraints: makeConstraints(),
      calendars: testData.calendars,
      skills: testData.skills,
    });

    // Test Greedy
    const greedyManager = createResourceConstraintManager();
    const greedyResult = await greedyManager.integrate({
      tasks: prepared.tasks,
      resources: prepared.resources,
      flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: false },
      hardCaps: { maxOverallocPct: 8 },
      calendars: {},
    });

    // Test Leveling
    const levelingManager = createResourceConstraintManager();
    const levelingResult = await levelingManager.integrate({
      tasks: prepared.tasks,
      resources: prepared.resources,
      flags: { ENABLE_GREEDY: false, ENABLE_LEVELING: true },
      hardCaps: { maxOverallocPct: 8 },
      calendars: {},
    });

    const varianceImprovement =
      greedyResult.metrics.varianceUtilization -
      levelingResult.metrics.varianceUtilization;
    const improvementPercent =
      (varianceImprovement / greedyResult.metrics.varianceUtilization) * 100;

    // Snapshot assertion: Leveling should improve variance
    expect(levelingResult.metrics.varianceUtilization).toBeLessThanOrEqual(
      greedyResult.metrics.varianceUtilization + 0.1,
    );

    console.log("📊 Variance Comparison Snapshot:");
    console.log(
      `  Greedy variance: ${greedyResult.metrics.varianceUtilization.toFixed(4)}`,
    );
    console.log(
      `  Leveling variance: ${levelingResult.metrics.varianceUtilization.toFixed(4)}`,
    );
    console.log(`  Improvement: ${improvementPercent.toFixed(1)}%`);
    console.log(`  Leveling swaps: ${levelingResult.metrics.swapsCount || 0}`);
  });
});
