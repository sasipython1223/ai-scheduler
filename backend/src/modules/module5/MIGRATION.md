# Module 5 Migration Guide

This guide helps migrate existing code to use the new modular Module 5 structure.

## 📦 Import Path Changes

### Old vs New Import Paths

#### Core Engine (Module 5.1)

```typescript
// OLD
import { ScheduleEngine } from '../domain/schedule-engine';
import { calculateDuration } from '../services/pipeline-utils';

// NEW
import { ScheduleEngine } from './modules/module5/module5.1-core-engine/schedule-core';
import { calculateFloatDistribution } from './modules/module5/module5.1-core-engine/schedule-math';

// OR use the main module export
import { ScheduleEngine, calculateFloatDistribution } from './modules/module5';
```

#### Forward Pass (Module 5.2)

```typescript
// OLD
import { computeForwardPass } from '../services/cpm-forward-pass-refactored';
import { calculateConstraintDate } from '../services/cmp-forward-pass.utils';

// NEW
import {
  computeForwardPass,
  ForwardPassCalculator,
} from './modules/module5/module5.2-forward-pass/forward-pass-engine';
import { calculateConstraintDate } from './modules/module5/module5.2-forward-pass/forward-pass-utils';

// OR use the main module export
import { computeForwardPass, calculateConstraintDate } from './modules/module5';
```

#### Backward Pass (Module 5.3)

```typescript
// OLD
import { computeBackwardPass } from '../services/cmp-backward-pass.utils';
import { BackwardPassEngine } from '../services/BackwardPassEngine';
import { FloatCalculator } from '../services/FloatCalculator';

// NEW
import { computeBackwardPass } from './modules/module5/module5.3-backward-pass/backward-pass-engine';
import { BackwardPassEngine } from './modules/module5/module5.3-backward-pass/backward-pass-processor';
import { FloatCalculator } from './modules/module5/module5.3-backward-pass/float-calculator';

// OR use the main module export
import {
  computeBackwardPass,
  BackwardPassEngine,
  FloatCalculator,
} from './modules/module5';
```

#### Float/Critical Analysis (Module 5.4)

```typescript
// OLD
import { CriticalPathAnalyzer } from '../services/module5.4/CriticalPathAnalyzer';
import { TaskFlagAssigner } from '../services/module5.4/TaskFlagAssigner';

// NEW
import { CriticalPathAnalyzer } from './modules/module5/module5.4-float-critical/CriticalPathAnalyzer';
import { TaskFlagAssigner } from './modules/module5/module5.4-float-critical/TaskFlagAssigner';

// OR use the main module export
import { CriticalPathAnalyzer, TaskFlagAssigner } from './modules/module5';
```

#### API (Module 5.5)

```typescript
// OLD
import { ScheduleApiRoutes } from '../routes/schedule-api';
import { ScheduleController } from '../controllers/schedule-controller';

// NEW
import { ScheduleApiRoutes } from './modules/module5/module5.5-api/schedule-api.route';
import { ScheduleController } from './modules/module5/module5.5-api/schedule-controller';

// OR use the main module export
import { ScheduleApiRoutes, ScheduleController } from './modules/module5';
```

#### Performance (Module 5.6)

```typescript
// OLD
import { generateTasks } from '../services/performance-generator';
import { PerformanceLogger } from '../services/performance-logger';

// NEW
import { generateTasks } from './modules/module5/module5.6-performance/performance-generator';
import { PerformanceLogger } from './modules/module5/module5.6-performance/performance-logger';

// OR use the main module export
import { generateTasks, PerformanceLogger } from './modules/module5';
```

## 🔄 Code Migration Examples

### Example 1: Basic Schedule Processing

```typescript
// OLD
import { ScheduleEngine } from '../domain/schedule-engine';
import { computeForwardPass } from '../services/cpm-forward-pass-refactored';
import { computeBackwardPass } from '../services/cmp-backward-pass.utils';

const engine = new ScheduleEngine();
const forwardResult = computeForwardPass(tasks, links);
const backwardResult = computeBackwardPass(forwardResult.tasks);

// NEW - Using main module export
import {
  ScheduleEngine,
  computeForwardPass,
  computeBackwardPass,
} from './modules/module5';

const engine = new ScheduleEngine();
const forwardResult = computeForwardPass(tasks, links);
const backwardResult = computeBackwardPass(forwardResult.tasks);
```

### Example 2: API Integration

```typescript
// OLD
import { ScheduleApiRoutes } from '../routes/schedule-api';
import { ScheduleController } from '../controllers/schedule-controller';
import { ScheduleService } from '../services/schedule-service';

const routes = new ScheduleApiRoutes();
const controller = new ScheduleController();
const service = new ScheduleService();

// NEW
import {
  ScheduleApiRoutes,
  ScheduleController,
  ScheduleService,
} from './modules/module5';

const routes = new ScheduleApiRoutes();
const controller = new ScheduleController();
const service = new ScheduleService();
```

### Example 3: Performance Testing

```typescript
// OLD
import { generateComplexTasks } from '../services/performance-generator';
import { PerformanceLogger } from '../services/performance-logger';

const testTasks = generateComplexTasks(1000);
const logger = new PerformanceLogger();

// NEW
import { generateComplexTasks, PerformanceLogger } from './modules/module5';

const testTasks = generateComplexTasks(1000);
const logger = new PerformanceLogger();
```

## 📋 Migration Checklist

### Step 1: Update Import Statements

- [ ] Replace old import paths with new module paths
- [ ] Use main module export (`./modules/module5`) for convenience
- [ ] Update relative paths in your files

### Step 2: Update Type Imports

```typescript
// OLD
import { TaskInput, ScheduledTask } from '../types/scheduleTypes';

// NEW
import { TaskInput, ScheduledTask } from './modules/module5/shared-types';
// OR
import { TaskInput, ScheduledTask } from './modules/module5';
```

### Step 3: Update Test Files

```typescript
// OLD
import { ScheduleEngine } from '../../src/domain/schedule-engine';

// NEW
import { ScheduleEngine } from '../../src/modules/module5';
```

### Step 4: Update Configuration Files

Update any configuration or build files that reference the old paths:

```json
// tsconfig.json paths mapping
{
  "compilerOptions": {
    "paths": {
      "@module5/*": ["src/modules/module5/*"],
      "@schedule-engine": ["src/modules/module5/index"]
    }
  }
}
```

## 🚨 Breaking Changes

### Renamed Exports

1. `calculateDuration` → `calculateFloatDistribution`
2. `parseDurationToMinutes` → `calculateAverageFloat`
3. `validateScheduleRequest` → `ScheduleValidator` class
4. `scheduleApiRouter` → `createScheduleRoutes` function

### Changed Function Signatures

Some functions may have updated signatures. Check the new type definitions in `shared-types.ts`.

### Removed Exports

The following exports are no longer available:

- `processTasksInOrder` (internal utility)
- `calculateEarlyFinish` (internal utility)
- `validateForwardPassInputs` (internal utility)

## 🔧 Auto-Migration Script

You can use this PowerShell script to help with the migration:

```powershell
# Replace old import paths
Get-ChildItem -Path "src" -Recurse -Include "*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw

    # Update import paths
    $content = $content -replace "from '\.\./domain/schedule-engine'", "from './modules/module5'"
    $content = $content -replace "from '\.\./services/cmp-forward-pass-refactored'", "from './modules/module5'"
    $content = $content -replace "from '\.\./services/cmp-backward-pass\.utils'", "from './modules/module5'"

    Set-Content -Path $_.FullName -Value $content
}
```

## ✅ Verification

After migration, verify everything works:

1. **Compile Check**: `npm run build`
2. **Test Suite**: `npm test`
3. **Type Check**: `npm run type-check`
4. **Linting**: `npm run lint`

## 🆘 Troubleshooting

### Common Issues

1. **Module not found errors**: Check import paths are correct
2. **Type errors**: Ensure you're importing types from `shared-types.ts`
3. **Circular dependencies**: Use the main module export to avoid circular imports
4. **Missing exports**: Check the new export names in the migration guide

### Getting Help

If you encounter issues during migration:

1. Check the module README.md files
2. Review the type definitions in shared-types.ts
3. Look at the test files for usage examples
4. Check the GitHub issues for known migration problems

---

**Migration Support**: This guide covers all known migration scenarios. The modular structure maintains backward compatibility where possible while providing a cleaner, more maintainable codebase.
