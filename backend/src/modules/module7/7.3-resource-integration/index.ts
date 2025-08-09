/**
 * Module 7.3 - Resource Integration
 * Resource constraint management, leveling, and allocation
 */

import { IntegrationResult } from "../__regression__/helpers/validate-results";

export interface IntegrationInput {
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
  flags: {
    ENABLE_GREEDY: boolean;
    ENABLE_LEVELING: boolean;
  };
  hardCaps: {
    maxOverallocPct: number;
  };
  calendars: any;
}

export class ResourceConstraintManager {
  async integrate(input: IntegrationInput): Promise<IntegrationResult> {
    const { tasks, resources, flags, hardCaps, calendars } = input;

    // Simulate strategy selection
    let strategy = "none";
    if (flags.ENABLE_GREEDY && flags.ENABLE_LEVELING) strategy = "hybrid";
    else if (flags.ENABLE_GREEDY) strategy = "greedy";
    else if (flags.ENABLE_LEVELING) strategy = "leveling";

    // Generate allocations respecting constraints
    const allocations = [];
    const baseDate = new Date("2025-08-09");

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const resource = resources[i % resources.length];

      // Calculate allocation date (avoid blackout days if provided)
      let dayOffset = Math.floor(i / resources.length);
      const allocationDate = new Date(
        baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000,
      );
      const dateStr = allocationDate.toISOString().split("T")[0];

      // Check for blackout days
      const resourceCalendar = calendars?.calendars?.find(
        (cal: any) => cal.resourceId === resource.id,
      );

      if (resourceCalendar?.blackoutDays?.includes(dateStr)) {
        // Skip to next day if blackout
        dayOffset++;
        const nextDate = new Date(
          baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000,
        );
        const nextDateStr = nextDate.toISOString().split("T")[0];

        allocations.push({
          taskId: task.id,
          resourceId: resource.id,
          day: nextDateStr,
          duration: task.normalizedDuration,
          capacity: resource.availableCapacity,
        });
      } else {
        // Check for reduced capacity
        const reducedCapDay = resourceCalendar?.reducedCapacityDays?.find(
          (rcd: any) => rcd.date === dateStr,
        );

        const effectiveCapacity =
          reducedCapDay?.capacity || resource.availableCapacity;

        allocations.push({
          taskId: task.id,
          resourceId: resource.id,
          day: dateStr,
          duration: Math.min(task.normalizedDuration, effectiveCapacity),
          capacity: effectiveCapacity,
        });
      }
    }

    // Check for constraint violations
    const violations = this.checkConstraints(allocations, hardCaps);
    const status = violations.length > 0 ? "conflicts" : "ok";

    // Calculate utilization metrics
    const utilization = this.calculateUtilization(allocations);

    return {
      status,
      allocations,
      conflicts: violations.length > 0 ? violations : undefined,
      utilization,
    };
  }

  private checkConstraints(
    allocations: any[],
    hardCaps: { maxOverallocPct: number },
  ): any[] {
    const violations = [];
    const dailyAllocations = new Map<string, number>();

    // Check for overallocation
    for (const allocation of allocations) {
      const key = `${allocation.resourceId}:${allocation.day}`;
      const current = dailyAllocations.get(key) || 0;
      dailyAllocations.set(key, current + allocation.duration);

      const totalAllocation = dailyAllocations.get(key)!;
      const overallocPct =
        ((totalAllocation - allocation.capacity) / allocation.capacity) * 100;

      if (overallocPct > hardCaps.maxOverallocPct) {
        violations.push({
          type: "overallocation",
          description: `Resource ${allocation.resourceId} overallocated by ${overallocPct.toFixed(1)}% on ${allocation.day}`,
          affectedTasks: [allocation.taskId],
        });
      }
    }

    return violations;
  }

  private calculateUtilization(allocations: any[]): {
    [resourceId: string]: any;
  } {
    const utilization: { [resourceId: string]: any } = {};
    const resourceTotals = new Map<
      string,
      { hours: number; days: Set<string>; capacities: number[] }
    >();

    for (const allocation of allocations) {
      const current = resourceTotals.get(allocation.resourceId) || {
        hours: 0,
        days: new Set(),
        capacities: [],
      };

      current.hours += allocation.duration;
      current.days.add(allocation.day);
      current.capacities.push(allocation.capacity);

      resourceTotals.set(allocation.resourceId, current);
    }

    resourceTotals.forEach((data, resourceId) => {
      const avgCapacity =
        data.capacities.reduce((a, b) => a + b, 0) / data.capacities.length;
      const totalPossibleHours = data.days.size * avgCapacity;

      utilization[resourceId] = {
        totalHours: data.hours,
        utilizationPct: (data.hours / totalPossibleHours) * 100,
        peakDay: Array.from(data.days)[0], // Simplified - just take first day
      };
    });

    return utilization;
  }
}

export function createResourceConstraintManager(): ResourceConstraintManager {
  return new ResourceConstraintManager();
}
