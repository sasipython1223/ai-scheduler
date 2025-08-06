# 📈 AI Scheduler Development Roadmap (Modular Breakdown)

---

## 🧠 Copilot Instruction Block (for Copi#### **5.3 Implement Backward Pass (LS/LF)** ✅ COMPLETED

- ✅ Late Start (LS) calculation algorithm
- ✅ Late Finish (LF) calculation logic
- ✅ Reverse dependency traversal
- ✅ Multi-iteration processing for complex chains
- ✅ All logic types (FS, SS, FF, SF) support
- ✅ Float calculations (Total & Free)
- ✅ Critical path identification
- **Files**: `backend/src/services/cpm-backward-pass.ts`, `BackwardPassEngine.ts`, `FloatCalculator.ts`
- **Lines**: ~400 LOC (modular design)
- **Tests**: 20/20 CPM backward pass scenarios PASSING
- **Documentation**: [Complete Implementation](docs/module-5.3-backward-pass.md)y AI Assistance)

<!--
🧠 Copilot: AI Scheduler - Modular DevOps-Aware Development Guide

🏗️ Architecture Overview:
- Modular system with Clean Code principles and 4-phase roadmap
- Key components: Schedule Engine, Calendar Engine, Constraint Optimizer, Gantt UI, GenAI Agent
- AI Flow: User UI → Dispatcher API → BullMQ Queue → AI Worker → Postgres/Redis → Feedback Loop
- Full-stack: React + TypeScript (Frontend), Node.js + Express (Backend), PostgreSQL + Redis (DB)

📁 Folder Structure Convention:
- `frontend/src/components/gantt`, `taskTable`, `hooks`, `lib`, `state`
- `backend/src/services`, `jobs`, `controllers`, `routes`, `types`, `tests`
- `docs/`, `.github/workflows/`, `checklist.json`, `FINAL-PROJECT-SUMMARY.md`

🧪 DevOps Rules:
- ESLint + Prettier enforced with Husky pre-commit
- File size limit: ≤200 lines per file, modular services
- GitHub Actions `status.yml`: line count, PlantUML verification, quality gates
- `checklist.json`: real-time phase/module tracking with status, duration, dependencies
- Status updated on commit or PR using CI workflow

📆 Development Timeline:
- Follow 4-phase plan: Foundation → Engine → AI → Production
- Reference this file for 20 modules breakdown
- Each module broken into Level 4 sub-tasks: e.g., `5.2 Implement forward pass`, `8.3 Scroll + selection sync`
- Current phase: `Schedule Engine Complete` (Module 5.3 Backward Pass ✅ COMPLETED, ready for Module 5.4)

🤖 AI Integration:
- AI Dispatcher queues user prompts via BullMQ (Redis)
- AI Worker processes with OpenAI / Local LLM
- Results saved to Postgres and returned to UI
- Rejected suggestions sent to AI Trainer for offline fine-tuning

📌 Copilot Expectations:
- Respect modular breakdown (follow Level 4 sub-tasks)
- Generate reusable code: UI hooks, logic services, backend handlers
- Use TypeScript types from `/types`
- Follow naming conventions: `getTaskData`, `updateRowSchedule`, `enqueueAIJob`
- Auto-suggest unit tests alongside services
- Avoid mixing responsibilities (1 function = 1 file if possible)

📘 GitHub Project Integration:
- Issues linked to roadmap tasks (1–20)
- Status synced via GitHub Actions on push
- All branches tied to milestone modules
- Assignee and progress % auto-calculated

🎯 Goal:
- Enable scalable, clean, intelligent project scheduler with fully trackable roadmap
- Copilot suggestions must follow architectural vision and dev constraints
-->

---

## 🧭 **High-Level Development Order** (20-Module Roadmap)

1. **Project Initialization** ✅ COMPLETE
2. **Architecture Planning** ✅ COMPLETE
3. **Repository & DevOps Setup** ✅ COMPLETE
4. **Access, Secrets, Permissions** ✅ COMPLETE
5. **Develop Schedule Engine** 🔄 NEXT PRIORITY
6. **Add Constraint Optimizer** 📋 PLANNED
7. **Implement Calendar Engine** 📋 PLANNED
8. **Build Gantt UI / Task Table** 📋 PLANNED
9. **Enable Multi-user Editing** 📋 PLANNED
10. **Add Change/Audit/Note Layer** 📋 PLANNED
11. **What-if Simulator** 📋 PLANNED
12. **Delay Predictor (AI Model)** 📋 PLANNED
13. **Resource/Progress Forecast** 📋 PLANNED
14. **Baseline Generator** 📋 PLANNED
15. **Primavera/MSP Importer** 📋 PLANNED
16. **ERP / Procurement Sync** 📋 PLANNED
17. **GIS / 4D / BIM Integrator** 📋 PLANNED
18. **Automated + Manual Testing** 📋 PLANNED
19. **Docs + User Guide** 📋 PLANNED
20. **Internal Training** 📋 PLANNED

---

## 🧱 **Modular Detailed Breakdown** (Level 4 Granularity)

### **Module 5. 🛠 Develop Schedule Engine** 🔄 PRIORITY

**Target**: Week 4 (Aug 28, 2025) | **Dependencies**: Redis + BullMQ Complete

#### **5.1 Design Data Models**

- [ ] Task, WBS, Logic, Float interfaces
- [ ] Duration calculation types
- [ ] Critical path data structures
- **Files**: `backend/src/models/schedule-models.ts`, `backend/src/types/schedule-types.ts`
- **Lines**: ~150 LOC
- **Tests**: Unit tests for model validation

#### **5.2 Implement Forward Pass (ES/EF)**

- [ ] Early Start (ES) calculation algorithm
- [ ] Early Finish (EF) calculation logic
- [ ] Dependency chain traversal
- **Files**: `backend/src/services/cpm-forward-pass.ts`
- **Lines**: ~180 LOC
- **Tests**: CPM forward pass scenarios

#### **5.3 Implement Backward Pass (LS/LF)**

- [ ] Late Start (LS) calculation algorithm
- [ ] Late Finish (LF) calculation logic
- [ ] Reverse dependency traversal
- **Files**: `backend/src/services/cpm-backward-pass.ts`
- **Lines**: ~180 LOC
- **Tests**: CPM backward pass scenarios

#### **5.4 Calculate Float, Critical Path Flag**

- [ ] Total float calculation (LS - ES)
- [ ] Free float calculation
- [ ] Critical path identification (float = 0)
- **Files**: `backend/src/services/cpm-calculator.ts`
- **Lines**: ~120 LOC
- **Tests**: Float and critical path tests

#### **5.5 Build API to Accept Task List and Return Results**

- [ ] REST endpoint for schedule calculation
- [ ] Input validation and sanitization
- [ ] Response formatting with results
- **Files**: `backend/src/routes/schedule-api.ts`, `backend/src/controllers/schedule-controller.ts`
- **Lines**: ~160 LOC
- **Tests**: API integration tests

#### **5.6 Unit Test All Schedule Logic (1K, 5K, 10K Tasks)**

- [ ] Performance testing with large datasets
- [ ] Memory usage optimization
- [ ] Algorithm efficiency validation
- **Files**: `backend/src/tests/schedule-performance.test.ts`
- **Lines**: ~200 LOC
- **Tests**: Performance benchmarks

---

### **Module 6. 🔄 Add Constraint Optimizer** 📋 PLANNED

**Target**: Week 5 (Sep 4, 2025) | **Dependencies**: Schedule Engine Complete

#### **6.1 Define Constraint Types (Hard, Soft, Calendar)**

- [ ] Constraint interface definitions
- [ ] Hard constraint validation rules
- [ ] Soft constraint warning system
- **Files**: `backend/src/types/constraint-types.ts`, `backend/src/models/constraint-models.ts`
- **Lines**: ~140 LOC

#### **6.2 Implement Validation Engine**

- [ ] Constraint checking algorithms
- [ ] Violation detection and reporting
- [ ] Constraint resolution suggestions
- **Files**: `backend/src/services/constraint-validator.ts`
- **Lines**: ~200 LOC

#### **6.3 Connect to Schedule Engine for Constraint-Aware Recalculations**

- [ ] Integration with CPM engine
- [ ] Automatic schedule adjustment
- [ ] Constraint propagation logic
- **Files**: `backend/src/services/constraint-optimizer.ts`
- **Lines**: ~180 LOC

#### **6.4 Add UI Error Flag Feedback**

- [ ] Constraint violation indicators
- [ ] User-friendly error messages
- [ ] Resolution guidance display
- **Files**: `frontend/src/components/constraint-feedback.tsx`, `frontend/src/hooks/useConstraints.ts`
- **Lines**: ~120 LOC

---

### **Module 7. 📆 Implement Calendar Engine** 📋 PLANNED

**Target**: Week 6 (Sep 11, 2025) | **Dependencies**: Constraint Optimizer Complete

#### **7.1 Define Working Day Models**

- [ ] Standard work week definitions
- [ ] Custom work pattern support
- [ ] Holiday and exception handling
- **Files**: `backend/src/models/calendar-models.ts`, `backend/src/types/calendar-types.ts`
- **Lines**: ~160 LOC

#### **7.2 Support Holidays, Shifts, Exceptions**

- [ ] Holiday calendar integration
- [ ] Shift pattern definitions
- [ ] Exception rule processing
- **Files**: `backend/src/services/calendar-processor.ts`
- **Lines**: ~190 LOC

#### **7.3 Integrate with Schedule Engine Duration Logic**

- [ ] Working day calculation
- [ ] Duration adjustment for calendars
- [ ] Calendar-aware scheduling
- **Files**: `backend/src/services/calendar-integration.ts`
- **Lines**: ~170 LOC

#### **7.4 Add Project-Level and Task-Level Calendars**

- [ ] Hierarchical calendar inheritance
- [ ] Task-specific calendar overrides
- [ ] Calendar conflict resolution
- **Files**: `backend/src/services/calendar-hierarchy.ts`
- **Lines**: ~150 LOC

---

### **Module 8. 🖥 Build Gantt UI / Task Table** 📋 PLANNED

**Target**: Week 7-8 (Sep 18-25, 2025) | **Dependencies**: Calendar Engine Complete

#### **8.1 Gantt Canvas with Timeline Scaling**

- [ ] SVG-based Gantt chart rendering
- [ ] Zoom and pan functionality
- [ ] Timeline scale adjustment
- **Files**: `frontend/src/components/gantt/gantt-canvas.tsx`, `frontend/src/hooks/useGanttCanvas.ts`
- **Lines**: ~200 LOC

#### **8.2 TaskTable Grid with Editable Cells**

- [ ] Data grid implementation
- [ ] Inline editing capabilities
- [ ] Cell validation and formatting
- **Files**: `frontend/src/components/task-table/task-grid.tsx`, `frontend/src/hooks/useTaskGrid.ts`
- **Lines**: ~190 LOC

#### **8.3 Scroll + Selection Sync**

- [ ] Synchronized scrolling between table and Gantt
- [ ] Selection state management
- [ ] Multi-select functionality
- **Files**: `frontend/src/components/gantt/sync-controller.tsx`, `frontend/src/hooks/useScrollSync.ts`
- **Lines**: ~140 LOC

#### **8.4 Dependency Display + Drag-to-Link**

- [ ] Dependency line rendering
- [ ] Interactive dependency creation
- [ ] Drag-and-drop linking interface
- **Files**: `frontend/src/components/gantt/dependency-manager.tsx`, `frontend/src/hooks/useDependencies.ts`
- **Lines**: ~180 LOC

#### **8.5 View Toggles (WBS, Float, Slack)**

- [ ] View mode switching
- [ ] Column visibility controls
- [ ] Display preference persistence
- **Files**: `frontend/src/components/gantt/view-controls.tsx`, `frontend/src/hooks/useViewSettings.ts`
- **Lines**: ~120 LOC

---

### **Module 9. 👥 Enable Multi-user Editing** 📋 PLANNED

**Target**: Week 9 (Oct 2, 2025) | **Dependencies**: Gantt UI Complete

#### **9.1 User Session Manager**

- [ ] User authentication and session handling
- [ ] Active user tracking
- [ ] Permission-based access control
- **Files**: `backend/src/services/session-manager.ts`, `backend/src/middleware/auth.ts`
- **Lines**: ~160 LOC

#### **9.2 WebSocket Sync Engine**

- [ ] Real-time data synchronization
- [ ] WebSocket connection management
- [ ] Message broadcasting system
- **Files**: `backend/src/services/websocket-sync.ts`, `frontend/src/hooks/useWebSocket.ts`
- **Lines**: ~180 LOC

#### **9.3 Conflict Resolution Logic**

- [ ] Change conflict detection
- [ ] Automatic conflict resolution
- [ ] Manual conflict resolution UI
- **Files**: `backend/src/services/conflict-resolver.ts`, `frontend/src/components/conflict-dialog.tsx`
- **Lines**: ~200 LOC

#### **9.4 Change Queue & Merge Strategy**

- [ ] Change queue implementation
- [ ] Merge strategy algorithms
- [ ] Change history tracking
- **Files**: `backend/src/services/change-queue.ts`, `backend/src/services/merge-strategy.ts`
- **Lines**: ~170 LOC

---

### **Module 10. 📝 Add Change/Audit/Note Layer** 📋 PLANNED

**Target**: Week 10 (Oct 9, 2025) | **Dependencies**: Multi-user Editing Complete

#### **10.1 Audit Trail: Who/What/When**

- [ ] Change tracking system
- [ ] User action logging
- [ ] Timestamp and attribution
- **Files**: `backend/src/services/audit-trail.ts`, `backend/src/models/audit-models.ts`
- **Lines**: ~150 LOC

#### **10.2 Note + Comment System (Linked to Task ID)**

- [ ] Task-specific commenting
- [ ] Note thread management
- [ ] Comment notification system
- **Files**: `backend/src/services/comment-system.ts`, `frontend/src/components/comments/comment-panel.tsx`
- **Lines**: ~160 LOC

#### **10.3 GenAI Summary of Changes (Optional)**

- [ ] AI-powered change summarization
- [ ] Natural language change descriptions
- [ ] Smart change categorization
- **Files**: `backend/src/services/ai-change-summary.ts`, `backend/src/prompts/change-summary-prompts.ts`
- **Lines**: ~140 LOC

---

### **Module 11. 🧪 What-if Simulator** 📋 PLANNED

**Target**: Week 11 (Oct 16, 2025) | **Dependencies**: Audit Layer Complete

#### **11.1 Snapshot Current Baseline**

- [ ] Baseline creation and storage
- [ ] Snapshot versioning system
- [ ] Baseline comparison preparation
- **Files**: `backend/src/services/baseline-manager.ts`, `backend/src/models/baseline-models.ts`
- **Lines**: ~140 LOC

#### **11.2 Create New Simulation Layer**

- [ ] Simulation environment setup
- [ ] Isolated simulation state
- [ ] Simulation parameter configuration
- **Files**: `backend/src/services/simulation-engine.ts`, `frontend/src/components/simulation/sim-panel.tsx`
- **Lines**: ~180 LOC

#### **11.3 Toggle Between What-if vs Actual Plan**

- [ ] View mode switching
- [ ] Data layer switching
- [ ] Visual indication of simulation mode
- **Files**: `frontend/src/hooks/useSimulationMode.ts`, `frontend/src/components/simulation/mode-toggle.tsx`
- **Lines**: ~100 LOC

#### **11.4 Store and Compare KPIs**

- [ ] KPI calculation and storage
- [ ] Comparison analytics
- [ ] Impact assessment reporting
- **Files**: `backend/src/services/kpi-calculator.ts`, `frontend/src/components/simulation/kpi-comparison.tsx`
- **Lines**: ~160 LOC

---

### **Module 12. 🤖 Delay Predictor (AI Model)** 📋 PLANNED

**Target**: Week 12 (Oct 23, 2025) | **Dependencies**: What-if Simulator Complete

#### **12.1 Train Model with Known Delay Patterns**

- [ ] Historical data analysis
- [ ] Machine learning model training
- [ ] Pattern recognition algorithms
- **Files**: `backend/src/ai/delay-predictor.ts`, `backend/src/ai/training-data.ts`
- **Lines**: ~200 LOC

#### **12.2 Add Prediction Trigger on Schedule Load**

- [ ] Automatic prediction execution
- [ ] Schedule analysis triggers
- [ ] Prediction result integration
- **Files**: `backend/src/services/prediction-service.ts`, `backend/src/hooks/schedule-hooks.ts`
- **Lines**: ~130 LOC

#### **12.3 Visualize Delay Risk in Gantt / Table**

- [ ] Risk indicator visualization
- [ ] Delay probability display
- [ ] Risk-based color coding
- **Files**: `frontend/src/components/gantt/risk-indicators.tsx`, `frontend/src/hooks/useRiskVisualization.ts`
- **Lines**: ~150 LOC

#### **12.4 AI Feedback for GenAI Assistant**

- [ ] Feedback loop integration
- [ ] Assistant recommendation engine
- [ ] Learning from user corrections
- **Files**: `backend/src/ai/feedback-processor.ts`, `backend/src/services/ai-assistant.ts`
- **Lines**: ~170 LOC

---

## 📊 **Progress Tracking & GitHub Integration**

### **Immediate Next Steps**

1. **Complete Redis + BullMQ Setup** (Module 7 from previous roadmap)
2. **Begin Schedule Engine Development** (Module 5 - Priority)
3. **Create GitHub Issues** for each Level 4 sub-task
4. **Set up Project Board** with automated tracking

### **Development Metrics**

- **Target**: 2-3 sub-tasks per week
- **Quality Gates**: ESLint + Prettier + TypeScript compliance
- **Testing**: Unit tests for all business logic
- **Documentation**: Each module documented with examples

### **GitHub Project Setup**

- **Issues**: One issue per Level 4 sub-task
- **Milestones**: One milestone per module (5-20)
- **Labels**: `module-5`, `schedule-engine`, `high-priority`, etc.
- **Automation**: Auto-move issues based on PR status

---

**This modular roadmap provides Level 4 granularity perfect for GitHub project management and Copilot-assisted development!**
