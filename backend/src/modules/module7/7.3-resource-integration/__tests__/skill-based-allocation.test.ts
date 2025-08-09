/**
 * Module 7.3 - Skill-Based Allocation Tests
 */

import { describe, expect, it } from 'vitest';
import type { Resource, Task } from '../index';
import {
  analyzeSkillGap,
  calculateSkillCoverage,
} from '../skill-analysis-helpers';
import {
  calculateOverqualificationPenalty,
  calculateSkillMatch,
  canHandleTask,
  findMissingSkills,
  getBestSkillMatches,
} from '../skill-based-allocation';

const mockResources: Resource[] = [
  {
    id: 'expert-dev',
    skills: [
      { id: 'javascript', level: 5 },
      { id: 'react', level: 4 },
      { id: 'node', level: 3 },
    ],
    capacity: 8,
  },
  {
    id: 'junior-dev',
    skills: [
      { id: 'javascript', level: 2 },
      { id: 'html', level: 3 },
    ],
    capacity: 8,
  },
  {
    id: 'backend-dev',
    skills: [
      { id: 'python', level: 4 },
      { id: 'django', level: 3 },
      { id: 'sql', level: 5 },
    ],
    capacity: 8,
  },
];

const mockTasks: Task[] = [
  {
    id: 'simple-js-task',
    duration: 4,
    day: '2024-01-15',
    requirements: [{ skillId: 'javascript', minLevel: 2 }],
  },
  {
    id: 'complex-frontend',
    duration: 8,
    day: '2024-01-15',
    requirements: [
      { skillId: 'javascript', minLevel: 4 },
      { skillId: 'react', minLevel: 3 },
    ],
  },
  {
    id: 'backend-task',
    duration: 6,
    day: '2024-01-15',
    requirements: [
      { skillId: 'python', minLevel: 3 },
      { skillId: 'sql', minLevel: 2 },
    ],
  },
];

describe('Skill-Based Allocation', () => {
  describe('findMissingSkills', () => {
    it('should identify missing skills', () => {
      const missing = findMissingSkills(
        mockResources[1].skills, // junior-dev
        mockTasks[1].requirements // complex-frontend
      );

      expect(missing).toHaveLength(1);
      expect(missing[0].skillId).toBe('react');
    });

    it('should return empty for fully qualified resource', () => {
      const missing = findMissingSkills(
        mockResources[0].skills, // expert-dev
        mockTasks[1].requirements // complex-frontend
      );

      expect(missing).toHaveLength(0);
    });
  });

  describe('calculateOverqualificationPenalty', () => {
    it('should penalize overqualified resources', () => {
      const penalty = calculateOverqualificationPenalty(
        mockResources[0].skills, // expert-dev (JS level 5)
        mockTasks[0].requirements // simple task (JS level 2)
      );

      expect(penalty).toBeGreaterThan(0);
    });

    it('should not penalize appropriately qualified resources', () => {
      const penalty = calculateOverqualificationPenalty(
        mockResources[1].skills, // junior-dev (JS level 2)
        mockTasks[0].requirements // simple task (JS level 2)
      );

      expect(penalty).toBe(6); // Only penalty for unused HTML skill
    });
  });

  describe('calculateSkillMatch', () => {
    it('should calculate comprehensive skill match', () => {
      const match = calculateSkillMatch(mockResources[0], mockTasks[1]);

      expect(match.resourceId).toBe('expert-dev');
      expect(match.taskId).toBe('complex-frontend');
      expect(match.hasAllRequiredSkills).toBe(true);
      expect(match.skillScore).toBeGreaterThan(0);
      expect(match.totalScore).toBeGreaterThan(0);
    });

    it('should detect missing skills', () => {
      const match = calculateSkillMatch(mockResources[1], mockTasks[1]);

      expect(match.hasAllRequiredSkills).toBe(false);
      expect(match.missingSkills).toHaveLength(1);
    });
  });

  describe('getBestSkillMatches', () => {
    it('should rank resources by skill match', () => {
      const matches = getBestSkillMatches(mockResources, mockTasks[0], 3);

      expect(matches).toHaveLength(3);
      expect(matches[0].totalScore).toBeGreaterThanOrEqual(
        matches[1].totalScore
      );
      expect(matches[1].totalScore).toBeGreaterThanOrEqual(
        matches[2].totalScore
      );
    });

    it('should limit results', () => {
      const matches = getBestSkillMatches(mockResources, mockTasks[0], 2);
      expect(matches).toHaveLength(2);
    });

    it('should be deterministic with tie-breaking', () => {
      const matches1 = getBestSkillMatches(mockResources, mockTasks[0], 3);
      const matches2 = getBestSkillMatches(mockResources, mockTasks[0], 3);

      expect(matches1.map((m) => m.resourceId)).toEqual(
        matches2.map((m) => m.resourceId)
      );
    });
  });

  describe('canHandleTask', () => {
    it('should correctly identify capable resources', () => {
      expect(canHandleTask(mockResources[0], mockTasks[1])).toBe(true); // expert can handle complex
      expect(canHandleTask(mockResources[1], mockTasks[1])).toBe(false); // junior cannot
      expect(canHandleTask(mockResources[2], mockTasks[2])).toBe(true); // backend can handle backend
    });
  });

  describe('calculateSkillCoverage', () => {
    it('should calculate coverage percentage', () => {
      const coverage1 = calculateSkillCoverage(mockResources[0], mockTasks[1]);
      expect(coverage1).toBe(100); // Full coverage

      const coverage2 = calculateSkillCoverage(mockResources[1], mockTasks[1]);
      expect(coverage2).toBe(50); // 1 of 2 skills
    });

    it('should handle tasks with no requirements', () => {
      const taskNoReqs: Task = {
        id: 'any-task',
        duration: 1,
        day: '2024-01-15',
        requirements: [],
      };

      expect(calculateSkillCoverage(mockResources[0], taskNoReqs)).toBe(100);
    });
  });

  describe('analyzeSkillGap', () => {
    it('should provide detailed gap analysis', () => {
      const analysis = analyzeSkillGap(mockResources[1], mockTasks[1]);

      expect(analysis.coverage).toBe(50);
      expect(analysis.missingSkills).toHaveLength(1);
      expect(analysis.underqualifiedSkills).toHaveLength(1); // JS level too low
      expect(analysis.overqualifiedSkills).toHaveLength(0);
    });

    it('should identify overqualified skills', () => {
      const analysis = analyzeSkillGap(mockResources[0], mockTasks[0]);

      expect(analysis.overqualifiedSkills.length).toBeGreaterThan(0);
    });
  });
});
