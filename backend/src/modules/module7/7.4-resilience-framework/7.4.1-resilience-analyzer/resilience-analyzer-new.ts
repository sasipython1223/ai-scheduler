import { HealthStatus, Schedule } from "../shared-types";
import { ResilienceMetrics } from "../utils/risk-metrics";
import { RobustnessCalculator } from "./robustness-calculator";
import { VulnerabilityDetector } from "./vulnerability-detector";

export class ResilienceAnalyzer {
  constructor(
    private readonly calc = new RobustnessCalculator(),
    private readonly vuln = new VulnerabilityDetector(),
  ) {}

  analyzeScheduleResilience(schedule: Schedule): ResilienceMetrics {
    const c = this.extractCriticalPathStats(schedule);
    const r = this.extractResourceStats(schedule);
    const d = this.extractDependencyStats(schedule);
    const b = this.extractBufferStats(schedule);

    const metrics = {
      criticalPathRisk: this.calc.criticalPathRisk(c),
      resourceRisk: this.calc.resourceRisk(r),
      dependencyRisk: this.calc.dependencyRisk(d),
      bufferSufficiency: this.calc.bufferSufficiency(b),
    } as Omit<ResilienceMetrics, "overallScore">;

    return this.calc.assemble(metrics);
  }

  identifyVulnerabilities(schedule: Schedule) {
    return this.vuln.identify(schedule);
  }

  calculateRobustnessScore(m: Omit<ResilienceMetrics, "overallScore">): number {
    // pass-through to calculator; kept for API parity
    return new RobustnessCalculator().assemble(m).overallScore;
  }

  monitorScheduleHealth(schedule: Schedule): HealthStatus {
    const m = this.analyzeScheduleResilience(schedule);
    const overall =
      m.overallScore >= 80
        ? "good"
        : m.overallScore >= 60
          ? "fair"
          : "critical";
    return {
      overall,
      indicators: [],
      alerts: [],
      trends: [],
      lastUpdate: new Date(),
    };
  }

  // ---- extraction helpers (pure, fast) ----
  private extractCriticalPathStats(schedule: Schedule) {
    /* TODO */ return { longestPathLen: 0, meanSlack: 0, minSlack: 0 };
  }
  private extractResourceStats(schedule: Schedule) {
    /* TODO */ return {
      meanUtil: 0.6,
      maxUtil: 0.92,
      stdevUtil: 0.12,
      overPct: 0.02,
    };
  }
  private extractDependencyStats(schedule: Schedule) {
    /* TODO */ return { fanIn95: 3, fanOut95: 2, maxChain: 14 };
  }
  private extractBufferStats(schedule: Schedule) {
    /* TODO */ return { avgFloatPct: 35, p25FloatPct: 20, minFloatPct: 5 };
  }
}
