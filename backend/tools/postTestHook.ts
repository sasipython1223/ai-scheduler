/**
 * Jest Post-Test Hook
 * Automatically generates test documentation after successful test runs
 *
 * Add this to jest.config.json:
 * "globalTeardown": "./tools/postTestHook.ts"
 */

import { CSVExporter } from './exportCSV';
import { TestSummaryGenerator } from './generateTestSummary';

async function postTestHook(): Promise<void> {
  console.log('\n🔧 Running post-test documentation generation...');

  try {
    // Generate Markdown summary
    console.log('📝 Generating test summary...');
    const generator = new TestSummaryGenerator();
    await generator.generateSummary();

    // Export to CSV
    console.log('📊 Exporting to CSV...');
    const exporter = new CSVExporter();
    await exporter.exportToCSV();

    console.log('✅ Test documentation updated successfully!');
    console.log('📁 Files generated:');
    console.log('   - backend/docs/module-5.1-5.2-test-summary.md');
    console.log('   - backend/docs/module-5.1-5.2-test-summary.csv');
  } catch (error) {
    console.error('❌ Error generating test documentation:', error);
    // Don't fail the test run because of documentation errors
  }
}

export default postTestHook;
