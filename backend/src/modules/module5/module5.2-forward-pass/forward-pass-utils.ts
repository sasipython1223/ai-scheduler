/**
 * CPM Forward Pass Utilities
 * AI Scheduler - Supporting utilities for the forward pass algorithm
 */

import { WorkingDaysCalculator } from '@/models/schedule/workingDays.util';
import {
  LogicLink,
  LogicType,
  ScheduledTask,
} from '@/modules/module5/shared-types';

/**
 * Project start date constant for forward pass calculations
 */
export const DEFAULT_PROJECT_START = '2025-08-04T09:00:00.000Z'; // Monday

/**
 * Forward pass computation result
 */
export interface ForwardPassResult {
  tasks: ScheduledTask[];
  projectStartDate: string;
  projectEndDate: string;
}

/**
 * Forward pass configuration options
 */
export interface ForwardPassOptions {
  projectStartDate?: string;
  calendarId?: string;
  validateCycles?: boolean;
}

/**
 * Calculate the date constraint for a predecessor task
 */
export function calculateConstraintDate(
  predecessorTask: ScheduledTask,
  logicType: LogicType,
  lag: number,
  _workingDaysCalc: WorkingDaysCalculator
): string {
  const lagInMs = lag * 24 * 60 * 60 * 1000;

  switch (logicType) {
    case 'FS': // Finish-to-Start
      return new Date(
        new Date(predecessorTask.earlyFinish).getTime() + lagInMs
      ).toISOString();

    case 'SS': // Start-to-Start
      return new Date(
        new Date(predecessorTask.earlyStart).getTime() + lagInMs
      ).toISOString();

    case 'FF': // Finish-to-Finish
      // For FF, we need to work backwards from the predecessor's finish
      // This is more complex and typically handled in backward pass
      // For forward pass, we'll use the finish date as a constraint
      return new Date(
        new Date(predecessorTask.earlyFinish).getTime() + lagInMs
      ).toISOString();

    case 'SF': // Start-to-Finish (rare)
      return new Date(
        new Date(predecessorTask.earlyStart).getTime() + lagInMs
      ).toISOString();

    default:
      throw new Error(`Unknown logic type: ${logicType}`);
  }
}

/**
 * Find the latest constraint date from all predecessors
 */
export function findLatestConstraintDate(
  task: ScheduledTask,
  links: LogicLink[],
  taskMap: Map<string, ScheduledTask>,
  workingDaysCalc: WorkingDaysCalculator,
  projectStartDate: string
): string {
  const predecessorLinks = links.filter((link) => link.to === task.id);

  if (predecessorLinks.length === 0) {
    return projectStartDate;
  }

  let latestConstraint = new Date(projectStartDate);

  for (const link of predecessorLinks) {
    const predecessorTask = taskMap.get(link.from);
    if (!predecessorTask) continue;

    const constraintDate = calculateConstraintDate(
      predecessorTask,
      link.type,
      link.lag || 0,
      workingDaysCalc
    );

    const constraintDateTime = new Date(constraintDate);
    if (constraintDateTime > latestConstraint) {
      latestConstraint = constraintDateTime;
    }
  }

  return latestConstraint.toISOString();
}

/**
 * Include orphan tasks (tasks not in the dependency graph) in the process order
 */
export function includeOrphanTasks(
  allTaskIds: string[],
  processOrder: string[]
): string[] {
  const processedSet = new Set(processOrder);
  const orphanTasks = allTaskIds.filter((id) => !processedSet.has(id));
  return [...processOrder, ...orphanTasks];
}

/**
 * Calculate project end date from all scheduled tasks
 */
export function calculateProjectEndDate(tasks: ScheduledTask[]): string {
  if (tasks.length === 0) {
    return DEFAULT_PROJECT_START;
  }

  const latestFinish = tasks.reduce((latest, task) => {
    const taskFinish = new Date(task.earlyFinish);
    return taskFinish > latest ? taskFinish : latest;
  }, new Date(tasks[0].earlyFinish));

  return latestFinish.toISOString();
}
