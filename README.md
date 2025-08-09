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
- Reference `Development-Roadmap-Breakdown.md` with 20 modules
- Each module broken into Level 4 sub-tasks: e.g., `5.2 Implement forward pass`, `8.3 Scroll + selection sync`
- Current phase: `Redis + BullMQ Setup` (Module #7)

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

<!--
🧠 GitHub Copilot Instruction Block: AI Scheduler

🏗️ Architecture Summary:
- Modular AI-powered project scheduling platform
- Key modules: Schedule Engine, Constraint Optimizer, Workflow Orchestrator, GenAI Assistant
- Technologies: React + TypeScript, Express + Node.js, Prisma + PostgreSQL, Redis + BullMQ
- AI Integration: OpenAI API, Local LLM support, prompt engineering, feedback loops
- Follows Clean Code principles with 4-phase development roadmap

📁 Project Structure:
- frontend/: React + TypeScript + Tailwind CSS + Zustand + TanStack Query
- backend/: Express + TypeScript + Prisma ORM
- database/: PostgreSQL/SQLite with Prisma migrations
- docs/: Architecture diagrams (PlantUML), AI integration guides, roadmaps
- .vscode/: Complete workspace with debugging, tasks, settings

📌 Development Guidelines:
- File size limit: ≤200 lines per service, ≤100 lines per controller
- Modular architecture: services/, controllers/, models/, utils/, types/
- Quality gates: ESLint + Prettier + Husky pre-commit hooks
- Testing: Jest for backend, Vitest for frontend (when implemented)
- Documentation: Every module documented with purpose and integration points

🤖 AI Integration Pattern:
- AI Dispatcher routes jobs to BullMQ queue
- AI Workers process prompts via OpenAI/Local LLM
- Results cached in Redis, persisted in PostgreSQL
- Feedback loop captures user corrections for model improvement
- Workflow Orchestrator coordinates all AI and scheduling modules

✅ Copilot Expectations:
- Follow modular roadmap in docs/Development-Roadmap-Breakdown.md
- Reference checklist.json for current phase and module status
- Generate TypeScript with strict type safety
- Suggest reusable components and hooks
- Respect architectural patterns and file organization
- Include proper error handling and logging
-->

# 🤖 AI Scheduler - Intelligent Project Scheduling Platform

A modern, AI-powered project scheduling platform that combines **Critical Path Method (CPM)** algorithms with **Generative AI** assistance to create intelligent, optimized project schedules.

## 🎯 **Project Status**

**Current Phase**: Phase 1 - Foundation (75% Complete)  
**Next Milestone**: Module 5.4 Critical Path Analysis (Target: Aug 7, 2025)  
**Total Progress**: 1,400+ lines of code across 50+ files, Core CPM Engine Complete ✅

[![Build Status](../../actions/workflows/status.yml/badge.svg)](../../actions/workflows/status.yml)
[![Code Quality](https://img.shields.io/badge/code%20quality-ESLint%20%2B%20Prettier-brightgreen)](./CODE-QUALITY-SETUP.md)
[![Documentation](https://img.shields.io/badge/docs-comprehensive-blue)](./docs/)

## 🏗️ **Architecture Overview**

### **Visual Diagrams**

- 📊 [**Complete System Architecture**](./docs/diagrams/architecture.puml) - Full system overview
- 📊 [**Workflow Orchestrator Focus**](./docs/diagrams/orchestrator-architecture.puml) - Central coordination
- 📊 [**AI Service Flow**](./docs/ai/ai_agent_service_diagram.puml) - AI processing pipeline

### **Core Components**

- 🧠 **Workflow Orchestrator** - Central coordination hub
- ⚙️ **Schedule Engine** - CPM algorithms and critical path analysis
- 🔗 **Constraint Manager** - Resource and dependency optimization
- 📊 **AI Agent Pool** - OpenAI/Local LLM integration with BullMQ
- 📈 **Real-time Progress Tracker** - Live updates and notifications
- ✅ **DCMA Compliance Checker** - 14-point quality validation

### **Technology Stack**

| Layer              | Technology                         | Status        |
| ------------------ | ---------------------------------- | ------------- |
| **Frontend**       | React + TypeScript + Tailwind CSS  | ✅ Complete   |
| **Backend**        | Express + TypeScript + Prisma      | ✅ Complete   |
| **Database**       | PostgreSQL/SQLite + Redis Cache    | ✅ Complete   |
| **AI Integration** | OpenAI API + BullMQ Workers        | 📋 Documented |
| **DevOps**         | GitHub Actions + ESLint + Prettier | ✅ Complete   |

## 📘 AI Agent Overview

This project includes a scalable AI Assistant that:

- Generates schedules, logic links, and durations
- Assists in resolving DCMA 14-point schedule violations
- Learns from user corrections via feedback loop

## 🚀 Quick Start

### Development Environment

```bash
# Clone and setup
git clone <repository-url>
cd ai-scheduler

# Start frontend
cd frontend && npm install && npm run dev

# Start backend
cd ../backend && npm install && npm run dev

# Access application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
```

## 📂 Project Structure

```
ai-scheduler/
├── 🎨 frontend/          # React + TypeScript + Tailwind
├── 🚀 backend/           # Express + TypeScript API
├── 🗄️ database/          # Prisma + SQLite/PostgreSQL
├── 📚 docs/              # Comprehensive documentation
│   ├── ai/               # AI agent architecture & guides
│   ├── api/              # API documentation
│   └── architecture/     # System design documents
└── 🔧 .vscode/           # VS Code workspace configuration
```

## 🤖 AI Integration Points

- **AI Dispatcher API** receives scheduling queries from UI
- **Redis queue (BullMQ)** holds jobs for AI processing
- **Stateless AI Workers** (OpenAI or Local LLM) generate results
- **Results delivered** via cache/store to frontend
- **Rejected outputs** sent to AI Trainer for prompt/model improvement

## 🛠 Key Technologies

| Layer      | Technology           | Purpose                     |
| ---------- | -------------------- | --------------------------- |
| Frontend   | React + TypeScript   | User interface & experience |
| Backend    | Express + Node.js    | REST API & business logic   |
| Database   | Prisma + PostgreSQL  | Data persistence            |
| Queuing    | Redis + BullMQ       | Job processing & scaling    |
| AI/ML      | OpenAI / Local LLMs  | Schedule generation         |
| Monitoring | Prometheus + Grafana | Performance & health        |

## 📈 Scalability Highlights

- ✅ **Dockerized AI workers** scale horizontally (Kubernetes ready)
- ✅ **Queue-based job processing** supports high concurrency
- ✅ **Redis prompt caching** reduces cost and latency
- ✅ **Monitoring & fallback mechanisms** in place

## 📚 Documentation

### Core Documentation

- 📄 [**AI Agent Overview**](docs/AI-AGENT-OVERVIEW.md) - Complete AI integration guide
- 📄 [**Project Structure**](PROJECT-STRUCTURE.md) - Detailed codebase overview
- 📄 [**Code Quality Setup**](CODE-QUALITY-SETUP.md) - ESLint, Prettier, Husky configuration
- 📄 [**VS Code Setup**](VS-CODE-SETUP-SUMMARY.md) - Complete workspace configuration

### 📦 Module Documentation

- 📋 [**Module 5.1 Implementation**](docs/Module-5.1-Implementation.md) - Schedule Engine Data Models
- 📋 [**Module 5.2 Summary**](docs/module-5.2-summary.md) - CPM Forward Pass Implementation
- 📋 [**Module 5.2 Test Report**](docs/module-5.2-tests.md) - Comprehensive Test Coverage
- 📋 [**Module 5.2 Implementation Plan**](docs/module-5.2-implementation-plan.md) - Technical Planning & Architecture
- ✅ [**Module 5.3 Complete Implementation**](docs/module-5.3-backward-pass.md) - CPM Backward Pass with Float & Critical Path

### AI-Specific Documentation

- 🤖 [**AI Architecture**](docs/ai/ai_agent.md) - Scalability strategy & system design
- 📊 [**Service Flow Diagram**](docs/ai/ai_agent_service_diagram.puml) - PlantUML architecture
- ✅ [**Implementation Checklist**](docs/ai/ai_agent_checklist.json) - Development progress tracker
- 🧠 [**Copilot Guide**](COPILOT-GUIDE.md) - AI-assisted development with GitHub Copilot

## 🔧 Development Tools

### GitHub Integration & Status Checking

- 🧠 [**GitHub Status Check Guide**](.copilot/github-status-check.md) - Verify GitHub Actions integration
- 📋 **Quick Status Check**: Run `.copilot/github-status-check.ts --quick`
- ✅ **Full Integration Test**: Run `.copilot/github-status-check.ts`

**Quick GitHub Status Verification:**

```bash
# Quick connectivity test
npx ts-node .copilot/github-status-check.ts --quick

# Full integration check
npx ts-node .copilot/github-status-check.ts

# Check via GitHub CLI
gh run list
gh auth status
```

### Code Quality & Standards

- 📄 [**Code Quality Setup**](CODE-QUALITY-SETUP.md) - ESLint, Prettier, Husky configuration
- 📄 [**VS Code Setup**](VS-CODE-SETUP-SUMMARY.md) - Complete workspace configuration
- 🧠 [**Copilot Guide**](COPILOT-GUIDE.md) - AI-assisted development with GitHub Copilot
- 📏 [**Clean Code Policy**](docs/clean-code-policy.md) - File size limits & modularization guidelines

#### 📏 Clean Code Enforcement (GitHub Copilot Integration)

**Production Code Files** (`.ts`, `.service.ts`, `.controller.ts`):

- ✅ **Target**: Keep files under **250 lines**
- ✅ **Acceptable**: Up to **270 lines** if modularity would reduce clarity
- ⚠️ **Warning**: Never exceed **300 lines** in production code
- 🚫 **Forbidden**: Deleting comments, JSDoc, or type definitions to reduce size
- ✅ **Solution**: Modularize into `*.utils.ts`, `*.helpers.ts`, `*.types.ts`

**Test Files** (`.test.ts`, `*-test.ts`):

- ✅ **Flexible**: May exceed 250 lines for comprehensive coverage
- ✅ **Preserve**: All test descriptions and documentation
- ✅ **Structure**: Clear category headers and comment dividers

**Current Module 5.4 Status**:

- ⚠️ `FloatCalculator.ts`: 333 lines → **Needs modularization**
- ⚠️ `CriticalPathAnalyzer.ts`: 318 lines → **Needs modularization**
- ✅ `Module54Service.ts`: 272 lines → Acceptable
- ✅ `TaskFlagAssigner.ts`: 270 lines → Acceptable

## ✅ Setup Checklist

### Infrastructure

- [x] Frontend: React + TypeScript + Tailwind CSS
- [x] Backend: Express + TypeScript API
- [x] Database: Prisma schema with Task/Project models
- [x] Code Quality: ESLint + Prettier + Husky pre-commit hooks
- [x] VS Code: Complete workspace configuration
- [ ] Redis + BullMQ queue operational
- [ ] AI worker pool connected to LLM

### AI Integration

- [ ] Dispatcher API accepts and routes AI jobs
- [ ] Prompt/result caching enabled
- [ ] Feedback loop captures user corrections
- [ ] Error handling and retry mechanisms
- [ ] Performance monitoring configured

## 🎯 Current Status

**Phase 1 Foundation: 75% Complete** ✅

- ✅ Full-stack application structure
- ✅ Modern development tooling
- ✅ Professional code quality setup
- ✅ Comprehensive documentation
- ✅ **Complete CPM Engine** (Modules 5.1, 5.2, 5.3) - Forward/Backward Pass with Float & Critical Path
- 🔄 Redis integration (documented, ready for implementation)
- 🔄 AI worker implementation (documented, ready for implementation)

**Major Milestone Achieved: Core CPM Functionality Complete** 🎉

- Forward Pass calculations (early dates)
- Backward Pass calculations (late dates)
- Float analysis (total & free float)
- Critical Path identification
- All logic types supported (FS, SS, FF, SF)
- 100% test coverage (226/226 tests passing)

**Next Milestones:**

1. **Module 5.4: Critical Path Analysis & Optimization** (Target: Aug 7, 2025)
2. **Redis + BullMQ Integration** (Target: Aug 14, 2025)
3. **Basic AI Worker Implementation** (Target: Aug 21, 2025)

## 🤝 Contributing

1. **Setup development environment** using VS Code workspace configuration
2. **Follow code quality standards** (ESLint, Prettier auto-configured)
3. **Review AI documentation** before working on AI features
4. **Run tests** and ensure pre-commit hooks pass

## 📄 License

This project is licensed under the MIT License.
