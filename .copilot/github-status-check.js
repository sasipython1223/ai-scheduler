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

  async checkGitRemote() {
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
          message: "No GitHub remote found",
          details: "Make sure you have a GitHub remote configured",
        });
      }
    } catch (error) {
      this.log({
        success: false,
        message: "Failed to check git remote",
        details: error.message,
      });
    }
  }

  async checkGitHubWorkflows() {
    const workflowsPath = join(process.cwd(), ".github", "workflows");
    if (existsSync(workflowsPath)) {
      this.log({
        success: true,
        message: "GitHub Actions workflows directory exists",
        details: ".github/workflows/ directory found",
      });

      // Check for common workflow files
      const fs = require("fs");
      const files = fs.readdirSync(workflowsPath);
      if (files.length > 0) {
        this.log({
          success: true,
          message: `Found ${files.length} workflow file(s)`,
          details: files.join(", "),
        });
      } else {
        this.log({
          success: false,
          message: "No workflow files found",
          details: "Consider adding CI/CD workflow files",
        });
      }
    } else {
      this.log({
        success: false,
        message: "GitHub Actions workflows directory not found",
        details: "Create .github/workflows/ directory for GitHub Actions",
      });
    }
  }

  async checkPackageJsonScripts() {
    const packageJsonPath = join(process.cwd(), "package.json");
    if (existsSync(packageJsonPath)) {
      const fs = require("fs");
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

      if (packageJson.scripts) {
        const scripts = Object.keys(packageJson.scripts);
        const testScript = scripts.includes("test");
        const buildScript = scripts.includes("build");
        const lintScript = scripts.includes("lint");

        this.log({
          success: true,
          message: "Package.json scripts found",
          details: `Available scripts: ${scripts.join(", ")}`,
        });

        if (testScript) {
          this.log({
            success: true,
            message: "Test script configured",
            details: `test: ${packageJson.scripts.test}`,
          });
        }

        if (buildScript) {
          this.log({
            success: true,
            message: "Build script configured",
            details: `build: ${packageJson.scripts.build}`,
          });
        }

        if (lintScript) {
          this.log({
            success: true,
            message: "Lint script configured",
            details: `lint: ${packageJson.scripts.lint}`,
          });
        }
      } else {
        this.log({
          success: false,
          message: "No scripts section in package.json",
          details: "Consider adding build, test, and lint scripts",
        });
      }
    } else {
      this.log({
        success: false,
        message: "package.json not found",
        details: "Make sure you are in a Node.js project directory",
      });
    }
  }

  async checkGitStatus() {
    try {
      const { stdout } = await execAsync("git status --porcelain");
      if (stdout.trim() === "") {
        this.log({
          success: true,
          message: "Working directory is clean",
          details: "No uncommitted changes",
        });
      } else {
        this.log({
          success: false,
          message: "Uncommitted changes detected",
          details: "Consider committing changes before CI/CD runs",
        });
      }
    } catch (error) {
      this.log({
        success: false,
        message: "Failed to check git status",
        details: error.message,
      });
    }
  }

  async checkLastCommit() {
    try {
      const { stdout } = await execAsync("git log -1 --oneline");
      this.log({
        success: true,
        message: "Last commit information",
        details: stdout.trim(),
      });
    } catch (error) {
      this.log({
        success: false,
        message: "Failed to get commit information",
        details: error.message,
      });
    }
  }

  async checkBranch() {
    try {
      const { stdout } = await execAsync("git branch --show-current");
      const currentBranch = stdout.trim();
      this.log({
        success: true,
        message: `Current branch: ${currentBranch}`,
        details:
          currentBranch === "main" || currentBranch === "master"
            ? "On default branch"
            : "On feature branch",
      });
    } catch (error) {
      this.log({
        success: false,
        message: "Failed to get current branch",
        details: error.message,
      });
    }
  }

  async runQuickCheck() {
    console.log("🔍 GitHub Integration Quick Check\n");
    await this.checkGitRemote();
    await this.checkGitHubWorkflows();
    await this.checkBranch();
    this.printSummary();
  }

  async runFullCheck() {
    console.log("🔍 GitHub Integration Full Check\n");
    await this.checkGitRemote();
    await this.checkGitHubWorkflows();
    await this.checkPackageJsonScripts();
    await this.checkGitStatus();
    await this.checkLastCommit();
    await this.checkBranch();
    this.printSummary();
  }

  printSummary() {
    const successful = this.results.filter((r) => r.success).length;
    const total = this.results.length;

    console.log("━".repeat(50));
    console.log(`📊 Summary: ${successful}/${total} checks passed`);

    if (successful === total) {
      console.log("🎉 All checks passed! Your GitHub integration looks good.");
    } else {
      console.log("⚠️  Some checks failed. Review the issues above.");
    }
    console.log("━".repeat(50));
  }
}

// Main execution
async function main() {
  const checker = new GitHubStatusChecker();

  const args = process.argv.slice(2);
  const isQuick = args.includes("--quick") || args.includes("-q");

  if (isQuick) {
    await checker.runQuickCheck();
  } else {
    await checker.runFullCheck();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

// Export for use in other modules
module.exports = { GitHubStatusChecker };
