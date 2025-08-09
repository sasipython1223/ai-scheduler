/**
 * Work Breakdown Structure (WBS) Types
 * AI Scheduler - Module 5.1: WBS Data Models
 */

// ============================================================================
// WBS (WORK BREAKDOWN STRUCTURE)
// ============================================================================

/**
 * Work Breakdown Structure hierarchy
 */
export interface WBSNode {
  code: string; // WBS code (e.g., "1.2.3")
  name: string; // WBS element name
  level: number; // hierarchy level (0 = project, 1 = phase, etc.)
  parentCode?: string; // parent WBS code
  children?: string[]; // child WBS codes
  taskIds?: string[]; // tasks assigned to this WBS element
}

/**
 * WBS hierarchy structure
 */
export interface WBSStructure {
  projectCode: string; // root WBS code
  nodes: Map<string, WBSNode>; // WBS code -> node mapping
  maxLevel: number; // deepest level in hierarchy
}
