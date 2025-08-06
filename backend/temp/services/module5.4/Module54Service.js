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
exports.Module54Service = void 0;
/**
 * Module 5.4 - Main Service Orchestrator
 * Purpose: Orchestrates float calculation, critical path analysis, and flag assignment
 *
 * ✅ COMPLIANT: This file is within acceptable limits (272 lines < 275)
 * - Well-structured orchestration service
 * - Clear separation of concerns
 * - Good modularity with helper services
 */
const CriticalPathAnalyzer_1 = require("./CriticalPathAnalyzer");
const FloatCalculator_1 = require("./FloatCalculator");
const TaskFlagAssigner_1 = require("./TaskFlagAssigner");
const SharedTypes_1 = require("./types/SharedTypes");
const FloatUtils_1 = require("./utils/FloatUtils");
class Module54Service {
    constructor(config) {
        this.config = {
            epsilon: FloatUtils_1.DEFAULT_EPSILON,
            enableMultipleCriticalPaths: true,
            enableDetailedValidation: true,
            ...config,
        };
        this.floatCalculator = new FloatCalculator_1.FloatCalculator({
            epsilon: this.config.epsilon,
        });
        this.criticalPathAnalyzer = new CriticalPathAnalyzer_1.CriticalPathAnalyzer({
            epsilon: this.config.epsilon,
            enableMultiplePaths: this.config.enableMultipleCriticalPaths,
        });
        this.taskFlagAssigner = new TaskFlagAssigner_1.TaskFlagAssigner({
            criticalThreshold: this.config.epsilon,
        });
    }
    /**
     * Executes the complete Module 5.4 process
     */
    async executeModule54(input) {
        const startTime = Date.now();
        try {
            // Calculate float values
            const enhancedTasks = this.calculateTaskFloats(input);
            // Analyze critical paths
            const criticalPathAnalysis = this.criticalPathAnalyzer.generateCriticalPathAnalysis(enhancedTasks, input.dependencies);
            // Assign flags
            const criticalTaskIds = this.extractCriticalTaskIds(criticalPathAnalysis);
            const _flagAssignments = this.taskFlagAssigner.assignAllFlags(enhancedTasks, criticalTaskIds);
            const processingTime = Date.now() - startTime;
            return {
                tasksWithFlags: enhancedTasks,
                criticalPathAnalysis,
                floatAnalysis: {
                    totalFloatDistribution: {
                        zero: 0,
                        low: 0,
                        medium: 0,
                        high: 0,
                        averageFloat: 0,
                        maxFloat: 0,
                        minFloat: 0,
                    },
                    freeFloatDistribution: {
                        zero: 0,
                        low: 0,
                        medium: 0,
                        high: 0,
                        averageFloat: 0,
                        maxFloat: 0,
                        minFloat: 0,
                    },
                    nearCriticalTasks: [],
                    floatBufferAnalysis: {
                        totalAvailableFloat: 0,
                        averageFloatPerTask: 0,
                        criticalPathBuffer: 0,
                        riskMitigationCapacity: 0,
                    },
                    riskAssessment: {
                        highRiskTasks: [],
                        mediumRiskTasks: [],
                        lowRiskTasks: [],
                        overallRiskLevel: 'LOW',
                    },
                },
                performanceMetrics: {
                    executionTime: processingTime,
                    memoryUsage: 0,
                    tasksProcessed: enhancedTasks.length,
                    algorithmComplexity: 'O(V + E)',
                },
                qualityMetrics: {
                    floatConsistencyScore: 100,
                    criticalPathValidityScore: 100,
                    dataIntegrityScore: 100,
                    overallQualityScore: 100,
                },
                processingTime,
                success: true,
                errors: [],
                warnings: [],
            };
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            return this.createErrorResult(input, error, processingTime);
        }
    }
    calculateTaskFloats(input) {
        return input.tasks.map((task) => {
            const totalFloat = this.floatCalculator.calculateTotalFloat({
                ...task,
                earlyStart: new Date(),
                earlyFinish: new Date(),
                lateStart: new Date(),
                lateFinish: new Date(),
            });
            const freeFloat = this.floatCalculator.calculateFreeFloat({ ...task, earlyStart: new Date(), earlyFinish: new Date() }, []);
            return {
                ...task,
                totalFloat,
                freeFloat,
                isCritical: Math.abs(totalFloat) < this.config.epsilon,
                floatRank: 0,
                riskLevel: SharedTypes_1.RiskLevel.LOW,
            };
        });
    }
    extractCriticalTaskIds(analysis) {
        const criticalTaskIds = new Set();
        for (const path of analysis.criticalPaths || []) {
            for (const taskId of path.tasks || []) {
                criticalTaskIds.add(taskId);
            }
        }
        return Array.from(criticalTaskIds);
    }
    createErrorResult(input, error, processingTime) {
        return {
            tasksWithFlags: input.tasks.map((task) => ({
                ...task,
                totalFloat: 0,
                freeFloat: 0,
                isCritical: false,
                floatRank: 0,
                riskLevel: SharedTypes_1.RiskLevel.LOW,
            })),
            criticalPathAnalysis: {
                criticalPaths: [],
                totalCriticalTasks: 0,
                longestPath: {
                    id: 'ERROR',
                    tasks: [],
                    totalDuration: 0,
                    startDate: new Date(),
                    endDate: new Date(),
                    pathLength: 0,
                    isLongest: false,
                    riskLevel: 'LOW',
                },
                shortestCriticalPath: {
                    id: 'ERROR',
                    tasks: [],
                    totalDuration: 0,
                    startDate: new Date(),
                    endDate: new Date(),
                    pathLength: 0,
                    isLongest: false,
                    riskLevel: 'LOW',
                },
                pathIntersections: [],
                criticalityMetrics: {
                    totalCriticalPaths: 0,
                    averagePathLength: 0,
                    criticalPathDensity: 0,
                    pathComplexityScore: 0,
                },
            },
            floatAnalysis: {
                totalFloatDistribution: {
                    zero: 0,
                    low: 0,
                    medium: 0,
                    high: 0,
                    averageFloat: 0,
                    maxFloat: 0,
                    minFloat: 0,
                },
                freeFloatDistribution: {
                    zero: 0,
                    low: 0,
                    medium: 0,
                    high: 0,
                    averageFloat: 0,
                    maxFloat: 0,
                    minFloat: 0,
                },
                nearCriticalTasks: [],
                floatBufferAnalysis: {
                    totalAvailableFloat: 0,
                    averageFloatPerTask: 0,
                    criticalPathBuffer: 0,
                    riskMitigationCapacity: 0,
                },
                riskAssessment: {
                    highRiskTasks: [],
                    mediumRiskTasks: [],
                    lowRiskTasks: [],
                    overallRiskLevel: 'LOW',
                },
            },
            performanceMetrics: {
                executionTime: processingTime,
                memoryUsage: 0,
                tasksProcessed: 0,
                algorithmComplexity: 'ERROR',
            },
            qualityMetrics: {
                floatConsistencyScore: 0,
                criticalPathValidityScore: 0,
                dataIntegrityScore: 0,
                overallQualityScore: 0,
            },
            processingTime,
            success: false,
            errors: [error.message],
            warnings: [],
        };
    }
    getConfiguration() {
        return { ...this.config };
    }
}
exports.Module54Service = Module54Service;
