/**
 * Schedule Service - Business Logic Layer
 * Module 5.5: Orchestrates the complete scheduling pipeline
 *
 * Purpose: Business logic coordination between API layer and domain layer
 * Handles: Request processing, result formatting, business validation
 */

import {
  ScheduleEngine,
  type ScheduleEngineConfig,
  type SchedulePipelineResult,
} from '../domain/schedule-engine';
import type { LogicLink, TaskInput } from '../types/schedule';

/**
 * Schedule calculation request
 */
export interface ScheduleCalculationRequest {
  tasks: TaskInput[];
  logicLinks: LogicLink[];
  config?: ScheduleEngineConfig;
}

/**
 * Formatted schedule calculation response
 */
export interface ScheduleCalculationResponse {
  status: 'success' | 'error';
  data?: {
    tasks: Array<{
      id: string;
      name: string;
      duration: number;
      earlyStart: string;
      earlyFinish: string;
      lateStart: string;
      lateFinish: string;
      totalFloat: number;
      freeFloat: number;
      isCritical: boolean;
      wbs?: string;
    }>;
    floatAnalysis: {
      totalFloatDistribution: Record<string, number>;
      freeFloatDistribution: Record<string, number>;
      averageTotalFloat: number;
      averageFreeFloat: number;
    };
    criticalPathAnalysis: {
      longestPath: string[];
      totalPaths: number;
      criticalDuration: number;
    };
    flagSummary: {
      critical: number;
      nearCritical: number;
      highFloat: number;
      total: number;
    };
    performanceMetrics: {
      processingTimeMs: number;
      tasksProcessed: number;
      dependenciesProcessed: number;
    };
  };
  message?: string;
  errors?: string[];
  code?: string;
}

/**
 * Schedule Service - Main business logic orchestrator
 */
export class ScheduleService {
  private readonly scheduleEngine: ScheduleEngine;

  constructor(config?: ScheduleEngineConfig) {
    this.scheduleEngine = new ScheduleEngine(config);
  }

  /**
   * Run complete schedule calculation
   *
   * @param request - Schedule calculation request
   * @returns Formatted schedule calculation response
   */
  public async runScheduleCalculation(
    request: ScheduleCalculationRequest
  ): Promise<ScheduleCalculationResponse> {
    try {
      // Validate business rules
      this.validateBusinessRules(request);

      // Execute scheduling pipeline
      const result: SchedulePipelineResult =
        await this.scheduleEngine.runFullSchedulePipeline(request);

      // Format response
      return this.formatSuccessResponse(result);
    } catch (error) {
      return this.formatErrorResponse(error as Error);
    }
  }

  /**
   * Validate business rules for schedule calculation
   */
  private validateBusinessRules(request: ScheduleCalculationRequest): void {
    // Check for empty task list
    if (!request.tasks || request.tasks.length === 0) {
      throw new Error('At least one task is required for schedule calculation');
    }

    // Check for duplicate task IDs
    const taskIds = request.tasks.map((task) => task.id);
    const uniqueTaskIds = new Set(taskIds);
    if (taskIds.length !== uniqueTaskIds.size) {
      throw new Error(
        'Duplicate task IDs found. Each task must have a unique ID'
      );
    }

    // Validate logic links reference existing tasks
    const taskIdSet = new Set(taskIds);
    const invalidLinks = request.logicLinks.filter(
      (link) => !taskIdSet.has(link.from) || !taskIdSet.has(link.to)
    );

    if (invalidLinks.length > 0) {
      const invalidLinkIds = invalidLinks
        .map((link) => `${link.from} -> ${link.to}`)
        .join(', ');
      throw new Error(
        `Logic links reference non-existent tasks: ${invalidLinkIds}`
      );
    }

    // Check for self-referencing links
    const selfReferencingLinks = request.logicLinks.filter(
      (link) => link.from === link.to
    );
    if (selfReferencingLinks.length > 0) {
      const selfRefIds = selfReferencingLinks
        .map((link) => link.from)
        .join(', ');
      throw new Error(
        `Self-referencing logic links found for tasks: ${selfRefIds}`
      );
    }
  }

  /**
   * Format successful response
   */
  private formatSuccessResponse(
    result: SchedulePipelineResult
  ): ScheduleCalculationResponse {
    if (!result.success) {
      return {
        status: 'error',
        message: 'Schedule calculation failed',
        errors: result.errors,
        code: 'CALCULATION_FAILED',
      };
    }

    return {
      status: 'success',
      data: {
        tasks: result.tasks.map((task) => ({
          id: task.id,
          name: task.name,
          duration: task.duration,
          earlyStart: task.earlyStart,
          earlyFinish: task.earlyFinish,
          lateStart: task.lateStart,
          lateFinish: task.lateFinish,
          totalFloat: task.totalFloat,
          freeFloat: task.freeFloat,
          isCritical: (task.totalFloat || 0) <= 0.001,
          wbs: task.wbs,
        })),
        floatAnalysis: result.floatAnalysis,
        criticalPathAnalysis: result.criticalPathAnalysis,
        flagSummary: result.flagSummary,
        performanceMetrics: result.performanceMetrics,
      },
    };
  }

  /**
   * Format error response
   */
  private formatErrorResponse(error: Error): ScheduleCalculationResponse {
    // Determine error type and code
    let code = 'INTERNAL_ERROR';
    if (
      error.message.includes('duplicate') ||
      error.message.includes('unique')
    ) {
      code = 'DUPLICATE_TASK_IDS';
    } else if (
      error.message.includes('non-existent') ||
      error.message.includes('reference')
    ) {
      code = 'INVALID_LOGIC_LINKS';
    } else if (
      error.message.includes('required') ||
      error.message.includes('empty')
    ) {
      code = 'VALIDATION_ERROR';
    } else if (
      error.message.includes('circular') ||
      error.message.includes('cycle')
    ) {
      code = 'CIRCULAR_DEPENDENCY';
    }

    return {
      status: 'error',
      message: error.message,
      errors: [error.message],
      code,
    };
  }

  /**
   * Get service configuration
   */
  public getConfiguration(): ScheduleEngineConfig {
    return {
      epsilon: 0.001,
      includeWeekends: false,
      timeZone: 'UTC',
    };
  }
}
