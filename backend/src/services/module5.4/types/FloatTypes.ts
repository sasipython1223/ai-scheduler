/**
 * Module 5.4 - Float Analysis Types
 * Purpose: Type definitions for float calculation results and analysis
 */

export interface FloatData {
  taskId: string;
  totalFloat: number;
  freeFloat: number;
  floatRank: number;
  isNearCritical: boolean;
  calculationMetadata: CalculationMetadata;
}

export interface FloatAnalysis {
  totalFloatDistribution: FloatDistribution;
  freeFloatDistribution: FloatDistribution;
  nearCriticalTasks: string[];
  floatBufferAnalysis: FloatBufferAnalysis;
  riskAssessment: FloatRiskAssessment;
}

export interface FloatDistribution {
  zero: number;
  low: number;
  medium: number;
  high: number;
  averageFloat: number;
  maxFloat: number;
  minFloat: number;
}

export interface FloatBufferAnalysis {
  totalAvailableFloat: number;
  averageFloatPerTask: number;
  criticalPathBuffer: number;
  riskMitigationCapacity: number;
}

export interface FloatRiskAssessment {
  highRiskTasks: string[];
  mediumRiskTasks: string[];
  lowRiskTasks: string[];
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface CalculationMetadata {
  calculationMethod: string;
  precision: number;
  validationPassed: boolean;
  calculationTime: number;
}

export interface FloatBatchResult {
  processedTasks: FloatData[];
  totalProcessingTime: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

export interface FloatMetrics {
  totalTasks: number;
  criticalTasks: number;
  nearCriticalTasks: number;
  averageFloat: number;
  floatVariance: number;
}
