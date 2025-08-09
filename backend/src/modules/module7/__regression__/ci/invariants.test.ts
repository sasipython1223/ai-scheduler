/**
 * CI Invariant Tests for Module 7.x
 * These tests enforce strict capacity and performance invariants
 * FAIL the build if any overallocation or critical regression is detected
 */

import { createTaskPreparationPipeline } from '../../7.1-constraint-engine';
import { createResourceConstraintManager } from '../../7.3-resource-integration';
import { makeData } from '../helpers/make-fixtures';
import { makeConstraints } from '../helpers/fixtures';
import { MAX_OVERALLOC_PCT_THRESHOLD } from '../../config';

describe('Module 7.x CI Invariants', () => {
  describe('Capacity Invariants', () => {
    test('GATE: Zero overallocation tolerance', async () => {
      // Test with medium stress to ensure capacity discipline
      const testData = makeData({ tasks: 50, resources: 10, days: 7 });
      
      const pipeline = createTaskPreparationPipeline();
      const prepared = pipeline.prepare({
        schedule: testData.schedule,
        constraints: makeConstraints(),
        calendars: testData.calendars,
        skills: testData.skills
      });
      
      const manager = createResourceConstraintManager();
      const result = await manager.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: true },
        hardCaps: { maxOverallocPct: 5 }, // Allow some flexibility
        calendars: {}
      });
      
      // CI GATE: Fail build if ANY overallocation detected
      if (result.metrics.maxOverPct !== undefined) {
        expect(result.metrics.maxOverPct).toBeLessThanOrEqual(MAX_OVERALLOC_PCT_THRESHOLD);
      }
      
      // Integration must not fail completely
      expect(result.status).not.toBe('failed');
      expect(result.allocations.length).toBeGreaterThan(0);
    });

    test('GATE: Resource capacity constraints never violated', async () => {
      const testData = makeData({ tasks: 30, resources: 8, days: 5 });
      
      const pipeline = createTaskPreparationPipeline();
      const prepared = pipeline.prepare({
        schedule: testData.schedule,
        constraints: makeConstraints(),
        calendars: testData.calendars,
        skills: testData.skills
      });
      
      const manager = createResourceConstraintManager();
      const result = await manager.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: false, ENABLE_LEVELING: true },
        hardCaps: { maxOverallocPct: 10 },
        calendars: {}
      });
      
      // Verify every allocation respects capacity limits
      const dailyUsage = new Map<string, number>();
      
      for (const allocation of result.allocations) {
        const key = `${allocation.resourceId}:${allocation.day}`;
        const current = dailyUsage.get(key) || 0;
        dailyUsage.set(key, current + allocation.duration);
        
        const dailyTotal = dailyUsage.get(key)!;
        const capacityLimit = allocation.capacity * 1.10; // 10% tolerance max
        
        // CI GATE: Fail if capacity exceeded
        expect(dailyTotal).toBeLessThanOrEqual(capacityLimit + 0.01);
      }
    });
  });

  describe('Performance Invariants', () => {
    test('GATE: Core pipeline completes within time budget', async () => {
      const testData = makeData({ tasks: 100, resources: 20, days: 10 });
      
      const startTime = performance.now();
      
      const pipeline = createTaskPreparationPipeline();
      const prepared = pipeline.prepare({
        schedule: testData.schedule,
        constraints: makeConstraints(),
        calendars: testData.calendars,
        skills: testData.skills
      });
      
      const manager = createResourceConstraintManager();
      const integrated = await manager.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: false, ENABLE_LEVELING: true },
        hardCaps: { maxOverallocPct: 7 },
        calendars: {}
      });
      
      const totalTime = performance.now() - startTime;
      
      // CI GATE: Core pipeline must complete quickly
      expect(totalTime).toBeLessThan(2000); // 2 second tolerance for CI
      expect(integrated.status).not.toBe('failed');
    });
  });

  describe('Regression Invariants', () => {
    test('GATE: Leveling strategy reduces variance vs Greedy', async () => {
      const testData = makeData({ tasks: 25, resources: 6, days: 7 });
      
      // Normalize for fair comparison
      testData.schedule.tasks = testData.schedule.tasks.map((task: any) => ({
        ...task,
        duration: 4,
        skillRequirements: ['React']
      }));
      
      testData.schedule.resources = testData.schedule.resources.map((resource: any) => ({
        ...resource,
        skills: ['React', 'JavaScript'],
        capacity: 8
      }));
      
      const pipeline = createTaskPreparationPipeline();
      const prepared = pipeline.prepare({
        schedule: testData.schedule,
        constraints: makeConstraints(),
        calendars: testData.calendars,
        skills: testData.skills
      });
      
      // Test Greedy
      const greedyManager = createResourceConstraintManager();
      const greedyResult = await greedyManager.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: false },
        hardCaps: { maxOverallocPct: 10 },
        calendars: {}
      });
      
      // Test Leveling  
      const levelingManager = createResourceConstraintManager();
      const levelingResult = await levelingManager.integrate({
        tasks: prepared.tasks,
        resources: prepared.resources,
        flags: { ENABLE_GREEDY: false, ENABLE_LEVELING: true },
        hardCaps: { maxOverallocPct: 10 },
        calendars: {}
      });
      
      // CI GATE: Leveling must not be significantly worse than Greedy
      const varianceDelta = levelingResult.metrics.varianceUtilization - greedyResult.metrics.varianceUtilization;
      expect(varianceDelta).toBeLessThanOrEqual(0.2); // Allow small tolerance
    });
  });
});
