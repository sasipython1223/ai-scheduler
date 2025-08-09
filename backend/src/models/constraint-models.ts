/**
 * Module 6.1: Core Constraint Models
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Base constraint classes and interfaces
 * Dependencies: constraint-types.ts
 */

import {
  ConstraintCategory,
  ConstraintParameters,
  ConstraintRule,
  ConstraintScope,
  ConstraintType,
  ConstraintViolation,
  ViolationContext,
  ViolationSeverity,
  ViolationSuggestion,
} from '../types/constraint-types.js';

/**
 * Base Constraint Model Class
 */
export abstract class BaseConstraint implements ConstraintRule {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly type: ConstraintType;
  public readonly category: ConstraintCategory;
  public readonly severity: ViolationSeverity;
  public readonly scope: ConstraintScope;
  public readonly parameters: ConstraintParameters;
  public readonly isActive: boolean;
  public readonly createdDate: Date;
  public readonly modifiedDate: Date;
  public readonly createdBy: string;

  // Optional targeting
  public readonly targetTaskId?: string;
  public readonly targetTaskIds?: string[];
  public readonly targetPhaseId?: string;
  public readonly targetResourceId?: string;

  constructor(config: ConstraintRule) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.type = config.type;
    this.category = config.category;
    this.severity = config.severity;
    this.scope = config.scope;
    this.parameters = config.parameters;
    this.isActive = config.isActive;
    this.createdDate = config.createdDate;
    this.modifiedDate = config.modifiedDate;
    this.createdBy = config.createdBy;
    this.targetTaskId = config.targetTaskId;
    this.targetTaskIds = config.targetTaskIds;
    this.targetPhaseId = config.targetPhaseId;
    this.targetResourceId = config.targetResourceId;
  }

  /**
   * Abstract method for constraint-specific validation logic
   */
  abstract validate(context: ValidationContext): ConstraintViolation | null;

  /**
   * Check if this constraint applies to a given task
   */
  public appliesToTask(taskId: string): boolean {
    if (this.targetTaskId === taskId) return true;
    if (this.targetTaskIds?.includes(taskId)) return true;
    return false;
  }

  /**
   * Generate human-readable constraint description
   */
  public getHumanDescription(): string {
    return this.description || `${this.type} constraint for ${this.scope}`;
  }

  /**
   * Create standardized violation object
   */
  protected createViolation(
    message: string,
    currentValue: string | number | Date | boolean,
    expectedValue: string | number | Date | boolean,
    context: ValidationContext,
    suggestions: ViolationSuggestion[] = []
  ): ConstraintViolation {
    return {
      id: `violation-${this.id}-${Date.now()}`,
      constraintId: this.id,
      constraintName: this.name,
      violationType: this.type,
      severity: this.severity,
      message,
      description: this.description,
      affectedTaskIds: this.targetTaskId
        ? [this.targetTaskId]
        : this.targetTaskIds || [],
      currentValue,
      expectedValue,
      suggestions,
      detectedAt: new Date(),
      context: this.createViolationContext(context),
    };
  }

  /**
   * Create violation context
   */
  protected createViolationContext(
    context: ValidationContext
  ): ViolationContext {
    return {
      projectId: 'current-project',
      calculatedAt: new Date(),
      engineVersion: '6.1.0',
      taskCount: 1,
      dependencyCount: context.dependencies?.length || 0,
      userTriggered: true,
      batchValidation: false,
    };
  }
}

/**
 * Validation Context for Constraint Checking
 */
export interface ValidationContext {
  taskId?: string;
  currentStartDate?: Date;
  currentFinishDate?: Date;
  currentDuration?: number;
  projectStartDate?: Date;
  projectFinishDate?: Date;
  calendarId?: string;
  resourceAssignments?: string[];
  dependencies?: Array<{
    predecessorId: string;
    successorId: string;
    type: 'FS' | 'SS' | 'FF' | 'SF';
    lag: number;
  }>;
}

/**
 * Constraint Collection Manager
 */
export class ConstraintCollection {
  private constraints: Map<string, BaseConstraint> = new Map();

  constructor(constraints: BaseConstraint[] = []) {
    constraints.forEach((constraint) => this.add(constraint));
  }

  /**
   * Add constraint to collection
   */
  add(constraint: BaseConstraint): void {
    this.constraints.set(constraint.id, constraint);
  }

  /**
   * Remove constraint from collection
   */
  remove(constraintId: string): boolean {
    return this.constraints.delete(constraintId);
  }

  /**
   * Get constraint by ID
   */
  get(constraintId: string): BaseConstraint | undefined {
    return this.constraints.get(constraintId);
  }

  /**
   * Get all constraints
   */
  getAll(): BaseConstraint[] {
    return Array.from(this.constraints.values());
  }

  /**
   * Get constraints for specific task
   */
  getForTask(taskId: string): BaseConstraint[] {
    return this.getAll().filter(
      (constraint) => constraint.appliesToTask(taskId) && constraint.isActive
    );
  }

  /**
   * Get constraints by category
   */
  getByCategory(category: ConstraintCategory): BaseConstraint[] {
    return this.getAll().filter(
      (constraint) => constraint.category === category && constraint.isActive
    );
  }

  /**
   * Get constraints by severity
   */
  getBySeverity(severity: ViolationSeverity): BaseConstraint[] {
    return this.getAll().filter(
      (constraint) => constraint.severity === severity && constraint.isActive
    );
  }

  /**
   * Get active constraint count
   */
  getActiveCount(): number {
    return this.getAll().filter((constraint) => constraint.isActive).length;
  }
}
