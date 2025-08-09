import { pct, inverse, weightedResilienceScore } from '../utils/resilience-scoring';
import { ResilienceMetrics } from '../utils/risk-metrics';
import { Schedule } from '../shared-types';

export interface CriticalPathStats { longestPathLen: number; meanSlack: number; minSlack: number; }
export interface ResourceStats { meanUtil: number; maxUtil: number; stdevUtil: number; overPct: number; }
export interface DependencyStats { fanIn95: number; fanOut95: number; maxChain: number; }
export interface BufferStats { avgFloatPct: number; p25FloatPct: number; minFloatPct: number; }

export class RobustnessCalculator {
  /** 0..100 higher is safer */
  bufferSufficiency(b: BufferStats): number {
    // Emphasize tail risk; require minimums not just averages
    const tail = pct(0.5 * b.p25FloatPct + 0.5 * b.minFloatPct);
    return pct(0.4 * b.avgFloatPct + 0.6 * tail);
  }

  /** 0..100 higher is riskier */
  criticalPathRisk(c: CriticalPathStats): number {
    // Low slack near zero is dangerous; length amplifies risk
    const slackRisk = pct(100 * Math.exp(-Math.max(c.minSlack, 0)));
    const lengthAmp = pct(Math.min(100, 10 * Math.log10(1 + c.longestPathLen)));
    return pct(0.7 * slackRisk + 0.3 * lengthAmp);
  }

  /** 0..100 higher is riskier */
  resourceRisk(r: ResourceStats): number {
    // penalize overages + volatility; normalized by max util
    const overload = pct(100 * r.overPct);            // fraction of timesteps over 100%
    const volatility = pct(100 * Math.min(1, r.stdevUtil / Math.max(1e-6, r.meanUtil)));
    const headroom = inverse(pct(100 * Math.max(0, 1 - r.maxUtil))); // less headroom => more risk
    return pct(0.45 * overload + 0.35 * volatility + 0.20 * headroom);
  }

  /** 0..100 higher is riskier */
  dependencyRisk(d: DependencyStats): number {
    // broader, deeper graphs are touchier
    const breadth = pct(10 * Math.log10(1 + d.fanIn95 + d.fanOut95));
    const depth   = pct(12 * Math.log10(1 + d.maxChain));
    return pct(0.4 * breadth + 0.6 * depth);
  }

  assemble(metrics: Omit<ResilienceMetrics, 'overallScore'>): ResilienceMetrics {
    return { ...metrics, overallScore: weightedResilienceScore(metrics) };
  }
}
