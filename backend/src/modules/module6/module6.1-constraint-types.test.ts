/**
 * @fileoverview Test suite for Module 6.1 - Constraint Types
 * Tests all constraint type definitions, interfaces, and enums
 */

import {
  ConstraintCategory,
  ConstraintScope,
  ConstraintType,
  IConstraintRule,
  IConstraintValidationResult,
  IConstraintViolation,
  IDependency,
  ITaskForValidation,
  ViolationSeverity,
} from './shared-types';

describe('Module 6.1 - Constraint Types', () => {
  describe('ConstraintType Enum', () => {
    it('should have all required date constraint types', () => {
      expect(ConstraintType.FINISH_NO_LATER_THAN).toBe('FINISH_NO_LATER_THAN');
      expect(ConstraintType.START_NO_EARLIER_THAN).toBe(
        'START_NO_EARLIER_THAN'
      );
      expect(ConstraintType.MUST_FINISH_ON).toBe('MUST_FINISH_ON');
      expect(ConstraintType.MUST_START_ON).toBe('MUST_START_ON');
    });

    it('should have all required duration constraint types', () => {
      expect(ConstraintType.MIN_DURATION).toBe('MIN_DURATION');
      expect(ConstraintType.MAX_DURATION).toBe('MAX_DURATION');
      expect(ConstraintType.FIXED_DURATION).toBe('FIXED_DURATION');
    });

    it('should have all required resource constraint types', () => {
      expect(ConstraintType.RESOURCE_AVAILABILITY).toBe(
        'RESOURCE_AVAILABILITY'
      );
      expect(ConstraintType.RESOURCE_CAPACITY).toBe('RESOURCE_CAPACITY');
    });

    it('should have all required calendar constraint types', () => {
      expect(ConstraintType.WORK_CALENDAR_ONLY).toBe('WORK_CALENDAR_ONLY');
      expect(ConstraintType.EXCLUDE_HOLIDAYS).toBe('EXCLUDE_HOLIDAYS');
      expect(ConstraintType.PREFERRED_WORK_DAYS).toBe('PREFERRED_WORK_DAYS');
    });

    it('should have business rule constraint types', () => {
      expect(ConstraintType.PHASE_SEQUENCE).toBe('PHASE_SEQUENCE');
      expect(ConstraintType.MILESTONE_DEADLINE).toBe('MILESTONE_DEADLINE');
    });
  });

  describe('ViolationSeverity Enum', () => {
    it('should have all severity levels', () => {
      expect(ViolationSeverity.CRITICAL).toBe('CRITICAL');
      expect(ViolationSeverity.ERROR).toBe('ERROR');
      expect(ViolationSeverity.WARNING).toBe('WARNING');
      expect(ViolationSeverity.INFO).toBe('INFO');
    });

    it('should have exactly 4 severity levels', () => {
      const severityCount = Object.keys(ViolationSeverity).length;
      expect(severityCount).toBe(4);
    });
  });

  describe('ConstraintCategory Enum', () => {
    it('should have all category types', () => {
      expect(ConstraintCategory.HARD).toBe('HARD');
      expect(ConstraintCategory.SOFT).toBe('SOFT');
      expect(ConstraintCategory.CALENDAR).toBe('CALENDAR');
    });
  });

  describe('ConstraintScope Enum', () => {
    it('should have all scope types', () => {
      expect(ConstraintScope.TASK).toBe('TASK');
      expect(ConstraintScope.PROJECT).toBe('PROJECT');
      expect(ConstraintScope.PHASE).toBe('PHASE');
      expect(ConstraintScope.RESOURCE).toBe('RESOURCE');
    });
  });

  describe('ITaskForValidation Interface', () => {
    it('should create valid task for validation', () => {
      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'Test Task',
        startDate: new Date('2025-01-01'),
        finishDate: new Date('2025-01-05'),
        duration: 5,
        projectId: 'project-1',
      };

      expect(task.id).toBe('task-1');
      expect(task.name).toBe('Test Task');
      expect(task.startDate).toBeInstanceOf(Date);
      expect(task.duration).toBe(5);
      expect(task.projectId).toBe('project-1');
    });

    it('should handle optional fields', () => {
      const minimalTask: ITaskForValidation = {
        id: 'task-2',
        name: 'Minimal Task',
        projectId: 'project-1',
      };

      expect(minimalTask.startDate).toBeUndefined();
      expect(minimalTask.dependencies).toBeUndefined();
      expect(minimalTask.calendarId).toBeUndefined();
    });
  });

  describe('IDependency Interface', () => {
    it('should create valid dependency', () => {
      const dependency: IDependency = {
        predecessorId: 'task-1',
        successorId: 'task-2',
        type: 'FS',
        lag: 0,
      };

      expect(dependency.predecessorId).toBe('task-1');
      expect(dependency.successorId).toBe('task-2');
      expect(dependency.type).toBe('FS');
      expect(dependency.lag).toBe(0);
    });

    it('should support all dependency types', () => {
      const types: Array<'FS' | 'SS' | 'FF' | 'SF'> = ['FS', 'SS', 'FF', 'SF'];

      types.forEach((type) => {
        const dependency: IDependency = {
          predecessorId: 'task-1',
          successorId: 'task-2',
          type,
          lag: 0,
        };
        expect(dependency.type).toBe(type);
      });
    });
  });

  describe('IConstraintRule Interface', () => {
    it('should create valid constraint rule', () => {
      const rule: IConstraintRule = {
        id: 'constraint-1',
        name: 'Start Date Constraint',
        description: 'Task must start after project start',
        type: ConstraintType.START_NO_EARLIER_THAN,
        category: ConstraintCategory.HARD,
        severity: ViolationSeverity.CRITICAL,
        scope: ConstraintScope.TASK,
        targetTaskId: 'task-1',
        parameters: {
          startDate: new Date('2025-01-01'),
          allowWeekends: false,
        },
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'system',
      };

      expect(rule.id).toBe('constraint-1');
      expect(rule.type).toBe(ConstraintType.START_NO_EARLIER_THAN);
      expect(rule.category).toBe(ConstraintCategory.HARD);
      expect(rule.severity).toBe(ViolationSeverity.CRITICAL);
      expect(rule.scope).toBe(ConstraintScope.TASK);
      expect(rule.isActive).toBe(true);
    });
  });

  describe('IConstraintViolation Interface', () => {
    it('should create valid constraint violation', () => {
      const violation: IConstraintViolation = {
        id: 'violation-1',
        constraintId: 'constraint-1',
        constraintName: 'Start Date Constraint',
        violationType: ConstraintType.START_NO_EARLIER_THAN,
        severity: ViolationSeverity.ERROR,
        message: 'Task starts too early',
        description: 'Task start date violates project start constraint',
        affectedTaskIds: ['task-1'],
        currentValue: new Date('2024-12-01'),
        expectedValue: new Date('2025-01-01'),
        variance: -31,
        suggestions: [],
        detectedAt: new Date(),
        context: {
          projectId: 'project-1',
          calculatedAt: new Date(),
          engineVersion: '1.0.0',
          taskCount: 10,
          dependencyCount: 5,
          userTriggered: true,
          batchValidation: false,
        },
      };

      expect(violation.id).toBe('violation-1');
      expect(violation.severity).toBe(ViolationSeverity.ERROR);
      expect(violation.affectedTaskIds).toContain('task-1');
      expect(violation.variance).toBe(-31);
    });
  });

  describe('IConstraintValidationResult Interface', () => {
    it('should create valid validation result for success', () => {
      const result: IConstraintValidationResult = {
        isValid: true,
        totalConstraints: 5,
        violationCount: 0,
        criticalViolations: [],
        errorViolations: [],
        warningViolations: [],
        infoViolations: [],
        validationDuration: 150,
        suggestionsGenerated: 0,
        autoFixable: 0,
        context: {
          projectId: 'project-1',
          calculatedAt: new Date(),
          engineVersion: '1.0.0',
          taskCount: 10,
          dependencyCount: 5,
          userTriggered: true,
          batchValidation: false,
        },
      };

      expect(result.isValid).toBe(true);
      expect(result.totalConstraints).toBe(5);
      expect(result.violationCount).toBe(0);
      expect(result.criticalViolations).toHaveLength(0);
    });
  });

  describe('Type Safety and Validation', () => {
    it('should enforce constraint type consistency', () => {
      const rule: IConstraintRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'Test constraint rule',
        type: ConstraintType.FINISH_NO_LATER_THAN,
        category: ConstraintCategory.HARD,
        severity: ViolationSeverity.ERROR,
        scope: ConstraintScope.TASK,
        parameters: {},
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'test',
      };

      expect(rule.type).toBe(ConstraintType.FINISH_NO_LATER_THAN);
      expect(rule.category).toBe(ConstraintCategory.HARD);
    });

    it('should handle flexible parameters correctly', () => {
      const rule: IConstraintRule = {
        id: 'param-test',
        name: 'Parameter Test',
        description: 'Test flexible parameters',
        type: ConstraintType.MAX_DURATION,
        category: ConstraintCategory.SOFT,
        severity: ViolationSeverity.WARNING,
        scope: ConstraintScope.TASK,
        parameters: {
          maxDays: 30,
          includeWeekends: false,
          calendarIds: ['cal-1', 'cal-2'],
          threshold: 0.8,
          deadline: new Date('2025-12-31'),
        },
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'test',
      };

      expect(rule.parameters.maxDays).toBe(30);
      expect(rule.parameters.includeWeekends).toBe(false);
      expect(Array.isArray(rule.parameters.calendarIds)).toBe(true);
      expect(rule.parameters.threshold).toBe(0.8);
      expect(rule.parameters.deadline).toBeInstanceOf(Date);
    });
  });
});
