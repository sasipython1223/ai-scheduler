/**
 * Module 5.4 - Validation Utilities
 * Purpose: Reusable validation functions for consistency checking
 * Requirements:
 * - Validate float relationships and constraints
 * - Check data integrity and consistency
 * - Provide detailed validation results
 */

import { Task } from '@/modules/module5/shared-types';
import { ValidationResult } from '../types/SharedTypes';
import {
  isFloatWithinBounds,
  isFloatZero,
  validateFloatRelationship,
} from './FloatUtils';

/**
 * Extended Task interface with float properties
 */
interface TaskWithFloat extends Task {
  totalFloat?: number;
  freeFloat?: number;
  isCritical?: boolean;
  earlyStart?: Date;
  earlyFinish?: Date;
  lateStart?: Date;
  lateFinish?: Date;
}

/**
 * Validates that a task has all required date properties
 * @param task Task to validate
 * @returns Validation result
 */
export function validateTaskDates(task: TaskWithFloat): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for null/missing dates
  checkRequiredDates(task, errors);

  // Validate date order relationships
  validateDateOrder(task, errors, warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Checks for missing required date properties
 * @param task Task to validate
 * @param errors Array to collect errors
 */
function checkRequiredDates(task: TaskWithFloat, errors: string[]): void {
  if (!task.earlyStart) {
    errors.push(`Task ${task.id}: Missing earlyStart date`);
  }

  if (!task.earlyFinish) {
    errors.push(`Task ${task.id}: Missing earlyFinish date`);
  }

  if (!task.lateStart) {
    errors.push(`Task ${task.id}: Missing lateStart date`);
  }

  if (!task.lateFinish) {
    errors.push(`Task ${task.id}: Missing lateFinish date`);
  }
}

/**
 * Validates date order relationships
 * @param task Task to validate
 * @param errors Array to collect errors
 * @param warnings Array to collect warnings
 */
function validateDateOrder(
  task: TaskWithFloat,
  errors: string[],
  warnings: string[]
): void {
  if (
    task.earlyStart &&
    task.earlyFinish &&
    task.earlyStart > task.earlyFinish
  ) {
    errors.push(`Task ${task.id}: Early start date is after early finish date`);
  }

  if (task.lateStart && task.lateFinish && task.lateStart > task.lateFinish) {
    errors.push(`Task ${task.id}: Late start date is after late finish date`);
  }

  if (task.earlyStart && task.lateStart && task.earlyStart > task.lateStart) {
    warnings.push(
      `Task ${task.id}: Early start is after late start (negative float)`
    );
  }
}

/**
 * Validates float calculations for consistency
 * @param task Task with float properties
 * @param epsilon Precision threshold
 * @returns Validation result
 */
export function validateFloatConsistency(
  task: TaskWithFloat,
  epsilon: number = 0.001
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check float bounds
  checkFloatBounds(task, errors);

  // Validate float relationships
  validateFloatRelationships(task, epsilon, errors);

  // Check critical flag consistency
  validateCriticalFlagConsistency(task, epsilon, errors);

  // Validate calculated vs stored float values
  validateCalculatedFloat(task, epsilon, warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Checks if float values are within acceptable bounds
 * @param task Task to validate
 * @param errors Array to collect errors
 */
function checkFloatBounds(task: TaskWithFloat, errors: string[]): void {
  if (task.totalFloat !== undefined && !isFloatWithinBounds(task.totalFloat)) {
    errors.push(
      `Task ${task.id}: Total float ${task.totalFloat} is outside acceptable bounds`
    );
  }

  if (task.freeFloat !== undefined && !isFloatWithinBounds(task.freeFloat)) {
    errors.push(
      `Task ${task.id}: Free float ${task.freeFloat} is outside acceptable bounds`
    );
  }
}

/**
 * Validates float relationship: freeFloat <= totalFloat
 * @param task Task to validate
 * @param epsilon Precision threshold
 * @param errors Array to collect errors
 */
function validateFloatRelationships(
  task: TaskWithFloat,
  epsilon: number,
  errors: string[]
): void {
  if (task.totalFloat !== undefined && task.freeFloat !== undefined) {
    if (!validateFloatRelationship(task.totalFloat, task.freeFloat, epsilon)) {
      errors.push(
        `Task ${task.id}: Free float (${task.freeFloat}) exceeds total float (${task.totalFloat})`
      );
    }
  }
}

/**
 * Validates critical flag consistency with total float
 * @param task Task to validate
 * @param epsilon Precision threshold
 * @param errors Array to collect errors
 */
function validateCriticalFlagConsistency(
  task: TaskWithFloat,
  epsilon: number,
  errors: string[]
): void {
  if (task.isCritical !== undefined && task.totalFloat !== undefined) {
    const shouldBeCritical = isFloatZero(task.totalFloat, epsilon);
    if (task.isCritical !== shouldBeCritical) {
      errors.push(
        `Task ${task.id}: isCritical flag (${task.isCritical}) inconsistent with total float (${task.totalFloat})`
      );
    }
  }
}

/**
 * Validates calculated float against stored value
 * @param task Task to validate
 * @param epsilon Precision threshold
 * @param warnings Array to collect warnings
 */
function validateCalculatedFloat(
  task: TaskWithFloat,
  epsilon: number,
  warnings: string[]
): void {
  if (task.earlyStart && task.lateStart && task.totalFloat !== undefined) {
    const calculatedFloat =
      (task.lateStart.getTime() - task.earlyStart.getTime()) /
      (1000 * 60 * 60 * 24);
    if (!isFloatZero(calculatedFloat - task.totalFloat, epsilon)) {
      warnings.push(
        `Task ${task.id}: Calculated total float (${calculatedFloat}) differs from stored value (${task.totalFloat})`
      );
    }
  }
}

/**
 * Validates an array of tasks for batch consistency
 * @param tasks Array of tasks to validate
 * @param epsilon Precision threshold
 * @returns Validation result
 */
export function validateTaskBatch(
  tasks: TaskWithFloat[],
  epsilon: number = 0.001
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (tasks.length === 0) {
    warnings.push('Empty task array provided for validation');
    return { isValid: true, errors, warnings };
  }

  let validTasks = 0;
  let invalidTasks = 0;

  tasks.forEach((task) => {
    const dateValidation = validateTaskDates(task);
    const floatValidation = validateFloatConsistency(task, epsilon);

    if (dateValidation.isValid && floatValidation.isValid) {
      validTasks++;
    } else {
      invalidTasks++;
      errors.push(...dateValidation.errors, ...floatValidation.errors);
      warnings.push(...dateValidation.warnings, ...floatValidation.warnings);
    }
  });

  // Add summary statistics
  warnings.push(
    `Validation summary: ${validTasks} valid tasks, ${invalidTasks} invalid tasks`
  );

  return {
    isValid: invalidTasks === 0,
    errors,
    warnings,
  };
}

/**
 * Validates that task IDs are unique within an array
 * @param tasks Array of tasks
 * @returns Validation result
 */
export function validateUniqueTaskIds(
  tasks: TaskWithFloat[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();
  const duplicates = new Set<string>();

  tasks.forEach((task) => {
    if (!task.id) {
      errors.push('Task found without ID');
      return;
    }

    if (seenIds.has(task.id)) {
      duplicates.add(task.id);
    } else {
      seenIds.add(task.id);
    }
  });

  duplicates.forEach((id) => {
    errors.push(`Duplicate task ID found: ${id}`);
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates that all tasks have the required float properties
 * @param tasks Array of tasks
 * @returns Validation result
 */
export function validateRequiredFloatProperties(
  tasks: TaskWithFloat[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  tasks.forEach((task) => {
    if (task.totalFloat === undefined) {
      errors.push(`Task ${task.id}: Missing totalFloat property`);
    }

    if (task.freeFloat === undefined) {
      errors.push(`Task ${task.id}: Missing freeFloat property`);
    }

    if (task.isCritical === undefined) {
      warnings.push(`Task ${task.id}: Missing isCritical property`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Performs comprehensive validation on a task array
 * @param tasks Array of tasks to validate
 * @param epsilon Precision threshold
 * @returns Comprehensive validation result
 */
export function performComprehensiveValidation(
  tasks: TaskWithFloat[],
  epsilon: number = 0.001
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Run all validations
  const uniqueIdValidation = validateUniqueTaskIds(tasks);
  const requiredPropsValidation = validateRequiredFloatProperties(tasks);
  const batchValidation = validateTaskBatch(tasks, epsilon);

  // Combine results
  errors.push(
    ...uniqueIdValidation.errors,
    ...requiredPropsValidation.errors,
    ...batchValidation.errors
  );
  warnings.push(
    ...uniqueIdValidation.warnings,
    ...requiredPropsValidation.warnings,
    ...batchValidation.warnings
  );

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
