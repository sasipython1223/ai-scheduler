#!/usr/bin/env node
/**
 * GitHub Issues Bulk Creator for AI Scheduler
 * Reads from github-issues.json and creates issues via GitHub CLI
 */

const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

// Colors for console output
const colors = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  reset: "\x1b[0m",
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, errorMessage) {
  try {
    const result = execSync(command, { encoding: "utf8", stdio: "pipe" });
    return result.trim();
  } catch (error) {
    log("red", `❌ ${errorMessage}`);
    log("red", `Command: ${command}`);
    log("red", `Error: ${error.message}`);
    return null;
  }
}

function checkGitHubCLI() {
  log("cyan", "🔍 Checking GitHub CLI installation...");
  const result = execCommand(
    "gh --version",
    "GitHub CLI is not installed or not in PATH"
  );
  if (!result) {
    log("red", "Please install GitHub CLI: https://cli.github.com/");
    process.exit(1);
  }
  log("green", `✅ GitHub CLI found: ${result.split("\n")[0]}`);
}

function checkAuthentication() {
  log("cyan", "🔑 Checking GitHub authentication...");
  const result = execCommand("gh auth status", "Not authenticated with GitHub");
  if (!result) {
    log("yellow", "⚠️  Please run: gh auth login");
    process.exit(1);
  }
  log("green", "✅ GitHub authentication verified");
}

function createProject() {
  log("cyan", "📋 Creating GitHub project...");
  const command = `gh project create --title "AI Scheduler Development Timeline" --body "Modular development tracking for AI Scheduler project with 20 modules and Level 4 granular tasks"`;
  const result = execCommand(
    command,
    "Failed to create project (it might already exist)"
  );
  if (result) {
    log("green", "✅ Project created successfully");
  } else {
    log("yellow", "⚠️  Project might already exist, continuing...");
  }
}

function createMilestones() {
  log("cyan", "🎯 Creating milestones...");

  const milestones = [
    {
      title: "Module 5: Schedule Engine",
      due: "2025-08-28T23:59:59Z",
      description: "CPM algorithm implementation and API endpoints",
    },
    {
      title: "Module 6: Constraint Optimizer",
      due: "2025-09-04T23:59:59Z",
      description: "Hard/soft constraint validation and optimization",
    },
    {
      title: "Module 7: Calendar Engine",
      due: "2025-09-11T23:59:59Z",
      description: "Working day models and calendar integration",
    },
    {
      title: "Module 8: Gantt UI / Task Table",
      due: "2025-09-25T23:59:59Z",
      description: "Interactive Gantt chart and task table interface",
    },
  ];

  milestones.forEach((milestone) => {
    const command = `gh api repos/:owner/:repo/milestones -f title="${milestone.title}" -f description="${milestone.description}" -f due_on="${milestone.due}" -f state="open"`;
    const result = execCommand(
      command,
      `Failed to create milestone: ${milestone.title}`
    );
    if (result) {
      log("green", `✅ Created milestone: ${milestone.title}`);
    }
  });
}

function createIssues() {
  log("cyan", "📝 Reading issues from github-issues.json...");

  const issuesFile = path.join(__dirname, "github-issues.json");
  if (!fs.existsSync(issuesFile)) {
    log("red", "❌ github-issues.json not found");
    process.exit(1);
  }

  const issues = JSON.parse(fs.readFileSync(issuesFile, "utf8"));
  log("green", `✅ Found ${issues.length} issues to create`);

  issues.forEach((issue, index) => {
    log(
      "yellow",
      `📝 Creating issue ${index + 1}/${issues.length}: ${issue.title}`
    );

    // Escape quotes and newlines in the body
    const escapedBody = issue.body.replace(/"/g, '\\"').replace(/\n/g, "\\n");
    const labels = issue.labels.join(",");

    const command = `gh issue create --title "${issue.title}" --body "${escapedBody}" --label "${labels}" --milestone "${issue.milestone}"`;

    const result = execCommand(
      command,
      `Failed to create issue: ${issue.title}`
    );
    if (result) {
      log("green", `✅ Created: ${issue.title}`);
    }

    // Small delay to avoid rate limiting
    execSync("timeout /t 1 /nobreak > nul", { stdio: "ignore" });
  });
}

function main() {
  log("cyan", "🚀 Starting GitHub Issues Bulk Creator for AI Scheduler");
  log("cyan", "================================================");

  // Step 1: Check prerequisites
  checkGitHubCLI();
  checkAuthentication();

  // Step 2: Create project infrastructure
  createProject();
  createMilestones();

  // Step 3: Create issues
  createIssues();

  // Step 4: Final instructions
  log("green", "✅ All issues created successfully!");
  log("cyan", "\n📋 Next steps:");
  log("white", "1. Go to your GitHub repository");
  log("white", "2. Navigate to Projects tab");
  log("white", '3. Open "AI Scheduler Development Timeline"');
  log("white", "4. Configure automation for auto-adding issues with labels");
  log("white", "5. Start working on Module 5: Schedule Engine tasks");

  log("yellow", "\n🔗 Quick links:");
  log("white", "• Issues: gh issue list --label module-5");
  log("white", "• Project: gh project list");
  log("white", "• Start first task: gh issue view 1");
}

// Run the script
main();
