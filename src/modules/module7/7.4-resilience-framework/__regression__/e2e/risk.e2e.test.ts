import { expect, test } from "vitest";
import { RiskManager } from "../../7.4.3-risk-manager/risk-manager";

test("7.4 end-to-end: analyzer → planner → risk manager", () => {
  const rm = new RiskManager(); // uses default analyzer/planner internally
  const base = {
    id: "E2E",
    name: "E2E Test Schedule",
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
  const out = rm.runCycle(base);
  expect(out.schedule).toBeTruthy();
  expect(Array.isArray(out.applied)).toBe(true);
});
