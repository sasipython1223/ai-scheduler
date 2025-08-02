import type { CreateTaskRequest, UpdateTaskRequest } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate task creation input
 */
export const validateCreateTask = (
  input: CreateTaskRequest
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Title validation
  if (!input.title || typeof input.title !== 'string') {
    errors.push({
      field: 'title',
      message: 'Title is required and must be a string',
    });
  } else if (input.title.trim().length < 3) {
    errors.push({
      field: 'title',
      message: 'Title must be at least 3 characters long',
    });
  } else if (input.title.length > 200) {
    errors.push({
      field: 'title',
      message: 'Title must not exceed 200 characters',
    });
  }

  // Description validation
  if (input.description !== undefined) {
    if (typeof input.description !== 'string') {
      errors.push({
        field: 'description',
        message: 'Description must be a string',
      });
    } else if (input.description.length > 1000) {
      errors.push({
        field: 'description',
        message: 'Description must not exceed 1000 characters',
      });
    }
  }

  // Priority validation
  if (input.priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(input.priority)) {
      errors.push({
        field: 'priority',
        message: 'Priority must be one of: low, medium, high',
      });
    }
  }

  // Due date validation
  if (input.dueDate !== undefined) {
    const dueDate = new Date(input.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.push({
        field: 'dueDate',
        message: 'Due date must be a valid date',
      });
    } else if (dueDate < new Date()) {
      errors.push({
        field: 'dueDate',
        message: 'Due date cannot be in the past',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate task update input
 */
export const validateUpdateTask = (
  input: UpdateTaskRequest
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Title validation (optional for updates)
  if (input.title !== undefined) {
    if (typeof input.title !== 'string') {
      errors.push({ field: 'title', message: 'Title must be a string' });
    } else if (input.title.trim().length < 3) {
      errors.push({
        field: 'title',
        message: 'Title must be at least 3 characters long',
      });
    } else if (input.title.length > 200) {
      errors.push({
        field: 'title',
        message: 'Title must not exceed 200 characters',
      });
    }
  }

  // Description validation
  if (input.description !== undefined) {
    if (typeof input.description !== 'string') {
      errors.push({
        field: 'description',
        message: 'Description must be a string',
      });
    } else if (input.description.length > 1000) {
      errors.push({
        field: 'description',
        message: 'Description must not exceed 1000 characters',
      });
    }
  }

  // Completed validation
  if (input.completed !== undefined && typeof input.completed !== 'boolean') {
    errors.push({ field: 'completed', message: 'Completed must be a boolean' });
  }

  // Priority validation
  if (input.priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(input.priority)) {
      errors.push({
        field: 'priority',
        message: 'Priority must be one of: low, medium, high',
      });
    }
  }

  // Due date validation
  if (input.dueDate !== undefined) {
    const dueDate = new Date(input.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.push({
        field: 'dueDate',
        message: 'Due date must be a valid date',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate task ID
 */
export const validateTaskId = (id: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!id || typeof id !== 'string') {
    errors.push({
      field: 'id',
      message: 'Task ID is required and must be a string',
    });
  } else if (id.trim().length === 0) {
    errors.push({ field: 'id', message: 'Task ID cannot be empty' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
