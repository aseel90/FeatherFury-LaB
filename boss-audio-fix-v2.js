(() => {
  function install() {
    const game = window.game;
    if (!game || game.__bossAudioFixV2Installed) return !!game;
    const sound = game.sound;
    if (!sound) return false;

    const ensureAudio = async () => {
      try {
        if (typeof sound.init === 'function') sound.init();
        if (sound.ctx && sound.ctx.state === 'suspended') await sound.ctx.resume();
        return !!sound.ctx && sound.ctx.state === 'running';
      } catch (_) {
        return false;
      }
    };

    // Keep WebAudio unlocked on iOS/Safari after a real user gesture.
    const unlock = () => { ensureAudio(); };
    ['pointerdown', 'touchstart', 'mousedown', 'keydown'].forEach(type => {
      document.addEventListener(type, unlock, { passive: true, capture: true });
    });

    // Dedicated Crow King scream: two harsh crow-like caws with noise/formant layers.
    sound.playBossScream = async function(intensity = 1) {
      if (this.muted || this.sfxEnabled === false) return;
      if (!(await ensureAudio())) return;
      const ctx = this.ctx;
      try {
        const t0 = ctx.currentTime + 0.02;

        const caw = (start, f0, f1, amp) => {
          const dur = 0.34;
          const master = ctx.createGain();
          const formant = ctx.createBiquadFilter();
          const low = ctx.createBiquadFilter();
          formant.type = 'bandpass';
          formant.Q.value = 2.8;
          formant.frequency.setValueAtTime(1250, start);
          formant.frequency.exponentialRampToValueAtTime(520, start + dur);
          low.type = 'lowpass';
          low.frequency.value = 2200;
          master.gain.setValueAtTime(0.0001, start);
          master.gain.exponentialRampToValueAtTime(amp * intensity, start + 0.015);
          master.gain.exponentialRampToValueAtTime(0.001, start + dur);
          formant.connect(low); low.connect(master); master.connect(ctx.destination);

          const carrier = ctx.createOscillator();
          const growl = ctx.createOscillator();
          carrier.type = 'sawtooth';
          growl.type = 'square';
          carrier.frequency.setValueAtTime(f0, start);
          carrier.frequency.exponentialRampToValueAtTime(f1, start + dur);
          growl.frequency.setValueAtTime(f0 * 0.5, start);
          growl.frequency.exponentialRampToValueAtTime(Math.max(72, f1 * 0.55), start + dur);
          const growlGain = ctx.createGain();
          growlGain.gain.value = 0.20;
          carrier.connect(formant);
          growl.connect(growlGain); growlGain.connect(formant);
          carrier.start(start); growl.start(start);
          carrier.stop(start + dur); growl.stop(start + dur);

          const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
          const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < len; i++) {
            const p = i / len;
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - p, 1.2);
          }
          const noise = ctx.createBufferSource();
          const nf = ctx.createBiquadFilter();
          const ng = ctx.createGain();
          noise.buffer = buffer;
          nf.type = 'bandpass';
          nf.Q.value = 1.5;
          nf.frequency.setValueAtTime(1800, start);
          nf.frequency.exponentialRampToValueAtTime(650, start + dur);
          ng.gain.setValueAtTime(0.16 * intensity, start);
          ng.gain.exponentialRampToValueAtTime(0.001, start + dur);
          noise.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
          noise.start(start); noise.stop(start + dur);
        };

        caw(t0, 430, 150, 0.34);
        caw(t0 + 0.25, 360, 118, 0.29);
      } catch (_) {}
    };

    // Dedicated feather attack SFX: short air slash / whoosh, never bird jump/flap.
    sound.playBossFeatherWhoosh = async function(intensity = 1) {
      if (this.muted || this.sfxEnabled === false) return;
      if (!(await ensureAudio())) return;
      const ctx = this.ctx;
      try {
        const now = ctx.currentTime;
        const dur = 0.18;
        const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
        const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < len; i++) {
          const p = i / len;
          data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * p) * (1 - p * 0.55);
        }
        const src = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        src.buffer = buffer;
        filter.type = 'bandpass';
        filter.Q.value = 0.8;
        filter.frequency.setValueAtTime(2200, now);
        filter.frequency.exponentialRampToValueAtTime(720, now + dur);
        gain.gain.setValueAtTime(0.18 * intensity, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        src.start(now); src.stop(now + dur);
      } catch (_) {}
    };

    // Patch feather-pattern spawning so it never reuses the player jump/flap sound.
    if (typeof game.updateBoss === 'function') {
      const originalUpdateBoss = game.updateBoss.bind(game);
      let previousCount = Array.isArray(game.bossFeathers) ? game.bossFeathers.length : 0;
      game.updateBoss = function() {
        const before = Array.isArray(this.bossFeathers) ? this.bossFeathers.length : 0;
        const result = originalUpdateBoss();
        const after = Array.isArray(this.bossFeathers) ? this.bossFeathers.length : 0;
        if (this.boss?.active && this.boss?.type === 'crow' && after > before) {
          if (this.sound && typeof this.sound.playBossFeatherWhoosh === 'function') {
            this.sound.playBossFeatherWhoosh(this.boss.enraged ? 1.08 : 0.95);
          }
        }
        previousCount = after;
        return result;
      };
    }

    // Reliable scream triggers once the boss is visible, with a short delayed retry.
    if (typeof game.update === 'function') {
      const originalUpdate = game.update.bind(game);
      game.update = function() {
        const result = originalUpdate();
        const boss = this.boss;
        if (boss && boss.active && boss.type === 'crow') {
          if ((this.state === 'BOSS_WARNING' || this.state === 'BOSS_INTRO' || this.state === 'PLAYING') && !boss.__ffScreamV2Intro && (boss.timer == null || boss.timer > 4)) {
            boss.__ffScreamV2Intro = true;
            if (this.sound && typeof this.sound.playBossScream === 'function') {
              this.sound.playBossScream(1.1);
              setTimeout(() => {
                try {
                  if (window.game?.boss?.active && window.game.sound?.ctx?.state === 'running') {
                    // one quieter retry only if the first browser scheduling was lost
                    if (!window.game.boss.__ffScreamV2Retry) {
                      window.game.boss.__ffScreamV2Retry = true;
                      window.game.sound.playBossScream(0.72);
                    }
                  }
                } catch (_) {}
              }, 420);
            }
          }
          if (boss.enraged && !boss.__ffScreamV2Enrage) {
            boss.__ffScreamV2Enrage = true;
            if (this.sound && typeof this.sound.playBossScream === 'function') this.sound.playBossScream(1.18);
          }
        }
        return result;
      };
    }

    game.__bossAudioFixV2Installed = true;
    console.log('[FF-LAB] boss-audio-fix-v2-installed');
    return true;
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    if (install() || attempts > 80) clearInterval(timer);
  }, 100);
  setTimeout(install, 1200);
  setTimeout(install, 2600);
})();