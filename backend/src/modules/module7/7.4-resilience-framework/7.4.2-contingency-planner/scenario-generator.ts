import { Schedule } from "../shared-types";

export interface ContingencyScenario {
  id: string;
  name: string;
  probability: number; // 0..1
  impact: "LOW" | "MEDIUM" | "HIGH";
  triggers: string[];
  affectedTasks: string[];
  assumptions?: Record<string, number | string | boolean>;
}

export class ScenarioGenerator {
  /** Produce N ranked scenarios; deterministic given seed */
  generate(schedule: Schedule, seed = 42, max = 5): ContingencyScenario[] {
    // Heuristics:
    // - pick tasks on/near critical path
    // - include top-k resource hot spots
    // - vary late-delivery and capacity-drop assumptions
    // Keep deterministic ordering by (impact desc, probability desc, id asc)
    return []; // TODO: implement
  }
}
