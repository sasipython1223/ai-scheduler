/**
 * Dependency Detection Utilities
 * AI Scheduler - Module 5.1: Dependency Analysis
 *
 * Circular dependency detection and graph analysis utilities
 */

import { LogicLink } from '../../types/scheduleTypes.js';

/**
 * Dependency validation utilities
 */
export class DependencyDetector {
  /**
   * Check if adding a new link creates a circular dependency
   */
  public static checkCircularDependency(
    existingLinks: LogicLink[],
    newLink: LogicLink
  ): boolean {
    // Build adjacency list including the new link
    const graph = new Map<string, string[]>();

    [...existingLinks, newLink].forEach((link) => {
      if (!graph.has(link.from)) {
        graph.set(link.from, []);
      }
      graph.get(link.from)!.push(link.to);
    });

    return this.hasCycle(graph);
  }

  /**
   * Detect cycles in dependency graph using DFS
   */
  private static hasCycle(graph: Map<string, string[]>): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string): boolean => {
      if (recursionStack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      recursionStack.add(node);

      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) return true;
      }

      recursionStack.delete(node);
      return false;
    };

    // Check all nodes for cycles
    const nodeList = Array.from(graph.keys());
    for (const node of nodeList) {
      if (dfs(node)) return true;
    }

    return false;
  }

  /**
   * Get all predecessors of a task
   */
  public static getPredecessors(taskId: string, links: LogicLink[]): string[] {
    return links.filter((link) => link.to === taskId).map((link) => link.from);
  }

  /**
   * Get all successors of a task
   */
  public static getSuccessors(taskId: string, links: LogicLink[]): string[] {
    return links.filter((link) => link.from === taskId).map((link) => link.to);
  }

  /**
   * Build dependency graph for topological sorting
   */
  public static buildDependencyGraph(
    links: LogicLink[]
  ): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    links.forEach((link) => {
      if (!graph.has(link.from)) {
        graph.set(link.from, []);
      }
      graph.get(link.from)!.push(link.to);
    });

    return graph;
  }

  /**
   * Get topological order of tasks based on dependencies
   */
  public static getTopologicalOrder(links: LogicLink[]): string[] {
    const graph = this.buildDependencyGraph(links);
    const visited = new Set<string>();
    const result: string[] = [];

    const dfs = (node: string): void => {
      if (visited.has(node)) return;
      visited.add(node);

      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        dfs(neighbor);
      }

      result.unshift(node); // Add to beginning for correct order
    };

    // Process all nodes
    const nodeList = Array.from(graph.keys());
    for (const node of nodeList) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return result;
  }
}

/**
 * Utility functions for dependency checking
 */
export function checkCircularDependency(
  existingLinks: LogicLink[],
  newLink: LogicLink
): boolean {
  return DependencyDetector.checkCircularDependency(existingLinks, newLink);
}

export function getPredecessors(taskId: string, links: LogicLink[]): string[] {
  return DependencyDetector.getPredecessors(taskId, links);
}

export function getSuccessors(taskId: string, links: LogicLink[]): string[] {
  return DependencyDetector.getSuccessors(taskId, links);
}

export function buildDependencyGraph(
  links: LogicLink[]
): Map<string, string[]> {
  return DependencyDetector.buildDependencyGraph(links);
}
