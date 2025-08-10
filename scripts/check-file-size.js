#!/usr/bin/env node
/**
 * File size checker - ensures files stay under LOC limits
 * Usage: node scripts/check-file-size.js --max=200 --ignore="**/*test*.ts"
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Parse command line arguments
const args = process.argv.slice(2);
const maxLines = parseInt(args.find(arg => arg.startsWith('--max='))?.split('=')[1] || '200');
const ignorePattern = args.find(arg => arg.startsWith('--ignore='))?.split('=')[1] || '**/*test*.ts';

console.log(`🔍 Checking file sizes (max: ${maxLines} LOC, ignore: ${ignorePattern})`);

// Find all TypeScript and JavaScript files
const allFiles = glob.sync('**/*.{ts,tsx,js,jsx}', {
  cwd: process.cwd(),
  ignore: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '.next/**',
    ignorePattern
  ]
});

let violations = [];
let totalFiles = 0;

for (const file of allFiles) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n').length;
    totalFiles++;
    
    if (lines > maxLines) {
      violations.push({
        file,
        lines,
        excess: lines - maxLines
      });
    }
  } catch (error) {
    console.warn(`⚠️  Could not read ${file}: ${error.message}`);
  }
}

// Report results
console.log(`📊 Scanned ${totalFiles} files`);

if (violations.length === 0) {
  console.log('✅ All files within size limits!');
  process.exit(0);
} else {
  console.log(`❌ Found ${violations.length} file(s) exceeding ${maxLines} LOC:`);
  console.log('');
  
  violations
    .sort((a, b) => b.excess - a.excess)
    .forEach(({ file, lines, excess }) => {
      console.log(`  ${file}: ${lines} lines (+${excess} over limit)`);
    });
  
  console.log('');
  console.log('💡 Consider splitting large files into smaller, focused modules.');
  process.exit(1);
}
