import { ResilienceMetrics, WEIGHTS } from "./risk-metrics";

/** Normalize to 0..100 with clamp */
export const pct = (x: number) => Math.max(0, Math.min(100, x));

/** Invert a 0..100 safety to 0..100 risk (100 safety -> 0 risk) */
export const inverse = (safetyPct: number) => pct(100 - safetyPct);

/** Weighted geometric blend that rewards consistently good sub-scores */
export function weightedResilienceScore(
  m: Omit<ResilienceMetrics, "overallScore">,
): number {
  // risks (higher worse) -> convert to safety first
  const critSafety = 100 - m.criticalPathRisk;
  const resSafety = 100 - m.resourceRisk;
  const depSafety = 100 - m.dependencyRisk;
  const bufSafety = m.bufferSufficiency; // already safety

  // geometric mean with weights (numerically stable)
  const toUnit = (p: number) => Math.max(1e-6, p / 100);
  const s =
    Math.pow(toUnit(critSafety), WEIGHTS.criticalPath) *
    Math.pow(toUnit(resSafety), WEIGHTS.resource) *
    Math.pow(toUnit(depSafety), WEIGHTS.dependency) *
    Math.pow(toUnit(bufSafety), WEIGHTS.buffer);

  return pct(
    Math.pow(
      s,
      1 /
        (WEIGHTS.criticalPath +
          WEIGHTS.resource +
          WEIGHTS.dependency +
          WEIGHTS.buffer),
    ) * 100,
  );
}
