const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
let failed = false;
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const exists = p => fs.existsSync(path.join(root, p));
function fail(msg) {
  failed = true;
  console.error(`RUNTIME-INTEGRITY FAIL: ${msg}`);
}

const game = read('game.js');
const index = read('index.html');
const runtimeDoc = read('RUNTIME_ACTIVE.md');
const canonicalSpec = read('FEATHER_FURY_GAME_SPEC.md');
const developmentRules = read('DEVELOPMENT_RULES.md');
const gamePlan = read('GAME_PLAN.md');
const readme = read('README.md');

const activeMatch = game.match(/const ACTIVE_PATCHES = \[([\s\S]*?)\n\s*\];/);
const retiredMatch = game.match(/const RETIRED_PATCHES = (?:new Set\()?\[([\s\S]*?)\n\s*\](?:\))?;/);
if (!activeMatch) fail('ACTIVE_PATCHES block not found');
if (!retiredMatch) fail('RETIRED_PATCHES block not found');

const extract = block => [...block.matchAll(/'([^']+\.js(?:\?[^']*)?)'/g)].map(m => m[1]);
const activeTokens = activeMatch ? extract(activeMatch[1]) : [];
const retiredTokens = retiredMatch ? extract(retiredMatch[1]) : [];
const active = activeTokens.map(x => x.split('?')[0]);
const retired = retiredTokens.map(x => x.split('?')[0]);

for (const token of activeTokens) {
  if (!canonicalSpec.includes('`' + token + '`')) fail(`canonical spec missing active runtime token: ${token}`);
}
for (const doc of [runtimeDoc, developmentRules, gamePlan, readme]) {
  if (!doc.includes('FEATHER_FURY_GAME_SPEC.md')) fail('project documentation must point to FEATHER_FURY_GAME_SPEC.md');
}

const dup = active.filter((x, i) => active.indexOf(x) !== i);
if (dup.length) fail(`duplicate active patches: ${[...new Set(dup)].join(', ')}`);

const overlap = active.filter(x => retired.includes(x));
if (overlap.length) fail(`active patches are also retired: ${overlap.join(', ')}`);

for (const file of active) if (!exists(file)) fail(`active patch missing: ${file}`);
for (const file of ['stable-runtime-w3-clean-v1.js','ui-runtime-boot-v1.js','ui-runtime-fixes-v1.js','lab-ui.js','ui-foundation-v1.js','ui-settings-leaderboard-v1.js','ui-store-v1.js','ui-main-menu-v3.js','ui-world-select-v1.js','ui-end-screens-v1.js','ui-hud-v1.js']) {
  if (!exists(file)) fail(`required runtime file missing: ${file}`);
}

for (const retiredBoot of ['startup-menu-guard-v1.js']) {
  if (/['"]startup-menu-guard-v1\.js/.test(game)) fail('startup-menu-guard-v1.js must not be in approved runtime');
}

if (/release-live\/lab-ui\.js/.test(index)) fail('index.html still depends on release-live lab-ui.js');
if (/release-live\/game\.js/.test(index)) fail('index.html still depends on release-live game.js');
if (!/game\.js\?v=2\.4\.7/.test(index)) fail('index.html is not pinned to approved game.js v2.4.7');
if (!/ui-runtime-boot-v1\.js\?v=7/.test(index)) fail('index.html is not pinned to current UI boot v7');
if (!/<html id="htmlTag"[^>]*lang="ar"[^>]*dir="rtl"/.test(index)) fail('index.html must preserve htmlTag for runtime language switching');
if (!/<div class="game-wrapper"><div id="app" class="game-container"/.test(index)) fail('index.html must preserve the stable app shell');
if (!/id="startScreen" class="overlay-screen active"/.test(index)) fail('startScreen must remain an active overlay screen');
if (!/ui-world-select-v1\.css\?v=7/.test(index)) fail('index.html is not pinned to Safari-safe world select CSS v7');
if (!/ui-hud-v1\.css\?v=6/.test(index)) fail('index.html is not pinned to current HUD CSS release');
if (!/ui-runtime-fixes-v1\.css\?v=3/.test(index)) fail('runtime UI fix stylesheet is not active');
if (!/ui-settings-leaderboard-v1\.css\?v=2/.test(index)) fail('settings/leaderboard stylesheet is not pinned to compact settings v2');
if (!/ui-splash-approved-v3\.js\?v=12/.test(index)) fail('approved loading splash script is not active');
if (!/js\/config\.js\?v=2\.3\.4/.test(index)) fail('core config dependency is missing or misordered');
if (!/js\/audio\.js\?v=2\.3\.2/.test(index)) fail('core audio dependency is missing or misordered');
if (!/js\/graphics\.js\?v=2\.3\.2/.test(index)) fail('core graphics dependency is missing or misordered');
for (const w of ['world1','world2','world3']) if (!new RegExp(`js/${w}\\.js\\?v=2\\.3\\.2`).test(index)) fail(`core ${w} dependency is missing`);

const depOrder = ['js/config.js?v=2.3.4','js/audio.js?v=2.3.2','js/graphics.js?v=2.3.2','js/world1.js?v=2.3.2','js/world2.js?v=2.3.2','js/world3.js?v=2.3.2','ui-splash-approved-v3.js?v=12','game.js?v=2.4.7','ui-runtime-boot-v1.js?v=7'];
let last = -1;
for (const token of depOrder) {
  const i = index.indexOf(token);
  if (i < 0) fail(`index dependency missing: ${token}`);
  if (i < last) fail(`index dependency order broken at: ${token}`);
  last = i;
}

for (const requiredId of [
  'htmlTag','startScreen','previewBirdCanvas','startStoryBtn','settingsBtn','closeSettingsBtn','closeShopBtn','closeLeaderboardBtn','restartBtn','reviveBtn','shopBtnGameOver',
  'startTotalCoins','shopTotalCoins','gameOverScore','gameOverCoins','gameHud','settingsScreen','shopScreen','leaderboardScreen','resetDataBtn','startEndlessBtnGameOver','currentScoreDisplay','sessionCoinDisplay','stageDisplay','feverBarFill'
]) {
  if (!new RegExp(`id=["']${requiredId}["']`).test(index)) fail(`index is missing required stable DOM hook: ${requiredId}`);
}

for (const legacyDirect of ['lab-ui.js','ui-settings-leaderboard-v1.js','ui-store-v1.js','ui-main-menu-v3.js','ui-world-select-v1.js','ui-end-screens-v1.js','ui-hud-v1.js','ui-foundation-v1.js']) {
  if (new RegExp(`<script[^>]+src=["']${legacyDirect.replace('.', '\\.')}[^"']*`, 'i').test(index)) fail(`UI patch must boot after runtime, not directly from index: ${legacyDirect}`);
}

const uiBoot = read('ui-runtime-boot-v1.js');
for (const token of ['__FF_RUNTIME_APPROVED_STACK__','__FF_MENU_UI_READY__','ui-world-select-v1.js?v=8','ui-main-menu-v3.js?v=5','ui-hud-v1.js?v=5','ui-runtime-fixes-v1.js?v=1']) {
  if (!uiBoot.includes(token)) fail(`ui-runtime-boot-v1.js is missing menu boot contract: ${token}`);
}
if (!/function laidOutInViewport\(el\)/.test(uiBoot) || /fullyVisible\(logo\)/.test(uiBoot)) fail('menu boot must validate splash-hidden geometry without requiring painted visibility');
const menuOrder = ['lab-ui.js?v=6','ui-foundation-v1.js?v=2','ui-settings-leaderboard-v1.js?v=2','ui-store-v1.js?v=1','ui-world-select-v1.js?v=8','ui-main-menu-v3.js?v=5','ui-end-screens-v1.js?v=2','ui-hud-v1.js?v=5','ui-runtime-fixes-v1.js?v=1'];
last = -1;
for (const token of menuOrder) {
  const i = uiBoot.indexOf(token);
  if (i < 0) fail(`post-runtime UI dependency missing: ${token}`);
  if (i < last) fail(`post-runtime UI order broken at: ${token}`);
  last = i;
}

const hud = read('ui-hud-v1.css');
if (!/#ffPauseBtn\.ff-hud-pause-v1/.test(hud)) fail('current HUD must own pause button layout');
if (!/\.hud-top\s*\{[^}]*grid-template-columns:76px minmax\(96px,118px\) 42px/i.test(hud)) fail('HUD top row must be the approved 76px / flexible score / 42px pause layout');
if (!/\.hud-top\s*\{[^}]*width:auto\s*!important/i.test(hud)) fail('HUD top row must use auto width so left/right viewport insets bound the row');
if (!/fever-bar-container[^}]*display\s*:\s*none\s*!important/i.test(hud)) fail('base HUD still owns the retired fever state before post-runtime override');
if (!/#ffBossHud[^}]*display\s*:\s*none\s*!important/i.test(hud)) fail('duplicate boss HUD must stay hidden');

const uiHudJs = read('ui-hud-v1.js');
if (!/top\.appendChild\(pause\)/.test(uiHudJs)) fail('HUD JS must place pause control inside the top HUD row');

const runtimeFixes = read('ui-runtime-fixes-v1.js');
if (!/installPauseGuard/.test(runtimeFixes) || !/syncHudData/.test(runtimeFixes)) fail('runtime fixes must freeze pause and bridge HUD data');

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

const stableCore = read('stable-runtime-w3-clean-v1.js');
if (!/5b83840d68ad65939b8efae336afd76c47b7bdc1/.test(stableCore)) fail('stable runtime is not pinned to approved historical core commit');
if (!/XMLHttpRequest\(\)/.test(stableCore) || !/\.open\('GET'.*false\)/.test(stableCore)) fail('stable runtime must synchronously load the approved core before patches');
if (!/extractClass\(source\)/.test(stableCore) || !/new Function\(classCode/.test(stableCore)) fail('stable runtime must isolate and instantiate the approved core class');
if (!/window\.__FF_STABLE_CORE_VERSION__/.test(stableCore)) fail('stable runtime marker is missing');

const w3Cleanup = read('w3-runtime-cleanup-v1.js');
if (!/wrappedUpdate\.__ffW3CleanupV3/.test(w3Cleanup)) fail('W3 cleanup V3 guard missing');
if (!/originalUpdate\.call\(this\)/.test(w3Cleanup)) fail('W3 cleanup no longer delegates to the previous update chain');
if (!/this\.state\s*=\s*['"]MENU['"]/.test(w3Cleanup) || !/this\.currentWorld\s*=\s*0/.test(w3Cleanup)) fail('W3 cleanup must explicitly restore MENU/W1 on completion');

const directSourceOwners = [
  ['world1-cursed-obstacle-asset-top-a.js','world1-cursed-obstacle-asset-top-a-source.js'],
  ['world1-cursed-obstacle-asset-bottom-a.js','world1-cursed-obstacle-asset-bottom-a-source.js']
];
for (const [runtimeFile, sourceFile] of directSourceOwners) {
  const text = read(runtimeFile);
  if (!text.includes(sourceFile)) fail(`${runtimeFile} no longer points to local source asset ${sourceFile}`);
}

const liveWorkflow = read('.github/workflows/live-runtime-verify.yml');
if (!/scripts\/live-smoke\.mjs/.test(liveWorkflow)) fail('live runtime workflow must execute scripts/live-smoke.mjs');
if (!/chromium/.test(liveWorkflow) || !/webkit/.test(liveWorkflow)) fail('live runtime verification must cover Chromium and WebKit');

if (failed) process.exit(1);
console.log(`RUNTIME-INTEGRITY PASS (${active.length} active patches, ${retired.length} retired patches)`);
