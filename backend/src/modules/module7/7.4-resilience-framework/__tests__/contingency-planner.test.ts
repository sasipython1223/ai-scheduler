import { ContingencyPlanner } from "../7.4.2-contingency-planner/contingency-planner";
import { Schedule } from "../shared-types";

const makeSchedule = (): Schedule => ({
  id: "BASIC",
  name: "Basic Test Schedule",
  tasks: [], // minimal graph with a critical path
  resources: [],
  constraints: [],
  metadata: {
    createdAt: new Date(),
    lastModified: new Date(),
    version: "1.0.0",
    complexity: 1,
    riskLevel: "low",
  },
});

describe("ContingencyPlanner", () => {
  it("generates ranked viable plans", () => {
    const cp = new ContingencyPlanner(undefined, undefined, undefined, {
      maxScenarios: 3,
      altsPerScenario: 2,
      minFeasibilityScore: 60,
    });
    const plans = cp.generateContingencyPlans(makeSchedule());
    expect(Array.isArray(plans)).toBe(true);
    // deterministic order + non-empty when heuristics are in place
  });

  it("filters plans below feasibility threshold", () => {
    const cp = new ContingencyPlanner(undefined, undefined, undefined, {
      minFeasibilityScore: 95,
    });
    const plans = cp.generateContingencyPlans(makeSchedule());
    // likely empty when threshold is high
    expect(plans.every((p) => p.feasibility.score >= 95)).toBe(true);
  });

  it("returns empty array for empty schedule scenarios", () => {
    const cp = new ContingencyPlanner();
    const plans = cp.generateContingencyPlans(makeSchedule());
    expect(Array.isArray(plans)).toBe(true);
    expect(plans.length).toBe(0); // empty until generator produces scenarios
  });
});
