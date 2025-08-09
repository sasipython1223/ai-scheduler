/**
 * Module 5.1 Dependency Test
 * AI Scheduler - Module 5.1: Dependency Detection tests
 */

import { DependencyDetector } from '../models/schedule/dependency.util';
import { LogicLink, LogicType } from '../types/scheduleTypes';

describe('Module 5.1 Dependency Tests', () => {
  describe('DependencyDetector', () => {
    const createLink = (
      from: string,
      to: string,
      type: LogicType = 'FS',
      lag: number = 0
    ): LogicLink => ({
      id: `${from}-${to}`,
      from,
      to,
      type,
      lag,
    });

    it('should detect circular dependencies', () => {
      const existingLinks = [createLink('A', 'B'), createLink('B', 'C')];

      // This would create A -> B -> C -> A cycle
      const newLink = createLink('C', 'A');

      const hasCycle = DependencyDetector.checkCircularDependency(
        existingLinks,
        newLink
      );
      expect(hasCycle).toBe(true);
    });

    it('should allow valid dependencies', () => {
      const existingLinks = [createLink('A', 'B'), createLink('B', 'C')];

      // This creates A -> B -> C -> D (no cycle)
      const newLink = createLink('C', 'D');

      const hasCycle = DependencyDetector.checkCircularDependency(
        existingLinks,
        newLink
      );
      expect(hasCycle).toBe(false);
    });

    it('should detect simple two-node cycle', () => {
      const existingLinks = [createLink('A', 'B')];

      // This would create A -> B -> A cycle
      const newLink = createLink('B', 'A');

      const hasCycle = DependencyDetector.checkCircularDependency(
        existingLinks,
        newLink
      );
      expect(hasCycle).toBe(true);
    });

    it('should allow parallel paths', () => {
      const existingLinks = [
        createLink('A', 'B'),
        createLink('A', 'C'),
        createLink('B', 'D'),
        createLink('C', 'D'),
      ];

      // This is valid: convergent paths from A to D
      const newLink = createLink('D', 'E');

      const hasCycle = DependencyDetector.checkCircularDependency(
        existingLinks,
        newLink
      );
      expect(hasCycle).toBe(false);
    });

    it('should detect complex cycles', () => {
      const existingLinks = [
        createLink('A', 'B'),
        createLink('B', 'C'),
        createLink('C', 'D'),
        createLink('D', 'E'),
      ];

      // This would create A -> B -> C -> D -> E -> B cycle
      const newLink = createLink('E', 'B');

      const hasCycle = DependencyDetector.checkCircularDependency(
        existingLinks,
        newLink
      );
      expect(hasCycle).toBe(true);
    });

    it('should handle self-loops', () => {
      const existingLinks: LogicLink[] = [];

      // Self-referencing task is a cycle
      const newLink = createLink('A', 'A');

      const hasCycle = DependencyDetector.checkCircularDependency(
        existingLinks,
        newLink
      );
      expect(hasCycle).toBe(true);
    });

    it('should get all successors', () => {
      const links = [
        createLink('A', 'B'),
        createLink('A', 'C'),
        createLink('B', 'D'),
        createLink('C', 'D'),
        createLink('D', 'E'),
      ];

      const directSuccessors = DependencyDetector.getSuccessors('A', links);

      // A should have direct successors: B, C
      expect(directSuccessors).toContain('B');
      expect(directSuccessors).toContain('C');
      expect(directSuccessors.length).toBe(2);
    });

    it('should get all predecessors', () => {
      const links = [
        createLink('A', 'D'),
        createLink('B', 'D'),
        createLink('C', 'D'),
        createLink('D', 'E'),
      ];

      const directPredecessors = DependencyDetector.getPredecessors('D', links);

      // D should have direct predecessors: A, B, C
      expect(directPredecessors).toContain('A');
      expect(directPredecessors).toContain('B');
      expect(directPredecessors).toContain('C');
      expect(directPredecessors.length).toBe(3);
    });

    it('should perform topological sort', () => {
      const links = [
        createLink('A', 'B'),
        createLink('A', 'C'),
        createLink('B', 'D'),
        createLink('C', 'D'),
      ];

      const sorted = DependencyDetector.getTopologicalOrder(links);

      // A should come before B, C
      // B, C should come before D
      expect(sorted.indexOf('A')).toBeLessThan(sorted.indexOf('B'));
      expect(sorted.indexOf('A')).toBeLessThan(sorted.indexOf('C'));
      expect(sorted.indexOf('B')).toBeLessThan(sorted.indexOf('D'));
      expect(sorted.indexOf('C')).toBeLessThan(sorted.indexOf('D'));
    });
  });
});
