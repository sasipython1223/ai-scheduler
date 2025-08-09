/**
 * Module 5 - Schedule Engine Shared Types
 * Centralized type definitions for all Module 5 components
 */

// Re-export from existing type definitions
export * from '../../types/schedule';

// Forward Pass Types
export interface ForwardPassResult {
  tasks: Array<{
    id: string;
    earlyStart: string;
    earlyFinish: string;
  }>;
  success: boolean;
  errors: string[];
}

// Backward Pass Types
export interface BackwardPassResult {
  tasks: Array<{
    id: string;
    lateStart: string;
    lateFinish: string;
    totalFloat: number;
    freeFloat: number;
  }>;
  success: boolean;
  errors: string[];
}

// Float and Critical Path Types
export interface FloatAnalysisResult {
  totalFloatDistribution: Record<string, number>;
  freeFloatDistribution: Record<string, number>;
  averageTotalFloat: number;
  averageFreeFloat: number;
}

export interface CriticalPathAnalysisResult {
  longestPath: string[];
  totalPaths: number;
  criticalDuration: number;
}

// API Response Types
export interface ScheduleApiResponse {
  success: boolean;
  data?: unknown; // Generic data type for flexibility
  errors?: string[];
  metadata?: {
    processedAt: string;
    version: string;
    performanceMetrics?: {
      executionTimeMs: number;
      memoryUsageMB: number;
    };
  };
}
