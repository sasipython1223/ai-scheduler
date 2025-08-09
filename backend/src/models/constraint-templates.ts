/**
 * Module 6.1: Constraint Templates
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Built-in constraint templates and template utilities
 * Dependencies: constraint-types.ts
 */

import {
  ConstraintCategory,
  ConstraintTemplate,
  ConstraintType,
  DateConstraintParams,
  DurationConstraintParams,
} from '../types/constraint-types.js';

/**
 * Built-in Constraint Templates
 */
export const BUILT_IN_TEMPLATES: ConstraintTemplate[] = [
  {
    id: 'finish-no-later-than-template',
    name: 'Finish No Later Than',
    description: 'Task must finish before or on a specific date',
    category: ConstraintCategory.SOFT,
    type: ConstraintType.FINISH_NO_LATER_THAN,
    defaultParameters: {
      targetDate: new Date(),
      tolerance: 86400000, // 1 day in milliseconds
    } as DateConstraintParams,
    requiredFields: ['targetDate'],
    optionalFields: ['tolerance'],
    isBuiltIn: true,
    usageCount: 0,
    tags: ['finish-date', 'deadline', 'soft'],
  },
  {
    id: 'start-no-earlier-than-template',
    name: 'Start No Earlier Than',
    description: 'Task cannot start before a specific date',
    category: ConstraintCategory.SOFT,
    type: ConstraintType.START_NO_EARLIER_THAN,
    defaultParameters: {
      targetDate: new Date(),
      tolerance: 0,
    } as DateConstraintParams,
    requiredFields: ['targetDate'],
    optionalFields: ['tolerance'],
    isBuiltIn: true,
    usageCount: 0,
    tags: ['start-date', 'earliest', 'soft'],
  },
  {
    id: 'min-duration-template',
    name: 'Minimum Duration',
    description: 'Task must have at least the specified duration',
    category: ConstraintCategory.SOFT,
    type: ConstraintType.MIN_DURATION,
    defaultParameters: {
      minDuration: 3600000, // 1 hour in milliseconds
      tolerance: 0,
      unit: 'HOURS',
    } as DurationConstraintParams,
    requiredFields: ['minDuration'],
    optionalFields: ['tolerance'],
    isBuiltIn: true,
    usageCount: 0,
    tags: ['duration', 'minimum', 'soft'],
  },
  {
    id: 'max-duration-template',
    name: 'Maximum Duration',
    description: 'Task must not exceed the specified duration',
    category: ConstraintCategory.SOFT,
    type: ConstraintType.MAX_DURATION,
    defaultParameters: {
      maxDuration: 28800000, // 8 hours in milliseconds
      tolerance: 3600000, // 1 hour tolerance
      unit: 'HOURS',
    } as DurationConstraintParams,
    requiredFields: ['maxDuration'],
    optionalFields: ['tolerance'],
    isBuiltIn: true,
    usageCount: 0,
    tags: ['duration', 'maximum', 'soft'],
  },
  {
    id: 'fixed-duration-template',
    name: 'Fixed Duration',
    description: 'Task must have exact duration',
    category: ConstraintCategory.HARD,
    type: ConstraintType.FIXED_DURATION,
    defaultParameters: {
      fixedDuration: 14400000, // 4 hours in milliseconds
      tolerance: 0,
      unit: 'HOURS',
    } as DurationConstraintParams,
    requiredFields: ['fixedDuration'],
    optionalFields: ['tolerance'],
    isBuiltIn: true,
    usageCount: 0,
    tags: ['duration', 'fixed', 'hard'],
  },
  {
    id: 'must-finish-on-template',
    name: 'Must Finish On',
    description: 'Task must finish on an exact date',
    category: ConstraintCategory.HARD,
    type: ConstraintType.MUST_FINISH_ON,
    defaultParameters: {
      targetDate: new Date(),
      tolerance: 0,
    } as DateConstraintParams,
    requiredFields: ['targetDate'],
    optionalFields: ['tolerance'],
    isBuiltIn: true,
    usageCount: 0,
    tags: ['finish-date', 'exact', 'hard'],
  },
  {
    id: 'must-start-on-template',
    name: 'Must Start On',
    description: 'Task must start on an exact date',
    category: ConstraintCategory.HARD,
    type: ConstraintType.MUST_START_ON,
    defaultParameters: {
      targetDate: new Date(),
      tolerance: 0,
    } as DateConstraintParams,
    requiredFields: ['targetDate'],
    optionalFields: ['tolerance'],
    isBuiltIn: true,
    usageCount: 0,
    tags: ['start-date', 'exact', 'hard'],
  },
];

/**
 * Template Helper Functions
 */
export class TemplateHelper {
  /**
   * Get template by ID
   */
  static getTemplate(id: string): ConstraintTemplate | undefined {
    return BUILT_IN_TEMPLATES.find((template) => template.id === id);
  }

  /**
   * Search templates by name or description
   */
  static searchTemplates(query: string): ConstraintTemplate[] {
    const searchTerm = query.toLowerCase();
    return BUILT_IN_TEMPLATES.filter(
      (template) =>
        template.name.toLowerCase().includes(searchTerm) ||
        template.description.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get templates by category
   */
  static getTemplatesByCategory(
    category: ConstraintCategory
  ): ConstraintTemplate[] {
    return BUILT_IN_TEMPLATES.filter(
      (template) => template.category === category
    );
  }

  /**
   * Get templates by type
   */
  static getTemplatesByType(type: ConstraintType): ConstraintTemplate[] {
    return BUILT_IN_TEMPLATES.filter((template) => template.type === type);
  }

  /**
   * Get templates by tags
   */
  static getTemplatesByTags(tags: string[]): ConstraintTemplate[] {
    return BUILT_IN_TEMPLATES.filter((template) =>
      tags.some((tag) => template.tags.includes(tag))
    );
  }

  /**
   * Get most used templates
   */
  static getMostUsedTemplates(limit: number = 5): ConstraintTemplate[] {
    return BUILT_IN_TEMPLATES.sort((a, b) => b.usageCount - a.usageCount).slice(
      0,
      limit
    );
  }
}
