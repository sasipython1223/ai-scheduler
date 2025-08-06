/**
 * Task-related Types and Interfaces
 * AI Scheduler - Module 5.1: Task Data Models
 */

// ============================================================================
// CORE TASK INTERFACES
// ============================================================================

/**
 * Raw task input from UI/API - user-provided data
 */
export interface TaskInput {
  id: string;
  name: string;
  duration: number; // in working days
  start?: string; // ISO string (optional - will be calculated)
  finish?: string; // ISO string (optional - will be calculated)
  wbs?: string; // Work Breakdown Structure code
  predecessors?: string[]; // list of task IDs
  resourceIds?: string[]; // assigned resources
  priority?: TaskPriority;
  constraints?: TaskConstraint[];
}

/**
 * Enhanced task with CPM calculation results
 */
export interface ScheduledTask extends TaskInput {
  // CPM Forward Pass Results
  earlyStart: string; // ISO string - calculated ES
  earlyFinish: string; // ISO string - calculated EF

  // CPM Backward Pass Results
  lateStart: string; // ISO string - calculated LS
  lateFinish: string; // ISO string - calculated LF

  // Float Calculations
  totalFloat: number; // LS - ES (in days)
  freeFloat: number; // minimum float to successors

  // Critical Path Analysis
  isCritical: boolean; // true if totalFloat === 0
  criticalPath?: string; // critical path identifier

  // Status and Progress
  status: TaskStatus;
  percentComplete?: number;
  actualStart?: string;
  actualFinish?: string;
}

// ============================================================================
// TASK ENUMS & SUPPORTING TYPES
// ============================================================================

/**
 * Task priority levels
 */
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Task execution status
 */
export enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
}

/**
 * Task constraints for schedule optimization
 */
export interface TaskConstraint {
  type: ConstraintType;
  date?: string; // for date-based constraints
  value?: number; // for numeric constraints
  description?: string;
}

/**
 * Constraint types
 */
export enum ConstraintType {
  // Date Constraints
  START_NO_EARLIER_THAN = 'START_NO_EARLIER_THAN',
  START_NO_LATER_THAN = 'START_NO_LATER_THAN',
  FINISH_NO_EARLIER_THAN = 'FINISH_NO_EARLIER_THAN',
  FINISH_NO_LATER_THAN = 'FINISH_NO_LATER_THAN',
  MUST_START_ON = 'MUST_START_ON',
  MUST_FINISH_ON = 'MUST_FINISH_ON',

  // Resource Constraints
  RESOURCE_AVAILABLE = 'RESOURCE_AVAILABLE',
  MAX_RESOURCES = 'MAX_RESOURCES',

  // Logical Constraints
  MANDATORY_DEPENDENCY = 'MANDATORY_DEPENDENCY',
  PREFERRED_DEPENDENCY = 'PREFERRED_DEPENDENCY',
}
