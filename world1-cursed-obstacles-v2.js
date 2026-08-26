(() => {
  'use strict';

  if (window.__FF_W1_CURSED_OBSTACLES_V2__) return;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function stageIntensity(game) {
    const cfg = window.CONFIG || {};
    const s1 = Number(cfg.STAGE1_END) || 15;
    const s2 = Number(cfg.STAGE2_END) || 35;
    const score = Number(game.score) || 0;
    if (game.boss?.active || ['BOSS_WARNING', 'BOSS_INTRO', 'BOSS_OUTRO', 'FLY_AWAY'].includes(game.state)) return 1;
    if (score < s1) return 0.2 + clamp(score / s1, 0, 1) * 0.18;
    return 0.48 + clamp((score - s1) / Math.max(1, s2 - s1), 0, 1) * 0.28;
  }

  function contourPath(ctx, x, y, w, h, side, variant) {
    const isTop = side === 'top';
    const insetA = 2 + (variant % 2);
    const insetB = 4 - (variant % 2);
    const edgeY = isTop ? y + h : y;
    const farY = isTop ? y : y + h;

    ctx.beginPath();
    if (isTop) {
      ctx.moveTo(x + insetA, farY);
      ctx.bezierCurveTo(x + 1, y + h * 0.22, x + 5, y + h * 0.48, x + 2, edgeY - 14);
      ctx.quadraticCurveTo(x + 4, edgeY - 5, x + 8, edgeY - 2);
      ctx.lineTo(x + w * 0.34, edgeY - 1);
      ctx.quadraticCurveTo(x + w * 0.48, edgeY + 1, x + w * 0.62, edgeY - 1);
      ctx.lineTo(x + w - 8, edgeY - 2);
      ctx.quadraticCurveTo(x + w - 4, edgeY - 5, x + w - 2, edgeY - 14);
      ctx.bezierCurveTo(x + w - 5, y + h * 0.50, x + w - 1, y + h * 0.23, x + w - insetB, farY);
    } else {
      ctx.moveTo(x + 8, edgeY + 2);
      ctx.lineTo(x + w * 0.36, edgeY + 1);
      ctx.quadraticCurveTo(x + w * 0.50, edgeY - 1, x + w * 0.64, edgeY + 1);
      ctx.lineTo(x + w - 8, edgeY + 2);
      ctx.quadraticCurveTo(x + w - 4, edgeY + 5, x + w - 2, edgeY + 14);
      ctx.bezierCurveTo(x + w - 5, y + h * 0.48, x + w - 1, y + h * 0.77, x + w - insetB, farY);
      ctx.lineTo(x + insetA, farY);
      ctx.bezierCurveTo(x + 1, y + h * 0.78, x + 5, y + h * 0.50, x + 2, edgeY + 14);
      ctx.quadraticCurveTo(x + 4, edgeY + 5, x + 8, edgeY + 2);
    }
    ctx.closePath();
  }

  function drawBody(ctx, x, y, w, h, side, variant) {
    const grad = ctx.createLinearGradient(x, 0, x + w, 0);
    grad.addColorStop(0, '#28171d');
    grad.addColorStop(0.24, '#4a282a');
    grad.addColorStop(0.52, '#66362f');
    grad.addColorStop(0.76, '#452427');
    grad.addColorStop(1, '#21131a');

    contourPath(ctx, x, y, w, h, side, variant);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#140d14';
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  function drawBarkPlanes(ctx, x, y, w, h, side, variant) {
    ctx.save();
    contourPath(ctx, x, y, w, h, side, variant);
    ctx.clip();

    const planes = [
      { x:0.10, w:0.30, fill:'rgba(28,15,20,.28)', bend:-0.06 },
      { x:0.37, w:0.30, fill:'rgba(124,67,52,.18)', bend:0.05 },
      { x:0.67, w:0.25, fill:'rgba(24,13,19,.24)', bend:-0.04 }
    ];

    for (const p of planes) {
      const px = x + w * p.x;
      const pw = w * p.w;
      ctx.fillStyle = p.fill;
      ctx.beginPath();
      ctx.moveTo(px, y - 8);
      ctx.bezierCurveTo(px + w * p.bend, y + h * .30, px - w * p.bend, y + h * .66, px + 2, y + h + 8);
      ctx.lineTo(px + pw, y + h + 8);
      ctx.bezierCurveTo(px + pw - w * p.bend, y + h * .64, px + pw + w * p.bend, y + h * .28, px + pw, y - 8);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(18,10,15,.34)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const sx = x + w * (0.22 + i * 0.27);
      const sway = ((i + variant) % 2 ? 1 : -1) * 4;
      ctx.beginPath();
      ctx.moveTo(sx, y - 6);
      ctx.bezierCurveTo(sx + sway, y + h * .32, sx - sway, y + h * .68, sx + sway * .35, y + h + 6);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawSideKnots(ctx, x, y, w, h, variant) {
    if (h < 110) return;
    const marks = [0.30, 0.62];
    marks.forEach((t, i) => {
      const left = ((variant + i) % 2) === 0;
      const px = left ? x + 4 : x + w - 4;
      const py = y + h * t;
      ctx.save();
      ctx.translate(px, py);
      if (!left) ctx.scale(-1, 1);
      ctx.fillStyle = '#2d181e';
      ctx.strokeStyle = '#150d13';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-1, -4);
      ctx.quadraticCurveTo(5, -2, 8, 1);
      ctx.quadraticCurveTo(4, 5, -1, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawShortRune(ctx, x, y, w, h, side, variant, frame, intensity) {
    if (h < 105) return;
    const isTop = side === 'top';
    const centerY = isTop ? y + h * 0.58 : y + h * 0.42;
    const span = clamp(h * 0.20, 34, 58);
    const startY = centerY - span * 0.5;
    const runeX = x + w * (variant % 2 ? 0.47 : 0.55);
    const pulse = 0.5 + Math.sin(frame * 0.075 + variant * 1.7) * 0.5;
    const pts = [
      [runeX, startY],
      [runeX + (variant % 2 ? 5 : -5), startY + span * .34],
      [runeX + (variant % 2 ? -3 : 4), startY + span * .66],
      [runeX + 1, startY + span]
    ];

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(155,74,230,.75)';
    ctx.shadowBlur = 4 + intensity * 4 + pulse * 1.5;
    ctx.strokeStyle = `rgba(112,46,178,${0.48 + intensity * .18})`;
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py));
    ctx.stroke();
    ctx.shadowBlur = 2 + intensity * 2;
    ctx.strokeStyle = `rgba(205,165,255,${0.62 + intensity * .18})`;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py));
    ctx.stroke();
    ctx.restore();
  }

  function drawNaturalCut(ctx, x, edgeY, w, side, variant) {
    const isTop = side === 'top';
    const dir = isTop ? -1 : 1;
    ctx.save();
    ctx.strokeStyle = '#170e14';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + 8, edgeY + dir * 2);
    ctx.quadraticCurveTo(x + w * .28, edgeY + dir * (variant % 2 ? 1 : 3), x + w * .48, edgeY + dir * 2);
    ctx.quadraticCurveTo(x + w * .70, edgeY + dir * (variant % 2 ? 3 : 1), x + w - 8, edgeY + dir * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawFarRootHint(ctx, x, y, w, h, side, variant) {
    if (h < 85) return;
    const isTop = side === 'top';
    const farY = isTop ? y + 10 : y + h - 10;
    const dir = isTop ? 1 : -1;
    ctx.save();
    ctx.strokeStyle = 'rgba(25,13,20,.60)';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 2; i++) {
      const sx = x + w * (0.32 + i * 0.36);
      const s = ((variant + i) % 2 ? 1 : -1);
      ctx.beginPath();
      ctx.moveTo(sx, farY);
      ctx.quadraticCurveTo(sx + s * 7, farY + dir * 9, sx + s * 11, farY + dir * 18);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTrunk(ctx, x, y, w, h, side, variant, frame, intensity) {
    if (h <= 0) return;
    drawBody(ctx, x, y, w, h, side, variant);
    drawBarkPlanes(ctx, x, y, w, h, side, variant);
    drawSideKnots(ctx, x, y, w, h, variant);
    drawShortRune(ctx, x, y, w, h, side, variant, frame, intensity);
    const edgeY = side === 'top' ? y + h : y;
    drawNaturalCut(ctx, x, edgeY, w, side, variant);
    drawFarRootHint(ctx, x, y, w, h, side, variant);
  }

  function drawObstacle(ctx, pillar, gap, groundY, frame, intensity) {
    const x = pillar.x;
    const w = pillar.width;
    const topH = Math.max(0, pillar.topHeight);
    const bottomY = pillar.topHeight + gap;
    const bottomH = Math.max(0, groundY - bottomY);

    if (pillar.__ffCursedObstacleVariantV2 == null) {
      const seed = Math.abs(Math.round((pillar.x || 0) * 13 + topH * 7));
      pillar.__ffCursedObstacleVariantV2 = seed % 3;
    }
    const variant = pillar.__ffCursedObstacleVariantV2;

    drawTrunk(ctx, x, 0, w, topH, 'top', variant, frame, intensity);
    drawTrunk(ctx, x, bottomY, w, bottomH, 'bottom', (variant + 1) % 3, frame, intensity);
  }

  function install() {
    const game = window.game;
    if (!game || typeof game.drawPillars !== 'function') return false;
    if (game.__ffW1CursedObstaclesV2Installed) return true;

    const priorDrawPillars = game.drawPillars.bind(game);
    game.drawPillars = function(...args) {
      if (this.activeWorld !== 0 || !this.ctx || !Array.isArray(this.pillars)) {
        return priorDrawPillars(...args);
      }

      const cfg = window.CONFIG || {};
      const gap = Number(cfg.GAP_SIZE) || 154;
      const canvasH = Number(cfg.CANVAS_HEIGHT) || 640;
      const groundH = Number(cfg.GROUND_HEIGHT) || 95;
      const groundY = canvasH - groundH;
      const frame = Number(this.frame) || 0;
      const intensity = stageIntensity(this);

      this.pillars.forEach((pillar) => {
        if (!pillar || pillar.smashed) return;
        drawObstacle(this.ctx, pillar, gap, groundY, frame, intensity);
      });
    };

    game.__ffW1CursedObstaclesV2Installed = true;
    window.__FF_W1_CURSED_OBSTACLES_V2__ = {
      version: 'world1-cursed-obstacles-v2',
      visual: 'mobile-scale-organic-trunks',
      variants: 3,
      gapEdge: 'clean-natural-cut',
      rune: 'short-fixed-scale',
      stones: 'removed-from-flight-edge',
      hitboxChanged: false,
      gapChanged: false,
      speedChanged: false
    };
    console.log('[FF-LAB] world1-cursed-obstacles-v2-installed');
    return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => {
    tries += 1;
    if (install() || tries > 180) clearInterval(timer);
  }, 50);
})();
