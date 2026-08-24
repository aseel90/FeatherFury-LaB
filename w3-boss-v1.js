(() => {
'use strict';
function install() {
const game = window.game;
if (!game?.__w3WorldPolishV1Installed) return false;
if (game.__w3BossV1Installed) return true;
const C = (typeof CONFIG !== 'undefined' && CONFIG) ? CONFIG : {};
const W3 = 2;
const MAX_HP = 7;
const SHIELD_HP = 2;
const PHASE2_HP = 2;
const W = () => Number(C.CANVAS_WIDTH || 360);
const H = () => Number(C.CANVAS_HEIGHT || 640);
const groundY = () => H() - Number(C.GROUND_HEIGHT || 95);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
C.W3_BOSS_HP = MAX_HP;
function laneYs() {
const gy = groundY();
return [
clamp(H() * .22, 82, gy - 190),
clamp(H() * .47, 150, gy - 115),
clamp(gy - 58, 230, gy - 42)
];
}
function nearestLane(y) {
const lanes = laneYs();
let best = 0;
for (let i = 1; i < lanes.length; i++) {
if (Math.abs(y - lanes[i]) < Math.abs(y - lanes[best])) best = i;
}
return best;
}
function safeLaneFor(g, serial = 0) {
const current = nearestLane(g.bird.y);
if (current === 0) return 1;
if (current === 2) return 1;
return serial % 2 === 0 ? 0 : 2;
}
function setFeverBarHidden(hidden) {
const el = document.querySelector('.fever-bar-container');
if (!el) return;
if (hidden) {
if (!el.dataset.w3BossPrevDisplay) el.dataset.w3BossPrevDisplay = el.style.display || '__EMPTY__';
el.style.display = 'none';
} else if (el.dataset.w3BossPrevDisplay) {
el.style.display = el.dataset.w3BossPrevDisplay === '__EMPTY__' ? '' : el.dataset.w3BossPrevDisplay;
delete el.dataset.w3BossPrevDisplay;
}
}
function fightActive(g) {
return g.activeWorld === W3 && g.boss?.active && g.boss.type === 'thunderbird' &&
!['GAMEOVER', 'BOSS_OUTRO', 'FLY_AWAY'].includes(g.state);
}
function resetFight(g) {
g.__w3BossFightV1 = {
active: true,
attackIndex: 0,
orbTimer: 52,
orbSerial: 0,
shieldBroken: false,
phase2Started: false,
defeatStarted: false,
warning: null
};
g.boss.hp = MAX_HP;
g.boss.shield = SHIELD_HP;
g.boss.enraged = false;
g.boss.__w3Phase2 = false;
g.boss.__w3ArcTargets = null;
g.boss.__w3SwarmTargets = null;
g.bossFeathers = [];
g.powerOrbs = [];
g.heroProjectiles = [];
g.electricBats = (g.electricBats || []).filter(b => !b.__w3BossSwarm);
g.gravityGates = [];
g.feverActive = false;
g.fever = 0;
g.feverTimer = 0;
const fill = document.getElementById('feverBarFill');
if (fill) {
fill.style.width = '0%';
fill.classList.remove('max');
}
setFeverBarHidden(true);
}
const previousActivateBoss = typeof game.activateBoss === 'function' ? game.activateBoss.bind(game) : null;
if (previousActivateBoss) {
game.activateBoss = function(...args) {
const result = previousActivateBoss(...args);
if (this.activeWorld === W3 && this.boss?.active && this.boss.type === 'thunderbird') {
resetFight(this);
}
return result;
};
}
function orbY(g, s) {
const lanes = laneYs();
const order = [0, 2, 1, 0, 1, 2, 1, 0, 2];
const lane = order[s.orbSerial % order.length];
const jitter = ((s.orbSerial * 29) % 17) - 8;
s.orbSerial++;
return clamp(lanes[lane] + jitter, 72, groundY() - 38);
}
function manageOrbs(g, s) {
if (g.state !== 'PLAYING' || g.boss.state === 'EXPLODING') return;
const live = (g.powerOrbs || []).filter(o => !o.collected && o.__w3BossOrb);
g.powerOrbs = (g.powerOrbs || []).filter(o => o.__w3BossOrb && !o.collected && o.x > -20);
if (live.length) return;
s.orbTimer--;
if (s.orbTimer > 0) return;
g.powerOrbs.push({
x: W() + 20,
y: orbY(g, s),
collected: false,
__w3BossOrb: true
});
s.orbTimer = g.boss.enraged ? 72 : 86;
}
function prepareArc(g, s) {
const safe = safeLaneFor(g, s.attackIndex);
const lanes = laneYs();
const blocked = [0, 1, 2].filter(i => i !== safe);
g.boss.__w3SafeLane = safe;
g.boss.__w3ArcTargets = blocked.map(i => lanes[i]);
s.warning = { type: 'arc', safe, blocked, started: g.frame };
g.sound?.playVoltCharge?.();
}
function fireArc(g) {
const boss = g.boss;
const targets = boss.__w3ArcTargets || [];
const speed = boss.enraged ? -4.75 : -4.25;
targets.forEach((targetY, i) => {
g.bossFeathers.push({
x: boss.x - 28,
y: boss.y + (i === 0 ? -8 : 8),
vx: speed,
targetY,
age: 0,
phase: i * Math.PI,
__w3Arc: true
});
});
g.sound?.playVoltBurst?.();
g.lightning = Math.max(g.lightning || 0, .72);
g.screenShake = Math.max(g.screenShake || 0, 7);
}
function prepareSwarm(g, s) {
const safe = safeLaneFor(g, s.attackIndex + 1);
const lanes = laneYs();
const blocked = [0, 1, 2].filter(i => i !== safe);
g.boss.__w3SafeLane = safe;
g.boss.__w3SwarmTargets = blocked.map(i => lanes[i]);
s.warning = { type: 'swarm', safe, blocked, started: g.frame };
g.sound?.playVoltSwarmWarn?.();
}
function fireSwarm(g) {
const boss = g.boss;
const targets = boss.__w3SwarmTargets || [];
targets.forEach((y, i) => {
g.electricBats.push({
x: boss.x - 8 + i * 12,
y,
vx: boss.enraged ? -3.75 : -3.25,
timer: i * 5,
__w3BossSwarm: true
});
});
g.sound?.playVoltSwarm?.();
}
function enterIdle(g, delay = -18) {
const boss = g.boss;
boss.state = 'IDLE';
boss.timer = delay;
boss.__w3ArcTargets = null;
boss.__w3SwarmTargets = null;
const s = g.__w3BossFightV1;
if (s) s.warning = null;
}
function updateBolts(g) {
const kept = [];
const birdR = Number(C.BIRD_RADIUS || 14);
for (const p of (g.bossFeathers || [])) {
if (!p.__w3Arc) continue;
p.age = Number(p.age || 0) + 1;
p.x += Number(p.vx || -4.25);
const pull = clamp((Number(p.targetY || p.y) - p.y) * .048, -3.1, 3.1);
p.y += pull + Math.sin(p.age * .22 + Number(p.phase || 0)) * .24;
if (g.gfxEnabled !== false && g.frame % 3 === 0) {
g.particles.push({ x:p.x+5, y:p.y, vx:1.2, vy:(Math.random()-.5)*1.4, size:1.8, color:'#7dd3fc', life:.34 });
}
if (p.x < -40 || p.y < 20 || p.y > H() - 20) continue;
if (g.state === 'PLAYING' && Math.hypot(g.bird.x - p.x, g.bird.y - p.y) < birdR + 7) {
if (g.invincibleTimer > 0 || g.boss.state === 'EXPLODING') continue;
g.gameOver(false);
continue;
}
kept.push(p);
}
g.bossFeathers = kept;
}
function startShieldBreak(g, s) {
s.shieldBroken = true;
s.warning = null;
g.boss.state = 'W3_SHIELD_BREAK';
g.boss.timer = 0;
g.bossFeathers = [];
g.electricBats = (g.electricBats || []).filter(b => !b.__w3BossSwarm);
g.lightning = 1;
g.screenShake = Math.max(g.screenShake || 0, 16);
g.sound?.playVoltShieldBreak?.();
for (let i = 0; i < 24; i++) g.particles.push({
x:g.boss.x+(Math.random()-.5)*70,
y:g.boss.y+(Math.random()-.5)*70,
vx:(Math.random()-.5)*8,
vy:(Math.random()-.5)*8,
size:1.5+Math.random()*3,
color:i%3===0?'#ffffff':'#38bdf8', life:.72
});
}
function startPhase2(g, s) {
s.phase2Started = true;
s.warning = null;
g.boss.enraged = true;
g.boss.__w3Phase2 = true;
g.boss.state = 'W3_RAGE';
g.boss.timer = 0;
g.bossFeathers = [];
g.electricBats = (g.electricBats || []).filter(b => !b.__w3BossSwarm);
g.lightning = 1;
g.screenShake = Math.max(g.screenShake || 0, 20);
g.sound?.playVoltRage?.();
}
function updateExplosion(g, s) {
const boss = g.boss;
if (!s.defeatStarted) {
s.defeatStarted = true;
s.warning = null;
boss.state = 'EXPLODING';
boss.timer = 0;
g.score += 500;
g.bossFeathers = [];
g.electricBats = (g.electricBats || []).filter(b => !b.__w3BossSwarm);
g.powerOrbs = [];
g.heroProjectiles = [];
g.lightning = 1;
g.screenShake = 28;
g.sound?.playVoltDefeat?.();
}
boss.y += 1.25;
if (g.gfxEnabled !== false && boss.timer % 3 === 0) {
for (let i = 0; i < 3; i++) g.particles.push({
x:boss.x+(Math.random()-.5)*95,
y:boss.y+(Math.random()-.5)*95,
vx:(Math.random()-.5)*11,
vy:(Math.random()-.5)*11,
size:2+Math.random()*5,
color:i===0?'#fde047':'#38bdf8', life:.75
});
}
if (boss.timer > 78) {
boss.active = false;
g.state = 'BOSS_OUTRO';
g.owl.x = W() + 100;
g.owl.y = H() / 2;
g.startDialogue([I18N[g.lang].w3_owlL1, I18N[g.lang].w3_owlL2]);
for (let i = 0; i < 36; i++) g.particles.push({
x:boss.x+(Math.random()-.5)*130,
y:boss.y+(Math.random()-.5)*130,
vx:(Math.random()-.5)*18,
vy:(Math.random()-.5)*18,
size:2+Math.random()*4,
color:i%2?'#60a5fa':'#c084fc', life:1
});
}
}
const previousBossUpdate = typeof game.updateThunderbirdBoss === 'function' ? game.updateThunderbirdBoss.bind(game) : null;
game.updateThunderbirdBoss = function() {
const boss = this.boss;
if (!boss || boss.type !== 'thunderbird') return previousBossUpdate?.();
const s = this.__w3BossFightV1 || (resetFight(this), this.__w3BossFightV1);
if (boss.hp <= 0 || boss.state === 'EXPLODING') {
updateExplosion(this, s);
return;
}
manageOrbs(this, s);
if (boss.shield <= 0 && !s.shieldBroken) {
startShieldBreak(this, s);
}
if (s.shieldBroken && boss.hp <= PHASE2_HP && !s.phase2Started && boss.state !== 'W3_SHIELD_BREAK') {
startPhase2(this, s);
}
const homeX = W() - 76;
const hoverTarget = clamp(H() * .38 + (this.bird.y - H() * .5) * .16, 105, groundY() - 105);
switch (boss.state) {
case 'IDLE': {
boss.x += (homeX - boss.x) * .10;
boss.y += (hoverTarget - boss.y) * .045 + Math.sin((this.frame + boss.timer) * .075) * .7;
boss.y = clamp(boss.y, 82, groundY() - 80);
const cooldown = boss.enraged ? 78 : 104;
if (boss.timer > cooldown) {
const sequence = ['W3_ARC_PREP', 'DASH_PREP', 'W3_SWARM_PREP'];
boss.state = sequence[s.attackIndex % sequence.length];
s.attackIndex++;
boss.timer = 0;
if (boss.state === 'W3_ARC_PREP') prepareArc(this, s);
else if (boss.state === 'W3_SWARM_PREP') prepareSwarm(this, s);
else {
boss.__w3DashY = clamp(this.bird.y, 82, groundY() - 62);
s.warning = { type:'dash', y:boss.__w3DashY, started:this.frame };
this.sound?.playVoltDashWarn?.();
}
}
break;
}
case 'W3_ARC_PREP': {
boss.x += (homeX - boss.x) * .12;
boss.y += (H() * .44 - boss.y) * .055;
const fireAt = boss.enraged ? 28 : 34;
if (boss.timer >= fireAt) {
fireArc(this);
boss.state = 'W3_ARC_RECOVER';
boss.timer = 0;
s.warning = null;
}
break;
}
case 'W3_ARC_RECOVER': {
boss.x += (homeX - boss.x) * .10;
if (boss.timer > (boss.enraged ? 28 : 36)) enterIdle(this, -16);
break;
}
case 'DASH_PREP': {
boss.x += ((W() - 45) - boss.x) * .12;
boss.y += (Number(boss.__w3DashY || this.bird.y) - boss.y) * .11;
const prep = boss.enraged ? 34 : 42;
if (boss.timer >= prep) {
boss.state = 'DASHING';
boss.timer = 0;
s.warning = null;
this.sound?.playVoltDash?.();
this.screenShake = Math.max(this.screenShake || 0, 9);
}
break;
}
case 'DASHING': {
boss.x -= boss.enraged ? 13.5 : 11.8;
if (this.gfxEnabled !== false && this.frame % 3 === 0) this.particles.push({
x:boss.x+28, y:boss.y+(Math.random()-.5)*24,
vx:2.5, vy:(Math.random()-.5)*2, size:2.2, color:'#38bdf8', life:.35
});
if (boss.x < -95) {
boss.state = 'RETURNING';
boss.x = W() + 96;
boss.timer = 0;
}
break;
}
case 'RETURNING': {
boss.x -= boss.enraged ? 6.2 : 5.4;
boss.y += (H() * .42 - boss.y) * .04;
if (boss.x <= homeX) {
boss.x = homeX;
enterIdle(this, -20);
}
break;
}
case 'W3_SWARM_PREP': {
boss.x += (homeX - boss.x) * .12;
const prep = boss.enraged ? 28 : 34;
if (boss.timer >= prep) {
fireSwarm(this);
boss.state = 'W3_SWARM_RECOVER';
boss.timer = 0;
s.warning = null;
}
break;
}
case 'W3_SWARM_RECOVER': {
boss.x += (homeX - boss.x) * .10;
if (boss.timer > (boss.enraged ? 30 : 38)) enterIdle(this, -18);
break;
}
case 'W3_SHIELD_BREAK': {
boss.x += (homeX - boss.x) * .11;
boss.y += (H() * .40 - boss.y) * .06;
if (boss.timer > 48) enterIdle(this, -22);
break;
}
case 'W3_RAGE': {
boss.x += (homeX - boss.x) * .11;
boss.y += (H() * .40 - boss.y) * .06;
if (boss.timer % 5 === 0) this.lightning = Math.max(this.lightning || 0, .35);
if (boss.timer > 54) enterIdle(this, -10);
break;
}
default:
enterIdle(this, -12);
break;
}
updateBolts(this);
if (this.state === 'PLAYING' && boss.state !== 'EXPLODING' && this.invincibleTimer <= 0) {
if (Math.hypot(this.bird.x - boss.x, this.bird.y - boss.y) < 43) this.gameOver(false);
}
};
const previousUpdate = typeof game.update === 'function' ? game.update.bind(game) : null;
if (previousUpdate) {
game.update = function() {
const activeBefore = fightActive(this);
if (activeBefore && !this.__w3BossFightV1) resetFight(this);
if (activeBefore) {
setFeverBarHidden(true);
this.feverActive = false;
this.fever = 0;
this.feverTimer = 0;
for (const p of (this.heroProjectiles || [])) {
if (!p?.active || this.boss.state === 'EXPLODING') continue;
const dy = this.boss.y - p.y;
p.y += clamp(dy * .22, -8.5, 8.5);
if (this.boss.x < this.bird.x + 55) p.x -= 19;
}
}
const result = previousUpdate();
const activeAfter = fightActive(this);
if (activeAfter) setFeverBarHidden(true);
else setFeverBarHidden(false);
return result;
};
}
const previousDraw = typeof game.draw === 'function' ? game.draw.bind(game) : null;
if (previousDraw) {
game.draw = function() {
const result = previousDraw();
if (!fightActive(this) || this.state !== 'PLAYING') return result;
const boss = this.boss;
const s = this.__w3BossFightV1;
const ctx = this.ctx;
if (!ctx || !s?.warning) return result;
ctx.save();
if (s.warning.type === 'arc' && boss.state === 'W3_ARC_PREP') {
const pulse = .12 + (Math.sin(this.frame * .45) + 1) * .05;
ctx.fillStyle = `rgba(56,189,248,${pulse})`;
ctx.strokeStyle = 'rgba(186,230,253,.72)';
ctx.lineWidth = 1.5;
for (const y of (boss.__w3ArcTargets || [])) {
ctx.fillRect(this.bird.x + 28, y - 25, Math.max(40, boss.x - this.bird.x - 48), 50);
ctx.beginPath(); ctx.moveTo(this.bird.x + 32, y); ctx.lineTo(boss.x - 24, y); ctx.stroke();
}
} else if (s.warning.type === 'swarm' && boss.state === 'W3_SWARM_PREP') {
ctx.strokeStyle = (this.frame % 8 < 4) ? '#c084fc' : '#7dd3fc';
ctx.lineWidth = 3;
for (const y of (boss.__w3SwarmTargets || [])) {
ctx.beginPath(); ctx.arc(W() - 28, y, 15 + Math.sin(this.frame*.2)*3, 0, Math.PI*2); ctx.stroke();
}
}
ctx.restore();
return result;
};
}
game.__w3BossV1Installed = true;
console.log('[FF-LAB] w3-boss-v1-installed');
return true;
}
let tries = 0;
const timer = setInterval(() => {
tries++;
if (install() || tries > 120) clearInterval(timer);
}, 80);
setTimeout(install, 1300);
})();
