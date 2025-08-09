import type { Task } from '../types';

export interface ScheduleOptions {
  maxTasksPerDay?: number;
  workingHours?: {
    start: number; // Hour (0-23)
    end: number; // Hour (0-23)
  };
  breakDuration?: number; // Minutes
}

export interface ScheduledTask extends Task {
  scheduledStart: Date;
  scheduledEnd: Date;
  estimatedDuration: number; // Minutes
}

/**
 * Calculate optimal schedule for tasks based on priority and duration
 */
export const calculateSchedule = (
  tasks: Task[],
  options: ScheduleOptions = {}
): ScheduledTask[] => {
  const {
    maxTasksPerDay = 8,
    workingHours = { start: 9, end: 17 },
    breakDuration = 15,
  } = options;

  // Sort tasks by priority and due date
  const sortedTasks = tasks
    .filter((task) => !task.completed)
    .sort((a, b) => {
      // Priority order: high > medium > low
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];

      if (priorityDiff !== 0) return priorityDiff;

      // If same priority, sort by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      return 0;
    });

  const scheduledTasks: ScheduledTask[] = [];
  let currentDate = new Date();
  currentDate.setHours(workingHours.start, 0, 0, 0);

  sortedTasks.forEach((task, index) => {
    // Estimate duration based on task complexity (simple heuristic)
    const estimatedDuration = getTaskDuration(task);

    // Check if task fits in current day
    const currentEndTime = new Date(currentDate);
    currentEndTime.setMinutes(currentEndTime.getMinutes() + estimatedDuration);

    const dayEndTime = new Date(currentDate);
    dayEndTime.setHours(workingHours.end, 0, 0, 0);

    // If task doesn't fit or we've reached max tasks per day, move to next day
    if (
      currentEndTime > dayEndTime ||
      (index > 0 && index % maxTasksPerDay === 0)
    ) {
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(workingHours.start, 0, 0, 0);
    }

    const scheduledStart = new Date(currentDate);
    const scheduledEnd = new Date(currentDate);
    scheduledEnd.setMinutes(scheduledEnd.getMinutes() + estimatedDuration);

    scheduledTasks.push({
      ...task,
      scheduledStart,
      scheduledEnd,
      estimatedDuration,
    });

    // Update current time for next task (add break)
    currentDate = new Date(scheduledEnd);
    currentDate.setMinutes(currentDate.getMinutes() + breakDuration);
  });

  return scheduledTasks;
};

/**
 * Estimate task duration based on description and priority
 */
const getTaskDuration = (task: Task): number => {
  let baseDuration = 60; // 1 hour default

  // Adjust based on priority
  switch (task.priority) {
    case 'high':
      baseDuration = 120; // 2 hours
      break;
    case 'medium':
      baseDuration = 90; // 1.5 hours
      break;
    case 'low':
      baseDuration = 60; // 1 hour
      break;
  }

  // Adjust based on description length (simple heuristic)
  if (task.description && task.description.length > 100) {
    baseDuration *= 1.5;
  }

  return baseDuration;
};
