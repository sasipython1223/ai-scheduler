/**
 * Module 6.1: Constraint Types and Interfaces
 * Clean Architecture - AI Scheduler
 *
 * Purpose: Define constraint system types for schedule validation
 * Dependencies: schedule-types.ts
 */

/**
 * Constraint Type Classification
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
 * Core Constraint Rule Interface
 */
export interface ConstraintRule {
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

  // Rule parameters (flexible JSON)
  parameters: ConstraintParameters;

  // Metadata
  isActive: boolean;
  createdDate: Date;
  modifiedDate: Date;
  createdBy: string;
}

/**
 * Constraint Parameters (Type-safe union)
 */
export type ConstraintParameters =
  | DateConstraintParams
  | DurationConstraintParams
  | ResourceConstraintParams
  | CalendarConstraintParams
  | LogicConstraintParams
  | BusinessRuleParams;

/**
 * Date-based Constraint Parameters
 */
export interface DateConstraintParams {
  targetDate: Date;
  tolerance?: number; // Days
  timeZone?: string;
}

/**
 * Duration-based Constraint Parameters
 */
export interface DurationConstraintParams {
  minDuration?: number;
  maxDuration?: number;
  fixedDuration?: number;
  unit: 'DAYS' | 'HOURS' | 'WEEKS';
}

/**
 * Resource-based Constraint Parameters
 */
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
 * Calendar-based Constraint Parameters
 */
export interface CalendarConstraintParams {
  calendarId: string;
  workDaysOnly: boolean;
  excludeHolidays: boolean;
  preferredDays?: (
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY'
  )[];
  timeWindows?: {
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  }[];
}

/**
 * Logic-based Constraint Parameters
 */
export interface LogicConstraintParams {
  dependencyType: 'FS' | 'SS' | 'FF' | 'SF';
  mandatoryLag?: number;
  forbiddenOverlapDays?: number;
}

/**
 * Business Rule Constraint Parameters
 */
export interface BusinessRuleParams {
  phaseSequence?: string[];
  milestoneDeadline?: Date;
  businessRule?: string;
  customLogic?: string; // JavaScript expression for advanced rules
}

/**
 * Constraint Violation Result
 */
export interface ConstraintViolation {
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
  suggestions: ViolationSuggestion[];

  // Context
  detectedAt: Date;
  context: ViolationContext;
}

/**
 * Violation Resolution Suggestion
 */
export interface ViolationSuggestion {
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
  proposedChanges: {
    taskId: string;
    field: string;
    currentValue: string | number | Date | boolean;
    proposedValue: string | number | Date | boolean;
  }[];

  // Automation support
  canAutoApply: boolean;
  confidence: number; // 0-100%
}

/**
 * Violation Context Information
 */
export interface ViolationContext {
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
export interface ConstraintValidationResult {
  isValid: boolean;
  totalConstraints: number;
  violationCount: number;

  // Violations by severity
  criticalViolations: ConstraintViolation[];
  errorViolations: ConstraintViolation[];
  warningViolations: ConstraintViolation[];
  infoViolations: ConstraintViolation[];

  // Summary metrics
  validationDuration: number; // milliseconds
  suggestionsGenerated: number;
  autoFixable: number;

  // Validation context
  context: ViolationContext;
}

/**
 * Constraint Template for Common Rules
 */
export interface ConstraintTemplate {
  id: string;
  name: string;
  description: string;
  category: ConstraintCategory;
  type: ConstraintType;

  // Template parameters with defaults
  defaultParameters: ConstraintParameters;
  requiredFields: string[];
  optionalFields: string[];

  // Usage metadata
  isBuiltIn: boolean;
  usageCount: number;
  tags: string[];
}

/**
 * Export type guards for runtime type checking
 */
export const isDateConstraint = (
  params: ConstraintParameters
): params is DateConstraintParams => {
  return 'targetDate' in params;
};

export const isDurationConstraint = (
  params: ConstraintParameters
): params is DurationConstraintParams => {
  return 'unit' in params;
};

export const isResourceConstraint = (
  params: ConstraintParameters
): params is ResourceConstraintParams => {
  return 'resourceId' in params;
};

export const isCalendarConstraint = (
  params: ConstraintParameters
): params is CalendarConstraintParams => {
  return 'calendarId' in params;
};

export const isLogicConstraint = (
  params: ConstraintParameters
): params is LogicConstraintParams => {
  return 'dependencyType' in params;
};

export const isBusinessRuleConstraint = (
  params: ConstraintParameters
): params is BusinessRuleParams => {
  return 'businessRule' in params || 'phaseSequence' in params;
};
