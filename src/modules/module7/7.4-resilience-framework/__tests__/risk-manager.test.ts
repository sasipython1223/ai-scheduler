import { describe, expect, it } from "vitest";
import { Schedule } from "../../../../../backend/src/modules/module7/7.4-resilience-framework/shared-types";
import { RiskManager } from "../7.4.3-risk-manager/risk-manager";

const sched: Schedule = {
  id: "S",
  name: "Test Schedule",
  tasks: [],
  resources: [],
  constraints: [],
  metadata: {
    createdAt: new Date(),
    lastModified: new Date(),
    version: "1.0.0",
    complexity: 1.0,
    riskLevel: "low" as any,
  },
};

describe("RiskManager", () => {
  it("assesses risks and applies up to N mitigations", () => {
    const rm = new RiskManager(undefined as any, undefined as any, undefined, {
      maxMitigationsPerCycle: 2,
      minImprovement: 0.01,
    });
    const out = rm.runCycle(sched);
    expect(out.applied.length).toBeLessThanOrEqual(2);
    expect(out.schedule).toBeTruthy();
  });

  it("respects whitelist and budget", () => {
    const rm = new RiskManager(undefined as any, undefined as any, undefined, {
      strategyWhitelist: ["buffer-time"],
      budgetMinutes: 5,
    });
    const out = rm.runCycle(sched);
    // buffer-time fits time budget; others should be skipped
    expect(out.applied.every((a) => a.strategyId === "buffer-time")).toBe(true);
  });
});
