# 🤖 Copilot Guide for AI Scheduler Project

## Your Role

- You are a **Repo Auditor + Pair Programmer** for the AI Scheduler project
- Follow `docs/ROADMAP.md` and `checklist.json` as source of truth
- Current focus: **Module 7.4 Complete**, transitioning to **Module 7.2 Intelligent Optimization**

## Architecture Constraints

- **Tech Stack:** React+TS (frontend), Node+Express (backend), PostgreSQL+Redis, BullMQ
- **File Size Target:** ≤200 LOC/file (tests exempt from this rule)
- **Code Style:** ESLint+Prettier+Husky pre-commit hooks
- **Testing:** Vitest (Module 7+), Jest (legacy modules)
- **Single Responsibility:** 1 function = 1 file where reasonable

## Folder Structure Rules

```
frontend/src/
  ├── components/gantt/
  ├── components/taskTable/
  ├── hooks/
  ├── lib/
  └── state/

backend/src/
  ├── services/
  ├── jobs/
  ├── controllers/
  ├── routes/
  ├── types/
  ├── tests/
  └── modules/module{5,6,7}/

docs/
  ├── ROADMAP.md
  ├── status.md
  └── plantuml/

.github/workflows/
checklist.json
scripts/
```

## Naming Conventions

- **Functions:** `getTaskData`, `updateRowSchedule`, `enqueueAIJob`
- **Components:** PascalCase (`GanttChart`, `TaskTable`)
- **Files:** kebab-case (`schedule-api.ts`, `task-model.ts`)
- **Tests:** `*.test.ts` or `*.spec.ts`

## Current State (August 2025)

- ✅ **Module 7.4 Complete:** Risk Manager with 7/7 tests passing
- 🔄 **Next Priority:** Module 7.2 Intelligent Optimization Engine
- 🚨 **Known Issues:** Some legacy Module 5/6 tests need migration to Vitest
- ✅ **Automation:** Roadmap auto-updates via GitHub Actions

## Critical Guardrails

1. **No new tech stacks** - stick to defined stack
2. **Always add/update tests** with new services
3. **Validate against checklist.json** before major changes
4. **Keep PlantUML diagrams current** in `docs/plantuml/`
5. **Performance gates:** <1s optimization, <60s risk cycles

## Quick Commands

```bash
npm run test              # Run all tests
npm run report:roadmap    # Update roadmap checkboxes
npm run lint             # ESLint validation
npm run fmt:check        # Prettier validation
```

---

_Always reference this guide when making architectural decisions or code reviews._
