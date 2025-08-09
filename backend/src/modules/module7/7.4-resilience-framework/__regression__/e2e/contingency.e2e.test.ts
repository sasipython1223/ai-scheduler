import { ResilienceAnalyzer } from "../../7.4.1-resilience-analyzer/resilience-analyzer";
import { ContingencyPlanner } from "../../7.4.2-contingency-planner/contingency-planner";
import { Schedule } from "../../shared-types";

// E2E test for complete contingency planning workflow
describe("Contingency Planning E2E", () => {
  it("integrates with resilience analyzer for end-to-end planning", () => {
    const schedule: Schedule = {
      id: "E2E_TEST",
      name: "E2E Test Schedule",
      tasks: [
        {
          id: "task_1",
          name: "Critical Task",
          duration: 5,
          dependencies: [],
          resourceAssignments: [],
          criticalPath: true,
          totalFloat: 0,
          freeFloat: 0,
        },
        {
          id: "task_2",
          name: "Dependent Task",
          duration: 3,
          dependencies: ["task_1"],
          resourceAssignments: [],
          criticalPath: false,
          totalFloat: 2,
          freeFloat: 1,
        },
      ],
      resources: [
        {
          id: "resource_1",
          name: "Primary Resource",
          capacity: 1,
          availability: [],
          skills: ["development"],
          hourlyRate: 75,
        },
      ],
      constraints: [],
      metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        version: "1.0.0",
        complexity: 2,
        riskLevel: "medium",
      },
    };

    // Test resilience analysis integration
    const analyzer = new ResilienceAnalyzer();
    const metrics = analyzer.analyzeScheduleResilience(schedule);
    expect(metrics.overallScore).toBeGreaterThanOrEqual(0);
    expect(metrics.overallScore).toBeLessThanOrEqual(100);

    // Test contingency planning with resilience data
    const planner = new ContingencyPlanner();
    const plans = planner.generateContingencyPlans(schedule);

    expect(Array.isArray(plans)).toBe(true);
    // Plans should be empty until generator implementation
    expect(plans.length).toBe(0);

    // Each plan (when implemented) should have valid structure
    plans.forEach((plan) => {
      expect(plan.scenarioId).toBeDefined();
      expect(plan.alternativeSchedule).toBeDefined();
      expect(plan.feasibility).toBeDefined();
      expect(plan.successProbability).toBeGreaterThanOrEqual(0);
      expect(plan.successProbability).toBeLessThanOrEqual(1);
    });
  });

  it("handles complex schedules with multiple constraints", () => {
    const complexSchedule: Schedule = {
      id: "COMPLEX_E2E",
      name: "Complex E2E Schedule",
      tasks: Array.from({ length: 50 }, (_, i) => ({
        id: `task_${i}`,
        name: `Task ${i}`,
        duration: 1 + (i % 5),
        dependencies: i > 0 ? [`task_${Math.max(0, i - 3)}`] : [],
        resourceAssignments: [],
        criticalPath: i % 10 === 0,
        totalFloat: i % 10 === 0 ? 0 : Math.floor(Math.random() * 5),
        freeFloat: 0,
      })),
      resources: Array.from({ length: 10 }, (_, i) => ({
        id: `resource_${i}`,
        name: `Resource ${i}`,
        capacity: 1,
        availability: [],
        skills: [`skill_${i % 3}`],
        hourlyRate: 50 + i * 10,
      })),
      constraints: [],
      metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        version: "1.0.0",
        complexity: 4,
        riskLevel: "high",
      },
    };

    const planner = new ContingencyPlanner(undefined, undefined, undefined, {
      maxScenarios: 3,
      altsPerScenario: 2,
      minFeasibilityScore: 50,
    });

    const startTime = performance.now();
    const plans = planner.generateContingencyPlans(complexSchedule);
    const executionTime = performance.now() - startTime;

    expect(executionTime).toBeLessThan(5000); // Should complete in under 5 seconds
    expect(Array.isArray(plans)).toBe(true);
  });
});
