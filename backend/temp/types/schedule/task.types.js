"use strict";
/**
 * Task-related Types and Interfaces
 * AI Scheduler - Module 5.1: Task Data Models
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstraintType = exports.TaskStatus = exports.TaskPriority = void 0;
// ============================================================================
// TASK ENUMS & SUPPORTING TYPES
// ============================================================================
/**
 * Task priority levels
 */
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "LOW";
    TaskPriority["MEDIUM"] = "MEDIUM";
    TaskPriority["HIGH"] = "HIGH";
    TaskPriority["CRITICAL"] = "CRITICAL";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
/**
 * Task execution status
 */
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["NOT_STARTED"] = "NOT_STARTED";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["COMPLETED"] = "COMPLETED";
    TaskStatus["PAUSED"] = "PAUSED";
    TaskStatus["CANCELLED"] = "CANCELLED";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
/**
 * Constraint types
 */
var ConstraintType;
(function (ConstraintType) {
    // Date Constraints
    ConstraintType["START_NO_EARLIER_THAN"] = "START_NO_EARLIER_THAN";
    ConstraintType["START_NO_LATER_THAN"] = "START_NO_LATER_THAN";
    ConstraintType["FINISH_NO_EARLIER_THAN"] = "FINISH_NO_EARLIER_THAN";
    ConstraintType["FINISH_NO_LATER_THAN"] = "FINISH_NO_LATER_THAN";
    ConstraintType["MUST_START_ON"] = "MUST_START_ON";
    ConstraintType["MUST_FINISH_ON"] = "MUST_FINISH_ON";
    // Resource Constraints
    ConstraintType["RESOURCE_AVAILABLE"] = "RESOURCE_AVAILABLE";
    ConstraintType["MAX_RESOURCES"] = "MAX_RESOURCES";
    // Logical Constraints
    ConstraintType["MANDATORY_DEPENDENCY"] = "MANDATORY_DEPENDENCY";
    ConstraintType["PREFERRED_DEPENDENCY"] = "PREFERRED_DEPENDENCY";
})(ConstraintType || (exports.ConstraintType = ConstraintType = {}));
