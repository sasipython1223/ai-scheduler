# 🧠 Copilot Task: Verify GitHub Status Reporting from VS Code

## 🧩 Goal:

Ensure GitHub Actions status checks are triggered and displayed in pull requests or commit history when code is pushed from VS Code.

## ✅ Step-by-Step Checks:

### 1. **Verify GitHub Remote**

```typescript
// Check if GitHub remote is set correctly
const exec = require("child_process").exec;
exec("git remote -v", (err, stdout) => {
  if (!stdout.includes("github.com")) {
    console.error("❌ GitHub remote not set. Use: git remote add origin <url>");
  } else {
    console.log("✅ GitHub remote OK:", stdout);
  }
});
```

### 2. **Check GitHub Authentication**

```bash
gh auth status
# or use: GitHub: Sign In from VS Code Command Palette
```

### 3. **Verify CI Workflow Triggers**

Ensure `.github/workflows/status.yml` includes:

```yaml
on:
  push:
    branches: [main, feature/*]
  pull_request:
    branches: [main]
```

### 4. **Push a Test Commit**

```bash
git add .
git commit -m "test: trigger GitHub status"
git push
```

### 5. **Check GitHub Action Log**

```bash
gh run list
# Or check in GitHub web: Repo → Actions
```

### 6. **Ensure Branch Protection (Optional Manual Step)**

- Go to GitHub → Settings → Branches
- Enable: "Require status checks before merging"

## ✅ Expected Outcome:

- ✅ GitHub Actions should trigger on push or PR
- ✅ Status checks should appear in PR or commit view
- ✅ Copilot or VS Code can notify if status is missing

## 🔧 Automated Status Check Script

Create this as a VS Code task or run manually:

```typescript
/**
 * GitHub Status Integration Checker
 * Run this to verify your GitHub integration is working correctly
 */
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function checkGitHubIntegration() {
  console.log("🔍 Checking GitHub Integration...\n");

  try {
    // 1. Check Git Remote
    const { stdout: remotes } = await execAsync("git remote -v");
    if (remotes.includes("github.com")) {
      console.log("✅ GitHub remote configured correctly");
      console.log(`   ${remotes.trim()}\n`);
    } else {
      console.log("❌ GitHub remote not found");
      console.log("   Please add GitHub remote: git remote add origin <url>\n");
    }

    // 2. Check Current Branch
    const { stdout: branch } = await execAsync("git branch --show-current");
    console.log(`✅ Current branch: ${branch.trim()}\n`);

    // 3. Check if GitHub CLI is available
    try {
      const { stdout: ghStatus } = await execAsync("gh auth status");
      console.log("✅ GitHub CLI authenticated");
      console.log(`   ${ghStatus.trim()}\n`);
    } catch {
      console.log("⚠️  GitHub CLI not authenticated or not installed");
      console.log("   Run: gh auth login\n");
    }

    // 4. Check for GitHub Actions workflows
    const { stdout: workflows } = await execAsync(
      'ls .github/workflows/ 2>/dev/null || echo "No workflows"'
    );
    if (workflows.includes("No workflows")) {
      console.log("⚠️  No GitHub Actions workflows found");
    } else {
      console.log("✅ GitHub Actions workflows found:");
      console.log(`   ${workflows.trim()}\n`);
    }

    // 5. Check recent commits
    const { stdout: commits } = await execAsync("git log --oneline -5");
    console.log("📋 Recent commits:");
    console.log(`   ${commits.trim()}\n`);

    console.log("🎉 GitHub integration check complete!");
  } catch (error) {
    console.error("❌ Error checking GitHub integration:", error);
  }
}

// Run the check
if (require.main === module) {
  checkGitHubIntegration();
}

export { checkGitHubIntegration };
```

## 🚀 Quick VS Code Integration

Add this to your `.vscode/tasks.json`:

```json
{
  "label": "Check GitHub Status Integration",
  "type": "shell",
  "command": "node",
  "args": [
    "-e",
    "require('./.copilot/github-status-check.js').checkGitHubIntegration()"
  ],
  "group": "test",
  "presentation": {
    "echo": true,
    "reveal": "always",
    "focus": false,
    "panel": "shared"
  },
  "problemMatcher": []
}
```

## 📋 Manual Verification Checklist

- [ ] GitHub remote is configured (`git remote -v`)
- [ ] GitHub CLI authenticated (`gh auth status`)
- [ ] GitHub Actions workflows exist (`.github/workflows/`)
- [ ] Recent push triggered actions (`gh run list`)
- [ ] Status checks appear in PR/commits
- [ ] Branch protection rules configured (if needed)
- [ ] VS Code GitHub extension installed and signed in

---

💡 **Pro Tip**: Run this check after any major Git configuration changes or when setting up a new development environment.
