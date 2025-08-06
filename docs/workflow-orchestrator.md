# 🧠 AI Scheduler — Workflow Orchestrator Design

The **Workflow Orchestrator** is the central brain of the system. It listens to user or system events and coordinates which modules should run, when, and in what order — while enforcing constraints, approvals, and integration boundaries.

---

## 🎯 Core Responsibilities

### 1. Execution & Trigger Management

| Function                         | Description                                        |
| -------------------------------- | -------------------------------------------------- |
| ✅ Auto-trigger schedule updates | React to changes in task data, dates, dependencies |
| ✅ Debounced execution           | Avoid redundant recomputes during rapid edits      |
| ✅ Batch updates                 | Recompute in bulk (e.g. on paste/import/mass edit) |
| ✅ Dependency resolution         | Only recompute affected parts of the schedule      |
| ✅ Auto-baseline snapshots       | Save before applying changes for traceability      |

---

### 2. Orchestration of Scheduling Modules

| Module                      | Action Orchestrated                                          |
| --------------------------- | ------------------------------------------------------------ |
| 🧠 **CPM Engine**           | Forward/backward pass, float, critical path                  |
| ⛓️ **Constraint Optimizer** | Soft/hard constraint enforcement                             |
| 📉 **Delay Predictor**      | Run ML model if real-time progress deviates                  |
| 👷 **Resource Forecaster**  | Update resource curves when dates shift                      |
| 🤖 **AI Copilot**           | Invoke assistant when user requests help or after bulk edits |

---

### 3. Governance & Workflow Logic

| Logic                | Responsibility                                     |
| -------------------- | -------------------------------------------------- |
| 🔐 Change Approval   | Pause execution until user review/accept           |
| 👥 Role Routing      | Assign approvals to proper stakeholder group       |
| 📏 Compliance Checks | Ensure DCMA, ISO, or contract rules are followed   |
| 📚 Audit Logs        | Track when/why a module was triggered, and by whom |

---

### 4. Event-Driven Integration

| Event                              | Action Triggered                              |
| ---------------------------------- | --------------------------------------------- |
| ✏️ Task edited                     | Recompute schedule (debounced)                |
| 🌀 Drag/drop tasks                 | Trigger soft what-if recalculation            |
| 📅 Site diary update (rain, issue) | Run delay predictor or what-if                |
| 🏗️ ERP material arrival delay      | Adjust constraints, reschedule impacted tasks |
| 💬 AI Copilot suggestion           | Await user accept → then apply + recompute    |

---

### 5. API Layer & Webhooks (Optional)

| API / Hook              | Role                                   |
| ----------------------- | -------------------------------------- |
| `POST /schedule/update` | Submit changes from UI/API             |
| `GET /schedule/status`  | Get current recompute status           |
| `POST /hook/erp-update` | Accepts live data from procurement/GIS |

---

## 🧩 Implementation Notes

- Orchestrator will be a **central service layer** (e.g., `services/orchestrator.ts`)
- Uses an **event bus pattern** or a lightweight `emit('event') → run('module')`
- Each module is a loosely coupled service with:
  - `canRun(eventType)`
  - `run(payload)`
- Logs and snapshots stored for rollback, audit, testing

---

## 💡 Optional Enhancements

| Feature             | Benefit                                         |
| ------------------- | ----------------------------------------------- |
| 🧭 Visual dashboard | Shows triggered modules and status              |
| ⏳ Priority queue   | Ensures fast feedback tasks run first           |
| 🔁 Retry mechanism  | For transient module errors (e.g., AI failover) |

---

## 📌 Usage in Development

📂 **File Locations:**

- `.vscode/workflow-orchestrator.md` (VS Code workspace reference)
- `docs/workflow-orchestrator.md` (Project documentation)

📘 **Developers should refer to this whenever:**

- Adding a new module (e.g. AI, Forecasting)
- Connecting user actions (UI) to scheduling logic
- Debugging auto-recompute behavior
- Verifying module run order / isolation

---

## 🏗️ Architecture Integration

### **Visual Architecture Diagrams**

📊 **Complete System Overview**: [`docs/diagrams/architecture.puml`](./diagrams/architecture.puml)

📊 **Focused Orchestrator View**: [`docs/diagrams/orchestrator-architecture.puml`](./diagrams/orchestrator-architecture.puml)

The diagrams show the Workflow Orchestrator as the central coordination hub connecting:

- **Core Scheduling System** (WBS, Resources, Constraints, Schedule Engine)
- **AI & Analytics** (Gen AI, Prediction Models, Quality Checker)
- **External Integrations** (ERP, Primavera, BIM/4D)

### **Connection to AI Agent System**

The Workflow Orchestrator integrates with our existing AI Agent architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ User Interface  │────│ Orchestrator    │────│ AI Dispatcher   │
│ (React + TS)    │    │ (Event Bus)     │    │ (BullMQ Queue)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                │                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ CPM Engine      │◄───│ Module Registry │    │ AI Worker Pool  │
│ Constraint Opt. │    │ (Service Loader)│    │ (LLM Processing)│
│ Delay Predictor │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Event Flow Example**

```typescript
// User edits task → Orchestrator → Multiple modules
userEditTask() →
  orchestrator.emit('task.updated') →
    [CPMEngine.run(), AIDispatcher.queue(), AuditLogger.log()]
```

---

## 🛠️ Implementation Skeleton

### **Core Orchestrator Service**

```typescript
// services/orchestrator.ts
export class WorkflowOrchestrator {
  private modules: Map<string, SchedulingModule> = new Map();
  private eventBus: EventEmitter = new EventEmitter();

  async handleEvent(event: ScheduleEvent): Promise<void> {
    // Debouncing, validation, routing logic
  }

  registerModule(name: string, module: SchedulingModule): void {
    // Module registration and lifecycle management
  }
}
```

### **Module Interface**

```typescript
// types/modules.ts
interface SchedulingModule {
  canRun(event: ScheduleEvent): boolean;
  run(payload: any): Promise<ScheduleResult>;
  priority: number;
  dependencies?: string[];
}
```

### **Event Types**

```typescript
// types/events.ts
type ScheduleEvent =
  | "task.created"
  | "task.updated"
  | "task.deleted"
  | "dependency.changed"
  | "resource.allocated"
  | "ai.suggestion.received"
  | "external.erp.update";
```

---

## 📋 Development Checklist

### **Phase 1: Foundation**

- [ ] Create orchestrator service structure
- [ ] Implement event bus pattern
- [ ] Add module registration system
- [ ] Create basic event types and interfaces

### **Phase 2: Core Modules**

- [ ] Integrate CPM Engine module
- [ ] Add constraint optimization module
- [ ] Connect AI Dispatcher to orchestrator
- [ ] Implement audit logging module

### **Phase 3: Advanced Features**

- [ ] Add debouncing and batch processing
- [ ] Implement approval workflows
- [ ] Add retry mechanisms and error handling
- [ ] Create orchestrator status dashboard

### **Phase 4: External Integration**

- [ ] Add webhook endpoints for ERP systems
- [ ] Implement real-time progress monitoring
- [ ] Add compliance checking modules
- [ ] Create performance monitoring and metrics

---

## 🎯 Next Steps

**Immediate Actions:**

1. **Create orchestrator service skeleton** (`backend/src/services/orchestrator.ts`)
2. **Define module interfaces** (`backend/src/types/modules.ts`)
3. **Implement basic event system** using Node.js EventEmitter
4. **Connect to existing AI Agent architecture**

**Integration Points:**

- Connect to existing BullMQ queue system
- Integrate with current Express.js API routes
- Link to Zustand state management in frontend
- Utilize existing Redis caching infrastructure

---

🛠️ **Ready for Implementation**: This design integrates seamlessly with your existing AI Scheduler architecture and provides a solid foundation for orchestrating complex scheduling workflows.
