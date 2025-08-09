/**
 * Module 7.2 - Genetic Algorithm Strategy
 *
 * Implements genetic algorithm optimization with population-based evolution,
 * mutation, and selection. Lightweight but functional implementation.
 */

import {
  AlgorithmContext,
  calculateFitness,
  createBaselineCandidate,
  generateMutation,
  selectBestCandidate,
} from '../algorithm-context';
import { ENABLE_GA } from '../config';
import type { OptimizationCandidate, OptimizationInput } from '../types';
import type { OptimizationStrategy } from './optimization-strategy';

/**
 * Genetic Algorithm optimization strategy
 */
export class GeneticAlgorithm implements OptimizationStrategy {
  readonly name = 'GeneticAlgorithm';

  private readonly populationSize: number;
  private readonly mutationRate: number;
  private readonly elitismRate: number;

  constructor(
    populationSize: number = 10,
    mutationRate: number = 0.2,
    elitismRate: number = 0.3
  ) {
    this.populationSize = populationSize;
    this.mutationRate = mutationRate;
    this.elitismRate = elitismRate;
  }

  /**
   * Check if GA is enabled and input is supported
   */
  supports(input: OptimizationInput): boolean {
    if (!ENABLE_GA) {
      return false;
    }

    // GA supports any input with schedule data
    return input.schedule !== null && input.schedule !== undefined;
  }

  /**
   * Execute genetic algorithm optimization
   */
  async optimize(
    input: OptimizationInput
  ): Promise<OptimizationCandidate | undefined> {
    if (!this.supports(input)) {
      return undefined;
    }

    const timeBudget = input.timeBudgetMs ?? 200;
    const maxIterations = input.maxIterations ?? 3;
    const context = new AlgorithmContext(timeBudget);

    try {
      return await this.runGeneticAlgorithm(input, context, maxIterations);
    } catch {
      // Return undefined on error rather than throwing
      return undefined;
    }
  }

  /**
   * Main genetic algorithm execution loop
   */
  private async runGeneticAlgorithm(
    input: OptimizationInput,
    context: AlgorithmContext,
    maxIterations: number
  ): Promise<OptimizationCandidate | undefined> {
    // Initialize population
    const population = this.initializePopulation(input);
    let generation = 0;
    let bestCandidate = selectBestCandidate(population);

    while (generation < maxIterations && !context.isTimeExceeded()) {
      bestCandidate = await this.evolveGeneration(
        population,
        input,
        context,
        bestCandidate
      );
      generation++;

      // Small delay to allow other operations
      if (generation % 2 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
    }

    return bestCandidate;
  }

  /**
   * Evolve one generation of the population
   */
  private async evolveGeneration(
    population: OptimizationCandidate[],
    input: OptimizationInput,
    context: AlgorithmContext,
    currentBest: OptimizationCandidate | undefined
  ): Promise<OptimizationCandidate | undefined> {
    // Evaluate fitness for all candidates
    const evaluatedPopulation = population.map((candidate) => ({
      ...candidate,
      score: calculateFitness(candidate, input),
    }));

    // Select best candidates (elitism)
    const sortedPopulation = evaluatedPopulation.sort(
      (a, b) => b.score - a.score
    );
    const elites = this.selectElites(sortedPopulation);

    // Generate new population through mutation
    const newPopulation = this.generateNewPopulation(elites, context);

    // Update population and best candidate
    population.splice(0, population.length, ...newPopulation);
    const generationBest = selectBestCandidate(population);

    if (
      generationBest &&
      (!currentBest || generationBest.score > currentBest.score)
    ) {
      return generationBest;
    }

    return currentBest;
  }

  /**
   * Select elite candidates for reproduction
   */
  private selectElites(
    sortedPopulation: OptimizationCandidate[]
  ): OptimizationCandidate[] {
    const eliteCount = Math.ceil(this.populationSize * this.elitismRate);
    return sortedPopulation.slice(0, eliteCount);
  }

  /**
   * Generate new population through mutation and reproduction
   */
  private generateNewPopulation(
    elites: OptimizationCandidate[],
    context: AlgorithmContext
  ): OptimizationCandidate[] {
    const newPopulation = [...elites];

    while (
      newPopulation.length < this.populationSize &&
      !context.isTimeExceeded()
    ) {
      // Select parent and mutate
      const parent = this.selectParent(elites);
      if (Math.random() < this.mutationRate) {
        const mutated = generateMutation(parent, 0.15);
        newPopulation.push(mutated);
      } else {
        newPopulation.push(parent);
      }
    }

    return newPopulation;
  }

  /**
   * Initialize population with baseline and random variations
   */
  private initializePopulation(
    _input: OptimizationInput
  ): OptimizationCandidate[] {
    const population: OptimizationCandidate[] = [];
    const scheduleId = `schedule-${Date.now()}`;

    // Start with baseline
    const baseline = createBaselineCandidate(scheduleId);
    population.push(baseline);

    // Generate random variations
    for (let i = 1; i < this.populationSize; i++) {
      const candidate: OptimizationCandidate = {
        scheduleId: `${scheduleId}-${i}`,
        score: Math.random() * 50 + 25, // Random initial score 25-75
        changesApplied: Math.floor(Math.random() * 10), // 0-9 changes
      };
      population.push(candidate);
    }

    return population;
  }

  /**
   * Select parent for reproduction using tournament selection
   */
  private selectParent(elites: OptimizationCandidate[]): OptimizationCandidate {
    if (elites.length === 0) {
      throw new Error('No elites available for parent selection');
    }

    // Simple tournament selection
    const tournamentSize = Math.min(3, elites.length);
    const tournament = [];

    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * elites.length);
      tournament.push(elites[randomIndex]);
    }

    return selectBestCandidate(tournament) || elites[0];
  }
}
