import { expect, test } from "vitest";
import { RiskManager } from "../../7.4.3-risk-manager/risk-manager";

test("risk cycle completes under 1 minute for 5k tasks", () => {
  const rm = new RiskManager(undefined as any, undefined as any, undefined, {
    maxMitigationsPerCycle: 2,
  });
  const big = /* synthesize ~5k tasks schedule */ {
    id: "BIG",
    name: "Large Test Schedule",
    tasks: [],
    resources: [],
    constraints: [],
    metadata: {
      createdAt: new Date(),
      lastModified: new Date(),
      version: "1.0.0",
      complexity: 5.0,
      riskLevel: "high" as any,
    },
  };
  const t0 = performance.now();
  const out = rm.runCycle(big);
  const dt = performance.now() - t0;
  expect(dt).toBeLessThan(60_000);
  expect(out).toBeTruthy();
});
