(() => {
  function installBossAudio(game) {
    const sound = game.sound;
    if (!sound || sound.__ffBossAudioV1) return;

    sound.playBossScream = function(intensity = 1) {
      if (this.muted || !this.sfxEnabled || !this.ctx) return;
      try {
        const ctx = this.ctx;
        const now = ctx.currentTime;
        const master = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(820, now);
        filter.frequency.exponentialRampToValueAtTime(310, now + 0.68);
        filter.Q.setValueAtTime(1.4, now);
        master.gain.setValueAtTime(0.0001, now);
        master.gain.exponentialRampToValueAtTime(0.22 * intensity, now + 0.025);
        master.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
        filter.connect(master);
        master.connect(ctx.destination);

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(235, now);
        osc1.frequency.exponentialRampToValueAtTime(92, now + 0.68);
        osc2.frequency.setValueAtTime(390, now);
        osc2.frequency.exponentialRampToValueAtTime(145, now + 0.58);
        osc1.detune.setValueAtTime(-16, now);
        osc2.detune.setValueAtTime(21, now);
        osc1.connect(filter);
        osc2.connect(filter);
        osc1.start(now); osc2.start(now + 0.012);
        osc1.stop(now + 0.72); osc2.stop(now + 0.66);

        const length = Math.floor(ctx.sampleRate * 0.52);
        const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
          const env = Math.pow(1 - i / length, 1.7);
          data[i] = (Math.random() * 2 - 1) * env;
        }
        const noise = ctx.createBufferSource();
        const noiseFilter = ctx.createBiquadFilter();
        const noiseGain = ctx.createGain();
        noise.buffer = buffer;
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1200, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(260, now + 0.5);
        noiseGain.gain.setValueAtTime(0.075 * intensity, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
        noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(ctx.destination);
        noise.start(now); noise.stop(now + 0.52);
      } catch (_) {}
    };

    sound.startBossAmbiance = function() {
      if (this.muted || !this.sfxEnabled || !this.ctx || this.__ffBossAmbience) return;
      try {
        const ctx = this.ctx;
        const length = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < length; i++) {
          const white = Math.random() * 2 - 1;
          last = (last + white * 0.018) / 1.018;
          data[i] = last * 2.4;
        }
        const noise = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        noise.buffer = buffer; noise.loop = true;
        filter.type = 'bandpass'; filter.frequency.setValueAtTime(180, ctx.currentTime); filter.Q.value = 0.7;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.055, ctx.currentTime + 1.2);
        lfo.frequency.value = 0.11; lfoGain.gain.value = 45;
        lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
        noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        noise.start(); lfo.start();
        this.__ffBossAmbience = { noise, filter, gain, lfo };
      } catch (_) {}
    };

    sound.stopBossAmbiance = function() {
      const nodes = this.__ffBossAmbience;
      if (!nodes || !this.ctx) return;
      this.__ffBossAmbience = null;
      try {
        const now = this.ctx.currentTime;
        nodes.gain.gain.cancelScheduledValues(now);
        nodes.gain.gain.setValueAtTime(Math.max(0.001, nodes.gain.gain.value), now);
        nodes.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        setTimeout(() => {
          try { nodes.noise.stop(); nodes.lfo.stop(); } catch (_) {}
        }, 400);
      } catch (_) {}
    };

    sound.playBossTelegraph = function() {
      if (this.muted || !this.sfxEnabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(155, now);
        osc.frequency.exponentialRampToValueAtTime(430, now + 0.16);
        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(now); osc.stop(now + 0.18);
      } catch (_) {}
    };

    sound.__ffBossAudioV1 = true;
  }

  function spawnPattern(game, item) {
    const bx = game.boss.x - 34;
    const by = game.boss.y;
    const targetDy = item.targetY - by;
    const baseVy = Math.max(-2.3, Math.min(2.3, targetDy * 0.018));

    if (item.pattern === 'SPREAD') {
      [-1.35, 0, 1.35].forEach((offset, i) => {
        game.bossFeathers.push({
          x: bx - i * 2,
          y: by,
          vx: game.boss.enraged ? -8.4 : -7.4,
          vy: baseVy + offset,
          __ffPattern: 'SPREAD'
        });
      });
    } else {
      game.bossFeathers.push({
        x: bx,
        y: by,
        vx: game.boss.enraged ? -10.2 : -8.8,
        vy: baseVy,
        __ffPattern: 'STRAIGHT'
      });
    }
    if (game.sound && typeof game.sound.playFlap === 'function') game.sound.playFlap();
  }

  function install() {
    const game = window.game;
    if (!game || typeof game.updateBoss !== 'function' || typeof game.drawCrowBoss !== 'function') return false;
    if (game.__bossFightCoreV1Installed) return true;

    installBossAudio(game);

    const originalActivateBoss = typeof game.activateBoss === 'function' ? game.activateBoss.bind(game) : null;
    if (originalActivateBoss) {
      game.activateBoss = function() {
        const result = originalActivateBoss();
        if (this.activeWorld === 0 && this.boss && this.boss.type === 'crow') {
          this.boss.__ffPatternCounter = 0;
          this.boss.__ffAttackQueue = [];
          this.boss.__ffScreamedEnraged = false;
          this.boss.__ffTelegraph = null;
          if (this.sound) {
            if (typeof this.sound.startBossAmbiance === 'function') this.sound.startBossAmbiance();
            if (typeof this.sound.playBossScream === 'function') this.sound.playBossScream(1);
          }
        }
        return result;
      };
    }

    const originalUpdateBoss = game.updateBoss.bind(game);
    game.updateBoss = function() {
      const isCrow = this.boss && this.boss.active && this.boss.type === 'crow';
      const oldRefs = isCrow && Array.isArray(this.bossFeathers) ? new Set(this.bossFeathers) : null;
      const wasEnraged = isCrow ? !!this.boss.enraged : false;

      const result = originalUpdateBoss();

      if (!isCrow || !this.boss) {
        if ((!this.boss || !this.boss.active) && this.sound && typeof this.sound.stopBossAmbiance === 'function') this.sound.stopBossAmbiance();
        return result;
      }

      if (!wasEnraged && this.boss.enraged && !this.boss.__ffScreamedEnraged) {
        this.boss.__ffScreamedEnraged = true;
        if (this.sound && typeof this.sound.playBossScream === 'function') this.sound.playBossScream(1.12);
      }

      if (!Array.isArray(this.boss.__ffAttackQueue)) this.boss.__ffAttackQueue = [];

      // Convert the original random single shot into a telegraphed, deterministic pattern.
      if (oldRefs && Array.isArray(this.bossFeathers) && this.state === 'PLAYING' && this.boss.state !== 'EXPLODING') {
        const fresh = this.bossFeathers.filter(p => !oldRefs.has(p) && !p.__ffPattern);
        if (fresh.length) {
          this.bossFeathers = this.bossFeathers.filter(p => !fresh.includes(p));
          const pattern = (this.boss.__ffPatternCounter++ % 2 === 0) ? 'STRAIGHT' : 'SPREAD';
          const delay = this.boss.enraged ? 11 : 16;
          const item = { pattern, delay, total: delay, targetY: this.bird.y };
          this.boss.__ffAttackQueue.push(item);
          this.boss.__ffTelegraph = item;
          if (this.sound && typeof this.sound.playBossTelegraph === 'function') this.sound.playBossTelegraph();
        }
      }

      for (const item of this.boss.__ffAttackQueue) item.delay--;
      const ready = this.boss.__ffAttackQueue.filter(item => item.delay <= 0);
      this.boss.__ffAttackQueue = this.boss.__ffAttackQueue.filter(item => item.delay > 0);
      ready.forEach(item => spawnPattern(this, item));
      this.boss.__ffTelegraph = this.boss.__ffAttackQueue[0] || null;

      if (!this.boss.active || this.state === 'BOSS_OUTRO' || this.state === 'FLY_AWAY') {
        if (this.sound && typeof this.sound.stopBossAmbiance === 'function') this.sound.stopBossAmbiance();
      }

      return result;
    };

    const originalDrawCrowBoss = game.drawCrowBoss.bind(game);
    game.drawCrowBoss = function(ctx, x, y, frame, isEnraged) {
      // Dash telegraph: a readable danger lane before the charge.
      if (this.boss && this.boss.type === 'crow' && this.boss.state === 'DASH_PREP' && this.state === 'PLAYING') {
        const pulse = 0.10 + (Math.sin(frame * 0.45) + 1) * 0.045;
        ctx.save();
        const lane = ctx.createLinearGradient(0, y, x, y);
        lane.addColorStop(0, 'rgba(248,113,113,0)');
        lane.addColorStop(0.55, `rgba(248,113,113,${pulse})`);
        lane.addColorStop(1, 'rgba(248,113,113,0.02)');
        ctx.fillStyle = lane;
        ctx.fillRect(0, y - 25, Math.max(0, x - 26), 50);
        ctx.strokeStyle = `rgba(254,202,202,${0.26 + pulse})`;
        ctx.setLineDash([8, 9]);
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(Math.max(0, x - 32), y); ctx.stroke();
        ctx.restore();
      }

      originalDrawCrowBoss(ctx, x, y, frame, isEnraged);

      // Shot telegraph at the beak: red = danger; Energy Orbs remain cyan/white.
      const tele = this.boss && this.boss.__ffTelegraph;
      if (tele && this.state === 'PLAYING') {
        const progress = 1 - Math.max(0, tele.delay) / Math.max(1, tele.total);
        const radius = 8 + progress * 12;
        ctx.save();
        ctx.translate(x - 48, y + 1);
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = tele.pattern === 'SPREAD' ? 'rgba(251,146,60,.82)' : 'rgba(248,113,113,.88)';
        ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(0, 0, radius, -Math.PI * 0.8, Math.PI * 0.8); ctx.stroke();
        ctx.fillStyle = tele.pattern === 'SPREAD' ? 'rgba(251,146,60,.16)' : 'rgba(248,113,113,.17)';
        ctx.beginPath(); ctx.arc(0, 0, radius * 0.58, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    };

    // More readable danger projectile: compact red feather with bright core.
    game.drawCrowFeather = function(ctx, x, y, vx, vy) {
      const angle = Math.atan2(vy, vx);
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
      ctx.shadowColor = 'rgba(239,68,68,.52)'; ctx.shadowBlur = 5;
      const grad = ctx.createLinearGradient(-10, 0, 10, 0);
      grad.addColorStop(0, '#7f1d1d'); grad.addColorStop(0.55, '#ef4444'); grad.addColorStop(1, '#fecaca');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-10, 0); ctx.quadraticCurveTo(-1, -4.6, 9, -1.2); ctx.quadraticCurveTo(1, 4.8, -10, 0); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(254,202,202,.72)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(9, -0.7); ctx.stroke();
      ctx.restore();
    };

    // Overlay a collectible identity on Energy Orbs without changing their collision or movement.
    if (typeof game.draw === 'function') {
      const originalDraw = game.draw.bind(game);
      game.draw = function() {
        const result = originalDraw();
        if (this.boss && this.boss.active && this.boss.type === 'crow' && Array.isArray(this.powerOrbs)) {
          const ctx = this.ctx;
          const pulse = 0.5 + Math.sin(this.frame * 0.16) * 0.5;
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          for (const orb of this.powerOrbs) {
            if (!orb || orb.collected) continue;
            const r = 13 + pulse * 3;
            ctx.strokeStyle = `rgba(103,232,249,${0.58 + pulse * 0.22})`;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = 'rgba(224,242,254,.86)';
            ctx.beginPath(); ctx.arc(orb.x - 3, orb.y - 3, 2.1, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,.62)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(orb.x - r - 5, orb.y); ctx.lineTo(orb.x - r + 1, orb.y);
            ctx.moveTo(orb.x + r - 1, orb.y); ctx.lineTo(orb.x + r + 5, orb.y);
            ctx.stroke();
          }
          ctx.restore();
        }
        return result;
      };
    }

    game.__bossFightCoreV1Installed = true;
    console.log('[FF-LAB] boss-fight-core-v1-installed');
    return true;
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    if (install() || attempts > 60) clearInterval(timer);
  }, 100);
  setTimeout(install, 900);
  setTimeout(install, 1800);
})();
