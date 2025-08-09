/**
 * Module 6.2: Violation Reporter Implementation
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Violation logging and reporting utilities
 * Dependencies: shared-types.ts
 */

import {
  IConstraintValidationResult,
  IConstraintViolation,
  ViolationSeverity,
} from '../shared-types.js';

/**
 * Violation reporting configuration
 */
export interface ReportingOptions {
  includeStackTrace?: boolean;
  logLevel?: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  outputFormat?: 'JSON' | 'TEXT' | 'CSV';
  includeMetadata?: boolean;
}

/**
 * Violation reporter class
 */
export class ViolationReporter {
  private options: ReportingOptions;

  constructor(options: ReportingOptions = {}) {
    this.options = {
      includeStackTrace: false,
      logLevel: 'INFO',
      outputFormat: 'JSON',
      includeMetadata: true,
      ...options,
    };
  }

  /**
   * Generate violation report
   */
  public generateReport(result: IConstraintValidationResult): string {
    // Implementation will be added in detailed development
    if (result.isValid) {
      return '✅ All constraints validated successfully';
    }

    return `❌ Found ${result.violationCount} violation(s)`;
  }

  /**
   * Log violation to console
   */
  public logViolation(violation: IConstraintViolation): void {
    const level = this.getSeverityLogLevel(violation.severity);
    console[level](`Constraint Violation: ${violation.message}`);
  }

  /**
   * Export violations to different formats
   */
  public exportViolations(
    violations: IConstraintViolation[],
    format: 'JSON' | 'CSV' | 'TEXT' = 'JSON'
  ): string {
    switch (format) {
      case 'JSON':
        return JSON.stringify(violations, null, 2);
      case 'CSV':
        return this.toCSV(violations);
      case 'TEXT':
        return this.toText(violations);
      default:
        return JSON.stringify(violations);
    }
  }

  private getSeverityLogLevel(
    severity: ViolationSeverity
  ): 'error' | 'warn' | 'info' | 'log' {
    switch (severity) {
      case ViolationSeverity.CRITICAL:
      case ViolationSeverity.ERROR:
        return 'error';
      case ViolationSeverity.WARNING:
        return 'warn';
      case ViolationSeverity.INFO:
        return 'info';
      default:
        return 'log';
    }
  }

  private toCSV(violations: IConstraintViolation[]): string {
    if (violations.length === 0) return '';

    const headers = [
      'ID',
      'Constraint',
      'Severity',
      'Message',
      'Affected Tasks',
    ];
    const rows = violations.map((v) => [
      v.id,
      v.constraintName,
      v.severity,
      v.message,
      v.affectedTaskIds.join(';'),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  private toText(violations: IConstraintViolation[]): string {
    return violations
      .map(
        (v) =>
          `${v.severity}: ${v.constraintName} - ${v.message} (Tasks: ${v.affectedTaskIds.join(', ')})`
      )
      .join('\n');
  }
}
