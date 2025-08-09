const fs = require("fs");
const path = require("path");

// Read the test file
const filePath = "backend/tests/cmp-backward-pass.test.ts";
let content = fs.readFileSync(filePath, "utf8");

// Replace all instances of result.tasks.find((t) => t.id === 'ID')! with findTaskById(result.tasks, 'ID')
content = content.replace(
  /result\.tasks\.find\(\(t\) => t\.id === ([^)]+)\)!/g,
  "findTaskById(result.tasks, $1)"
);

// Write the file back
fs.writeFileSync(filePath, content, "utf8");

console.log(
  "✅ Fixed all TypeScript implicit any type issues in backward pass test file"
);
