# Module 7.x End-to-End Regression & Performance Suite

## Overview

This comprehensive test suite validates the complete Module 7.x pipeline (7.1 → 7.2 → 7.3) for task scheduling and resource optimization. Features **bulletproof capacity management**, **normalized leveling algorithms**, and **post-pass repair** for production reliability.

## Goals

✅ **Functionality**: Prove that the 7.1 → 7.2 → 7.3 pipeline produces valid, consistent results  
✅ **Performance**: Lock performance at ≤500ms for 1k tasks with 150 resources  
✅ **Regression Detection**: Catch regressions via CI with clear, reproducible fixtures  
✅ **Coverage**: Maintain ≥85% code coverage across all test scenarios  
✅ **Capacity Safety**: Zero overallocation tolerance via double-gate commits  
✅ **Numeric Stability**: EPS-based floating-point comparisons eliminate precision errors

## Architecture Highlights

### Double-Gate Capacity Commits

- **ResourceUtilization.reserve()**: Bulletproof single commit path
- **CAP_MARGIN**: 2% headroom prevents stress-induced overruns
- **Recomputation**: Capacity deltas verified immediately before commit
- **Fail-safe**: Returns false if allocation would exceed limits

### Normalized Leveling Strategy

- **Load ratio objective**: `loadRatio = assigned/capacity` for fair comparison
- **Variance reduction**: Minimizes squared deviations of normalized ratios
- **Deterministic tie-breaking**: Prefer lower loadRatio, then resourceId
- **Post-processing**: Iterative load balancing with stagnation detection

### Post-Pass Repair

- **Time budget**: 20ms allocated for overload cleanup
- **Repair strategies**: (1) shift to low-load day, (2) swap equivalent tasks, (3) drop lowest-value
- **Metrics tracking**: `maxOverPct`, `swapsCount`, `repairedOverloads`
- **Graceful degradation**: Continues if repair budget exceeded

### Numeric Stability

- **EPS tolerance**: 1e-7 for all floating-point comparisons
- **Unified helpers**: `nearlyLTE()`, `nearlyGTE()`, `nearlyEqual()`
- **Capacity validation**: `withinCapacity()` with margin checks
- **Configuration**: Centralized constants in `config.ts`

## Test Structure

```
__regression__/
├── fixtures/           # Test data for various scenarios
│   ├── schedule.small.json      # 5 tasks, 3 resources
│   ├── schedule.medium.json     # 25 tasks, 8 resources
│   ├── schedule.large.json      # Generated: 1000 tasks, 150 resources
│   ├── constraints.json         # Optimization and capacity constraints
│   ├── calendars.json          # Resource availability and blackouts
│   └── skills.json             # Skill definitions and prerequisites
├── helpers/            # Shared utilities and assertions
│   ├── make-fixtures.ts        # Dynamic fixture generation
│   └── validate-results.ts     # Shared validation functions
├── e2e/               # End-to-end integration tests
│   ├── pipeline.e2e.test.ts   # Happy path 7.1→7.2→7.3 flow
│   ├── flags.e2e.test.ts      # Feature flag matrix testing
│   └── edge-cases.e2e.test.ts # Error conditions and edge cases
└── perf/              # Performance and scalability tests
    └── pipeline.perf.test.ts   # Timing and memory benchmarks
```

## Module APIs

### 7.1 Task Preparation Pipeline

```typescript
import { createTaskPreparationPipeline } from "../7.1-constraint-engine";

const pipeline = createTaskPreparationPipeline();
const result = pipeline.prepare({ schedule, constraints, calendars, skills });
```

### 7.2 Intelligent Optimization

```typescript
import { createOptimizationFacade } from "../7.2-intelligent-optimization";

const optimizer = createOptimizationFacade();
const result = await optimizer.run({
  tasks,
  resources,
  flags: { ENABLE_GA: true, ENABLE_SA: false, ENABLE_ML: false },
  timeBudgetMs: 500,
});
```

### 7.3 Resource Integration

```typescript
import { createResourceConstraintManager } from "../7.3-resource-integration";

const manager = createResourceConstraintManager();
const result = await manager.integrate({
  tasks,
  resources,
  flags: { ENABLE_GREEDY: true, ENABLE_LEVELING: false },
  hardCaps: { maxOverallocPct: 10 },
  calendars,
});
```

## Running Tests

### All Regression Tests

```bash
npm run test:reg
```

### Performance Tests Only

```bash
npm run test:perf
```

### End-to-End Tests Only

```bash
npm run test:e2e
```

### Full Module 7 Test Suite

```bash
npm run test:module7
```

### With Coverage

```bash
npm run test:coverage
```

## Test Categories

### 1. Happy Path Integration (`pipeline.e2e.test.ts`)

- **Small Dataset**: 5 tasks, 3 resources, 7 days
- **Medium Dataset**: 25 tasks, 8 resources, 14 days
- **Large Dataset**: 100 tasks, 25 resources, 20 days
- **Data Integrity**: Task count consistency through pipeline
- **Constraint Validation**: Resource capacity limits respected

### 2. Feature Flag Matrix (`flags.e2e.test.ts`)

- **Optimization Algorithms**: GA, SA, ML individual and combined
- **Resource Strategies**: Greedy, Leveling, Hybrid approaches
- **Strategy Comparison**: Leveling variance vs Greedy utilization
- **Budget Constraints**: Tight vs generous time budgets
- **Deterministic Behavior**: Consistent results for same inputs

### 3. Edge Cases (`edge-cases.e2e.test.ts`)

- **Missing Skills**: Tasks requiring unavailable skills
- **Zero Capacity**: Resources with no available time
- **Calendar Blackouts**: Extensive unavailability periods
- **Constraint Violations**: Hard caps and overallocation limits
- **Dependency Chains**: Circular and long dependency scenarios
- **Extreme Data**: Single task/resource, oversized tasks

### 4. Performance Benchmarks (`pipeline.perf.test.ts`)

- **Core Requirement**: 1k tasks + 150 resources < 500ms
- **Scalability**: 500 tasks < 250ms, 100 tasks < 100ms
- **Linear Scaling**: Performance scales reasonably with task count
- **Memory Efficiency**: Reasonable memory usage under load
- **Algorithm Comparison**: GA vs SA vs ML performance characteristics
- **Stress Testing**: 2k tasks, 300 resources maximum load
- **Concurrency**: Multiple pipeline executions in parallel

## Performance Requirements

| Dataset Size              | Max Time | Use Case          |
| ------------------------- | -------- | ----------------- |
| 100 tasks, 20 resources   | 100ms    | Small projects    |
| 500 tasks, 75 resources   | 250ms    | Medium projects   |
| 1000 tasks, 150 resources | 500ms    | Large enterprise  |
| 2000 tasks, 300 resources | 2000ms   | Stress test limit |

## Assertion Helpers

### Pipeline Validation

```typescript
expectPreparation(result); // Validates 7.1 output
expectOptimization(result); // Validates 7.2 output
expectIntegration(result); // Validates 7.3 output
expectPipelineConsistency(prepared, optimized, integrated);
```

### Performance Validation

```typescript
expectPerformance(timeElapsed, maxTime, taskCount);
expectDeterministic(result1, result2, compareFields);
```

### Edge Case Handling

```typescript
expectEdgeCaseHandling(result, "missing-skills");
expectEdgeCaseHandling(result, "zero-capacity");
expectEdgeCaseHandling(result, "blackout-days");
```

## Test Data Generation

### Static Fixtures

- **Small**: Pre-built realistic data for fast tests
- **Medium**: Complex multi-epic scenarios
- **Skills**: Comprehensive skill dependency mapping

### Dynamic Generation

```typescript
// Generates synthetic data for large-scale testing
const data = makeData({ tasks: 1000, resources: 150, days: 20 });

// Deterministic data for regression testing
const data = makeDetministicData(42); // Seed for reproducibility
```

## CI Integration

### GitHub Actions Integration

```yaml
- name: Module 7.x Regression Tests
  run: npm run test:reg

- name: Module 7.x Performance Tests
  run: npm run test:perf
```

### Coverage Requirements

- **Lines**: ≥85%
- **Statements**: ≥85%
- **Branches**: ≥75%
- **Functions**: ≥85%

## Debugging & Troubleshooting

### Performance Issues

1. Check console output for timing breakdowns
2. Verify time budgets are appropriate for dataset size
3. Monitor memory usage in large-scale tests

### Test Failures

1. Check fixture data integrity
2. Verify algorithm flags are set correctly
3. Ensure constraint parameters match test expectations

### Regression Detection

1. Compare performance metrics across test runs
2. Validate deterministic outputs for consistency
3. Check edge case handling hasn't changed

## Contributing

### Adding New Tests

1. Use existing helpers and fixtures where possible
2. Follow naming convention: `scenario.type.test.ts`
3. Include performance expectations for new scenarios
4. Add edge cases that exercise error handling

### Updating Fixtures

1. Maintain backward compatibility with existing tests
2. Document any changes to data structure
3. Verify all dependent tests still pass

### Performance Baselines

1. Run performance tests on consistent hardware
2. Update baselines only when genuine improvements are made
3. Document performance regression investigations

## Architecture Notes

This regression suite tests the integration points between Module 7.x components without requiring fully implemented algorithms. The mock implementations provide realistic behavior patterns while allowing the test suite to validate:

- **Interface Contracts**: APIs between modules work correctly
- **Data Flow**: Information passes correctly through the pipeline
- **Constraint Handling**: Edge cases and error conditions are managed
- **Performance Characteristics**: Time and memory requirements are met

The suite serves as both validation and documentation of the expected Module 7.x behavior, providing a safety net for refactoring and optimization work.
