import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys, createErrorHandler } from '../query/queryClient';
import useTaskStore, { type Task } from '../store/useTaskStore';
import { useEffect } from 'react';

// Mock API functions (replace with real API calls later)
const mockApiDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const mockApi = {
  async getTasks(): Promise<Task[]> {
    await mockApiDelay(1000); // Simulate network delay
    // Return some mock data for now
    return [
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
  },

  async createTask(
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Task> {
    await mockApiDelay(500);
    return {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    await mockApiDelay(500);
    // In a real app, this would return the updated task from the server
    const currentTasks = useTaskStore.getState().tasks;
    const existingTask = currentTasks.find((t) => t.id === id);
    if (!existingTask) {
      throw new Error('Task not found');
    }
    return {
      ...existingTask,
      ...updates,
      updatedAt: new Date(),
    };
  },

  async deleteTask(_id: string): Promise<void> {
    await mockApiDelay(500);
    // In a real app, this would make a DELETE request
  },
};

// Custom hooks for task operations
export const useTasks = () => {
  const { setTasks, setLoading, setError } = useTaskStore();

  const query = useQuery({
    queryKey: queryKeys.tasks.list({}),
    queryFn: mockApi.getTasks,
  });

  // Handle side effects when data changes
  useEffect(() => {
    if (query.data) {
      setTasks(query.data);
      setError(null);
    }
    if (query.error) {
      setError(createErrorHandler('Failed to fetch tasks')(query.error));
    }
    setLoading(query.isLoading);
  }, [
    query.data,
    query.error,
    query.isLoading,
    setTasks,
    setError,
    setLoading,
  ]);

  return query;
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { addTask } = useTaskStore();

  return useMutation({
    mutationFn: mockApi.createTask,
    onSuccess: (newTask) => {
      // Optimistically update the local store
      addTask(newTask);
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
    onError: (error) => {
      console.error(createErrorHandler('Failed to create task')(error));
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { updateTask } = useTaskStore();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      mockApi.updateTask(id, updates),
    onSuccess: (updatedTask) => {
      // Optimistically update the local store
      updateTask(updatedTask.id, updatedTask);
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
    onError: (error) => {
      console.error(createErrorHandler('Failed to update task')(error));
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { deleteTask } = useTaskStore();

  return useMutation({
    mutationFn: mockApi.deleteTask,
    onSuccess: (_, deletedTaskId) => {
      // Optimistically update the local store
      deleteTask(deletedTaskId);
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
    onError: (error) => {
      console.error(createErrorHandler('Failed to delete task')(error));
    },
  });
};

// Hook for task statistics
export const useTaskStats = () => {
  const taskStats = useTaskStore((state) => state.taskStats());
  return taskStats;
};
