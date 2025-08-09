/**
 * STRICT RULES for Module 7.3:
 * - ≤220 LOC per file. Split helpers instead of growing files.
 * - No `any`. Keep types narrow and explicit.
 * - No throwing for business errors; return {status, violations}.
 * - Pure functions in strategies and allocation logic.
 * - Deterministic outputs (stable sort/tie-break).
 * - Keep algorithmic complexity reasonable (target O(T log R)).
 */

/**
 * Module 7.3 - Skill Analysis Helpers
 *
 * Helper functions for detailed skill gap analysis and coverage calculations.
 */

import type { Requirement, Resource, Task } from './index';

/**
 * Calculate skill coverage percentage
 * @param resource Resource to evaluate
 * @param task Task requiring skills
 * @returns Percentage of required skills covered (0-100)
 */
export function calculateSkillCoverage(resource: Resource, task: Task): number {
  if (task.requirements.length === 0) return 100;

  const coveredSkills = task.requirements.filter((req: Requirement) =>
    resource.skills.some(
      (skill) => skill.id === req.skillId && skill.level >= req.minLevel
    )
  );

  return (coveredSkills.length / task.requirements.length) * 100;
}

/**
 * Get skill gap analysis for resource-task pair
 * @param resource Resource to analyze
 * @param task Task requiring skills
 * @returns Detailed gap analysis
 */
export function analyzeSkillGap(
  resource: Resource,
  task: Task
): {
  coverage: number;
  missingSkills: Requirement[];
  underqualifiedSkills: Array<{
    requirement: Requirement;
    resourceSkill?: { id: string; level: number };
    gap: number;
  }>;
  overqualifiedSkills: Array<{
    requirement: Requirement;
    resourceSkill: { id: string; level: number };
    excessLevel: number;
  }>;
} {
  const coverage = calculateSkillCoverage(resource, task);
  const missingSkills = task.requirements.filter(
    (req: Requirement) =>
      !resource.skills.some(
        (skill) => skill.id === req.skillId && skill.level >= req.minLevel
      )
  );

  const underqualifiedSkills: Array<{
    requirement: Requirement;
    resourceSkill?: { id: string; level: number };
    gap: number;
  }> = [];
  const overqualifiedSkills: Array<{
    requirement: Requirement;
    resourceSkill: { id: string; level: number };
    excessLevel: number;
  }> = [];

  for (const requirement of task.requirements) {
    const resourceSkill = resource.skills.find(
      (s) => s.id === requirement.skillId
    );

    if (resourceSkill) {
      if (resourceSkill.level < requirement.minLevel) {
        underqualifiedSkills.push({
          requirement,
          resourceSkill,
          gap: requirement.minLevel - resourceSkill.level,
        });
      } else if (resourceSkill.level > requirement.minLevel) {
        overqualifiedSkills.push({
          requirement,
          resourceSkill,
          excessLevel: resourceSkill.level - requirement.minLevel,
        });
      }
    } else {
      // Skill completely missing
      underqualifiedSkills.push({
        requirement,
        resourceSkill: undefined,
        gap: requirement.minLevel,
      });
    }
  }

  return {
    coverage,
    missingSkills,
    underqualifiedSkills,
    overqualifiedSkills,
  };
}
