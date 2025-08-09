/**
 * Scenario modeling utilities for resilience framework
 */

export interface ScenarioParameter {
  name: string;
  min: number;
  max: number;
  distribution: "uniform" | "normal" | "triangular";
}

export interface ScenarioModel {
  id: string;
  name: string;
  parameters: ScenarioParameter[];
  probability: number;
}

export class ScenarioModeling {
  /**
   * Generate scenario variants based on parameter ranges
   */
  static generateScenarios(
    baseParams: ScenarioParameter[],
    count: number = 100,
  ): ScenarioModel[] {
    const scenarios: ScenarioModel[] = [];

    for (let i = 0; i < count; i++) {
      const parameters = baseParams.map((param) => ({
        ...param,
        value: this.sampleParameter(param),
      }));

      scenarios.push({
        id: `scenario_${i}`,
        name: `Scenario ${i + 1}`,
        parameters,
        probability: 1 / count, // uniform probability for now
      });
    }

    return scenarios;
  }

  /**
   * Sample a parameter based on its distribution
   */
  private static sampleParameter(param: ScenarioParameter): number {
    const { min, max, distribution } = param;
    const random = Math.random();

    switch (distribution) {
      case "uniform":
        return min + random * (max - min);
      case "normal":
        // Box-Muller transform for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const mean = (min + max) / 2;
        const std = (max - min) / 6; // 3-sigma rule
        return Math.max(min, Math.min(max, mean + z0 * std));
      case "triangular":
        const mode = (min + max) / 2;
        return this.triangularSample(min, max, mode);
      default:
        return min + random * (max - min);
    }
  }

  /**
   * Sample from triangular distribution
   */
  private static triangularSample(
    min: number,
    max: number,
    mode: number,
  ): number {
    const u = Math.random();
    const c = (mode - min) / (max - min);

    if (u < c) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  }
}
