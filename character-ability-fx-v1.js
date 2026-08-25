(() => {
  'use strict';

  if (window.__FF_CHARACTER_ABILITY_FX_V1__) return;

  const FX = {
    pigeonUntil: 0,
    phoenixUntil: 0,
    cyberUntil: 0,
    ghostUntil: 0,
    kingUntil: 0,
    eagleUntil: 0,
    eagleActive: false,
    lastPhoenixBurst: 0,
    lastEagleBurst: 0
  };

  const COLORS = {
    pigeon: ['#ffffff', '#cbd5e1'],
    falcon: ['#fbbf24', '#ef4444'],
    phoenix: ['#fbbf24', '#f97316'],
    cyber: ['#67e8f9', '#22d3ee'],
    ghost: ['#e0e7ff', '#a78bfa'],
    king: ['#fde68a', '#fbbf24'],
    eagle: ['#d9f99d', '#84cc16']
  };

  function now() {
    return performance.now();
  }

  function addParticle(game, color, opts = {}) {
    if (!game || !Array.isArray(game.particles) || !game.bird) return;
    const angle = opts.angle ?? Math.random() * Math.PI * 2;
    const speed = opts.speed ?? (1.3 + Math.random() * 2.8);
    const radius = opts.radius ?? (3 + Math.random() * 7);
    game.particles.push({
      x: game.bird.x + Math.cos(angle) * radius,
      y: game.bird.y + Math.sin(angle) * radius,
      vx: Math.cos(angle) * speed + (opts.vx || 0),
      vy: Math.sin(angle) * speed + (opts.vy || 0),
      size: opts.size ?? (1.2 + Math.random() * 1.8),
      color,
      life: opts.life ?? (0.32 + Math.random() * 0.26)
    });
  }

  function burst(game, key, count, opts = {}) {
    const palette = COLORS[key] || COLORS.pigeon;
    for (let i = 0; i < count; i++) {
      addParticle(game, palette[i % palette.length], opts);
    }
  }

  function trigger(key, duration) {
    FX[`${key}Until`] = Math.max(FX[`${key}Until`] || 0, now() + duration);
  }

  function drawRing(ctx, radius, color, alpha, width = 1.5, dash = null) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawPigeonFx(ctx, t, scale) {
    const remaining = Math.max(0, FX.pigeonUntil - t);
    if (!remaining) return;
    const p = 1 - remaining / 460;
    const alpha = Math.max(0, 0.72 * (1 - p));
    drawRing(ctx, (19 + p * 14) * scale, '#ffffff', alpha, 1.8 * scale);
    drawRing(ctx, (14 + p * 9) * scale, '#cbd5e1', alpha * 0.65, 1.0 * scale, [3 * scale, 4 * scale]);
  }

  function drawFalconFeverFx(ctx, t, scale) {
    const pulse = 0.5 + Math.sin(t * 0.012) * 0.5;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawRing(ctx, (23 + pulse * 2.5) * scale, '#f59e0b', 0.20 + pulse * 0.09, 1.5 * scale);
    drawRing(ctx, (27 + pulse * 3.0) * scale, '#ef4444', 0.12 + pulse * 0.07, 1.0 * scale, [5 * scale, 7 * scale]);
    ctx.restore();
  }

  function drawPhoenixFx(ctx, t, scale) {
    const remaining = Math.max(0, FX.phoenixUntil - t);
    if (!remaining) return;
    const p = 1 - remaining / 360;
    const alpha = Math.max(0, 0.62 * (1 - p));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawRing(ctx, (18 + p * 7) * scale, '#fbbf24', alpha, 1.6 * scale, [3 * scale, 3 * scale]);
    ctx.strokeStyle = '#f97316';
    ctx.globalAlpha = alpha * 0.75;
    ctx.lineWidth = 1.2 * scale;
    for (let i = 0; i < 3; i++) {
      const a = t * 0.010 + i * (Math.PI * 2 / 3);
      const r = 20 * scale;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.lineTo(Math.cos(a) * (r + 5 * scale), Math.sin(a) * (r + 5 * scale));
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCyberFx(ctx, t, scale) {
    const remaining = Math.max(0, FX.cyberUntil - t);
    if (!remaining) return;
    const p = 1 - remaining / 760;
    const alpha = Math.max(0, 0.72 * (1 - p));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawRing(ctx, (22 + p * 8) * scale, '#67e8f9', alpha, 2.0 * scale);
    drawRing(ctx, (25 + p * 11) * scale, '#22d3ee', alpha * 0.48, 1.2 * scale, [6 * scale, 4 * scale]);
    ctx.restore();
  }

  function drawGhostFx(ctx, t, scale) {
    const remaining = Math.max(0, FX.ghostUntil - t);
    if (!remaining) return;
    const p = 1 - remaining / 1050;
    const alpha = Math.max(0, 0.64 * (1 - p));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const r = (18 + i * 5 + p * 7) * scale;
      drawRing(ctx, r, i === 1 ? '#a78bfa' : '#e0e7ff', alpha * (0.52 - i * 0.09), 1.2 * scale, [4 * scale, 6 * scale]);
    }
    ctx.restore();
  }

  function drawKingFx(ctx, t, scale) {
    const remaining = Math.max(0, FX.kingUntil - t);
    if (!remaining) return;
    const p = 1 - remaining / 700;
    const alpha = Math.max(0, 0.75 * (1 - p));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.4 * scale;
    ctx.globalAlpha = alpha;
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 + t * 0.002;
      const r1 = (18 + p * 4) * scale;
      const r2 = (25 + p * 10) * scale;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
      ctx.stroke();
    }
    drawRing(ctx, (20 + p * 10) * scale, '#fde68a', alpha * 0.55, 1.2 * scale);
    ctx.restore();
  }

  function drawEagleFx(ctx, t, scale, activeEnvironment) {
    const remaining = Math.max(0, FX.eagleUntil - t);
    if (!activeEnvironment && !remaining) return;
    const pulse = 0.5 + Math.sin(t * 0.009) * 0.5;
    const alpha = activeEnvironment ? (0.20 + pulse * 0.10) : Math.min(0.22, remaining / 700 * 0.22);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawRing(ctx, (22 + pulse * 1.5) * scale, '#a3e635', alpha, 1.3 * scale, [4 * scale, 5 * scale]);
    ctx.strokeStyle = '#d9f99d';
    ctx.lineWidth = 1.0 * scale;
    ctx.globalAlpha = alpha * 0.75;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 18 * scale, -8 * scale);
      ctx.lineTo(side * 23 * scale, 0);
      ctx.lineTo(side * 18 * scale, 8 * scale);
      ctx.stroke();
    }
    ctx.restore();
  }

  function installDrawFx() {
    if (typeof window.drawBirdSkin !== 'function') return false;
    if (window.drawBirdSkin.__ffAbilityFxV1) return true;

    const baseDraw = window.drawBirdSkin;
    function wrappedDraw(ctx, skinKey, x, y, rotation, wingCycle, scale = 1, inFever = false) {
      const t = now();
      const game = window.game;
      const isPhase = skinKey === 'ghost' && FX.ghostUntil > t;

      if (isPhase) {
        ctx.save();
        ctx.globalAlpha *= 0.38 + Math.sin(t * 0.025) * 0.10;
        baseDraw(ctx, skinKey, x, y, rotation, wingCycle, scale, inFever);
        ctx.restore();
      } else {
        baseDraw(ctx, skinKey, x, y, rotation, wingCycle, scale, inFever);
      }

      ctx.save();
      ctx.translate(x, y);
      if (skinKey === 'pigeon') drawPigeonFx(ctx, t, scale);
      if (skinKey === 'falcon' && inFever) drawFalconFeverFx(ctx, t, scale);
      if (skinKey === 'phoenix') drawPhoenixFx(ctx, t, scale);
      if (skinKey === 'cyber') drawCyberFx(ctx, t, scale);
      if (skinKey === 'ghost') drawGhostFx(ctx, t, scale);
      if (skinKey === 'king') drawKingFx(ctx, t, scale);
      if (skinKey === 'eagle') {
        const activeEnvironment = !!(game && game.activeSkin === 'eagle' && (game.gravityFlipped || Math.abs(Number(game.windForce) || 0) > 0.001));
        drawEagleFx(ctx, t, scale, activeEnvironment);
      }
      ctx.restore();
    }
    wrappedDraw.__ffAbilityFxV1 = true;
    wrappedDraw.__ffAbilityFxBase = baseDraw;
    window.drawBirdSkin = wrappedDraw;
    return true;
  }

  function installGameFx() {
    const game = window.game;
    if (!game || typeof game.update !== 'function') return false;
    if (game.__ffAbilityFxV1Installed) return true;

    const baseUpdate = game.update.bind(game);
    game.update = function(...args) {
      const skinBefore = this.activeSkin;
      const scoreBefore = Number(this.score) || 0;
      const feverBefore = Number(this.fever) || 0;
      const kingBefore = Number(this.kingCoinsCollected) || 0;
      const gravityBefore = !!this.gravityFlipped;
      const windBefore = Number(this.windForce) || 0;

      const result = baseUpdate(...args);
      const t = now();

      if (skinBefore === 'pigeon' && (Number(this.score) || 0) - scoreBefore >= 2) {
        trigger('pigeon', 460);
        burst(this, 'pigeon', 7, { speed: 2.2, life: 0.34, size: 1.4 });
      }

      if (skinBefore === 'phoenix' && !this.feverActive && (Number(this.fever) || 0) > feverBefore && t - FX.lastPhoenixBurst > 90) {
        FX.lastPhoenixBurst = t;
        trigger('phoenix', 360);
        burst(this, 'phoenix', 5, { speed: 2.0, vy: -0.8, life: 0.30, size: 1.5 });
      }

      if (skinBefore === 'king') {
        const kingAfter = Number(this.kingCoinsCollected) || 0;
        if (Math.floor(kingAfter / 3) > Math.floor(kingBefore / 3)) {
          trigger('king', 700);
          burst(this, 'king', 10, { speed: 2.6, life: 0.48, size: 1.7 });
        }
      }

      if (skinBefore === 'eagle') {
        const windAfter = Number(this.windForce) || 0;
        const envNow = !!this.gravityFlipped || Math.abs(windAfter) > 0.001;
        const envBefore = gravityBefore || Math.abs(windBefore) > 0.001;
        if (envNow && (!envBefore || t - FX.lastEagleBurst > 650)) {
          FX.lastEagleBurst = t;
          FX.eagleActive = true;
          trigger('eagle', 700);
          burst(this, 'eagle', 4, { speed: 1.2, life: 0.38, size: 1.3 });
        } else if (!envNow) {
          FX.eagleActive = false;
        }
      }

      return result;
    };

    if (typeof game.gameOver === 'function') {
      const baseGameOver = game.gameOver.bind(game);
      game.gameOver = function(...args) {
        const skin = this.activeSkin;
        const cyberBefore = !!this.cyberShieldUsed;
        const ghostBefore = !!this.ghostPhaseUsed;
        const result = baseGameOver(...args);
        if (skin === 'cyber' && !cyberBefore && this.cyberShieldUsed) {
          trigger('cyber', 760);
          burst(this, 'cyber', 12, { speed: 3.0, life: 0.50, size: 1.8 });
        }
        if (skin === 'ghost' && !ghostBefore && this.ghostPhaseUsed) {
          trigger('ghost', 1050);
          burst(this, 'ghost', 10, { speed: 2.0, life: 0.62, size: 1.6 });
        }
        return result;
      };
    }

    game.__ffAbilityFxV1Installed = true;
    return true;
  }

  function install() {
    if (!window.game || !window.__FF_CHARACTER_ABILITIES_V2__) return false;
    const gameOk = installGameFx();
    const drawOk = installDrawFx();
    if (!gameOk || !drawOk) return false;

    window.__FF_CHARACTER_ABILITY_FX_V1__ = {
      version: 'character-ability-fx-v1',
      state: FX
    };
    return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 160) clearInterval(timer);
  }, 50);
})();