/**
 * GitHub Status Integration Checker
 * AI Scheduler - Automated verification of GitHub integration
 *
 * Run this to verify your GitHub integration is working correctly
 */

const { exec } = require("child_process");
const { promisify } = require("util");
const { existsSync } = require("fs");
const { join } = require("path");

const execAsync = promisify(exec);

// Result object structure: { success: boolean, message: string, details?: string }

class GitHubStatusChecker {
  private results: Array<{
    success: boolean;
    message: string;
    details?: string;
  }>;

  constructor() {
    this.results = [];
  }

  log(result) {
    this.results.push(result);
    const icon = result.success ? "✅" : "❌";
    console.log(`${icon} ${result.message}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
    console.log();
  }

  async checkGitRemote(): Promise<void> {
    try {
      const { stdout } = await execAsync("git remote -v");
      if (stdout.includes("github.com")) {
        this.log({
          success: true,
          message: "GitHub remote configured correctly",
          details: stdout.trim().split("\n")[0],
        });
      } else {
        this.log({
          success: false,
          message: "GitHub remote not found",
          details: "Please add GitHub remote: git remote add origin <url>",
        });
      }
    } catch (error) {
      this.log({
        success: false,
        message: "Failed to check Git remote",
        details: `Error: ${error}`,
      });
    }
  }

  async checkCurrentBranch(): Promise<void> {
    try {
      const { stdout } = await execAsync("git branch --show-current");
      const branch = stdout.trim();
      this.log({
        success: true,
        message: `Current branch: ${branch}`,
        details: branch.startsWith("feature/")
          ? "Feature branch detected"
          : "Main branch",
      });
    } catch (error) {
      this.log({
        success: false,
        message: "Failed to get current branch",
        details: `Error: ${error}`,
      });
    }
  }

  async checkGitHubCLI(): Promise<void> {
    try {
      const { stdout } = await execAsync("gh auth status");
      this.log({
        success: true,
        message: "GitHub CLI authenticated",
        details: "Ready to use gh commands",
      });
    } catch (error) {
      this.log({
        success: false,
        message: "GitHub CLI not authenticated or not installed",
        details: "Run: gh auth login",
      });
    }
  }

  async checkWorkflows(): Promise<void> {
    const workflowsPath = join(process.cwd(), ".github", "workflows");

    if (existsSync(workflowsPath)) {
      try {
        const { stdout } = await execAsync(`ls "${workflowsPath}"`);
        const files = stdout
          .trim()
          .split("\n")
          .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));

        if (files.length > 0) {
          this.log({
            success: true,
            message: "GitHub Actions workflows found",
            details: `Found ${files.length} workflow(s): ${files.join(", ")}`,
          });
        } else {
          this.log({
            success: false,
            message: "No valid workflow files found in .github/workflows",
            details: "Create workflow files with .yml or .yaml extension",
          });
        }
      } catch (error) {
        this.log({
          success: false,
          message: "Failed to list workflow files",
          details: `Error: ${error}`,
        });
      }
    } else {
      this.log({
        success: false,
        message: "No .github/workflows directory found",
        details: "Create .github/workflows/ directory and add workflow files",
      });
    }
  }

  async checkRecentActions(): Promise<void> {
    try {
      const { stdout } = await execAsync("gh run list --limit 5");
      const lines = stdout.trim().split("\n");

      if (lines.length > 1) {
        this.log({
          success: true,
          message: "Recent GitHub Actions found",
          details: `${lines.length - 1} recent runs found`,
        });
      } else {
        this.log({
          success: false,
          message: "No recent GitHub Actions runs",
          details: "Push commits to trigger actions",
        });
      }
    } catch (error) {
      this.log({
        success: false,
        message: "Failed to check GitHub Actions (requires gh CLI)",
        details: "Install and authenticate GitHub CLI: gh auth login",
      });
    }
  }

  async checkRecentCommits(): Promise<void> {
    try {
      const { stdout } = await execAsync("git log --oneline -3");
      const commits = stdout.trim().split("\n");

      this.log({
        success: true,
        message: "Recent commits found",
        details: `${commits.length} recent commits`,
      });

      commits.forEach((commit, index) => {
        console.log(`   ${index + 1}. ${commit}`);
      });
      console.log();
    } catch (error) {
      this.log({
        success: false,
        message: "Failed to get recent commits",
        details: `Error: ${error}`,
      });
    }
  }

  async runAllChecks(): Promise<void> {
    console.log("🔍 Checking GitHub Integration for AI Scheduler...\n");

    await this.checkGitRemote();
    await this.checkCurrentBranch();
    await this.checkGitHubCLI();
    await this.checkWorkflows();
    await this.checkRecentActions();
    await this.checkRecentCommits();

    this.printSummary();
  }

  private printSummary(): void {
    const successful = this.results.filter((r) => r.success).length;
    const total = this.results.length;

    console.log("📊 Summary:");
    console.log(`   ✅ Successful checks: ${successful}/${total}`);
    console.log(`   ❌ Failed checks: ${total - successful}/${total}`);

    if (successful === total) {
      console.log("\n🎉 All GitHub integration checks passed!");
      console.log("   Your setup is ready for continuous integration.");
    } else {
      console.log("\n⚠️  Some checks failed. Review the issues above.");
      console.log(
        "   See .copilot/github-status-check.md for setup instructions."
      );
    }
  }

  async quickTest(): Promise<void> {
    console.log("🚀 Running quick GitHub connectivity test...\n");

    try {
      // Test git status
      await execAsync("git status --porcelain");
      console.log("✅ Git repository detected");

      // Test GitHub remote connectivity
      const { stdout } = await execAsync("git ls-remote --heads origin");
      if (stdout) {
        console.log("✅ GitHub remote is accessible");
        console.log("🎉 Quick test passed - GitHub integration is working!");
      }
    } catch (error) {
      console.log("❌ Quick test failed");
      console.log(`   Error: ${error}`);
      console.log("   Run full check with: npm run check:github");
    }
  }
}

// CLI interface
async function main() {
  const checker = new GitHubStatusChecker();
  const args = process.argv.slice(2);

  if (args.includes("--quick")) {
    await checker.quickTest();
  } else {
    await checker.runAllChecks();
  }
}

// Export for use in other modules
module.exports = { GitHubStatusChecker };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
