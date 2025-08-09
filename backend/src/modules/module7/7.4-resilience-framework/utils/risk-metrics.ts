/** Scoring constants (tweakable via DI/config) */
export const WEIGHTS = Object.freeze({
  criticalPath: 0.35,
  resource: 0.3,
  dependency: 0.2,
  buffer: 0.15,
});

export type Percent = number; // 0..100

export interface ResilienceMetrics {
  overallScore: Percent; // 0..100 (higher = better)
  criticalPathRisk: Percent; // 0..100 (higher = riskier)
  resourceRisk: Percent; // 0..100
  dependencyRisk: Percent; // 0..100
  bufferSufficiency: Percent; // 0..100 (higher = safer)
}
