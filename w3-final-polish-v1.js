(() => {
'use strict';
function install() {
const game = window.game;
const sound = game?.sound;
if (!game?.__w3BossV1Installed || !sound) return false;
if (game.__w3FinalPolishV1Installed) return true;
const C = (typeof CONFIG !== 'undefined' && CONFIG) ? CONFIG : {};
const W3 = 2;
const ensureAudio = () => {
try {
sound.init?.();
if (sound.ctx?.state === 'suspended') sound.ctx.resume?.();
} catch (_) {}
return !!(sound.ctx && !sound.muted && sound.sfxEnabled !== false);
};
function cachedNoise(key, seconds = 2, brown = false) {
if (!sound.ctx) return null;
sound.__w3Buffers = sound.__w3Buffers || {};
if (sound.__w3Buffers[key]) return sound.__w3Buffers[key];
const len = Math.max(1, Math.floor(sound.ctx.sampleRate * seconds));
const buffer = sound.ctx.createBuffer(1, len, sound.ctx.sampleRate);
const data = buffer.getChannelData(0);
let last = 0;
for (let i = 0; i < len; i++) {
const white = Math.random() * 2 - 1;
if (brown) {
last = (last + .025 * white) / 1.025;
data[i] = last * 3.2;
} else {
last = last * .34 + white * .66;
data[i] = last;
}
}
sound.__w3Buffers[key] = buffer;
return buffer;
}
function tone(type, startHz, endHz, duration, volume, delay = 0) {
if (!ensureAudio()) return;
try {
const ctx = sound.ctx;
const now = ctx.currentTime + delay;
const osc = ctx.createOscillator();
const gain = ctx.createGain();
osc.type = type;
osc.frequency.setValueAtTime(Math.max(20, startHz), now);
osc.frequency.exponentialRampToValueAtTime(Math.max(20, endHz), now + duration);
gain.gain.setValueAtTime(Math.max(.001, volume), now);
gain.gain.exponentialRampToValueAtTime(.001, now + duration);
osc.connect(gain); gain.connect(ctx.destination);
osc.start(now); osc.stop(now + duration + .02);
} catch (_) {}
}
function noiseBurst(duration, volume, type, startHz, endHz, delay = 0) {
if (!ensureAudio()) return;
try {
const ctx = sound.ctx;
const buffer = cachedNoise('sfx-noise', 1.1, false);
if (!buffer) return;
const now = ctx.currentTime + delay;
const src = ctx.createBufferSource();
const filter = ctx.createBiquadFilter();
const gain = ctx.createGain();
src.buffer = buffer;
filter.type = type || 'bandpass';
filter.frequency.setValueAtTime(Math.max(20, startHz), now);
filter.frequency.exponentialRampToValueAtTime(Math.max(20, endHz), now + duration);
gain.gain.setValueAtTime(Math.max(.001, volume), now);
gain.gain.exponentialRampToValueAtTime(.001, now + duration);
src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
src.start(now, 0, Math.min(duration + .03, buffer.duration));
} catch (_) {}
}
sound.startStormAmbiance = function(stage = 1) {
if (!ensureAudio()) return;
stage = Math.max(1, Math.min(3, Number(stage) || 1));
const ctx = this.ctx;
const gainByStage = [0, .040, .052, .062];
const freqByStage = [0, 520, 690, 820];
if (this.ambientNodes?.kind === 'storm') {
try {
const now = ctx.currentTime;
this.ambientNodes.mainGain.gain.cancelScheduledValues(now);
this.ambientNodes.mainGain.gain.linearRampToValueAtTime(gainByStage[stage], now + .65);
this.ambientNodes.filter.frequency.cancelScheduledValues(now);
this.ambientNodes.filter.frequency.linearRampToValueAtTime(freqByStage[stage], now + .65);
this.ambientNodes.lfo.frequency.setValueAtTime(stage === 3 ? .23 : .15, now);
this.ambientNodes.stage = stage;
} catch (_) {}
return;
}
this.stopAmbiance?.();
try {
const windBuffer = cachedNoise('storm-wind', 2.2, true);
const noise = ctx.createBufferSource();
noise.buffer = windBuffer;
noise.loop = true;
const filter = ctx.createBiquadFilter();
filter.type = 'bandpass';
filter.Q.value = .52;
filter.frequency.value = freqByStage[stage];
const mainGain = ctx.createGain();
mainGain.gain.value = .001;
mainGain.gain.exponentialRampToValueAtTime(gainByStage[stage], ctx.currentTime + 1.0);
const lfo = ctx.createOscillator();
const lfoGain = ctx.createGain();
lfo.frequency.value = stage === 3 ? .23 : .15;
lfoGain.gain.value = stage === 3 ? 120 : 82;
lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
noise.connect(filter); filter.connect(mainGain); mainGain.connect(ctx.destination);
noise.start(); lfo.start();
this.ambientNodes = { kind:'storm', stage, noise, filter, mainGain, lfo, lfoGain };
} catch (_) {}
};
sound.playStormThunder = function(intensity = .75) {
if (!ensureAudio()) return;
try {
const ctx = this.ctx;
const buffer = cachedNoise('storm-thunder', 1.9, false);
const now = ctx.currentTime;
const src = ctx.createBufferSource();
const filter = ctx.createBiquadFilter();
const gain = ctx.createGain();
src.buffer = buffer;
filter.type = 'lowpass';
filter.frequency.setValueAtTime(780, now);
filter.frequency.exponentialRampToValueAtTime(65, now + 1.25);
const v = Math.max(.05, Math.min(.9, Number(intensity) || .75));
gain.gain.setValueAtTime(.48 * v, now);
gain.gain.exponentialRampToValueAtTime(.001, now + 1.35);
src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
src.start(now, 0, 1.45);
} catch (_) {}
};
sound.playVoltCharge = function() {
tone('sine', 420, 1320, .28, .07);
noiseBurst(.22, .045, 'highpass', 900, 2600, .04);
};
sound.playVoltBurst = function() {
noiseBurst(.20, .085, 'highpass', 2800, 700);
tone('triangle', 1250, 290, .23, .09);
};
sound.playVoltDashWarn = function() {
tone('square', 330, 590, .13, .045);
tone('square', 420, 720, .13, .04, .13);
};
sound.playVoltDash = function() {
noiseBurst(.30, .10, 'bandpass', 1900, 360);
tone('sawtooth', 300, 76, .30, .075);
};
sound.playVoltSwarmWarn = function() {
tone('triangle', 780, 1180, .18, .045);
tone('triangle', 880, 1320, .18, .035, .10);
};
sound.playVoltSwarm = function() {
noiseBurst(.24, .072, 'bandpass', 1450, 520);
tone('square', 520, 260, .20, .035);
};
sound.playVoltShieldBreak = function() {
noiseBurst(.34, .13, 'highpass', 3700, 620);
tone('triangle', 1450, 180, .32, .12);
this.playStormThunder?.(.62);
};
sound.playVoltRage = function() {
noiseBurst(.48, .10, 'bandpass', 1800, 220);
tone('sawtooth', 260, 72, .46, .105);
tone('triangle', 620, 170, .38, .06, .08);
this.playStormThunder?.(.88);
};
sound.playVoltDefeat = function() {
noiseBurst(.62, .14, 'bandpass', 2200, 130);
tone('sawtooth', 240, 42, .60, .13);
tone('triangle', 920, 105, .52, .085, .10);
this.playStormThunder?.(.92);
};
function desiredStage(g) {
if (g.boss?.active || ['BOSS_WARNING','BOSS_INTRO'].includes(g.state)) return 3;
return Number(g.score || 0) >= Number(C.STAGE1_END || 15) ? 2 : 1;
}
const oldEnterStory = typeof game.enterStoryState === 'function' ? game.enterStoryState.bind(game) : null;
if (oldEnterStory) {
game.enterStoryState = function(...args) {
const result = oldEnterStory(...args);
if (this.activeWorld === W3) {
this.__w3AudioStage = 1;
this.sound?.startStormAmbiance?.(1);
}
return result;
};
}
const oldActivateBoss = typeof game.activateBoss === 'function' ? game.activateBoss.bind(game) : null;
if (oldActivateBoss) {
game.activateBoss = function(...args) {
const result = oldActivateBoss(...args);
if (this.activeWorld === W3 && this.boss?.type === 'thunderbird') {
this.__w3AudioStage = 3;
this.sound?.startStormAmbiance?.(3);
}
return result;
};
}
const oldUpdate = typeof game.update === 'function' ? game.update.bind(game) : null;
if (oldUpdate) {
game.update = function() {
const result = oldUpdate();
if (this.activeWorld !== W3) return result;
if (['PLAYING','STORY','BOSS_WARNING','BOSS_INTRO'].includes(this.state)) {
const stage = desiredStage(this);
if (this.__w3AudioStage !== stage || this.sound?.ambientNodes?.kind !== 'storm') {
this.__w3AudioStage = stage;
this.sound?.startStormAmbiance?.(stage);
}
if (!this.boss?.active && this.state === 'PLAYING') {
const period = stage === 2 ? 610 : 850;
if (this.frame > 120 && this.frame % period === 0) this.sound?.playStormThunder?.(stage === 2 ? .34 : .25);
}
}
const particleCap = this.boss?.active ? 240 : 190;
if (Array.isArray(this.particles) && this.particles.length > particleCap) {
this.particles.splice(0, this.particles.length - particleCap);
}
const rainCap = this.boss?.active ? 58 : 48;
if (Array.isArray(this.rain) && this.rain.length > rainCap) {
this.rain.splice(0, this.rain.length - rainCap);
}
if (Array.isArray(this.bossFeathers) && this.bossFeathers.length > 8) {
this.bossFeathers.splice(0, this.bossFeathers.length - 8);
}
if (Array.isArray(this.electricBats) && this.electricBats.length > 5) {
const stageBats = this.electricBats.filter(b => !b.__w3BossSwarm);
const bossBats = this.electricBats.filter(b => b.__w3BossSwarm).slice(-3);
this.electricBats = stageBats.slice(-2).concat(bossBats);
}
return result;
};
}
const oldGameOver = typeof game.gameOver === 'function' ? game.gameOver.bind(game) : null;
if (oldGameOver) {
game.gameOver = function(isVictory = false, ...args) {
if (this.activeWorld !== W3) return oldGameOver(isVictory, ...args);
const savedW1HighScore = Number(this.highScore || 0);
const savedW3HighScore = Number(this.highScoreW3 || 0);
const runScore = Number(this.score || 0);
this.highScore = savedW3HighScore;
try {
const result = oldGameOver(isVictory, ...args);
this.highScoreW3 = Math.max(savedW3HighScore, Number(this.highScore || 0), runScore);
try { localStorage.setItem('fh_highscore_w3', String(this.highScoreW3)); } catch (_) {}
if (isVictory) {
this.w3Completed = true;
try { localStorage.setItem('fh_w3_completed', 'true'); } catch (_) {}
}
try { this.updateCarousel?.(); } catch (_) {}
return result;
} finally {
this.highScore = savedW1HighScore;
try { localStorage.setItem('fh_highscore', String(savedW1HighScore)); } catch (_) {}
}
};
}
const reviveBtn = document.getElementById('reviveBtn');
if (reviveBtn && typeof reviveBtn.onclick === 'function') {
const oldRevive = reviveBtn.onclick;
reviveBtn.onclick = function(e) {
const result = oldRevive.call(this, e);
if (game.activeWorld === W3) {
game.bossFeathers = [];
game.electricBats = (game.electricBats || []).filter(b => !b.__w3BossSwarm);
setTimeout(() => {
if (game.activeWorld === W3 && game.state === 'PLAYING') {
const stage = desiredStage(game);
game.__w3AudioStage = stage;
game.sound?.startStormAmbiance?.(stage);
}
}, 90);
}
return result;
};
}
game.__w3QualityChecks = function() {
const b = this.boss || {};
return {
world: this.activeWorld,
w3Completed: !!this.w3Completed,
bossType: b.type,
bossHp: b.hp,
bossMaxHp: C.W3_BOSS_HP,
shield: b.shield,
phase2AtHp: 2,
stormAudioStage: this.__w3AudioStage || 0,
particleCount: this.particles?.length || 0,
rainCount: this.rain?.length || 0
};
};
game.__w3FinalPolishV1Installed = true;
console.log('[FF-LAB] w3-final-polish-v1-installed');
return true;
}
let tries = 0;
const timer = setInterval(() => {
tries++;
if (install() || tries > 120) clearInterval(timer);
}, 80);
setTimeout(install, 1350);
})();
