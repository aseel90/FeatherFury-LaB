(() => {
  'use strict';

  function install() {
    const game = window.game;
    const sound = game?.sound;
    if (!game || !sound) return false;
    if (game.__w2AudioV1Installed) return true;

    const ensure = () => {
      try {
        sound.init?.();
        if (sound.ctx?.state === 'suspended') sound.ctx.resume?.();
      } catch (_) {}
      return sound.ctx && !sound.muted && sound.sfxEnabled !== false;
    };

    const noiseBurst = (duration, volume, filterType, startFreq, endFreq) => {
      if (!ensure()) return;
      try {
        const ctx = sound.ctx;
        const now = ctx.currentTime;
        const len = Math.max(1, Math.floor(ctx.sampleRate * duration));
        const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < len; i++) {
          const white = Math.random() * 2 - 1;
          last = (last * 0.72) + white * 0.28;
          data[i] = last;
        }
        const src = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        src.buffer = buffer;
        filter.type = filterType || 'bandpass';
        filter.frequency.setValueAtTime(Math.max(20, startFreq), now);
        filter.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
        gain.gain.setValueAtTime(Math.max(0.001, volume), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        src.start(now); src.stop(now + duration + 0.02);
      } catch (_) {}
    };

    const tone = (type, startHz, endHz, duration, volume, delay = 0) => {
      if (!ensure()) return;
      try {
        const ctx = sound.ctx;
        const now = ctx.currentTime + delay;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(Math.max(20, startHz), now);
        o.frequency.exponentialRampToValueAtTime(Math.max(20, endHz), now + duration);
        g.gain.setValueAtTime(Math.max(0.001, volume), now);
        g.gain.exponentialRampToValueAtTime(0.001, now + duration);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + duration + 0.02);
      } catch (_) {}
    };

    sound.startFrostAmbiance = function(stage = 1) {
      if (!ensure()) return;
      stage = Math.max(1, Math.min(3, Number(stage) || 1));
      const ctx = this.ctx;

      if (this.ambientNodes?.kind === 'frost') {
        try {
          const now = ctx.currentTime;
          const targetGain = stage === 1 ? 0.075 : stage === 2 ? 0.11 : 0.065;
          const targetFreq = stage === 1 ? 680 : stage === 2 ? 980 : 520;
          this.ambientNodes.mainGain.gain.cancelScheduledValues(now);
          this.ambientNodes.mainGain.gain.linearRampToValueAtTime(targetGain, now + 0.8);
          this.ambientNodes.filter.frequency.cancelScheduledValues(now);
          this.ambientNodes.filter.frequency.linearRampToValueAtTime(targetFreq, now + 0.8);
          this.ambientNodes.stage = stage;
        } catch (_) {}
        return;
      }

      this.stopAmbiance?.();
      try {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let brown = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          brown = (brown + 0.025 * white) / 1.025;
          data[i] = brown * 3.1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer; noise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 0.7;
        filter.frequency.value = stage === 1 ? 680 : stage === 2 ? 980 : 520;
        const mainGain = ctx.createGain();
        mainGain.gain.value = 0.001;
        mainGain.gain.exponentialRampToValueAtTime(stage === 1 ? 0.075 : stage === 2 ? 0.11 : 0.065, ctx.currentTime + 1.2);
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = stage === 2 ? 0.28 : 0.16;
        lfoGain.gain.value = stage === 2 ? 190 : 105;
        lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
        noise.connect(filter); filter.connect(mainGain); mainGain.connect(ctx.destination);
        noise.start(); lfo.start();
        this.ambientNodes = { kind:'frost', stage, noise, filter, lfo, lfoGain, mainGain };
      } catch (_) {}
    };

    sound.playSnowThrow = function() {
      noiseBurst(0.12, 0.12, 'highpass', 1200, 3600);
      tone('triangle', 360, 180, 0.11, 0.08);
    };
    sound.playSnowballWhoosh = function() { noiseBurst(0.18, 0.075, 'bandpass', 1800, 620); };
    sound.playIceWarn = function() {
      tone('sine', 1500, 2300, 0.15, 0.07);
      tone('sine', 2100, 1600, 0.12, 0.04, 0.08);
    };
    sound.playIceDrop = function() { noiseBurst(0.24, 0.11, 'highpass', 2400, 620); };
    sound.playIceShatter = function() {
      noiseBurst(0.22, 0.18, 'highpass', 4200, 900);
      tone('triangle', 980, 220, 0.2, 0.08);
    };
    sound.playPenguinDodge = function() {
      noiseBurst(0.13, 0.095, 'bandpass', 1600, 760);
      tone('sine', 520, 760, 0.1, 0.045);
    };
    sound.playPenguinSlide = function() {
      noiseBurst(0.42, 0.16, 'bandpass', 1250, 320);
      tone('sawtooth', 180, 82, 0.38, 0.055);
    };
    sound.playPenguinLand = function() {
      noiseBurst(0.32, 0.22, 'lowpass', 520, 90);
      tone('sine', 82, 36, 0.3, 0.2);
    };
    sound.playPenguinEnrage = function() {
      if (!ensure()) return;
      noiseBurst(0.58, 0.17, 'bandpass', 1200, 220);
      tone('sawtooth', 210, 72, 0.5, 0.16);
      tone('triangle', 330, 110, 0.42, 0.095, 0.07);
    };
    sound.playFrostLaunch = function() {
      noiseBurst(0.3, 0.12, 'highpass', 780, 2400);
      tone('triangle', 240, 620, 0.24, 0.09);
    };
    sound.playEagleCall = function() {
      tone('triangle', 920, 1450, 0.16, 0.075);
      tone('triangle', 1280, 760, 0.24, 0.065, 0.12);
    };

    game.__w2AudioV1Installed = true;
    console.log('[FF-LAB] w2-audio-v1-installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 100) clearInterval(timer);
  }, 80);
  setTimeout(install, 1000);
})();
