/**
 * Helper utilities for creating valid test fixtures
 */

import type { Constraints } from "../../7.1-constraint-engine";

export function fixPriority(
  p?: string,
): "high" | "medium" | "critical" | "low" {
  if (!p) return "medium";

  const normalized = p.toLowerCase();
  switch (normalized) {
    case "critical":
    case "urgent":
    case "highest":
      return "critical";
    case "high":
    case "important":
      return "high";
    case "low":
    case "lowest":
    case "minor":
      return "low";
    default:
      return "medium";
  }
}

export function makeConstraints(partial?: Partial<Constraints>): Constraints {
  return {
    timeframe: { start: "2025-01-01", end: "2025-12-31" },
    overallocationCap: 15,
    skillRequirements: true,
    ...partial,
  };
}
