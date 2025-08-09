/**
 * Module 6: Shared Constraint Types and Interfaces
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Central type definitions shared across all Module 6 submodules
 * Dependencies: None (base types only)
 */

/**
 * Core Constraint Classification
 */
export enum ConstraintType {
  // Date-based Constraints
  FINISH_NO_LATER_THAN = 'FINISH_NO_LATER_THAN',
  START_NO_EARLIER_THAN = 'START_NO_EARLIER_THAN',
  MUST_FINISH_ON = 'MUST_FINISH_ON',
  MUST_START_ON = 'MUST_START_ON',

  // Duration-based Constraints
  MIN_DURATION = 'MIN_DURATION',
  MAX_DURATION = 'MAX_DURATION',
  FIXED_DURATION = 'FIXED_DURATION',

  // Resource-based Constraints
  RESOURCE_AVAILABILITY = 'RESOURCE_AVAILABILITY',
  RESOURCE_CAPACITY = 'RESOURCE_CAPACITY',

  // Calendar-based Constraints
  WORK_CALENDAR_ONLY = 'WORK_CALENDAR_ONLY',
  EXCLUDE_HOLIDAYS = 'EXCLUDE_HOLIDAYS',
  PREFERRED_WORK_DAYS = 'PREFERRED_WORK_DAYS',

  // Logic-based Constraints
  MANDATORY_DEPENDENCY = 'MANDATORY_DEPENDENCY',
  FORBIDDEN_OVERLAP = 'FORBIDDEN_OVERLAP',

  // Business Rule Constraints
  PHASE_SEQUENCE = 'PHASE_SEQUENCE',
  MILESTONE_DEADLINE = 'MILESTONE_DEADLINE',
}

/**
 * Violation Severity Levels
 */
export enum ViolationSeverity {
  CRITICAL = 'CRITICAL', // Hard constraint - stops scheduling
  ERROR = 'ERROR', // Hard constraint - requires fix
  WARNING = 'WARNING', // Soft constraint - can proceed with warning
  INFO = 'INFO', // Informational - optimization suggestion
}

/**
 * Constraint Rule Category
 */
export enum ConstraintCategory {
  HARD = 'HARD', // Must be satisfied
  SOFT = 'SOFT', // Preferred but can be violated
  CALENDAR = 'CALENDAR', // Calendar-specific rules
}

/**
 * Constraint Target Scope
 */
export enum ConstraintScope {
  TASK = 'TASK', // Single task constraint
  PROJECT = 'PROJECT', // Project-level constraint
  PHASE = 'PHASE', // Phase/WBS constraint
  RESOURCE = 'RESOURCE', // Resource-specific constraint
}

/**
 * Base Task Interface for Constraint Validation
 */
export interface ITaskForValidation {
  id: string;
  name: string;
  startDate?: Date;
  finishDate?: Date;
  duration?: number;
  dependencies?: IDependency[];
  calendarId?: string;
  resourceAssignments?: string[];
  projectId: string;
  phaseId?: string;
}

/**
 * Dependency Interface
 */
export interface IDependency {
  predecessorId: string;
  successorId: string;
  type: 'FS' | 'SS' | 'FF' | 'SF';
  lag: number;
}

/**
 * Base Constraint Interface
 */
export interface IConstraintRule {
  id: string;
  name: string;
  description: string;
  type: ConstraintType;
  category: ConstraintCategory;
  severity: ViolationSeverity;
  scope: ConstraintScope;

  // Target identification
  targetTaskId?: string;
  targetTaskIds?: string[];
  targetPhaseId?: string;
  targetResourceId?: string;

  // Rule parameters (flexible)
  parameters: Record<string, string | number | boolean | Date | string[]>;

  // Metadata
  isActive: boolean;
  createdDate: Date;
  modifiedDate: Date;
  createdBy: string;
}

/**
 * Constraint Violation Result
 */
export interface IConstraintViolation {
  id: string;
  constraintId: string;
  constraintName: string;
  violationType: ConstraintType;
  severity: ViolationSeverity;

  // Violation details
  message: string;
  description: string;
  affectedTaskIds: string[];

  // Current vs expected values
  currentValue: string | number | Date | boolean;
  expectedValue: string | number | Date | boolean;
  variance?: number;

  // Resolution suggestions
  suggestions: IViolationSuggestion[];

  // Context
  detectedAt: Date;
  context: IViolationContext;
}

/**
 * Violation Resolution Suggestion
 */
export interface IViolationSuggestion {
  id: string;
  type:
    | 'ADJUST_DATE'
    | 'CHANGE_DURATION'
    | 'MODIFY_DEPENDENCY'
    | 'REASSIGN_RESOURCE'
    | 'IGNORE_CONSTRAINT';
  description: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';

  // Suggested changes
  proposedChanges: IProposedChange[];

  // Automation support
  canAutoApply: boolean;
  confidence: number; // 0-100%
}

/**
 * Proposed Change for Resolution
 */
export interface IProposedChange {
  taskId: string;
  field: string;
  currentValue: string | number | Date | boolean;
  proposedValue: string | number | Date | boolean;
}

/**
 * Violation Context Information
 */
export interface IViolationContext {
  scheduleCalculationId?: string;
  projectId: string;
  calculatedAt: Date;
  engineVersion: string;

  // Schedule state when violation detected
  taskCount: number;
  dependencyCount: number;
  criticalPathLength?: number;

  // Additional metadata
  userTriggered: boolean;
  batchValidation: boolean;
}

/**
 * Constraint Validation Result Summary
 */
export interface IConstraintValidationResult {
  isValid: boolean;
  totalConstraints: number;
  violationCount: number;

  // Violations by severity
  criticalViolations: IConstraintViolation[];
  errorViolations: IConstraintViolation[];
  warningViolations: IConstraintViolation[];
  infoViolations: IConstraintViolation[];

  // Summary metrics
  validationDuration: number; // milliseconds
  suggestionsGenerated: number;
  autoFixable: number;

  // Validation context
  context: IViolationContext;
}
