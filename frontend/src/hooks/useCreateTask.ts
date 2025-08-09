import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../query/queryClient';
import type { Task } from '../store/useTaskStore';

// Mock API function for creating tasks
const mockApiDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const createTask = async (
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Task> => {
  await mockApiDelay(500);
  return {
    ...task,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.all,
      });
    },
  });
};
