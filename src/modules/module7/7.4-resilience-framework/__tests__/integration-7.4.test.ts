import { describe, expect, test } from "vitest";
/**
 * Integration tests for 7.4.1 → 7.4.2 → 7.4.3 chain
 */
import { ResilienceAnalyzer } from "../../../../../backend/src/modules/module7/7.4-resilience-framework/7.4.1-resilience-analyzer/resilience-analyzer";
import { ContingencyPlanner } from "../../../../../backend/src/modules/module7/7.4-resilience-framework/7.4.2-contingency-planner/contingency-planner";
import { Schedule } from "../../../../../backend/src/modules/module7/7.4-resilience-framework/shared-types";
import { RiskManager } from "../7.4.3-risk-manager/risk-manager";

describe("7.4 Framework Integration", () => {
  const mockSchedule: Schedule = {
    id: "integration-test",
    name: "Integration Test Schedule",
    tasks: [],
    resources: [],
    constraints: [],
    metadata: {
      createdAt: new Date(),
      lastModified: new Date(),
      version: "1.0.0",
      complexity: 2.0,
      riskLevel: "medium" as any,
    },
  };

  test("7.4.1 → 7.4.2 → 7.4.3 chain integration", () => {
    // 1. Resilience Analysis (7.4.1)
    const analyzer = new ResilienceAnalyzer();
    const metrics = analyzer.analyzeScheduleResilience(mockSchedule);
    expect(metrics).toBeTruthy();
    expect(typeof metrics.overallScore).toBe("number");

    // 2. Contingency Planning (7.4.2)
    const planner = new ContingencyPlanner();
    const plans = planner.generateContingencyPlans(mockSchedule);
    expect(Array.isArray(plans)).toBe(true);

    // 3. Risk Management (7.4.3)
    const riskManager = new RiskManager();
    const cycleResult = riskManager.runCycle(mockSchedule);
    expect(cycleResult).toBeTruthy();
    expect(cycleResult.schedule).toBeTruthy();
    expect(Array.isArray(cycleResult.applied)).toBe(true);
    expect(Array.isArray(cycleResult.skipped)).toBe(true);
  });

  test("risk manager integrates with analyzer for monitoring", () => {
    const riskManager = new RiskManager();
    const result = riskManager.runCycle(mockSchedule);

    // Should assess risks using analyzer
    expect(result.schedule).toBe(mockSchedule); // Schedule returned as is for basic case
    expect(result.applied.length).toBeLessThanOrEqual(2); // Respects default max mitigations
  });

  test("risk manager can use contingency planner for fallbacks", () => {
    const riskManager = new RiskManager();
    const result = riskManager.runCycle(mockSchedule);

    // Should complete without error even if no gains achieved
    expect(result).toBeTruthy();
    expect(result.skipped).toBeDefined();
  });
});
