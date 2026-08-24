#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const TOOL_VERSION = '1.0.0';
const DEFAULT_MAX_SHRINK_PERCENT = 40;
const DEFAULT_MAX_GROWTH_PERCENT = 400;

function fail(message, code = 1) {
  const err = new Error(message);
  err.exitCode = code;
  throw err;
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function countOccurrences(haystack, needle) {
  if (needle === '') fail('Empty search strings are not allowed.');
  let count = 0;
  let index = 0;
  while ((index = haystack.indexOf(needle, index)) !== -1) {
    count += 1;
    index += needle.length;
  }
  return count;
}

function replaceExact(source, find, replacement, expected, label) {
  const count = countOccurrences(source, find);
  if (count !== expected) {
    fail(`${label}: expected ${expected} match(es), found ${count}. No files were changed.`);
  }
  return source.split(find).join(replacement);
}

function applyOperation(source, op, filePath, index) {
  if (!op || typeof op !== 'object') fail(`${filePath}: operation #${index + 1} must be an object.`);
  const expected = op.expected ?? 1;
  if (!Number.isInteger(expected) || expected < 1) fail(`${filePath}: operation #${index + 1} has invalid expected count.`);
  const label = `${filePath} operation #${index + 1} (${op.type})`;

  switch (op.type) {
    case 'replace':
      if (typeof op.find !== 'string' || typeof op.replace !== 'string') fail(`${label}: find/replace must be strings.`);
      return replaceExact(source, op.find, op.replace, expected, label);
    case 'insertAfter':
      if (typeof op.anchor !== 'string' || typeof op.content !== 'string') fail(`${label}: anchor/content must be strings.`);
      return replaceExact(source, op.anchor, op.anchor + op.content, expected, label);
    case 'insertBefore':
      if (typeof op.anchor !== 'string' || typeof op.content !== 'string') fail(`${label}: anchor/content must be strings.`);
      return replaceExact(source, op.anchor, op.content + op.anchor, expected, label);
    case 'delete':
      if (typeof op.find !== 'string') fail(`${label}: find must be a string.`);
      return replaceExact(source, op.find, '', expected, label);
    case 'assert': {
      if (typeof op.contains !== 'string') fail(`${label}: contains must be a string.`);
      const actual = countOccurrences(source, op.contains);
      if (actual !== expected) fail(`${label}: expected assertion count ${expected}, found ${actual}. No files were changed.`);
      return source;
    }
    default:
      fail(`${label}: unsupported operation type.`);
  }
}

function safeTarget(root, relativePath) {
  if (typeof relativePath !== 'string' || !relativePath.trim()) fail('Every file entry needs a non-empty path.');
  if (path.isAbsolute(relativePath)) fail(`Absolute paths are blocked: ${relativePath}`);
  const normalized = path.normalize(relativePath);
  if (normalized === '..' || normalized.startsWith(`..${path.sep}`)) fail(`Path traversal is blocked: ${relativePath}`);
  const target = path.resolve(root, normalized);
  const rootResolved = path.resolve(root);
  if (target !== rootResolved && !target.startsWith(rootResolved + path.sep)) fail(`Path escapes project root: ${relativePath}`);
  return target;
}

function validateSizeSafety(before, after, filePath, safety = {}) {
  if (before.length === 0) return;
  const shrink = ((before.length - after.length) / before.length) * 100;
  const growth = ((after.length - before.length) / before.length) * 100;
  const maxShrink = safety.maxFileShrinkPercent ?? DEFAULT_MAX_SHRINK_PERCENT;
  const maxGrowth = safety.maxFileGrowthPercent ?? DEFAULT_MAX_GROWTH_PERCENT;
  if (shrink > maxShrink) fail(`${filePath}: proposed file shrinks by ${shrink.toFixed(1)}% (limit ${maxShrink}%).`);
  if (growth > maxGrowth) fail(`${filePath}: proposed file grows by ${growth.toFixed(1)}% (limit ${maxGrowth}%).`);
}

function runPostconditions(text, conditions = [], filePath) {
  conditions.forEach((condition, i) => {
    const label = `${filePath} postcondition #${i + 1}`;
    if (typeof condition.contains === 'string') {
      const expected = condition.expected ?? 1;
      const actual = countOccurrences(text, condition.contains);
      if (actual !== expected) fail(`${label}: expected ${expected} occurrence(s), found ${actual}.`);
    } else if (typeof condition.notContains === 'string') {
      const actual = countOccurrences(text, condition.notContains);
      if (actual !== 0) fail(`${label}: forbidden content is still present (${actual} occurrence(s)).`);
    } else {
      fail(`${label}: use contains or notContains.`);
    }
  });
}

function syntaxCheck(text, kind, filePath) {
  if (!kind) return;
  if (kind !== 'js') fail(`${filePath}: unsupported syntax check '${kind}'.`);
  const ext = path.extname(filePath) === '.mjs' ? '.mjs' : '.js';
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'patch-runner-check-'));
  const tempFile = path.join(tempDir, `candidate${ext}`);
  try {
    fs.writeFileSync(tempFile, text, 'utf8');
    const result = spawnSync(process.execPath, ['--check', tempFile], { encoding: 'utf8' });
    if (result.status !== 0) {
      fail(`${filePath}: JavaScript syntax check failed:\n${(result.stderr || result.stdout).trim()}`);
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function findGitDir(root) {
  let current = path.resolve(root);
  while (true) {
    const candidate = path.join(current, '.git');
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return candidate;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function stateRoot(root) {
  const gitDir = findGitDir(root);
  return gitDir ? path.join(gitDir, 'patch-runner') : path.join(root, '.patch-runner');
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function loadManifest(manifestPath) {
  const raw = fs.readFileSync(manifestPath, 'utf8');
  let manifest;
  try { manifest = JSON.parse(raw); } catch (err) { fail(`Invalid JSON in ${manifestPath}: ${err.message}`); }
  if (manifest.version !== 1) fail(`Unsupported patch manifest version '${manifest.version}'. Expected 1.`);
  if (!manifest.id || typeof manifest.id !== 'string') fail('Patch manifest requires a string id.');
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) fail('Patch manifest requires at least one file entry.');
  return manifest;
}

export function planPatch({ root = process.cwd(), manifestPath }) {
  const rootResolved = path.resolve(root);
  const manifestResolved = path.resolve(manifestPath);
  const manifest = loadManifest(manifestResolved);
  const seen = new Set();
  const changes = [];

  for (const entry of manifest.files) {
    const target = safeTarget(rootResolved, entry.path);
    const relative = path.relative(rootResolved, target).split(path.sep).join('/');
    if (seen.has(target)) fail(`Duplicate file entry is blocked: ${relative}`);
    seen.add(target);
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) fail(`${relative}: target file does not exist.`);

    const before = fs.readFileSync(target, 'utf8');
    const beforeHash = sha256(before);
    if (entry.expectedSha256 && entry.expectedSha256 !== beforeHash) {
      fail(`${relative}: SHA-256 mismatch. Expected ${entry.expectedSha256}, got ${beforeHash}.`);
    }

    let after = before;
    const operations = entry.operations ?? [];
    if (!Array.isArray(operations) || operations.length === 0) fail(`${relative}: at least one operation is required.`);
    operations.forEach((op, i) => { after = applyOperation(after, op, relative, i); });
    validateSizeSafety(before, after, relative, manifest.safety);
    runPostconditions(after, entry.postconditions, relative);
    syntaxCheck(after, entry.syntax, relative);

    changes.push({
      path: relative,
      absolutePath: target,
      before,
      after,
      beforeSha256: beforeHash,
      afterSha256: sha256(after),
      changed: before !== after,
      bytesBefore: Buffer.byteLength(before),
      bytesAfter: Buffer.byteLength(after),
    });
  }

  if (!changes.some(c => c.changed)) fail('Patch produced no changes.');
  return { manifest, root: rootResolved, manifestPath: manifestResolved, changes };
}

function createRunId(id) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const safeId = id.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'patch';
  return `${stamp}-${safeId}`;
}

export function applyPlannedPatch(plan) {
  const runId = createRunId(plan.manifest.id);
  const state = stateRoot(plan.root);
  const runDir = path.join(state, 'runs', runId);
  const backupsDir = path.join(runDir, 'backups');
  fs.mkdirSync(backupsDir, { recursive: true });

  const changed = plan.changes.filter(c => c.changed);
  const journal = {
    toolVersion: TOOL_VERSION,
    runId,
    patchId: plan.manifest.id,
    description: plan.manifest.description ?? '',
    appliedAt: new Date().toISOString(),
    root: plan.root,
    manifestPath: plan.manifestPath,
    files: changed.map(c => ({
      path: c.path,
      beforeSha256: c.beforeSha256,
      afterSha256: c.afterSha256,
      bytesBefore: c.bytesBefore,
      bytesAfter: c.bytesAfter,
    })),
  };

  for (const change of changed) {
    const backup = path.join(backupsDir, change.path);
    fs.mkdirSync(path.dirname(backup), { recursive: true });
    fs.writeFileSync(backup, change.before, 'utf8');
  }

  const written = [];
  try {
    for (const change of changed) {
      const temp = `${change.absolutePath}.patch-runner-${process.pid}-${Date.now()}.tmp`;
      fs.writeFileSync(temp, change.after, 'utf8');
      fs.renameSync(temp, change.absolutePath);
      written.push(change);
    }
  } catch (err) {
    for (const change of written.reverse()) {
      fs.writeFileSync(change.absolutePath, change.before, 'utf8');
    }
    fail(`Apply failed and already-written files were restored: ${err.message}`);
  }

  writeJson(path.join(runDir, 'journal.json'), journal);
  fs.mkdirSync(state, { recursive: true });
  fs.writeFileSync(path.join(state, 'latest'), runId + '\n', 'utf8');
  return journal;
}

export function rollbackPatch({ root = process.cwd(), runId = 'latest' }) {
  const rootResolved = path.resolve(root);
  const state = stateRoot(rootResolved);
  let resolvedRunId = runId;
  if (runId === 'latest') {
    const latestFile = path.join(state, 'latest');
    if (!fs.existsSync(latestFile)) fail('No Patch Runner history found for rollback.');
    resolvedRunId = fs.readFileSync(latestFile, 'utf8').trim();
  }
  const runDir = path.join(state, 'runs', resolvedRunId);
  const journalPath = path.join(runDir, 'journal.json');
  if (!fs.existsSync(journalPath)) fail(`Rollback run not found: ${resolvedRunId}`);
  const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));

  const restorePlan = [];
  for (const file of journal.files) {
    const target = safeTarget(rootResolved, file.path);
    if (!fs.existsSync(target)) fail(`${file.path}: current target is missing; rollback aborted.`);
    const current = fs.readFileSync(target, 'utf8');
    const currentHash = sha256(current);
    if (currentHash !== file.afterSha256) {
      fail(`${file.path}: current file has changed since patch ${resolvedRunId}; rollback aborted to avoid overwriting newer work.`);
    }
    const backup = path.join(runDir, 'backups', file.path);
    if (!fs.existsSync(backup)) fail(`${file.path}: backup missing; rollback aborted.`);
    const before = fs.readFileSync(backup, 'utf8');
    if (sha256(before) !== file.beforeSha256) fail(`${file.path}: backup hash mismatch; rollback aborted.`);
    restorePlan.push({ target, before, path: file.path });
  }

  for (const item of restorePlan) fs.writeFileSync(item.target, item.before, 'utf8');
  const rollbackRecord = {
    runId: resolvedRunId,
    rolledBackAt: new Date().toISOString(),
    files: restorePlan.map(x => x.path),
  };
  writeJson(path.join(runDir, `rollback-${Date.now()}.json`), rollbackRecord);
  return rollbackRecord;
}

function printPlan(plan) {
  console.log(`Patch Runner v${TOOL_VERSION}`);
  console.log(`Patch: ${plan.manifest.id}${plan.manifest.description ? ` — ${plan.manifest.description}` : ''}`);
  console.log(`Root: ${plan.root}`);
  for (const change of plan.changes) {
    const delta = change.bytesAfter - change.bytesBefore;
    console.log(`  ${change.changed ? 'CHANGE' : 'SAME  '} ${change.path}  ${change.bytesBefore} -> ${change.bytesAfter} bytes (${delta >= 0 ? '+' : ''}${delta})`);
    console.log(`         ${change.beforeSha256.slice(0, 12)} -> ${change.afterSha256.slice(0, 12)}`);
  }
}

function usage() {
  console.log(`Usage:\n  node patch-runner.mjs <patch.json> [--root <dir>] [--apply]\n  node patch-runner.mjs --rollback <run-id|latest> [--root <dir>]\n\nSafety:\n  - Dry-run is the default.\n  - Exact-match counts must pass before any write.\n  - Optional SHA-256 guards detect stale files.\n  - Suspicious file shrink/growth is blocked.\n  - JavaScript candidates can be syntax-checked before write.\n  - Apply writes backups and records a rollback journal.\n`);
}

function parseArgs(argv) {
  const args = [...argv];
  const out = { root: process.cwd(), apply: false, rollback: null, manifestPath: null };
  while (args.length) {
    const arg = args.shift();
    if (arg === '--apply') out.apply = true;
    else if (arg === '--root') {
      if (!args.length) fail('--root requires a directory.');
      out.root = args.shift();
    } else if (arg === '--rollback') {
      if (!args.length) fail('--rollback requires a run id or latest.');
      out.rollback = args.shift();
    } else if (arg === '--help' || arg === '-h') out.help = true;
    else if (arg.startsWith('-')) fail(`Unknown option: ${arg}`);
    else if (!out.manifestPath) out.manifestPath = arg;
    else fail(`Unexpected argument: ${arg}`);
  }
  return out;
}

export function main(argv = process.argv.slice(2)) {
  try {
    const args = parseArgs(argv);
    if (args.help) { usage(); return 0; }
    if (args.rollback) {
      const result = rollbackPatch({ root: args.root, runId: args.rollback });
      console.log(`Rolled back ${result.runId}: ${result.files.length} file(s) restored.`);
      return 0;
    }
    if (!args.manifestPath) { usage(); return 2; }
    const plan = planPatch({ root: args.root, manifestPath: args.manifestPath });
    printPlan(plan);
    if (!args.apply) {
      console.log('\nDRY RUN ONLY — no files changed. Add --apply to write the patch.');
      return 0;
    }
    const journal = applyPlannedPatch(plan);
    console.log(`\nApplied safely. Run id: ${journal.runId}`);
    console.log('Rollback: node tools/patch-runner/patch-runner.mjs --rollback latest');
    return 0;
  } catch (err) {
    console.error(`Patch Runner error: ${err.message}`);
    return err.exitCode || 1;
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) process.exitCode = main();
