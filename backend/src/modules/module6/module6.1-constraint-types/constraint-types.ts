/**
 * Module 6.1: Constraint Types Implementation
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Extended constraint type definitions and utilities
 * Dependencies: shared-types.ts
 */

import {
  ConstraintCategory,
  ConstraintType,
  IConstraintRule,
} from '../shared-types.js';

/**
 * Constraint parameter type definitions
 */
export interface DateConstraintParams {
  targetDate: Date;
  tolerance?: number; // Days
  timeZone?: string;
}

export interface DurationConstraintParams {
  minDuration?: number;
  maxDuration?: number;
  fixedDuration?: number;
  unit: 'DAYS' | 'HOURS' | 'WEEKS';
}

export interface ResourceConstraintParams {
  resourceId: string;
  maxCapacity?: number;
  availabilityWindow?: {
    startDate: Date;
    endDate: Date;
  };
  skillRequirements?: string[];
}

/**
 * Constraint template for reusable constraint definitions
 */
export interface IConstraintTemplate {
  id: string;
  name: string;
  description: string;
  category: ConstraintCategory;
  type: ConstraintType;
  defaultParameters: Record<
    string,
    string | number | boolean | Date | string[]
  >;
  requiredFields: string[];
  optionalFields: string[];
  isBuiltIn: boolean;
  usageCount: number;
  tags: string[];
}

/**
 * Type guards for constraint parameters
 */
export const isDateConstraint = (
  rule: IConstraintRule
): rule is IConstraintRule & { parameters: DateConstraintParams } => {
  return [
    ConstraintType.FINISH_NO_LATER_THAN,
    ConstraintType.START_NO_EARLIER_THAN,
    ConstraintType.MUST_FINISH_ON,
    ConstraintType.MUST_START_ON,
  ].includes(rule.type);
};

export const isDurationConstraint = (
  rule: IConstraintRule
): rule is IConstraintRule & { parameters: DurationConstraintParams } => {
  return [
    ConstraintType.MIN_DURATION,
    ConstraintType.MAX_DURATION,
    ConstraintType.FIXED_DURATION,
  ].includes(rule.type);
};

export const isResourceConstraint = (
  rule: IConstraintRule
): rule is IConstraintRule & { parameters: ResourceConstraintParams } => {
  return [
    ConstraintType.RESOURCE_AVAILABILITY,
    ConstraintType.RESOURCE_CAPACITY,
  ].includes(rule.type);
};

/**
 * Built-in constraint templates
 */
export const BUILT_IN_CONSTRAINT_TEMPLATES: IConstraintTemplate[] = [
  {
    id: 'finish-no-later-than-template',
    name: 'Finish No Later Than',
    description: 'Task must finish by a specific date',
    category: ConstraintCategory.HARD,
    type: ConstraintType.FINISH_NO_LATER_THAN,
    defaultParameters: {
      targetDate: new Date(),
      tolerance: 0,
    },
    requiredFields: ['targetDate'],
    optionalFields: ['tolerance', 'timeZone'],
    isBuiltIn: true,
    usageCount: 0,
    tags: ['deadline', 'date', 'hard'],
  },
  {
    id: 'fixed-duration-template',
    name: 'Fixed Duration',
    description: 'Task must have an exact duration',
    category: ConstraintCategory.HARD,
    type: ConstraintType.FIXED_DURATION,
    defaultParameters: {
      fixedDuration: 5,
      unit: 'DAYS',
    },
    requiredFields: ['fixedDuration', 'unit'],
    optionalFields: [],
    isBuiltIn: true,
    usageCount: 0,
    tags: ['duration', 'fixed', 'hard'],
  },
];

// Re-export shared types
export * from '../shared-types.js';
