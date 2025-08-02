/**
 * Task Model
 * AI Scheduler - Module 5.1: Task Management
 *
 * Task interface validation and metadata management
 */

import { TaskInput, ValidationResult } from '../../types/scheduleTypes';

/**
 * Task model with validation and utility methods
 */
export class Task {
  constructor(private taskData: TaskInput) {
    // Constructor doesn't throw - allows for validation testing
  }

  /**
   * Validate task input data
   */
  public validate(): ValidationResult[] {
    return validateTask(this.taskData);
  }

  /**
   * Get task data (immutable copy)
   */
  public getData(): TaskInput {
    return { ...this.taskData };
  }

  /**
   * Update task data with partial updates
   */
  public update(updates: Partial<TaskInput>): void {
    this.taskData = { ...this.taskData, ...updates };
  }

  /**
   * Check if task has predecessors
   */
  public hasPredecessors(): boolean {
    return Boolean(this.taskData.predecessors?.length);
  }

  /**
   * Get duration in working days
   */
  public getDuration(): number {
    return this.taskData.duration;
  }

  /**
   * Get WBS level from WBS code
   */
  public getWBSLevel(): number {
    if (!this.taskData.wbs) return 0;
    return this.taskData.wbs.split('.').length;
  }

  /**
   * Check if task is summary task (has subtasks)
   */
  public isSummaryTask(): boolean {
    // Check if task has child tasks based on WBS structure
    return Boolean(this.taskData.wbs && this.getWBSLevel() > 0);
  }

  /**
   * Get task priority level
   */
  public getPriority(): string {
    return this.taskData.priority || 'MEDIUM';
  }

  /**
   * Get task resource assignments
   */
  public getResources(): string[] {
    return this.taskData.resourceIds || [];
  }

  /**
   * Check if task is milestone (zero duration)
   */
  public isMilestone(): boolean {
    return this.taskData.duration === 0;
  }
}

/**
 * Task validation utilities
 */
export function validateTask(taskData: TaskInput): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Required fields validation
  if (!taskData.id?.trim()) {
    results.push({
      field: 'id',
      isValid: false,
      message: 'Task ID is required',
      severity: 'ERROR',
    });
  }

  if (!taskData.name?.trim()) {
    results.push({
      field: 'name',
      isValid: false,
      message: 'Task name is required',
      severity: 'ERROR',
    });
  }

  if (taskData.duration < 0) {
    results.push({
      field: 'duration',
      isValid: false,
      message: 'Duration must be greater than 0',
      severity: 'ERROR',
    });
  }

  // Date format validation
  if (taskData.start && !isValidISODate(taskData.start)) {
    results.push({
      field: 'start',
      isValid: false,
      message: 'Start date must be valid ISO string',
      severity: 'ERROR',
    });
  }

  if (taskData.finish && !isValidISODate(taskData.finish)) {
    results.push({
      field: 'finish',
      isValid: false,
      message: 'Finish date must be valid ISO string',
      severity: 'ERROR',
    });
  }

  return results;
}

/**
 * Validate ISO date string format (standalone utility)
 */
function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Create task instance with validation
 */
export function createTask(taskData: TaskInput): Task {
  const validationResults = validateTask(taskData);
  const errors = validationResults.filter(
    (result) => result.severity === 'ERROR'
  );
  if (errors.length > 0) {
    const errorMessages = errors.map((e) => e.message).join(', ');
    throw new Error(`Task validation failed: ${errorMessages}`);
  }
  return new Task(taskData);
}
