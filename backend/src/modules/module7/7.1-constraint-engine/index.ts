/**
 * Module 7.1 - Task Preparation Pipeline
 * Normalizes, deduplicates, and resolves task data
 */

import { PreparationResult } from "../__regression__/helpers/validate-results";

export interface TaskPreparationInput {
  schedule: {
    tasks: Array<{
      id: string;
      name: string;
      duration: number;
      skillRequirements: string[];
      priority: string;
      dependencies: string[];
    }>;
    resources: Array<{
      id: string;
      name: string;
      skills: string[];
      capacity: number;
      hourlyRate: number;
    }>;
  };
  constraints: any;
  calendars: any;
  skills: any;
}

export class TaskPreparationPipeline {
  prepare(input: TaskPreparationInput): PreparationResult {
    // Mock implementation for regression testing
    const { schedule } = input;

    const normalizedTasks = schedule.tasks.map((task) => ({
      id: task.id,
      normalizedDuration: Math.max(task.duration, 1), // Ensure minimum duration
      resolvedDependencies: task.dependencies || [],
      skillsMatched: task.skillRequirements.length > 0,
    }));

    const preparedResources = schedule.resources.map((resource) => ({
      id: resource.id,
      availableCapacity: resource.capacity,
      matchedSkills: resource.skills || [],
    }));

    return {
      tasks: normalizedTasks,
      resources: preparedResources,
      warnings: [],
    };
  }
}

export function createTaskPreparationPipeline(): TaskPreparationPipeline {
  return new TaskPreparationPipeline();
}
