/**
 * Task Routes - Express router for task management endpoints
 * Uses TaskService for business logic separation
 */

import express, { Request, Response } from 'express';
import {
  TaskService,
  CreateTaskBody,
  UpdateTaskBody,
} from '../services/task.service';

const router = express.Router();

/**
 * GET /tasks/stats - Get task statistics
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = TaskService.getTaskStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting task stats:', error);
    res.status(500).json({ error: 'Failed to get task statistics' });
  }
});

/**
 * GET /tasks - Get all tasks with optional filtering
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { priority, completed, search } = req.query;

    const filters = {
      priority: priority as string,
      completed:
        completed === 'true' ? true : completed === 'false' ? false : undefined,
      search: search as string,
    };

    const tasks = TaskService.getAllTasks(filters);
    res.json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

/**
 * GET /tasks/:id - Get a specific task by ID
 */
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const task = TaskService.getTaskById(id);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({ error: 'Failed to get task' });
  }
});

/**
 * POST /tasks - Create a new task
 */
router.post('/', (req: Request, res: Response): void => {
  try {
    const taskData: CreateTaskBody = req.body;

    // Validate input
    const errors = TaskService.validateTaskData(taskData);
    if (errors.length > 0) {
      res.status(400).json({ error: 'Validation failed', details: errors });
      return;
    }

    const newTask = TaskService.createTask(taskData);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

/**
 * PUT /tasks/:id - Update an existing task
 */
router.put('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const updates: UpdateTaskBody = req.body;

    // Validate input
    const errors = TaskService.validateTaskData(updates);
    if (errors.length > 0) {
      res.status(400).json({ error: 'Validation failed', details: errors });
      return;
    }

    const updatedTask = TaskService.updateTask(id, updates);

    if (!updatedTask) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

/**
 * DELETE /tasks/:id - Delete a task
 */
router.delete('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const deleted = TaskService.deleteTask(id);

    if (!deleted) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
