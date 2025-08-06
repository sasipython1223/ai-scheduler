/**
 * Dependency Detection Utility Tests
 * AI Scheduler - Module 5.1: Dependency Detection Tests
 */

import {
  DependencyDetector,
  buildDependencyGraph,
  checkCircularDependency,
  getPredecessors,
  getSuccessors,
} from '../../../models/schedule/dependency.util';
import { LogicLink } from '../../../types/scheduleTypes';
import {
  createTestLogicLink,
  mockLogicLinks,
} from '../../fixtures/mockScheduleProject';

describe('Dependency Detection Utility', () => {
  describe('DependencyDetector static methods', () => {
    it('should detect no circular dependencies in valid DAG', () => {
      // Test adding a new link that doesn't create a cycle
      const newLink = createTestLogicLink({ from: 'H', to: 'I' });
      const hasCycle = DependencyDetector.checkCircularDependency(
        mockLogicLinks,
        newLink
      );
      expect(hasCycle).toBe(false);
    });

    it('should detect circular dependencies when adding problematic link', () => {
      // Test adding a link that would create a cycle: A -> B -> C -> A
      const cyclicLink = createTestLogicLink({ from: 'C', to: 'A' });
      const hasCycle = DependencyDetector.checkCircularDependency(
        mockLogicLinks,
        cyclicLink
      );
      expect(hasCycle).toBe(true);
    });

    it('should build dependency graph correctly', () => {
      const graph = DependencyDetector.buildDependencyGraph(mockLogicLinks);

      // Check that graph contains expected relationships
      expect(graph.has('A')).toBe(true);
      expect(graph.has('B')).toBe(true);
      expect(graph.has('C')).toBe(true);

      // Check specific dependencies
      expect(graph.get('A')).toContain('B'); // A -> B
      expect(graph.get('B')).toContain('C'); // B -> C
      expect(graph.get('B')).toContain('D'); // B -> D
    });

    it('should handle empty link array', () => {
      const newLink = createTestLogicLink();
      const hasCycle = DependencyDetector.checkCircularDependency([], newLink);
      expect(hasCycle).toBe(false);

      const graph = DependencyDetector.buildDependencyGraph([]);
      expect(graph.size).toBe(0);
    });

    it('should get predecessors correctly', () => {
      const predecessors = DependencyDetector.getPredecessors(
        'F',
        mockLogicLinks
      );
      expect(predecessors).toContain('C');
      expect(predecessors).toContain('D');
      expect(predecessors).not.toContain('B'); // B is not a direct predecessor of F
    });

    it('should get successors correctly', () => {
      const successors = DependencyDetector.getSuccessors('B', mockLogicLinks);
      expect(successors).toContain('C');
      expect(successors).toContain('D');
      expect(successors).toContain('E');
      expect(successors).not.toContain('F'); // F is not a direct successor of B
    });

    it('should handle tasks with no predecessors', () => {
      const predecessors = DependencyDetector.getPredecessors(
        'A',
        mockLogicLinks
      );
      expect(predecessors).toEqual([]);
    });

    it('should handle tasks with no successors', () => {
      const successors = DependencyDetector.getSuccessors('H', mockLogicLinks);
      expect(successors).toEqual([]);
    });

    it('should get topological order', () => {
      const order = DependencyDetector.getTopologicalOrder(mockLogicLinks);
      expect(order).toBeDefined();
      expect(order.length).toBeGreaterThan(0);

      // Check that dependencies come before dependents
      const aIndex = order.indexOf('A');
      const bIndex = order.indexOf('B');

      if (aIndex !== -1 && bIndex !== -1) {
        expect(aIndex).toBeLessThan(bIndex); // A comes before B
      }
    });

    it('should detect self-dependencies as circular', () => {
      const selfDep = createTestLogicLink({ from: 'A', to: 'A' });
      const hasCycle = DependencyDetector.checkCircularDependency([], selfDep);
      expect(hasCycle).toBe(true);
    });

    it('should handle complex dependency chains', () => {
      const complexChain: LogicLink[] = [
        { id: 'L1', from: 'A', to: 'B', type: 'FS', lag: 0 },
        { id: 'L2', from: 'B', to: 'C', type: 'FS', lag: 0 },
        { id: 'L3', from: 'C', to: 'D', type: 'FS', lag: 0 },
        { id: 'L4', from: 'D', to: 'E', type: 'FS', lag: 0 },
      ];

      // Adding a link that creates no cycle
      const validLink = createTestLogicLink({ from: 'E', to: 'F' });
      const noCycle = DependencyDetector.checkCircularDependency(
        complexChain,
        validLink
      );
      expect(noCycle).toBe(false);

      // Adding a link that creates a cycle
      const cyclicLink = createTestLogicLink({ from: 'E', to: 'A' });
      const hasCycle = DependencyDetector.checkCircularDependency(
        complexChain,
        cyclicLink
      );
      expect(hasCycle).toBe(true);
    });
  });

  describe('Standalone functions', () => {
    it('checkCircularDependency should work as standalone function', () => {
      const newLink = createTestLogicLink({ from: 'H', to: 'I' });
      expect(checkCircularDependency(mockLogicLinks, newLink)).toBe(false);

      const cyclicLink = createTestLogicLink({ from: 'C', to: 'A' });
      expect(checkCircularDependency(mockLogicLinks, cyclicLink)).toBe(true);
    });

    it('buildDependencyGraph should work as standalone function', () => {
      const graph = buildDependencyGraph(mockLogicLinks);
      expect(graph).toBeDefined();
      expect(graph.size).toBeGreaterThan(0);
    });

    it('getPredecessors should work as standalone function', () => {
      const predecessors = getPredecessors('F', mockLogicLinks);
      expect(predecessors).toContain('C');
      expect(predecessors).toContain('D');
    });

    it('getSuccessors should work as standalone function', () => {
      const successors = getSuccessors('B', mockLogicLinks);
      expect(successors).toContain('C');
      expect(successors).toContain('D');
      expect(successors).toContain('E');
    });
  });

  describe('Edge cases and performance', () => {
    it('should handle duplicate links gracefully', () => {
      const duplicateLinks: LogicLink[] = [
        { id: 'L1', from: 'A', to: 'B', type: 'FS', lag: 0 },
        { id: 'L2', from: 'A', to: 'B', type: 'FS', lag: 0 }, // Duplicate
        { id: 'L3', from: 'B', to: 'C', type: 'FS', lag: 0 },
      ];

      const newLink = createTestLogicLink({ from: 'C', to: 'D' });
      const hasCycle = checkCircularDependency(duplicateLinks, newLink);
      expect(hasCycle).toBe(false);
    });

    it('should handle large dependency graphs efficiently', () => {
      // Create a large DAG
      const largeLinks: LogicLink[] = [];
      for (let i = 0; i < 1000; i++) {
        largeLinks.push({
          id: `L${i}`,
          from: `Task${i}`,
          to: `Task${i + 1}`,
          type: 'FS',
          lag: 0,
        });
      }

      const newLink = createTestLogicLink({ from: 'Task1001', to: 'Task1002' });
      const startTime = performance.now();
      const hasCycle = checkCircularDependency(largeLinks, newLink);
      const endTime = performance.now();

      expect(hasCycle).toBe(false);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle tasks with no links', () => {
      const predecessors = getPredecessors('ORPHAN', mockLogicLinks);
      expect(predecessors).toEqual([]);

      const successors = getSuccessors('ORPHAN', mockLogicLinks);
      expect(successors).toEqual([]);
    });

    it('should handle mixed link types', () => {
      const mixedLinks: LogicLink[] = [
        { id: 'L1', from: 'A', to: 'B', type: 'FS', lag: 0 },
        { id: 'L2', from: 'A', to: 'C', type: 'SS', lag: 2 },
        { id: 'L3', from: 'B', to: 'D', type: 'FF', lag: -1 },
        { id: 'L4', from: 'C', to: 'D', type: 'SF', lag: 3 },
      ];

      const newLink = createTestLogicLink({ from: 'D', to: 'E' });
      const hasCycle = checkCircularDependency(mixedLinks, newLink);
      expect(hasCycle).toBe(false);

      const graph = buildDependencyGraph(mixedLinks);
      expect(graph.get('A')).toEqual(['B', 'C']);
      expect(graph.get('B')).toEqual(['D']);
      expect(graph.get('C')).toEqual(['D']);
    });

    it('should detect cycles in complex networks', () => {
      const complexNetwork: LogicLink[] = [
        { id: 'L1', from: 'A', to: 'B', type: 'FS', lag: 0 },
        { id: 'L2', from: 'A', to: 'C', type: 'FS', lag: 0 },
        { id: 'L3', from: 'B', to: 'D', type: 'FS', lag: 0 },
        { id: 'L4', from: 'C', to: 'D', type: 'FS', lag: 0 },
        { id: 'L5', from: 'D', to: 'E', type: 'FS', lag: 0 },
      ];

      // This link would create cycle: B -> D -> E -> B
      const cyclicLink = createTestLogicLink({ from: 'E', to: 'B' });
      const hasCycle = checkCircularDependency(complexNetwork, cyclicLink);
      expect(hasCycle).toBe(true);
    });

    it('should handle empty task IDs', () => {
      const emptyLinks: LogicLink[] = [
        { id: 'L1', from: '', to: 'B', type: 'FS', lag: 0 },
        { id: 'L2', from: 'A', to: '', type: 'FS', lag: 0 },
      ];

      const predecessors = getPredecessors('B', emptyLinks);
      expect(predecessors).toContain(''); // Should handle empty strings

      const successors = getSuccessors('A', emptyLinks);
      expect(successors).toContain('');
    });

    it('should build graph with isolated nodes', () => {
      const isolatedLinks: LogicLink[] = [
        { id: 'L1', from: 'A', to: 'B', type: 'FS', lag: 0 },
        { id: 'L2', from: 'C', to: 'D', type: 'FS', lag: 0 }, // Isolated chain
      ];

      const graph = buildDependencyGraph(isolatedLinks);
      expect(graph.has('A')).toBe(true);
      expect(graph.has('C')).toBe(true);
      expect(graph.get('A')).toEqual(['B']);
      expect(graph.get('C')).toEqual(['D']);
    });
  });
});
