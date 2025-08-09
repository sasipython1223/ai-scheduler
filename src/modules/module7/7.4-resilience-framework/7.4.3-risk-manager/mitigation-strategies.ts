import { Schedule } from "../../../../../backend/src/modules/module7/7.4-resilience-framework/shared-types";

export type RiskSeverity = "low" | "medium" | "high" | "critical";
export type RiskTrend = "improving" | "stable" | "degrading";

export interface RiskIndicator {
  id: string;
  metric: string; // e.g., "criticalPathRisk", "resourceOverload", "bufferSufficiency"
  currentValue: number; // normalized 0..1 where 1 is worst risk unless otherwise noted
  threshold: number; // alert threshold (same scale as currentValue)
  trend: RiskTrend;
  severity: RiskSeverity;
  details?: string;
}

export interface RiskContext {
  schedule: Schedule;
  indicator: RiskIndicator;
  nowMs?: number;
  budgetMinutes?: number; // optional time budget for mitigation
}

export interface MitigationResult {
  success: boolean;
  actions: { type: string; details: string }[];
  newSchedule: Schedule;
  metricsDelta?: Record<string, number>; // metric -> improvement delta
}

export interface MitigationStrategy {
  id: string;
  name: string;
  riskTypes: string[]; // keys of metrics it can address
  executionTime: number; // minutes to implement
  costFactor: number; // 1..10 (higher is more costly)
  successRate: number; // 0..1 historical
  apply(ctx: RiskContext): MitigationResult; // pure functional transform of schedule
}

// Minimal baseline strategies (pure, deterministic)
export const BufferTimeStrategy: MitigationStrategy = {
  id: "buffer-time",
  name: "Buffer Time",
  riskTypes: ["criticalPathRisk", "dependencyRisk"],
  executionTime: 10,
  costFactor: 3,
  successRate: 0.7,
  apply(ctx) {
    // TODO: Insert small buffers on brittle edges off critical path; keep deterministic ordering
    return {
      success: true,
      actions: [{ type: "buffer", details: "Inserted micro-buffers" }],
      newSchedule: ctx.schedule,
      metricsDelta: { criticalPathRisk: -0.05 },
    };
  },
};

export const ResourceReallocationStrategy: MitigationStrategy = {
  id: "resource-reallocation",
  name: "Resource Reallocation",
  riskTypes: ["resourceRisk"],
  executionTime: 20,
  costFactor: 5,
  successRate: 0.65,
  apply(ctx) {
    // TODO: Rebalance from overloaded to underloaded compatible resources (uses 7.3 heuristics)
    return {
      success: true,
      actions: [{ type: "reassign", details: "Shifted load off hotspots" }],
      newSchedule: ctx.schedule,
      metricsDelta: { resourceRisk: -0.07 },
    };
  },
};

export const CriticalPathProtectionStrategy: MitigationStrategy = {
  id: "critical-path-protection",
  name: "Critical Path Protection",
  riskTypes: ["criticalPathRisk", "bufferSufficiency"],
  executionTime: 15,
  costFactor: 6,
  successRate: 0.72,
  apply(ctx) {
    // TODO: Lock critical tasks, increase slack at fragile nodes
    return {
      success: true,
      actions: [{ type: "protect", details: "Guarded critical path tasks" }],
      newSchedule: ctx.schedule,
      metricsDelta: { criticalPathRisk: -0.06, bufferSufficiency: +0.04 },
    };
  },
};

export const ScheduleCompressionStrategy: MitigationStrategy = {
  id: "schedule-compression",
  name: "Schedule Compression",
  riskTypes: ["deadlineRisk"],
  executionTime: 25,
  costFactor: 8,
  successRate: 0.55,
  apply(ctx) {
    // TODO: Selective fast-tracking/crashing on non-bottleneck segments
    return {
      success: true,
      actions: [{ type: "compress", details: "Applied selective fast-track" }],
      newSchedule: ctx.schedule,
      metricsDelta: { deadlineRisk: -0.05 },
    };
  },
};

export const BuiltInStrategies: MitigationStrategy[] = [
  BufferTimeStrategy,
  ResourceReallocationStrategy,
  CriticalPathProtectionStrategy,
  ScheduleCompressionStrategy,
];
