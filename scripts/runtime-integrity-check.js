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
const canonicalSpec = read('FEATHER_FURY_GAME_SPEC.md');

for (const doc of ['README.md','DEVELOPMENT_RULES.md','GAME_PLAN.md','RUNTIME_ACTIVE.md']) {
  if (!read(doc).includes('FEATHER_FURY_GAME_SPEC.md')) fail(`${doc} must point to FEATHER_FURY_GAME_SPEC.md as the canonical game/runtime spec`);
}
for (const token of ['ACTIVE_PATCHES','RETIRED_PATCHES','stable-runtime-w3-clean-v1.js','ui-runtime-boot-v1.js','scripts/live-smoke.mjs']) {
  if (!canonicalSpec.includes(token)) fail(`FEATHER_FURY_GAME_SPEC.md missing canonical runtime token: ${token}`);
}

const activeMatch = game.match(/const ACTIVE_PATCHES = \[([\s\S]*?)\n\s*\];/);
const retiredMatch = game.match(/const RETIRED_PATCHES = new Set\(\[([\s\S]*?)\n\s*\]\);/);
if (!activeMatch) fail('ACTIVE_PATCHES block not found');
if (!retiredMatch) fail('RETIRED_PATCHES block not found');

const extract = block => [...block.matchAll(/'([^']+\.js(?:\?[^']*)?)'/g)].map(m => m[1]);
const activeEntries = activeMatch ? extract(activeMatch[1]) : [];
const retiredEntries = retiredMatch ? extract(retiredMatch[1]) : [];
const active = activeEntries.map(x => x.split('?')[0]);
const retired = retiredEntries.map(x => x.split('?')[0]);

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
if (!/ui-runtime-boot-v1\.js\?v=8/.test(index)) fail('post-runtime UI boot loader is not active');

if (!/<div class="game-wrapper"><div id="app" class="game-container"/.test(index)) fail('stable game wrapper/container contract is missing');
if (!/id="startScreen" class="overlay-screen active"/.test(index)) fail('startScreen must remain an active overlay screen');
if (!/ui-world-select-v1\.css\?v=7/.test(index)) fail('index.html is not pinned to Safari-safe world select CSS v7');
if (!/ui-hud-v1\.css\?v=6/.test(index)) fail('index.html is not pinned to current HUD CSS release');
if (!/ui-runtime-fixes-v1\.css\?v=3/.test(index)) fail('runtime UI fix stylesheet is not active');
if (!/ui-settings-leaderboard-v1\.css\?v=2/.test(index)) fail('settings stylesheet is not pinned to compact settings v2');
if (!/ui-splash-approved-v3\.js\?v=12/.test(index)) fail('approved loading splash script is not active');
if (!/js\/config\.js\?v=2\.3\.4/.test(index)) fail('core config dependency is missing or misordered');
if (!/js\/audio\.js\?v=2\.3\.2/.test(index)) fail('core audio dependency is missing or misordered');
if (!/js\/graphics\.js\?v=2\.3\.2/.test(index)) fail('core graphics dependency is missing or misordered');
for (const w of ['world1','world2','world3']) if (!new RegExp(`js/${w}\\.js\\?v=2\\.3\\.2`).test(index)) fail(`core ${w} dependency is missing`);

const depOrder = ['js/config.js?v=2.3.4','js/audio.js?v=2.3.2','js/graphics.js?v=2.3.2','js/world1.js?v=2.3.2','js/world2.js?v=2.3.2','js/world3.js?v=2.3.2','ui-splash-approved-v3.js?v=12','game.js?v=2.4.7','ui-runtime-boot-v1.js?v=8'];
for (let i = 1; i < depOrder.length; i++) {
  if (index.indexOf(depOrder[i - 1]) < 0 || index.indexOf(depOrder[i]) < 0 || index.indexOf(depOrder[i - 1]) > index.indexOf(depOrder[i])) fail(`core dependency order invalid around ${depOrder[i - 1]} -> ${depOrder[i]}`);
}

for (const requiredId of [
  'htmlTag','startScreen','previewBirdCanvas','startStoryBtn','settingsBtn','shopBtnStart','closeSettingsBtn','closeShopBtn','closeLeaderboardBtn','restartBtn','reviveBtn','shopBtnGameOver','nextWorldActionBtn',
  'sfxToggleBtn','gfxToggleBtn','langToggleBtn','shopTotalCoins','skinsGrid','endGameTitle','finalScore','highScore','earnedCoins','mainMenuBtn',
  'gameHud','settingsScreen','shopScreen','leaderboardScreen','resetDataBtn','startEndlessBtnGameOver','currentScoreDisplay','sessionCoinDisplay','stageDisplay','feverBarFill'
]) {
  const dq = `id="${requiredId}"`;
  const sq = `id='${requiredId}'`;
  if (!index.includes(dq) && !index.includes(sq)) fail(`required core DOM hook missing from index: ${requiredId}`);
}

for (const legacyDirect of ['lab-ui.js','ui-settings-leaderboard-v1.js','ui-store-v1.js','ui-main-menu-v3.js','ui-world-select-v1.js','ui-end-screens-v1.js','ui-hud-v1.js','ui-foundation-v1.js']) {
  if (new RegExp(`<script[^>]+src=["']${legacyDirect.replace('.', '\\.') }[^"']*`, 'i').test(index)) fail(`UI patch must boot after runtime, not directly from index: ${legacyDirect}`);
}

const uiBoot = read('ui-runtime-boot-v1.js');
if (/core-gameplay-ux-v1\.js/.test(uiBoot)) fail('ui-runtime-boot-v1.js must not reload core-gameplay-ux; runtime owns it');
for (const token of ['__FF_RUNTIME_APPROVED_STACK__','__FF_MENU_UI_READY__','ui-world-select-v1.js?v=8','ui-main-menu-v3.js?v=5','ui-hud-v1.js?v=5','ui-runtime-fixes-v1.js?v=2']) {
  if (!uiBoot.includes(token)) fail(`ui-runtime-boot-v1.js is missing menu boot contract: ${token}`);
}
if (!/function laidOutInViewport\(el\)/.test(uiBoot) || /fullyVisible\(logo\)/.test(uiBoot)) fail('menu boot must validate splash-hidden geometry without requiring painted visibility');

const pauseCss = read('ui-end-screens-v1.css');
if (/html body #ffPauseOverlay\.ff-pause-v1\s*\{[^}]*display\s*:\s*flex\s*!important/i.test(pauseCss)) fail('pause overlay must not be visible by default');
if (!/html body #ffPauseOverlay\.show\s*\{[^}]*display\s*:\s*flex\s*!important/i.test(pauseCss)) fail('pause overlay must only display through .show');

const hud = read('ui-hud-v1.css');
if (!/#ffPauseBtn\.ff-hud-pause-v1/.test(hud)) fail('current HUD must own pause button layout');
if (!/\.hud-top\s*\{[^}]*width:auto\s*!important/i.test(hud)) fail('HUD top row must use auto width so left/right viewport insets bound the row');
const uiHudJs = read('ui-hud-v1.js');
if (!/top\.appendChild\(pause\)/.test(uiHudJs)) fail('HUD JS must place pause control inside the top row');

const runtimeFixes = read('ui-runtime-fixes-v1.js');
if (!/installPauseGuard/.test(runtimeFixes) || !/syncHudData/.test(runtimeFixes)) fail('runtime fixes must freeze pause and bridge HUD data');
if (!/installNavigationContract/.test(runtimeFixes) || !/__FF_UI_NAV__/.test(runtimeFixes) || !/game\.returnToMenu\s*=\s*goMain/.test(runtimeFixes)) fail('runtime fixes must own the canonical UI navigation contract');
if (!canonicalSpec.includes('## 19. UI Navigation Contract') || !canonicalSpec.includes('Pause -> Settings -> Back -> Pause') || !canonicalSpec.includes('Store -> Back -> END')) fail('canonical spec must include the UI navigation route map');
if (!/__ffFinalPauseGuardV1/.test(runtimeFixes)) fail('runtime fixes must install one final pause update guard');
const runtimeFixCss = read('ui-runtime-fixes-v1.css');
if (!/direction:ltr\s*!important/i.test(runtimeFixCss)) fail('runtime fixes must pin HUD physical direction');
if (!/fever-bar-container[\s\S]*display:flex\s*!important/i.test(runtimeFixCss)) fail('runtime fixes must restore fever bar');
if (!/start-actions-group[^{]*\{[^}]*margin-top/i.test(runtimeFixCss)) fail('runtime fixes must restore world/PLAY spacing');
if (!/ff-store-balance[\s\S]*display:flex\s*!important/i.test(runtimeFixCss)) fail('runtime fixes must normalize store coin balance');
if (!/score-container[\s\S]*border-color:rgba\(86,188,220/i.test(runtimeFixCss)) fail('compact HUD must keep the quiet cyan center score panel');
if (!/ffAbilityHud[\s\S]*top:calc\(max\(env\(safe-area-inset-top\),0px\) \+ 86px\)/i.test(runtimeFixCss)) fail('compact HUD must place ability below Fever in the center stack');
if (!/fever-bar-container[\s\S]*top:calc\(max\(env\(safe-area-inset-top\),0px\) \+ 61px\)/i.test(runtimeFixCss)) fail('compact HUD must place the thin Fever bar above the ability chip');
if (!/fever-bar-container[\s\S]*height:19px\s*!important/i.test(runtimeFixCss)) fail('compact HUD Fever bar must remain thin');
const settingsCss = read('ui-settings-leaderboard-v1.css');
if (!/#settingsScreen \.settings-dialog[\s\S]*width:min\(90vw,390px\)/i.test(settingsCss)) fail('settings must use the compact centered dialog');
if (!/#settingsScreen #closeSettingsBtn[\s\S]*width:40px\s*!important[\s\S]*height:40px\s*!important/i.test(settingsCss)) fail('settings close control must remain a compact icon button');

const runtimeBridge = read('runtime-config-bridge-v1.js');
if (!/window\.CONFIG\s*=\s*CONFIG/.test(runtimeBridge)) fail('runtime CONFIG bridge must expose legacy CONFIG contract');

if (!runtimeDoc.includes('runtime-config-bridge-v1.js')) fail('RUNTIME_ACTIVE.md must document runtime-config-bridge-v1.js');
if (!runtimeDoc.includes('world1-ground-gap-polish-v1.js') || !/RETIRED/i.test(runtimeDoc)) fail('RUNTIME_ACTIVE.md must document retired ground-gap renderer');

const liveVerify = read('.github/workflows/live-runtime-verify.yml');
if (!/playwright install --with-deps chromium webkit/.test(liveVerify)) fail('live verify must install Chromium and WebKit');
if (!/FF_BROWSER=chromium/.test(liveVerify) || !/FF_BROWSER=webkit/.test(liveVerify)) fail('live verify must execute both Chromium and WebKit mobile smoke tests');
const liveSmoke = read('scripts/live-smoke.mjs');
if (!liveSmoke.includes('Pause -> Settings contract failed') || !liveSmoke.includes('End -> Store -> Back') || !liveSmoke.includes('Next World map failed')) fail('live smoke must enforce the canonical navigation map');
if (!/visualViewport/.test(liveSmoke) || !/logoVisible/.test(liveSmoke) || !/worldCardVisible/.test(liveSmoke)) fail('live smoke must enforce visible menu geometry in the visual viewport');

if (process.exitCode) process.exit(process.exitCode);
console.log('RUNTIME-INTEGRITY: PASS');
