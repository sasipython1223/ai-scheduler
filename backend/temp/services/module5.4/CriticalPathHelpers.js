"use strict";
/**
 * Module 5.4 - CriticalPathAnalyzer Helper Functions
 * Purpose: Private helper methods for critical path analysis
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CriticalPathHelpers = void 0;
/**
 * CriticalPathHelpers - Helper functions for critical path analysis
 */
class CriticalPathHelpers {
    /**
     * Creates a CriticalPath object from task IDs
     * @param taskIds Array of task IDs in sequence
     * @param allTasks Array of all tasks for lookup
     * @returns CriticalPath object
     */
    static createCriticalPath(taskIds, allTasks) {
        const pathTasks = taskIds
            .map((id) => allTasks.find((task) => task.id === id))
            .filter(Boolean);
        const totalDuration = pathTasks.reduce((sum, task) => sum + task.duration, 0);
        const startDate = new Date(); // Would be calculated from actual task dates
        const endDate = new Date(startDate.getTime() + totalDuration * 24 * 60 * 60 * 1000);
        return {
            id: this.generatePathId(taskIds),
            tasks: taskIds,
            totalDuration,
            startDate,
            endDate,
            pathLength: taskIds.length,
            isLongest: false, // Will be determined later
            riskLevel: this.calculatePathRiskLevel(totalDuration, taskIds.length),
        };
    }
    /**
     * Removes duplicate critical paths
     * @param paths Array of critical paths
     * @returns Array of unique paths
     */
    static removeDuplicatePaths(paths) {
        const uniquePaths = [];
        const seenSequences = new Set();
        for (const path of paths) {
            const sequence = path.tasks.join('->');
            if (!seenSequences.has(sequence)) {
                seenSequences.add(sequence);
                uniquePaths.push(path);
            }
        }
        return uniquePaths;
    }
    /**
     * Finds the longest critical path
     * @param paths Array of critical paths
     * @returns Longest path or null
     */
    static findLongestPath(paths) {
        if (paths.length === 0)
            return null;
        return paths.reduce((longest, current) => current.totalDuration > longest.totalDuration ? current : longest);
    }
    /**
     * Finds the shortest critical path
     * @param paths Array of critical paths
     * @returns Shortest path or null
     */
    static findShortestPath(paths) {
        if (paths.length === 0)
            return null;
        return paths.reduce((shortest, current) => current.totalDuration < shortest.totalDuration ? current : shortest);
    }
    /**
     * Calculates average path length
     * @param paths Array of critical paths
     * @returns Average path length
     */
    static calculateAveragePathLength(paths) {
        if (paths.length === 0)
            return 0;
        const totalLength = paths.reduce((sum, path) => sum + path.pathLength, 0);
        return Math.round((totalLength / paths.length) * 100) / 100;
    }
    /**
     * Calculates critical path density
     * @param paths Array of critical paths
     * @param totalTasks Total number of tasks
     * @returns Path density percentage
     */
    static calculatePathDensity(paths, totalTasks) {
        if (totalTasks === 0 || paths.length === 0)
            return 0;
        const uniqueCriticalTasks = new Set();
        paths.forEach((path) => {
            path.tasks.forEach((taskId) => uniqueCriticalTasks.add(taskId));
        });
        return Math.round((uniqueCriticalTasks.size / totalTasks) * 10000) / 100;
    }
    /**
     * Calculates risk level for a path
     * @param duration Path duration
     * @param taskCount Number of tasks in path
     * @returns Risk level
     */
    static calculatePathRiskLevel(duration, taskCount) {
        const complexityScore = duration + taskCount * 2;
        if (complexityScore > 50)
            return 'CRITICAL';
        if (complexityScore > 30)
            return 'HIGH';
        if (complexityScore > 15)
            return 'MEDIUM';
        return 'LOW';
    }
    /**
     * Creates an empty critical path for default cases
     * @returns Empty critical path
     */
    static createEmptyPath() {
        return {
            id: 'EMPTY',
            tasks: [],
            totalDuration: 0,
            startDate: new Date(),
            endDate: new Date(),
            pathLength: 0,
            isLongest: false,
            riskLevel: 'LOW',
        };
    }
    /**
     * Generates a unique path ID from task sequence
     * @param taskIds Array of task IDs
     * @returns Unique path ID
     */
    static generatePathId(taskIds) {
        return `PATH_${taskIds.join('_')}`;
    }
}
exports.CriticalPathHelpers = CriticalPathHelpers;
