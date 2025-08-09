/**
 * Module 6.1: Constraint Factory
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Main factory for creating constraints
 * Dependencies: constraint-types.ts, constraint-templates.ts, constraint-factory-utils.ts
 */

import {
  ConstraintRule,
  ConstraintTemplate,
  ConstraintType,
} from '../types/constraint-types.js';
import { ConstraintFactoryUtils } from './constraint-factory-utils.js';
import { BaseConstraint } from './constraint-models.js';
import { BUILT_IN_TEMPLATES, TemplateHelper } from './constraint-templates.js';
import type {
  QuickDateConstraintOptions,
  QuickDurationConstraintOptions,
} from './quick-constraint-creator.js';

/**
 * Main Constraint Factory Class
 */
export class ConstraintFactory {
  /**
   * Create constraint instance based on type
   */
  static createConstraint(config: ConstraintRule): BaseConstraint {
    return ConstraintFactoryUtils.createConstraintFromConfig(config);
  }

  /**
   * Create constraint from template
   */
  static createFromTemplate(
    template: ConstraintTemplate,
    overrides: Partial<ConstraintRule>
  ): BaseConstraint {
    const config: ConstraintRule = {
      id: overrides.id || `constraint-${Date.now()}`,
      name: overrides.name || template.name,
      description: overrides.description || template.description,
      type: template.type,
      category: template.category,
      severity:
        overrides.severity || template.category === 'HARD'
          ? 'ERROR'
          : 'WARNING',
      scope: overrides.scope || 'TASK',
      parameters: {
        ...template.defaultParameters,
        ...(overrides.parameters || {}),
      },
      isActive: overrides.isActive ?? true,
      createdDate: new Date(),
      modifiedDate: new Date(),
      createdBy: overrides.createdBy || 'system',
      ...overrides,
    } as ConstraintRule;

    return ConstraintFactory.createConstraint(config);
  }

  /**
   * Create quick date constraint
   */
  static createDateConstraint(
    type:
      | ConstraintType.FINISH_NO_LATER_THAN
      | ConstraintType.START_NO_EARLIER_THAN
      | ConstraintType.MUST_FINISH_ON
      | ConstraintType.MUST_START_ON,
    targetDate: Date,
    taskId: string,
    options: QuickDateConstraintOptions = {}
  ): BaseConstraint {
    return ConstraintFactoryUtils.createDateConstraint(
      type,
      targetDate,
      taskId,
      options
    );
  }

  /**
   * Create quick duration constraint
   */
  static createDurationConstraint(
    type:
      | ConstraintType.MIN_DURATION
      | ConstraintType.MAX_DURATION
      | ConstraintType.FIXED_DURATION,
    duration: number,
    taskId: string,
    options: QuickDurationConstraintOptions = {}
  ): BaseConstraint {
    return ConstraintFactoryUtils.createDurationConstraint(
      type,
      duration,
      taskId,
      options
    );
  }

  /**
   * Get built-in templates
   */
  static getBuiltInTemplates(): ConstraintTemplate[] {
    return BUILT_IN_TEMPLATES;
  }

  /**
   * Get template helper utilities
   */
  static getTemplateHelper(): typeof TemplateHelper {
    return TemplateHelper;
  }

  /**
   * Create multiple constraints from templates
   */
  static createFromTemplates(
    templateConfigs: Array<{
      templateId: string;
      overrides?: Partial<ConstraintRule>;
    }>
  ): BaseConstraint[] {
    return templateConfigs.map(({ templateId, overrides = {} }) => {
      const template = TemplateHelper.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }
      return this.createFromTemplate(template, overrides);
    });
  }

  /**
   * Create constraint with validation
   */
  static createWithValidation(config: ConstraintRule): BaseConstraint {
    const validation = ConstraintFactoryUtils.validateConstraintParameters(
      config.type,
      config.parameters as Record<string, unknown>
    );

    if (!validation.isValid) {
      throw new Error(
        `Invalid constraint parameters: ${validation.errors.join(', ')}`
      );
    }

    return this.createConstraint(config);
  }
}

// Re-export utilities for convenience
export { ConstraintFactoryUtils } from './constraint-factory-utils.js';
export { ConstraintParameterValidator } from './constraint-parameter-validator.js';
export { BUILT_IN_TEMPLATES, TemplateHelper } from './constraint-templates.js';
