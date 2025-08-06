/**
 * Module 5.3: CPM Backward Pass Utilities
 *
 * Utility functions for backward pass calculations
 */

import { LogicLink, ScheduledTask } from '../types/schedule';
import {
  BackwardPassOptions,
  BackwardPassResult,
} from '../types/schedule/backward-pass.types';
import { CPMBackwardPassService } from './cpm-backward-pass';

// Re-export types and service for convenience
export {
  BackwardPassOptions,
  BackwardPassResult,
} from '../types/schedule/backward-pass.types';
export { CPMBackwardPassService } from './cpm-backward-pass';

/**
 * Compute backward pass using the service
 */
export function computeBackwardPass(
  tasks: ScheduledTask[],
  links: LogicLink[],
  projectEndDate: string,
  options: BackwardPassOptions = {}
): BackwardPassResult {
  const service = new CPMBackwardPassService(options.calendarId);
  return service.calculateBackwardPass(tasks, links, projectEndDate, options);
}

/**
 * Utility function to identify critical path only
 */
export function identifyCriticalPath(
  tasks: ScheduledTask[],
  links: LogicLink[],
  projectEndDate: string
): string[] {
  const result = computeBackwardPass(tasks, links, projectEndDate);
  return result.criticalPath;
}

/**
 * Utility function to calculate float values
 */
export function calculateProjectFloat(
  tasks: ScheduledTask[],
  links: LogicLink[],
  projectEndDate: string
): { totalFloat: Map<string, number>; freeFloat: Map<string, number> } {
  const result = computeBackwardPass(tasks, links, projectEndDate);
  return {
    totalFloat: result.totalFloat,
    freeFloat: result.freeFloat,
  };
}
