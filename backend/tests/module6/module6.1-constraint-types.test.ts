/**
 * Module 6.1 & 6.2: Constraint System Tests
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Unit tests for constraint types, models, and validation
 */

// Jest global declarations
declare var describe: any;
declare var it: any;
declare var expect: any;
declare var beforeEach: any;

import { ConstraintFactory } from '../../src/models/constraint-factory.js';
import {
  TaskValidationInput,
  ValidationUtils,
} from '../../src/services/constraint-validation-utils.js';
import { ConstraintValidator } from '../../src/services/constraint-validator.js';
import {
  ConstraintCategory,
  ConstraintType,
  DurationConstraintParams,
  ViolationSeverity,
} from '../../src/types/constraint-types.js';

describe('Module 6: Constraint System', () => {
  describe('6.1 Constraint Types and Models', () => {
    it('should create a date constraint using factory', () => {
      const targetDate = new Date('2025-12-31');
      const constraint = ConstraintFactory.createDateConstraint(
        ConstraintType.FINISH_NO_LATER_THAN,
        targetDate,
        'task-1'
      );

      expect(constraint.type).toBe(ConstraintType.FINISH_NO_LATER_THAN);
      expect(constraint.targetTaskId).toBe('task-1');
      expect(constraint.category).toBe(ConstraintCategory.HARD);
      expect(constraint.severity).toBe(ViolationSeverity.ERROR);
    });

    it('should create a duration constraint using factory', () => {
      const constraint = ConstraintFactory.createDurationConstraint(
        ConstraintType.FIXED_DURATION,
        5,
        'task-2',
        { unit: 'DAYS' }
      );

      expect(constraint.type).toBe(ConstraintType.FIXED_DURATION);
      expect(constraint.targetTaskId).toBe('task-2');
      expect(
        (constraint.parameters as DurationConstraintParams).fixedDuration
      ).toBe(5);
      expect((constraint.parameters as DurationConstraintParams).unit).toBe(
        'DAYS'
      );
    });

    it('should validate constraint applies to correct task', () => {
      const constraint = ConstraintFactory.createDateConstraint(
        ConstraintType.FINISH_NO_LATER_THAN,
        new Date(),
        'task-1'
      );

      expect(constraint.appliesToTask('task-1')).toBe(true);
      expect(constraint.appliesToTask('task-2')).toBe(false);
    });
  });

  describe('6.2 Constraint Validation Engine', () => {
    let validator: ConstraintValidator;
    let sampleTask: TaskValidationInput;

    beforeEach(() => {
      validator = new ConstraintValidator();
      sampleTask = {
        id: 'task-1',
        name: 'Sample Task',
        startDate: new Date('2025-08-01'),
        finishDate: new Date('2025-08-05'),
        duration: 5,
        projectId: 'project-1',
      };
    });

    it('should validate task with no constraints', () => {
      const result = validator.validateTask(sampleTask);

      expect(result.isValid).toBe(true);
      expect(result.violationCount).toBe(0);
      expect(result.totalConstraints).toBe(0);
    });

    it('should detect date constraint violation', () => {
      // Add a constraint that task must finish by July 31st
      const constraint = ConstraintFactory.createDateConstraint(
        ConstraintType.FINISH_NO_LATER_THAN,
        new Date('2025-07-31'),
        'task-1'
      );
      validator.addConstraint(constraint);

      const result = validator.validateTask(sampleTask);

      expect(result.isValid).toBe(false);
      expect(result.violationCount).toBe(1);
      expect(result.errorViolations).toHaveLength(1);
      expect(result.errorViolations[0].message).toContain('finishes');
      expect(result.errorViolations[0].message).toContain('after');
    });

    it('should detect duration constraint violation', () => {
      // Add a constraint that task must be exactly 3 days
      const constraint = ConstraintFactory.createDurationConstraint(
        ConstraintType.FIXED_DURATION,
        3,
        'task-1',
        { unit: 'DAYS' }
      );
      validator.addConstraint(constraint);

      const result = validator.validateTask(sampleTask);

      expect(result.isValid).toBe(false);
      expect(result.violationCount).toBe(1);
      expect(result.errorViolations).toHaveLength(1);
      expect(result.errorViolations[0].message).toContain('exactly');
    });

    it('should pass valid date constraint', () => {
      // Add a constraint that task must finish by August 10th (later than actual)
      const constraint = ConstraintFactory.createDateConstraint(
        ConstraintType.FINISH_NO_LATER_THAN,
        new Date('2025-08-10'),
        'task-1'
      );
      validator.addConstraint(constraint);

      const result = validator.validateTask(sampleTask);

      expect(result.isValid).toBe(true);
      expect(result.violationCount).toBe(0);
    });

    it('should pass valid duration constraint', () => {
      // Add a constraint that task must be exactly 5 days (matches actual)
      const constraint = ConstraintFactory.createDurationConstraint(
        ConstraintType.FIXED_DURATION,
        5,
        'task-1',
        { unit: 'DAYS' }
      );
      validator.addConstraint(constraint);

      const result = validator.validateTask(sampleTask);

      expect(result.isValid).toBe(true);
      expect(result.violationCount).toBe(0);
    });

    it('should validate multiple tasks in batch', () => {
      const tasks: TaskValidationInput[] = [
        sampleTask,
        {
          id: 'task-2',
          name: 'Second Task',
          startDate: new Date('2025-08-06'),
          finishDate: new Date('2025-08-08'),
          duration: 3,
          projectId: 'project-1',
        },
      ];

      // Add constraint that affects both tasks
      const constraint = ConstraintFactory.createDateConstraint(
        ConstraintType.FINISH_NO_LATER_THAN,
        new Date('2025-08-07'),
        'task-2'
      );
      validator.addConstraint(constraint);

      const result = validator.validateTasks(tasks);

      expect(result.violationCount).toBe(1);
      expect(result.context.batchValidation).toBe(true);
      expect(result.context.taskCount).toBe(2);
    });

    it('should generate auto-fix suggestions', () => {
      const constraint = ConstraintFactory.createDateConstraint(
        ConstraintType.FINISH_NO_LATER_THAN,
        new Date('2025-07-31'),
        'task-1'
      );
      validator.addConstraint(constraint);

      const result = validator.validateTask(sampleTask);

      expect(result.autoFixable).toBeGreaterThan(0);
      expect(result.errorViolations[0].suggestions).toHaveLength(1);
      expect(result.errorViolations[0].suggestions[0].canAutoApply).toBe(true);
      expect(result.errorViolations[0].suggestions[0].type).toBe('ADJUST_DATE');
    });

    it('should respect validation options', () => {
      // Create a soft constraint
      const constraint = ConstraintFactory.createDurationConstraint(
        ConstraintType.MIN_DURATION,
        10,
        'task-1',
        { unit: 'DAYS', severity: ViolationSeverity.WARNING }
      );
      validator.addConstraint(constraint);

      // Configure to skip soft constraints
      validator.updateOptions({ skipSoftConstraints: true });

      const result = validator.validateTask(sampleTask);

      expect(result.isValid).toBe(true);
      expect(result.violationCount).toBe(0);
    });

    it('should provide constraint statistics', () => {
      const dateConstraint = ConstraintFactory.createDateConstraint(
        ConstraintType.FINISH_NO_LATER_THAN,
        new Date(),
        'task-1'
      );
      const durationConstraint = ConstraintFactory.createDurationConstraint(
        ConstraintType.FIXED_DURATION,
        5,
        'task-1'
      );

      validator.addConstraint(dateConstraint);
      validator.addConstraint(durationConstraint);

      const stats = validator.getStatistics();

      expect(stats.totalConstraints).toBe(2);
      expect(stats.activeConstraints).toBe(2);
      expect(stats.hardConstraints).toBe(2);
    });
  });

  describe('6.2 Validation Utilities', () => {
    it('should identify blocking violations', () => {
      const mockResult = {
        isValid: false,
        totalConstraints: 1,
        violationCount: 1,
        criticalViolations: [],
        errorViolations: [{ severity: ViolationSeverity.ERROR } as any],
        warningViolations: [],
        infoViolations: [],
        validationDuration: 10,
        suggestionsGenerated: 1,
        autoFixable: 1,
        context: {} as any,
      };

      expect(ValidationUtils.hasBlockingViolations(mockResult)).toBe(true);
    });

    it('should generate summary messages', () => {
      const validResult = {
        isValid: true,
        totalConstraints: 5,
        violationCount: 0,
        criticalViolations: [],
        errorViolations: [],
        warningViolations: [],
        infoViolations: [],
        validationDuration: 10,
        suggestionsGenerated: 0,
        autoFixable: 0,
        context: {} as any,
      };

      const message = ValidationUtils.getSummaryMessage(validResult);

      expect(message).toContain('✅');
      expect(message).toContain('5 constraints passed');
    });
  });
});
