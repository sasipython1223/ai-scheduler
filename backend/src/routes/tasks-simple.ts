import { randomUUID } from 'crypto';
import express, { Request, Response } from 'express';

const router = express.Router();

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

let tasks: Task[] = [
  {
    id: '1',
    title: 'Setup project structure',
    description: 'Create folders and basic configuration',
    completed: true,
    priority: 'high',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'Install dependencies',
    description: 'Install Zustand and TanStack Query',
    completed: true,
    priority: 'medium',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    title: 'Create UI components',
    description: 'Build task list and form components',
    completed: false,
    priority: 'high',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
];

// GET /api/tasks/stats - Get task statistics (must be before /:id route)
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      pending: tasks.filter((t) => !t.completed).length,
      byPriority: {
        low: tasks.filter((t) => t.priority === 'low').length,
        medium: tasks.filter((t) => t.priority === 'medium').length,
        high: tasks.filter((t) => t.priority === 'high').length,
      },
    };

    res.json(stats);
  } catch {
    res.status(500).json({ error: 'Failed to get task statistics' });
  }
});

// GET /api/tasks - Get all tasks
router.get('/', (req: Request, res: Response) => {
  try {
    const { completed, priority } = req.query;

    let filteredTasks = tasks;

    if (completed !== undefined) {
      const isCompleted = completed === 'true';
      filteredTasks = filteredTasks.filter(
        (task) => task.completed === isCompleted
      );
    }

    if (priority && typeof priority === 'string') {
      filteredTasks = filteredTasks.filter(
        (task) => task.priority === priority
      );
    }

    res.json(filteredTasks);
  } catch {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = tasks.find((t) => t.id === id);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(task);
  } catch {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST /api/tasks - Create new task
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, description, priority = 'medium', dueDate } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const newTask: Task = {
      id: randomUUID(),
      title: title.trim(),
      completed: false,
      priority,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (description?.trim()) {
      newTask.description = description.trim();
    }

    if (dueDate) {
      newTask.dueDate = new Date(dueDate);
    }

    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

export default router;
