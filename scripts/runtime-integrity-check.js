'use strict';
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const fail = msg => { console.error(`::error::${msg}`); process.exitCode = 1; };
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const exists = f => fs.existsSync(path.join(root, f));

const game = read('game.js');
const index = read('index.html');
const endCss = read('ui-end-screens-v1.css');

function extractArray(name) {
  const m = game.match(new RegExp(`const\\s+${name}\\s*=\\s*\\[([\\s\\S]*?)\\];`));
  if (!m) { fail(`game.js is missing ${name}`); return []; }
  const out = [];
  const re = /['"]([^'"]+\.js(?:\?[^'"]*)?)['"]/g;
  let x; while ((x = re.exec(m[1]))) out.push(x[1]);
  return out;
}

const active = extractArray('ACTIVE_PATCHES');
const retired = extractArray('RETIRED_PATCHES').map(x => x.split('?')[0]);
if (!active.length) fail('ACTIVE_PATCHES is empty');
if (!retired.length) fail('RETIRED_PATCHES is empty');

const seen = new Set();
for (const src of active) {
  const file = src.split('?')[0];
  if (seen.has(file)) fail(`duplicate active runtime owner: ${file}`);
  seen.add(file);
  if (!exists(file)) fail(`active runtime file is missing: ${file}`);
  if (retired.includes(file)) fail(`retired patch is active: ${file}`);
}

for (const file of retired) {
  const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const activeLiteral = new RegExp(`['"]${escaped}(?:\\?[^'"]*)?['"]`);
  const activeBlock = game.match(/const\s+ACTIVE_PATCHES\s*=\s*\[([\s\S]*?)\];/)?.[1] || '';
  if (activeLiteral.test(activeBlock)) fail(`retired patch leaked into ACTIVE_PATCHES: ${file}`);
}

const requiredActive = [
  'character-roster-v1.js',
  'crow-king-ingame-v4.js',
  'world1-cursed-woods-background-v3.js',
  'world1-cursed-obstacles-v5.js',
  'world1-final-art-lock-v1.js',
  'w2-boss-runtime-v10.js',
  'w3-runtime-cleanup-v1.js'
];
for (const file of requiredActive) if (!seen.has(file)) fail(`approved owner is not active: ${file}`);

const order = requiredActive.reduce((o, f) => (o[f] = active.findIndex(x => x.startsWith(f)), o), {});
if (!(order['character-roster-v1.js'] < order['crow-king-ingame-v4.js'])) fail('character roster must load before final World 1 visual owners');
if (!(order['crow-king-ingame-v4.js'] < order['world1-final-art-lock-v1.js'])) fail('Crow King V4 must load before the final World 1 art lock');

if (/startup-menu-guard-v1\.js/.test(index)) fail('obsolete startup-menu-guard-v1.js is still loaded by index.html');
if (/patch-manifest\.js|patch-runner\.js/.test(index)) fail('legacy patch runner/manifest boot path is still loaded by index.html');
if (!/game\.js\?v=2\.4\.0/.test(index)) fail('index.html is not pinned to approved game.js v2.4.0');
if (!/ui-splash-approved-v3\.css\?v=8/.test(index)) fail('approved splash CSS is not loaded');

const hidden = endCss.lastIndexOf('html body #ffPauseOverlay{display:none !important;}');
const shown = endCss.lastIndexOf('html body #ffPauseOverlay.show{display:flex !important;}');
if (hidden < 0 || shown < hidden) fail('pause visibility lock is missing or ordered incorrectly');

const hud = read('ui-hud-v1.css');
if (!/\.fever-bar-container[\s\S]*#ffBossHud[\s\S]*display:none\s*!important/.test(hud)) fail('HUD must hide fever bar and duplicate top boss HUD');

const markerChecks = [
  ['character-roster-v1.js', '__FF_CHARACTER_ROSTER_V1__'],
  ['crow-king-ingame-v4.js', '__ffCrowKingIngameV4Installed'],
  ['world1-final-art-lock-v1.js', '__world1FinalArtLockV1Installed'],
  ['w2-boss-runtime-v10.js', '__w2BossRuntimeV10Installed']
];
for (const [file, marker] of markerChecks) {
  const text = read(file);
  if (!text.includes(marker)) fail(`${file} is missing expected ready marker ${marker}`);
}

if (!process.exitCode) console.log(`Runtime integrity OK: ${active.length} active, ${retired.length} retired patches.`);
