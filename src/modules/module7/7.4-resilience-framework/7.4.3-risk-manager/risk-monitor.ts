import { ResilienceAnalyzer } from "../../../../../backend/src/modules/module7/7.4-resilience-framework/7.4.1-resilience-analyzer/resilience-analyzer";
import { Schedule } from "../../../../../backend/src/modules/module7/7.4-resilience-framework/shared-types";
import {
  RiskIndicator,
  RiskSeverity,
  RiskTrend,
} from "./mitigation-strategies";

export interface MonitorConfig {
  thresholds?: Partial<Record<string, number>>; // e.g., { criticalPathRisk: 0.6 }
  hysteresis?: number; // 0..1 to avoid alert flapping (default 0.05)
}

export class RiskMonitor {
  constructor(
    private readonly analyzer = new ResilienceAnalyzer(),
    private readonly cfg: MonitorConfig = {}
  ) {}

  assess(schedule: Schedule): RiskIndicator[] {
    const m = this.analyzer.analyzeScheduleResilience(schedule);
    const th = (k: string, d: number) => this.cfg.thresholds?.[k] ?? d;

    const indicators: RiskIndicator[] = [
      this.mk(
        "criticalPathRisk",
        m.criticalPathRisk,
        th("criticalPathRisk", 0.6)
      ),
      this.mk("resourceRisk", m.resourceRisk, th("resourceRisk", 0.6)),
      this.mk("dependencyRisk", m.dependencyRisk, th("dependencyRisk", 0.6)),
      this.mk(
        "bufferSufficiency",
        1 - m.bufferSufficiency,
        th("bufferSufficiency", 0.4)
      ), // invert: low buffer => high risk
    ];

    // Deterministic sorting by severity desc then metric asc
    return indicators.sort(
      (a, b) =>
        this.sevRank(b.severity) - this.sevRank(a.severity) ||
        a.metric.localeCompare(b.metric)
    );
  }

  private mk(metric: string, value: number, threshold: number): RiskIndicator {
    const over = value >= threshold;
    const margin = value - threshold;
    const severity: RiskSeverity =
      value >= threshold + 0.25
        ? "critical"
        : value >= threshold + 0.15
          ? "high"
          : value >= threshold + 0.05
            ? "medium"
            : over
              ? "low"
              : "low";
    const trend: RiskTrend = "stable"; // TODO: allow rolling window trends
    return {
      id: `${metric}`,
      metric,
      currentValue: value,
      threshold,
      trend,
      severity,
      details: `Δ=${margin.toFixed(3)}`,
    };
  }

  private sevRank(s: RiskSeverity): number {
    return { low: 1, medium: 2, high: 3, critical: 4 }[s];
  }
}
