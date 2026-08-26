(() => {
  'use strict';

  if (window.__FF_W1_CURSED_WOODS_BACKGROUND_V3__) return;

  const TWO_PI = Math.PI * 2;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const mod = (v, n) => ((v % n) + n) % n;
  const mix = (a, b, t) => Math.round(a + (b - a) * t);
  const rgb = (a, b, t) => `rgb(${mix(a[0], b[0], t)},${mix(a[1], b[1], t)},${mix(a[2], b[2], t)})`;

  function hash01(n) {
    const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function worldTarget(game) {
    const cfg = window.CONFIG || {};
    const stage1End = Number(cfg.STAGE1_END) || 15;
    const stage2End = Number(cfg.STAGE2_END) || 35;
    const score = Number(game.score) || 0;
    const bossScene = !!game.boss?.active || ['BOSS_WARNING', 'BOSS_INTRO', 'BOSS_OUTRO', 'FLY_AWAY'].includes(game.state);

    if (bossScene) return 1;
    if (game.state === 'STORY') return 0.24;
    if (score >= stage1End) {
      const deep = clamp((score - stage1End) / Math.max(1, stage2End - stage1End), 0, 1);
      return 0.58 + deep * 0.27;
    }
    return 0.28 + clamp(score / stage1End, 0, 1) * 0.20;
  }

  function drawSky(ctx, w, gY, frame, curse) {
    const top = rgb([12, 28, 52], [11, 7, 27], curse);
    const bottom = rgb([38, 54, 74], [54, 20, 62], curse);
    const grad = ctx.createLinearGradient(0, 0, 0, gY);
    grad.addColorStop(0, top);
    grad.addColorStop(0.62, bottom);
    grad.addColorStop(1, rgb([25, 38, 48], [37, 20, 42], curse));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, gY);

    ctx.save();
    for (let i = 0; i < 24; i++) {
      const sx = hash01(i * 8.13) * w;
      const sy = 28 + hash01(i * 13.71) * Math.min(260, gY * 0.48);
      const twinkle = 0.58 + Math.sin(frame * 0.025 + i * 1.7) * 0.18;
      ctx.fillStyle = `rgba(216,220,255,${(0.08 + curse * 0.12) * twinkle})`;
      ctx.fillRect(sx, sy, i % 5 === 0 ? 1.5 : 1, i % 5 === 0 ? 1.5 : 1);
    }
    ctx.restore();

    const moonX = 72;
    const moonY = 106;
    const moonR = 25;
    ctx.save();
    const halo = ctx.createRadialGradient(moonX, moonY, moonR * 0.4, moonX, moonY, moonR * 2.4);
    halo.addColorStop(0, `rgba(207,218,255,${0.18 + (1 - curse) * 0.10})`);
    halo.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(moonX, moonY, moonR * 2.4, 0, TWO_PI); ctx.fill();

    ctx.fillStyle = rgb([214, 225, 244], [201, 189, 230], curse * 0.65);
    ctx.beginPath(); ctx.arc(moonX, moonY, moonR, 0, TWO_PI); ctx.fill();
    ctx.fillStyle = `rgba(103,112,151,${0.13 + curse * 0.06})`;
    ctx.beginPath(); ctx.arc(moonX - 7, moonY - 7, 5.2, 0, TWO_PI); ctx.fill();
    ctx.beginPath(); ctx.arc(moonX + 8, moonY + 5, 4.4, 0, TWO_PI); ctx.fill();
    ctx.restore();

    const spacing = 170;
    const travel = frame * 0.075;
    const offset = mod(travel, spacing);
    const base = Math.floor(travel / spacing);
    ctx.save();
    for (let i = -2; i <= Math.ceil(w / spacing) + 2; i++) {
      const idx = base + i;
      const x = i * spacing - offset;
      const y = 80 + hash01(idx * 2.93) * 145;
      ctx.fillStyle = `rgba(45,52,82,${0.10 + curse * 0.07})`;
      ctx.beginPath();
      ctx.ellipse(x + 35, y, 42, 8, 0, 0, TWO_PI);
      ctx.ellipse(x + 70, y + 3, 34, 7, 0, 0, TWO_PI);
      ctx.ellipse(x + 97, y - 1, 24, 6, 0, 0, TWO_PI);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFarRuins(ctx, w, gY, frame, curse, bossBlend) {
    const spacing = 230;
    const travel = frame * 0.065;
    const offset = mod(travel, spacing);
    const base = Math.floor(travel / spacing);

    ctx.save();
    ctx.fillStyle = `rgba(${mix(26, 20, curse)},${mix(35, 17, curse)},${mix(49, 38, curse)},${0.34 + curse * 0.12})`;
    for (let i = -2; i <= Math.ceil(w / spacing) + 2; i++) {
      const idx = base + i;
      const x = i * spacing - offset;
      const r = hash01(idx * 1.37);
      const baseY = gY - 78 - r * 20;
      const towerH = 78 + r * 34;

      ctx.fillRect(x + 22, baseY - towerH, 14, towerH);
      ctx.fillRect(x + 102, baseY - towerH * 0.82, 13, towerH * 0.82);
      ctx.fillRect(x + 18, baseY - towerH - 5, 24, 6);
      ctx.fillRect(x + 98, baseY - towerH * 0.82 - 5, 22, 6);
      ctx.beginPath();
      ctx.moveTo(x + 36, baseY - towerH + 15);
      ctx.quadraticCurveTo(x + 69, baseY - towerH - 10, x + 102, baseY - towerH + 15);
      ctx.lineTo(x + 102, baseY - towerH + 25);
      ctx.quadraticCurveTo(x + 69, baseY - towerH + 4, x + 36, baseY - towerH + 25);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    if (bossBlend > 0.01) {
      const cx = w * 0.72;
      const cy = gY - 142;
      ctx.save();
      ctx.globalAlpha = bossBlend;
      ctx.fillStyle = 'rgba(14,10,25,.72)';
      ctx.fillRect(cx - 27, cy + 16, 54, 98);
      ctx.fillRect(cx - 38, cy + 46, 18, 68);
      ctx.fillRect(cx + 20, cy + 46, 18, 68);
      ctx.beginPath();
      ctx.moveTo(cx - 33, cy + 18); ctx.lineTo(cx, cy - 22); ctx.lineTo(cx + 33, cy + 18); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 43, cy + 46); ctx.lineTo(cx - 29, cy + 20); ctx.lineTo(cx - 15, cy + 46); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 15, cy + 46); ctx.lineTo(cx + 29, cy + 20); ctx.lineTo(cx + 43, cy + 46); ctx.closePath(); ctx.fill();

      const glow = 0.34 + Math.sin(frame * 0.08) * 0.08;
      ctx.fillStyle = `rgba(168,85,247,${glow})`;
      ctx.fillRect(cx - 3, cy + 23, 6, 16);
      ctx.fillRect(cx - 29, cy + 57, 4, 12);
      ctx.fillRect(cx + 25, cy + 57, 4, 12);
      ctx.restore();
    }
  }

  function drawFarForest(ctx, w, gY, frame, curse) {
    const spacing = 58;
    const travel = frame * 0.16;
    const offset = mod(travel, spacing);
    const base = Math.floor(travel / spacing);

    ctx.save();
    for (let i = -2; i <= Math.ceil(w / spacing) + 2; i++) {
      const idx = base + i;
      const x = i * spacing - offset;
      const r = hash01(idx * 4.11);
      const h = 104 + r * 76;
      const y = gY - h;
      ctx.fillStyle = `rgba(${mix(20, 14, curse)},${mix(30, 15, curse)},${mix(39, 30, curse)},${0.62 + curse * 0.12})`;
      ctx.beginPath();
      ctx.moveTo(x + 20, gY);
      ctx.lineTo(x + 23, y + 28);
      ctx.lineTo(x + 14, y + 41);
      ctx.lineTo(x + 22, y + 34);
      ctx.lineTo(x + 25, y);
      ctx.lineTo(x + 29, y + 34);
      ctx.lineTo(x + 40, y + 22);
      ctx.lineTo(x + 31, y + 41);
      ctx.lineTo(x + 32, gY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(15,17,26,${0.50 + curse * 0.20})`;
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x + 25, y + 28); ctx.lineTo(x + 7, y + 10); ctx.lineTo(x + 1, y - 3);
      ctx.moveTo(x + 28, y + 25); ctx.lineTo(x + 43, y + 8); ctx.lineTo(x + 50, y - 5);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawMidTrees(ctx, w, gY, frame, curse) {
    const spacing = 118;
    const travel = frame * 0.34;
    const offset = mod(travel, spacing);
    const base = Math.floor(travel / spacing);

    ctx.save();
    for (let i = -2; i <= Math.ceil(w / spacing) + 2; i++) {
      const idx = base + i;
      const x = i * spacing - offset;
      const r = hash01(idx * 6.17);
      const h = 108 + r * 62;
      const top = gY - h;
      const trunk = rgb([25, 26, 31], [24, 14, 27], curse);

      ctx.fillStyle = trunk;
      ctx.beginPath();
      ctx.moveTo(x + 25, gY);
      ctx.quadraticCurveTo(x + 15, gY - h * 0.42, x + 24, top + 34);
      ctx.lineTo(x + 34, top + 25);
      ctx.quadraticCurveTo(x + 39, gY - h * 0.45, x + 43, gY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = trunk;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x + 28, top + 45); ctx.lineTo(x + 7, top + 24); ctx.lineTo(x - 2, top + 7);
      ctx.moveTo(x + 33, top + 38); ctx.lineTo(x + 55, top + 20); ctx.lineTo(x + 65, top + 2);
      if (curse > 0.52) {
        ctx.moveTo(x + 31, top + 58); ctx.lineTo(x + 58, top + 51); ctx.lineTo(x + 71, top + 37);
      }
      ctx.stroke();

      if (curse > 0.54 && idx % 3 === 0) {
        const alpha = (curse - 0.54) * 0.72;
        ctx.save();
        ctx.shadowColor = 'rgba(168,85,247,.55)';
        ctx.shadowBlur = 5;
        ctx.strokeStyle = `rgba(168,85,247,${alpha})`;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(x + 28, gY - h * .46);
        ctx.lineTo(x + 34, gY - h * .53);
        ctx.lineTo(x + 39, gY - h * .46);
        ctx.lineTo(x + 34, gY - h * .39);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  function drawFog(ctx, w, gY, frame, curse) {
    const spacing = 150;
    const travel = frame * 0.21;
    const offset = mod(travel, spacing);
    const base = Math.floor(travel / spacing);

    ctx.save();
    for (let i = -2; i <= Math.ceil(w / spacing) + 2; i++) {
      const idx = base + i;
      const x = i * spacing - offset;
      const y = gY - 72 + Math.sin(frame * 0.018 + idx * 1.2) * 10;
      const fog = ctx.createRadialGradient(x + 72, y, 10, x + 72, y, 94);
      fog.addColorStop(0, `rgba(154,134,180,${0.055 + curse * 0.06})`);
      fog.addColorStop(1, 'rgba(97,72,119,0)');
      ctx.fillStyle = fog;
      ctx.fillRect(x - 20, y - 52, 200, 104);
    }

    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const x = mod(i * 91 - frame * (0.34 + i * 0.015) + 70, w + 150) - 75;
      const y = 195 + mod(i * 69 + frame * 0.17, Math.max(190, gY - 230));
      ctx.strokeStyle = `rgba(201,187,216,${0.035 + curse * 0.022})`;
      ctx.lineWidth = 1.5 + (i % 2) * 0.6;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 42 + (i % 3) * 14, y); ctx.stroke();
    }
    ctx.restore();
  }

  function drawVignette(ctx, w, gY, curse) {
    const vignette = ctx.createRadialGradient(w * 0.5, gY * 0.48, 95, w * 0.5, gY * 0.48, 360);
    vignette.addColorStop(0, 'rgba(9,8,18,0)');
    vignette.addColorStop(1, `rgba(8,5,15,${0.20 + curse * 0.14})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, gY);
  }

  function applyWorldIdentity(game) {
    const title = document.getElementById('worldTitle');
    if (title && game.currentWorldIndex === 0) {
      title.textContent = game.lang === 'en' ? 'Cursed Woods' : 'الغابة الملعونة';
    }

    const isWorld1 = game.activeWorld === 0 || game.currentWorldIndex === 0;
    const stage = document.getElementById('stageDisplay');
    if (stage && isWorld1 && !game.boss?.active && !['BOSS_WARNING', 'BOSS_INTRO', 'BOSS_OUTRO', 'FLY_AWAY'].includes(game.state)) {
      try {
        const cfg = window.CONFIG || {};
        const deep = (Number(game.score) || 0) >= (Number(cfg.STAGE1_END) || 15);
        stage.textContent = deep ? I18N[game.lang].stage2 : I18N[game.lang].stage1;
      } catch (_) {}
    }
  }

  function install() {
    const game = window.game;
    if (!game || typeof game.drawRuinsBackground !== 'function') return false;
    if (game.__ffW1CursedWoodsBackgroundV3Installed) return true;

    try {
      if (typeof I18N !== 'undefined') {
        if (I18N.ar) {
          I18N.ar.stage1 = 'أطراف الغابة';
          I18N.ar.stage2 = 'أعماق الغابة';
          I18N.ar.winText = 'لقد أكملت الغابة الملعونة بنجاح!';
        }
        if (I18N.en) {
          I18N.en.stage1 = 'Forest Edge';
          I18N.en.stage2 = 'Deep Woods';
          I18N.en.winText = 'You completed Cursed Woods!';
        }
      }
    } catch (_) {}

    const priorDrawRuinsBackground = game.drawRuinsBackground.bind(game);
    game.drawRuinsBackground = function(...args) {
      const isWorld1 = this.activeWorld === 0 || this.currentWorldIndex === 0;
      if (!isWorld1 || !this.ctx) return priorDrawRuinsBackground(...args);

      const cfg = window.CONFIG || {};
      const w = Number(cfg.CANVAS_WIDTH) || 360;
      const h = Number(cfg.CANVAS_HEIGHT) || 640;
      const groundHeight = Number(cfg.GROUND_HEIGHT) || 95;
      const gY = h - groundHeight;
      const frame = Number(this.frame) || 0;
      const target = worldTarget(this);
      const priorCurse = Number.isFinite(this.__ffW1CursedBgIntensity) ? this.__ffW1CursedBgIntensity : target;
      const curse = priorCurse + (target - priorCurse) * 0.025;
      this.__ffW1CursedBgIntensity = curse;

      const bossTarget = (!!this.boss?.active || ['BOSS_WARNING', 'BOSS_INTRO', 'BOSS_OUTRO', 'FLY_AWAY'].includes(this.state)) ? 1 : 0;
      const priorBoss = Number.isFinite(this.__ffW1CursedBossBlend) ? this.__ffW1CursedBossBlend : bossTarget;
      const bossBlend = priorBoss + (bossTarget - priorBoss) * 0.035;
      this.__ffW1CursedBossBlend = bossBlend;

      const ctx = this.ctx;
      ctx.save();
      drawSky(ctx, w, gY, frame, curse);
      drawFarRuins(ctx, w, gY, frame, curse, bossBlend);
      drawFarForest(ctx, w, gY, frame, curse);
      drawFog(ctx, w, gY, frame, curse);
      drawMidTrees(ctx, w, gY, frame, curse);
      drawVignette(ctx, w, gY, curse);
      ctx.restore();
    };

    if (typeof game.updateCarousel === 'function') {
      const priorUpdateCarousel = game.updateCarousel.bind(game);
      game.updateCarousel = function(...args) {
        const result = priorUpdateCarousel(...args);
        applyWorldIdentity(this);
        return result;
      };
    }
    applyWorldIdentity(game);

    game.__ffW1CursedWoodsBackgroundV3Installed = true;
    window.__FF_W1_CURSED_WOODS_BACKGROUND_V3__ = {
      version: 'world1-cursed-woods-background-v3',
      worldName: { ar: 'الغابة الملعونة', en: 'Cursed Woods' },
      stages: ['forest-edge', 'deep-woods', 'crow-citadel'],
      seamlessParallax: true,
      gameplayGeometryChanged: false
    };
    console.log('[FF-LAB] world1-cursed-woods-background-v3-installed');
    return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => {
    tries += 1;
    if (install() || tries > 180) clearInterval(timer);
  }, 50);
})();