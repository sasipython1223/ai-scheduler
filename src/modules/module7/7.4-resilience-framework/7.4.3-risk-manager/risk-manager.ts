import { ContingencyPlanner } from "../../../../../backend/src/modules/module7/7.4-resilience-framework/7.4.2-contingency-planner/contingency-planner";
import { Schedule } from "../../../../../backend/src/modules/module7/7.4-resilience-framework/shared-types";
import {
  BuiltInStrategies,
  MitigationResult,
  MitigationStrategy,
  RiskIndicator,
} from "./mitigation-strategies";
import { RiskMonitor } from "./risk-monitor";

export interface RiskManagerConfig {
  strategyWhitelist?: string[]; // optional allow-list
  maxMitigationsPerCycle?: number; // default 2
  minImprovement?: number; // minimum absolute improvement (e.g., 0.02)
  budgetMinutes?: number; // time budget for a cycle
}

export interface RiskCycleResult {
  applied: Array<{
    indicator: string;
    strategyId: string;
    result: MitigationResult;
  }>;
  skipped: Array<{ indicator: string; reason: string }>;
  schedule: Schedule;
}

export class RiskManager {
  constructor(
    private readonly monitor = new RiskMonitor(),
    private readonly planner = new ContingencyPlanner(),
    private readonly strategies: MitigationStrategy[] = BuiltInStrategies,
    private readonly cfg: RiskManagerConfig = {}
  ) {}

  /** High-level: assess risks and apply mitigations within a cycle */
  runCycle(schedule: Schedule): RiskCycleResult {
    const maxApply = this.cfg.maxMitigationsPerCycle ?? 2;
    const minGain = this.cfg.minImprovement ?? 0.02;
    const budget = this.cfg.budgetMinutes ?? 60;

    const indicators = this.monitor.assess(schedule);
    const applied: RiskCycleResult["applied"] = [];
    const skipped: RiskCycleResult["skipped"] = [];

    let cur = schedule;
    let remaining = maxApply;

    for (const ind of indicators) {
      if (remaining <= 0) break;
      const strat = this.selectStrategy(ind);
      if (!strat) {
        skipped.push({ indicator: ind.metric, reason: "no-strategy" });
        continue;
      }
      if (strat.executionTime > budget) {
        skipped.push({ indicator: ind.metric, reason: "over-budget" });
        continue;
      }

      const res = strat.apply({
        schedule: cur,
        indicator: ind,
        budgetMinutes: budget,
      });
      const gain = this.estimateImprovement(ind, res);

      if (gain >= minGain && res.success) {
        cur = res.newSchedule;
        applied.push({
          indicator: ind.metric,
          strategyId: strat.id,
          result: res,
        });
        remaining -= 1;
      } else {
        // Consider fallback: pick best alternative plan (read-only here, we just rank)
        const alts = this.planner.generateContingencyPlans(cur);
        if (alts.length === 0) {
          skipped.push({ indicator: ind.metric, reason: "no-gain" });
        } else {
          skipped.push({ indicator: ind.metric, reason: "no-gain-use-plan" });
          // In a later phase we can auto-apply top-ranked contingency
        }
      }
    }

    return { applied, skipped, schedule: cur };
  }

  /** Strategy selection: filter by risk type, allow-list, then choose lowest cost with highest successRate */
  selectStrategy(ind: RiskIndicator): MitigationStrategy | undefined {
    const allowed = (s: MitigationStrategy) =>
      (!this.cfg.strategyWhitelist ||
        this.cfg.strategyWhitelist.includes(s.id)) &&
      s.riskTypes.includes(ind.metric);
    const pool = this.strategies.filter(allowed);
    if (pool.length === 0) return undefined;

    // rank: successRate desc, costFactor asc, executionTime asc, id asc
    return pool.sort(
      (a, b) =>
        b.successRate - a.successRate ||
        a.costFactor - b.costFactor ||
        a.executionTime - b.executionTime ||
        a.id.localeCompare(b.id)
    )[0];
  }

  /** Simple improvement estimator: uses metricsDelta if present; else 0 */
  private estimateImprovement(
    ind: RiskIndicator,
    res: MitigationResult
  ): number {
    const key = ind.metric;
    const d = res.metricsDelta?.[key];
    return typeof d === "number" ? Math.abs(d) : 0;
  }
}
