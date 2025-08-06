"use strict";
/**
 * 📏 Clean Code Enforcement Policy for Copilot (AI Scheduler Project)
 *
 * 🚧 Source Code Files (e.g., `.ts`, `.tsx`, `.service.ts`)
 * - ✅ Prefer keeping files under 250 lines
 * - ✅ Accept up to 270 lines *if* modularity would reduce clarity
 * - ⚠️ Never exceed 300 lines in production code
 * - ❌ DO NOT delete comments, JSDoc, or interface definitions to shrink size
 * - ✅ INSTEAD: Modularize — extract functions, helpers, or subcomponents
 * - ✅ Preferred: Break down into smaller files, e.g. `*.utils.ts`, `*.helpers.ts`, `*.types.ts`
 * - ✅ Preserve readability, maintain SOLID principles
 *
 * 🧪 Test Files (e.g., `*.test.ts`)
 * - ✅ May exceed 250 lines due to test volume
 * - 🚫 DO NOT compress or remove test descriptions or documentation
 * - ✅ Prefer readable test sections and clear category headers
 * - ✅ Keep large test files well structured with comment dividers
 *
 * 💡 If line limit exceeded:
 * - Prompt: "Consider modularizing this file into [X] helper files"
 * - Suggest filenames (e.g., `FloatValidationUtils.ts`, `BatchProcessor.ts`)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskFlagAssigner = void 0;
const FloatUtils_1 = require("./utils/FloatUtils");
class TaskFlagAssigner {
    constructor(config) {
        this.flagConfig = {
            criticalThreshold: FloatUtils_1.DEFAULT_EPSILON,
            nearCriticalThreshold: 1.0,
            highFloatThreshold: 5.0,
            enableNearCriticalFlags: true,
            enableHighFloatFlags: true,
            enableCustomFlags: false,
            ...config,
        };
        this.epsilon = this.flagConfig.criticalThreshold;
    }
    assignAllFlags(tasks, criticalTaskIds = []) {
        const assignments = [];
        for (const task of tasks) {
            const taskFlags = this.assignTaskFlags(task, criticalTaskIds);
            assignments.push({
                taskId: task.id,
                flags: taskFlags,
                assignedAt: new Date(),
                isValid: this.validateTaskFlags(taskFlags).isValid,
            });
        }
        return assignments;
    }
    assignTaskFlags(task, criticalTaskIds = []) {
        const flags = [];
        const totalFloat = task.totalFloat || 0;
        const isCritical = this.isCritical(totalFloat);
        const isOnCriticalPath = criticalTaskIds.includes(task.id);
        if (isCritical || isOnCriticalPath) {
            flags.push(this.createFlag('CRITICAL', task.id, {
                floatValue: totalFloat,
                isCriticalPath: isOnCriticalPath,
            }));
        }
        if (this.flagConfig.enableNearCriticalFlags &&
            this.isNearCritical(totalFloat)) {
            flags.push(this.createFlag('NEAR_CRITICAL', task.id, {
                floatValue: totalFloat,
                threshold: this.flagConfig.nearCriticalThreshold,
            }));
        }
        if (this.flagConfig.enableHighFloatFlags && this.isHighFloat(totalFloat)) {
            flags.push(this.createFlag('HIGH_FLOAT', task.id, {
                floatValue: totalFloat,
                threshold: this.flagConfig.highFloatThreshold,
            }));
        }
        if ((0, FloatUtils_1.isFloatZero)(totalFloat, this.epsilon) && !isCritical) {
            flags.push(this.createFlag('ZERO_FLOAT', task.id, { floatValue: totalFloat }));
        }
        if (totalFloat < -this.epsilon) {
            flags.push(this.createFlag('NEGATIVE_FLOAT', task.id, {
                floatValue: totalFloat,
                severity: 'ERROR',
            }));
        }
        return flags;
    }
    updateTaskFlags(task, criticalTaskIds = []) {
        const flags = this.assignTaskFlags(task, criticalTaskIds);
        return {
            taskId: task.id,
            flags,
            assignedAt: new Date(),
            isValid: this.validateTaskFlags(flags).isValid,
        };
    }
    generateFlagSummary(assignments) {
        const flagCounts = new Map();
        let totalTasks = 0;
        let tasksWithFlags = 0;
        let invalidAssignments = 0;
        for (const assignment of assignments) {
            totalTasks++;
            if (assignment.flags.length > 0) {
                tasksWithFlags++;
            }
            if (!assignment.isValid) {
                invalidAssignments++;
            }
            for (const flag of assignment.flags) {
                const currentCount = flagCounts.get(flag.type) || 0;
                flagCounts.set(flag.type, currentCount + 1);
            }
        }
        const flagStatistics = Array.from(flagCounts.entries()).map(([type, count]) => ({
            flagType: type,
            count,
            percentage: Math.round((count / totalTasks) * 10000) / 100,
        }));
        return {
            totalTasks,
            tasksWithFlags,
            invalidAssignments,
            flagStatistics,
            generatedAt: new Date(),
        };
    }
    validateTaskFlags(flags) {
        const errors = [];
        const warnings = [];
        const hasNegativeFloat = flags.some((f) => f.type === 'NEGATIVE_FLOAT');
        const hasCritical = flags.some((f) => f.type === 'CRITICAL');
        const hasHighFloat = flags.some((f) => f.type === 'HIGH_FLOAT');
        if (hasNegativeFloat && hasCritical) {
            errors.push('Task cannot be both critical and have negative float');
        }
        if (hasCritical && hasHighFloat) {
            warnings.push('Critical task should not have high float flag');
        }
        const flagTypes = flags.map((f) => f.type);
        const uniqueTypes = new Set(flagTypes);
        if (flagTypes.length !== uniqueTypes.size) {
            warnings.push('Duplicate flag types detected');
        }
        for (const flag of flags) {
            if (!flag.taskId || flag.taskId.trim() === '') {
                errors.push(`Flag ${flag.type} has invalid task ID`);
            }
            if (flag.metadata?.floatValue !== undefined) {
                const floatValue = flag.metadata.floatValue;
                if (isNaN(floatValue)) {
                    errors.push(`Flag ${flag.type} has invalid float value`);
                }
            }
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    clearAllFlags(assignments) {
        return assignments.map((assignment) => ({
            ...assignment,
            flags: [],
            assignedAt: new Date(),
            isValid: true,
        }));
    }
    filterByFlagType(assignments, flagType) {
        return assignments.filter((assignment) => assignment.flags.some((flag) => flag.type === flagType));
    }
    isCritical(totalFloat) {
        return (0, FloatUtils_1.isFloatZero)(totalFloat, this.epsilon);
    }
    isNearCritical(totalFloat) {
        return (totalFloat > this.epsilon &&
            totalFloat <= this.flagConfig.nearCriticalThreshold);
    }
    isHighFloat(totalFloat) {
        return totalFloat > this.flagConfig.highFloatThreshold;
    }
    createFlag(type, taskId, metadata = {}) {
        return {
            id: `${type}_${taskId}_${Date.now()}`,
            type,
            taskId,
            description: this.getFlagDescription(type),
            severity: this.getFlagSeverity(type),
            metadata,
            createdAt: new Date(),
        };
    }
    getFlagDescription(type) {
        const descriptions = {
            CRITICAL: 'Task is on the critical path',
            NEAR_CRITICAL: 'Task has low total float',
            HIGH_FLOAT: 'Task has high total float',
            ZERO_FLOAT: 'Task has zero float but not critical',
            NEGATIVE_FLOAT: 'Task has negative float',
        };
        return descriptions[type] || 'Unknown flag type';
    }
    getFlagSeverity(type) {
        const severities = {
            CRITICAL: 'WARNING',
            NEAR_CRITICAL: 'INFO',
            HIGH_FLOAT: 'INFO',
            ZERO_FLOAT: 'WARNING',
            NEGATIVE_FLOAT: 'ERROR',
        };
        return severities[type] || 'INFO';
    }
}
exports.TaskFlagAssigner = TaskFlagAssigner;
