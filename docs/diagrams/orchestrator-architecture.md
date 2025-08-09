# 🧩 Orchestrator Architecture Overview

This diagram illustrates the central role of the **Workflow Orchestrator** in:

- **Receiving inputs** from scheduling modules (Resources, Constraints, Delays, Progress)
- **Coordinating scope** and WBS data with task duration management
- **Delegating final computation** to the Schedule Engine for execution
- **Triggering AI services** for validation, optimization, and quality checks
- **Interfacing with external systems** like ERP, Primavera, and BIM integrators

## 🎯 Key Orchestrator Responsibilities

### **Input Coordination**

- Aggregates data from all core scheduling modules
- Manages change requests and audit trail integration
- Handles user-initiated schedule requests

### **AI Integration**

- Routes tasks to Gen AI for planning assistance
- Receives AI suggestions and generated task sequences
- Triggers quality checks via DCMA 14-Point compliance
- Coordinates runtime adjustments through AI prediction models

### **Output Management**

- Finalizes task sequences for the Schedule Engine
- Ensures data consistency across external systems
- Manages database persistence and ERP synchronization

## 📊 Visual Diagram

See [`orchestrator-architecture.puml`](./orchestrator-architecture.puml) for the complete architectural diagram.

## 🔗 Integration Points

| Component            | Direction     | Purpose                                  |
| -------------------- | ------------- | ---------------------------------------- |
| **User Interface**   | Input →       | Schedule requests and user interactions  |
| **AI Modules**       | Bidirectional | Suggestions, feedback, and optimizations |
| **Core Modules**     | Input →       | Resource, constraint, and progress data  |
| **Schedule Engine**  | Output →      | Finalized computation and execution      |
| **External Systems** | Output →      | Data synchronization and integration     |

## 🏗️ Architecture Benefits

- ✅ **Central coordination** prevents module conflicts
- ✅ **Event-driven architecture** enables responsive updates
- ✅ **AI integration** provides intelligent optimization
- ✅ **External compatibility** supports enterprise systems
- ✅ **Audit trail** ensures compliance and traceability

---

**For implementation details, see the main [Workflow Orchestrator documentation](../workflow-orchestrator.md).**
