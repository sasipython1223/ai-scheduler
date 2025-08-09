/**
 * Module 7.2 - Algorithm Context and Utilities
 *
 * Shared utilities for optimization algorithms including time budget enforcement,
 * fitness scoring, and candidate selection.
 */

import type { OptimizationCandidate, OptimizationInput } from './types';

/**
 * Context for algorithm execution with time budget tracking
 */
export class AlgorithmContext {
  private readonly startTime: number;
  private readonly timeBudgetMs: number;

  constructor(timeBudgetMs: number) {
    this.startTime = Date.now();
    this.timeBudgetMs = timeBudgetMs;
  }

  /**
   * Check if time budget has been exceeded
   */
  isTimeExceeded(): boolean {
    return this.getElapsedMs() >= this.timeBudgetMs;
  }

  /**
   * Get elapsed time in milliseconds
   */
  getElapsedMs(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Get remaining time in milliseconds
   */
  getRemainingMs(): number {
    return Math.max(0, this.timeBudgetMs - this.getElapsedMs());
  }
}

/**
 * Calculate fitness score using objective weights
 */
export function calculateFitness(
  candidate: OptimizationCandidate,
  input: OptimizationInput
): number {
  const weights = input.objectiveWeights || {};

  // Default weights if not specified
  const makespanWeight = weights.makespan ?? 0.4;
  const violationsWeight = weights.softViolations ?? 0.3;
  const levelingWeight = weights.leveling ?? 0.2;
  const latencyWeight = weights.latency ?? 0.1;

  // Normalize weights to sum to 1.0
  const totalWeight =
    makespanWeight + violationsWeight + levelingWeight + latencyWeight;

  if (totalWeight === 0) {
    return candidate.score;
  }

  // Simple weighted score calculation
  // In real implementation, these would be calculated from actual schedule metrics
  const makespanScore = Math.random() * 100; // Mock: shorter makespan = higher score
  const violationsScore = Math.max(0, 100 - candidate.changesApplied * 2); // fewer violations = higher
  const levelingScore = Math.random() * 100; // Mock: better resource leveling
  const latencyScore = Math.random() * 100; // Mock: lower latency

  const weightedScore =
    (makespanScore * makespanWeight +
      violationsScore * violationsWeight +
      levelingScore * levelingWeight +
      latencyScore * latencyWeight) /
    totalWeight;

  return weightedScore;
}

/**
 * Select the best candidate from a collection
 */
export function selectBestCandidate(
  candidates: OptimizationCandidate[]
): OptimizationCandidate | undefined {
  if (candidates.length === 0) {
    return undefined;
  }

  return candidates.reduce((best, current) =>
    current.score > best.score ? current : best
  );
}

/**
 * Compare two candidates, returns true if first is better
 */
export function isBetterCandidate(
  candidate: OptimizationCandidate,
  baseline: OptimizationCandidate
): boolean {
  return candidate.score > baseline.score;
}

/**
 * Create a baseline candidate for comparison
 */
export function createBaselineCandidate(
  scheduleId: string
): OptimizationCandidate {
  return {
    scheduleId,
    score: 0, // baseline score
    changesApplied: 0,
  };
}

/**
 * Generate a random mutation for genetic algorithm
 */
export function generateMutation(
  candidate: OptimizationCandidate,
  intensity: number = 0.1
): OptimizationCandidate {
  const mutationStrength = Math.random() * intensity;
  const scoreChange = (Math.random() - 0.5) * mutationStrength * 20;

  return {
    ...candidate,
    score: Math.max(0, candidate.score + scoreChange),
    changesApplied: candidate.changesApplied + 1,
  };
}
