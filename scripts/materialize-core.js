'use strict';
const fs = require('fs');
const vm = require('vm');
const cp = require('child_process');

const BASE_COMMIT = '5b83840d68ad65939b8efae336afd76c47b7bdc1';
const CORE_FILE = 'game-core-stable-v1.js';
const CORE_VERSION = 'game-core-stable-v1.js?v=1';
const LOADER_VERSION = '2.4.9';

const base = cp.execFileSync('git', ['show', `${BASE_COMMIT}:game.js`], {
  encoding: 'utf8',
  maxBuffer: 5 * 1024 * 1024
});
const wrapper = fs.readFileSync('stable-runtime-w3-clean-v1.js', 'utf8');
let captured = '';
class XHR {
  open() {}
  send() { this.status = 200; this.responseText = base; }
}
const sandbox = { console, XMLHttpRequest: XHR, window: {}, globalThis: null };
sandbox.globalThis = sandbox;
sandbox.eval = source => { captured = source; };
vm.createContext(sandbox);
vm.runInContext(wrapper, sandbox, { filename: 'stable-runtime-w3-clean-v1.js' });
if (!captured) throw new Error('Failed to capture transformed core runtime');
captured = captured.replace(/\n\/\/# sourceURL=ff-stable-runtime-w3-clean-v1\.js\s*$/, '\n');
fs.writeFileSync(CORE_FILE, captured);

let loader = fs.readFileSync('game.js', 'utf8');
loader = loader.replace(/const CORE_RUNTIME = ['"][^'"]+['"];/, `const CORE_RUNTIME = '${CORE_VERSION}';`);
if (!loader.includes("'stable-runtime-w3-clean-v1.js'")) {
  loader = loader.replace(
    "    'world1-ground-gap-polish-v1.js'\n  ];",
    "    'world1-ground-gap-polish-v1.js',\n    'stable-runtime-w3-clean-v1.js'\n  ];"
  );
}
fs.writeFileSync('game.js', loader);

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/game\.js\?v=2\.4\.\d+/g, `game.js?v=${LOADER_VERSION}`);
if (!index.includes(`game.js?v=${LOADER_VERSION}`)) {
  throw new Error(`Failed to pin index.html to game.js?v=${LOADER_VERSION}`);
}
fs.writeFileSync('index.html', index);

let runtimeDoc = fs.readFileSync('RUNTIME_ACTIVE.md', 'utf8');
runtimeDoc = runtimeDoc.replace(
  /- Core runtime: `stable-runtime-w3-clean-v1\.js`[^\n]*/,
  `- Core runtime: \`${CORE_FILE}\` — **materialized local core**. It contains the finalized historical core plus the approved World 3 cleanup transforms and requires no CDN at startup.`
);
if (!runtimeDoc.includes('stable-runtime-w3-clean-v1.js` — **retired')) {
  runtimeDoc += '\n- `stable-runtime-w3-clean-v1.js` — **retired transformer** kept only for reproducible regeneration of the local core; it is not loaded at runtime.\n';
}
fs.writeFileSync('RUNTIME_ACTIVE.md', runtimeDoc);

let spec = fs.readFileSync('FEATHER_FURY_GAME_SPEC.md', 'utf8');
spec = spec.replace(/8\. `game\.js\?v=2\.4\.\d+`/, `8. \`game.js?v=${LOADER_VERSION}\``);
spec = spec.replace(
  /1\. loads `stable-runtime-w3-clean-v1\.js\?v=4`;/,
  `1. loads \`${CORE_VERSION}\` from the local application bundle;`
);
spec = spec.replace(
  /### Historical core restoration[\s\S]*?---\n\n## 3\. Approved runtime map/,
  `### Local materialized core\n\n\`${CORE_FILE}\` is the approved game core. It is generated reproducibly from historical commit:\n\n\`${BASE_COMMIT}\`\n\nusing the transforms preserved in \`stable-runtime-w3-clean-v1.js\`. The transformer is retained only as build history and is **not loaded by the game**. Runtime startup is therefore self-contained and does not depend on jsDelivr or any remote CDN.\n\nRules:\n\n- never reintroduce a remote core fetch into startup;\n- regenerate the materialized core only through the documented materialization workflow;\n- any regenerated core must pass runtime integrity plus Chromium and WebKit live smoke before promotion.\n\n---\n\n## 3. Approved runtime map`
);
fs.writeFileSync('FEATHER_FURY_GAME_SPEC.md', spec);

cp.execFileSync('node', ['--check', CORE_FILE], { stdio: 'inherit' });
cp.execFileSync('node', ['--check', 'game.js'], { stdio: 'inherit' });
console.log(`Materialized ${captured.length} bytes into ${CORE_FILE}`);
