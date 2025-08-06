import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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

interface TaskState {
  // State
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filter: 'all' | 'pending' | 'completed';

  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: 'all' | 'pending' | 'completed') => void;
  clearCompleted: () => void;

  // Computed values
  filteredTasks: () => Task[];
  taskStats: () => {
    total: number;
    completed: number;
    pending: number;
    highPriority: number;
  };
}

const useTaskStore = create<TaskState>()(
  devtools(
    (set, get) => ({
      // Initial state
      tasks: [],
      isLoading: false,
      error: null,
      filter: 'all',

      // Actions
      setTasks: (tasks) => set({ tasks }, false, 'setTasks'),

      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set(
          (state) => ({ tasks: [...state.tasks, newTask] }),
          false,
          'addTask'
        );
      },

      updateTask: (id, updates) =>
        set(
          (state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? { ...task, ...updates, updatedAt: new Date() }
                : task
            ),
          }),
          false,
          'updateTask'
        ),

      deleteTask: (id) =>
        set(
          (state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
          }),
          false,
          'deleteTask'
        ),

      toggleTask: (id) =>
        set(
          (state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? { ...task, completed: !task.completed, updatedAt: new Date() }
                : task
            ),
          }),
          false,
          'toggleTask'
        ),

      setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),

      setError: (error) => set({ error }, false, 'setError'),

      setFilter: (filter) => set({ filter }, false, 'setFilter'),

      clearCompleted: () =>
        set(
          (state) => ({
            tasks: state.tasks.filter((task) => !task.completed),
          }),
          false,
          'clearCompleted'
        ),

      // Computed values
      filteredTasks: () => {
        const { tasks, filter } = get();
        switch (filter) {
          case 'completed':
            return tasks.filter((task) => task.completed);
          case 'pending':
            return tasks.filter((task) => !task.completed);
          default:
            return tasks;
        }
      },

      taskStats: () => {
        const { tasks } = get();
        return {
          total: tasks.length,
          completed: tasks.filter((task) => task.completed).length,
          pending: tasks.filter((task) => !task.completed).length,
          highPriority: tasks.filter((task) => task.priority === 'high').length,
        };
      },
    }),
    {
      name: 'task-store', // Store name for devtools
    }
  )
);

export default useTaskStore;
