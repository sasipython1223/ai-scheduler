/**
 * Module 7.4 - Scoring Utilities
 * 
 * Purpose: Utility functions for risk scoring and metric calculations
 * 
 * @author AI Scheduler Development Team
 * @version 1.0.0
 */

import type {
  Schedule,
  Task,
  Resource,
  ScoringWeights,
  RiskThresholds,
  RiskLevel
} from '../shared-types';

/**
 * Calculate overall risk score for a schedule
 */
export async function calculateRiskScore(
  schedule: Schedule,
  weights: ScoringWeights,
  thresholds: RiskThresholds
): Promise<number> {
  // TODO: Implement risk score calculation
  // - Calculate individual risk metrics
  // - Apply scoring weights
  // - Normalize to 0-100 scale
  // - Return overall risk score
  
  throw new Error('calculateRiskScore not yet implemented');
}

/**
 * Calculate critical path risk score
 */
export async function calculateCriticalPathScore(
  schedule: Schedule
): Promise<number> {
  // TODO: Implement critical path scoring
  // - Identify critical path tasks
  // - Assess task risk factors
  // - Calculate path vulnerability
  // - Return normalized score (0-100)
  
  throw new Error('calculateCriticalPathScore not yet implemented');
}

/**
 * Calculate resource risk score
 */
export async function calculateResourceScore(
  schedule: Schedule
): Promise<number> {
  // TODO: Implement resource risk scoring
  // - Analyze resource availability
  // - Assess capacity constraints
  // - Evaluate skill gaps
  // - Calculate overallocation risk
  // - Return normalized score (0-100)
  
  throw new Error('calculateResourceScore not yet implemented');
}

/**
 * Calculate dependency risk score
 */
export async function calculateDependencyScore(
  schedule: Schedule
): Promise<number> {
  // TODO: Implement dependency risk scoring
  // - Map task dependencies
  // - Assess dependency complexity
  // - Evaluate failure propagation
  // - Calculate coupling risk
  // - Return normalized score (0-100)
  
  throw new Error('calculateDependencyScore not yet implemented');
}

/**
 * Calculate buffer sufficiency score
 */
export async function calculateBufferScore(
  schedule: Schedule
): Promise<number> {
  // TODO: Implement buffer scoring
  // - Analyze schedule buffers
  // - Assess buffer distribution
  // - Evaluate adequacy vs. risk
  // - Return normalized score (0-100)
  
  throw new Error('calculateBufferScore not yet implemented');
}

/**
 * Calculate complexity score
 */
export async function calculateComplexityScore(
  schedule: Schedule
): Promise<number> {
  // TODO: Implement complexity scoring
  // - Count schedule elements
  // - Measure interconnections
  // - Assess constraint complexity
  // - Calculate complexity factor
  // - Return normalized score (0-100)
  
  throw new Error('calculateComplexityScore not yet implemented');
}

/**
 * Calculate task-level risk score
 */
export async function calculateTaskRiskScore(
  task: Task,
  schedule: Schedule
): Promise<number> {
  // TODO: Implement task risk scoring
  // - Assess task characteristics
  // - Evaluate dependencies
  // - Check resource constraints
  // - Calculate risk factors
  // - Return task risk score (0-100)
  
  throw new Error('calculateTaskRiskScore not yet implemented');
}

/**
 * Calculate resource utilization score
 */
export async function calculateResourceUtilizationScore(
  resource: Resource,
  schedule: Schedule
): Promise<number> {
  // TODO: Implement resource utilization scoring
  // - Calculate utilization rate
  // - Assess overallocation risk
  // - Evaluate availability gaps
  // - Return utilization score (0-100)
  
  throw new Error('calculateResourceUtilizationScore not yet implemented');
}

/**
 * Apply scoring weights to individual scores
 */
export function applyWeights(
  scores: Record<string, number>,
  weights: ScoringWeights
): number {
  const weightedScore = 
    (scores.criticalPath || 0) * weights.criticalPath +
    (scores.resource || 0) * weights.resource +
    (scores.dependency || 0) * weights.dependency +
    (scores.buffer || 0) * weights.buffer +
    (scores.complexity || 0) * weights.complexity;

  // Normalize weights to ensure they sum to 1
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  
  return totalWeight > 0 ? weightedScore / totalWeight : 0;
}

/**
 * Normalize score to 0-100 range
 */
export function normalizeScore(
  rawScore: number,
  min: number = 0,
  max: number = 100
): number {
  return Math.max(0, Math.min(100, ((rawScore - min) / (max - min)) * 100));
}

/**
 * Convert score to risk level based on thresholds
 */
export function scoreToRiskLevel(
  score: number,
  thresholds: RiskThresholds
): RiskLevel {
  if (score < thresholds.low) return 'very-low';
  if (score < thresholds.medium) return 'low';
  if (score < thresholds.high) return 'medium';
  if (score < thresholds.critical) return 'high';
  return 'very-high';
}

/**
 * Calculate score confidence interval
 */
export function calculateScoreConfidence(
  score: number,
  dataPoints: number,
  variance: number = 5
): { lower: number; upper: number; confidence: number } {
  // Simple confidence calculation - could be enhanced with statistical methods
  const margin = Math.max(1, variance * Math.sqrt(1 / Math.max(1, dataPoints)));
  
  return {
    lower: Math.max(0, score - margin),
    upper: Math.min(100, score + margin),
    confidence: Math.min(1, dataPoints / 10) // Higher confidence with more data points
  };
}

/**
 * Aggregate multiple scores with different weights
 */
export function aggregateScores(
  scores: Array<{ value: number; weight: number; confidence?: number }>
): { aggregatedScore: number; totalConfidence: number } {
  let totalWeightedScore = 0;
  let totalWeight = 0;
  let totalConfidence = 0;

  for (const score of scores) {
    const weight = score.weight * (score.confidence || 1);
    totalWeightedScore += score.value * weight;
    totalWeight += weight;
    totalConfidence += score.confidence || 1;
  }

  return {
    aggregatedScore: totalWeight > 0 ? totalWeightedScore / totalWeight : 0,
    totalConfidence: scores.length > 0 ? totalConfidence / scores.length : 0
  };
}

/**
 * Calculate score trend over time
 */
export function calculateScoreTrend(
  historicalScores: Array<{ timestamp: Date; score: number }>
): { direction: 'improving' | 'stable' | 'degrading'; velocity: number } {
  if (historicalScores.length < 2) {
    return { direction: 'stable', velocity: 0 };
  }

  // Simple linear trend calculation
  const recent = historicalScores.slice(-5); // Last 5 data points
  const first = recent[0];
  const last = recent[recent.length - 1];
  
  const timeDiff = last.timestamp.getTime() - first.timestamp.getTime();
  const scoreDiff = last.score - first.score;
  
  const velocity = timeDiff > 0 ? scoreDiff / (timeDiff / (1000 * 60 * 60 * 24)) : 0; // per day
  
  let direction: 'improving' | 'stable' | 'degrading' = 'stable';
  if (Math.abs(velocity) > 0.5) { // Threshold for significant change
    direction = velocity < 0 ? 'improving' : 'degrading'; // Lower scores = better (improving)
  }
  
  return { direction, velocity: Math.abs(velocity) };
}
