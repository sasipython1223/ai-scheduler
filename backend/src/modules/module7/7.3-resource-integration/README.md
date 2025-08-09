# Module 7.3 - Resource-Constraint Integration

Smart, constraint-aware resource allocation with availability checking, skill-based matching, and workload leveling.

## Overview

Module 7.3 provides intelligent resource allocation that:

- Matches tasks to resources based on skill requirements
- Respects resource availability and capacity constraints
- Offers pluggable allocation strategies (greedy, leveling, hybrid)
- Maintains high performance (≤500ms for 1000 tasks)
- Provides comprehensive constraint violation reporting

## Architecture Diagrams

- **[Component Architecture](./module7-7.3.puml)** - Overall system structure and relationships
- **[Integration Sequence](./module7-7.3-sequence.puml)** - Step-by-step integrate() flow with strategies

## Architecture

```
7.3-resource-integration/
├── index.ts                     # Public API and type definitions
├── shared-types.ts              # Common utilities and helpers
├── availability-checker.ts      # Resource availability logic
├── skill-based-allocation.ts    # Skill matching algorithms
├── resource-leveling.ts         # Workload balancing functions
├── resource-constraint-manager.ts # Main implementation
├── strategies/
│   ├── greedy-skill-fit.ts      # Fast greedy allocation
│   └── minimal-leveling.ts      # Balanced workload strategy
├── __tests__/
│   ├── integration.test.ts      # End-to-end tests
│   ├── availability-checker.test.ts
│   └── skill-based-allocation.test.ts
└── perf/
    └── performance.test.ts      # Performance benchmarks
```

## Core Types

```typescript
interface Resource {
  id: string;
  skills: Skill[];
  capacity: number; // hours per day
  calendar?: Record<string, number>; // day -> available hours
}

interface Task {
  id: string;
  duration: number; // hours required
  day: string; // ISO date
  requirements: Requirement[]; // skill requirements
}

interface Requirement {
  skillId: string;
  minLevel: number;
  weight?: number; // importance factor
}

interface ConstraintInput {
  resources: Resource[];
  tasks: Task[];
  hardCaps?: { maxOverallocPct?: number };
  flags?: { ENABLE_GREEDY?: boolean; ENABLE_LEVELING?: boolean };
  timeBudgetMs?: number;
}
```

## Usage

### Basic Allocation

```typescript
import { createResourceConstraintManager } from './index';

const manager = createResourceConstraintManager();

const result = await manager.integrate({
  resources: [
    {
      id: 'dev1',
      skills: [{ id: 'javascript', level: 3 }],
      capacity: 8,
      calendar: { '2024-01-15': 6 }, // 6 hours available on this day
    },
  ],
  tasks: [
    {
      id: 'task1',
      duration: 4,
      day: '2024-01-15',
      requirements: [{ skillId: 'javascript', minLevel: 2 }],
    },
  ],
  flags: { ENABLE_GREEDY: true },
});

console.log('Status:', result.status);
console.log('Allocations:', result.allocations);
console.log('Violations:', result.violations);
```

### Strategy Selection

```typescript
// Greedy strategy (fast, good skill matching)
const greedyResult = await manager.integrate({
  resources,
  tasks,
  flags: { ENABLE_GREEDY: true },
});

// Leveling strategy (balanced workload)
const levelingResult = await manager.integrate({
  resources,
  tasks,
  flags: { ENABLE_LEVELING: true },
});

// Hybrid strategy (leveling with greedy fallback)
const hybridResult = await manager.integrate({
  resources,
  tasks,
  flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: true },
});
```

### Constraint Handling

```typescript
const result = await manager.integrate({
  resources,
  tasks,
  hardCaps: {
    maxOverallocPct: 25, // Allow 25% overallocation max
  },
  timeBudgetMs: 1000, // Complete within 1 second
  flags: { ENABLE_GREEDY: true },
});
```

## Allocation Strategies

### Greedy Skill-Fit

- **Performance**: Very fast (O(T log R))
- **Approach**: Match each task to best available resource
- **Pros**: Quick allocation, good skill utilization
- **Cons**: May create uneven workload distribution

### Minimal Leveling

- **Performance**: Moderate (O(T R log R))
- **Approach**: Balance workload across resources
- **Pros**: Even resource utilization, reduced bottlenecks
- **Cons**: May sacrifice some skill optimization

### Hybrid Strategy

- **Performance**: Adaptive
- **Approach**: Try leveling first, fallback to greedy
- **Pros**: Best of both approaches
- **Cons**: Higher complexity, variable timing

## Performance Characteristics

| Task Count | Target Time | Strategy | Typical Results         |
| ---------- | ----------- | -------- | ----------------------- |
| 100        | <50ms       | Greedy   | ~20ms, 95%+ allocation  |
| 500        | <200ms      | Greedy   | ~80ms, 90%+ allocation  |
| 1000       | <500ms      | Greedy   | ~150ms, 85%+ allocation |
| 200        | <400ms      | Leveling | ~200ms, better balance  |

## Constraint Validation

The system validates and reports various constraint violations:

- **Resource Constraints**: Missing resources, invalid capacity
- **Task Constraints**: Missing tasks, invalid duration
- **Skill Mismatches**: Tasks requiring unavailable skills
- **Capacity Violations**: Overallocation beyond limits
- **Time Budget**: Allocation exceeding time limits

## Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm test availability-checker.test.ts
npm test skill-based-allocation.test.ts
npm test integration.test.ts

# Run performance benchmarks
npm test performance.test.ts
```

## Quality Guarantees

- **TypeScript Clean**: Zero compilation errors
- **ESLint Clean**: Zero linting warnings
- **File Size**: ≤220 LOC per file
- **Test Coverage**: 30+ comprehensive tests
- **Performance**: ≤500ms for 1000 tasks locally
- **Deterministic**: Stable, reproducible results

## Integration with Other Modules

- **Module 5**: Consumes schedule data types
- **Module 6**: Integrates with constraint definitions
- **Module 8**: Provides allocation results for optimization

## Error Handling

The module follows a "no-throw" policy for business logic:

- Validation errors → `status: "conflicts"` with detailed violations
- Resource constraints → Graceful degradation with partial allocation
- Performance limits → Time budget warnings in violations array

## Future Enhancements

- **Weighted Skills**: Priority-based skill matching
- **Time Windows**: Task scheduling within specific periods
- **Resource Preferences**: Preferred resource assignments
- **Advanced Leveling**: Multi-objective optimization
- **Parallel Processing**: Concurrent allocation for large datasets
