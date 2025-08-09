/\*\*

- 📏 Clean Code Enforcement Policy for GitHub Copilot
- AI Scheduler Project - Module 5.4 Standards
  \*/

# Clean Code & File Size Policy

## 🚧 Source Code Files (`.ts`, `.tsx`, `.service.ts`)

### Line Limits

- ✅ **Preferred**: Keep files under **250 lines**
- ✅ **Acceptable**: Up to **270 lines** if modularity would reduce clarity
- ⚠️ **Warning**: Never exceed **300 lines** in production code
- 🚫 **Forbidden**: Deleting comments, JSDoc, or interface definitions to shrink size

### Refactoring Strategy

- ✅ **DO**: Modularize by extracting functions, helpers, or subcomponents
- ✅ **DO**: Break down into smaller files with clear naming:
  - `*.utils.ts` (utility functions)
  - `*.helpers.ts` (helper functions)
  - `*.types.ts` (type definitions)
  - `*.validators.ts` (validation logic)
  - `*.processors.ts` (data processing)

### SOLID Principles

- ✅ Preserve readability and maintainability
- ✅ Maintain Single Responsibility Principle
- ✅ Keep interfaces segregated
- ✅ Prefer composition over inheritance

## 🧪 Test Files (`.test.ts`, `*-test.ts`)

### Line Limits

- ✅ **May exceed 250 lines** due to comprehensive test coverage requirements
- ✅ **Acceptable**: Up to 500+ lines for comprehensive test suites
- 🚫 **DO NOT**: Compress or remove test descriptions or documentation
- ✅ **DO**: Prefer readable test sections and clear category headers

### Test Structure

- ✅ Keep large test files well structured with comment dividers
- ✅ Use descriptive test names and assertion messages
- ✅ Group related tests with clear section headers
- ✅ Include performance benchmarks and edge case documentation

### Test File Organization

For test files over 500 lines, consider:

- Splitting by test categories (e.g., `float-calc-tests.ts`, `performance-tests.ts`)
- Using test suites with describe blocks
- Extracting test data to separate files

## 💡 Modularization Suggestions

### When File Exceeds Limits

Copilot should prompt: "Consider modularizing this file into [X] helper files"

### Suggested File Structure Examples

#### FloatCalculator Modularization (333 lines → modularize)

```
FloatCalculator/
├── index.ts                    (main exports)
├── FloatCalculationCore.ts     (core calculation logic)
├── FloatValidationUtils.ts     (validation functions)
├── BatchProcessingHelper.ts    (batch operations)
└── types.ts                    (type definitions)
```

#### CriticalPathAnalyzer Modularization (318 lines → modularize)

```
CriticalPathAnalyzer/
├── index.ts                    (main exports)
├── CriticalPathCore.ts         (core detection logic)
├── PathValidationUtils.ts      (validation functions)
├── CriticalPathTypes.ts        (type definitions)
└── PathHelpers.ts              (utility functions)
```

#### TaskFlagAssigner (270 lines → acceptable but monitor)

- Currently within acceptable limits
- Well-structured with clear separation of concerns
- Monitor for future growth

#### Module54Service (272 lines → acceptable)

- Good orchestration service structure
- Clear separation of concerns
- Excellent modularity with helper services

## 🎯 Implementation Status

### Current File Analysis (Module 5.4)

- ✅ `index.ts`: 71 lines - Excellent
- ✅ `CriticalPathHelpers.ts`: 173 lines - Good
- ✅ `TaskFlagAssigner.ts`: 270 lines - Acceptable (monitor)
- ✅ `Module54Service.ts`: 272 lines - Acceptable (monitor)
- ⚠️ `manual-test-runner.ts`: 283 lines - Test file (acceptable)
- ⚠️ `FloatCalculator.ts`: 333 lines - **Needs modularization**
- ⚠️ `CriticalPathAnalyzer.ts`: 318 lines - **Needs modularization**
- ✅ `extended-test-optimized.ts`: 381 lines - Test file (acceptable)
- ✅ `extended-comprehensive-test.ts`: 583 lines - Test file (acceptable)

### Priority Actions

1. **High Priority**: Modularize `FloatCalculator.ts` (333 lines)
2. **High Priority**: Modularize `CriticalPathAnalyzer.ts` (318 lines)
3. **Monitor**: Watch `TaskFlagAssigner.ts` and `Module54Service.ts` for growth

## 📋 ESLint Configuration

### Recommended ESLint Rules

```javascript
// eslint.config.js or .eslintrc.js
rules: {
  'max-lines': [
    'warn',
    {
      max: 250,
      skipComments: true,
      skipBlankLines: true,
    },
  ],
  'max-lines-per-function': ['warn', { max: 50, skipComments: true }],
  'complexity': ['warn', { max: 10 }],
},
overrides: [
  {
    files: ['*.test.ts', '*-test.ts', 'test-*.ts'],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
    },
  },
],
```

## 🔍 Quality Metrics

### Maintainability Index

- Files under 250 lines: **High maintainability**
- Files 250-300 lines: **Medium maintainability** (monitor)
- Files over 300 lines: **Low maintainability** (refactor required)

### Code Complexity

- Prefer functions under 50 lines
- Limit cyclomatic complexity to 10
- Use meaningful variable and function names
- Maintain clear separation of concerns

## 🎉 Benefits

### For Developers

- ✅ Easier code review and debugging
- ✅ Better code reusability
- ✅ Improved testing coverage
- ✅ Reduced cognitive load

### For AI/Copilot

- ✅ Better context understanding
- ✅ More accurate code suggestions
- ✅ Improved refactoring recommendations
- ✅ Enhanced code completion

### For Project

- ✅ Better maintainability
- ✅ Improved team collaboration
- ✅ Faster development cycles
- ✅ Higher code quality

---

**Last Updated**: August 6, 2025  
**Project**: AI Scheduler - Module 5.4  
**Status**: Implemented and Active
