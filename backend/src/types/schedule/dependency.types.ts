/**
 * Logic Link and Dependency Types
 * AI Scheduler - Module 5.1: Dependency Data Models
 */

// ============================================================================
// LOGIC RELATIONSHIPS & DEPENDENCIES
// ============================================================================

/**
 * Task dependency/logic link definition
 */
export interface LogicLink {
  id: string; // unique link identifier
  from: string; // predecessor task ID
  to: string; // successor task ID
  type: LogicType; // relationship type
  lag: number; // lag time in working days (can be negative for lead)
  description?: string; // optional description
}

/**
 * Logic relationship types (Project Management standard)
 */
export type LogicType =
  | 'FS' // Finish-to-Start (most common)
  | 'SS' // Start-to-Start
  | 'FF' // Finish-to-Finish
  | 'SF'; // Start-to-Finish (rare)
