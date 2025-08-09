#!/usr/bin/env node
// Tiny roadmap updater: flips [ ] → [x] when tests under `path:` pass.
// Conventions:
// - docs/ROADMAP.md contains lines like: "- [ ] Title <!-- id:7.4.phase1 path:src/... -->"
// - tmp/jest.json contains Jest --json output
// Works on Node 18+. No external deps.

const fs = require("fs");
const path = require("path");

const JEST_JSON = path.resolve("tmp/jest.json");
const ROADMAP_MD = path.resolve("docs/ROADMAP.md");

function readJSON(p) {
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function parseJest(jestJson) {
  // Build a quick index of test file results
  // We'll count assertion results per file to decide pass/fail.
  const byFile = new Map();
  const results = (jestJson && jestJson.testResults) || [];
  for (const tr of results) {
    // tr.name = absolute file path
    let passed = 0,
      failed = 0,
      total = 0;
    for (const ar of tr.assertionResults || []) {
      total++;
      if (ar.status === "passed") passed++;
      else if (ar.status === "failed") failed++;
    }
    byFile.set(tr.name || "", { passed, failed, total });
  }
  return byFile;
}

function summaryForPath(byFile, needle) {
  const norm = needle.replace(/\\/g, "/").toLowerCase();
  let passed = 0,
    failed = 0,
    total = 0;
  for (const [f, s] of byFile.entries()) {
    const fwd = f.replace(/\\/g, "/").toLowerCase();
    if (fwd.includes(norm)) {
      passed += s.passed;
      failed += s.failed;
      total += s.total;
    }
  }
  return { passed, failed, total };
}

function decideChecked(stats) {
  // Consider "complete" when we have at least 1 assertion and 0 failures.
  return stats.total > 0 && stats.failed === 0;
}

function updateRoadmap(roadmapStr, byFile) {
  const lines = roadmapStr.split(/\r?\n/);
  const tagRe =
    /^\s*-\s*\[( |x)\]\s*(.+?)\s*<!--\s*id:([^\s]+)\s+path:([^>]+?)\s*-->\s*$/i;
  let changes = 0;
  const out = lines.map((line) => {
    const m = line.match(tagRe);
    if (!m) return line;

    const currentlyChecked = m[1] === "x";
    const title = m[2];
    const id = m[3];
    const pathSubstr = m[4];

    const stats = summaryForPath(byFile, pathSubstr);
    const shouldCheck = decideChecked(stats);

    if (shouldCheck !== currentlyChecked) {
      changes++;
      const mark = shouldCheck ? "x" : " ";
      console.log(
        `📋 ${id}: ${title} → ${shouldCheck ? "✅" : "⏸️"} (${stats.passed}/${stats.total} tests)`
      );
      return line.replace(/^(\s*-\s*\[)( |x)(\]\s*)/, `$1${mark}$3`);
    }
    return line;
  });

  return { text: out.join("\n"), changes };
}

function main() {
  if (!fs.existsSync(ROADMAP_MD)) {
    console.error(`❌ Missing ${ROADMAP_MD}. Aborting.`);
    process.exit(2);
  }
  const jestJson = readJSON(JEST_JSON);
  if (!jestJson) {
    console.error(
      `❌ Missing or invalid ${JEST_JSON}. Run tests to generate it.`
    );
    process.exit(3);
  }
  const byFile = parseJest(jestJson);
  const roadmap = fs.readFileSync(ROADMAP_MD, "utf8");
  const { text, changes } = updateRoadmap(roadmap, byFile);

  if (changes > 0) {
    fs.writeFileSync(ROADMAP_MD, text, "utf8");
    console.log(`✅ ROADMAP updated: ${changes} checkbox(es) flipped.`);
  } else {
    console.log("ℹ️ ROADMAP unchanged (no flips needed).");
  }
}

main();
