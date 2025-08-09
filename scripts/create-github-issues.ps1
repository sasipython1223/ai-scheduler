# PowerShell script to create GitHub issues from modular roadmap
# Run this after: gh auth login

# Check if GitHub CLI is available
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) is not installed or not in PATH"
    exit 1
}

# Create project first (if it doesn't exist)
Write-Host "Creating GitHub project..." -ForegroundColor Green
gh project create --title "AI Scheduler Development Timeline" --body "Modular development tracking for AI Scheduler project with 20 modules and Level 4 granular tasks"

# Create milestones for each module
Write-Host "Creating milestones..." -ForegroundColor Green
$milestones = @(
    @{title="Module 5: Schedule Engine"; due="2025-08-28"; description="CPM algorithm implementation and API endpoints"},
    @{title="Module 6: Constraint Optimizer"; due="2025-09-04"; description="Hard/soft constraint validation and optimization"},
    @{title="Module 7: Calendar Engine"; due="2025-09-11"; description="Working day models and calendar integration"},
    @{title="Module 8: Gantt UI / Task Table"; due="2025-09-25"; description="Interactive Gantt chart and task table interface"},
    @{title="Module 9: Multi-user Editing"; due="2025-10-02"; description="Real-time collaboration and conflict resolution"},
    @{title="Module 10: Change/Audit/Note Layer"; due="2025-10-09"; description="Audit trails and commenting system"},
    @{title="Module 11: What-if Simulator"; due="2025-10-16"; description="Baseline snapshots and simulation environment"},
    @{title="Module 12: Delay Predictor (AI Model)"; due="2025-10-23"; description="AI-powered delay prediction and risk visualization"}
)

foreach ($milestone in $milestones) {
    gh api repos/:owner/:repo/milestones -f title="$($milestone.title)" -f description="$($milestone.description)" -f due_on="$($milestone.due)T23:59:59Z" -f state="open"
}

# Module 5: Schedule Engine Issues
Write-Host "Creating Module 5 issues..." -ForegroundColor Yellow

gh issue create `
  --title "5.1 Design Data Models: Task, WBS, Logic, Float" `
  --body "**Module 5.1 - Schedule Engine Foundation**`n`n**Scope:**`n- Create Task, WBS, Logic, Float TypeScript interfaces`n- Define duration calculation types`n- Design critical path data structures`n`n**Files to Create:**`n- \`backend/src/models/schedule-models.ts\`  `n- \`backend/src/types/schedule-types.ts\``n`n**Acceptance Criteria:**`n- [ ] Task interface with ID, name, duration, start/finish dates`n- [ ] WBS hierarchy structure definition`n- [ ] Logic relationship types (FS, SS, FF, SF)`n- [ ] Float calculation data types`n- [ ] Unit tests for model validation`n`n**Lines of Code:** ~150 LOC`n**Dependencies:** Redis + BullMQ Setup complete" `
  --label "engine,module-5,models,high-priority" `
  --milestone "Module 5: Schedule Engine"

gh issue create `
  --title "5.2 Implement Forward Pass (ES/EF)" `
  --body "**Module 5.2 - CPM Forward Pass Algorithm**`n`n**Scope:**`n- Implement Early Start (ES) calculation algorithm`n- Implement Early Finish (EF) calculation logic`n- Build dependency chain traversal system`n`n**Files to Create:**`n- \`backend/src/services/cpm-forward-pass.ts\``n`n**Acceptance Criteria:**`n- [ ] Forward pass algorithm implementation`n- [ ] Dependency chain traversal logic`n- [ ] ES/EF calculation for all task types`n- [ ] Handle circular dependency detection`n- [ ] Unit tests for various scenarios`n`n**Lines of Code:** ~180 LOC`n**Dependencies:** 5.1 Data Models complete" `
  --label "engine,module-5,algorithm,high-priority" `
  --milestone "Module 5: Schedule Engine"

gh issue create `
  --title "5.3 Implement Backward Pass (LS/LF)" `
  --body "**Module 5.3 - CPM Backward Pass Algorithm**`n`n**Scope:**`n- Implement Late Start (LS) calculation algorithm`n- Implement Late Finish (LF) calculation logic`n- Build reverse dependency traversal system`n`n**Files to Create:**`n- \`backend/src/services/cmp-backward-pass.ts\``n`n**Acceptance Criteria:**`n- [ ] Backward pass algorithm implementation`n- [ ] Reverse dependency traversal logic`n- [ ] LS/LF calculation for all task types`n- [ ] Integration with forward pass results`n- [ ] Unit tests for backward pass scenarios`n`n**Lines of Code:** ~180 LOC`n**Dependencies:** 5.2 Forward Pass complete" `
  --label "engine,module-5,algorithm,high-priority" `
  --milestone "Module 5: Schedule Engine"

gh issue create `
  --title "5.4 Calculate Float, Critical Path Flag" `
  --body "**Module 5.4 - Float Calculation & Critical Path**`n`n**Scope:**`n- Implement total float calculation (LS - ES)`n- Implement free float calculation`n- Identify critical path tasks (float = 0)`n`n**Files to Create:**`n- \`backend/src/services/cpm-calculator.ts\``n`n**Acceptance Criteria:**`n- [ ] Total float calculation algorithm`n- [ ] Free float calculation algorithm`n- [ ] Critical path identification logic`n- [ ] Float-based task prioritization`n- [ ] Unit tests for float and critical path scenarios`n`n**Lines of Code:** ~120 LOC`n**Dependencies:** 5.3 Backward Pass complete" `
  --label "engine,module-5,calculation,high-priority" `
  --milestone "Module 5: Schedule Engine"

gh issue create `
  --title "5.5 Build API to Accept Task List and Return Results" `
  --body "**Module 5.5 - Schedule Engine API Endpoints**`n`n**Scope:**`n- Create REST endpoint for schedule calculation`n- Implement input validation and sanitization`n- Build response formatting with results`n`n**Files to Create:**`n- \`backend/src/routes/schedule-api.ts\``n- \`backend/src/controllers/schedule-controller.ts\``n`n**Acceptance Criteria:**`n- [ ] POST /api/schedule/calculate endpoint`n- [ ] Input validation for task data`n- [ ] Response formatting with schedule results`n- [ ] Error handling and status codes`n- [ ] API integration tests`n`n**Lines of Code:** ~160 LOC`n**Dependencies:** 5.4 Float Calculation complete" `
  --label "engine,module-5,api,high-priority" `
  --milestone "Module 5: Schedule Engine"

gh issue create `
  --title "5.6 Unit Test All Schedule Logic (1K, 5K, 10K Tasks)" `
  --body "**Module 5.6 - Performance Testing & Optimization**`n`n**Scope:**`n- Performance testing with large datasets (1K, 5K, 10K tasks)`n- Memory usage optimization`n- Algorithm efficiency validation`n`n**Files to Create:**`n- \`backend/src/tests/schedule-performance.test.ts\``n`n**Acceptance Criteria:**`n- [ ] Performance tests for 1,000 tasks`n- [ ] Performance tests for 5,000 tasks`n- [ ] Performance tests for 10,000 tasks`n- [ ] Memory usage profiling`n- [ ] Performance benchmarks and optimization`n`n**Lines of Code:** ~200 LOC`n**Dependencies:** 5.5 API Endpoints complete" `
  --label "engine,module-5,testing,performance" `
  --milestone "Module 5: Schedule Engine"

# Module 6: Constraint Optimizer Issues
Write-Host "Creating Module 6 issues..." -ForegroundColor Yellow

gh issue create `
  --title "6.1 Define Constraint Types (Hard, Soft, Calendar)" `
  --body "**Module 6.1 - Constraint Type Definitions**`n`n**Scope:**`n- Define constraint interface definitions`n- Create hard constraint validation rules`n- Implement soft constraint warning system`n`n**Files to Create:**`n- \`backend/src/types/constraint-types.ts\``n- \`backend/src/models/constraint-models.ts\``n`n**Acceptance Criteria:**`n- [ ] Hard constraint interface (must not violate)`n- [ ] Soft constraint interface (warning only)`n- [ ] Calendar constraint definitions`n- [ ] Constraint priority levels`n- [ ] Constraint validation rules`n`n**Lines of Code:** ~140 LOC`n**Dependencies:** Module 5 Schedule Engine complete" `
  --label "constraints,module-6,models" `
  --milestone "Module 6: Constraint Optimizer"

gh issue create `
  --title "6.2 Implement Validation Engine" `
  --body "**Module 6.2 - Constraint Validation Engine**`n`n**Scope:**`n- Build constraint checking algorithms`n- Implement violation detection and reporting`n- Create constraint resolution suggestions`n`n**Files to Create:**`n- \`backend/src/services/constraint-validator.ts\``n`n**Acceptance Criteria:**`n- [ ] Constraint validation algorithms`n- [ ] Violation detection system`n- [ ] Resolution suggestion engine`n- [ ] Validation result reporting`n- [ ] Unit tests for validation scenarios`n`n**Lines of Code:** ~200 LOC`n**Dependencies:** 6.1 Constraint Types complete" `
  --label "constraints,module-6,validation" `
  --milestone "Module 6: Constraint Optimizer"

gh issue create `
  --title "6.3 Connect to Schedule Engine for Constraint-Aware Recalculations" `
  --body "**Module 6.3 - Schedule Engine Integration**`n`n**Scope:**`n- Integrate constraint validation with CPM engine`n- Implement automatic schedule adjustment`n- Build constraint propagation logic`n`n**Files to Create:**`n- \`backend/src/services/constraint-optimizer.ts\``n`n**Acceptance Criteria:**`n- [ ] CPM engine integration`n- [ ] Automatic schedule adjustment`n- [ ] Constraint propagation logic`n- [ ] Optimization algorithm implementation`n- [ ] Integration tests with schedule engine`n`n**Lines of Code:** ~180 LOC`n**Dependencies:** 6.2 Validation Engine complete" `
  --label "constraints,module-6,integration" `
  --milestone "Module 6: Constraint Optimizer"

gh issue create `
  --title "6.4 Add UI Error Flag Feedback" `
  --body "**Module 6.4 - Constraint Feedback UI**`n`n**Scope:**`n- Create constraint violation indicators`n- Implement user-friendly error messages`n- Build resolution guidance display`n`n**Files to Create:**`n- \`frontend/src/components/constraint-feedback.tsx\``n- \`frontend/src/hooks/useConstraints.ts\``n`n**Acceptance Criteria:**`n- [ ] Constraint violation visual indicators`n- [ ] Error message display system`n- [ ] Resolution guidance UI`n- [ ] Real-time constraint status updates`n- [ ] UI component tests`n`n**Lines of Code:** ~120 LOC`n**Dependencies:** 6.3 Schedule Integration complete" `
  --label "constraints,module-6,ui,frontend" `
  --milestone "Module 6: Constraint Optimizer"

Write-Host "✅ GitHub issues created successfully!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to your GitHub repository" -ForegroundColor White
Write-Host "2. Navigate to Projects tab" -ForegroundColor White
Write-Host "3. Open 'AI Scheduler Development Timeline'" -ForegroundColor White
Write-Host "4. Configure automation for auto-adding issues with labels" -ForegroundColor White
