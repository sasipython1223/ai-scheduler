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
exports.CriticalPathAnalyzer = void 0;
const CriticalPathHelpers_1 = require("./CriticalPathHelpers");
const CriticalPathUtils_1 = require("./utils/CriticalPathUtils");
const FloatUtils_1 = require("./utils/FloatUtils");
/**
 * CriticalPathAnalyzer - Comprehensive critical path detection and analysis
 */
class CriticalPathAnalyzer {
    constructor(config) {
        this.config = {
            epsilon: FloatUtils_1.DEFAULT_EPSILON,
            enableMultiplePaths: true,
            maxPathsToAnalyze: 10,
            validatePathContinuity: true,
            ...config,
        };
        this.epsilon = this.config.epsilon;
    }
    /**
     * Identifies all critical tasks in the project
     * @param tasks Array of tasks with total float calculated
     * @returns Array of critical tasks
     */
    identifyCriticalTasks(tasks) {
        return tasks.filter((task) => this.isCritical(task));
    }
    /**
     * Builds critical path sequences from critical tasks
     * @param tasks Array of all tasks
     * @param dependencies Array of logic links
     * @returns Array of critical paths
     */
    buildCriticalPathSequences(tasks, dependencies) {
        const criticalTasks = this.identifyCriticalTasks(tasks);
        if (criticalTasks.length === 0) {
            return [];
        }
        // Build dependency map for efficient traversal
        const { successors, predecessors } = (0, CriticalPathUtils_1.buildDependencyMap)(dependencies);
        // Find start tasks (tasks with no critical predecessors)
        const startTasks = criticalTasks.filter((task) => {
            const taskPredecessors = predecessors.get(task.id) || [];
            return !taskPredecessors.some((predId) => criticalTasks.some((ct) => ct.id === predId));
        });
        // Find end tasks (tasks with no critical successors)
        const endTasks = criticalTasks.filter((task) => {
            const taskSuccessors = successors.get(task.id) || [];
            return !taskSuccessors.some((succId) => criticalTasks.some((ct) => ct.id === succId));
        });
        const criticalPaths = [];
        // Generate paths from each start task to each end task
        for (const startTask of startTasks) {
            for (const endTask of endTasks) {
                const paths = (0, CriticalPathUtils_1.findAllPaths)(startTask.id, endTask.id, successors);
                for (const pathTaskIds of paths) {
                    // Verify all tasks in path are critical
                    const isValidCriticalPath = pathTaskIds.every((taskId) => criticalTasks.some((ct) => ct.id === taskId));
                    if (isValidCriticalPath && this.config.validatePathContinuity) {
                        const isValidSequence = (0, CriticalPathUtils_1.validateCriticalPathSequence)(pathTaskIds, dependencies);
                        if (isValidSequence) {
                            const criticalPath = CriticalPathHelpers_1.CriticalPathHelpers.createCriticalPath(pathTaskIds, tasks);
                            criticalPaths.push(criticalPath);
                        }
                    }
                    else if (isValidCriticalPath) {
                        const criticalPath = CriticalPathHelpers_1.CriticalPathHelpers.createCriticalPath(pathTaskIds, tasks);
                        criticalPaths.push(criticalPath);
                    }
                }
            }
        }
        // Remove duplicate paths and limit results
        const uniquePaths = CriticalPathHelpers_1.CriticalPathHelpers.removeDuplicatePaths(criticalPaths);
        const sortedPaths = (0, CriticalPathUtils_1.sortPathsByPriority)(uniquePaths);
        return sortedPaths.slice(0, this.config.maxPathsToAnalyze);
    }
    /**
     * Detects multiple critical paths in complex networks
     * @param tasks Array of all tasks
     * @param dependencies Array of logic links
     * @returns Array of critical path sets
     */
    detectMultipleCriticalPaths(tasks, dependencies) {
        if (!this.config.enableMultiplePaths) {
            const paths = this.buildCriticalPathSequences(tasks, dependencies);
            return paths.length > 0 ? [paths[0]] : [];
        }
        return this.buildCriticalPathSequences(tasks, dependencies);
    }
    /**
     * Calculates comprehensive metrics for critical paths
     * @param paths Array of critical paths
     * @returns Path metrics
     */
    calculateCriticalPathMetrics(paths) {
        if (paths.length === 0) {
            return {
                duration: 0,
                taskCount: 0,
                complexityScore: 0,
                riskScore: 0,
            };
        }
        const totalDuration = paths.reduce((sum, path) => sum + path.totalDuration, 0);
        const totalTasks = paths.reduce((sum, path) => sum + path.pathLength, 0);
        const averageDuration = totalDuration / paths.length;
        const averageTaskCount = totalTasks / paths.length;
        // Complexity based on number of paths and interconnections
        const complexityScore = Math.min(100, paths.length * 15 + averageTaskCount * 2);
        // Risk based on path length and duration
        const riskScore = Math.min(100, averageDuration / 20 + (averageTaskCount / 5) * 10);
        return {
            duration: Math.round(averageDuration * 100) / 100,
            taskCount: Math.round(averageTaskCount),
            complexityScore: Math.round(complexityScore),
            riskScore: Math.round(riskScore),
        };
    }
    /**
     * Validates critical path continuity
     * @param path Critical path to validate
     * @param dependencies Array of logic links
     * @returns Validation result
     */
    validateCriticalPathContinuity(path, dependencies) {
        const errors = [];
        const warnings = [];
        if (path.tasks.length === 0) {
            errors.push('Critical path contains no tasks');
            return { isValid: false, errors, warnings };
        }
        if (path.tasks.length === 1) {
            warnings.push('Critical path contains only one task');
            return { isValid: true, errors, warnings };
        }
        // Validate sequence continuity
        const isValidSequence = (0, CriticalPathUtils_1.validateCriticalPathSequence)(path.tasks, dependencies);
        if (!isValidSequence) {
            errors.push(`Critical path ${path.id} has invalid task sequence`);
        }
        // Validate path dates
        if (path.startDate >= path.endDate) {
            errors.push(`Critical path ${path.id} has invalid date range`);
        }
        // Validate duration consistency
        if (path.totalDuration <= 0) {
            errors.push(`Critical path ${path.id} has invalid duration`);
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
    /**
     * Generates comprehensive critical path analysis
     * @param tasks Array of all tasks
     * @param dependencies Array of logic links
     * @returns Complete critical path analysis
     */
    generateCriticalPathAnalysis(tasks, dependencies) {
        const criticalPaths = this.detectMultipleCriticalPaths(tasks, dependencies);
        const criticalTasks = this.identifyCriticalTasks(tasks);
        const pathIntersections = (0, CriticalPathUtils_1.detectPathIntersections)(criticalPaths);
        const longestPath = CriticalPathHelpers_1.CriticalPathHelpers.findLongestPath(criticalPaths);
        const shortestCriticalPath = CriticalPathHelpers_1.CriticalPathHelpers.findShortestPath(criticalPaths);
        return {
            criticalPaths,
            totalCriticalTasks: criticalTasks.length,
            longestPath: longestPath || CriticalPathHelpers_1.CriticalPathHelpers.createEmptyPath(),
            shortestCriticalPath: shortestCriticalPath || CriticalPathHelpers_1.CriticalPathHelpers.createEmptyPath(),
            pathIntersections,
            criticalityMetrics: {
                totalCriticalPaths: criticalPaths.length,
                averagePathLength: CriticalPathHelpers_1.CriticalPathHelpers.calculateAveragePathLength(criticalPaths),
                criticalPathDensity: CriticalPathHelpers_1.CriticalPathHelpers.calculatePathDensity(criticalPaths, tasks.length),
                pathComplexityScore: this.calculateCriticalPathMetrics(criticalPaths).complexityScore,
            },
        };
    }
    /**
     * Checks if a task is critical based on total float
     * @param task Task to check
     * @returns True if task is critical
     */
    isCritical(task) {
        return (0, FloatUtils_1.isFloatZero)(task.totalFloat || 0, this.epsilon);
    }
}
exports.CriticalPathAnalyzer = CriticalPathAnalyzer;
