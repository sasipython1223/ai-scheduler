/**
 * Module 5.3: Graph Utilities
 *
 * Generic graph algorithms for dependency analysis and topological sorting
 */

import { LogicLink, ScheduledTask } from '../types/schedule';
import { EnhancedScheduledTask } from '../types/schedule/backward-pass.types';

export class GraphUtils {
  /**
   * Get topological order of tasks for processing
   */
  public static getTopologicalOrder(
    tasks: EnhancedScheduledTask[],
    successorMap: Map<string, LogicLink[]>,
    skipValidation: boolean = false
  ): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const visit = (taskId: string): void => {
      if (visiting.has(taskId)) {
        if (!skipValidation) {
          throw new Error('Circular dependency detected');
        }
        return; // Skip circular dependencies when validation is disabled
      }

      if (visited.has(taskId)) {
        return;
      }

      visiting.add(taskId);

      const successors = successorMap.get(taskId) || [];
      for (const link of successors) {
        visit(link.to);
      }

      visiting.delete(taskId);
      visited.add(taskId);
      result.push(taskId);
    };

    for (const task of tasks) {
      if (!visited.has(task.id)) {
        visit(task.id);
      }
    }

    return result;
  }

  /**
   * Check for circular dependencies in the project network
   */
  public static hasCircularDependencies(
    tasks: ScheduledTask[],
    links: LogicLink[]
  ): boolean {
    try {
      const successorMap = GraphUtils.buildSuccessorMap(links);
      GraphUtils.getTopologicalOrder(
        tasks as EnhancedScheduledTask[],
        successorMap
      );
      return false;
    } catch (error) {
      return (
        error instanceof Error && error.message.includes('Circular dependency')
      );
    }
  }

  /**
   * Build successor map for graph processing
   */
  public static buildSuccessorMap(
    links: LogicLink[]
  ): Map<string, LogicLink[]> {
    const successorMap = new Map<string, LogicLink[]>();

    for (const link of links) {
      if (!successorMap.has(link.from)) {
        successorMap.set(link.from, []);
      }
      successorMap.get(link.from)!.push(link);
    }

    return successorMap;
  }
}
