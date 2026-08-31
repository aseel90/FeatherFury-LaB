const fs = require('fs');
const vm = require('vm');

let failed = false;
function fail(message) {
  failed = true;
  console.error(`TELEMETRY-INTEGRITY FAIL: ${message}`);
}
const read = file => fs.readFileSync(file, 'utf8');

const index = read('index.html');
const telemetry = read('telemetry-v1.js');
const pkg = JSON.parse(read('package.json'));
const googleServices = read('android-assets/google-services.json');
const contract = read('TELEMETRY_CONTRACT.md');

if (!index.includes('telemetry-v1.js?v=1')) fail('index.html must load telemetry-v1.js?v=1');
if (index.indexOf('telemetry-v1.js?v=1') < index.indexOf('ui-runtime-boot-v1.js?v=15')) fail('telemetry must load after UI runtime boot');
if (index.indexOf('telemetry-v1.js?v=1') < index.indexOf('android-native-v1.js?v=1')) fail('telemetry must load after Android native bridge');

if (pkg.dependencies?.['@capacitor-firebase/analytics'] !== '8.3.0') fail('Capacitor Firebase Analytics must remain pinned to 8.3.0');
if (pkg.dependencies?.firebase !== '12.6.0') fail('Firebase package must remain pinned to 12.6.0');
if (!googleServices.includes('"package_name": "com.aseel.featherfury"')) fail('Firebase package must match com.aseel.featherfury');

try { new vm.Script(telemetry, { filename: 'telemetry-v1.js' }); }
catch (error) { fail(`telemetry-v1.js syntax error: ${error.message}`); }

for (const token of [
  'FirebaseAnalytics','ff:telemetry','telemetry_ready','run_start','boss_start','death',
  'coins_earned','revive_used','hero_purchase','hero_unlock','hero_selected',
  'boss_complete','world_complete','run_end'
]) {
  if (!telemetry.includes(token)) fail(`missing required telemetry token: ${token}`);
}

for (const phrase of [
  'fail-open',
  'aggregated at death/victory checkpoints',
  'must not create or repurpose any `fh_*` save key',
  'does not assign a Firebase user ID'
]) {
  if (!contract.includes(phrase)) fail(`TELEMETRY_CONTRACT.md missing: ${phrase}`);
}

if (failed) process.exit(1);
console.log('TELEMETRY-INTEGRITY: PASS');
