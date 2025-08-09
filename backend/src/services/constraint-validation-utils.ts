/**
 * Module 6.2: Constraint Validation Utilities
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Validation utilities and helper functions
 * Dependencies: constraint-types.ts
 */

import {
  ConstraintCategory,
  ConstraintValidationResult,
  ConstraintViolation,
  ViolationSeverity,
} from '../types/constraint-types.js';

/**
 * Task Interface for Validation
 */
export interface TaskValidationInput {
  id: string;
  name: string;
  startDate?: Date;
  finishDate?: Date;
  duration?: number;
  dependencies?: Array<{
    predecessorId: string;
    successorId: string;
    type: 'FS' | 'SS' | 'FF' | 'SF';
    lag: number;
  }>;
  calendarId?: string;
  resourceAssignments?: string[];
  projectId: string;
}

/**
 * Validation Options
 */
export interface ValidationOptions {
  skipSoftConstraints?: boolean;
  skipInactiveConstraints?: boolean;
  stopOnFirstCritical?: boolean;
  includeWarnings?: boolean;
  includeInfo?: boolean;
  maxViolations?: number;
}

/**
 * Batch Validation Options
 */
export interface BatchValidationOptions extends ValidationOptions {
  parallel?: boolean;
  chunkSize?: number;
  onProgress?: (completed: number, total: number) => void;
}

/**
 * Validation Statistics
 */
export interface ValidationStatistics {
  totalTasks: number;
  validatedTasks: number;
  totalViolations: number;
  violationsBySeverity: Record<ViolationSeverity, number>;
  violationsByCategory: Record<ConstraintCategory, number>;
  processingTimeMs: number;
  averageTimePerTask: number;
}

/**
 * Validation Utilities
 */
export class ValidationUtils {
  /**
   * Check if validation result has blocking violations
   */
  static hasBlockingViolations(result: ConstraintValidationResult): boolean {
    return (
      result.criticalViolations.length > 0 || result.errorViolations.length > 0
    );
  }

  /**
   * Get summary message for validation result
   */
  static getSummaryMessage(result: ConstraintValidationResult): string {
    if (result.isValid) {
      return `✅ All ${result.totalConstraints} constraints passed validation`;
    }

    const parts = [];
    if (result.criticalViolations.length > 0) {
      parts.push(`${result.criticalViolations.length} critical`);
    }
    if (result.errorViolations.length > 0) {
      parts.push(`${result.errorViolations.length} error`);
    }
    if (result.warningViolations.length > 0) {
      parts.push(`${result.warningViolations.length} warning`);
    }

    return `❌ Validation failed: ${parts.join(', ')} violation(s) found`;
  }

  /**
   * Filter violations by severity
   */
  static filterBySeverity(
    violations: ConstraintViolation[],
    severity: ViolationSeverity
  ): ConstraintViolation[] {
    return violations.filter((v) => v.severity === severity);
  }

  /**
   * Filter violations by category (placeholder - requires constraint lookup)
   */
  static filterByCategory(
    violations: ConstraintViolation[],
    _category: ConstraintCategory
  ): ConstraintViolation[] {
    // Note: ConstraintViolation doesn't have constraintCategory field
    // This would need to be determined from the constraint itself
    return violations; // Placeholder - would need constraint lookup
  }

  /**
   * Group violations by task
   */
  static groupByTask(
    violations: ConstraintViolation[]
  ): Record<string, ConstraintViolation[]> {
    return violations.reduce(
      (groups, violation) => {
        const taskIds = violation.affectedTaskIds;
        taskIds.forEach((taskId) => {
          if (!groups[taskId]) {
            groups[taskId] = [];
          }
          groups[taskId].push(violation);
        });
        return groups;
      },
      {} as Record<string, ConstraintViolation[]>
    );
  }

  /**
   * Calculate validation statistics
   */
  static calculateStatistics(
    results: ConstraintValidationResult[]
  ): ValidationStatistics {
    const allViolations = results.flatMap((r) => [
      ...r.criticalViolations,
      ...r.errorViolations,
      ...r.warningViolations,
      ...r.infoViolations,
    ]);

    const processingTimes = results.map((r) => r.validationDuration || 0);

    const violationsBySeverity = allViolations.reduce(
      (counts, violation) => {
        counts[violation.severity] = (counts[violation.severity] || 0) + 1;
        return counts;
      },
      {} as Record<ViolationSeverity, number>
    );

    // Cannot determine category from violation directly
    const violationsByCategory = {} as Record<ConstraintCategory, number>;

    const totalProcessingTime = processingTimes.reduce(
      (sum, time) => sum + time,
      0
    );

    return {
      totalTasks: results.length,
      validatedTasks: results.filter((r) => !r.isValid).length,
      totalViolations: allViolations.length,
      violationsBySeverity,
      violationsByCategory,
      processingTimeMs: totalProcessingTime,
      averageTimePerTask: totalProcessingTime / results.length || 0,
    };
  }

  /**
   * Merge validation results
   */
  static mergeResults(
    results: ConstraintValidationResult[]
  ): ConstraintValidationResult {
    const allCritical = results.flatMap((r) => r.criticalViolations);
    const allError = results.flatMap((r) => r.errorViolations);
    const allWarning = results.flatMap((r) => r.warningViolations);
    const allInfo = results.flatMap((r) => r.infoViolations);

    return {
      isValid: allCritical.length === 0 && allError.length === 0,
      totalConstraints: results.reduce((sum, r) => sum + r.totalConstraints, 0),
      violationCount:
        allCritical.length +
        allError.length +
        allWarning.length +
        allInfo.length,
      criticalViolations: allCritical,
      errorViolations: allError,
      warningViolations: allWarning,
      infoViolations: allInfo,
      validationDuration: results.reduce(
        (sum, r) => sum + (r.validationDuration || 0),
        0
      ),
      suggestionsGenerated: results.reduce(
        (sum, r) => sum + (r.suggestionsGenerated || 0),
        0
      ),
      autoFixable: results.reduce((sum, r) => sum + (r.autoFixable || 0), 0),
      context: results[0]?.context || {
        projectId: '',
        calculatedAt: new Date(),
        engineVersion: '1.0',
        taskCount: 0,
        dependencyCount: 0,
        userTriggered: false,
        batchValidation: true,
      },
    };
  }

  /**
   * Sort violations by priority
   */
  static sortByPriority(
    violations: ConstraintViolation[]
  ): ConstraintViolation[] {
    const severityOrder = {
      [ViolationSeverity.CRITICAL]: 0,
      [ViolationSeverity.ERROR]: 1,
      [ViolationSeverity.WARNING]: 2,
      [ViolationSeverity.INFO]: 3,
    };

    return violations.sort((a, b) => {
      // First sort by severity
      const severityDiff =
        severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;

      // Finally by violation ID for consistent ordering
      return a.id.localeCompare(b.id);
    });
  }

  /**
   * Create summary report
   */
  static createSummaryReport(results: ConstraintValidationResult[]): {
    overview: ValidationStatistics;
    criticalIssues: ConstraintViolation[];
    topViolations: ConstraintViolation[];
    recommendations: string[];
  } {
    const overview = this.calculateStatistics(results);
    const allViolations = results.flatMap((r) => [
      ...r.criticalViolations,
      ...r.errorViolations,
      ...r.warningViolations,
      ...r.infoViolations,
    ]);
    const sortedViolations = this.sortByPriority(allViolations);

    const criticalIssues = this.filterBySeverity(
      sortedViolations,
      ViolationSeverity.CRITICAL
    );

    const topViolations = sortedViolations.slice(0, 10);

    const recommendations: string[] = [];
    if (criticalIssues.length > 0) {
      recommendations.push(
        `Address ${criticalIssues.length} critical constraint violations immediately`
      );
    }
    if (overview.violationsBySeverity[ViolationSeverity.ERROR] > 0) {
      recommendations.push(
        `Resolve ${overview.violationsBySeverity[ViolationSeverity.ERROR]} error-level violations`
      );
    }
    if (overview.averageTimePerTask > 100) {
      recommendations.push(
        'Consider optimizing constraint validation performance'
      );
    }

    return {
      overview,
      criticalIssues,
      topViolations,
      recommendations,
    };
  }
}
