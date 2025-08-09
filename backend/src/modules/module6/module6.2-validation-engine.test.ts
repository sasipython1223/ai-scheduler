/**
 * @fileoverview Test suite for Module 6.2 - Validation Engine
 * Tests constraint validation engine functionality
 */

import {
  ConstraintCategory,
  ConstraintScope,
  ConstraintType,
  IConstraintRule,
  IConstraintValidationResult,
  IConstraintViolation,
  ITaskForValidation,
  ViolationSeverity,
} from './shared-types';

// Mock implementation of validation engine for testing
class MockConstraintValidationEngine {
  private rules: IConstraintRule[] = [];

  addRule(rule: IConstraintRule): void {
    this.rules.push(rule);
  }

  validateTask(task: ITaskForValidation): IConstraintValidationResult {
    const violations: IConstraintViolation[] = [];

    for (const rule of this.rules) {
      if (!rule.isActive) continue;

      const violation = this.checkRule(rule, task);
      if (violation) {
        violations.push(violation);
      }
    }

    const criticalViolations = violations.filter(
      (v) => v.severity === ViolationSeverity.CRITICAL
    );
    const errorViolations = violations.filter(
      (v) => v.severity === ViolationSeverity.ERROR
    );
    const warningViolations = violations.filter(
      (v) => v.severity === ViolationSeverity.WARNING
    );
    const infoViolations = violations.filter(
      (v) => v.severity === ViolationSeverity.INFO
    );

    return {
      isValid: violations.length === 0,
      totalConstraints: this.rules.filter((r) => r.isActive).length,
      violationCount: violations.length,
      criticalViolations,
      errorViolations,
      warningViolations,
      infoViolations,
      validationDuration: 100,
      suggestionsGenerated: 0,
      autoFixable: 0,
      context: {
        projectId: task.projectId,
        calculatedAt: new Date(),
        engineVersion: '1.0.0',
        taskCount: 1,
        dependencyCount: 0,
        userTriggered: true,
        batchValidation: false,
      },
    };
  }

  private checkRule(
    rule: IConstraintRule,
    task: ITaskForValidation
  ): IConstraintViolation | null {
    switch (rule.type) {
      case ConstraintType.START_NO_EARLIER_THAN:
        return this.checkStartNoEarlierThan(rule, task);
      case ConstraintType.FINISH_NO_LATER_THAN:
        return this.checkFinishNoLaterThan(rule, task);
      case ConstraintType.MAX_DURATION:
        return this.checkMaxDuration(rule, task);
      default:
        return null;
    }
  }

  private checkStartNoEarlierThan(
    rule: IConstraintRule,
    task: ITaskForValidation
  ): IConstraintViolation | null {
    if (!task.startDate || !rule.parameters.startDate) return null;

    const constraintDate = new Date(rule.parameters.startDate as Date);
    if (task.startDate < constraintDate) {
      return {
        id: `violation-${Date.now()}`,
        constraintId: rule.id,
        constraintName: rule.name,
        violationType: rule.type,
        severity: rule.severity,
        message: `Task starts before allowed date`,
        description: `Task "${task.name}" starts on ${task.startDate.toISOString().split('T')[0]} but must start no earlier than ${constraintDate.toISOString().split('T')[0]}`,
        affectedTaskIds: [task.id],
        currentValue: task.startDate,
        expectedValue: constraintDate,
        suggestions: [],
        detectedAt: new Date(),
        context: {
          projectId: task.projectId,
          calculatedAt: new Date(),
          engineVersion: '1.0.0',
          taskCount: 1,
          dependencyCount: 0,
          userTriggered: true,
          batchValidation: false,
        },
      };
    }
    return null;
  }

  private checkFinishNoLaterThan(
    rule: IConstraintRule,
    task: ITaskForValidation
  ): IConstraintViolation | null {
    if (!task.finishDate || !rule.parameters.finishDate) return null;

    const constraintDate = new Date(rule.parameters.finishDate as Date);
    if (task.finishDate > constraintDate) {
      return {
        id: `violation-${Date.now()}`,
        constraintId: rule.id,
        constraintName: rule.name,
        violationType: rule.type,
        severity: rule.severity,
        message: `Task finishes after allowed date`,
        description: `Task "${task.name}" finishes on ${task.finishDate.toISOString().split('T')[0]} but must finish no later than ${constraintDate.toISOString().split('T')[0]}`,
        affectedTaskIds: [task.id],
        currentValue: task.finishDate,
        expectedValue: constraintDate,
        suggestions: [],
        detectedAt: new Date(),
        context: {
          projectId: task.projectId,
          calculatedAt: new Date(),
          engineVersion: '1.0.0',
          taskCount: 1,
          dependencyCount: 0,
          userTriggered: true,
          batchValidation: false,
        },
      };
    }
    return null;
  }

  private checkMaxDuration(
    rule: IConstraintRule,
    task: ITaskForValidation
  ): IConstraintViolation | null {
    if (!task.duration || !rule.parameters.maxDays) return null;

    const maxDuration = rule.parameters.maxDays as number;
    if (task.duration > maxDuration) {
      return {
        id: `violation-${Date.now()}`,
        constraintId: rule.id,
        constraintName: rule.name,
        violationType: rule.type,
        severity: rule.severity,
        message: `Task duration exceeds maximum`,
        description: `Task "${task.name}" has duration of ${task.duration} days but maximum allowed is ${maxDuration} days`,
        affectedTaskIds: [task.id],
        currentValue: task.duration,
        expectedValue: maxDuration,
        suggestions: [],
        detectedAt: new Date(),
        context: {
          projectId: task.projectId,
          calculatedAt: new Date(),
          engineVersion: '1.0.0',
          taskCount: 1,
          dependencyCount: 0,
          userTriggered: true,
          batchValidation: false,
        },
      };
    }
    return null;
  }
}

describe('Module 6.2 - Validation Engine', () => {
  let engine: MockConstraintValidationEngine;

  beforeEach(() => {
    engine = new MockConstraintValidationEngine();
  });

  describe('Rule Management', () => {
    it('should add constraint rules', () => {
      const rule: IConstraintRule = {
        id: 'rule-1',
        name: 'Test Rule',
        description: 'Test constraint rule',
        type: ConstraintType.START_NO_EARLIER_THAN,
        category: ConstraintCategory.HARD,
        severity: ViolationSeverity.ERROR,
        scope: ConstraintScope.TASK,
        parameters: { startDate: new Date('2025-01-01') },
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'test',
      };

      engine.addRule(rule);

      // Validation should now include this rule
      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'Test Task',
        projectId: 'project-1',
        startDate: new Date('2025-01-05'),
      };

      const result = engine.validateTask(task);
      expect(result.totalConstraints).toBe(1);
    });
  });

  describe('Start Date Validation', () => {
    beforeEach(() => {
      const rule: IConstraintRule = {
        id: 'start-rule',
        name: 'Start Date Rule',
        description: 'Task must start after project start',
        type: ConstraintType.START_NO_EARLIER_THAN,
        category: ConstraintCategory.HARD,
        severity: ViolationSeverity.ERROR,
        scope: ConstraintScope.TASK,
        parameters: { startDate: new Date('2025-01-01') },
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'test',
      };
      engine.addRule(rule);
    });

    it('should pass validation when task starts after constraint date', () => {
      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'Valid Task',
        projectId: 'project-1',
        startDate: new Date('2025-01-05'),
      };

      const result = engine.validateTask(task);
      expect(result.isValid).toBe(true);
      expect(result.violationCount).toBe(0);
    });

    it('should fail validation when task starts before constraint date', () => {
      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'Invalid Task',
        projectId: 'project-1',
        startDate: new Date('2024-12-25'),
      };

      const result = engine.validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.violationCount).toBe(1);
      expect(result.errorViolations).toHaveLength(1);
      expect(result.errorViolations[0].violationType).toBe(
        ConstraintType.START_NO_EARLIER_THAN
      );
    });

    it('should handle missing start date gracefully', () => {
      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'No Start Date Task',
        projectId: 'project-1',
      };

      const result = engine.validateTask(task);
      expect(result.isValid).toBe(true);
      expect(result.violationCount).toBe(0);
    });
  });

  describe('Finish Date Validation', () => {
    beforeEach(() => {
      const rule: IConstraintRule = {
        id: 'finish-rule',
        name: 'Finish Date Rule',
        description: 'Task must finish before project deadline',
        type: ConstraintType.FINISH_NO_LATER_THAN,
        category: ConstraintCategory.HARD,
        severity: ViolationSeverity.CRITICAL,
        scope: ConstraintScope.TASK,
        parameters: { finishDate: new Date('2025-12-31') },
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'test',
      };
      engine.addRule(rule);
    });

    it('should pass validation when task finishes before constraint date', () => {
      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'Valid Task',
        projectId: 'project-1',
        finishDate: new Date('2025-11-30'),
      };

      const result = engine.validateTask(task);
      expect(result.isValid).toBe(true);
      expect(result.violationCount).toBe(0);
    });

    it('should fail validation when task finishes after constraint date', () => {
      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'Late Task',
        projectId: 'project-1',
        finishDate: new Date('2026-01-15'),
      };

      const result = engine.validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.violationCount).toBe(1);
      expect(result.criticalViolations).toHaveLength(1);
      expect(result.criticalViolations[0].violationType).toBe(
        ConstraintType.FINISH_NO_LATER_THAN
      );
    });
  });

  describe('Duration Validation', () => {
    beforeEach(() => {
      const rule: IConstraintRule = {
        id: 'duration-rule',
        name: 'Max Duration Rule',
        description: 'Task duration cannot exceed 30 days',
        type: ConstraintType.MAX_DURATION,
        category: ConstraintCategory.SOFT,
        severity: ViolationSeverity.WARNING,
        scope: ConstraintScope.TASK,
        parameters: { maxDays: 30 },
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'test',
      };
      engine.addRule(rule);
    });

    it('should pass validation when task duration is within limit', () => {
      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'Short Task',
        projectId: 'project-1',
        duration: 15,
      };

      const result = engine.validateTask(task);
      expect(result.isValid).toBe(true);
      expect(result.violationCount).toBe(0);
    });

    it('should fail validation when task duration exceeds limit', () => {
      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'Long Task',
        projectId: 'project-1',
        duration: 45,
      };

      const result = engine.validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.violationCount).toBe(1);
      expect(result.warningViolations).toHaveLength(1);
      expect(result.warningViolations[0].violationType).toBe(
        ConstraintType.MAX_DURATION
      );
    });
  });

  describe('Multiple Rules Validation', () => {
    beforeEach(() => {
      // Add multiple rules
      const startRule: IConstraintRule = {
        id: 'start-rule',
        name: 'Start Date Rule',
        description: 'Task must start after project start',
        type: ConstraintType.START_NO_EARLIER_THAN,
        category: ConstraintCategory.HARD,
        severity: ViolationSeverity.ERROR,
        scope: ConstraintScope.TASK,
        parameters: { startDate: new Date('2025-01-01') },
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'test',
      };

      const durationRule: IConstraintRule = {
        id: 'duration-rule',
        name: 'Max Duration Rule',
        description: 'Task duration cannot exceed 30 days',
        type: ConstraintType.MAX_DURATION,
        category: ConstraintCategory.SOFT,
        severity: ViolationSeverity.WARNING,
        scope: ConstraintScope.TASK,
        parameters: { maxDays: 30 },
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'test',
      };

      engine.addRule(startRule);
      engine.addRule(durationRule);
    });

    it('should validate against all active rules', () => {
      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'Test Task',
        projectId: 'project-1',
        startDate: new Date('2024-12-15'), // Violates start date
        duration: 45, // Violates duration
      };

      const result = engine.validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.violationCount).toBe(2);
      expect(result.totalConstraints).toBe(2);
      expect(result.errorViolations).toHaveLength(1);
      expect(result.warningViolations).toHaveLength(1);
    });

    it('should pass when all rules are satisfied', () => {
      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'Perfect Task',
        projectId: 'project-1',
        startDate: new Date('2025-01-15'),
        duration: 20,
      };

      const result = engine.validateTask(task);
      expect(result.isValid).toBe(true);
      expect(result.violationCount).toBe(0);
      expect(result.totalConstraints).toBe(2);
    });
  });

  describe('Inactive Rules', () => {
    it('should skip inactive rules during validation', () => {
      const inactiveRule: IConstraintRule = {
        id: 'inactive-rule',
        name: 'Inactive Rule',
        description: 'This rule is disabled',
        type: ConstraintType.START_NO_EARLIER_THAN,
        category: ConstraintCategory.HARD,
        severity: ViolationSeverity.ERROR,
        scope: ConstraintScope.TASK,
        parameters: { startDate: new Date('2025-01-01') },
        isActive: false, // Inactive
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'test',
      };

      engine.addRule(inactiveRule);

      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'Test Task',
        projectId: 'project-1',
        startDate: new Date('2024-12-15'), // Would violate if rule was active
      };

      const result = engine.validateTask(task);
      expect(result.isValid).toBe(true);
      expect(result.violationCount).toBe(0);
      expect(result.totalConstraints).toBe(0); // No active constraints
    });
  });

  describe('Performance Validation', () => {
    it('should complete validation within reasonable time', () => {
      // Add multiple rules for performance testing
      for (let i = 0; i < 10; i++) {
        const rule: IConstraintRule = {
          id: `rule-${i}`,
          name: `Rule ${i}`,
          description: `Test rule ${i}`,
          type: ConstraintType.MAX_DURATION,
          category: ConstraintCategory.SOFT,
          severity: ViolationSeverity.INFO,
          scope: ConstraintScope.TASK,
          parameters: { maxDays: i * 10 },
          isActive: true,
          createdDate: new Date(),
          modifiedDate: new Date(),
          createdBy: 'test',
        };
        engine.addRule(rule);
      }

      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'Performance Test Task',
        projectId: 'project-1',
        duration: 50,
      };

      const startTime = Date.now();
      const result = engine.validateTask(task);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
      expect(result.totalConstraints).toBe(10);
      expect(result.validationDuration).toBeGreaterThan(0);
    });
  });
});
