/**
 * Module 5.3: CPM Backward Pass Types
 *
 * Type definitions for backward pass calculations
 */

import { ScheduledTask } from './task.types'; /**
 * Enhanced ScheduledTask interface with backward pass calculations
 */
export interface EnhancedScheduledTask extends ScheduledTask {
  // All date fields are already included in ScheduledTask as ISO strings
  // Additional calculated fields will be populated during backward pass

  // Add explicit properties to avoid empty interface warning
  constrainedStart?: string;
  constrainedFinish?: string;
}

/**
 * Result of the backward pass calculation
 */
export interface BackwardPassResult {
  tasks: ScheduledTask[];
  projectEndDate: string;
  criticalPath: string[];
  totalFloat: Map<string, number>;
  freeFloat: Map<string, number>;
  criticalPathLength: number;
}

/**
 * Validation options for backward pass
 */
export interface BackwardPassOptions {
  skipValidation?: boolean;
  projectDeadline?: string;
  validateCriticalPath?: boolean;
  calendarId?: string;
}
