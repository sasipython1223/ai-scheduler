import { ResilienceAnalyzer } from "../7.4.1-resilience-analyzer/resilience-analyzer";
import { Schedule } from "../shared-types";
import { AlternativeScheduler, ContingencyPlan } from "./alternative-scheduler";
import { ScenarioGenerator } from "./scenario-generator";

export interface PlannerConfig {
  maxScenarios?: number; // default 5
  altsPerScenario?: number; // default 3
  minFeasibilityScore?: number; // default 70
}

export class ContingencyPlanner {
  constructor(
    private readonly scenarios = new ScenarioGenerator(),
    private readonly alt = new AlternativeScheduler(),
    private readonly analyzer = new ResilienceAnalyzer(),
    private readonly cfg: PlannerConfig = {},
  ) {}

  /** Main entry: generate, rank, and return viable plans */
  generateContingencyPlans(schedule: Schedule): ContingencyPlan[] {
    const maxS = this.cfg.maxScenarios ?? 5;
    const k = this.cfg.altsPerScenario ?? 3;
    const minF = this.cfg.minFeasibilityScore ?? 70;

    const scenarios = this.scenarios.generate(schedule, 42, maxS);
    const plans: ContingencyPlan[] = [];

    for (const s of scenarios) {
      const alts = this.alt.generateAlternatives(schedule, s, k);
      for (const alt of alts) {
        const plan: ContingencyPlan = {
          scenarioId: s.id,
          alternativeSchedule: alt,
          mitigationActions: [], // TODO: fill from strategies later
          implementationTime: 30, // default until measured
          resourceRequirements: [], // derive deltas
          successProbability: this.estimateSuccess(alt),
          feasibility: { feasible: true, violations: [], score: 0 },
        };
        plan.feasibility = this.alt.validatePlan(plan);
        if (plan.feasibility.score >= minF && plan.feasibility.feasible) {
          plans.push(plan);
        }
      }
    }

    // Rank by (feasibility.score desc, successProbability desc, analyzer.overallScore desc)
    return plans.sort((a, b) => {
      const sa = this.analyzer.analyzeScheduleResilience(
        a.alternativeSchedule,
      ).overallScore;
      const sb = this.analyzer.analyzeScheduleResilience(
        b.alternativeSchedule,
      ).overallScore;
      return (
        b.feasibility.score - a.feasibility.score ||
        b.successProbability - a.successProbability ||
        sb - sa
      );
    });
  }

  private estimateSuccess(alt: Schedule): number {
    // Convert resilience to success prob (simple monotone map to start)
    const r = this.analyzer.analyzeScheduleResilience(alt).overallScore; // 0..100
    return Math.min(1, Math.max(0, 0.4 + 0.006 * r)); // 0.4..1.0
  }
}
