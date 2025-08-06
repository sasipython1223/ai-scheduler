/**
 * Module 5.4 - Flag Assignment Types
 * Purpose: Type definitions for task flag assignment and validation
 */

export interface FlagAssignmentResult {
  assignedTasks: string[];
  skippedTasks: string[];
  errorTasks: string[];
  totalProcessed: number;
  processingTime: number;
  validationResults: FlagValidationResult[];
}

export interface FlagValidationResult {
  taskId: string;
  isValid: boolean;
  violations: FlagViolation[];
  correctedFlags: Partial<TaskFlags>;
}

export interface FlagViolation {
  type:
    | 'INCONSISTENT_FLOAT'
    | 'INVALID_CRITICAL'
    | 'MISSING_DATA'
    | 'CONSTRAINT_VIOLATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  suggestedFix: string;
}

export interface TaskFlags {
  totalFloat: number;
  freeFloat: number;
  isCritical: boolean;
  criticalPathId?: string;
  floatRank: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface FlagUpdate {
  taskId: string;
  flags: Partial<TaskFlags>;
  updateReason: string;
  timestamp: Date;
}

export interface FlagAssignmentConfig {
  validateConsistency: boolean;
  autoCorrectViolations: boolean;
  requireCriticalPathId: boolean;
  epsilon: number;
  batchSize: number;
}

export interface BatchResult {
  batchId: string;
  processedCount: number;
  successCount: number;
  errorCount: number;
  processingTime: number;
  errors: BatchError[];
}

export interface BatchError {
  taskId: string;
  errorType: string;
  errorMessage: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface FlagConflict {
  taskId: string;
  conflictType: string;
  currentFlags: TaskFlags;
  expectedFlags: TaskFlags;
  resolution: string;
}

export interface FlagRepairResult {
  taskId: string;
  wasRepaired: boolean;
  originalFlags: TaskFlags;
  repairedFlags: TaskFlags;
  repairActions: string[];
}

export interface ConsistencyReport {
  totalTasks: number;
  validTasks: number;
  inconsistentTasks: number;
  violations: FlagViolation[];
  overallScore: number;
}

export interface UpdateResult {
  updatedTasks: string[];
  failedUpdates: string[];
  validationErrors: string[];
  processingTime: number;
}
