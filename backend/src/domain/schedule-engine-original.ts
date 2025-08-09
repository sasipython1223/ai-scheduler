/**
 * Schedule Engine - Domain Layer
 * Module 5.5: Core scheduling pipeline orchestration
 *
 * Purpose: Clean abstraction over the complete CPM scheduling pipeline
 * Integrates: Module 5.2 (Forward) → Module 5.3 (Backward) → Module 5.4 (Float/Critical)
 */

import { computeBackwardPass } from '../services/cpm-backward-pass.utils';
import { computeForwardPass } from '../services/cpm-forward-pass-refactored';
import { Module54Service } from '../services/module5.4/Module54Service';
import type {
  Module54Input,
  Module54Result,
} from '../services/module5.4/types/SharedTypes';
import type { LogicLink, ScheduledTask, TaskInput } from '../types/schedule';
import {
  CriticalPathAnalysisResult,
  FlagSummaryResult,
  FloatAnalysisResult,
  PerformanceMetricsResult,
  calculateAverageFloat,
  calculateCriticalDurationFromIds,
  calculateFloatDistribution,
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
 * Schedule Engine
 * Main orchestrator for the complete CPM scheduling pipeline
 */
export class ScheduleEngine {
  private readonly module54Service: Module54Service;
  private readonly config: ScheduleEngineConfig;

  constructor(config: ScheduleEngineConfig = {}) {
    this.module54Service = new Module54Service();
    this.config = {
      epsilon: 0.01,
      includeWeekends: false,
      timeZone: 'UTC',
      ...config,
    };
  }

  /**
   * Execute complete scheduling pipeline
   * Integrates all modules: Forward Pass → Backward Pass → Float Analysis
   */
  public async runFullSchedulePipeline(
    request: ScheduleCalculationRequest
  ): Promise<SchedulePipelineResult> {
    const startTime = Date.now();

    try {
      // Step 1: Forward Pass (Module 5.2)
      const forwardPassResult = await this.executeForwardPass(request);

      // Step 2: Backward Pass (Module 5.3)
      const backwardPassResult = await this.executeBackwardPass(
        forwardPassResult,
        request
      );

      // Step 3: Float Analysis (Module 5.4)
      const module54Result = await this.executeFloatAnalysis(
        backwardPassResult,
        request
      );

      // Step 4: Extract critical path
      const criticalPathIds = this.extractCriticalPathIds(module54Result);

      // Step 5: Build final result
      const processingTime = Date.now() - startTime;

      return this.buildPipelineResult({
        module54Result,
        tasks: backwardPassResult,
        criticalPathIds,
        processingTime,
        taskCount: request.tasks.length,
        dependencyCount: request.logicLinks.length,
      });
    } catch (error) {
      return this.buildErrorResult(error, Date.now() - startTime);
    }
  }

  /**
   * Execute forward pass calculation
   */
  private async executeForwardPass(
    request: ScheduleCalculationRequest
  ): Promise<ScheduledTask[]> {
    const projectStartDate =
      request.projectStartDate || new Date().toISOString();

    return computeForwardPass(
      request.tasks,
      request.logicLinks,
      projectStartDate
    );
  }

  /**
   * Execute backward pass calculation
   */
  private async executeBackwardPass(
    forwardPassTasks: ScheduledTask[],
    request: ScheduleCalculationRequest
  ): Promise<ScheduledTask[]> {
    // Calculate project end date from forward pass
    const projectEndDate = this.calculateProjectEndDate(forwardPassTasks);

    const result = computeBackwardPass(
      forwardPassTasks,
      request.logicLinks,
      projectEndDate
    );

    return result.tasks;
  }

  /**
   * Execute float analysis calculation
   */
  private async executeFloatAnalysis(
    backwardPassTasks: ScheduledTask[],
    request: ScheduleCalculationRequest
  ): Promise<Module54Result> {
    const module54Input: Module54Input = {
      tasks: backwardPassTasks,
      dependencies: request.logicLinks,
      config: {
        epsilon: this.config.epsilon!,
        includeWeekends: this.config.includeWeekends!,
      },
    };

    return this.module54Service.executeModule54(module54Input);
  }

  /**
   * Extract critical path task IDs
   */
  private extractCriticalPathIds(module54Result: Module54Result): string[] {
    return module54Result.results
      .filter((data) => data.isCritical)
      .map((data) => data.taskId);
  }

  /**
   * Calculate project end date from forward pass tasks
   */
  private calculateProjectEndDate(tasks: ScheduledTask[]): string {
    const latestFinish = Math.max(
      ...tasks.map((task) =>
        new Date(task.finishDate || task.earlyFinish || '').getTime()
      )
    );
    return new Date(latestFinish).toISOString();
  }

  /**
   * Build successful pipeline result
   */
  private buildPipelineResult(params: {
    module54Result: Module54Result;
    tasks: ScheduledTask[];
    criticalPathIds: string[];
    processingTime: number;
    taskCount: number;
    dependencyCount: number;
  }): SchedulePipelineResult {
    const {
      tasks,
      criticalPathIds,
      processingTime,
      taskCount,
      dependencyCount,
    } = params;

    return {
      tasks,
      floatAnalysis: this.buildFloatAnalysis(tasks),
      criticalPathAnalysis: this.buildCriticalPathAnalysis(
        tasks,
        criticalPathIds
      ),
      flagSummary: this.buildFlagSummary(tasks),
      performanceMetrics: this.buildPerformanceMetrics(
        processingTime,
        taskCount,
        dependencyCount
      ),
      success: true,
      errors: [],
    };
  }

  /**
   * Build float analysis section
   */
  private buildFloatAnalysis(tasks: ScheduledTask[]): FloatAnalysisResult {
    return {
      totalFloatDistribution: calculateFloatDistribution(tasks, 'total'),
      freeFloatDistribution: calculateFloatDistribution(tasks, 'free'),
      averageTotalFloat: calculateAverageFloat(tasks, 'total'),
      averageFreeFloat: calculateAverageFloat(tasks, 'free'),
    };
  }

  /**
   * Build critical path analysis section
   */
  private buildCriticalPathAnalysis(
    tasks: ScheduledTask[],
    criticalPathIds: string[]
  ): CriticalPathAnalysisResult {
    return {
      longestPath: criticalPathIds,
      totalPaths: 1, // Simplified for this implementation
      criticalDuration: calculateCriticalDurationFromIds(
        tasks,
        criticalPathIds
      ),
    };
  }

  /**
   * Build flag summary section
   */
  private buildFlagSummary(tasks: ScheduledTask[]): FlagSummaryResult {
    return {
      critical: tasks.filter(
        (task) => (task.totalFloat || 0) <= this.config.epsilon!
      ).length,
      nearCritical: tasks.filter(
        (task) =>
          (task.totalFloat || 0) > this.config.epsilon! &&
          (task.totalFloat || 0) <= 1
      ).length,
      highFloat: tasks.filter((task) => (task.totalFloat || 0) > 1).length,
      total: tasks.length,
    };
  }

  /**
   * Build performance metrics section
   */
  private buildPerformanceMetrics(
    processingTime: number,
    taskCount: number,
    dependencyCount: number
  ): PerformanceMetricsResult {
    return {
      processingTimeMs: processingTime,
      tasksProcessed: taskCount,
      dependenciesProcessed: dependencyCount,
    };
  }

  /**
   * Build error result
   */
  private buildErrorResult(
    error: unknown,
    processingTime: number
  ): SchedulePipelineResult {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown scheduling error';

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
