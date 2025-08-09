import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query/queryClient';
import type { Task } from '../store/useTaskStore';

// Mock API function for fetching tasks
const mockApiDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const fetchTasks = async (): Promise<Task[]> => {
  await mockApiDelay(1000); // Simulate network delay
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
};

export const useFetchTasks = () => {
  return useQuery({
    queryKey: queryKeys.tasks.list({}),
    queryFn: fetchTasks,
  });
};
