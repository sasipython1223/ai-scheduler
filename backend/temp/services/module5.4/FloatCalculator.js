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
exports.FloatCalculator = void 0;
const CriticalPathUtils_1 = require("./utils/CriticalPathUtils");
const FloatUtils_1 = require("./utils/FloatUtils");
/**
 * Enhanced FloatCalculator with modular design and precision handling
 */
class FloatCalculator {
    constructor(precisionConfig) {
        this.precisionConfig = {
            epsilon: FloatUtils_1.DEFAULT_EPSILON,
            roundingDecimals: 3,
            validateConsistency: true,
            ...precisionConfig,
        };
        this.epsilon = this.precisionConfig.epsilon;
    }
    /**
     * Calculates total float for a single task
     * @param task Task with early and late dates
     * @returns Total float in working days
     */
    calculateTotalFloat(task) {
        if (!task.earlyStart || !task.lateStart) {
            throw new Error(`Task ${task.id}: Missing required dates for total float calculation`);
        }
        const earlyStartTime = task.earlyStart.getTime();
        const lateStartTime = task.lateStart.getTime();
        // Convert milliseconds to days
        const floatDays = (lateStartTime - earlyStartTime) / (1000 * 60 * 60 * 24);
        return (0, FloatUtils_1.roundFloat)(floatDays, this.precisionConfig.roundingDecimals);
    }
    /**
     * Calculates free float for a single task
     * @param task Task to calculate free float for
     * @param successors Array of successor tasks
     * @param dependencies Array of logic links for lag calculation
     * @returns Free float in working days
     */
    calculateFreeFloat(task, successors, dependencies = []) {
        if (!task.earlyFinish) {
            throw new Error(`Task ${task.id}: Missing earlyFinish date for free float calculation`);
        }
        // If task has no successors, free float equals total float
        if (successors.length === 0) {
            return task.totalFloat || this.calculateTotalFloat(task);
        }
        const freeFloatValues = [];
        successors.forEach((successor) => {
            if (!successor.earlyStart) {
                return; // Skip successors without early start dates
            }
            // Find lag for this specific dependency
            const dependency = dependencies.find((dep) => dep.from === task.id && dep.to === successor.id);
            const lag = dependency?.lag || 0;
            // Calculate free float for this successor relationship
            const taskFinishTime = task.earlyFinish.getTime();
            const successorStartTime = successor.earlyStart.getTime();
            const floatDays = (successorStartTime - taskFinishTime) / (1000 * 60 * 60 * 24) - lag;
            freeFloatValues.push(floatDays);
        });
        // Free float is the minimum of all successor relationships
        const freeFloat = (0, FloatUtils_1.getMinFloat)(freeFloatValues);
        // Ensure free float doesn't exceed total float
        const totalFloat = task.totalFloat || this.calculateTotalFloat(task);
        const constrainedFreeFloat = Math.min(freeFloat, totalFloat);
        return (0, FloatUtils_1.roundFloat)(Math.max(0, constrainedFreeFloat), this.precisionConfig.roundingDecimals);
    }
    /**
     * Performs batch float calculation for an array of tasks
     * @param tasks Array of tasks to process
     * @param dependencies Array of logic links
     * @returns Batch processing result
     */
    calculateBatchFloat(tasks, dependencies = []) {
        const startTime = Date.now();
        const processedTasks = [];
        const errors = [];
        let successCount = 0;
        let errorCount = 0;
        // Build dependency map for efficient successor lookup
        const { successors } = (0, CriticalPathUtils_1.buildDependencyMap)(dependencies);
        tasks.forEach((task) => {
            try {
                // Calculate total float
                const totalFloat = this.calculateTotalFloat(task);
                // Find successor tasks
                const successorIds = successors.get(task.id) || [];
                const successorTasks = tasks.filter((t) => successorIds.includes(t.id));
                // Calculate free float
                const freeFloat = this.calculateFreeFloat(task, successorTasks, dependencies);
                // Validate float relationship
                if (!(0, FloatUtils_1.validateFloatRelationship)(totalFloat, freeFloat, this.epsilon)) {
                    errors.push(`Task ${task.id}: Invalid float relationship - free float exceeds total float`);
                    errorCount++;
                    return;
                }
                // Create float data
                const floatData = {
                    taskId: task.id,
                    totalFloat,
                    freeFloat,
                    floatRank: this.calculateFloatRank(totalFloat, tasks.length),
                    isNearCritical: (0, FloatUtils_1.isFloatZero)(totalFloat, this.epsilon * 3), // Near critical threshold
                    calculationMetadata: {
                        calculationMethod: 'enhanced_precision',
                        precision: this.epsilon,
                        validationPassed: true,
                        calculationTime: Date.now() - startTime,
                    },
                };
                processedTasks.push(floatData);
                successCount++;
            }
            catch (error) {
                errors.push(`Task ${task.id}: ${error.message}`);
                errorCount++;
            }
        });
        const totalProcessingTime = Date.now() - startTime;
        return {
            processedTasks,
            totalProcessingTime,
            successCount,
            errorCount,
            errors,
        };
    }
    /**
     * Validates float inputs for a task
     * @param task Task to validate
     * @returns Validation result
     */
    validateFloatInputs(task) {
        const errors = [];
        const warnings = [];
        // Basic validation
        if (!task.earlyStart) {
            errors.push(`Task ${task.id}: Missing earlyStart date`);
        }
        if (!task.earlyFinish) {
            errors.push(`Task ${task.id}: Missing earlyFinish date`);
        }
        if (!task.lateStart) {
            errors.push(`Task ${task.id}: Missing lateStart date`);
        }
        if (!task.lateFinish) {
            errors.push(`Task ${task.id}: Missing lateFinish date`);
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
    /**
     * Generates float metrics for a set of tasks
     * @param tasks Array of tasks with float data
     * @returns Float metrics
     */
    getFloatMetrics(tasks) {
        const totalFloats = tasks
            .map((task) => task.totalFloat || 0)
            .filter((float) => !isNaN(float));
        const criticalTasks = tasks.filter((task) => (0, FloatUtils_1.isFloatZero)(task.totalFloat || 0, this.epsilon)).length;
        const nearCriticalTasks = tasks.filter((task) => (0, FloatUtils_1.isFloatZero)(task.totalFloat || 0, this.epsilon * 3)).length;
        const averageFloat = (0, FloatUtils_1.getAverageFloat)(totalFloats);
        const variance = this.calculateVariance(totalFloats, averageFloat);
        return {
            totalTasks: tasks.length,
            criticalTasks,
            nearCriticalTasks,
            averageFloat: (0, FloatUtils_1.roundFloat)(averageFloat, this.precisionConfig.roundingDecimals),
            floatVariance: (0, FloatUtils_1.roundFloat)(variance, this.precisionConfig.roundingDecimals),
        };
    }
    /**
     * Calculates float rank for relative comparison
     * @param totalFloat Total float value
     * @param totalTasks Total number of tasks in project
     * @returns Float rank (0-100)
     */
    calculateFloatRank(totalFloat, _totalTasks) {
        // Simple ranking: tasks with less float get higher rank
        const maxRank = 100;
        const floatThreshold = 10; // Days
        if ((0, FloatUtils_1.isFloatZero)(totalFloat, this.epsilon)) {
            return maxRank; // Critical tasks get highest rank
        }
        const rank = Math.max(0, maxRank - (totalFloat / floatThreshold) * 20);
        return (0, FloatUtils_1.roundFloat)(rank, 0);
    }
    /**
     * Calculates variance for float distribution
     * @param values Array of float values
     * @param mean Mean value
     * @returns Variance
     */
    calculateVariance(values, mean) {
        if (values.length === 0)
            return 0;
        const squaredDifferences = values.map((value) => Math.pow(value - mean, 2));
        return (squaredDifferences.reduce((sum, diff) => sum + diff, 0) / values.length);
    }
}
exports.FloatCalculator = FloatCalculator;
