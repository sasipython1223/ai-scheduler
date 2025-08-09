/**
 * Schedule Calculation Results and Analysis Types
 * AI Scheduler - Module 5.1: Schedule Result Data Models
 */

import type { ScheduledTask } from './task.types.js';

// ============================================================================
// SCHEDULE COMPUTATION RESULTS
// ============================================================================

/**
 * Complete schedule calculation results
 */
export interface ScheduleResult {
  projectId: string;
  calculationId: string;
  timestamp: string;

  // Task Results
  tasks: ScheduledTask[];

  // Critical Path Analysis
  criticalPaths: CriticalPath[];
  projectDuration: number; // in working days

  // Schedule Statistics
  statistics: ScheduleStatistics;

  // Calculation Metadata
  metadata: CalculationMetadata;
}

/**
 * Critical path information
 */
export interface CriticalPath {
  id: string;
  name: string;
  taskIds: string[]; // ordered list of tasks on critical path
  duration: number; // total duration of critical path
  startDate: string; // project start date
  finishDate: string; // project finish date
}

/**
 * Schedule calculation statistics
 */
export interface ScheduleStatistics {
  totalTasks: number;
  criticalTasks: number;
  averageFloat: number;
  maxFloat: number;
  resourceUtilization?: number;
  scheduleHealth: 'GOOD' | 'WARNING' | 'CRITICAL';
}

/**
 * Calculation metadata for auditing
 */
export interface CalculationMetadata {
  algorithmVersion: string;
  calculationTime: number; // milliseconds
  inputValidation: ValidationResult[];
  warnings: string[];
  errors: string[];
}

/**
 * Validation result for input data
 */
export interface ValidationResult {
  field: string;
  isValid: boolean;
  message?: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}
