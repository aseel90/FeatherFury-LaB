(() => {
  function install() {
    const game = window.game;
    if (!game || game.__w1FinalAudioV1Installed) return !!game;
    const sound = game.sound;
    if (!sound) return false;

    function ensureAudio(s) {
      try {
        if (typeof s.init === 'function') s.init();
        if (s.ctx && s.ctx.state === 'suspended') s.ctx.resume().catch(() => {});
        return s.ctx || null;
      } catch (_) { return null; }
    }
    function noiseBuffer(ctx, seconds) {
      const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
      const b = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      return b;
    }

    try { if (typeof CONFIG !== 'undefined') CONFIG.REVIVE_COST = 10; } catch (_) {}

    sound.playBossScream = function(intensity = 1) {
      const ctx = ensureAudio(this);
      if (!ctx || this.muted || !this.sfxEnabled) return;
      const caw = (offset, base, amount) => {
        const now = ctx.currentTime + 0.02 + offset;
        const dur = 0.38;
        const bus = ctx.createGain();
        const formant = ctx.createBiquadFilter();
        formant.type = 'bandpass'; formant.Q.value = 3.1;
        formant.frequency.setValueAtTime(1450, now);
        formant.frequency.exponentialRampToValueAtTime(520, now + dur);
        bus.gain.setValueAtTime(0.0001, now);
        bus.gain.exponentialRampToValueAtTime(amount * intensity, now + 0.018);
        bus.gain.setValueAtTime(amount * 0.72 * intensity, now + 0.085);
        bus.gain.exponentialRampToValueAtTime(0.001, now + dur);
        formant.connect(bus); bus.connect(ctx.destination);

        const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
        o1.type = 'sawtooth'; o2.type = 'square';
        o1.frequency.setValueAtTime(base, now);
        o1.frequency.exponentialRampToValueAtTime(base * 0.31, now + dur);
        o2.frequency.setValueAtTime(base * 1.68, now);
        o2.frequency.exponentialRampToValueAtTime(base * 0.52, now + dur * 0.86);
        o1.detune.value = -18; o2.detune.value = 17;
        o1.connect(formant); o2.connect(formant);
        o1.start(now); o2.start(now + 0.008); o1.stop(now + dur); o2.stop(now + dur * 0.9);

        const n = ctx.createBufferSource(), nf = ctx.createBiquadFilter(), ng = ctx.createGain();
        n.buffer = noiseBuffer(ctx, dur);
        nf.type = 'bandpass'; nf.Q.value = 1.4;
        nf.frequency.setValueAtTime(2200, now); nf.frequency.exponentialRampToValueAtTime(680, now + dur);
        ng.gain.setValueAtTime(0.18 * intensity, now); ng.gain.exponentialRampToValueAtTime(0.001, now + dur);
        n.connect(nf); nf.connect(ng); ng.connect(ctx.destination); n.start(now); n.stop(now + dur);
      };
      caw(0, 480, 0.38); caw(0.29, 395, 0.32);
    };

    sound.playBossFeatherWhoosh = function(intensity = 1) {
      const ctx = ensureAudio(this);
      if (!ctx || this.muted || !this.sfxEnabled) return;
      const now = ctx.currentTime, dur = 0.2;
      const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
      src.buffer = noiseBuffer(ctx, dur);
      filter.type = 'bandpass'; filter.Q.value = 0.8;
      filter.frequency.setValueAtTime(2600, now); filter.frequency.exponentialRampToValueAtTime(620, now + dur);
      gain.gain.setValueAtTime(0.0001, now); gain.gain.exponentialRampToValueAtTime(0.22 * intensity, now + 0.012); gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      src.connect(filter); filter.connect(gain); gain.connect(ctx.destination); src.start(now); src.stop(now + dur);
    };

    sound.playBossDashPrep = function() {
      const ctx = ensureAudio(this); if (!ctx || this.muted || !this.sfxEnabled) return;
      const now = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(75, now); o.frequency.exponentialRampToValueAtTime(240, now + 0.34);
      g.gain.setValueAtTime(0.035, now); g.gain.exponentialRampToValueAtTime(0.14, now + 0.3); g.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + 0.38);
    };
    sound.playBossDash = function() {
      const ctx = ensureAudio(this); if (!ctx || this.muted || !this.sfxEnabled) return;
      const now = ctx.currentTime, n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      n.buffer = noiseBuffer(ctx, 0.48); f.type = 'bandpass'; f.Q.value = 0.65;
      f.frequency.setValueAtTime(1900, now); f.frequency.exponentialRampToValueAtTime(210, now + 0.45);
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.34, now + 0.025); g.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
      n.connect(f); f.connect(g); g.connect(ctx.destination); n.start(now); n.stop(now + 0.48);
    };
    sound.playBossEnrage = function() {
      const ctx = ensureAudio(this); if (!ctx || this.muted || !this.sfxEnabled) return;
      this.playBossScream(1.1);
      const now = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(72, now); o.frequency.exponentialRampToValueAtTime(38, now + 0.7);
      g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
      o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + 0.72);
    };
    sound.playOrbImpact = function() {
      const ctx = ensureAudio(this); if (!ctx || this.muted || !this.sfxEnabled) return;
      const now = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(1180, now); o.frequency.exponentialRampToValueAtTime(410, now + 0.16);
      g.gain.setValueAtTime(0.18, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + 0.18);
    };
    sound.playCageBreak = function() {
      const ctx = ensureAudio(this); if (!ctx || this.muted || !this.sfxEnabled) return;
      const now = ctx.currentTime;
      [0, 0.035, 0.08].forEach((off, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = i === 0 ? 'square' : 'triangle';
        o.frequency.setValueAtTime(210 + i * 115, now + off); o.frequency.exponentialRampToValueAtTime(65 + i * 30, now + off + 0.22);
        g.gain.setValueAtTime(0.17 - i * 0.03, now + off); g.gain.exponentialRampToValueAtTime(0.001, now + off + 0.24);
        o.connect(g); g.connect(ctx.destination); o.start(now + off); o.stop(now + off + 0.24);
      });
    };
    sound.playVictoryEffect = function() {
      const ctx = ensureAudio(this); if (!ctx || this.muted || !this.sfxEnabled) return;
      const now = ctx.currentTime;
      [660, 990].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = freq;
        g.gain.setValueAtTime(0.09, now + i * 0.055); g.gain.exponentialRampToValueAtTime(0.001, now + 0.30 + i * 0.055);
        o.connect(g); g.connect(ctx.destination); o.start(now + i * 0.055); o.stop(now + 0.32 + i * 0.055);
      });
    };
    sound.startCursedAmbiance = function() {
      const ctx = ensureAudio(this); if (!ctx || this.muted || !this.sfxEnabled) return;
      try { this.stopAmbiance(); } catch (_) {}
      const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      n.buffer = noiseBuffer(ctx, 2); n.loop = true; f.type = 'bandpass'; f.frequency.value = 205; f.Q.value = 0.72;
      g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.075, ctx.currentTime + 1.2);
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.085; lg.gain.value = 65;
      lfo.connect(lg); lg.connect(f.frequency); n.connect(f); f.connect(g); g.connect(ctx.destination); n.start(); lfo.start();
      this.ambientNodes = { noise: n, filter: f, lfo, mainGain: g };
    };

    const priorActivateBoss = typeof game.activateBoss === 'function' ? game.activateBoss.bind(game) : null;
    if (priorActivateBoss) game.activateBoss = function() {
      const isW1 = this.activeWorld === 0;
      let oldCry;
      if (isW1 && this.sound) { oldCry = this.sound.playBossScream; this.sound.playBossScream = () => {}; }
      const r = priorActivateBoss();
      if (oldCry) this.sound.playBossScream = oldCry;
      if (isW1 && this.boss?.type === 'crow') {
        try { this.sound.stopAmbiance(); } catch (_) {}
        this.boss.__ffIntroScreamReliable = true; this.boss.__ffScreamV2Intro = true; this.boss.__ffScreamV2Retry = true;
        setTimeout(() => { if (this.boss?.active && this.boss.type === 'crow') this.sound?.playBossScream?.(1.08); }, 180);
      }
      return r;
    };

    const priorUpdateBoss = typeof game.updateBoss === 'function' ? game.updateBoss.bind(game) : null;
    if (priorUpdateBoss) game.updateBoss = function() {
      const crow = this.boss?.active && this.boss.type === 'crow';
      if (!crow) return priorUpdateBoss();
      const maxHp = (typeof CONFIG !== 'undefined' && CONFIG.BOSS_HP) ? CONFIG.BOSS_HP : 5;
      if (!this.boss.enraged && this.boss.hp <= Math.floor(maxHp / 2)) {
        this.boss.enraged = true;
        this.boss.__ffEnrageScreamReliable = true; this.boss.__ffScreamV2Enrage = true; this.boss.__ffScreamedEnraged = true;
        this.screenShake = Math.max(this.screenShake || 0, 12); this.lightning = Math.max(this.lightning || 0, 0.65);
        this.sound?.playBossEnrage?.();
      }
      const oldState = this.boss.state;
      const beforeCount = Array.isArray(this.bossFeathers) ? this.bossFeathers.length : 0;
      const s = this.sound; let flap, launch, smash, oldCry;
      if (s) {
        flap=s.playFlap; launch=s.playLaunch; smash=s.playSmash; oldCry=s.playBossScream;
        s.playFlap=()=>{}; s.playLaunch=()=>{}; s.playSmash=()=>{};
        if (this.boss.enraged) s.playBossScream=()=>{};
      }
      let r;
      try { r = priorUpdateBoss(); } finally { if(s){ s.playFlap=flap; s.playLaunch=launch; s.playSmash=smash; s.playBossScream=oldCry; } }
      const afterCount = Array.isArray(this.bossFeathers) ? this.bossFeathers.length : 0;
      if (afterCount > beforeCount) this.sound?.playBossFeatherWhoosh?.(this.boss.enraged ? 1.08 : 0.95);
      if (oldState !== this.boss.state) {
        if (this.boss.state === 'DASH_PREP') this.sound?.playBossDashPrep?.();
        if (this.boss.state === 'DASHING') this.sound?.playBossDash?.();
      }
      return r;
    };

    ['pointerdown','touchstart','mousedown','keydown'].forEach(t => document.addEventListener(t, () => ensureAudio(sound), { passive:true, capture:true }));

    game.__w1FinalAudioV1Installed = true;
    console.log('[FF-LAB] w1-final-audio-v1-installed');
    return true;
  }
  let tries=0; const timer=setInterval(()=>{ tries++; if(install()||tries>90) clearInterval(timer); },100);
  setTimeout(install,1200); setTimeout(install,2400);
})();