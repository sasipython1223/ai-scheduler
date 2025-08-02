/**
 * CPM Dependency Processor - Dependency validation and processing utilities
 * AI Scheduler - Module 5.2: Supporting utilities for dependency management
 */

import { DependencyDetector } from '../models/schedule/dependency.util';
import { WorkingDaysCalculator } from '../models/schedule/workingDays.util';
import { LogicLink, LogicType, ScheduledTask } from '../types/scheduleTypes';

/**
 * Dependency processing utilities for CPM forward pass
 */
export class CpmDependencyProcessor {
  private workingDaysCalc: WorkingDaysCalculator;

  constructor() {
    this.workingDaysCalc = new WorkingDaysCalculator();
  }

  /**
   * Validate that no circular dependencies exist
   *
   * @param links - Array of logic links to validate
   * @throws Error if circular dependency is detected
   */
  validateNoCycles(links: LogicLink[]): void {
    // Test each link to see if it would create a cycle
    for (const testLink of links) {
      const otherLinks = links.filter((link) => link.id !== testLink.id);
      const hasCycle = DependencyDetector.checkCircularDependency(
        otherLinks,
        testLink
      );

      if (hasCycle) {
        throw new Error(
          `Circular dependency detected involving link: ${testLink.from} → ${testLink.to}`
        );
      }
    }
  }

  /**
   * Include tasks that have no dependencies in processing order
   *
   * @param allTaskIds - Array of all task IDs
   * @param processOrder - Array of task IDs in dependency order
   * @returns Combined array with orphan tasks first, then dependency order
   */
  includeOrphanTasks(allTaskIds: string[], processOrder: string[]): string[] {
    const orderedSet = new Set(processOrder);
    const orphanTasks = allTaskIds.filter((id) => !orderedSet.has(id));

    return [...orphanTasks, ...processOrder];
  }

  /**
   * Find the latest constraint date from all predecessor dependencies
   *
   * @param task - Current task being processed
   * @param links - Array of logic links
   * @param taskMap - Map of task ID to scheduled task
   * @returns Latest constraint date (ISO string)
   */
  findLatestPredecessorConstraint(
    task: ScheduledTask,
    links: LogicLink[],
    taskMap: Map<string, ScheduledTask>
  ): string {
    const predecessorLinks = links.filter((link) => link.to === task.id);

    if (predecessorLinks.length === 0) {
      return task.earlyStart; // No predecessors, keep current early start
    }

    let latestConstraint = task.earlyStart;

    for (const link of predecessorLinks) {
      const predecessor = taskMap.get(link.from);
      if (!predecessor) continue;

      const constraintDate = this.calculateConstraintDate(
        predecessor,
        link.type,
        link.lag || 0
      );

      if (
        new Date(constraintDate).getTime() >
        new Date(latestConstraint).getTime()
      ) {
        latestConstraint = constraintDate;
      }
    }

    return latestConstraint;
  }

  /**
   * Calculate constraint date based on predecessor and link type
   *
   * @param predecessor - Predecessor task
   * @param linkType - Type of logic link
   * @param lag - Lag time in working days
   * @returns Constraint date (ISO string)
   */
  private calculateConstraintDate(
    predecessor: ScheduledTask,
    linkType: LogicType,
    lag: number
  ): string {
    let baseDate: string;

    switch (linkType) {
      case 'FS': // Finish-to-Start
        baseDate = predecessor.earlyFinish;
        break;
      case 'SS': // Start-to-Start
        baseDate = predecessor.earlyStart;
        break;
      case 'FF': // Finish-to-Finish
        // For FF, we need to work backwards from predecessor finish
        // This is a simplified implementation
        baseDate = predecessor.earlyFinish;
        break;
      case 'SF': // Start-to-Finish
        // For SF, we need to work backwards from predecessor start
        // This is a simplified implementation
        baseDate = predecessor.earlyStart;
        break;
      default:
        baseDate = predecessor.earlyFinish;
    }

    // Apply lag (can be positive or negative)
    if (lag !== 0) {
      return this.workingDaysCalc.addWorkingDays(baseDate, lag);
    }

    return baseDate;
  }
}
