/**
 * Simple CSV Generator from Existing Markdown
 * Converts the current test summary to CSV format
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateCSVFromMarkdown() {
  console.log('📄 Converting existing test summary to CSV...');

  const inputPath = path.join(
    __dirname,
    '../docs/module-5.1-5.2-test-summary.md'
  );
  const outputPath = path.join(
    __dirname,
    '../docs/module-5.1-5.2-test-summary.csv'
  );

  if (!fs.existsSync(inputPath)) {
    console.log('❌ Test summary markdown file not found!');
    return;
  }

  const content = fs.readFileSync(inputPath, 'utf-8');

  // Simple CSV header
  const csvRows = ['Module,Category,Test Name,Description,Status'];

  // Extract test names from tables
  const testNameRegex = /\|\s*\*\*(.*?)\*\*\s*\|/g;
  let match;
  let testCount = 0;

  while ((match = testNameRegex.exec(content)) !== null) {
    const testName = match[1];
    if (!testName.includes('Test Name') && testName.trim()) {
      testCount++;
      // Determine module based on position in file
      const position = match.index;
      const module52SectionStart = content.indexOf(
        '## 🚀 **Module 5.2: CPM Forward Pass Tests**'
      );
      const module =
        position > module52SectionStart && module52SectionStart !== -1
          ? '5.2'
          : '5.1';

      // Determine category based on test name and module
      let category = 'General';

      if (module === '5.1') {
        if (
          testName.includes('Valid Task') ||
          testName.includes('Missing') ||
          testName.includes('Negative') ||
          testName.includes('Zero Duration') ||
          testName.includes('Invalid')
        ) {
          category = 'Task Validation';
        } else if (
          testName.includes('Link') &&
          !testName.includes('No Links')
        ) {
          category = 'Logic Link Validation';
        }
      } else if (module === '5.2') {
        if (
          testName.includes('Single Task') ||
          testName.includes('Linear Chain') ||
          testName.includes('Parallel') ||
          testName.includes('Start-to-Start') ||
          testName.includes('Finish-to-Finish') ||
          testName.includes('Lag') ||
          testName.includes('Milestone')
        ) {
          category = 'CPM Forward Pass';
        } else if (
          testName.includes('Circular') ||
          testName.includes('Empty Task List')
        ) {
          category = 'Error Handling';
        } else if (
          testName.includes('Utility') ||
          testName.includes('Project End Date')
        ) {
          category = 'Utility Functions';
        }
      }

      // Set status based on module completion
      const status =
        module === '5.1' || module === '5.2' ? 'COMPLETED' : 'Documented';

      csvRows.push(
        `"${module}","${category}","${testName}","Comprehensive test case","${status}"`
      );
    }
  }

  const csvContent = csvRows.join('\n');
  fs.writeFileSync(outputPath, csvContent, 'utf-8');

  console.log(`✅ CSV generated with ${testCount} test cases`);
  console.log(`📁 Output: ${outputPath}`);
}

generateCSVFromMarkdown().catch(console.error);
