const fs = require('fs');
const path = require('path');

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));

let failed = false;
function fail(msg) {
  failed = true;
  console.error(`RUNTIME-INTEGRITY FAIL: ${msg}`);
  process.exitCode = 1;
}

const game = read('game.js');
const index = read('index.html');
const runtimeDoc = read('RUNTIME_ACTIVE.md');

const activeMatch = game.match(/const ACTIVE_PATCHES = \[([\s\S]*?)\n\s*\];/);
const retiredMatch = game.match(/const RETIRED_PATCHES = new Set\(\[([\s\S]*?)\n\s*\]\);/);
if (!activeMatch) fail('ACTIVE_PATCHES block not found');
if (!retiredMatch) fail('RETIRED_PATCHES block not found');

const extract = block => [...block.matchAll(/'([^']+\.js(?:\?[^']*)?)'/g)].map(m => m[1]);
const active = activeMatch ? extract(activeMatch[1]).map(x => x.split('?')[0]) : [];
const retired = retiredMatch ? extract(retiredMatch[1]).map(x => x.split('?')[0]) : [];

const dup = active.filter((x, i) => active.indexOf(x) !== i);
if (dup.length) fail(`duplicate active patches: ${[...new Set(dup)].join(', ')}`);
const overlap = active.filter(x => retired.includes(x));
if (overlap.length) fail(`active/retired overlap: ${overlap.join(', ')}`);

for (const file of active) if (!exists(file)) fail(`active patch missing: ${file}`);
for (const forbidden of [
  'boss-crowking-v1.js',
  'world1-classic-enhanced-background-v1.js',
  'world1-ground-gap-polish-v1.js',
  'world2-ice-world-v2.js',
  'world2-ice-world-v3.js',
  'world2-ice-world-v4.js',
  'world2-ice-world-v5.js',
  'world2-ice-world-v6.js',
  'world2-ice-world-v7.js',
  'world2-ice-world-v8.js',
  'world2-ice-world-v9.js',
  'startup-menu-guard-v1.js'
]) {
  if (active.includes(forbidden)) fail(`retired patch active: ${forbidden}`);
}

if (!/game\.js\?v=2\.4\.7/.test(index)) fail('index.html is not pinned to approved game.js v2.4.7');
if (!/ui-runtime-boot-v1\.js\?v=5/.test(index)) fail('post-runtime UI boot loader is not active');

if (!/<div class="game-wrapper"><div id="app" class="game-container"/.test(index)) fail('stable game wrapper/container contract is missing');
if (!/id="startScreen" class="overlay-screen active"/.test(index)) fail('startScreen must remain an active overlay screen');
if (!/ui-world-select-v1\.css\?v=7/.test(index)) fail('index.html is not pinned to Safari-safe world select CSS v7');
if (!/ui-hud-v1\.css\?v=5/.test(index)) fail('index.html is not pinned to current HUD CSS release');
if (!/ui-splash-approved-v3\.js\?v=12/.test(index)) fail('approved loading splash script is not active');
if (!/js\/config\.js\?v=2\.3\.4/.test(index)) fail('core config dependency is missing or misordered');
if (!/js\/audio\.js\?v=2\.3\.2/.test(index)) fail('core audio dependency is missing or misordered');
if (!/js\/graphics\.js\?v=2\.3\.2/.test(index)) fail('core graphics dependency is missing or misordered');
for (const w of ['world1','world2','world3']) if (!new RegExp(`js/${w}\\.js\\?v=2\\.3\\.2`).test(index)) fail(`core ${w} dependency is missing`);

const depOrder = ['js/config.js?v=2.3.4','js/audio.js?v=2.3.2','js/graphics.js?v=2.3.2','js/world1.js?v=2.3.2','js/world2.js?v=2.3.2','js/world3.js?v=2.3.2','ui-splash-approved-v3.js?v=12','game.js?v=2.4.7','ui-runtime-boot-v1.js?v=5'];
for (let i = 1; i < depOrder.length; i++) {
  if (index.indexOf(depOrder[i - 1]) < 0 || index.indexOf(depOrder[i]) < 0 || index.indexOf(depOrder[i - 1]) > index.indexOf(depOrder[i])) fail(`core dependency order invalid around ${depOrder[i - 1]} -> ${depOrder[i]}`);
}

for (const requiredId of [
  'startScreen','previewBirdCanvas','startStoryBtn','settingsBtn','closeSettingsBtn','closeShopBtn','closeLeaderboardBtn','restartBtn','reviveBtn','shopBtnGameOver',
  'sfxToggleBtn','gfxToggleBtn','langToggleBtn','shopTotalCoins','skinsGrid','endGameTitle','finalScore','highScore','earnedCoins','mainMenuBtn',
  'gameHud','settingsScreen','shopScreen','leaderboardScreen','resetDataBtn','startEndlessBtnGameOver','currentScoreDisplay','sessionCoinDisplay','stageDisplay','feverBarFill'
]) {
  const dq = `id="${requiredId}"`;
  const sq = `id='${requiredId}'`;
  if (!index.includes(dq) && !index.includes(sq)) fail(`required core DOM hook missing from index: ${requiredId}`);
}

for (const legacyDirect of ['lab-ui.js','ui-settings-leaderboard-v1.js','ui-store-v1.js','ui-main-menu-v3.js','ui-world-select-v1.js','ui-end-screens-v1.js','ui-hud-v1.js','ui-foundation-v1.js']) {
  if (new RegExp(`<script[^>]+src=["']${legacyDirect.replace('.', '\\.')}[^"']*`, 'i').test(index)) fail(`UI patch must boot after runtime, not directly from index: ${legacyDirect}`);
}

const uiBoot = read('ui-runtime-boot-v1.js');
if (/core-gameplay-ux-v1\.js/.test(uiBoot)) fail('ui-runtime-boot-v1.js must not reload core-gameplay-ux; runtime owns it');
for (const token of ['__FF_RUNTIME_APPROVED_STACK__','__FF_MENU_UI_READY__','ui-world-select-v1.js?v=8','ui-main-menu-v3.js?v=5','ui-hud-v1.js?v=5']) {
  if (!uiBoot.includes(token)) fail(`ui-runtime-boot-v1.js is missing menu boot contract: ${token}`);
}

const pauseCss = read('ui-end-screens-v1.css');
if (/html body #ffPauseOverlay\.ff-pause-v1\s*\{[^}]*display\s*:\s*flex\s*!important/i.test(pauseCss)) fail('pause overlay must not be visible by default');
if (!/html body #ffPauseOverlay\.show\s*\{[^}]*display\s*:\s*flex\s*!important/i.test(pauseCss)) fail('pause overlay must only display through .show');

const hud = read('ui-hud-v1.css');
if (!/#ffPauseBtn\.ff-hud-pause-v1/.test(hud)) fail('current HUD must own pause button layout');
if (!/\.hud-top\s*\{[^}]*grid-template-columns:76px minmax\(96px,118px\) 42px/i.test(hud)) fail('HUD top row must be the approved 76px / flexible score / 42px pause layout');
if (!/fever-bar-container[^}]*display\s*:\s*none\s*!important/i.test(hud)) fail('retired fever bar must stay hidden');
if (!/#ffBossHud[^}]*display\s*:\s*none\s*!important/i.test(hud)) fail('duplicate boss HUD must stay hidden');

const uiHudJs = read('ui-hud-v1.js');
if (!/top\.appendChild\(pause\)/.test(uiHudJs)) fail('HUD JS must place pause control inside the top HUD row');

const runtimeBridge = read('runtime-config-bridge-v1.js');
if (!/window\.CONFIG\s*=\s*CONFIG/.test(runtimeBridge)) fail('runtime CONFIG bridge must expose legacy CONFIG contract');

if (!runtimeDoc.includes('runtime-config-bridge-v1.js')) fail('RUNTIME_ACTIVE.md must document runtime-config-bridge-v1.js');
if (!runtimeDoc.includes('world1-ground-gap-polish-v1.js') || !/RETIRED/i.test(runtimeDoc)) fail('RUNTIME_ACTIVE.md must document retired ground-gap renderer');

const liveVerify = read('.github/workflows/live-runtime-verify.yml');
if (!/playwright install --with-deps chromium webkit/.test(liveVerify)) fail('live verify must install Chromium and WebKit');
if (!/FF_BROWSER=chromium/.test(liveVerify) || !/FF_BROWSER=webkit/.test(liveVerify)) fail('live verify must execute both Chromium and WebKit mobile smoke tests');
const liveSmoke = read('scripts/live-smoke.mjs');
if (!/visualViewport/.test(liveSmoke) || !/logoVisible/.test(liveSmoke) || !/worldCardVisible/.test(liveSmoke)) fail('live smoke must enforce visible menu geometry in the visual viewport');

if (process.exitCode) process.exit(process.exitCode);
console.log('RUNTIME-INTEGRITY: PASS');
