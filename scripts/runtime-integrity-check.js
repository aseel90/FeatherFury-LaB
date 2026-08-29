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
  'world1-ground-obstacle-polish-v2.js',
  'world1-owl-dialogue-layer-fix-v3.js',
  'w2-boss-runtime-v10.js',
  'w3-runtime-cleanup-v1.js'
];
for (const file of requiredActive) if (!seen.has(file)) fail(`approved owner is not active: ${file}`);

const requiredRetired = ['world1-ground-gap-polish-v1.js'];
for (const file of requiredRetired) if (!retired.includes(file)) fail(`superseded runtime owner is not retired: ${file}`);

const order = requiredActive.reduce((o, f) => (o[f] = active.findIndex(x => x.startsWith(f)), o), {});
if (!(order['character-roster-v1.js'] < order['crow-king-ingame-v4.js'])) fail('character roster must load before final World 1 visual owners');
if (!(order['crow-king-ingame-v4.js'] < order['world1-final-art-lock-v1.js'])) fail('Crow King V4 must load before the final World 1 art lock');
if (!(order['world1-ground-obstacle-polish-v2.js'] < order['world1-owl-dialogue-layer-fix-v3.js'])) fail('World 1 dialogue layer must load after the final ground owner');
const outroLayer = read('world1-owl-dialogue-layer-fix-v3.js');
if (!/phase:\s*['"]approach['"]/.test(outroLayer) || !/phase:\s*['"]depart['"]/.test(outroLayer) || !/__ffVictoryAllowFinish\s*=\s*true/.test(outroLayer)) fail('World 1 outro cinematic ownership is incomplete');

if (/startup-menu-guard-v1\.js/.test(index)) fail('obsolete startup-menu-guard-v1.js is still loaded by index.html');
if (/patch-manifest\.js|patch-runner\.js/.test(index)) fail('legacy patch runner/manifest boot path is still loaded by index.html');
if (!/game\.js\?v=2\.4\.5/.test(index)) fail('index.html is not pinned to approved game.js v2.4.5');
if (!/ui-splash-approved-v3\.css\?v=1/.test(index)) fail('approved splash CSS is not loaded');
if (!/ui-splash-approved-v3\.js\?v=12/.test(index)) fail('approved splash JS is not pinned to v12');
if (/cdn\.jsdelivr\.net\/gh\/aseel90\/FeatherFury-LaB@|fetch\(BASE/.test(index)) fail('index.html still bootstraps from a historical remote commit');

if (!/ui-runtime-boot-v1\.js\?v=1/.test(index)) fail('post-runtime UI boot loader is not active');
if (/ui-main-menu-v2\.js/.test(index)) fail('retired main-menu V2 JS is still loaded directly');
for (const legacyDirect of ['lab-ui.js','ui-settings-leaderboard-v1.js','ui-store-v1.js','ui-main-menu-v3.js','ui-world-select-v1.js','ui-end-screens-v1.js','ui-hud-v1.js','ui-foundation-v1.js']) {
  const re = new RegExp(`<script[^>]+src=["']${legacyDirect.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`);
  if (re.test(index)) fail(`runtime-dependent UI is still loaded directly by index.html: ${legacyDirect}`);
}
const uiBoot = read('ui-runtime-boot-v1.js');
for (const token of ['__FF_RUNTIME_APPROVED_STACK__','__FF_MENU_UI_READY__','ui-world-select-v1.js?v=8','ui-main-menu-v3.js?v=5']) {
  if (!uiBoot.includes(token)) fail(`ui-runtime-boot-v1.js is missing menu boot contract: ${token}`);
}
const splashJs = read('ui-splash-approved-v3.js');
if (!splashJs.includes('__FF_MENU_UI_READY__')) fail('splash can reveal the menu before post-runtime UI is ready');
if (/elapsed>=15000\)finish\(\)/.test(splashJs)) fail('splash still force-finishes on a timer before runtime/menu readiness');

const requiredDom = [
  'class="top-bar"',
  'class="start-main-content"',
  'class="title-container"',
  'class="worlds-carousel"',
  'id="worldCard"',
  'id="previewBirdCanvas"',
  'id="sessionCoinDisplay"',
  'id="currentScoreDisplay"',
  'id="highScore"',
  'id="earnedCoins"',
  'id="sfxToggleBtn"',
  'id="resetDataBtn"',
  'id="htmlTag"',
  'id="startTotalCoins"',
  'id="leaderboardBtn"',
  'id="shopBtnStart"'
];
for (const token of requiredDom) if (!index.includes(token)) fail(`index.html is missing current UI DOM contract: ${token}`);
for (const compatId of ['htmlTag','startTotalCoins','leaderboardBtn','shopBtnStart']) {
  if (!new RegExp(`id=[\"']${compatId}[\"']`).test(index)) fail(`legacy core compatibility hook missing: ${compatId}`);
}
if (!/id=['"]startStoryBtn['"]/.test(index)) fail('index.html is missing startStoryBtn');
if (/class=['"][^'"]*menu-card|id=['"]startBtn['"]/.test(index)) fail('legacy main-menu DOM leaked into index.html');
const labUi = read('lab-ui.js');
if (!labUi.includes('FF_LAB_RUNTIME_SAFE')) fail('lab-ui.js is not the local safe helper');
if (/cdn\.jsdelivr\.net|createElement\(['"]script['"]\)/.test(labUi)) fail('lab-ui.js still contains a remote/nested script loader');

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
