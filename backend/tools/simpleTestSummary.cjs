/**
 * Simple Test Summary Generator
 * Works with the current ES module setup
 */

const fs = require('fs');
const path = require('path');

function generateSimpleTestSummary() {
  console.log('🔍 Generating test summary from existing documentation...');

  const inputPath = path.join(
    __dirname,
    '../docs/module-5.1-5.2-test-summary.md'
  );
  const outputPath = path.join(
    __dirname,
    '../docs/module-5.1-5.2-test-summary-updated.md'
  );

  if (!fs.existsSync(inputPath)) {
    console.log('❌ Test summary markdown file not found!');
    console.log('📁 Looking for:', inputPath);
    return;
  }

  // Read existing content
  const content = fs.readFileSync(inputPath, 'utf-8');

  // Update timestamp
  const now = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const updatedContent = content.replace(
    /_Generated on: .*?_/,
    `_Generated on: ${now}_`
  );

  // Write updated content
  fs.writeFileSync(outputPath, updatedContent, 'utf-8');

  console.log('✅ Test summary updated successfully!');
  console.log('📁 Output:', outputPath);

  // Also update the original file
  fs.writeFileSync(inputPath, updatedContent, 'utf-8');
  console.log('📁 Original file updated:', inputPath);
}

module.exports = { generateSimpleTestSummary };

// CLI execution
if (require.main === module) {
  generateSimpleTestSummary();
}
