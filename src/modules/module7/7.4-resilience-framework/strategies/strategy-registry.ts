import { MitigationStrategy } from "../7.4.3-risk-manager/mitigation-strategies";

/**
 * Lightweight registry for mitigation strategies.
 * Allows dynamic registration and lookup of strategies.
 */
export class StrategyRegistry {
  private strategies = new Map<string, MitigationStrategy>();

  register(strategy: MitigationStrategy): void {
    this.strategies.set(strategy.id, strategy);
  }

  unregister(id: string): boolean {
    return this.strategies.delete(id);
  }

  get(id: string): MitigationStrategy | undefined {
    return this.strategies.get(id);
  }

  getAll(): MitigationStrategy[] {
    return Array.from(this.strategies.values());
  }

  getByRiskType(riskType: string): MitigationStrategy[] {
    return this.getAll().filter((s) => s.riskTypes.includes(riskType));
  }

  clear(): void {
    this.strategies.clear();
  }

  size(): number {
    return this.strategies.size;
  }
}
