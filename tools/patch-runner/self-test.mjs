import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { planPatch, applyPlannedPatch, rollbackPatch } from './patch-runner.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'patch-runner-selftest-'));
try {
  fs.writeFileSync(path.join(root, 'demo.js'), 'const speed = 4;\nconsole.log(speed);\n', 'utf8');
  const manifestPath = path.join(root, 'demo.patch.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    version: 1,
    id: 'self-test',
    files: [{
      path: 'demo.js',
      syntax: 'js',
      operations: [{ type: 'replace', find: 'const speed = 4;', replace: 'const speed = 5;', expected: 1 }],
      postconditions: [{ contains: 'const speed = 5;', expected: 1 }]
    }]
  }, null, 2));

  const plan = planPatch({ root, manifestPath });
  assert.equal(fs.readFileSync(path.join(root, 'demo.js'), 'utf8'), 'const speed = 4;\nconsole.log(speed);\n', 'dry-run planning must not write');
  const journal = applyPlannedPatch(plan);
  assert.match(fs.readFileSync(path.join(root, 'demo.js'), 'utf8'), /speed = 5/);
  rollbackPatch({ root, runId: journal.runId });
  assert.equal(fs.readFileSync(path.join(root, 'demo.js'), 'utf8'), 'const speed = 4;\nconsole.log(speed);\n');

  let staleBlocked = false;
  try {
    const stale = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    stale.files[0].expectedSha256 = '0'.repeat(64);
    fs.writeFileSync(manifestPath, JSON.stringify(stale));
    planPatch({ root, manifestPath });
  } catch { staleBlocked = true; }
  assert.equal(staleBlocked, true, 'stale SHA must be blocked');
  console.log('Patch Runner self-test: PASS');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
