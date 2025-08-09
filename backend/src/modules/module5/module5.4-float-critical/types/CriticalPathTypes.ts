/**
 * Module 5.4 - Critical Path Analysis Types
 * Purpose: Type definitions for critical path detection and analysis
 */

export interface CriticalData {
  taskId: string;
  isCritical: boolean;
  criticalPathId: string;
  pathPosition: number;
  criticalityScore: number;
  pathMetrics: PathMetrics;
}

export interface CriticalPathAnalysis {
  criticalPaths: CriticalPath[];
  totalCriticalTasks: number;
  longestPath: CriticalPath;
  shortestCriticalPath: CriticalPath;
  pathIntersections: PathIntersection[];
  criticalityMetrics: CriticalityMetrics;
}

export interface CriticalPath {
  id: string;
  tasks: string[];
  totalDuration: number;
  startDate: Date;
  endDate: Date;
  pathLength: number;
  isLongest: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface PathMetrics {
  duration: number;
  taskCount: number;
  complexityScore: number;
  riskScore: number;
}

export interface PathIntersection {
  pathIds: string[];
  intersectionTasks: string[];
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface CriticalityMetrics {
  totalCriticalPaths: number;
  averagePathLength: number;
  criticalPathDensity: number;
  pathComplexityScore: number;
}

export interface PathConnection {
  fromTask: string;
  toTask: string;
  connectionType: string;
  isValid: boolean;
}

export interface PathBreak {
  location: string;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  suggestedFix: string;
}

export interface CriticalPathSet {
  paths: CriticalPath[];
  setId: string;
  priority: number;
  analysisMetrics: PathAnalysisMetrics;
}

export interface PathAnalysisMetrics {
  totalPaths: number;
  averageDuration: number;
  riskDistribution: Record<string, number>;
  complexityDistribution: Record<string, number>;
}

export interface PathPriority {
  pathId: string;
  priority: number;
  reasoning: string;
  impactScore: number;
}
