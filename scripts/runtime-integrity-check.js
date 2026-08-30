const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const fail = msg => { console.error(`RUNTIME-INTEGRITY FAIL: ${msg}`); process.exit(1); };

const game = read('game.js');
const index = read('index.html');
const liveSmoke = read('scripts/live-smoke.mjs');

for (const token of ['ACTIVE_PATCHES','RETIRED_PATCHES','stable-runtime-w3-clean-v1.js','ui-runtime-boot-v1.js','scripts/live-smoke.mjs']) {
  if (!game.includes(token) && !index.includes(token) && !liveSmoke.includes(token)) fail(`missing runtime contract token: ${token}`);
}

if (!/game-core-stable-v1\.js\?v=1/.test(game)) fail('approved loader does not point to local materialized core');
if (/https?:\/\//.test(read('game-core-stable-v1.js'))) fail('materialized core contains an external URL');
if (/cdn\.jsdelivr\.net/.test(read('game-core-stable-v1.js'))) fail('materialized core still depends on jsDelivr');
if (!/game\.js\?v=2\.4\.9/.test(index)) fail('index.html is not pinned to approved game.js v2.4.9');
if (!/ui-runtime-boot-v1\.js\?v=14/.test(index)) fail('post-runtime UI boot loader is not pinned to v14');
if (!/ui-store-v1\.css\?v=3/.test(index)) fail('index.html is not pinned to responsive store CSS v3');

const depOrder = ['js/config.js?v=2.3.4','js/audio.js?v=2.3.2','js/graphics.js?v=2.3.2','js/world1.js?v=2.3.2','js/world2.js?v=2.3.2','js/world3.js?v=2.3.2','ui-splash-approved-v3.js?v=12','game.js?v=2.4.9','ui-runtime-boot-v1.js?v=14'];
let cursor = -1;
for (const token of depOrder) {
  const next = index.indexOf(token);
  if (next < 0) fail(`index.html is missing required dependency: ${token}`);
  if (next <= cursor) fail(`index.html dependency order is invalid at: ${token}`);
  cursor = next;
}

for (const legacyDirect of ['lab-ui.js','ui-settings-leaderboard-v1.js','ui-store-v1.js','ui-main-menu-v3.js','ui-world-select-v1.js','ui-end-screens-v1.js','ui-hud-v1.js','ui-foundation-v1.js']) {
  const escaped = legacyDirect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (new RegExp(`<script[^>]+src=["'][^"']*${escaped}`).test(index)) fail(`index.html must not directly load post-runtime UI module: ${legacyDirect}`);
}

const uiBoot = read('ui-runtime-boot-v1.js');
if (/core-gameplay-ux-v1\.js/.test(uiBoot)) fail('ui-runtime-boot-v1.js must not reload core-gameplay-ux; runtime owns it');
for (const token of ['__FF_RUNTIME_APPROVED_STACK__','__FF_MENU_UI_READY__','ui-world-select-v1.js?v=10','ui-main-menu-v3.js?v=6','ui-store-v1.js?v=3','ui-hud-v1.js?v=5','ui-runtime-fixes-v1.js?v=2']) {
  if (!uiBoot.includes(token)) fail(`ui-runtime-boot-v1.js is missing menu boot contract: ${token}`);
}
if (!uiBoot.includes('lab-ui.js?v=7')) fail('ui-runtime-boot-v1.js must load the gated lab helper v7');

for (const selector of ['#shopBtnGameOver', '#closeShopBtn']) {
  if (!liveSmoke.includes(selector)) fail(`live smoke must exercise canonical navigation selector: ${selector}`);
}

const requiredRuntimeTokens = [
  'world1-cursed-obstacle-asset-top-a.js',
  'world1-cursed-obstacle-asset-bottom-a.js',
  'world1-cursed-obstacles-v5.js',
  'world1-final-art-lock-v1.js',
  'world1-ground-obstacle-polish-v2.js',
  'world1-owl-dialogue-layer-fix-v3.js',
  'w2-boss-runtime-v10.js',
  'w2-emperor-art-v1.js',
  'w3-boss-v1.js',
  'w3-runtime-cleanup-v1.js'
];
for (const token of requiredRuntimeTokens) {
  if (!game.includes(token)) fail(`approved loader is missing required runtime module: ${token}`);
}

if (!liveSmoke.includes('__FF_RUNTIME_APPROVED_STACK__')) fail('live smoke must wait for approved runtime readiness');
if (!liveSmoke.includes('__FF_MENU_UI_READY__')) fail('live smoke must wait for complete menu UI readiness');
if (!liveSmoke.includes('worldStars')) fail('live smoke must validate fresh-profile world star state');
if (!liveSmoke.includes('pauseButtonVisible')) fail('live smoke must validate the PLAY pause control');

console.log('RUNTIME-INTEGRITY PASS');
