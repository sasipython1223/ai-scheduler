/**
 * Module 7.2: Intelligent Optimization Mock Implementation
 *
 * This is a mock implementation for regression testing.
 * Simulates optimization algorithms (GA, SA, ML) with realistic performance characteristics.
 */

export interface OptimizationFlags {
  ENABLE_GA: boolean;
  ENABLE_SA: boolean;
  ENABLE_ML: boolean;
}

export interface OptimizationResult {
  status: "ok" | "partial" | "failed";
  best?: {
    algorithm: string;
    assignments?: any[];
    score?: number;
  };
  metrics?: {
    iterations: number[];
    score: number;
    timeElapsed: number;
  };
  allocations?: any[];
  tasks: any[];
  resources: any[];
  algorithm: "GA" | "SA" | "ML" | "DEFAULT";
  duration: number;
  iterations?: number;
  convergence?: number;
}

export interface OptimizationFacade {
  run(input: {
    tasks: any[];
    resources: any[];
    flags: OptimizationFlags;
    timeBudgetMs: number;
  }): Promise<OptimizationResult>;
}

export function createOptimizationFacade(): OptimizationFacade {
  return {
    async run({
      tasks,
      resources,
      flags,
      timeBudgetMs,
    }): Promise<OptimizationResult> {
      const startTime = Date.now();

      // Determine which algorithm to use based on flags
      let algorithm: "GA" | "SA" | "ML" | "DEFAULT" = "DEFAULT";
      if (flags.ENABLE_GA) algorithm = "GA";
      else if (flags.ENABLE_SA) algorithm = "SA";
      else if (flags.ENABLE_ML) algorithm = "ML";

      // Simulate optimization processing time
      let processingTime = 0;
      switch (algorithm) {
        case "GA":
          // Genetic Algorithm - slower but better results
          processingTime = Math.min(
            timeBudgetMs * 0.8,
            100 + tasks.length * 0.5,
          );
          break;
        case "SA":
          // Simulated Annealing - medium speed
          processingTime = Math.min(
            timeBudgetMs * 0.6,
            80 + tasks.length * 0.4,
          );
          break;
        case "ML":
          // Machine Learning - fastest
          processingTime = Math.min(
            timeBudgetMs * 0.4,
            60 + tasks.length * 0.3,
          );
          break;
        default:
          // Default algorithm
          processingTime = Math.min(
            timeBudgetMs * 0.3,
            40 + tasks.length * 0.2,
          );
          break;
      }

      // Simulate processing delay with timeout awareness
      const actualProcessingTime = Math.min(processingTime, timeBudgetMs - 5); // Leave 5ms buffer
      await new Promise((resolve) => setTimeout(resolve, actualProcessingTime));

      const duration = Date.now() - startTime;
      const timeoutExceeded = duration >= timeBudgetMs;

      // Generate best solution found so far (even if timeout occurred)
      let baseScore = 50;
      switch (algorithm) {
        case "GA":
          baseScore = 70 + Math.random() * 20; // 70-90
          break;
        case "SA":
          baseScore = 60 + Math.random() * 25; // 60-85
          break;
        case "ML":
          baseScore = 80 + Math.random() * 15; // 80-95
          break;
        default:
          baseScore = 40 + Math.random() * 20; // 40-60
          break;
      }

      // Score bonus for smaller datasets (easier to optimize)
      if (tasks.length < 50) baseScore += 10;
      else if (tasks.length > 200) baseScore -= 10;

      // Reduce score if timeout occurred (partial optimization)
      if (timeoutExceeded) baseScore *= 0.7;

      const finalScore = Math.round(baseScore * 100) / 100;
      const bestSolution = {
        algorithm:
          algorithm === "GA"
            ? "genetic-algorithm"
            : algorithm === "SA"
              ? "simulated-annealing"
              : algorithm === "ML"
                ? "machine-learning"
                : "none",
        assignments: tasks.map((task, i) => ({
          taskId: task.id,
          resourceId: resources[i % resources.length]?.id,
          startDate: "2025-08-09",
        })),
        score: finalScore,
      };

      // Determine status based on timeout and solution quality
      let status: "ok" | "partial" | "failed" = "ok";
      if (timeoutExceeded) {
        // If we have a feasible solution (score > 10), return partial, else failed
        status = finalScore > 10 ? "partial" : "failed";
      }

      // Return failed only if no feasible solution found
      if (status === "failed") {
        return {
          status: "failed",
          tasks,
          resources,
          algorithm,
          duration: Math.min(duration, timeBudgetMs),
          best: undefined,
          metrics: {
            iterations: [],
            score: 0,
            timeElapsed: Math.min(duration, timeBudgetMs),
          },
        };
      }

      return {
        status,
        tasks,
        resources,
        algorithm,
        duration: Math.min(duration, timeBudgetMs),
        iterations: Math.floor(Math.random() * 100) + 50,
        convergence: Math.random() * 0.1 + 0.9, // 0.9-1.0
        best: bestSolution,
        metrics: {
          iterations: [Math.floor(Math.random() * 100) + 50],
          score: finalScore,
          timeElapsed: Math.min(duration, timeBudgetMs),
        },
      };
    },
  };
}
