# 🔧 GitHub Setup Instructions for AI Scheduler

## 📥 Step 1: Install GitHub CLI

### Option A: Using Winget (Recommended for Windows 11)

```powershell
winget install --id GitHub.cli
```

### Option B: Using Chocolatey

```powershell
choco install gh
```

### Option C: Manual Download

1. Go to https://cli.github.com/
2. Download the Windows installer
3. Run the installer and follow instructions
4. Restart PowerShell/Command Prompt

---

## 🔑 Step 2: Authenticate with GitHub

After installing GitHub CLI:

```powershell
# Authenticate with GitHub
gh auth login

# Select:
# - GitHub.com
# - HTTPS
# - Yes (to authenticate Git)
# - Login with a web browser

# Verify authentication
gh auth status
```

---

## 🚀 Step 3: Run Automated Issue Creation

Once GitHub CLI is installed and authenticated:

### Option A: Run the automated script

```powershell
cd C:\Projects\CleanCodeArchitecture\ai-scheduler
node scripts\create-issues.js
```

### Option B: Manual issue creation (if script fails)

```powershell
# Create first few issues manually
gh issue create --title "5.1 Design Data Models: Task, WBS, Logic, Float" --body "Module 5.1 - Schedule Engine Foundation..." --label "engine,module-5,models,high-priority"

gh issue create --title "5.2 Implement Forward Pass (ES/EF)" --body "Module 5.2 - CPM Forward Pass Algorithm..." --label "engine,module-5,algorithm,high-priority"

gh issue create --title "5.3 Implement Backward Pass (LS/LF)" --body "Module 5.3 - CPM Backward Pass Algorithm..." --label "engine,module-5,algorithm,high-priority"
```

---

## 📋 Step 4: Create GitHub Project Board

### Via Web Interface (Recommended):

1. Go to your GitHub repository: https://github.com/sasipython1223/ai-scheduler
2. Click **"Projects"** tab
3. Click **"New project"**
4. Choose **"Board"** template
5. Name: `AI Scheduler Development Timeline`
6. Description: `Modular development tracking for AI Scheduler project with 20 modules and Level 4 granular tasks`

### Configure Automation:

1. In your project board, click **⚙️ Settings**
2. Go to **"Workflows"**
3. Add automation rules:
   - **Auto-add issues**: When issues are labeled with `module-5`, `module-6`, etc.
   - **Auto-move**: When issues are closed → move to "Done"
   - **Auto-assign**: When issues are moved to "In Progress" → assign to team member

---

## 🎯 Step 5: Create Milestones

```powershell
# Create milestones for each module
gh api repos/:owner/:repo/milestones -f title="Module 5: Schedule Engine" -f description="CPM algorithm implementation and API endpoints" -f due_on="2025-08-28T23:59:59Z"

gh api repos/:owner/:repo/milestones -f title="Module 6: Constraint Optimizer" -f description="Hard/soft constraint validation and optimization" -f due_on="2025-09-04T23:59:59Z"

gh api repos/:owner/:repo/milestones -f title="Module 7: Calendar Engine" -f description="Working day models and calendar integration" -f due_on="2025-09-11T23:59:59Z"
```

---

## 📊 Quick Commands After Setup

```powershell
# List all issues
gh issue list

# List Module 5 issues
gh issue list --label module-5

# View project boards
gh project list

# Start working on first issue
gh issue view 1

# Create a branch for first task
git checkout -b feature/5.1-data-models

# When task is complete
gh issue close 1 --comment "✅ Data models implemented"
```

---

## 🔄 Alternative: Manual Project Setup

If you prefer to set up manually without GitHub CLI:

1. **Go to GitHub repository**: https://github.com/sasipython1223/ai-scheduler
2. **Create Issues manually** using the details from `scripts/github-issues.json`
3. **Create Project Board** with columns: Todo, In Progress, Review, Done
4. **Add Issues to Project** and organize by module
5. **Set up Milestones** for each module with due dates

---

## ✅ Verification Checklist

- [ ] GitHub CLI installed and authenticated
- [ ] Project board created: "AI Scheduler Development Timeline"
- [ ] Milestones created for Modules 5-8
- [ ] Issues created for Module 5 (6 issues: 5.1-5.6)
- [ ] Issues created for Module 6 (4 issues: 6.1-6.4)
- [ ] Automation rules configured
- [ ] Ready to start development on Module 5.1

---

**🎯 Ready to start development! Begin with Module 5.1: Design Data Models**
