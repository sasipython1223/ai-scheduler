/**
 * Schedule Calculation Utilities
 * AI Scheduler - Module 5.1: Schedule Calculation Helpers
 *
 * Utility functions for schedule validation and calculation options
 */

import {
  CalculationOptions,
  ScheduleCalculationRequest,
  ValidationResult,
} from '../../types/scheduleTypes';
import { validateLogicLink } from './logicLink.model';
import { validateTask } from './task.model';

/**
 * Schedule calculation utilities
 */
export class ScheduleUtils {
  /**
   * Validate schedule calculation request
   */
  public static validateRequest(
    request: ScheduleCalculationRequest
  ): ValidationResult[] {
    const results: ValidationResult[] = [];

    if (!request.projectId?.trim()) {
      results.push({
        field: 'projectId',
        isValid: false,
        message: 'Project ID is required',
        severity: 'ERROR',
      });
    }

    if (!request.tasks?.length) {
      results.push({
        field: 'tasks',
        isValid: false,
        message: 'At least one task is required',
        severity: 'ERROR',
      });
    }

    // Validate individual tasks
    request.tasks?.forEach((task, index) => {
      const taskResults = validateTask(task);
      results.push(
        ...taskResults.map((r: ValidationResult) => ({
          ...r,
          field: `tasks[${index}].${r.field}`,
        }))
      );
    });

    // Validate logic links
    request.logicLinks?.forEach((link, index) => {
      const linkResults = validateLogicLink(link);
      results.push(
        ...linkResults.map((r: ValidationResult) => ({
          ...r,
          field: `logicLinks[${index}].${r.field}`,
        }))
      );
    });

    return results;
  }

  /**
   * Get default calculation options
   */
  public static getDefaultOptions(): CalculationOptions {
    return {
      includeFloat: true,
      includeCriticalPath: true,
      includeStatistics: true,
      validateInput: true,
      optimizePerformance: false,
    };
  }

  /**
   * Check if all validation results are valid
   */
  public static isValidationSuccessful(results: ValidationResult[]): boolean {
    return results.filter((r) => r.severity === 'ERROR').length === 0;
  }

  /**
   * Filter validation results by severity
   */
  public static filterValidationResults(
    results: ValidationResult[],
    severity: 'ERROR' | 'WARNING' | 'INFO'
  ): ValidationResult[] {
    return results.filter((r) => r.severity === severity);
  }

  /**
   * Convert validation results to error messages
   */
  public static getValidationMessages(results: ValidationResult[]): string[] {
    return results.map((r) => `${r.field}: ${r.message}`);
  }

  /**
   * Create summary of validation results
   */
  public static createValidationSummary(results: ValidationResult[]): {
    totalIssues: number;
    errors: number;
    warnings: number;
    infos: number;
    isValid: boolean;
  } {
    const errors = results.filter((r) => r.severity === 'ERROR').length;
    const warnings = results.filter((r) => r.severity === 'WARNING').length;
    const infos = results.filter((r) => r.severity === 'INFO').length;

    return {
      totalIssues: results.length,
      errors,
      warnings,
      infos,
      isValid: errors === 0,
    };
  }
}

/**
 * Validation utilities
 */
export function validateScheduleRequest(request: ScheduleCalculationRequest): {
  results: ValidationResult[];
  summary: ReturnType<typeof ScheduleUtils.createValidationSummary>;
} {
  const results = ScheduleUtils.validateRequest(request);
  const summary = ScheduleUtils.createValidationSummary(results);

  return { results, summary };
}

export function getDefaultCalculationOptions(): CalculationOptions {
  return ScheduleUtils.getDefaultOptions();
}

export function isValidationSuccessful(results: ValidationResult[]): boolean {
  return ScheduleUtils.isValidationSuccessful(results);
}
