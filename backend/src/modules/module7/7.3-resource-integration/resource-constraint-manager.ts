/**
 * STRICT RULES for Module 7.3:
 * - ≤220 LOC per file. Split helpers instead of growing files.
 * - No `any`. Keep types narrow and explicit.
 * - No throwing for business errors; return {status, violations}.
 * - Pure functions in strategies and availability checker.
 * - Deterministic outputs (stable sort/tie-break).
 * - Keep algorithmic complexity reasonable (target O(T log R)).
 */

/**
 * Module 7.3 - Resource Constraint Manager Implementation
 *
 * Main implementation that orchestrates resource allocation strategies.
 */

import type {
  ConstraintInput,
  IntegrationResult,
  ResourceConstraintManager,
} from './index';
import { greedySkillFitStrategy } from './strategies/greedy-skill-fit';
import { minimalLevelingStrategy } from './strategies/minimal-leveling';

/**
 * Concrete implementation of ResourceConstraintManager
 */
class ResourceConstraintManagerImpl implements ResourceConstraintManager {
  async integrate(input: ConstraintInput): Promise<IntegrationResult> {
    // Validate input
    const validation = this.validateInput(input);
    if (validation.length > 0) {
      return {
        status: 'conflicts',
        allocations: [],
        violations: validation,
        metrics: { elapsedMs: 0, leveledVariance: 0 },
      };
    }

    // Check time budget
    const timeBudgetMs = input.timeBudgetMs || 5000; // Default 5 seconds
    const startTime = Date.now();

    // Determine strategy based on flags
    const useGreedy = input.flags?.ENABLE_GREEDY !== false; // Default true
    const useLeveling = input.flags?.ENABLE_LEVELING === true; // Default false

    let result: IntegrationResult;

    if (useLeveling && !useGreedy) {
      // Pure leveling strategy
      result = minimalLevelingStrategy(input);
    } else if (useGreedy && !useLeveling) {
      // Pure greedy strategy
      result = greedySkillFitStrategy(input);
    } else if (useGreedy && useLeveling) {
      // Hybrid: try leveling first, fallback to greedy if time allows
      result = await this.hybridStrategy(input, timeBudgetMs);
    } else {
      // No strategy enabled - return empty result
      result = {
        status: 'conflicts',
        allocations: [],
        violations: ['No allocation strategy enabled'],
        metrics: { elapsedMs: Date.now() - startTime, leveledVariance: 0 },
      };
    }

    // Check if we exceeded time budget
    const elapsedMs = Date.now() - startTime;
    if (elapsedMs > timeBudgetMs) {
      result.violations.push(
        `Allocation exceeded time budget: ${elapsedMs}ms > ${timeBudgetMs}ms`
      );
    }

    return result;
  }

  /**
   * Hybrid strategy: leveling with greedy fallback
   */
  private async hybridStrategy(
    input: ConstraintInput,
    timeBudgetMs: number
  ): Promise<IntegrationResult> {
    const halfTime = Math.floor(timeBudgetMs / 2);
    const startTime = Date.now();

    // Try leveling first
    const levelingInput = { ...input, timeBudgetMs: halfTime };
    const levelingResult = minimalLevelingStrategy(levelingInput);

    const midTime = Date.now();
    const remainingTime = timeBudgetMs - (midTime - startTime);

    // If leveling failed or we have time, try greedy as fallback/comparison
    if (levelingResult.violations.length > 0 && remainingTime > 100) {
      const greedyInput = { ...input, timeBudgetMs: remainingTime };
      const greedyResult = greedySkillFitStrategy(greedyInput);

      // Choose better result (fewer violations, then more allocations)
      if (
        greedyResult.violations.length < levelingResult.violations.length ||
        (greedyResult.violations.length === levelingResult.violations.length &&
          greedyResult.allocations.length > levelingResult.allocations.length)
      ) {
        return {
          ...greedyResult,
          violations: [
            ...greedyResult.violations,
            'Used greedy fallback after leveling failed',
          ],
        };
      }
    }

    return levelingResult;
  }

  /**
   * Validate constraint input
   */
  private validateInput(input: ConstraintInput): string[] {
    const violations: string[] = [];

    if (!input.resources || input.resources.length === 0) {
      violations.push('No resources provided');
    }

    if (!input.tasks || input.tasks.length === 0) {
      violations.push('No tasks provided');
    }

    violations.push(...this.validateResources(input.resources || []));
    violations.push(...this.validateTasks(input.tasks || []));

    return violations;
  }

  /**
   * Validate resources array
   */
  private validateResources(resources: ConstraintInput['resources']): string[] {
    const violations: string[] = [];

    for (const resource of resources) {
      if (!resource.id) {
        violations.push(`Resource missing ID: ${JSON.stringify(resource)}`);
      }
      if (resource.capacity <= 0) {
        violations.push(
          `Resource ${resource.id} has invalid capacity: ${resource.capacity}`
        );
      }
    }

    return violations;
  }

  /**
   * Validate tasks array
   */
  private validateTasks(tasks: ConstraintInput['tasks']): string[] {
    const violations: string[] = [];

    for (const task of tasks) {
      if (!task.id) {
        violations.push(`Task missing ID: ${JSON.stringify(task)}`);
      }
      if (task.duration <= 0) {
        violations.push(
          `Task ${task.id} has invalid duration: ${task.duration}`
        );
      }
      if (!task.day) {
        violations.push(`Task ${task.id} missing day`);
      }
    }

    return violations;
  }
}

/**
 * Factory function to create manager instance
 */
export function createResourceConstraintManagerImpl(): ResourceConstraintManager {
  return new ResourceConstraintManagerImpl();
}
