/**
 * Module 5.4 - Shared Types
 * Purpose: Common type definitions for float calculation and critical path analysis
 * Requirements:
 * - Use epsilon-based float comparison (0.001)
 * - Support multiple critical paths
 * - Maintain clean type safety
 */

import { LogicLink, Task } from '@/modules/module5/shared-types';
import { CriticalPathAnalysis } from './CriticalPathTypes';
import { FloatAnalysis } from './FloatTypes';

export interface Module54Input {
  tasks: Task[];
  dependencies: LogicLink[];
  forwardPassResult: ForwardPassResult;
  backwardPassResult: BackwardPassResult;
  analysisConfig?: AnalysisConfig;
}

export interface Module54Result {
  tasksWithFlags: EnhancedTask[];
  criticalPathAnalysis: CriticalPathAnalysis;
  floatAnalysis: FloatAnalysis;
  performanceMetrics: PerformanceMetrics;
  qualityMetrics: QualityMetrics;
  processingTime: number;
  success: boolean;
  errors: string[];
  warnings: string[];
}

export interface ForwardPassResult {
  tasks: Task[];
  projectStartDate: Date;
  projectEndDate: Date;
}

export interface BackwardPassResult {
  tasks: Task[];
  criticalPath: Task[];
  totalProjectFloat: number;
}

export interface AnalysisConfig {
  epsilon: number;
  enableMultiplePaths: boolean;
  validateConsistency: boolean;
  performanceMode: boolean;
}

export interface EnhancedTask extends Task {
  totalFloat: number;
  freeFloat: number;
  isCritical: boolean;
  criticalPathId?: string;
  floatRank: number;
  riskLevel: RiskLevel;
}

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  tasksProcessed: number;
  algorithmComplexity: string;
}

export interface QualityMetrics {
  floatConsistencyScore: number;
  criticalPathValidityScore: number;
  dataIntegrityScore: number;
  overallQualityScore: number;
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
