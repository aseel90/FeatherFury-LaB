const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const fail = msg => { console.error(`RUNTIME-INTEGRITY: ${msg}`); process.exitCode = 1; };

const game = read('game.js');
const index = read('index.html');
const runtimeDoc = read('RUNTIME_ACTIVE.md');

for (const retired of [
  'boss-crowking-v1.js',
  'world1-classic-enhanced-background-v1.js',
  'ruins-pillars-v3.js',
  'w2-v7-compat-v1.js',
  'w2-boss-combat-v5.js',
  'w2-boss-combat-v6.js',
  'w2-boss-tuning-v8.js',
  'w2-boss-phase2-relief-v9.js',
  'w3-critical-fix-v5.js',
  'world1-ground-gap-polish-v1.js'
]) {
  const activePart = game.split('const RETIRED_PATCHES')[0];
  if (activePart.includes(`'${retired}`)) fail(`retired patch still active: ${retired}`);
}

for (const active of [
  'boss-fight-core-v1.js',
  'w1-final-gameplay-v1.js',
  'w1-final-story-v1.js',
  'runtime-config-bridge-v1.js',
  'core-gameplay-ux-v1.js',
  'character-roster-v1.js',
  'w2-boss-runtime-v10.js',
  'w3-runtime-cleanup-v1.js',
  'crow-king-ingame-v4.js',
  'world1-cursed-woods-background-v3.js',
  'world1-final-art-lock-v1.js',
  'world1-ground-obstacle-polish-v2.js',
  'world1-owl-dialogue-layer-fix-v3.js'
]) {
  if (!game.includes(`'${active}`)) fail(`approved patch is not active: ${active}`);
  if (!fs.existsSync(path.join(root, active))) fail(`approved patch is missing from repository: ${active}`);
}

for (const forbidden of [
  'fetch(',
  'cdn.jsdelivr.net/gh/aseel90/FeatherFury-LaB@c813',
  'startup-menu-guard-v1.js'
]) {
  if (index.includes(forbidden)) fail(`index.html contains retired bootstrap dependency: ${forbidden}`);
}

if (!/game\.js\?v=2\.4\.7/.test(index)) fail('index.html is not pinned to approved game.js v2.4.7');
if (!/ui-runtime-boot-v1\.js\?v=4/.test(index)) fail('post-runtime UI boot loader is not active');
if (!/ui-hud-v1\.css\?v=5/.test(index)) fail('index.html is not pinned to current HUD CSS release');
if (!/ui-splash-approved-v3\.js\?v=12/.test(index)) fail('approved loading splash script is not active');
if (!/js\/config\.js\?v=2\.3\.4/.test(index)) fail('core config dependency is missing or misordered');
if (!/js\/audio\.js\?v=2\.3\.2/.test(index)) fail('core audio dependency is missing or misordered');
for (const dep of ['js/graphics.js?v=2.3.2','js/world1.js?v=2.3.2','js/world2.js?v=2.3.2','js/world3.js?v=2.3.2']) {
  if (!index.includes(dep)) fail(`core dependency missing from index: ${dep}`);
}
const depOrder = ['js/config.js?v=2.3.4','js/audio.js?v=2.3.2','js/graphics.js?v=2.3.2','js/world1.js?v=2.3.2','js/world2.js?v=2.3.2','js/world3.js?v=2.3.2','ui-splash-approved-v3.js?v=12','game.js?v=2.4.7','ui-runtime-boot-v1.js?v=4'];
for (let i = 1; i < depOrder.length; i++) {
  if (index.indexOf(depOrder[i - 1]) < 0 || index.indexOf(depOrder[i]) < 0 || index.indexOf(depOrder[i - 1]) > index.indexOf(depOrder[i])) fail(`core dependency order invalid around ${depOrder[i - 1]} -> ${depOrder[i]}`);
}

for (const requiredId of [
  'htmlTag','startScreen','startStoryBtn','startTotalCoins','leaderboardBtn','shopBtnStart','worldCard','previewBirdCanvas','activeSkinName',
  'sfxToggleBtn','gfxToggleBtn','langToggleBtn','shopTotalCoins','skinsGrid','endGameTitle','finalScore','highScore','earnedCoins','mainMenuBtn',
  'gameHud','settingsScreen','shopScreen','leaderboardScreen','resetDataBtn','startEndlessBtnGameOver','currentScoreDisplay','sessionCoinDisplay','stageDisplay','feverBarFill'
]) {
  const dq = `id=\"${requiredId}\"`;
  const sq = `id='${requiredId}'`;
  if (!index.includes(dq) && !index.includes(sq)) fail(`required core DOM hook missing from index: ${requiredId}`);
}

for (const legacyDirect of ['lab-ui.js','ui-settings-leaderboard-v1.js','ui-store-v1.js','ui-main-menu-v3.js','ui-world-select-v1.js','ui-end-screens-v1.js','ui-hud-v1.js','ui-foundation-v1.js']) {
  if (new RegExp(`<script[^>]+src=[\"']${legacyDirect.replace('.', '\\\\.')}[^\"']*`, 'i').test(index)) fail(`UI patch must boot after runtime, not directly from index: ${legacyDirect}`);
}

const uiBoot = read('ui-runtime-boot-v1.js');
if (/core-gameplay-ux-v1\.js/.test(uiBoot)) fail('ui-runtime-boot-v1.js must not reload core-gameplay-ux; runtime owns it');
for (const token of ['__FF_RUNTIME_APPROVED_STACK__','__FF_MENU_UI_READY__','ui-world-select-v1.js?v=8','ui-main-menu-v3.js?v=5','ui-hud-v1.js?v=5']) {
  if (!uiBoot.includes(token)) fail(`ui-runtime-boot-v1.js is missing menu boot contract: ${token}`);
}

const pauseCss = read('ui-end-screens-v1.css');
if (/html body #ffPauseOverlay\.ff-pause-v1\s*\{[^}]*display\s*:\s*flex\s*!important/i.test(pauseCss)) fail('pause overlay must not be visible by default');
if (!/#ffPauseOverlay\.ff-pause-v1\.show\s*\{[^}]*display\s*:\s*flex\s*!important/i.test(pauseCss)) fail('pause overlay must only display through .show');

const hud = read('ui-hud-v1.css');
if (!/#ffPauseBtn\.ff-hud-pause-v1/.test(hud)) fail('current HUD must own pause button layout');
if (!/\.hud-top\s*\{[^}]*grid-template-columns:auto minmax\(0,1fr\) auto/i.test(hud)) fail('HUD top row must be a stable three-column layout');
if (!/fever-bar-container[^}]*display\s*:\s*none\s*!important/i.test(hud)) fail('retired fever bar must stay hidden');
if (!/#ffBossHud[^}]*display\s*:\s*none\s*!important/i.test(hud)) fail('duplicate boss HUD must stay hidden');

const uiHudJs = read('ui-hud-v1.js');
if (!/top\.appendChild\(pause\)/.test(uiHudJs)) fail('HUD JS must place pause control inside the top HUD row');

const runtimeBridge = read('runtime-config-bridge-v1.js');
if (!/window\.CONFIG\s*=\s*CONFIG/.test(runtimeBridge)) fail('runtime CONFIG bridge must expose legacy CONFIG contract');

if (!runtimeDoc.includes('runtime-config-bridge-v1.js')) fail('RUNTIME_ACTIVE.md must document runtime-config-bridge-v1.js');
if (!runtimeDoc.includes('world1-ground-gap-polish-v1.js') || !/RETIRED/i.test(runtimeDoc)) fail('RUNTIME_ACTIVE.md must document retired ground-gap renderer');

if (process.exitCode) process.exit(process.exitCode);
console.log('RUNTIME-INTEGRITY: PASS');
