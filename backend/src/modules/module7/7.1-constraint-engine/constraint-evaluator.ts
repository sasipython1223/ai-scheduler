/**
 * Module 7.1 - Constraint Evaluator
 *
 * IMPLEMENTATION PLAN:
 *
 * Purpose: Fast, incremental validation during scheduling/repair.
 *
 * API:
 * - evaluateConstraintsRealTime(schedule): Promise<ValidationReport>
 * - calculateConstraintImpact(schedule): Promise<ImpactSummary>
 *
 * Notes: Use Module 6 ValidationEngine and expose a lightweight façade.
 * Future: May support diff-based validation for performance optimization.
 */

import type {
  ScheduleGraph,
  ValidationEngine,
  ValidationReport,
} from './constraint-aware-scheduler';

// TODO: lift to shared-types.ts when finalized
export interface ImpactSummary {
  critical: number;
  high: number;
  softCount: number;
}

/**
 * Provides fast, real-time constraint evaluation during scheduling operations.
 *
 * Acts as a performance-optimized façade over Module 6's ValidationEngine,
 * with future support for incremental and differential validation.
 *
 * @example
 * ```typescript
 * const evaluator = new ConstraintEvaluator(validationEngine);
 * const report = await evaluator.evaluateConstraintsRealTime(schedule);
 * const impact = await evaluator.calculateConstraintImpact(schedule);
 * ```
 */
export class ConstraintEvaluator {
  /**
   * Creates a new constraint evaluator instance.
   *
   * @param validationEngine - Core validation engine from Module 6
   */
  constructor(private validationEngine: ValidationEngine) {}

  /**
   * Performs real-time constraint evaluation on a schedule.
   *
   * Currently delegates to Module 6 ValidationEngine. Future versions
   * may implement differential validation for improved performance
   * during iterative optimization loops.
   *
   * @param schedule - Schedule graph to validate
   * @returns Promise resolving to comprehensive validation report
   */
  async evaluateConstraintsRealTime(
    schedule: ScheduleGraph
  ): Promise<ValidationReport> {
    // TODO: thin wrapper; may support diff-based validation later
    return this.validationEngine.validate(schedule);
  }

  /**
   * Calculates high-level impact summary of constraint violations.
   *
   * Provides quick assessment of violation severity distribution
   * for optimization decision-making and user feedback.
   *
   * @param schedule - Schedule graph to analyze
   * @returns Promise resolving to violation impact summary
   */
  async calculateConstraintImpact(
    schedule: ScheduleGraph
  ): Promise<ImpactSummary> {
    // TODO: compute simple counts from ValidationReport
    const report = await this.evaluateConstraintsRealTime(schedule);

    const impact: ImpactSummary = {
      critical: 0,
      high: 0,
      softCount: 0,
    };

    for (const violation of report.violations) {
      switch (violation.severity) {
        case 'CRITICAL':
          impact.critical++;
          break;
        case 'HIGH':
          impact.high++;
          break;
        case 'MEDIUM':
        case 'LOW':
          impact.softCount++;
          break;
      }
    }

    return impact;
  }

  /**
   * Identifies the most critical constraints blocking schedule feasibility.
   *
   * Prioritizes violations by severity and impact to guide optimization
   * strategy selection and repair prioritization.
   *
   * @param schedule - Schedule graph to analyze
   * @returns Promise resolving to prioritized list of blocking constraints
   */
  async identifyBlockingConstraints(
    schedule: ScheduleGraph
  ): Promise<string[]> {
    const report = await this.evaluateConstraintsRealTime(schedule);

    return report.violations
      .filter(
        (v) =>
          v.type === 'HARD' &&
          (v.severity === 'CRITICAL' || v.severity === 'HIGH')
      )
      .map((v) => v.id)
      .slice(0, 10); // Limit to top 10 for focus
  }

  /**
   * Estimates the optimization effort required to resolve violations.
   *
   * Provides guidance for optimization strategy selection and
   * time budget allocation across different repair approaches.
   *
   * @param schedule - Schedule graph to analyze
   * @returns Promise resolving to effort estimation metrics
   */
  async estimateOptimizationEffort(schedule: ScheduleGraph): Promise<{
    complexity: 'LOW' | 'MEDIUM' | 'HIGH';
    estimatedIterations: number;
    suggestedStrategy: string;
  }> {
    const impact = await this.calculateConstraintImpact(schedule);

    // Simple heuristic for effort estimation
    const totalViolations = impact.critical + impact.high + impact.softCount;

    if (totalViolations === 0) {
      return {
        complexity: 'LOW',
        estimatedIterations: 0,
        suggestedStrategy: 'none',
      };
    }

    if (impact.critical > 5 || totalViolations > 20) {
      return {
        complexity: 'HIGH',
        estimatedIterations: 10 + impact.critical * 2,
        suggestedStrategy: 'comprehensive',
      };
    }

    if (impact.critical > 0 || impact.high > 3) {
      return {
        complexity: 'MEDIUM',
        estimatedIterations: 5 + impact.critical + impact.high,
        suggestedStrategy: 'targeted',
      };
    }

    return {
      complexity: 'LOW',
      estimatedIterations: 2 + Math.ceil(totalViolations / 3),
      suggestedStrategy: 'baseline',
    };
  }
}
