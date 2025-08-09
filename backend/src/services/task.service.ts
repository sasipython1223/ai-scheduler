/**
 * Task Service - Business logic for task management
 * Separated from route handlers for better modularity and testing
 */

import { randomUUID } from 'crypto';

// Task interface (should match frontend Task interface)
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Request body interfaces
export interface CreateTaskBody {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface UpdateTaskBody {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

// In-memory storage (replace with database in production)
const tasks: Task[] = [
  {
    id: '1',
    title: 'Setup project structure',
    description: 'Create the basic folder structure and configuration files',
    completed: true,
    priority: 'high',
    dueDate: new Date('2024-01-15'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: '2',
    title: 'Implement authentication',
    description: 'Add user authentication and authorization',
    completed: false,
    priority: 'high',
    dueDate: new Date('2024-01-20'),
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: '3',
    title: 'Design database schema',
    description: 'Create the database tables and relationships',
    completed: false,
    priority: 'medium',
    dueDate: new Date('2024-01-25'),
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
  },
];

/**
 * Task Service Class - Encapsulates all task-related business logic
 */
export class TaskService {
  /**
   * Get task statistics
   */
  static getTaskStats() {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter(
      (task) => task.priority === 'high'
    ).length;

    return {
      total,
      completed,
      pending,
      highPriority,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  /**
   * Get all tasks with optional filtering
   */
  static getAllTasks(filters?: {
    priority?: string;
    completed?: boolean;
    search?: string;
  }) {
    let filteredTasks = [...tasks];

    if (filters?.priority) {
      filteredTasks = filteredTasks.filter(
        (task) => task.priority === filters.priority
      );
    }

    if (filters?.completed !== undefined) {
      filteredTasks = filteredTasks.filter(
        (task) => task.completed === filters.completed
      );
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
      );
    }

    return filteredTasks.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Get task by ID
   */
  static getTaskById(id: string): Task | null {
    return tasks.find((task) => task.id === id) || null;
  }

  /**
   * Create a new task
   */
  static createTask(taskData: CreateTaskBody): Task {
    const newTask: Task = {
      id: randomUUID(),
      title: taskData.title,
      description: taskData.description,
      completed: false,
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    tasks.push(newTask);
    return newTask;
  }

  /**
   * Update an existing task
   */
  static updateTask(id: string, updates: UpdateTaskBody): Task | null {
    const taskIndex = tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
      return null;
    }

    const updatedTask: Task = {
      ...tasks[taskIndex],
      ...updates,
      dueDate: updates.dueDate
        ? new Date(updates.dueDate)
        : tasks[taskIndex].dueDate,
      updatedAt: new Date(),
    };

    tasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  /**
   * Delete a task
   */
  static deleteTask(id: string): boolean {
    const taskIndex = tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
      return false;
    }

    tasks.splice(taskIndex, 1);
    return true;
  }

  /**
   * Validate task data
   */
  static validateTaskData(data: CreateTaskBody | UpdateTaskBody): string[] {
    const errors: string[] = [];

    if ('title' in data && (!data.title || data.title.trim().length === 0)) {
      errors.push('Title is required');
    }

    if ('title' in data && data.title && data.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    if (data.description && data.description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }

    if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
      errors.push('Priority must be low, medium, or high');
    }

    if (data.dueDate) {
      const dueDate = new Date(data.dueDate);
      if (isNaN(dueDate.getTime())) {
        errors.push('Due date must be a valid date');
      }
    }

    return errors;
  }
}
