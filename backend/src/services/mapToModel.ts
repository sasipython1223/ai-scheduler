import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types';
import { randomUUID } from 'crypto';

/**
 * Map a create request to a Task model
 */
export const mapCreateRequestToTask = (request: CreateTaskRequest): Task => {
  const now = new Date();

  return {
    id: randomUUID(),
    title: request.title.trim(),
    description: request.description?.trim(),
    completed: false,
    priority: request.priority || 'medium',
    dueDate: request.dueDate ? new Date(request.dueDate) : undefined,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Map an update request to partial Task updates
 */
export const mapUpdateRequestToTask = (
  request: UpdateTaskRequest
): Partial<Task> => {
  const updates: Partial<Task> = {
    updatedAt: new Date(),
  };

  if (request.title !== undefined) {
    updates.title = request.title.trim();
  }

  if (request.description !== undefined) {
    updates.description = request.description.trim();
  }

  if (request.completed !== undefined) {
    updates.completed = request.completed;
  }

  if (request.priority !== undefined) {
    updates.priority = request.priority;
  }

  if (request.dueDate !== undefined) {
    updates.dueDate = new Date(request.dueDate);
  }

  return updates;
};

/**
 * Map a Task to API response format (exclude sensitive data if needed)
 */
export const mapTaskToResponse = (task: Task): Task => {
  return {
    ...task,
    // Convert dates to ISO strings for consistent API response
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    dueDate: task.dueDate,
  };
};

/**
 * Map multiple tasks to API response format
 */
export const mapTasksToResponse = (tasks: Task[]): Task[] => {
  return tasks.map(mapTaskToResponse);
};
