/**
 * API Request and Response Types
 * AI Scheduler - Module 5.1: API Interface Data Models
 */

import type { LogicLink } from './dependency.types.js';
import type { ScheduleResult } from './result.types.js';
import type { TaskInput } from './task.types.js';
import type { WBSStructure } from './wbs.types.js';

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Schedule calculation request payload
 */
export interface ScheduleCalculationRequest {
  projectId: string;
  tasks: TaskInput[];
  logicLinks: LogicLink[];
  wbs?: WBSStructure;
  options?: CalculationOptions;
}

/**
 * Schedule calculation options
 */
export interface CalculationOptions {
  includeFloat: boolean;
  includeCriticalPath: boolean;
  includeStatistics: boolean;
  validateInput: boolean;
  optimizePerformance: boolean;
}

/**
 * API response wrapper
 */
export interface ScheduleApiResponse {
  success: boolean;
  data?: ScheduleResult;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata: {
    requestId: string;
    timestamp: string;
    processingTime: number;
  };
}
