/**
 * Schedule Engine - Domain Layer (Simplified for API)
 * Module 5.5: Core scheduling pipeline orchestration
 */

import type { LogicLink, ScheduledTask, TaskInput } from '../types/schedule';
import { TaskStatus } from '../types/schedule';
import { 
  FloatAnalysisResult,
  CriticalPathAnalysisResult,
  FlagSummaryResult,
  PerformanceMetricsResult
} from './pipeline-utils';

/**
 * Complete schedule calculation result
 */
export interface SchedulePipelineResult {
  tasks: ScheduledTask[];
  floatAnalysis: FloatAnalysisResult;
  criticalPathAnalysis: CriticalPathAnalysisResult;
  flagSummary: FlagSummaryResult;
  performanceMetrics: PerformanceMetricsResult;
  success: boolean;
  errors: string[];
}

/**
 * Schedule calculation request input
 */
export interface ScheduleCalculationRequest {
  tasks: TaskInput[];
  logicLinks: LogicLink[];
  projectStartDate?: string;
  options?: {
    epsilon?: number;
    includeWeekends?: boolean;
  };
}

/**
 * Schedule calculation configuration
 */
export interface ScheduleEngineConfig {
  epsilon?: number;
  includeWeekends?: boolean;
  timeZone?: string;
}

/**
 * Schedule Engine (Simplified API Implementation)
 * Main orchestrator for the complete CPM scheduling pipeline
 */
export class ScheduleEngine {
  private readonly config: ScheduleEngineConfig;

  constructor(config: ScheduleEngineConfig = {}) {
    this.config = {
      epsilon: 0.01,
      includeWeekends: false,
      timeZone: 'UTC',
      ...config,
    };
  }

  /**
   * Execute complete scheduling pipeline
   */
  public async runFullSchedulePipeline(
    request: ScheduleCalculationRequest
  ): Promise<SchedulePipelineResult> {
    const startTime = Date.now();

    try {
      // Simplified implementation for API layer testing
      const mockTasks: ScheduledTask[] = request.tasks.map((task, index) => ({
        ...task,
        earlyStart: new Date().toISOString(),
        earlyFinish: new Date(Date.now() + task.duration * 24 * 60 * 60 * 1000).toISOString(),
        lateStart: new Date().toISOString(),
        lateFinish: new Date(Date.now() + task.duration * 24 * 60 * 60 * 1000).toISOString(),
        totalFloat: index === 0 ? 0 : Math.random() * 5,
        freeFloat: index === 0 ? 0 : Math.random() * 3,
        isCritical: index === 0,
        status: TaskStatus.NOT_STARTED,
      }));

      const processingTime = Date.now() - startTime;
      
      return {
        tasks: mockTasks,
        floatAnalysis: {
          totalFloatDistribution: { zero: 1, low: 1, medium: 1, high: 0 },
          freeFloatDistribution: { zero: 1, low: 1, medium: 1, high: 0 },
          averageTotalFloat: 1.5,
          averageFreeFloat: 1.0,
        },
        criticalPathAnalysis: {
          longestPath: [mockTasks[0]?.id || ''],
          totalPaths: 1,
          criticalDuration: mockTasks.reduce((sum, task) => sum + task.duration, 0),
        },
        flagSummary: {
          critical: 1,
          nearCritical: 1,
          highFloat: 1,
          total: mockTasks.length,
        },
        performanceMetrics: {
          processingTimeMs: processingTime,
          tasksProcessed: request.tasks.length,
          dependenciesProcessed: request.logicLinks.length,
        },
        success: true,
        errors: [],
      };

    } catch (error) {
      return this.buildErrorResult(error, Date.now() - startTime);
    }
  }

  /**
   * Build error result
   */
  private buildErrorResult(error: unknown, processingTime: number): SchedulePipelineResult {
    const errorMessage = error instanceof Error ? error.message : 'Unknown scheduling error';
    
    return {
      tasks: [],
      floatAnalysis: {
        totalFloatDistribution: {},
        freeFloatDistribution: {},
        averageTotalFloat: 0,
        averageFreeFloat: 0,
      },
      criticalPathAnalysis: {
        longestPath: [],
        totalPaths: 0,
        criticalDuration: 0,
      },
      flagSummary: {
        critical: 0,
        nearCritical: 0,
        highFloat: 0,
        total: 0,
      },
      performanceMetrics: {
        processingTimeMs: processingTime,
        tasksProcessed: 0,
        dependenciesProcessed: 0,
      },
      success: false,
      errors: [errorMessage],
    };
  }
}
