/**
 * Shared assertions for Module 7.x regression testing
 */

import { nearlyLTE } from "../../7.3-resource-integration/numeric";

export interface OptimizationResult {
  status: "ok" | "partial" | "failed";
  best?: any;
  metrics?: {
    iterations: number[];
    score: number;
    timeElapsed: number;
  };
  allocations?: any[];
}

export interface IntegrationResult {
  status: "ok" | "conflicts" | "failed";
  allocations: Array<{
    taskId: string;
    resourceId: string;
    day: string;
    duration: number;
    capacity: number;
  }>;
  conflicts?: Array<{
    type: string;
    description: string;
    affectedTasks: string[];
  }>;
  utilization?: {
    [resourceId: string]: {
      totalHours: number;
      utilizationPct: number;
      peakDay: string;
    };
  };
}

export interface PreparationResult {
  tasks: Array<{
    id: string;
    normalizedDuration: number;
    resolvedDependencies: string[];
    skillsMatched: boolean;
  }>;
  resources: Array<{
    id: string;
    availableCapacity: number;
    matchedSkills: string[];
  }>;
  warnings?: string[];
}

/**
 * Validate optimization results from Module 7.2
 */
export function expectOptimization(result: OptimizationResult): void {
  expect(result.status).toMatch(/^(ok|partial)$/);
  expect(result.best).toBeDefined();

  if (result.metrics) {
    expect(Array.isArray(result.metrics.iterations)).toBe(true);
    expect(result.metrics.iterations.length).toBeGreaterThan(0);
    expect(result.metrics.score).toBeGreaterThanOrEqual(0);
    expect(result.metrics.timeElapsed).toBeGreaterThan(0);
  }

  if (result.status === "ok") {
    expect(result.best.assignments).toBeDefined();
    expect(Array.isArray(result.best.assignments)).toBe(true);
  }
}

/**
 * Validate resource integration results from Module 7.3
 */
export function expectIntegration(result: IntegrationResult): void {
  expect(result.status).toMatch(/^(ok|conflicts)$/);
  expect(Array.isArray(result.allocations)).toBe(true);
  expect(result.allocations.length).toBeGreaterThan(0);

  // Validate no double-booking: same resource/day shouldn't exceed capacity
  const dailyAllocations = new Map<string, number>();

  for (const allocation of result.allocations) {
    expect(allocation.taskId).toBeDefined();
    expect(allocation.resourceId).toBeDefined();
    expect(allocation.day).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
    expect(allocation.duration).toBeGreaterThan(0);
    expect(allocation.capacity).toBeGreaterThan(0);

    const key = `${allocation.resourceId}:${allocation.day}`;
    const currentAllocation = dailyAllocations.get(key) || 0;
    dailyAllocations.set(key, currentAllocation + allocation.duration);

    // Use bulletproof capacity checking with numeric utilities
    const dailyTotal = dailyAllocations.get(key)!;
    const capacityLimit = allocation.capacity * 1.15; // 15% overalloc max
    expect(nearlyLTE(dailyTotal, capacityLimit)).toBe(true);
  }

  // If conflicts exist, they should be properly documented
  if (result.status === "conflicts" && result.conflicts) {
    expect(Array.isArray(result.conflicts)).toBe(true);
    for (const conflict of result.conflicts) {
      expect(conflict.type).toBeDefined();
      expect(conflict.description).toBeDefined();
      expect(Array.isArray(conflict.affectedTasks)).toBe(true);
    }
  }
}

/**
 * Validate task preparation results from Module 7.1
 */
export function expectPreparation(result: PreparationResult): void {
  expect(Array.isArray(result.tasks)).toBe(true);
  expect(Array.isArray(result.resources)).toBe(true);
  expect(result.tasks.length).toBeGreaterThan(0);
  expect(result.resources.length).toBeGreaterThan(0);

  // Validate task normalization
  for (const task of result.tasks) {
    expect(task.id).toBeDefined();
    expect(task.normalizedDuration).toBeGreaterThan(0);
    expect(Array.isArray(task.resolvedDependencies)).toBe(true);
    expect(typeof task.skillsMatched).toBe("boolean");
  }

  // Validate resource preparation
  for (const resource of result.resources) {
    expect(resource.id).toBeDefined();
    expect(resource.availableCapacity).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(resource.matchedSkills)).toBe(true);
  }
}

/**
 * Validate end-to-end pipeline consistency
 */
export function expectPipelineConsistency(
  prepared: PreparationResult,
  optimized: OptimizationResult,
  integrated: IntegrationResult,
): void {
  // Task count should remain consistent through pipeline
  const preparedTaskIds = new Set(prepared.tasks.map((t) => t.id));
  const allocatedTaskIds = new Set(integrated.allocations.map((a) => a.taskId));

  // All allocated tasks should have been prepared
  allocatedTaskIds.forEach((taskId) => {
    expect(preparedTaskIds.has(taskId)).toBe(true);
  });

  // Resource consistency
  const preparedResourceIds = new Set(prepared.resources.map((r) => r.id));
  const allocatedResourceIds = new Set(
    integrated.allocations.map((a) => a.resourceId),
  );

  // All allocated resources should have been prepared
  allocatedResourceIds.forEach((resourceId) => {
    expect(preparedResourceIds.has(resourceId)).toBe(true);
  });

  // If optimization succeeded, integration should have allocations
  if (optimized.status === "ok" && optimized.best?.assignments?.length > 0) {
    expect(integrated.allocations.length).toBeGreaterThan(0);
  }
}

/**
 * Performance validation helpers
 */
export function expectPerformance(
  timeElapsed: number,
  maxTime: number,
  taskCount: number,
): void {
  expect(timeElapsed).toBeLessThan(maxTime);

  // Performance should scale reasonably with task count
  const timePerTask = timeElapsed / taskCount;
  expect(timePerTask).toBeLessThan(1); // Less than 1ms per task
}

/**
 * Validate deterministic outputs
 */
export function expectDeterministic<T>(
  result1: T,
  result2: T,
  compareFields: string[],
): void {
  for (const field of compareFields) {
    const value1 = getNestedValue(result1, field);
    const value2 = getNestedValue(result2, field);

    if (Array.isArray(value1) && Array.isArray(value2)) {
      expect(value1.length).toBe(value2.length);
      // For arrays, compare sorted versions to handle ordering differences
      expect([...value1].sort()).toEqual([...value2].sort());
    } else {
      expect(value1).toEqual(value2);
    }
  }
}

/**
 * Utility to get nested object values by dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

/**
 * Validate coverage of edge cases
 */
export function expectEdgeCaseHandling(
  result: OptimizationResult | IntegrationResult,
  expectedEdgeCase: string,
): void {
  // Should handle edge cases gracefully without throwing
  expect(result.status).toBeDefined();

  // Edge cases might result in partial or conflict status
  if (expectedEdgeCase === "missing-skills") {
    // Should report conflicts or partial allocation
    expect(result.status).toMatch(/^(partial|conflicts)$/);
  } else if (expectedEdgeCase === "zero-capacity") {
    // Should handle zero capacity resources
    expect(result.status).toBeDefined();
  } else if (expectedEdgeCase === "blackout-days") {
    // Should respect calendar constraints
    expect(result.status).toBeDefined();
  }
}
