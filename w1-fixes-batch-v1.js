(() => {
  function install() {
    const game = window.game;
    if (!game || game.__w1FixesBatchV1Installed) return !!game;

    const sound = game.sound;

    // iOS/Safari: keep the WebAudio context unlocked after real user interaction.
    const unlockAudio = () => {
      try {
        if (sound && typeof sound.init === 'function') sound.init();
        if (sound && sound.ctx && sound.ctx.state === 'suspended') sound.ctx.resume().catch(() => {});
      } catch (_) {}
    };
    ['pointerdown', 'touchstart', 'keydown'].forEach(type => {
      document.addEventListener(type, unlockAudio, { passive: true });
    });

    // Stronger, unmistakable short Crow King scream. No music; pure SFX.
    if (sound) {
      sound.playBossScream = function(intensity = 1) {
        const play = () => {
          if (this.muted || !this.sfxEnabled || !this.ctx) return;
          try {
            const ctx = this.ctx;
            const now = ctx.currentTime + 0.015;

            const burst = (offset, pitch, gainAmount) => {
              const start = now + offset;
              const duration = 0.34;
              const master = ctx.createGain();
              const formant = ctx.createBiquadFilter();
              formant.type = 'bandpass';
              formant.Q.value = 2.2;
              formant.frequency.setValueAtTime(1150, start);
              formant.frequency.exponentialRampToValueAtTime(430, start + duration);
              master.gain.setValueAtTime(0.0001, start);
              master.gain.exponentialRampToValueAtTime(gainAmount * intensity, start + 0.018);
              master.gain.exponentialRampToValueAtTime(0.001, start + duration);
              formant.connect(master);
              master.connect(ctx.destination);

              const osc = ctx.createOscillator();
              osc.type = 'sawtooth';
              osc.frequency.setValueAtTime(pitch, start);
              osc.frequency.exponentialRampToValueAtTime(Math.max(82, pitch * 0.36), start + duration);
              osc.detune.setValueAtTime(-20, start);
              osc.connect(formant);
              osc.start(start);
              osc.stop(start + duration);

              const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
              const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
              const data = buffer.getChannelData(0);
              for (let i = 0; i < length; i++) {
                const p = i / length;
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - p, 1.5);
              }
              const noise = ctx.createBufferSource();
              const noiseFilter = ctx.createBiquadFilter();
              const noiseGain = ctx.createGain();
              noise.buffer = buffer;
              noiseFilter.type = 'bandpass';
              noiseFilter.frequency.setValueAtTime(1450, start);
              noiseFilter.frequency.exponentialRampToValueAtTime(520, start + duration);
              noiseFilter.Q.value = 1.1;
              noiseGain.gain.setValueAtTime(0.11 * intensity, start);
              noiseGain.gain.exponentialRampToValueAtTime(0.001, start + duration);
              noise.connect(noiseFilter);
              noiseFilter.connect(noiseGain);
              noiseGain.connect(ctx.destination);
              noise.start(start);
              noise.stop(start + duration);
            };

            burst(0, 390, 0.32);
            burst(0.23, 320, 0.27);
          } catch (_) {}
        };

        try {
          if (typeof this.init === 'function') this.init();
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().then(play).catch(() => {});
          } else {
            play();
          }
        } catch (_) {}
      };
    }

    // Revive / temporary invulnerability must protect against ALL fatal boss hits,
    // including dash contact and boss projectiles.
    if (typeof game.gameOver === 'function') {
      const originalGameOver = game.gameOver.bind(game);
      game.gameOver = function(isVictory = false) {
        if (!isVictory && this.invincibleTimer > 0 && (this.state === 'PLAYING' || this.state === 'BOSS_WARNING')) {
          if (this.frame % 10 === 0 && this.gfxEnabled !== false) {
            this.particles.push({
              x: this.bird.x, y: this.bird.y,
              vx: -1.5, vy: -1.2,
              size: 3, color: '#bae6fd', life: 0.35
            });
          }
          return;
        }
        return originalGameOver(isVictory);
      };
    }

    // Smooth repeated taps without changing gravity, max velocity or collision values.
    if (typeof game.birdJump === 'function') {
      const originalBirdJump = game.birdJump.bind(game);
      game.birdJump = function() {
        const previousVelocity = Number.isFinite(this.bird?.velocity) ? this.bird.velocity : 0;
        const result = originalBirdJump();
        if (this.state === 'PLAYING' && this.bird && Number.isFinite(this.bird.velocity)) {
          const target = this.bird.velocity;
          const prior = Math.max(-4.5, Math.min(4.5, previousVelocity));
          this.bird.velocity = target * 0.90 + prior * 0.10;
        }
        return result;
      };
    }

    if (typeof game.update === 'function') {
      const originalUpdate = game.update.bind(game);
      game.update = function() {
        const previousRotation = Number.isFinite(this.bird?.rotation) ? this.bird.rotation : 0;
        const wasStage2 = !!this.__ffWasWorld1Stage2;
        const result = originalUpdate();

        // Visual rotation easing keeps the bird from snapping between up/down angles.
        if (this.bird && this.state === 'PLAYING' && Number.isFinite(this.bird.rotation)) {
          this.bird.rotation = previousRotation + (this.bird.rotation - previousRotation) * 0.42;
        }

        // Remove a boss feather that physically overlaps the protected bird so it
        // cannot sit on top of the player until invulnerability expires.
        if (this.invincibleTimer > 0 && Array.isArray(this.bossFeathers)) {
          this.bossFeathers = this.bossFeathers.filter(p =>
            Math.hypot(this.bird.x - p.x, this.bird.y - p.y) > ((window.CONFIG?.BIRD_RADIUS || 14) + 12)
          );
        }

        // Retry the two important screams after the boss is actually on-screen.
        // This fixes browsers that suspended WebAudio during the first activation callback.
        if (this.boss && this.boss.active && this.boss.type === 'crow') {
          if ((this.state === 'BOSS_WARNING' || this.state === 'BOSS_INTRO') && !this.boss.__ffIntroScreamReliable && this.boss.timer > 8) {
            this.boss.__ffIntroScreamReliable = true;
            if (this.sound && typeof this.sound.playBossScream === 'function') this.sound.playBossScream(1.15);
          }
          if (this.boss.enraged && !this.boss.__ffEnrageScreamReliable) {
            this.boss.__ffEnrageScreamReliable = true;
            if (this.sound && typeof this.sound.playBossScream === 'function') this.sound.playBossScream(1.22);
          }
        }

        // Start a short atmosphere cross-fade when World 1 enters Cursed Woods.
        const stage2 = this.activeWorld === 0 && this.score >= (window.CONFIG?.STAGE1_END || 15) && !this.boss?.active;
        if (stage2 && !wasStage2) this.__ffWorld1StageFade = 72;
        this.__ffWasWorld1Stage2 = stage2;
        if (this.__ffWorld1StageFade > 0) this.__ffWorld1StageFade--;

        return result;
      };
    }

    // Cursed Woods scenery changes instantly; soften that scenery swap while the
    // game's existing sky-color lerp continues underneath.
    if (typeof game.drawRuinsBackground === 'function') {
      const originalDrawRuinsBackground = game.drawRuinsBackground.bind(game);
      game.drawRuinsBackground = function() {
        const result = originalDrawRuinsBackground();
        const left = this.__ffWorld1StageFade || 0;
        if (left > 0 && this.activeWorld === 0) {
          const total = 72;
          const alpha = Math.min(0.42, (left / total) * 0.42);
          const groundY = (window.CONFIG?.CANVAS_HEIGHT || 640) - (window.CONFIG?.GROUND_HEIGHT || 70);
          const g = this.ctx.createLinearGradient(0, 0, 0, groundY);
          g.addColorStop(0, `rgba(91,78,91,${alpha})`);
          g.addColorStop(0.65, `rgba(75,69,73,${alpha * 0.72})`);
          g.addColorStop(1, `rgba(55,52,50,${alpha * 0.36})`);
          this.ctx.fillStyle = g;
          this.ctx.fillRect(0, 0, window.CONFIG?.CANVAS_WIDTH || 360, groundY);
        }
        return result;
      };
    }

    // Energy Orbs are collectibles. Hide them only while they pass physically behind
    // the Crow King so the cyan ring never draws over his face/body.
    if (typeof game.draw === 'function') {
      const originalDraw = game.draw.bind(game);
      game.draw = function() {
        const allOrbs = this.powerOrbs;
        if (this.boss && this.boss.active && this.boss.type === 'crow' && Array.isArray(allOrbs)) {
          const visible = [];
          for (const orb of allOrbs) {
            const d = Math.hypot(orb.x - this.boss.x, orb.y - this.boss.y);
            if (d > 68) visible.push(orb);
          }
          this.powerOrbs = visible;
          const result = originalDraw();
          this.powerOrbs = allOrbs;
          return result;
        }
        return originalDraw();
      };
    }

    game.__w1FixesBatchV1Installed = true;
    console.log('[FF-LAB] w1-fixes-batch-v1-installed');
    return true;
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    if (install() || attempts > 80) clearInterval(timer);
  }, 100);
  setTimeout(install, 1000);
  setTimeout(install, 2200);
})();
