import { QueryClient } from '@tanstack/react-query';

// Define error type
interface ApiError {
  status?: number;
  message?: string;
}

// Define filter types
interface TaskFilters {
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  search?: string;
}

interface UserFilters {
  active?: boolean;
  role?: string;
}

interface ScheduleFilters {
  date?: string;
  userId?: string;
}

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error: unknown) => {
        const apiError = error as ApiError;
        // Don't retry on 4xx errors (client errors)
        if (
          apiError?.status &&
          apiError.status >= 400 &&
          apiError.status < 500
        ) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: false, // Disable refetch on window focus
      refetchOnMount: true, // Refetch when component mounts
      refetchOnReconnect: true, // Refetch when connection is restored
    },
    mutations: {
      retry: (failureCount, error: unknown) => {
        const apiError = error as ApiError;
        // Don't retry mutations on client errors
        if (
          apiError?.status &&
          apiError.status >= 400 &&
          apiError.status < 500
        ) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Tasks
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filters: TaskFilters) =>
      [...queryKeys.tasks.lists(), { filters }] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
  },

  // Users (for future use)
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: UserFilters) =>
      [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // Schedule (for future use)
  schedule: {
    all: ['schedule'] as const,
    lists: () => [...queryKeys.schedule.all, 'list'] as const,
    list: (filters: ScheduleFilters) =>
      [...queryKeys.schedule.lists(), { filters }] as const,
    details: () => [...queryKeys.schedule.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.schedule.details(), id] as const,
  },
};

// Helper function to create error handler
export const createErrorHandler = (errorMessage = 'An error occurred') => {
  return (error: unknown) => {
    console.error(errorMessage, error);

    const apiError = error as ApiError;

    // You can integrate with error tracking services here
    // Example: Sentry, LogRocket, etc.

    // Return a user-friendly error message
    if (apiError?.message) {
      return apiError.message;
    }

    if (apiError?.status) {
      switch (apiError.status) {
        case 400:
          return 'Bad request. Please check your input.';
        case 401:
          return 'Unauthorized. Please log in again.';
        case 403:
          return 'Forbidden. You do not have permission.';
        case 404:
          return 'Resource not found.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return errorMessage;
      }
    }

    return errorMessage;
  };
};

// Helper function to invalidate related queries
export const invalidateQueries = {
  tasks: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
  task: (id: string) =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.tasks.detail(id),
    }),
  users: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  schedule: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.schedule.all }),
};

export default queryClient;
