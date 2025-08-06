/**
 * CSV Export Tool for Test Cases
 * Converts test summary to CSV format for Excel reporting
 *
 * Usage: npm run export-csv
 */

import * as fs from 'fs';
import * as path from 'path';

const __dirname = path.dirname(__filename);

interface CSVTestCase {
  module: string;
  category: string;
  testName: string;
  inputTasks: string;
  inputLinks: string;
  expectedValidationErrors: string;
  expectedEarlyDates: string;
  projectEndDate: string;
  notes: string;
}

class CSVExporter {
  private readonly inputPath = path.join(
    __dirname,
    '../docs/module-5.1-5.2-test-summary.md'
  );
  private readonly outputPath = path.join(
    __dirname,
    '../docs/module-5.1-5.2-test-summary.csv'
  );

  /**
   * Main export function
   */
  async exportToCSV(): Promise<void> {
    console.log('📄 Reading test summary...');

    const markdownContent = fs.readFileSync(this.inputPath, 'utf-8');
    const testCases = this.parseMarkdownTables(markdownContent);

    console.log(`📊 Found ${testCases.length} test cases to export`);

    const csvContent = this.generateCSV(testCases);

    fs.writeFileSync(this.outputPath, csvContent, 'utf-8');

    console.log(`✅ CSV exported to: ${this.outputPath}`);
  }

  /**
   * Parse Markdown tables and extract test cases
   */
  private parseMarkdownTables(content: string): CSVTestCase[] {
    const testCases: CSVTestCase[] = [];

    // Extract Module 5.1 tables
    const module51Section = this.extractSection(
      content,
      '## 📊 **Module 5.1: Data Validation Tests**'
    );
    if (module51Section) {
      testCases.push(...this.parseValidationTable(module51Section));
    }

    // Extract Module 5.2 tables
    const module52Section = this.extractSection(
      content,
      '## 🚀 **Module 5.2: CPM Forward Pass Tests**'
    );
    if (module52Section) {
      testCases.push(...this.parseForwardPassTable(module52Section));
    }

    return testCases;
  }

  /**
   * Extract a section from markdown content
   */
  private extractSection(
    content: string,
    sectionHeader: string
  ): string | null {
    const startIndex = content.indexOf(sectionHeader);
    if (startIndex === -1) return null;

    const nextSectionIndex = content.indexOf('\n## ', startIndex + 1);
    const endIndex =
      nextSectionIndex === -1 ? content.length : nextSectionIndex;

    return content.substring(startIndex, endIndex);
  }

  /**
   * Parse validation test tables from Module 5.1
   */
  private parseValidationTable(section: string): CSVTestCase[] {
    const testCases: CSVTestCase[] = [];

    // Extract Task Validation table
    const taskTableMatch = section.match(
      /### \*\*Task Validation Test Cases\*\*([\s\S]*?)(?=###|$)/
    );
    if (taskTableMatch) {
      const rows = this.extractTableRows(taskTableMatch[1]);
      for (const row of rows) {
        testCases.push({
          module: '5.1',
          category: 'Task Validation',
          testName: this.cleanTableCell(row[0]),
          inputTasks: this.cleanTableCell(row[1]),
          inputLinks: '',
          expectedValidationErrors: this.cleanTableCell(row[2]),
          expectedEarlyDates: '',
          projectEndDate: '',
          notes: this.cleanTableCell(row[4] || ''),
        });
      }
    }

    // Extract Logic Link Validation table
    const linkTableMatch = section.match(
      /### \*\*Logic Link Validation Test Cases\*\*([\s\S]*?)(?=###|$)/
    );
    if (linkTableMatch) {
      const rows = this.extractTableRows(linkTableMatch[1]);
      for (const row of rows) {
        testCases.push({
          module: '5.1',
          category: 'Logic Link Validation',
          testName: this.cleanTableCell(row[0]),
          inputTasks: '',
          inputLinks: this.cleanTableCell(row[1]),
          expectedValidationErrors: this.cleanTableCell(row[2]),
          expectedEarlyDates: '',
          projectEndDate: '',
          notes: this.cleanTableCell(row[4] || ''),
        });
      }
    }

    return testCases;
  }

  /**
   * Parse forward pass test tables from Module 5.2
   */
  private parseForwardPassTable(section: string): CSVTestCase[] {
    const testCases: CSVTestCase[] = [];

    // Extract Forward Pass Calculation table
    const forwardPassMatch = section.match(
      /### \*\*Forward Pass Calculation Test Cases\*\*([\s\S]*?)(?=###|$)/
    );
    if (forwardPassMatch) {
      const rows = this.extractTableRows(forwardPassMatch[1]);
      for (const row of rows) {
        testCases.push({
          module: '5.2',
          category: 'Forward Pass Calculation',
          testName: this.cleanTableCell(row[0]),
          inputTasks: this.cleanTableCell(row[1]),
          inputLinks: this.cleanTableCell(row[2]),
          expectedValidationErrors: '',
          expectedEarlyDates: this.cleanTableCell(row[3]),
          projectEndDate: this.cleanTableCell(row[4]),
          notes: this.cleanTableCell(row[5] || ''),
        });
      }
    }

    // Extract Error Handling table
    const errorHandlingMatch = section.match(
      /### \*\*Error Handling Test Cases\*\*([\s\S]*?)(?=###|$)/
    );
    if (errorHandlingMatch) {
      const rows = this.extractTableRows(errorHandlingMatch[1]);
      for (const row of rows) {
        testCases.push({
          module: '5.2',
          category: 'Error Handling',
          testName: this.cleanTableCell(row[0]),
          inputTasks: this.cleanTableCell(row[1]),
          inputLinks: this.cleanTableCell(row[2]),
          expectedValidationErrors: this.cleanTableCell(row[3]),
          expectedEarlyDates: '',
          projectEndDate: '',
          notes: this.cleanTableCell(row[5] || ''),
        });
      }
    }

    // Extract Utility Function table
    const utilityMatch = section.match(
      /### \*\*Utility Function Test Cases\*\*([\s\S]*?)(?=###|$)/
    );
    if (utilityMatch) {
      const rows = this.extractTableRows(utilityMatch[1]);
      for (const row of rows) {
        testCases.push({
          module: '5.2',
          category: 'Utility Functions',
          testName: this.cleanTableCell(row[0]),
          inputTasks: this.cleanTableCell(row[2]),
          inputLinks: '',
          expectedValidationErrors: '',
          expectedEarlyDates: this.cleanTableCell(row[3]),
          projectEndDate: '',
          notes: this.cleanTableCell(row[5] || ''),
        });
      }
    }

    return testCases;
  }

  /**
   * Extract table rows from markdown table
   */
  private extractTableRows(tableContent: string): string[][] {
    const lines = tableContent.split('\n');
    const rows: string[][] = [];

    for (const line of lines) {
      // Skip empty lines and header separator
      if (!line.trim() || line.includes('---')) continue;

      // Split by | and clean up
      const cells = line
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell) => cell);

      // Skip header row (usually starts with Test Name)
      if (cells.length > 0 && !cells[0].toLowerCase().includes('test name')) {
        rows.push(cells);
      }
    }

    return rows;
  }

  /**
   * Clean table cell content
   */
  private cleanTableCell(cell: string): string {
    return cell
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/`/g, '') // Remove code markdown
      .replace(/^\||\|$/g, '') // Remove pipe characters
      .trim();
  }

  /**
   * Generate CSV content from test cases
   */
  private generateCSV(testCases: CSVTestCase[]): string {
    const header = [
      'Module',
      'Category',
      'Test Name',
      'Input Tasks',
      'Input Links',
      'Expected Validation Errors',
      'Expected Early Dates',
      'Project End Date',
      'Notes',
    ];

    const csvRows = [header.join(',')];

    for (const testCase of testCases) {
      const row = [
        this.escapeCSVField(testCase.module),
        this.escapeCSVField(testCase.category),
        this.escapeCSVField(testCase.testName),
        this.escapeCSVField(testCase.inputTasks),
        this.escapeCSVField(testCase.inputLinks),
        this.escapeCSVField(testCase.expectedValidationErrors),
        this.escapeCSVField(testCase.expectedEarlyDates),
        this.escapeCSVField(testCase.projectEndDate),
        this.escapeCSVField(testCase.notes),
      ];

      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Escape CSV field for proper formatting
   */
  private escapeCSVField(field: string): string {
    // If field contains comma, newline, or quote, wrap in quotes and escape quotes
    if (field.includes(',') || field.includes('\n') || field.includes('"')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}

// CLI execution
if (require.main === module) {
  const exporter = new CSVExporter();
  exporter.exportToCSV().catch(console.error);
}

export { CSVExporter };
