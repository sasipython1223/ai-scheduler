/**
 * Logic Link Model
 * AI Scheduler - Module 5.1: Logic Relationship Management
 *
 * Logic relationship types (FS, SS, FF, SF) and validation
 */

import {
  LogicLink,
  LogicType,
  ValidationResult,
} from '../../types/scheduleTypes';

/**
 * Logic link model with relationship validation
 */
export class LogicLinkModel {
  constructor(private linkData: LogicLink) {
    // Constructor doesn't throw - allows for validation testing
  }

  /**
   * Validate logic link data
   */
  public validate(): ValidationResult[] {
    return validateLogicLink(this.linkData);
  }

  /**
   * Validate link type
   */
  private isValidLinkType(type: string): boolean {
    return ['FS', 'SS', 'FF', 'SF'].includes(type);
  }

  /**
   * Get link data (immutable copy)
   */
  public getData(): LogicLink {
    return { ...this.linkData };
  }

  /**
   * Get predecessor task ID
   */
  public getPredecessor(): string {
    return this.linkData.from;
  }

  /**
   * Get successor task ID
   */
  public getSuccessor(): string {
    return this.linkData.to;
  }

  /**
   * Get link type
   */
  public getLinkType(): LogicType {
    return this.linkData.type;
  }

  /**
   * Get lag value
   */
  public getLag(): number {
    return this.linkData.lag || 0;
  }

  /**
   * Check if link is Finish-to-Start
   */
  public isFinishToStart(): boolean {
    return this.linkData.type === 'FS';
  }

  /**
   * Check if link is Start-to-Start
   */
  public isStartToStart(): boolean {
    return this.linkData.type === 'SS';
  }

  /**
   * Check if link is Finish-to-Finish
   */
  public isFinishToFinish(): boolean {
    return this.linkData.type === 'FF';
  }

  /**
   * Check if link is Start-to-Finish
   */
  public isStartToFinish(): boolean {
    return this.linkData.type === 'SF';
  }
}

/**
 * Logic link utility functions
 */
export function validateLogicLink(linkData: LogicLink): ValidationResult[] {
  const results: ValidationResult[] = [];

  if (!linkData.from?.trim()) {
    results.push({
      field: 'from',
      isValid: false,
      message: 'Predecessor task ID is required',
      severity: 'ERROR',
    });
  }

  if (!linkData.to?.trim()) {
    results.push({
      field: 'to',
      isValid: false,
      message: 'Successor task ID is required',
      severity: 'ERROR',
    });
  }

  // Only check self-referencing if both fields have values
  if (
    linkData.from?.trim() &&
    linkData.to?.trim() &&
    linkData.from === linkData.to
  ) {
    results.push({
      field: 'to',
      isValid: false,
      message: 'Task cannot be linked to itself',
      severity: 'ERROR',
    });
  }

  const validTypes: LogicType[] = ['FS', 'SS', 'FF', 'SF'];
  if (!validTypes.includes(linkData.type)) {
    results.push({
      field: 'type',
      isValid: false,
      message: 'Logic type must be FS, SS, FF, or SF',
      severity: 'ERROR',
    });
  }

  return results;
}

export function createLogicLink(linkData: LogicLink): LogicLinkModel {
  const validationResults = validateLogicLink(linkData);
  const errors = validationResults.filter((r) => !r.isValid);
  if (errors.length > 0) {
    throw new Error(
      `Logic link validation failed: ${errors.map((e) => e.message).join(', ')}`
    );
  }
  return new LogicLinkModel(linkData);
}
