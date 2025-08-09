/**
 * STRICT RULES for Module 7.3:
 * - ≤220 LOC per file. Split helpers instead of growing files.
 * - No `any`. Keep types narrow and explicit.
 * - No throwing for business errors; return {status, violations}.
 * - Pure functions in strategies and availability checker.
 * - Deterministic outputs (stable sort/tie-break).
 * - Keep algorithmic complexity reasonable (target O(T log R)).
 */

/**
 * Module 7.3 - Resource-Constraint Integration Public API
 *
 * Smart, constraint-aware resource allocation with availability, skills,
 * and leveling support. Pluggable strategies and fast performance.
 */

export type ResourceId = string;
export type TaskId = string;

export interface Skill {
  id: string;
  level: number; // level: 1..n
}

export interface Resource {
  id: ResourceId;
  skills: Skill[];
  capacity: number; // hours per day
  calendar?: Record<string, number>; // ISO: hours available
}

export interface Requirement {
  skillId: string;
  minLevel: number;
  weight?: number;
}

export interface Task {
  id: TaskId;
  duration: number; // hours
  day: string; // ISO date bucket
  requirements: Requirement[];
}

export interface ConstraintInput {
  resources: Resource[];
  tasks: Task[];
  hardCaps?: { maxOverallocPct?: number };
  flags?: { ENABLE_GREEDY?: boolean; ENABLE_LEVELING?: boolean };
  timeBudgetMs?: number;
}

export interface Allocation {
  taskId: TaskId;
  resourceId: ResourceId;
  hours: number;
  reason?: string; // for auditability
}

export interface IntegrationResult {
  status: 'ok' | 'conflicts';
  allocations: Allocation[];
  violations: string[]; // human-readable messages
  metrics: { elapsedMs: number; leveledVariance: number };
}

export interface ResourceConstraintManager {
  integrate(input: ConstraintInput): Promise<IntegrationResult>;
}

// Forward declaration - implementation will be created later
let _createManagerImpl: (() => ResourceConstraintManager) | undefined;

export function createResourceConstraintManager(): ResourceConstraintManager {
  if (!_createManagerImpl) {
    // Auto-register implementation on first use via dynamic import
    throw new Error(
      'ResourceConstraintManager implementation not yet loaded. Call _registerManagerImpl first.'
    );
  }
  return _createManagerImpl();
}

// Internal function to register the implementation
export function _registerManagerImpl(
  factory: () => ResourceConstraintManager
): void {
  _createManagerImpl = factory;
}
