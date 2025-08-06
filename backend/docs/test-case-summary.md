# CPM Forward Pass Test Case Summary

This document shows the input data and computed results for all CPM forward pass test scenarios.


## Scenario 1: Single Task

**Project Start:** 04 Aug 2025

| Task ID | Name | Duration | Predecessors | Logic Type | Lag | Early Start | Early Finish |
|---------|------|----------|--------------|------------|-----|-------------|---------------|
| A | Single Task | 5 | – | – | – | 04 Aug 2025 | 11 Aug 2025 |

**Project End:** 11 Aug 2025


## Scenario 2: Simple Linear Chain (A → B → C)

**Project Start:** 04 Aug 2025

| Task ID | Name | Duration | Predecessors | Logic Type | Lag | Early Start | Early Finish |
|---------|------|----------|--------------|------------|-----|-------------|---------------|
| A | Analysis | 3 | – | – | – | 04 Aug 2025 | 07 Aug 2025 |
| B | Design | 2 | A | FS | 0 | 08 Aug 2025 | 12 Aug 2025 |
| C | Implementation | 4 | B | FS | 0 | 13 Aug 2025 | 19 Aug 2025 |

**Project End:** 19 Aug 2025


## Scenario 3: Parallel Paths with Convergence

**Project Start:** 04 Aug 2025

| Task ID | Name | Duration | Predecessors | Logic Type | Lag | Early Start | Early Finish |
|---------|------|----------|--------------|------------|-----|-------------|---------------|
| A | Requirements | 5 | – | – | – | 04 Aug 2025 | 11 Aug 2025 |
| B | Architecture | 7 | – | – | – | 04 Aug 2025 | 13 Aug 2025 |
| C | Integration | 3 | A, B | FS, FS | 0, 0 | 14 Aug 2025 | 19 Aug 2025 |

**Project End:** 19 Aug 2025


## Scenario 4: Different Logic Link Types

**Project Start:** 04 Aug 2025

| Task ID | Name | Duration | Predecessors | Logic Type | Lag | Early Start | Early Finish |
|---------|------|----------|--------------|------------|-----|-------------|---------------|
| A | Foundation | 5 | – | – | – | 04 Aug 2025 | 11 Aug 2025 |
| B | Start-to-Start Task | 3 | A | SS | 0 | 04 Aug 2025 | 07 Aug 2025 |
| C | Finish-to-Finish Task | 4 | A | FF | 0 | 11 Aug 2025 | 15 Aug 2025 |

**Project End:** 15 Aug 2025


## Scenario 5: Lag Values (Delay and Overlap)

**Project Start:** 04 Aug 2025

| Task ID | Name | Duration | Predecessors | Logic Type | Lag | Early Start | Early Finish |
|---------|------|----------|--------------|------------|-----|-------------|---------------|
| A | Base Task | 4 | – | – | – | 04 Aug 2025 | 08 Aug 2025 |
| B | Delayed Task | 3 | A | FS | 2 | 13 Aug 2025 | 18 Aug 2025 |
| C | Overlapping Task | 2 | A | FS | -1 | 08 Aug 2025 | 12 Aug 2025 |

**Project End:** 18 Aug 2025


## Scenario 6: Milestone Tasks (Zero Duration)

**Project Start:** 04 Aug 2025

| Task ID | Name | Duration | Predecessors | Logic Type | Lag | Early Start | Early Finish |
|---------|------|----------|--------------|------------|-----|-------------|---------------|
| A | Development | 5 | – | – | – | 04 Aug 2025 | 11 Aug 2025 |
| B | Milestone: Phase 1 Complete | 0 | A | FS | 0 | 12 Aug 2025 | 12 Aug 2025 |
| C | Testing | 3 | B | FS | 0 | 13 Aug 2025 | 18 Aug 2025 |

**Project End:** 18 Aug 2025


## Scenario 7: Complex Mixed Dependencies

**Project Start:** 04 Aug 2025

| Task ID | Name | Duration | Predecessors | Logic Type | Lag | Early Start | Early Finish |
|---------|------|----------|--------------|------------|-----|-------------|---------------|
| A | Planning | 2 | – | – | – | 04 Aug 2025 | 06 Aug 2025 |
| B | Design UI | 4 | A | FS | 0 | 07 Aug 2025 | 13 Aug 2025 |
| C | Design API | 3 | A | FS | 0 | 07 Aug 2025 | 12 Aug 2025 |
| D | Development | 6 | B, C | SS, FS | 1, 0 | 13 Aug 2025 | 21 Aug 2025 |
| E | Testing | 2 | D | FS | 0 | 22 Aug 2025 | 26 Aug 2025 |

**Project End:** 26 Aug 2025

