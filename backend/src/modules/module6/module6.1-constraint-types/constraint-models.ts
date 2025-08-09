/**
 * Module 6.1: Constraint Models Implementation
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Constraint model classes and factories
 * Dependencies: constraint-types.ts, shared-types.ts
 */

import {
  ConstraintCategory,
  ConstraintScope,
  ConstraintType,
  IConstraintRule,
  IConstraintViolation,
  ITaskForValidation,
  ViolationSeverity,
} from '../shared-types.js';

/**
 * Validation context for constraint checking
 */
export interface ValidationContext {
  task: ITaskForValidation;
  projectStartDate?: Date;
  projectFinishDate?: Date;
  allTasks?: ITaskForValidation[];
}

/**
 * Base constraint model class
 */
export abstract class BaseConstraintModel implements IConstraintRule {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly type: ConstraintType;
  public readonly category: ConstraintCategory;
  public readonly severity: ViolationSeverity;
  public readonly scope: ConstraintScope;
  public readonly parameters: Record<
    string,
    string | number | boolean | Date | string[]
  >;
  public readonly isActive: boolean;
  public readonly createdDate: Date;
  public readonly modifiedDate: Date;
  public readonly createdBy: string;
  public readonly targetTaskId?: string;
  public readonly targetTaskIds?: string[];
  public readonly targetPhaseId?: string;
  public readonly targetResourceId?: string;

  constructor(config: IConstraintRule) {
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
   * Abstract method for constraint-specific validation
   */
  abstract validate(context: ValidationContext): IConstraintViolation | null;

  /**
   * Check if this constraint applies to a given task
   */
  public appliesToTask(taskId: string): boolean {
    if (this.targetTaskId === taskId) return true;
    if (this.targetTaskIds?.includes(taskId)) return true;
    return false;
  }

  /**
   * Generate human-readable description
   */
  public getHumanDescription(): string {
    return this.description || `${this.type} constraint`;
  }
}

/**
 * Constraint collection manager
 */
export class ConstraintCollection {
  private constraints: Map<string, BaseConstraintModel> = new Map();

  constructor(constraints: BaseConstraintModel[] = []) {
    constraints.forEach((constraint) => this.add(constraint));
  }

  add(constraint: BaseConstraintModel): void {
    this.constraints.set(constraint.id, constraint);
  }

  remove(constraintId: string): boolean {
    return this.constraints.delete(constraintId);
  }

  get(constraintId: string): BaseConstraintModel | undefined {
    return this.constraints.get(constraintId);
  }

  getAll(): BaseConstraintModel[] {
    return Array.from(this.constraints.values());
  }

  getForTask(taskId: string): BaseConstraintModel[] {
    return this.getAll().filter(
      (constraint) => constraint.appliesToTask(taskId) && constraint.isActive
    );
  }

  getByCategory(category: ConstraintCategory): BaseConstraintModel[] {
    return this.getAll().filter(
      (constraint) => constraint.category === category && constraint.isActive
    );
  }

  getActiveCount(): number {
    return this.getAll().filter((constraint) => constraint.isActive).length;
  }
}
