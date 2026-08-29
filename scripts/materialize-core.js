'use strict';
const fs = require('fs');
const vm = require('vm');
const cp = require('child_process');

const BASE_COMMIT = '5b83840d68ad65939b8efae336afd76c47b7bdc1';
const base = cp.execFileSync('git', ['show', `${BASE_COMMIT}:game.js`], { encoding:'utf8', maxBuffer: 5 * 1024 * 1024 });
const wrapper = fs.readFileSync('stable-runtime-w3-clean-v1.js', 'utf8');
let captured = '';
class XHR {
  open() {}
  send() { this.status = 200; this.responseText = base; }
}
const sandbox = { console, XMLHttpRequest:XHR, window:{}, globalThis:null };
sandbox.globalThis = sandbox;
sandbox.eval = source => { captured = source; };
vm.createContext(sandbox);
vm.runInContext(wrapper, sandbox, { filename:'stable-runtime-w3-clean-v1.js' });
if (!captured) throw new Error('Failed to capture transformed core runtime');
captured = captured.replace(/\n\/\/# sourceURL=ff-stable-runtime-w3-clean-v1\.js\s*$/, '\n');
fs.writeFileSync('game-core-stable-v1.js', captured);

let loader = fs.readFileSync('game.js','utf8');
loader = loader.replace("const CORE_RUNTIME = 'stable-runtime-w3-clean-v1.js?v=4';", "const CORE_RUNTIME = 'game-core-stable-v1.js?v=1';");
loader = loader.replace("    'w3-critical-fix-v5.js'\n", "    'w3-critical-fix-v5.js',\n    'stable-runtime-w3-clean-v1.js'\n");
fs.writeFileSync('game.js', loader);

let index = fs.readFileSync('index.html','utf8');
index = index.replace('game.js?v=2.4.1', 'game.js?v=2.4.2');
fs.writeFileSync('index.html', index);

let check = fs.readFileSync('scripts/runtime-integrity-check.js','utf8');
check = check.replace(/game\\\.js\\\?v=2\\\.4\\\.1/g, 'game\\.js\\?v=2\\.4\\.2');
check = check.replace(/approved game\.js v2\.4\.1/g, 'approved game.js v2.4.2');
if (!check.includes("game-core-stable-v1.js?v=1")) {
  check = check.replace("const retired = extractArray('RETIRED_PATCHES').map(x => x.split('?')[0]);", "const retired = extractArray('RETIRED_PATCHES').map(x => x.split('?')[0]);\nconst coreMatch = game.match(/const\\s+CORE_RUNTIME\\s*=\\s*['\"]([^'\"]+)['\"]/);\nif (!coreMatch || coreMatch[1] !== 'game-core-stable-v1.js?v=1') fail('game.js is not using the materialized local core');\nif (!exists('game-core-stable-v1.js')) fail('materialized local core is missing');");
}
fs.writeFileSync('scripts/runtime-integrity-check.js', check);

let doc = fs.readFileSync('RUNTIME_ACTIVE.md','utf8');
doc = doc.replace('Core runtime: `stable-runtime-w3-clean-v1.js`', 'Core runtime: `game-core-stable-v1.js` (materialized local core)');
doc = doc.replace('- `w3-critical-fix-v5.js` — superseded by V6 and the cleaned World 3 runtime', '- `w3-critical-fix-v5.js` — superseded by V6 and the cleaned World 3 runtime\n- `stable-runtime-w3-clean-v1.js` — retired runtime transformer; its finalized output is materialized in `game-core-stable-v1.js`');
fs.writeFileSync('RUNTIME_ACTIVE.md', doc);

cp.execFileSync('node',['--check','game-core-stable-v1.js'],{stdio:'inherit'});
cp.execFileSync('node',['--check','game.js'],{stdio:'inherit'});
cp.execFileSync('node',['--check','scripts/runtime-integrity-check.js'],{stdio:'inherit'});
console.log(`Materialized ${captured.length} bytes into game-core-stable-v1.js`);
