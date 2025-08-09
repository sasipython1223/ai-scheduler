/**
 * End-to-End Pipeline Tests for Module 7.x
 * Tests the complete flow: 7.1 → 7.2 → 7.3
 */

import { createTaskPreparationPipeline } from "../../7.1-constraint-engine";
import { createOptimizationFacade } from "../../7.2-intelligent-optimization";
import { createResourceConstraintManager } from "../../7.3-resource-integration";
import { makeData } from "../helpers/make-fixtures";
import {
  expectIntegration,
  expectOptimization,
  expectPipelineConsistency,
  expectPreparation,
} from "../helpers/validate-results";

describe("Module 7.x E2E Pipeline", () => {
  describe("Happy Path Integration", () => {
    test("7.1 → 7.2 → 7.3 pipeline (small dataset)", async () => {
      const { schedule, constraints, calendars, skills } = makeData({
        tasks: 5,
        resources: 3,
        days: 7,
      });

      // Stage 1: Task Preparation (7.1)
      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare({
        schedule,
        constraints,
        calendars,
        skills,
      });

      expectPreparation(prepared);
      expect(prepared.tasks.length).toBe(schedule.tasks.length);

      // Stage 2: Optimization (7.2)
      const optimizationFacade = createOptimizationFacade();
      const optimized = await optimizationFacade.run({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
        timeBudgetMs: 250,
      });

      expectOptimization(optimized);
      expect(optimized.status).toBe("ok");

      // Stage 3: Resource Integration (7.3)
      const resourceManager = createResourceConstraintManager();
      const integrated = await resourceManager.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: false },
        hardCaps: { maxOverallocPct: 0 },
        calendars,
      });

      expectIntegration(integrated);
      expect(integrated.status).toBe("ok");

      // Cross-stage validation
      expectPipelineConsistency(prepared, optimized, integrated);
    });

    test("7.1 → 7.2 → 7.3 pipeline (medium dataset)", async () => {
      const { schedule, constraints, calendars, skills } = makeData({
        tasks: 25,
        resources: 8,
        days: 14,
      });

      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare({
        schedule,
        constraints,
        calendars,
        skills,
      });

      expectPreparation(prepared);

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
        hardCaps: { maxOverallocPct: 10 }, // Allow some overallocation
        calendars,
      });

      expectIntegration(integrated);
      expectPipelineConsistency(prepared, optimized, integrated);
    });

    test("7.1 → 7.2 → 7.3 pipeline (large dataset)", async () => {
      const { schedule, constraints, calendars, skills } = makeData({
        tasks: 100,
        resources: 25,
        days: 20,
      });

      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare({
        schedule,
        constraints,
        calendars,
        skills,
      });

      expectPreparation(prepared);

      const optimizationFacade = createOptimizationFacade();
      const optimized = await optimizationFacade.run({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
        timeBudgetMs: 500,
      });

      expectOptimization(optimized);

      const resourceManager = createResourceConstraintManager();
      const integrated = await resourceManager.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: false },
        hardCaps: { maxOverallocPct: 15 },
        calendars,
      });

      expectIntegration(integrated);
      expectPipelineConsistency(prepared, optimized, integrated);
    });
  });

  describe("Error Handling & Recovery", () => {
    test("handles empty task list gracefully", async () => {
      const { constraints, calendars, skills } = makeData({
        tasks: 5,
        resources: 3,
        days: 7,
      });
      const emptySchedule = { tasks: [], resources: [] };

      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare({
        schedule: emptySchedule,
        constraints,
        calendars,
        skills,
      });

      expect(prepared.tasks).toHaveLength(0);
      expect(prepared.resources).toHaveLength(0);

      // Should handle empty inputs without crashing
      const optimizationFacade = createOptimizationFacade();
      const optimized = await optimizationFacade.run({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
        timeBudgetMs: 100,
      });

      expect(optimized.status).toBeDefined();
    });

    test("handles timeout scenarios", async () => {
      const { schedule, constraints, calendars, skills } = makeData({
        tasks: 50,
        resources: 10,
        days: 14,
      });

      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare({
        schedule,
        constraints,
        calendars,
        skills,
      });

      // Very short time budget
      const optimizationFacade = createOptimizationFacade();
      const optimized = await optimizationFacade.run({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
        timeBudgetMs: 10, // Very short budget
      });

      // Should handle timeout gracefully
      expect(optimized.status).toMatch(/^(ok|partial)$/);
      expect(optimized.metrics?.timeElapsed).toBeLessThan(50); // Should respect budget
    });
  });

  describe("Data Integrity", () => {
    test("maintains task count through pipeline", async () => {
      const { schedule, constraints, calendars, skills } = makeData({
        tasks: 15,
        resources: 5,
        days: 10,
      });

      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare({
        schedule,
        constraints,
        calendars,
        skills,
      });

      expect(prepared.tasks.length).toBe(schedule.tasks.length);

      const optimizationFacade = createOptimizationFacade();
      const optimized = await optimizationFacade.run({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
        timeBudgetMs: 300,
      });

      if (optimized.best?.assignments) {
        const optimizedTaskIds = new Set(
          optimized.best.assignments.map((a: any) => a.taskId),
        );
        expect(optimizedTaskIds.size).toBeLessThanOrEqual(
          prepared.tasks.length,
        );
      }

      const resourceManager = createResourceConstraintManager();
      const integrated = await resourceManager.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: false },
        hardCaps: { maxOverallocPct: 10 },
        calendars,
      });

      const integratedTaskIds = new Set(
        integrated.allocations.map((a) => a.taskId),
      );
      expect(integratedTaskIds.size).toBeLessThanOrEqual(prepared.tasks.length);
    });

    test("validates resource capacity constraints", async () => {
      const { schedule, constraints, calendars, skills } = makeData({
        tasks: 10,
        resources: 3,
        days: 5,
      });

      const preparationPipeline = createTaskPreparationPipeline();
      const prepared = preparationPipeline.prepare({
        schedule,
        constraints,
        calendars,
        skills,
      });

      const resourceManager = createResourceConstraintManager();
      const integrated = await resourceManager.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: false },
        hardCaps: { maxOverallocPct: 0 }, // No overallocation allowed
        calendars,
      });

      // Check that no resource is overallocated beyond capacity
      const dailyAllocations = new Map<string, number>();

      for (const allocation of integrated.allocations) {
        const key = `${allocation.resourceId}:${allocation.day}`;
        const current = dailyAllocations.get(key) || 0;
        dailyAllocations.set(key, current + allocation.duration);

        // Should not exceed capacity (allowing minimal tolerance for rounding)
        expect(dailyAllocations.get(key)!).toBeLessThanOrEqual(
          allocation.capacity + 0.1,
        );
      }
    });
  });
});
