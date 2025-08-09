/**
 * @fileoverview Test suite for Module 6 - Shared Types
 * Tests type safety and interface compliance
 */

import {
  ConstraintCategory,
  ConstraintScope,
  ConstraintType,
  IConstraintRule,
  IConstraintValidationResult,
  IConstraintViolation,
  IDependency,
  IProposedChange,
  ITaskForValidation,
  IViolationContext,
  IViolationSuggestion,
  ViolationSeverity,
} from './shared-types';

describe('Module 6 - Shared Types Safety', () => {
  describe('Enum Completeness', () => {
    it('should have all ConstraintType values defined', () => {
      const expectedTypes = [
        'FINISH_NO_LATER_THAN',
        'START_NO_EARLIER_THAN',
        'MUST_FINISH_ON',
        'MUST_START_ON',
        'MIN_DURATION',
        'MAX_DURATION',
        'FIXED_DURATION',
        'RESOURCE_AVAILABILITY',
        'RESOURCE_CAPACITY',
        'WORK_CALENDAR_ONLY',
        'EXCLUDE_HOLIDAYS',
        'PREFERRED_WORK_DAYS',
        'MANDATORY_DEPENDENCY',
        'FORBIDDEN_OVERLAP',
        'PHASE_SEQUENCE',
        'MILESTONE_DEADLINE',
      ];

      expectedTypes.forEach((type) => {
        expect(Object.values(ConstraintType)).toContain(type);
      });

      expect(Object.keys(ConstraintType)).toHaveLength(expectedTypes.length);
    });

    it('should have all ViolationSeverity values defined', () => {
      const expectedSeverities = ['CRITICAL', 'ERROR', 'WARNING', 'INFO'];

      expectedSeverities.forEach((severity) => {
        expect(Object.values(ViolationSeverity)).toContain(severity);
      });

      expect(Object.keys(ViolationSeverity)).toHaveLength(
        expectedSeverities.length
      );
    });

    it('should have all ConstraintCategory values defined', () => {
      const expectedCategories = ['HARD', 'SOFT', 'CALENDAR'];

      expectedCategories.forEach((category) => {
        expect(Object.values(ConstraintCategory)).toContain(category);
      });

      expect(Object.keys(ConstraintCategory)).toHaveLength(
        expectedCategories.length
      );
    });

    it('should have all ConstraintScope values defined', () => {
      const expectedScopes = ['TASK', 'PROJECT', 'PHASE', 'RESOURCE'];

      expectedScopes.forEach((scope) => {
        expect(Object.values(ConstraintScope)).toContain(scope);
      });

      expect(Object.keys(ConstraintScope)).toHaveLength(expectedScopes.length);
    });
  });

  describe('Interface Type Safety', () => {
    it('should create valid ITaskForValidation with all fields', () => {
      const dependency: IDependency = {
        predecessorId: 'task-0',
        successorId: 'task-1',
        type: 'FS',
        lag: 2,
      };

      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'Complete Task',
        startDate: new Date('2025-01-01'),
        finishDate: new Date('2025-01-10'),
        duration: 10,
        dependencies: [dependency],
        calendarId: 'calendar-1',
        resourceAssignments: ['resource-1', 'resource-2'],
        projectId: 'project-1',
        phaseId: 'phase-1',
      };

      expect(task.id).toBe('task-1');
      expect(task.name).toBe('Complete Task');
      expect(task.startDate).toBeInstanceOf(Date);
      expect(task.finishDate).toBeInstanceOf(Date);
      expect(task.duration).toBe(10);
      expect(task.dependencies).toHaveLength(1);
      expect(task.dependencies![0].type).toBe('FS');
      expect(task.calendarId).toBe('calendar-1');
      expect(task.resourceAssignments).toContain('resource-1');
      expect(task.projectId).toBe('project-1');
      expect(task.phaseId).toBe('phase-1');
    });

    it('should create valid ITaskForValidation with minimal fields', () => {
      const task: ITaskForValidation = {
        id: 'task-minimal',
        name: 'Minimal Task',
        projectId: 'project-1',
      };

      expect(task.id).toBe('task-minimal');
      expect(task.name).toBe('Minimal Task');
      expect(task.projectId).toBe('project-1');
      expect(task.startDate).toBeUndefined();
      expect(task.finishDate).toBeUndefined();
      expect(task.duration).toBeUndefined();
      expect(task.dependencies).toBeUndefined();
      expect(task.calendarId).toBeUndefined();
      expect(task.resourceAssignments).toBeUndefined();
      expect(task.phaseId).toBeUndefined();
    });

    it('should support all dependency types', () => {
      const dependencyTypes: Array<'FS' | 'SS' | 'FF' | 'SF'> = [
        'FS',
        'SS',
        'FF',
        'SF',
      ];

      dependencyTypes.forEach((type, index) => {
        const dependency: IDependency = {
          predecessorId: `task-${index}`,
          successorId: `task-${index + 1}`,
          type,
          lag: index,
        };

        expect(dependency.type).toBe(type);
        expect(dependency.lag).toBe(index);
      });
    });
  });

  describe('IConstraintRule Type Safety', () => {
    it('should create valid constraint rule with all targeting options', () => {
      // Task-specific constraint
      const taskRule: IConstraintRule = {
        id: 'task-rule',
        name: 'Task Specific Rule',
        description: 'Applies to specific task',
        type: ConstraintType.MAX_DURATION,
        category: ConstraintCategory.HARD,
        severity: ViolationSeverity.ERROR,
        scope: ConstraintScope.TASK,
        targetTaskId: 'task-1',
        parameters: { maxDays: 30 },
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'user-1',
      };

      expect(taskRule.targetTaskId).toBe('task-1');
      expect(taskRule.scope).toBe(ConstraintScope.TASK);

      // Multi-task constraint
      const multiTaskRule: IConstraintRule = {
        id: 'multi-task-rule',
        name: 'Multi Task Rule',
        description: 'Applies to multiple tasks',
        type: ConstraintType.PHASE_SEQUENCE,
        category: ConstraintCategory.HARD,
        severity: ViolationSeverity.CRITICAL,
        scope: ConstraintScope.PHASE,
        targetTaskIds: ['task-1', 'task-2', 'task-3'],
        parameters: { sequenceOrder: ['task-1', 'task-2', 'task-3'] },
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'user-1',
      };

      expect(multiTaskRule.targetTaskIds).toHaveLength(3);
      expect(multiTaskRule.targetTaskIds).toContain('task-2');

      // Phase constraint
      const phaseRule: IConstraintRule = {
        id: 'phase-rule',
        name: 'Phase Rule',
        description: 'Applies to phase',
        type: ConstraintType.MILESTONE_DEADLINE,
        category: ConstraintCategory.HARD,
        severity: ViolationSeverity.CRITICAL,
        scope: ConstraintScope.PHASE,
        targetPhaseId: 'phase-1',
        parameters: { deadline: new Date('2025-12-31') },
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'user-1',
      };

      expect(phaseRule.targetPhaseId).toBe('phase-1');

      // Resource constraint
      const resourceRule: IConstraintRule = {
        id: 'resource-rule',
        name: 'Resource Rule',
        description: 'Applies to resource',
        type: ConstraintType.RESOURCE_CAPACITY,
        category: ConstraintCategory.SOFT,
        severity: ViolationSeverity.WARNING,
        scope: ConstraintScope.RESOURCE,
        targetResourceId: 'resource-1',
        parameters: { maxCapacity: 100, unit: 'percent' },
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'user-1',
      };

      expect(resourceRule.targetResourceId).toBe('resource-1');
    });

    it('should support flexible parameters', () => {
      const rule: IConstraintRule = {
        id: 'flexible-rule',
        name: 'Flexible Parameters Rule',
        description: 'Tests flexible parameter types',
        type: ConstraintType.WORK_CALENDAR_ONLY,
        category: ConstraintCategory.CALENDAR,
        severity: ViolationSeverity.INFO,
        scope: ConstraintScope.PROJECT,
        parameters: {
          // String parameters
          calendarName: 'Standard Work Calendar',
          timezone: 'America/New_York',

          // Number parameters
          workHoursPerDay: 8,
          workDaysPerWeek: 5,
          overtimeThreshold: 1.5,

          // Boolean parameters
          includeWeekends: false,
          allowHolidays: true,
          strictMode: false,

          // Date parameters
          projectStart: new Date('2025-01-01'),
          projectEnd: new Date('2025-12-31'),

          // Array parameters
          workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          excludeDates: ['2025-07-04', '2025-12-25'],
          allowedResources: ['resource-1', 'resource-2'],
        },
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'user-1',
      };

      expect(typeof rule.parameters.calendarName).toBe('string');
      expect(typeof rule.parameters.workHoursPerDay).toBe('number');
      expect(typeof rule.parameters.includeWeekends).toBe('boolean');
      expect(rule.parameters.projectStart).toBeInstanceOf(Date);
      expect(Array.isArray(rule.parameters.workDays)).toBe(true);
      expect(rule.parameters.workDays).toContain('Monday');
    });
  });

  describe('IConstraintViolation Type Safety', () => {
    it('should create complete violation with all fields', () => {
      const context: IViolationContext = {
        scheduleCalculationId: 'calc-123',
        projectId: 'project-1',
        calculatedAt: new Date(),
        engineVersion: '1.0.0',
        taskCount: 10,
        dependencyCount: 5,
        criticalPathLength: 45,
        userTriggered: true,
        batchValidation: false,
      };

      const proposedChange: IProposedChange = {
        taskId: 'task-1',
        field: 'startDate',
        currentValue: new Date('2024-12-01'),
        proposedValue: new Date('2025-01-01'),
      };

      const suggestion: IViolationSuggestion = {
        id: 'suggestion-1',
        type: 'ADJUST_DATE',
        description: 'Move task start date to comply with constraint',
        impact: 'LOW',
        proposedChanges: [proposedChange],
        canAutoApply: true,
        confidence: 95,
      };

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
        suggestions: [suggestion],
        detectedAt: new Date(),
        context,
      };

      expect(violation.id).toBe('violation-1');
      expect(violation.violationType).toBe(
        ConstraintType.START_NO_EARLIER_THAN
      );
      expect(violation.severity).toBe(ViolationSeverity.ERROR);
      expect(violation.affectedTaskIds).toContain('task-1');
      expect(violation.variance).toBe(-31);
      expect(violation.suggestions).toHaveLength(1);
      expect(violation.suggestions[0].type).toBe('ADJUST_DATE');
      expect(violation.suggestions[0].canAutoApply).toBe(true);
      expect(violation.context.projectId).toBe('project-1');
    });

    it('should support all suggestion types', () => {
      const suggestionTypes: Array<
        | 'ADJUST_DATE'
        | 'CHANGE_DURATION'
        | 'MODIFY_DEPENDENCY'
        | 'REASSIGN_RESOURCE'
        | 'IGNORE_CONSTRAINT'
      > = [
        'ADJUST_DATE',
        'CHANGE_DURATION',
        'MODIFY_DEPENDENCY',
        'REASSIGN_RESOURCE',
        'IGNORE_CONSTRAINT',
      ];

      suggestionTypes.forEach((type, index) => {
        const suggestion: IViolationSuggestion = {
          id: `suggestion-${index}`,
          type,
          description: `Test suggestion for ${type}`,
          impact: 'MEDIUM',
          proposedChanges: [],
          canAutoApply: type !== 'IGNORE_CONSTRAINT',
          confidence: 80,
        };

        expect(suggestion.type).toBe(type);
        expect(suggestion.canAutoApply).toBe(type !== 'IGNORE_CONSTRAINT');
      });
    });

    it('should support all impact levels', () => {
      const impactLevels: Array<'LOW' | 'MEDIUM' | 'HIGH'> = [
        'LOW',
        'MEDIUM',
        'HIGH',
      ];

      impactLevels.forEach((impact, index) => {
        const suggestion: IViolationSuggestion = {
          id: `suggestion-${index}`,
          type: 'ADJUST_DATE',
          description: `Test suggestion with ${impact} impact`,
          impact,
          proposedChanges: [],
          canAutoApply: true,
          confidence: 90,
        };

        expect(suggestion.impact).toBe(impact);
      });
    });
  });

  describe('IConstraintValidationResult Type Safety', () => {
    it('should create complete validation result', () => {
      const violation: IConstraintViolation = {
        id: 'violation-1',
        constraintId: 'constraint-1',
        constraintName: 'Test Constraint',
        violationType: ConstraintType.MAX_DURATION,
        severity: ViolationSeverity.WARNING,
        message: 'Test violation',
        description: 'Test violation description',
        affectedTaskIds: ['task-1'],
        currentValue: 45,
        expectedValue: 30,
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

      const result: IConstraintValidationResult = {
        isValid: false,
        totalConstraints: 5,
        violationCount: 1,
        criticalViolations: [],
        errorViolations: [],
        warningViolations: [violation],
        infoViolations: [],
        validationDuration: 250,
        suggestionsGenerated: 1,
        autoFixable: 0,
        context: {
          projectId: 'project-1',
          calculatedAt: new Date(),
          engineVersion: '1.0.0',
          taskCount: 10,
          dependencyCount: 5,
          userTriggered: true,
          batchValidation: true,
        },
      };

      expect(result.isValid).toBe(false);
      expect(result.totalConstraints).toBe(5);
      expect(result.violationCount).toBe(1);
      expect(result.warningViolations).toHaveLength(1);
      expect(result.warningViolations[0].severity).toBe(
        ViolationSeverity.WARNING
      );
      expect(result.validationDuration).toBe(250);
      expect(result.context.batchValidation).toBe(true);
    });

    it('should categorize violations by severity correctly', () => {
      const violations: IConstraintViolation[] = [
        {
          id: 'critical-1',
          constraintId: 'constraint-1',
          constraintName: 'Critical Constraint',
          violationType: ConstraintType.MUST_FINISH_ON,
          severity: ViolationSeverity.CRITICAL,
          message: 'Critical violation',
          description: 'Critical violation description',
          affectedTaskIds: ['task-1'],
          currentValue: new Date('2025-02-01'),
          expectedValue: new Date('2025-01-31'),
          suggestions: [],
          detectedAt: new Date(),
          context: {
            projectId: 'project-1',
            calculatedAt: new Date(),
            engineVersion: '1.0.0',
            taskCount: 1,
            dependencyCount: 0,
            userTriggered: true,
            batchValidation: false,
          },
        },
        {
          id: 'error-1',
          constraintId: 'constraint-2',
          constraintName: 'Error Constraint',
          violationType: ConstraintType.START_NO_EARLIER_THAN,
          severity: ViolationSeverity.ERROR,
          message: 'Error violation',
          description: 'Error violation description',
          affectedTaskIds: ['task-2'],
          currentValue: new Date('2024-12-01'),
          expectedValue: new Date('2025-01-01'),
          suggestions: [],
          detectedAt: new Date(),
          context: {
            projectId: 'project-1',
            calculatedAt: new Date(),
            engineVersion: '1.0.0',
            taskCount: 1,
            dependencyCount: 0,
            userTriggered: true,
            batchValidation: false,
          },
        },
        {
          id: 'warning-1',
          constraintId: 'constraint-3',
          constraintName: 'Warning Constraint',
          violationType: ConstraintType.MAX_DURATION,
          severity: ViolationSeverity.WARNING,
          message: 'Warning violation',
          description: 'Warning violation description',
          affectedTaskIds: ['task-3'],
          currentValue: 35,
          expectedValue: 30,
          suggestions: [],
          detectedAt: new Date(),
          context: {
            projectId: 'project-1',
            calculatedAt: new Date(),
            engineVersion: '1.0.0',
            taskCount: 1,
            dependencyCount: 0,
            userTriggered: true,
            batchValidation: false,
          },
        },
        {
          id: 'info-1',
          constraintId: 'constraint-4',
          constraintName: 'Info Constraint',
          violationType: ConstraintType.PREFERRED_WORK_DAYS,
          severity: ViolationSeverity.INFO,
          message: 'Info violation',
          description: 'Info violation description',
          affectedTaskIds: ['task-4'],
          currentValue: 'Saturday',
          expectedValue: 'Monday-Friday',
          suggestions: [],
          detectedAt: new Date(),
          context: {
            projectId: 'project-1',
            calculatedAt: new Date(),
            engineVersion: '1.0.0',
            taskCount: 1,
            dependencyCount: 0,
            userTriggered: true,
            batchValidation: false,
          },
        },
      ];

      const result: IConstraintValidationResult = {
        isValid: false,
        totalConstraints: 4,
        violationCount: 4,
        criticalViolations: violations.filter(
          (v) => v.severity === ViolationSeverity.CRITICAL
        ),
        errorViolations: violations.filter(
          (v) => v.severity === ViolationSeverity.ERROR
        ),
        warningViolations: violations.filter(
          (v) => v.severity === ViolationSeverity.WARNING
        ),
        infoViolations: violations.filter(
          (v) => v.severity === ViolationSeverity.INFO
        ),
        validationDuration: 300,
        suggestionsGenerated: 0,
        autoFixable: 0,
        context: {
          projectId: 'project-1',
          calculatedAt: new Date(),
          engineVersion: '1.0.0',
          taskCount: 4,
          dependencyCount: 0,
          userTriggered: true,
          batchValidation: true,
        },
      };

      expect(result.criticalViolations).toHaveLength(1);
      expect(result.errorViolations).toHaveLength(1);
      expect(result.warningViolations).toHaveLength(1);
      expect(result.infoViolations).toHaveLength(1);

      expect(result.criticalViolations[0].id).toBe('critical-1');
      expect(result.errorViolations[0].id).toBe('error-1');
      expect(result.warningViolations[0].id).toBe('warning-1');
      expect(result.infoViolations[0].id).toBe('info-1');
    });
  });

  describe('Type Compatibility', () => {
    it('should maintain backward compatibility for constraint types', () => {
      // Ensure old constraint types are still supported
      const dateConstraintTypes = [
        ConstraintType.FINISH_NO_LATER_THAN,
        ConstraintType.START_NO_EARLIER_THAN,
        ConstraintType.MUST_FINISH_ON,
        ConstraintType.MUST_START_ON,
      ];

      dateConstraintTypes.forEach((type) => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });
    });

    it('should support constraint rule evolution', () => {
      // Test that constraint rules can be extended without breaking existing code
      const baseRule: IConstraintRule = {
        id: 'base-rule',
        name: 'Base Rule',
        description: 'Base constraint rule',
        type: ConstraintType.MAX_DURATION,
        category: ConstraintCategory.HARD,
        severity: ViolationSeverity.ERROR,
        scope: ConstraintScope.TASK,
        parameters: { maxDays: 30 },
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'user-1',
      };

      // Should be able to add new parameters without breaking existing code
      const extendedRule: IConstraintRule = {
        ...baseRule,
        id: 'extended-rule',
        parameters: {
          ...baseRule.parameters,
          newParameter: 'new-value',
          futureFlag: true,
        },
      };

      expect(extendedRule.parameters.maxDays).toBe(30);
      expect(extendedRule.parameters.newParameter).toBe('new-value');
      expect(extendedRule.parameters.futureFlag).toBe(true);
    });
  });
});
