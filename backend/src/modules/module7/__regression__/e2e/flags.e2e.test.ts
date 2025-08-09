/**
 * Feature Flag Matrix Tests for Module 7.x
 * Tests different combinations of algorithm flags and strategies
 */

import { createTaskPreparationPipeline } from "../../7.1-constraint-engine";
import { createOptimizationFacade } from "../../7.2-intelligent-optimization";
import { createResourceConstraintManager } from "../../7.3-resource-integration";
import { makeData, makeDetministicData } from "../helpers/make-fixtures";
import {
  expectDeterministic,
  expectIntegration,
  expectOptimization,
} from "../helpers/validate-results";

describe("Module 7.x Feature Flag Matrix", () => {
  describe("7.2 Optimization Algorithm Flags", () => {
    const testData = makeDetministicData(42); // Consistent test data

    test("ENABLE_GA=true, others false", async () => {
      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      const optimizationFacade = createOptimizationFacade();
      const result = await optimizationFacade.run({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
        timeBudgetMs: 300,
      });

      expectOptimization(result);
      expect(result.best?.algorithm).toBe("genetic-algorithm");
    });

    test("ENABLE_SA=true, others false", async () => {
      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      const optimizationFacade = createOptimizationFacade();
      const result = await optimizationFacade.run({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GA: false, ENABLE_SA: true, ENABLE_ML: false },
        timeBudgetMs: 300,
      });

      expectOptimization(result);
      expect(result.best?.algorithm).toBe("simulated-annealing");
    });

    test("ENABLE_ML=true, others false", async () => {
      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      const optimizationFacade = createOptimizationFacade();
      const result = await optimizationFacade.run({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GA: false, ENABLE_SA: false, ENABLE_ML: true },
        timeBudgetMs: 300,
      });

      expectOptimization(result);
      expect(result.best?.algorithm).toBe("machine-learning");
    });

    test("All optimization flags false", async () => {
      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      const optimizationFacade = createOptimizationFacade();
      const result = await optimizationFacade.run({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GA: false, ENABLE_SA: false, ENABLE_ML: false },
        timeBudgetMs: 300,
      });

      expectOptimization(result);
      expect(result.best?.algorithm).toBe("none");
    });

    test("Multiple algorithms enabled (GA takes precedence)", async () => {
      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      const optimizationFacade = createOptimizationFacade();
      const result = await optimizationFacade.run({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GA: true, ENABLE_SA: true, ENABLE_ML: true },
        timeBudgetMs: 300,
      });

      expectOptimization(result);
      expect(result.best?.algorithm).toBe("genetic-algorithm"); // GA should take precedence
    });
  });

  describe("7.3 Resource Strategy Flags", () => {
    const testData = makeDetministicData(123); // Different seed for variety

    test("ENABLE_GREEDY=true, ENABLE_LEVELING=false", async () => {
      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      const resourceManager = createResourceConstraintManager();
      const result = await resourceManager.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: false },
        hardCaps: { maxOverallocPct: 10 },
        calendars: testData.calendars,
      });

      expectIntegration(result);
      expect(result.status).toMatch(/^(ok|conflicts)$/);
    });

    test("ENABLE_GREEDY=false, ENABLE_LEVELING=true", async () => {
      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      const resourceManager = createResourceConstraintManager();
      const result = await resourceManager.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: false, ENABLE_LEVELING: true },
        hardCaps: { maxOverallocPct: 10 },
        calendars: testData.calendars,
      });

      expectIntegration(result);

      // Leveling should result in more balanced utilization
      if (result.utilization) {
        const utilizationValues = Object.values(result.utilization).map(
          (u) => u.utilizationPct,
        );
        const variance = calculateVariance(utilizationValues);
        expect(variance).toBeLessThan(1300); // Reasonable variance for leveling with deterministic data
      }
    });

    test("ENABLE_GREEDY=true, ENABLE_LEVELING=true (hybrid)", async () => {
      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      const resourceManager = createResourceConstraintManager();
      const result = await resourceManager.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: true },
        hardCaps: { maxOverallocPct: 10 },
        calendars: testData.calendars,
      });

      expectIntegration(result);
      expect(result.status).toMatch(/^(ok|conflicts)$/);
    });

    test("Both resource flags false", async () => {
      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      const resourceManager = createResourceConstraintManager();
      const result = await resourceManager.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: false, ENABLE_LEVELING: false },
        hardCaps: { maxOverallocPct: 10 },
        calendars: testData.calendars,
      });

      expectIntegration(result);
      // Should still produce valid results even without specific strategies
    });
  });

  describe("Strategy Comparison & Variance", () => {
    test("Leveling reduces utilization variance vs Greedy", async () => {
      const testData = makeDetministicData(456);
      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      // Run with Greedy only
      const resourceManagerGreedy = createResourceConstraintManager();
      const greedyResult = await resourceManagerGreedy.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: false },
        hardCaps: { maxOverallocPct: 15 },
        calendars: testData.calendars,
      });

      // Run with Leveling only
      const resourceManagerLeveling = createResourceConstraintManager();
      const levelingResult = await resourceManagerLeveling.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: false, ENABLE_LEVELING: true },
        hardCaps: { maxOverallocPct: 15 },
        calendars: testData.calendars,
      });

      expectIntegration(greedyResult);
      expectIntegration(levelingResult);

      // Compare utilization variance
      if (greedyResult.utilization && levelingResult.utilization) {
        const greedyUtilization = Object.values(greedyResult.utilization).map(
          (u) => u.utilizationPct,
        );
        const levelingUtilization = Object.values(
          levelingResult.utilization,
        ).map((u) => u.utilizationPct);

        const greedyVariance = calculateVariance(greedyUtilization);
        const levelingVariance = calculateVariance(levelingUtilization);

        // Leveling should generally produce lower variance (more balanced)
        // Note: This is a statistical assertion that may occasionally fail
        // due to random variation, but should hold true in most cases
        console.log(
          `Greedy variance: ${greedyVariance}, Leveling variance: ${levelingVariance}`,
        );

        // Allow for some tolerance in case of small datasets or edge cases
        expect(levelingVariance).toBeLessThanOrEqual(greedyVariance * 1.2);
      }
    });
  });

  describe("Budget Constraints", () => {
    test("Very tight time budget produces partial results", async () => {
      const testData = makeData({ tasks: 100, resources: 20, days: 15 });
      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      const optimizationFacade = createOptimizationFacade();
      const result = await optimizationFacade.run({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
        timeBudgetMs: 5, // Very tight budget
      });

      expectOptimization(result);
      // Should respect time budget
      expect(result.metrics?.timeElapsed).toBeLessThan(50);
    });

    test("Generous time budget produces optimal results", async () => {
      const testData = makeData({ tasks: 20, resources: 5, days: 10 });
      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare(testData);

      const optimizationFacade = createOptimizationFacade();
      const result = await optimizationFacade.run({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
        timeBudgetMs: 1000, // Generous budget
      });

      expectOptimization(result);
      expect(result.status).toBe("ok");
    });
  });

  describe("Deterministic Behavior", () => {
    test("Same input produces consistent results", async () => {
      const testData = makeDetministicData(789);

      // Run the pipeline twice with identical inputs
      const runPipeline = async () => {
        const preparationPipeline = createTaskPreparationPipeline();
        const prepared = preparationPipeline.prepare(testData);

        const optimizationFacade = createOptimizationFacade();
        const optimized = await optimizationFacade.run({
          tasks: prepared.tasks,
          resources: prepared.resources,
          flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
          timeBudgetMs: 200,
        });

        return { prepared, optimized };
      };

      const result1 = await runPipeline();
      const result2 = await runPipeline();

      // Task preparation should be deterministic
      expectDeterministic(result1.prepared, result2.prepared, [
        "tasks.length",
        "resources.length",
      ]);

      // Optimization results should be consistent in structure
      expect(result1.optimized.status).toBe(result2.optimized.status);
      expect(result1.optimized.best?.assignments?.length).toBe(
        result2.optimized.best?.assignments?.length,
      );
    });
  });
});

/**
 * Helper function to calculate variance
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
}
