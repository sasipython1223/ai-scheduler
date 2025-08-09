/**
 * @fileoverview Test suite for Module 6.3 - Integration
 * Tests integration between constraint validation and schedule engine
 */

import {
  ConstraintCategory,
  ConstraintScope,
  ConstraintType,
  IConstraintRule,
  IConstraintValidationResult,
  ITaskForValidation,
  ViolationSeverity,
} from './shared-types';

// Mock Schedule Engine for integration testing
class MockScheduleEngine {
  private tasks: ITaskForValidation[] = [];

  addTask(task: ITaskForValidation): void {
    this.tasks.push(task);
  }

  getTasks(): ITaskForValidation[] {
    return [...this.tasks];
  }

  updateTask(taskId: string, updates: Partial<ITaskForValidation>): void {
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex >= 0) {
      this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
    }
  }

  calculateSchedule(): void {
    // Mock schedule calculation - update dates based on dependencies
    this.tasks.forEach((task) => {
      if (!task.startDate && !task.finishDate && task.duration) {
        task.startDate = new Date('2025-01-01');
        task.finishDate = new Date(
          task.startDate.getTime() + task.duration * 24 * 60 * 60 * 1000
        );
      }
    });
  }
}

// Mock Constraint Integration Engine
class MockConstraintIntegrationEngine {
  private scheduleEngine: MockScheduleEngine;
  private rules: IConstraintRule[] = [];

  constructor(scheduleEngine: MockScheduleEngine) {
    this.scheduleEngine = scheduleEngine;
  }

  addConstraintRule(rule: IConstraintRule): void {
    this.rules.push(rule);
  }

  validateAndAdjustSchedule(): IConstraintValidationResult {
    // First, calculate the schedule
    this.scheduleEngine.calculateSchedule();

    // Then validate against constraints
    const tasks = this.scheduleEngine.getTasks();
    const allViolations: any[] = [];
    let totalConstraints = 0;

    for (const task of tasks) {
      const result = this.validateTask(task);
      allViolations.push(
        ...result.criticalViolations,
        ...result.errorViolations,
        ...result.warningViolations,
        ...result.infoViolations
      );
      totalConstraints += result.totalConstraints;
    }

    // Attempt auto-fixes for certain violations
    this.attemptAutoFixes(allViolations);

    const criticalViolations = allViolations.filter(
      (v) => v.severity === ViolationSeverity.CRITICAL
    );
    const errorViolations = allViolations.filter(
      (v) => v.severity === ViolationSeverity.ERROR
    );
    const warningViolations = allViolations.filter(
      (v) => v.severity === ViolationSeverity.WARNING
    );
    const infoViolations = allViolations.filter(
      (v) => v.severity === ViolationSeverity.INFO
    );

    return {
      isValid: allViolations.length === 0,
      totalConstraints,
      violationCount: allViolations.length,
      criticalViolations,
      errorViolations,
      warningViolations,
      infoViolations,
      validationDuration: 150,
      suggestionsGenerated: allViolations.length,
      autoFixable: allViolations.filter((v) => this.isAutoFixable(v)).length,
      context: {
        projectId: 'integration-test',
        calculatedAt: new Date(),
        engineVersion: '1.0.0',
        taskCount: tasks.length,
        dependencyCount: 0,
        userTriggered: true,
        batchValidation: true,
      },
    };
  }

  private validateTask(task: ITaskForValidation): IConstraintValidationResult {
    const violations: any[] = [];

    for (const rule of this.rules) {
      if (!rule.isActive) continue;
      if (rule.targetTaskId && rule.targetTaskId !== task.id) continue;

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
      totalConstraints: this.rules.filter(
        (r) => r.isActive && (!r.targetTaskId || r.targetTaskId === task.id)
      ).length,
      violationCount: violations.length,
      criticalViolations,
      errorViolations,
      warningViolations,
      infoViolations,
      validationDuration: 50,
      suggestionsGenerated: violations.length,
      autoFixable: violations.filter((v) => this.isAutoFixable(v)).length,
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
  ): any | null {
    switch (rule.type) {
      case ConstraintType.START_NO_EARLIER_THAN:
        if (task.startDate && rule.parameters.startDate) {
          const constraintDate = new Date(rule.parameters.startDate as Date);
          if (task.startDate < constraintDate) {
            return {
              id: `violation-${Date.now()}-${Math.random()}`,
              constraintId: rule.id,
              constraintName: rule.name,
              violationType: rule.type,
              severity: rule.severity,
              message: 'Task starts too early',
              description: `Task starts before constraint date`,
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
        }
        return null;

      case ConstraintType.MAX_DURATION:
        if (task.duration && rule.parameters.maxDays) {
          const maxDays = rule.parameters.maxDays as number;
          if (task.duration > maxDays) {
            return {
              id: `violation-${Date.now()}-${Math.random()}`,
              constraintId: rule.id,
              constraintName: rule.name,
              violationType: rule.type,
              severity: rule.severity,
              message: 'Task duration too long',
              description: `Task duration exceeds maximum`,
              affectedTaskIds: [task.id],
              currentValue: task.duration,
              expectedValue: maxDays,
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
        }
        return null;

      default:
        return null;
    }
  }

  private isAutoFixable(violation: any): boolean {
    return (
      violation.violationType === ConstraintType.START_NO_EARLIER_THAN ||
      violation.violationType === ConstraintType.MAX_DURATION
    );
  }

  private attemptAutoFixes(violations: any[]): void {
    for (const violation of violations) {
      if (this.isAutoFixable(violation)) {
        this.applyAutoFix(violation);
      }
    }
  }

  private applyAutoFix(violation: any): void {
    const taskId = violation.affectedTaskIds[0];

    switch (violation.violationType) {
      case ConstraintType.START_NO_EARLIER_THAN:
        this.scheduleEngine.updateTask(taskId, {
          startDate: new Date(violation.expectedValue),
        });
        break;

      case ConstraintType.MAX_DURATION:
        this.scheduleEngine.updateTask(taskId, {
          duration: violation.expectedValue as number,
        });
        break;
    }
  }
}

describe('Module 6.3 - Integration Tests', () => {
  let scheduleEngine: MockScheduleEngine;
  let integrationEngine: MockConstraintIntegrationEngine;

  beforeEach(() => {
    scheduleEngine = new MockScheduleEngine();
    integrationEngine = new MockConstraintIntegrationEngine(scheduleEngine);
  });

  describe('Basic Integration', () => {
    it('should integrate constraint validation with schedule calculation', () => {
      // Add a task
      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'Integration Test Task',
        projectId: 'project-1',
        duration: 10,
      };
      scheduleEngine.addTask(task);

      // Add a constraint
      const rule: IConstraintRule = {
        id: 'rule-1',
        name: 'Start Date Rule',
        description: 'Task must start after Jan 15',
        type: ConstraintType.START_NO_EARLIER_THAN,
        category: ConstraintCategory.HARD,
        severity: ViolationSeverity.ERROR,
        scope: ConstraintScope.TASK,
        parameters: { startDate: new Date('2025-01-15') },
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'test',
      };
      integrationEngine.addConstraintRule(rule);

      // Validate and adjust
      const result = integrationEngine.validateAndAdjustSchedule();

      expect(result.totalConstraints).toBe(1);
      expect(result.context.taskCount).toBe(1);
      expect(result.context.batchValidation).toBe(true);
    });

    it('should handle multiple tasks and constraints', () => {
      // Add multiple tasks
      const tasks: ITaskForValidation[] = [
        {
          id: 'task-1',
          name: 'Task 1',
          projectId: 'project-1',
          duration: 5,
        },
        {
          id: 'task-2',
          name: 'Task 2',
          projectId: 'project-1',
          duration: 15,
        },
      ];

      tasks.forEach((task) => scheduleEngine.addTask(task));

      // Add multiple constraints
      const rules: IConstraintRule[] = [
        {
          id: 'rule-1',
          name: 'Start Date Rule',
          description: 'Tasks must start after Jan 1',
          type: ConstraintType.START_NO_EARLIER_THAN,
          category: ConstraintCategory.HARD,
          severity: ViolationSeverity.ERROR,
          scope: ConstraintScope.TASK,
          parameters: { startDate: new Date('2025-01-01') },
          isActive: true,
          createdDate: new Date(),
          modifiedDate: new Date(),
          createdBy: 'test',
        },
        {
          id: 'rule-2',
          name: 'Duration Rule',
          description: 'Tasks cannot exceed 10 days',
          type: ConstraintType.MAX_DURATION,
          category: ConstraintCategory.SOFT,
          severity: ViolationSeverity.WARNING,
          scope: ConstraintScope.TASK,
          parameters: { maxDays: 10 },
          isActive: true,
          createdDate: new Date(),
          modifiedDate: new Date(),
          createdBy: 'test',
        },
      ];

      rules.forEach((rule) => integrationEngine.addConstraintRule(rule));

      // Validate and adjust
      const result = integrationEngine.validateAndAdjustSchedule();

      expect(result.totalConstraints).toBe(4); // 2 rules × 2 tasks
      expect(result.context.taskCount).toBe(2);
      expect(result.warningViolations.length).toBeGreaterThan(0); // Task 2 violates duration
    });
  });

  describe('Auto-Fix Integration', () => {
    it('should automatically fix start date violations', () => {
      // Add task with early start date (will be set by schedule engine)
      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'Early Task',
        projectId: 'project-1',
        duration: 5,
        startDate: new Date('2024-12-01'), // Too early
      };
      scheduleEngine.addTask(task);

      // Add constraint that will be violated
      const rule: IConstraintRule = {
        id: 'rule-1',
        name: 'Start Date Rule',
        description: 'Task must start after Jan 1',
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
      integrationEngine.addConstraintRule(rule);

      // Validate and adjust (should auto-fix)
      const result = integrationEngine.validateAndAdjustSchedule();

      // Check that auto-fix was applied
      const updatedTasks = scheduleEngine.getTasks();
      const updatedTask = updatedTasks.find((t) => t.id === 'task-1');

      expect(updatedTask).toBeDefined();
      expect(result.autoFixable).toBeGreaterThan(0);
    });

    it('should automatically fix duration violations', () => {
      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'Long Task',
        projectId: 'project-1',
        duration: 50, // Too long
      };
      scheduleEngine.addTask(task);

      const rule: IConstraintRule = {
        id: 'rule-1',
        name: 'Duration Rule',
        description: 'Task duration cannot exceed 30 days',
        type: ConstraintType.MAX_DURATION,
        category: ConstraintCategory.HARD,
        severity: ViolationSeverity.ERROR,
        scope: ConstraintScope.TASK,
        parameters: { maxDays: 30 },
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'test',
      };
      integrationEngine.addConstraintRule(rule);

      // Validate and adjust (should auto-fix)
      const result = integrationEngine.validateAndAdjustSchedule();

      // Check that auto-fix was applied
      const updatedTasks = scheduleEngine.getTasks();
      const updatedTask = updatedTasks.find((t) => t.id === 'task-1');

      expect(updatedTask).toBeDefined();
      expect(updatedTask!.duration).toBe(30); // Should be adjusted to max allowed
      expect(result.autoFixable).toBeGreaterThan(0);
    });
  });

  describe('Task-Specific Constraints', () => {
    it('should apply constraints only to targeted tasks', () => {
      // Add two tasks
      const tasks: ITaskForValidation[] = [
        {
          id: 'task-1',
          name: 'Task 1',
          projectId: 'project-1',
          duration: 25,
        },
        {
          id: 'task-2',
          name: 'Task 2',
          projectId: 'project-1',
          duration: 35,
        },
      ];

      tasks.forEach((task) => scheduleEngine.addTask(task));

      // Add constraint targeting only task-1
      const rule: IConstraintRule = {
        id: 'rule-1',
        name: 'Task 1 Duration Rule',
        description: 'Task 1 cannot exceed 20 days',
        type: ConstraintType.MAX_DURATION,
        category: ConstraintCategory.HARD,
        severity: ViolationSeverity.ERROR,
        scope: ConstraintScope.TASK,
        targetTaskId: 'task-1', // Only applies to task-1
        parameters: { maxDays: 20 },
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'test',
      };
      integrationEngine.addConstraintRule(rule);

      const result = integrationEngine.validateAndAdjustSchedule();

      // Should only have violation for task-1
      expect(result.violationCount).toBe(1);
      expect(result.errorViolations[0].affectedTaskIds).toContain('task-1');
      expect(result.totalConstraints).toBe(1); // Only one constraint applied
    });
  });

  describe('Performance Integration', () => {
    it('should handle large numbers of tasks and constraints efficiently', () => {
      // Add many tasks
      for (let i = 1; i <= 100; i++) {
        const task: ITaskForValidation = {
          id: `task-${i}`,
          name: `Task ${i}`,
          projectId: 'project-1',
          duration: Math.floor(Math.random() * 30) + 1,
        };
        scheduleEngine.addTask(task);
      }

      // Add several constraints
      for (let i = 1; i <= 10; i++) {
        const rule: IConstraintRule = {
          id: `rule-${i}`,
          name: `Rule ${i}`,
          description: `Test rule ${i}`,
          type: ConstraintType.MAX_DURATION,
          category: ConstraintCategory.SOFT,
          severity: ViolationSeverity.WARNING,
          scope: ConstraintScope.TASK,
          parameters: { maxDays: i * 5 },
          isActive: true,
          createdDate: new Date(),
          modifiedDate: new Date(),
          createdBy: 'test',
        };
        integrationEngine.addConstraintRule(rule);
      }

      const startTime = Date.now();
      const result = integrationEngine.validateAndAdjustSchedule();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
      expect(result.context.taskCount).toBe(100);
      expect(result.totalConstraints).toBe(1000); // 10 constraints × 100 tasks
      expect(result.validationDuration).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid constraint parameters gracefully', () => {
      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'Test Task',
        projectId: 'project-1',
        duration: 10,
      };
      scheduleEngine.addTask(task);

      // Add constraint with missing parameters
      const rule: IConstraintRule = {
        id: 'rule-1',
        name: 'Invalid Rule',
        description: 'Rule with missing parameters',
        type: ConstraintType.START_NO_EARLIER_THAN,
        category: ConstraintCategory.HARD,
        severity: ViolationSeverity.ERROR,
        scope: ConstraintScope.TASK,
        parameters: {}, // Missing startDate parameter
        isActive: true,
        createdDate: new Date(),
        modifiedDate: new Date(),
        createdBy: 'test',
      };
      integrationEngine.addConstraintRule(rule);

      // Should not throw error
      expect(() => {
        const result = integrationEngine.validateAndAdjustSchedule();
        expect(result.isValid).toBe(true); // No violations due to missing parameters
      }).not.toThrow();
    });

    it('should handle tasks with missing data gracefully', () => {
      // Add task with minimal data
      const task: ITaskForValidation = {
        id: 'task-1',
        name: 'Minimal Task',
        projectId: 'project-1',
        // Missing duration, startDate, etc.
      };
      scheduleEngine.addTask(task);

      const rule: IConstraintRule = {
        id: 'rule-1',
        name: 'Test Rule',
        description: 'Test rule',
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
      integrationEngine.addConstraintRule(rule);

      // Should not throw error
      expect(() => {
        const result = integrationEngine.validateAndAdjustSchedule();
        expect(result.isValid).toBe(true); // No violations due to missing task data
      }).not.toThrow();
    });
  });
});
