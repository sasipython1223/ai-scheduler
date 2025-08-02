/**
 * Test Summary Generator
 * Automatically generates and updates test case documentation
 *
 * Usage: npm run generate-test-summary
 *
 * This tool scans test files and extracts:
 * - Test names and descriptions
 * - Input parameters and expected outputs
 * - Validation scenarios and error cases
 * - CPM calculation test cases
 *
 * Generates: backend/docs/module-5.1-5.2-test-summary.md
 */

import * as fs from 'fs';
import * as path from 'path';

const __dirname = path.dirname(__filename);

interface TestInputs {
  tasks?: unknown[];
  links?: unknown[];
  data?: unknown;
}

interface TestCase {
  name: string;
  description: string;
  inputs: TestInputs;
  expectedOutputs: string[];
  category: 'validation' | 'forward-pass' | 'error-handling' | 'utility';
  module: '5.1' | '5.2';
}

class TestSummaryGenerator {
  private testCases: TestCase[] = [];
  private readonly testDir = path.join(__dirname, '../src/tests');
  private readonly outputPath = path.join(
    __dirname,
    '../docs/module-5.1-5.2-test-summary.md'
  );

  /**
   * Main entry point - generates complete test summary
   */
  async generateSummary(): Promise<void> {
    console.log('🔍 Scanning test files...');

    await this.scanTestFiles();

    console.log(`📊 Found ${this.testCases.length} test cases`);

    const markdownContent = this.generateMarkdown();

    await this.writeToFile(markdownContent);

    console.log(`✅ Test summary generated: ${this.outputPath}`);
  }

  /**
   * Scan test directory for relevant test files
   */
  private async scanTestFiles(): Promise<void> {
    const testFiles = [
      'cpm-forward-pass.test.ts',
      'models/schedule/task.model.test.ts',
      'models/schedule/logicLink.model.test.ts',
    ];

    for (const file of testFiles) {
      const filePath = path.join(this.testDir, file);
      if (fs.existsSync(filePath)) {
        await this.parseTestFile(filePath, file);
      }
    }
  }

  /**
   * Parse individual test file and extract test cases
   */
  private async parseTestFile(
    filePath: string,
    fileName: string
  ): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract test cases using regex patterns
    const testBlocks = this.extractTestBlocks(content);

    for (const block of testBlocks) {
      const testCase = this.parseTestBlock(block, fileName);
      if (testCase) {
        this.testCases.push(testCase);
      }
    }
  }

  /**
   * Extract test blocks from file content
   */
  private extractTestBlocks(content: string): string[] {
    // Match describe/it blocks
    const testRegex =
      /(?:describe|it|test)\s*\(\s*['"](.*?)['"],\s*(?:async\s*)?\(\s*\)\s*=>\s*{([\s\S]*?)^\s*}\s*\)/gm;
    const matches: Array<{ name: string; content: string }> = [];
    let match;

    while ((match = testRegex.exec(content)) !== null) {
      matches.push({
        name: match[1],
        content: match[2],
      });
    }

    return matches.map((m) => `${m.name}\n${m.content}`);
  }

  /**
   * Parse individual test block to extract test case information
   */
  private parseTestBlock(block: string, fileName: string): TestCase | null {
    const lines = block.split('\n');
    const testName = lines[0];

    // Determine module and category based on file and test name
    const module = fileName.includes('cpm-forward-pass') ? '5.2' : '5.1';
    const category = this.categorizeTest(testName, fileName);

    // Extract inputs and outputs (simplified extraction)
    const inputs = this.extractInputs(block);
    const expectedOutputs = this.extractExpectedOutputs(block);

    return {
      name: testName,
      description: this.extractDescription(block),
      inputs,
      expectedOutputs,
      category,
      module,
    };
  }

  /**
   * Categorize test based on name and file
   */
  private categorizeTest(
    testName: string,
    fileName: string
  ): TestCase['category'] {
    if (fileName.includes('cpm-forward-pass')) {
      if (
        testName.toLowerCase().includes('error') ||
        testName.toLowerCase().includes('circular')
      ) {
        return 'error-handling';
      }
      if (
        testName.toLowerCase().includes('utility') ||
        testName.toLowerCase().includes('compute')
      ) {
        return 'utility';
      }
      return 'forward-pass';
    }
    return 'validation';
  }

  /**
   * Extract input parameters from test block
   */
  private extractInputs(block: string): TestInputs {
    // Look for common input patterns
    const inputPatterns = [
      /const\s+tasks?\s*=\s*(\[[\s\S]*?\]);/,
      /const\s+links?\s*=\s*(\[[\s\S]*?\]);/,
      /const\s+.*Input\s*=\s*({[\s\S]*?});/,
    ];

    const inputs: TestInputs = {};

    for (const pattern of inputPatterns) {
      const match = block.match(pattern);
      if (match) {
        try {
          const parsed = eval(`(${match[1]})`);
          if (match[0].includes('task')) inputs.tasks = parsed;
          if (match[0].includes('link')) inputs.links = parsed;
          if (match[0].includes('Input')) inputs.data = parsed;
        } catch {
          // Skip parsing errors
        }
      }
    }

    return inputs;
  }

  /**
   * Extract expected outputs from test block
   */
  private extractExpectedOutputs(block: string): string[] {
    // Look for expect statements
    const expectPattern = /expect\((.*?)\)\.to.*?(\(.*?\))?/g;
    const expectations: string[] = [];
    let match;

    while ((match = expectPattern.exec(block)) !== null) {
      expectations.push(match[1]);
    }

    return expectations;
  }

  /**
   * Extract test description from comments or test name
   */
  private extractDescription(block: string): string {
    // Look for comments at the beginning of the test
    const commentMatch = block.match(/\/\*\*([\s\S]*?)\*\//);
    if (commentMatch) {
      return commentMatch[1].replace(/\s*\*\s*/g, ' ').trim();
    }

    // Fallback to test name processing
    const firstLine = block.split('\n')[0];
    return firstLine.replace(/['"]/g, '').trim();
  }

  /**
   * Generate complete Markdown documentation
   */
  private generateMarkdown(): string {
    const now = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const module51Tests = this.testCases.filter((t) => t.module === '5.1');
    const module52Tests = this.testCases.filter((t) => t.module === '5.2');

    return `# AI Scheduler Test Case Summary

## Comprehensive Input/Output Analysis for Module 5.1 & 5.2

_Generated on: ${now}_
_Author: GitHub Copilot Test Summary Generator_
_Auto-generated from test files_

---

## 📊 **Module 5.1: Data Validation Tests**

${this.generateModule51Tables(module51Tests)}

---

## 🚀 **Module 5.2: CPM Forward Pass Tests**

${this.generateModule52Tables(module52Tests)}

---

## 🎯 **Test Coverage Analysis**

### **Module 5.1 Coverage: Data Validation**
- ✅ **Total Test Cases**: ${module51Tests.length}
- ✅ **Validation Tests**: ${module51Tests.filter((t) => t.category === 'validation').length}
- ✅ **Coverage**: Required fields, data types, business rules, logic types

### **Module 5.2 Coverage: CPM Forward Pass**
- ✅ **Total Test Cases**: ${module52Tests.length}
- ✅ **Forward Pass Tests**: ${module52Tests.filter((t) => t.category === 'forward-pass').length}
- ✅ **Error Handling Tests**: ${module52Tests.filter((t) => t.category === 'error-handling').length}
- ✅ **Utility Tests**: ${module52Tests.filter((t) => t.category === 'utility').length}

---

## 📋 **Summary Statistics**

- **Total Test Cases**: ${this.testCases.length}
- **Module 5.1 Tests**: ${module51Tests.length}
- **Module 5.2 Tests**: ${module52Tests.length}
- **Last Updated**: ${now}

_This summary was automatically generated from test files to ensure accuracy and up-to-date documentation._`;
  }

  /**
   * Generate Module 5.1 tables
   */
  private generateModule51Tables(tests: TestCase[]): string {
    const validationTests = tests.filter((t) => t.category === 'validation');

    return `### **Validation Test Cases**

| Test Name | Input Data | Expected Behavior | Category | Notes |
|-----------|------------|------------------|----------|--------|
${validationTests
  .map(
    (test) =>
      `| **${test.name}** | \`${JSON.stringify(test.inputs)}\` | \`${JSON.stringify(test.expectedOutputs)}\` | ${test.category} | ${test.description} |`
  )
  .join('\n')}`;
  }

  /**
   * Generate Module 5.2 tables
   */
  private generateModule52Tables(tests: TestCase[]): string {
    const forwardPassTests = tests.filter((t) => t.category === 'forward-pass');
    const errorTests = tests.filter((t) => t.category === 'error-handling');
    const utilityTests = tests.filter((t) => t.category === 'utility');

    return `### **Forward Pass Calculation Test Cases**

| Test Name | Input Tasks | Input Links | Expected Results | Notes |
|-----------|-------------|-------------|-----------------|--------|
${forwardPassTests
  .map(
    (test) =>
      `| **${test.name}** | \`${JSON.stringify(test.inputs.tasks || [])}\` | \`${JSON.stringify(test.inputs.links || [])}\` | \`${JSON.stringify(test.expectedOutputs)}\` | ${test.description} |`
  )
  .join('\n')}

### **Error Handling Test Cases**

| Test Name | Scenario | Expected Error | Behavior | Notes |
|-----------|----------|----------------|----------|--------|
${errorTests
  .map(
    (test) =>
      `| **${test.name}** | \`${JSON.stringify(test.inputs)}\` | \`${JSON.stringify(test.expectedOutputs)}\` | Exception handling | ${test.description} |`
  )
  .join('\n')}

### **Utility Function Test Cases**

| Test Name | Function | Inputs | Expected Output | Validation |
|-----------|----------|--------|----------------|------------|
${utilityTests
  .map(
    (test) =>
      `| **${test.name}** | Utility function | \`${JSON.stringify(test.inputs)}\` | \`${JSON.stringify(test.expectedOutputs)}\` | ${test.description} |`
  )
  .join('\n')}`;
  }

  /**
   * Write generated content to file
   */
  private async writeToFile(content: string): Promise<void> {
    // Ensure docs directory exists
    const docsDir = path.dirname(this.outputPath);
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    fs.writeFileSync(this.outputPath, content, 'utf-8');
  }
}

// CLI execution
if (require.main === module) {
  const generator = new TestSummaryGenerator();
  generator.generateSummary().catch(console.error);
}

export { TestSummaryGenerator };
