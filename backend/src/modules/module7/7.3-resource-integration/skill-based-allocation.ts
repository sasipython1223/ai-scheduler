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
 * Module 7.3 - Skill-Based Allocation
 *
 * Pure functions for skill matching and allocation scoring.
 * Core logic for matching tasks to resources based on skills.
 */

import type { Requirement, Resource, Skill, Task } from './index';

/**
 * Calculate overall skill score for resource against task requirements
 * @param resourceSkills Skills available to resource
 * @param requirements Requirements needed by task
 * @returns Overall skill match score (0-100)
 */
function calculateOverallSkillScore(
  resourceSkills: Skill[],
  requirements: Requirement[]
): number {
  if (requirements.length === 0) return 100;

  let totalScore = 0;
  let totalWeight = 0;

  for (const req of requirements) {
    const skill = resourceSkills.find((s) => s.id === req.skillId);
    const weight = req.weight || 1;

    let score = 0;
    if (skill && skill.level >= req.minLevel) {
      // Score based on how much the skill level exceeds minimum
      const excessLevel = skill.level - req.minLevel;
      const maxExcess = 5; // Assume max useful excess is 5 levels
      score = Math.max(50, 100 - (excessLevel / maxExcess) * 30);
    }

    totalScore += score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

/**
 * Skill match result for a resource-task pair
 */
export interface SkillMatch {
  resourceId: string;
  taskId: string;
  skillScore: number;
  hasAllRequiredSkills: boolean;
  missingSkills: Requirement[];
  overqualificationPenalty: number;
  totalScore: number;
}

/**
 * Calculate skill match between resource and task
 * @param resource Resource to evaluate
 * @param task Task requiring skills
 * @returns Detailed skill match analysis
 */
export function calculateSkillMatch(
  resource: Resource,
  task: Task
): SkillMatch {
  const skillScore = calculateOverallSkillScore(
    resource.skills,
    task.requirements
  );
  const missingSkills = findMissingSkills(resource.skills, task.requirements);
  const hasAllRequiredSkills = missingSkills.length === 0;

  // Penalize overqualification to avoid wasting high-skill resources
  const overqualificationPenalty = calculateOverqualificationPenalty(
    resource.skills,
    task.requirements
  );

  const totalScore = Math.max(0, skillScore - overqualificationPenalty);

  return {
    resourceId: resource.id,
    taskId: task.id,
    skillScore,
    hasAllRequiredSkills,
    missingSkills,
    overqualificationPenalty,
    totalScore,
  };
}

/**
 * Find requirements not satisfied by resource skills
 * @param resourceSkills Skills available to resource
 * @param requirements Requirements needed by task
 * @returns Array of unsatisfied requirements
 */
export function findMissingSkills(
  resourceSkills: Skill[],
  requirements: Requirement[]
): Requirement[] {
  return requirements.filter(
    (req) =>
      !resourceSkills.some(
        (skill) => skill.id === req.skillId && skill.level >= req.minLevel
      )
  );
}

/**
 * Calculate overqualification penalty for resource assignment
 * @param resourceSkills Skills available to resource
 * @param requirements Requirements needed by task
 * @returns Penalty score (higher = more overqualified)
 */
export function calculateOverqualificationPenalty(
  resourceSkills: Skill[],
  requirements: Requirement[]
): number {
  let totalOverqualification = 0;

  for (const resourceSkill of resourceSkills) {
    const requirement = requirements.find(
      (req) => req.skillId === resourceSkill.id
    );

    if (requirement) {
      // Penalize skill levels significantly higher than required
      const levelDifference = resourceSkill.level - requirement.minLevel;
      if (levelDifference > 1) {
        totalOverqualification += levelDifference * 10; // 10 points per excess level
      }
    } else {
      // Small penalty for unused skills
      totalOverqualification += resourceSkill.level * 2;
    }
  }

  return totalOverqualification;
}

/**
 * Get best resource matches for a task
 * @param resources Available resources
 * @param task Task to assign
 * @param maxResults Maximum number of results to return
 * @returns Sorted array of skill matches (best first)
 */
export function getBestSkillMatches(
  resources: Resource[],
  task: Task,
  maxResults: number = 5
): SkillMatch[] {
  const matches = resources.map((resource) =>
    calculateSkillMatch(resource, task)
  );

  // Sort by total score (descending), then by resourceId for deterministic results
  matches.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return a.resourceId.localeCompare(b.resourceId);
  });

  return matches.slice(0, maxResults);
}

/**
 * Check if resource can handle task based on skills alone
 * @param resource Resource to check
 * @param task Task requiring skills
 * @returns True if resource has all required skills at sufficient level
 */
export function canHandleTask(resource: Resource, task: Task): boolean {
  return task.requirements.every((req: Requirement) =>
    resource.skills.some(
      (skill) => skill.id === req.skillId && skill.level >= req.minLevel
    )
  );
}
