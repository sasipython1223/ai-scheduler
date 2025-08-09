/**
 * Module 7.1: Task Preparation Pipeline Mock Implementation
 *
 * This is a mock implementation for regression testing.
 * Simulates task preparation with basic validation and normalization.
 */

export interface Task {
  id: string;
  name: string;
  duration: number;
  skillRequirements: string[];
  priority: "critical" | "high" | "medium" | "low";
  dependencies: string[];
}

export interface Resource {
  id: string;
  name: string;
  skills: string[];
  capacity: number;
  hourlyRate: number;
}

export interface Schedule {
  tasks: Task[];
  resources: Resource[];
}

export interface Constraints {
  timeframe: { start: string; end: string };
  overallocationCap: number;
  skillRequirements: boolean;
}

export interface PreparedData {
  tasks: Array<{
    id: string;
    normalizedDuration: number;
    resolvedDependencies: string[];
    skillsMatched: boolean;
  }>;
  resources: Array<{
    id: string;
    availableCapacity: number;
    matchedSkills: string[];
  }>;
  constraints: Constraints;
  metadata: {
    preparationTime: number;
    normalizedTasks: number;
    validatedResources: number;
  };
}

export interface TaskPreparationPipeline {
  prepare(input: {
    schedule: Schedule;
    constraints: Constraints;
    calendars: any;
    skills?: any;
  }): PreparedData;
}

export function createTaskPreparationPipeline(): TaskPreparationPipeline {
  return {
    prepare({ schedule, constraints, calendars, skills }): PreparedData {
      const startTime = Date.now();

      // Basic task validation and normalization
      const preparedTasks = schedule.tasks.map((task) => {
        const priorityScore =
          task.priority === "critical"
            ? 10
            : task.priority === "high"
              ? 8
              : task.priority === "medium"
                ? 5
                : 3;

        return {
          id: task.id,
          normalizedDuration: Math.max(1, task.duration),
          resolvedDependencies: task.dependencies || [],
          skillsMatched:
            task.skillRequirements?.every((skill) =>
              schedule.resources.some((resource) =>
                resource.skills?.includes(skill),
              ),
            ) || true,
        };
      });

      // Basic resource validation
      const preparedResources = schedule.resources.map((resource) => ({
        id: resource.id,
        availableCapacity: Math.max(1, resource.capacity),
        matchedSkills: resource.skills || [],
      }));

      const preparationTime = Date.now() - startTime;

      return {
        tasks: preparedTasks,
        resources: preparedResources,
        constraints,
        metadata: {
          preparationTime,
          normalizedTasks: preparedTasks.length,
          validatedResources: preparedResources.length,
        },
      };
    },
  };
}
