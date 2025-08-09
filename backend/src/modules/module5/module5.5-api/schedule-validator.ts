/**
 * Schedule Validator - Input Validation Layer
 * Module 5.5: Request validation and sanitization
 *
 * Purpose: Validate and sanitize API input before processing
 * Handles: Type validation, format checking, business rule validation
 */

import type { LogicLink, TaskInput } from '@/modules/module5/shared-types';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validated schedule request
 */
export interface ValidatedScheduleRequest {
  tasks: TaskInput[];
  logicLinks: LogicLink[];
}

/**
 * Schedule Validator - Input validation service
 */
export class ScheduleValidator {
  /**
   * Validate complete schedule request
   *
   * @param request - Raw request object
   * @returns Validation result
   */
  public validateScheduleRequest(
    request: unknown
  ): ValidationResult & { data?: ValidatedScheduleRequest } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if request is object
    if (!request || typeof request !== 'object') {
      return {
        isValid: false,
        errors: ['Request must be a valid object'],
        warnings: [],
      };
    }

    const req = request as Record<string, unknown>;

    // Validate required fields
    if (!req.tasks) {
      errors.push('tasks field is required');
    }

    if (!req.logicLinks) {
      errors.push('logicLinks field is required');
    }

    if (errors.length > 0) {
      return { isValid: false, errors, warnings };
    }

    // Validate tasks array
    const taskValidation = this.validateTasks(req.tasks);
    if (!taskValidation.isValid) {
      errors.push(...taskValidation.errors);
    }
    warnings.push(...taskValidation.warnings);

    // Validate logic links array
    const linkValidation = this.validateLogicLinks(req.logicLinks);
    if (!linkValidation.isValid) {
      errors.push(...linkValidation.errors);
    }
    warnings.push(...linkValidation.warnings);

    if (errors.length > 0) {
      return { isValid: false, errors, warnings };
    }

    // Return validated data
    return {
      isValid: true,
      errors: [],
      warnings,
      data: {
        tasks: req.tasks as TaskInput[],
        logicLinks: req.logicLinks as LogicLink[],
      },
    };
  }

  /**
   * Validate tasks array
   */
  private validateTasks(tasks: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if tasks is array
    if (!Array.isArray(tasks)) {
      return {
        isValid: false,
        errors: ['tasks must be an array'],
        warnings: [],
      };
    }

    // Check for empty array
    if (tasks.length === 0) {
      return {
        isValid: false,
        errors: ['At least one task is required'],
        warnings: [],
      };
    }

    // Validate each task
    const taskIds = new Set<string>();

    tasks.forEach((task, index) => {
      const taskErrors = this.validateSingleTask(task, index);
      errors.push(...taskErrors);

      // Check for duplicate IDs
      if (task && typeof task === 'object' && 'id' in task) {
        const taskId = (task as { id: unknown }).id;
        if (typeof taskId === 'string') {
          if (taskIds.has(taskId)) {
            errors.push(`Duplicate task ID found: ${taskId}`);
          } else {
            taskIds.add(taskId);
          }
        }
      }
    });

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate single task
   */
  private validateSingleTask(task: unknown, index: number): string[] {
    const errors: string[] = [];

    if (!task || typeof task !== 'object') {
      errors.push(`Task at index ${index} must be an object`);
      return errors;
    }

    const t = task as Record<string, unknown>;

    // Validate required fields
    errors.push(...this.validateTaskRequiredFields(t, index));

    // Validate optional fields
    errors.push(...this.validateTaskOptionalFields(t, index));

    return errors;
  }

  /**
   * Validate required task fields
   */
  private validateTaskRequiredFields(
    t: Record<string, unknown>,
    index: number
  ): string[] {
    const errors: string[] = [];

    if (!t.id || typeof t.id !== 'string' || t.id.trim() === '') {
      errors.push(`Task at index ${index} must have a non-empty string 'id'`);
    }

    if (!t.name || typeof t.name !== 'string' || t.name.trim() === '') {
      errors.push(`Task at index ${index} must have a non-empty string 'name'`);
    }

    if (
      t.duration === undefined ||
      typeof t.duration !== 'number' ||
      t.duration <= 0
    ) {
      errors.push(
        `Task at index ${index} must have a positive number 'duration'`
      );
    }

    return errors;
  }

  /**
   * Validate optional task fields
   */
  private validateTaskOptionalFields(
    t: Record<string, unknown>,
    index: number
  ): string[] {
    const errors: string[] = [];

    if (t.wbs !== undefined && typeof t.wbs !== 'string') {
      errors.push(`Task at index ${index} 'wbs' must be a string if provided`);
    }

    if (t.start !== undefined && typeof t.start !== 'string') {
      errors.push(
        `Task at index ${index} 'start' must be a valid ISO date string if provided`
      );
    }

    if (t.finish !== undefined && typeof t.finish !== 'string') {
      errors.push(
        `Task at index ${index} 'finish' must be a valid ISO date string if provided`
      );
    }

    return errors;
  }

  /**
   * Validate logic links array
   */
  private validateLogicLinks(logicLinks: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if logicLinks is array
    if (!Array.isArray(logicLinks)) {
      return {
        isValid: false,
        errors: ['logicLinks must be an array'],
        warnings: [],
      };
    }

    // Validate each logic link
    logicLinks.forEach((link, index) => {
      const linkErrors = this.validateSingleLogicLink(link, index);
      errors.push(...linkErrors);
    });

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate single logic link
   */
  private validateSingleLogicLink(link: unknown, index: number): string[] {
    const errors: string[] = [];

    if (!link || typeof link !== 'object') {
      errors.push(`Logic link at index ${index} must be an object`);
      return errors;
    }

    const l = link as Record<string, unknown>;

    // Validate required fields
    errors.push(...this.validateLinkRequiredFields(l, index));

    // Validate optional fields
    errors.push(...this.validateLinkOptionalFields(l, index));

    // Check for self-referencing link
    if (l.from === l.to) {
      errors.push(
        `Logic link at index ${index} cannot reference the same task (${l.from} -> ${l.to})`
      );
    }

    return errors;
  }

  /**
   * Validate required logic link fields
   */
  private validateLinkRequiredFields(
    l: Record<string, unknown>,
    index: number
  ): string[] {
    const errors: string[] = [];

    if (!l.from || typeof l.from !== 'string' || l.from.trim() === '') {
      errors.push(
        `Logic link at index ${index} must have a non-empty string 'from'`
      );
    }

    if (!l.to || typeof l.to !== 'string' || l.to.trim() === '') {
      errors.push(
        `Logic link at index ${index} must have a non-empty string 'to'`
      );
    }

    if (!l.type || typeof l.type !== 'string') {
      errors.push(`Logic link at index ${index} must have a string 'type'`);
    } else {
      const validTypes = ['FS', 'SS', 'FF', 'SF'];
      if (!validTypes.includes(l.type as string)) {
        errors.push(
          `Logic link at index ${index} 'type' must be one of: ${validTypes.join(', ')}`
        );
      }
    }

    return errors;
  }

  /**
   * Validate optional logic link fields
   */
  private validateLinkOptionalFields(
    l: Record<string, unknown>,
    index: number
  ): string[] {
    const errors: string[] = [];

    if (l.lag !== undefined && (typeof l.lag !== 'number' || isNaN(l.lag))) {
      errors.push(
        `Logic link at index ${index} 'lag' must be a number if provided`
      );
    }

    if (l.id !== undefined && typeof l.id !== 'string') {
      errors.push(
        `Logic link at index ${index} 'id' must be a string if provided`
      );
    }

    return errors;
  }

  /**
   * Sanitize and clean input data
   */
  public sanitizeInput(
    request: ValidatedScheduleRequest
  ): ValidatedScheduleRequest {
    return {
      tasks: request.tasks.map((task) => ({
        ...task,
        id: task.id.trim(),
        name: task.name.trim(),
        duration: Math.round(task.duration * 100) / 100, // Round to 2 decimal places
        wbs: task.wbs?.trim(),
      })),
      logicLinks: request.logicLinks.map((link) => ({
        ...link,
        from: link.from.trim(),
        to: link.to.trim(),
        lag: link.lag || 0,
        id: link.id || `${link.from.trim()}-${link.to.trim()}`,
      })),
    };
  }
}
