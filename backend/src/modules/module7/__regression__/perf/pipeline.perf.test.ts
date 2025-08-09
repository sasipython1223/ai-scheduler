/**
 * Performance Tests for Module 7.x
 * Validates performance benchmarks and scalability requirements
 */

import { performance } from "perf_hooks";
import { createTaskPreparationPipeline } from "../../7.1-constraint-engine";
import { createOptimizationFacade } from "../../7.2-intelligent-optimization";
import { createResourceConstraintManager } from "../../7.3-resource-integration";
import { makeData, makeDetministicData } from "../helpers/make-fixtures";
import {
  expectIntegration,
  expectOptimization,
  expectPerformance,
} from "../helpers/validate-results";

// Performance test timeouts (longer than regular tests)
// jest.setTimeout(30000); // This is handled in jest.config.json

describe("Module 7.x Performance Tests", () => {
  describe("Benchmark Requirements", () => {
    test("1k tasks with 150 resources completes < 500ms", async () => {
      const testData = makeData({ tasks: 1000, resources: 150, days: 20 });

      const startTime = performance.now();

      // Stage 1: Task Preparation (7.1)
      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      // Stage 2: Optimization (7.2) - GA only for fastest execution
      const optimizationFacade = createOptimizationFacade();
      const optimized = await optimizationFacade.run({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
        timeBudgetMs: 250, // Half the total budget for optimization
      });

      // Stage 3: Resource Integration (7.3) - Greedy for speed
      const resourceManager = createResourceConstraintManager();
      const integrated = await resourceManager.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: false },
        hardCaps: { maxOverallocPct: 15 },
        calendars: testData.calendars,
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Validate results
      expectOptimization(optimized);
      expectIntegration(integrated);

      // Validate performance requirement
      expectPerformance(totalTime, 500, 1000);

      console.log(
        `Performance: ${totalTime.toFixed(2)}ms for 1k tasks, ${prepared.resources.length} resources`,
      );
      console.log(`  - Preparation: instant`);
      console.log(
        `  - Optimization: ${optimized.metrics?.timeElapsed || "N/A"}ms`,
      );
      console.log(
        `  - Integration: ~${(totalTime - (optimized.metrics?.timeElapsed || 0)).toFixed(2)}ms`,
      );
    });

    test("500 tasks with 75 resources completes < 250ms", async () => {
      const testData = makeData({ tasks: 500, resources: 75, days: 15 });

      const startTime = performance.now();

      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      const optimizationFacade = createOptimizationFacade();
      const optimized = await optimizationFacade.run({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
        timeBudgetMs: 150,
      });

      const resourceManager = createResourceConstraintManager();
      const integrated = await resourceManager.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: false },
        hardCaps: { maxOverallocPct: 10 },
        calendars: testData.calendars,
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expectOptimization(optimized);
      expectIntegration(integrated);
      expectPerformance(totalTime, 250, 500);

      console.log(
        `Mid-scale performance: ${totalTime.toFixed(2)}ms for 500 tasks`,
      );
    });

    test("100 tasks with 20 resources completes < 100ms", async () => {
      const testData = makeData({ tasks: 100, resources: 20, days: 10 });

      const startTime = performance.now();

      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      const optimizationFacade = createOptimizationFacade();
      const optimized = await optimizationFacade.run({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
        timeBudgetMs: 75,
      });

      const resourceManager = createResourceConstraintManager();
      const integrated = await resourceManager.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: false },
        hardCaps: { maxOverallocPct: 5 },
        calendars: testData.calendars,
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expectOptimization(optimized);
      expectIntegration(integrated);
      expectPerformance(totalTime, 100, 100);

      console.log(
        `Small-scale performance: ${totalTime.toFixed(2)}ms for 100 tasks`,
      );
    });
  });

  describe("Scalability Analysis", () => {
    test("performance scales linearly with task count", async () => {
      const testSizes = [
        { tasks: 50, resources: 10, expectedMaxTime: 50 },
        { tasks: 100, resources: 20, expectedMaxTime: 100 },
        { tasks: 200, resources: 40, expectedMaxTime: 200 },
      ];

      const timings: Array<{
        size: number;
        time: number;
        timePerTask: number;
      }> = [];

      for (const { tasks, resources, expectedMaxTime } of testSizes) {
        const testData = makeDetministicData(tasks * 17); // Vary seed by size

        const startTime = performance.now();

        const preparationPipeline = createTaskPreparationPipeline();
        const prepared = preparationPipeline.prepare(testData);

        const optimizationFacade = createOptimizationFacade();
        const optimized = await optimizationFacade.run({
          tasks: prepared.tasks.slice(0, tasks), // Limit to requested size
          resources: prepared.resources.slice(0, resources),
          flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
          timeBudgetMs: expectedMaxTime * 0.6,
        });

        expectOptimization(optimized);

        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const timePerTask = totalTime / tasks;

        timings.push({ size: tasks, time: totalTime, timePerTask });

        expectPerformance(totalTime, expectedMaxTime, tasks);

        console.log(
          `Scale ${tasks} tasks: ${totalTime.toFixed(2)}ms (${timePerTask.toFixed(3)}ms/task)`,
        );
      }

      // Validate that performance scales reasonably
      for (let i = 1; i < timings.length; i++) {
        const current = timings[i];
        const previous = timings[i - 1];

        // Time per task should not increase dramatically (within 2x)
        expect(current.timePerTask).toBeLessThan(previous.timePerTask * 2);
      }
    });

    test("memory usage remains reasonable", async () => {
      // Test with large dataset to check memory efficiency
      const testData = makeData({ tasks: 800, resources: 120, days: 25 });

      // Get initial memory usage
      const initialMemory = process.memoryUsage();

      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      const optimizationFacade = createOptimizationFacade();
      const optimized = await optimizationFacade.run({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
        timeBudgetMs: 400,
      });

      expectOptimization(optimized);

      const resourceManager = createResourceConstraintManager();
      const integrated = await resourceManager.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: false },
        hardCaps: { maxOverallocPct: 20 },
        calendars: testData.calendars,
      });

      expectIntegration(integrated);

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      console.log(
        `Memory usage: ${memoryIncreaseMB.toFixed(2)}MB for 800 tasks`,
      );

      // Memory increase should be reasonable (less than 100MB for this scale)
      expect(memoryIncreaseMB).toBeLessThan(100);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
    });
  });

  describe("Algorithm Performance Comparison", () => {
    test("GA vs SA vs ML performance characteristics", async () => {
      const testData = makeDetministicData(456); // Consistent data
      const results: Array<{ algorithm: string; time: number; score: number }> =
        [];

      const algorithms = [
        {
          name: "GA",
          flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
        },
        {
          name: "SA",
          flags: { ENABLE_GA: false, ENABLE_SA: true, ENABLE_ML: false },
        },
        {
          name: "ML",
          flags: { ENABLE_GA: false, ENABLE_SA: false, ENABLE_ML: true },
        },
      ];

      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      for (const { name, flags } of algorithms) {
        const startTime = performance.now();

        const optimizationFacade = createOptimizationFacade();
        const result = await optimizationFacade.run({
          tasks: prepared.tasks,
          resources: prepared.resources,
          flags,
          timeBudgetMs: 200,
        });

        const endTime = performance.now();
        const time = endTime - startTime;

        expectOptimization(result);

        results.push({
          algorithm: name,
          time,
          score: result.best?.score || 0,
        });

        console.log(
          `${name} algorithm: ${time.toFixed(2)}ms, score: ${result.best?.score?.toFixed(2) || "N/A"}`,
        );
      }

      // All algorithms should complete within reasonable time
      for (const result of results) {
        expect(result.time).toBeLessThan(300);
      }
    });

    test("Greedy vs Leveling strategy performance", async () => {
      const testData = makeDetministicData(789); // Consistent data
      const strategies = [
        {
          name: "Greedy",
          flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: false },
        },
        {
          name: "Leveling",
          flags: { ENABLE_GREEDY: false, ENABLE_LEVELING: true },
        },
        {
          name: "Hybrid",
          flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: true },
        },
      ];

      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      for (const { name, flags } of strategies) {
        const startTime = performance.now();

        const resourceManager = createResourceConstraintManager();
        const result = await resourceManager.integrate({
          tasks: prepared.tasks,
          resources: prepared.resources,
          flags,
          hardCaps: { maxOverallocPct: 15 },
          calendars: testData.calendars,
        });

        const endTime = performance.now();
        const time = endTime - startTime;

        expectIntegration(result);

        console.log(`${name} strategy: ${time.toFixed(2)}ms`);

        // All strategies should complete quickly
        expect(time).toBeLessThan(100);
      }
    });
  });

  describe("Stress Testing", () => {
    test("handles maximum realistic load", async () => {
      // Simulate a very large enterprise scenario
      const testData = makeData({ tasks: 2000, resources: 300, days: 30 });

      const startTime = performance.now();

      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      // Use shorter time budget for stress test
      const optimizationFacade = createOptimizationFacade();
      const optimized = await optimizationFacade.run({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
        timeBudgetMs: 800, // Longer budget for large scale
      });

      const resourceManager = createResourceConstraintManager();
      const integrated = await resourceManager.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: false },
        hardCaps: { maxOverallocPct: 25 }, // More flexible for stress test
        calendars: testData.calendars,
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Validate that system handles stress load without crashing
      expectOptimization(optimized);
      expectIntegration(integrated);

      console.log(
        `Stress test: ${totalTime.toFixed(2)}ms for 2k tasks, 300 resources`,
      );

      // Should complete within reasonable time even under stress
      expect(totalTime).toBeLessThan(2000); // 2 seconds max for stress test
    });

    test("concurrent pipeline executions", async () => {
      // Test multiple pipelines running concurrently
      const concurrentRuns = 5;
      const promises: Promise<any>[] = [];

      for (let i = 0; i < concurrentRuns; i++) {
        const testData = makeDetministicData(100 + i); // Slight variation per run

        const promise = (async () => {
          const startTime = performance.now();

          const preparationPipeline = createTaskPreparationPipeline();
          const prepared = preparationPipeline.prepare(testData);

          const optimizationFacade = createOptimizationFacade();
          const optimized = await optimizationFacade.run({
            tasks: prepared.tasks.slice(0, 50), // Smaller for concurrent test
            resources: prepared.resources.slice(0, 10),
            flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
            timeBudgetMs: 100,
          });

          const endTime = performance.now();
          return { time: endTime - startTime, optimized };
        })();

        promises.push(promise);
      }

      const results = await Promise.all(promises);

      // All concurrent runs should complete successfully
      for (const result of results) {
        expectOptimization(result.optimized);
        expect(result.time).toBeLessThan(200); // Should not be significantly slower due to concurrency
        console.log(`Concurrent run: ${result.time.toFixed(2)}ms`);
      }
    });
  });

  describe("Performance Regression Detection", () => {
    test("baseline performance remains consistent", async () => {
      // Use deterministic data for consistent baseline
      const baselineData = makeDetministicData(42);
      const runs = 3; // Multiple runs to check consistency
      const timings: number[] = [];

      for (let i = 0; i < runs; i++) {
        const startTime = performance.now();

        const preparationPipeline = createTaskPreparationPipeline();
        const prepared = preparationPipeline.prepare(baselineData);

        const optimizationFacade = createOptimizationFacade();
        const optimized = await optimizationFacade.run({
          tasks: prepared.tasks,
          resources: prepared.resources,
          flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
          timeBudgetMs: 150,
        });

        const endTime = performance.now();
        timings.push(endTime - startTime);

        expectOptimization(optimized);
      }

      const avgTime =
        timings.reduce((sum, time) => sum + time, 0) / timings.length;
      const maxDeviation = Math.max(
        ...timings.map((time) => Math.abs(time - avgTime)),
      );

      console.log(
        `Baseline performance: ${avgTime.toFixed(2)}ms ±${maxDeviation.toFixed(2)}ms`,
      );

      // Performance should be consistent across runs (within 50% deviation)
      expect(maxDeviation).toBeLessThan(avgTime * 0.5);

      // Average time should meet baseline requirement
      expect(avgTime).toBeLessThan(200);
    });
  });
});
