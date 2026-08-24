(() => {
  'use strict';
  function install() {
    const g = window.game;
    if (!g?.__w3BalanceVisualV2Installed || !g?.sound) return false;
    if (g.__w3ChallengeAudioV3Installed) return true;
    const C = (typeof CONFIG !== 'undefined' && CONFIG) ? CONFIG : {};
    const W3 = 2;
    const W = () => Number(C.CANVAS_WIDTH || 360);
    const H = () => Number(C.CANVAS_HEIGHT || 640);
    const G = () => H() - Number(C.GROUND_HEIGHT || 95);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const birdR = () => Number(C.BIRD_RADIUS || 14);
    C.W3_BOSS_HP = 8;
    const oldActivateBoss = typeof g.activateBoss === 'function' ? g.activateBoss.bind(g) : null;
    if (oldActivateBoss) {
      g.activateBoss = function(...args) {
        const r = oldActivateBoss(...args);
        if (this.activeWorld === W3 && this.boss?.type === 'thunderbird') {
          this.boss.hp = 8;
          this.boss.shield = Math.max(2, Number(this.boss.shield || 0));
          this.__w3V3ShotSerial = 0;
          this.__w3V3DodgeFrames = 0;
        }
        return r;
      };
    }
    function fightActive(x) {
      return x.activeWorld === W3 && x.boss?.active && x.boss.type === 'thunderbird' &&
        !['GAMEOVER', 'BOSS_OUTRO', 'FLY_AWAY'].includes(x.state);
    }
    function phase2Stage(x) {
      const score = Number(x.score || 0);
      return x.activeWorld === W3 && !x.boss?.active && x.state === 'PLAYING' &&
        score >= Number(C.STAGE1_END || 15) && score < Number(C.STAGE2_END || 35);
    }
    function laneYs() {
      const gy = G();
      return [
        clamp(H() * .21, 86, gy - 205),
        clamp(H() * .45, 165, gy - 125),
        clamp(gy - 64, 260, gy - 46)
      ];
    }
    function stagePressure(x) {
      if (!phase2Stage(x)) {
        x.__w3PressureV3 = null;
        return;
      }
      const s = x.__w3PressureV3 || (x.__w3PressureV3 = { timer: 72, serial: 0 });
      s.timer--;
      if (s.timer > 0) return;
      const liveBats = (x.electricBats || []).filter(b => b.__w3PressureV3 && b.x > -35).length;
      const liveTeslas = (x.miniTeslas || []).filter(t => t.__w3PressureV3 && t.x > -35 && t.__zap !== 'done').length;
      const totalStageDanger = (x.electricBats || []).filter(b => b.x > -35).length +
        (x.miniTeslas || []).filter(t => t.x > -35).length +
        (x.gravityGates || []).filter(q => q.x > -35).length;
      if (totalStageDanger >= 4) {
        s.timer = 56;
        return;
      }
      const lanes = laneYs();
      const pattern = s.serial % 4;
      if ((pattern === 0 || pattern === 2) && liveBats < 2) {
        const count = pattern === 2 ? 2 : 1;
        for (let i = 0; i < count && liveBats + i < 2; i++) {
          const lane = (s.serial + i * 2) % lanes.length;
          x.electricBats.push({
            x: W() + 38 + i * 44,
            y: lanes[lane],
            vx: -(4.15 + (s.serial % 3) * .16 + i * .12),
            timer: 0,
            __w3Director: true,
            __w3PressureV3: true
          });
        }
        x.sound?.playVoltSwarmWarn?.();
        s.timer = pattern === 2 ? 164 : 184;
      } else if (liveTeslas < 1) {
        const lane = (s.serial + 1) % lanes.length;
        x.miniTeslas.push({
          x: W() + 46,
          y: lanes[lane] + 34,
          timer: 0,
          vx: -Number(C.W3_SPEED || 2.62),
          pillar: null,
          __w3Director: true,
          __w3PressureV3: true
        });
        s.timer = 176;
      } else {
        s.timer = 86;
      }
      s.serial++;
    }
    function upgradeArcVolley(x) {
      if (!fightActive(x)) return;
      const legacy = (x.bossFeathers || []).filter(p => p.__w3Arc && !p.__w3V3Fan);
      if (!legacy.length) return;
      x.bossFeathers = (x.bossFeathers || []).filter(p => !legacy.includes(p));
      const top = clamp(92, 72, G() - 260);
      const bottom = G() - 52;
      const step = (bottom - top) / 4;
      for (let i = 0; i < 5; i++) {
        x.bossFeathers.push({
          x: x.boss.x - 30 + Math.abs(2 - i) * 4,
          y: x.boss.y + (i - 2) * 8,
          vx: -(3.82 + (i % 2) * .24 + (x.boss.enraged ? .38 : 0)),
          targetY: top + step * i,
          age: 0,
          phase: i * 1.19,
          __w3Arc: true,
          __w3V3Fan: true
        });
      }
      x.sound?.playVoltFiveShot?.();
    }
    function beginSonic(x) {
      if (!fightActive(x) || x.__w3SonicV3?.active) return;
      x.__w3SonicV3 = {
        active: true,
        phase: 'warn',
        timer: 0,
        originX: x.boss.x - 8,
        originY: clamp(x.bird.y, 100, G() - 70),
        waves: []
      };
      x.sound?.playVoltSonicWarn?.();
    }
    function fireSonic(x, s) {
      s.phase = 'fire';
      s.timer = 0;
      s.originX = x.boss.x - 10;
      s.originY = clamp(s.originY, 100, G() - 70);
      const speed = x.boss.enraged ? 6.4 : 5.8;
      s.waves = [0, 13, 26].map((delay, i) => ({
        radius: 22,
        delay,
        speed: speed + i * .12,
        dead: false,
        hit: false
      }));
      x.sound?.playVoltSonic?.();
      x.screenShake = Math.max(x.screenShake || 0, 5);
    }
    function arcHitsBird(x, s, wave) {
      const dx = x.bird.x - s.originX;
      const dy = x.bird.y - s.originY;
      if (dx >= 8) return false;
      const radial = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const leftArc = Math.abs(Math.abs(angle) - Math.PI) < Math.PI * .42;
      return leftArc && Math.abs(radial - wave.radius) < birdR() + 5;
    }
    function updateSonic(x) {
      const s = x.__w3SonicV3;
      if (!s?.active) return;
      if (!fightActive(x) || x.state !== 'PLAYING') {
        x.__w3SonicV3 = null;
        return;
      }
      s.timer++;
      if (s.phase === 'warn') {
        s.originX += ((x.boss.x - 10) - s.originX) * .18;
        if (s.timer >= (x.boss.enraged ? 25 : 31)) fireSonic(x, s);
        return;
      }
      let live = 0;
      for (const wave of s.waves) {
        if (wave.dead) continue;
        if (wave.delay > 0) {
          wave.delay--;
          live++;
          continue;
        }
        wave.radius += wave.speed;
        if (!wave.hit && x.invincibleTimer <= 0 && arcHitsBird(x, s, wave)) {
          wave.hit = true;
          wave.dead = true;
          x.gameOver(false);
          continue;
        }
        if (wave.radius > W() + 115) wave.dead = true;
        else live++;
      }
      if (!live) x.__w3SonicV3 = null;
    }
    const sound = g.sound;
    function unlockAudio() {
      try {
        sound.init?.();
        if (sound.ctx?.state === 'suspended') sound.ctx.resume?.();
        if (g.activeWorld === W3 && sound.ctx && !sound.muted && sound.sfxEnabled !== false) {
          const stage = g.boss?.active ? 3 : (Number(g.score || 0) >= Number(C.STAGE1_END || 15) ? 2 : 1);
          sound.startStormAmbiance?.(stage);
        }
      } catch (_) {}
    }
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    const oldStorm = typeof sound.startStormAmbiance === 'function' ? sound.startStormAmbiance.bind(sound) : null;
    if (oldStorm) {
      sound.startStormAmbiance = function(stage = 1) {
        unlockAudioContextOnly();
        oldStorm(stage);
        try {
          if (this.ambientNodes?.kind === 'storm' && this.ctx) {
            const target = [0, .09, .12, .15][Math.max(1, Math.min(3, Number(stage) || 1))];
            const now = this.ctx.currentTime;
            this.ambientNodes.mainGain.gain.cancelScheduledValues(now);
            this.ambientNodes.mainGain.gain.linearRampToValueAtTime(target, now + .35);
          }
        } catch (_) {}
      };
    }
    function unlockAudioContextOnly() {
      try {
        sound.init?.();
        if (sound.ctx?.state === 'suspended') sound.ctx.resume?.();
      } catch (_) {}
    }
    function tone(type, a, b, dur, vol, delay = 0) {
      unlockAudioContextOnly();
      if (!sound.ctx || sound.muted || sound.sfxEnabled === false) return;
      try {
        const ctx = sound.ctx, now = ctx.currentTime + delay;
        const o = ctx.createOscillator(), gain = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(Math.max(24, a), now);
        o.frequency.exponentialRampToValueAtTime(Math.max(24, b), now + dur);
        gain.gain.setValueAtTime(Math.max(.001, vol), now);
        gain.gain.exponentialRampToValueAtTime(.001, now + dur);
        o.connect(gain); gain.connect(ctx.destination);
        o.start(now); o.stop(now + dur + .03);
      } catch (_) {}
    }
    sound.playVoltCharge = function() {
      tone('sine', 390, 1480, .32, .13);
      tone('triangle', 780, 1760, .23, .07, .07);
    };
    sound.playVoltBurst = function() {
      tone('sawtooth', 1450, 210, .25, .17);
      tone('square', 760, 160, .18, .08, .02);
    };
    sound.playVoltFiveShot = function() {
      tone('square', 980, 380, .24, .14);
      tone('triangle', 1500, 520, .20, .10, .04);
    };
    sound.playVoltDashWarn = function() {
      tone('square', 350, 650, .12, .09);
      tone('square', 430, 820, .12, .09, .14);
    };
    sound.playVoltDash = function() {
      tone('sawtooth', 320, 55, .34, .18);
    };
    sound.playVoltSwarmWarn = function() {
      tone('triangle', 700, 1280, .19, .10);
      tone('triangle', 840, 1450, .18, .08, .11);
    };
    sound.playVoltSwarm = function() {
      tone('square', 590, 210, .24, .13);
    };
    sound.playVoltSonicWarn = function() {
      tone('sine', 250, 720, .28, .12);
      tone('sine', 330, 950, .28, .09, .11);
    };
    sound.playVoltSonic = function() {
      [0, .13, .26].forEach((d, i) => tone('sine', 520 - i * 65, 105 - i * 10, .38, .18 - i * .02, d));
    };
    sound.playVoltShieldBreak = function() {
      tone('sawtooth', 1750, 90, .42, .22);
      sound.playStormThunder?.(.78);
    };
    sound.playVoltRage = function() {
      tone('sawtooth', 390, 52, .52, .23);
      tone('triangle', 840, 120, .42, .13, .08);
      sound.playStormThunder?.(.95);
    };
    sound.playVoltDefeat = function() {
      tone('sawtooth', 330, 38, .68, .24);
      tone('triangle', 1080, 90, .56, .14, .10);
      sound.playStormThunder?.(.98);
    };
    const oldUpdate = typeof g.update === 'function' ? g.update.bind(g) : null;
    if (oldUpdate) {
      g.update = function() {
        const beforeState = this.boss?.state;
        const wasW3Boss = fightActive(this);
        if (wasW3Boss && this.boss.state === 'IDLE') {
          const approaching = (this.heroProjectiles || []).find(p => p?.active && !p.__w3V3DodgeChecked && p.x > this.boss.x - 92);
          if (approaching) {
            approaching.__w3V3DodgeChecked = true;
            this.__w3V3ShotSerial = Number(this.__w3V3ShotSerial || 0) + 1;
            if (this.__w3V3ShotSerial % 3 === 0) {
              const dir = this.boss.y < H() * .47 ? 1 : -1;
              this.boss.y = clamp(this.boss.y + dir * 62, 86, G() - 82);
              this.__w3V3DodgeFrames = 3;
              this.sound?.playVoltDashWarn?.();
            }
          }
          if (this.__w3V3DodgeFrames > 0) {
            this.boss.state = 'DODGING';
            this.__w3V3DodgeFrames--;
          }
        }
        const result = oldUpdate();
        if (phase2Stage(this)) stagePressure(this);
        else this.__w3PressureV3 = null;
        if (fightActive(this)) {
          if (this.boss.state === 'IDLE' && !this.__w3SonicV3?.active) {
            this.boss.timer += this.boss.enraged ? .30 : .20;
          }
          upgradeArcVolley(this);
          if (beforeState === 'W3_SWARM_RECOVER' && this.boss.state === 'IDLE' && !this.__w3SonicV3?.active) {
            beginSonic(this);
          }
          updateSonic(this);
        } else if (wasW3Boss || this.__w3SonicV3) {
          this.__w3SonicV3 = null;
        }
        return result;
      };
    }
    function drawBolt(ctx, ax, ay, bx, by, seed = 0) {
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      const n = 7;
      for (let i = 1; i < n; i++) {
        const t = i / n;
        ctx.lineTo(ax + (bx - ax) * t, ay + (by - ay) * t + Math.sin(seed + i * 2.3) * 4);
      }
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    function drawWarning(x, ctx, warning, realState) {
      if (!warning || !fightActive(x) || x.state !== 'PLAYING') return;
      const b = x.boss;
      const pulse = .55 + .45 * Math.sin(x.frame * .34);
      ctx.save();
      ctx.lineCap = 'round';
      if (warning.type === 'dash' && realState === 'DASH_PREP') {
        ctx.strokeStyle = `rgba(251,146,60,${.55 + pulse * .35})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(b.x, b.y, 36 + pulse * 8, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = `rgba(253,186,116,${.30 + pulse * .30})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const yy = b.y - 18 + i * 18;
          ctx.beginPath(); ctx.moveTo(b.x - 42, yy); ctx.lineTo(b.x - 86 - i * 6, yy); ctx.stroke();
        }
      } else if (warning.type === 'arc' && realState === 'W3_ARC_PREP') {
        ctx.strokeStyle = `rgba(125,211,252,${.48 + pulse * .38})`;
        ctx.lineWidth = 2.4;
        for (let i = -2; i <= 2; i++) {
          drawBolt(ctx, b.x - 24, b.y, b.x - 64, b.y + i * 15, x.frame * .12 + i);
        }
      } else if (warning.type === 'swarm' && realState === 'W3_SWARM_PREP') {
        ctx.strokeStyle = `rgba(192,132,252,${.50 + pulse * .36})`;
        ctx.lineWidth = 2.5;
        for (const y of (b.__w3SwarmTargets || [])) {
          ctx.beginPath(); ctx.arc(b.x - 42, y, 9 + pulse * 5, 0, Math.PI * 2); ctx.stroke();
        }
      }
      ctx.restore();
    }
    function drawSonic(x, ctx) {
      const s = x.__w3SonicV3;
      if (!s?.active || !fightActive(x)) return;
      ctx.save();
      ctx.lineCap = 'round';
      if (s.phase === 'warn') {
        const p = .5 + .5 * Math.sin(x.frame * .42);
        ctx.strokeStyle = `rgba(196,181,253,${.48 + p * .36})`;
        for (let i = 0; i < 3; i++) {
          ctx.lineWidth = 2.4 - i * .35;
          ctx.beginPath();
          ctx.arc(x.boss.x - 6, s.originY, 18 + i * 11 + p * 4, Math.PI * .65, Math.PI * 1.35);
          ctx.stroke();
        }
      } else {
        for (let i = 0; i < s.waves.length; i++) {
          const wave = s.waves[i];
          if (wave.dead || wave.delay > 0) continue;
          const a = clamp(1 - wave.radius / (W() + 120), .18, .9);
          ctx.shadowColor = '#c4b5fd';
          ctx.shadowBlur = 8;
          ctx.strokeStyle = `rgba(224,231,255,${a})`;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(s.originX, s.originY, wave.radius, Math.PI * .58, Math.PI * 1.42);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = `rgba(167,139,250,${a * .9})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(s.originX, s.originY, wave.radius + 5, Math.PI * .58, Math.PI * 1.42);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    const oldDraw = typeof g.draw === 'function' ? g.draw.bind(g) : null;
    if (oldDraw) {
      g.draw = function() {
        const boss = this.boss;
        const s = this.__w3BossFightV1;
        const realState = boss?.state;
        const warning = s?.warning || null;
        const suppress = this.activeWorld === W3 && boss?.active && boss.type === 'thunderbird';
        if (suppress) {
          if (s) s.warning = null;
          if (boss.state === 'DASH_PREP') boss.state = 'W3_DASH_VISUAL';
        }
        let result;
        try {
          result = oldDraw();
        } finally {
          if (suppress) {
            boss.state = realState;
            if (s) s.warning = warning;
          }
        }
        if (suppress && this.ctx) {
          drawWarning(this, this.ctx, warning, realState);
          drawSonic(this, this.ctx);
        }
        return result;
      };
    }
    setTimeout(() => {
      if (g.activeWorld === W3) unlockAudio();
    }, 250);
    g.__w3ChallengeAudioV3Installed = true;
    console.log('[FF-LAB] w3-challenge-audio-v3-installed');
    return true;
  }
  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 140) clearInterval(timer);
  }, 80);
  setTimeout(install, 1500);
})();
