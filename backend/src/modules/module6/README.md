# Module 6: Constraint Optimizer

## 🔧 Purpose

Introduce a constraint-aware scheduling layer on top of the core CPM engine, supporting both hard/soft constraints, validation, resolution, and UI feedback.

## 🧱 Submodule Roles

### **6.1 Constraint Types and Models** (📁 `module6.1-constraint-types/`)

- **Purpose**: Define reusable constraint types, interfaces, and model classes
- **Key Components**:
  - `constraint-types.ts` - Core constraint enums and interfaces
  - `constraint-models.ts` - Constraint model classes and collection management
- **Estimated LOC**: ~140
- **Status**: ✅ SCAFFOLD COMPLETE

### **6.2 Validation Engine** (📁 `module6.2-validation-engine/`)

- **Purpose**: Detect constraint violations and suggest resolutions
- **Key Components**:
  - `constraint-validator.ts` - Core validation logic engine
  - `violation-reporter.ts` - Logging and reporting utilities
- **Estimated LOC**: ~200
- **Status**: ✅ SCAFFOLD COMPLETE

### **6.3 Integration and Optimization** (📁 `module6.3-integration/`)

- **Purpose**: Integrate with CPM engine and optimize schedules while honoring constraints
- **Key Components**:
  - `constraint-optimizer.ts` - Integration with Schedule Engine (Module 5.x)
  - `constraint-propagator.ts` - Constraint propagation and recalculation logic
- **Estimated LOC**: ~180
- **Status**: ✅ SCAFFOLD COMPLETE

### **6.4 UI Feedback** (Frontend - Future)

- **Purpose**: Communicate constraint violations to end-users
- **Key Components**:
  - `constraint-feedback.tsx` - Constraint violation indicators
  - `useConstraints.ts` - Hook to fetch & display violations
- **Estimated LOC**: ~120
- **Status**: 📋 PLANNED

## 🧼 Clean Code Considerations

- ✅ Each submodule lives in its own folder
- ✅ Avoid circular imports by using `index.ts` boundaries
- ✅ File size limit < 250 LOC enforced
- ✅ Function complexity limit < 50 LOC where possible
- ✅ Test files colocated in `tests/module6/` using `*.test.ts` pattern
- ✅ JSDoc documentation for all public APIs
- ✅ TypeScript strict mode with no `any` types

## 📐 Architecture Overview

```
Module 6 Data Flow:
Task Table → Constraint Feedback UI → useConstraints Hook
                ↓
Constraint Optimizer ← Constraint Validator
        ↓                      ↓
Schedule Engine (5.x)    Violation Reporter
        ↓                      ↓
Constraint Propagator → Updated Schedule
```

## 🔄 Integration Points

### **With Module 5 (Schedule Engine)**

- Receives task lists from CPM calculations
- Validates constraints post-CPM
- Triggers schedule recalculation when violations detected
- Maintains critical path integrity during optimization

### **With Frontend (Future Module 6.4)**

- Provides real-time constraint violation feedback
- Displays error indicators per task row
- Offers quick fix suggestions and resolution guidance
- Supports batch validation for multiple tasks

## 🧪 Testing Strategy

### **Unit Tests** (`tests/module6/`)

- ✅ `module6.1-constraint-types.test.ts` - Type definitions and model validation
- 📋 `module6.2-validation-engine.test.ts` - Constraint validation scenarios
- 📋 `module6.3-integration.test.ts` - Optimization and propagation logic

### **Integration Tests**

- 📋 Constraint validation with real CPM data
- 📋 Schedule optimization with complex constraint sets
- 📋 Performance testing with 1K, 5K, 10K tasks

## 📦 Dependencies

- **Internal**: Module 5 (Schedule Engine)
- **External**: None (pure TypeScript implementation)
- **Dev**: Jest, TypeScript, ESLint

## 🚀 Implementation Status

| Submodule       | Scaffold   | Implementation | Tests      | Documentation |
| --------------- | ---------- | -------------- | ---------- | ------------- |
| 6.1 Types       | ✅ DONE    | 📋 PLANNED     | 📋 PLANNED | ✅ DONE       |
| 6.2 Validation  | ✅ DONE    | 📋 PLANNED     | 📋 PLANNED | ✅ DONE       |
| 6.3 Integration | ✅ DONE    | 📋 PLANNED     | 📋 PLANNED | ✅ DONE       |
| 6.4 UI Feedback | 📋 PLANNED | 📋 PLANNED     | 📋 PLANNED | 📋 PLANNED    |

## 🎯 Next Steps

1. **Complete Module 6.1 Implementation**
   - Implement concrete constraint classes (DateConstraint, DurationConstraint, etc.)
   - Add constraint factory and template system
   - Create comprehensive unit tests

2. **Build Module 6.2 Validation Engine**
   - Implement core validation algorithms
   - Add violation detection and suggestion generation
   - Create performance-optimized batch validation

3. **Integrate Module 6.3 with CPM Engine**
   - Connect to Module 5 Schedule Engine
   - Implement constraint-aware optimization
   - Add propagation logic for schedule changes

4. **Plan Module 6.4 UI Components**
   - Design constraint feedback UI components
   - Create React hooks for constraint management
   - Plan real-time violation display system

---

**Module 6 provides the foundation for intelligent, constraint-aware project scheduling with automated violation detection and resolution suggestions.**
