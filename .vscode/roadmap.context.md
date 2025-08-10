# Workspace Context: AI Scheduler Roadmap (Authoritative)

- **Source of truth files:** docs/ROADMAP.md, docs/Development-Roadmap-Breakdown.md, checklist.json
- **CI gate:** .github/workflows/roadmap-status.yml → generates docs/status.md from scripts/check-roadmap.mjs
- **Enforced rules:** ESLint+Prettier+Husky, ≤200 LOC/file (soft), 1 function/file where reasonable
- **Current target:** Module 7.2 Intelligent Optimization Engine (Module 7.4 Risk Manager complete with 7/7 tests)
- **Testing:** Vitest (Module 7+), Jest (legacy Module 5/6)
- **Required folders:**
  - frontend/src/components/{gantt,taskTable}/
  - backend/src/{services,jobs,controllers,routes,types,tests,modules/module{5,6,7}}
  - docs/, .github/workflows/
- **Canonical naming:** getTaskData, updateRowSchedule, enqueueAIJob
- **Tech stack:** React+TS (frontend), Node+Express (backend), PostgreSQL+Redis, BullMQ
- **Performance targets:** <10s optimization for 10k tasks, <60s risk cycles for 5k tasks
- **Integration points:** Module 5 (Schedule Engine) ↔ Module 6 (Constraints) ↔ Module 7 (Optimization)
