(() => {
  'use strict';

  if (window.__FF_W1_CURSED_OBSTACLES_V3__) return;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function stageIntensity(game) {
    const cfg = window.CONFIG || {};
    const s1 = Number(cfg.STAGE1_END) || 15;
    const s2 = Number(cfg.STAGE2_END) || 35;
    const score = Number(game.score) || 0;
    if (game.boss?.active || ['BOSS_WARNING', 'BOSS_INTRO', 'BOSS_OUTRO', 'FLY_AWAY'].includes(game.state)) return 1;
    if (score < s1) return 0.18 + clamp(score / s1, 0, 1) * 0.18;
    return 0.46 + clamp((score - s1) / Math.max(1, s2 - s1), 0, 1) * 0.30;
  }

  function coreGradient(ctx, x, w) {
    const g = ctx.createLinearGradient(x - 4, 0, x + w + 4, 0);
    g.addColorStop(0, '#170f17');
    g.addColorStop(0.12, '#2a1720');
    g.addColorStop(0.34, '#4a2830');
    g.addColorStop(0.52, '#63353a');
    g.addColorStop(0.70, '#44242d');
    g.addColorStop(0.90, '#281620');
    g.addColorStop(1, '#130c13');
    return g;
  }

  function drawCore(ctx, x, w, h) {
    ctx.fillStyle = coreGradient(ctx, x, w);
    ctx.fillRect(x, 0, w, h);

    ctx.strokeStyle = '#100a10';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 0.8, 0);
    ctx.lineTo(x + 0.8, h);
    ctx.moveTo(x + w - 0.8, 0);
    ctx.lineTo(x + w - 0.8, h);
    ctx.stroke();
  }

  function drawBarkBulge(ctx, x, y, w, h, side, variant) {
    const left = side === 'left';
    const dir = left ? -1 : 1;
    const bx = left ? x + 1 : x + w - 1;
    const max = 4 + (variant % 2) * 1.5;

    ctx.fillStyle = left ? '#24131c' : '#1d1119';
    ctx.strokeStyle = '#100a10';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(bx, y + 5);
    ctx.bezierCurveTo(
      bx + dir * max,
      y + h * 0.24,
      bx + dir * (max + 1.5),
      y + h * 0.58,
      bx + dir * 1.5,
      y + h - 5
    );
    ctx.lineTo(bx, y + h - 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawBarkShard(ctx, x, y, w, h, variant, index) {
    const lanes = [0.10, 0.36, 0.64];
    const widths = [0.33, 0.31, 0.27];
    const fills = ['rgba(17,9,14,.34)', 'rgba(133,72,67,.20)', 'rgba(20,10,16,.28)'];
    const lane = lanes[index];
    const pw = w * widths[index];
    const px = x + w * lane;
    const lean = (((variant + index) % 2) ? 1 : -1) * (3 + index);

    ctx.fillStyle = fills[index];
    ctx.beginPath();
    ctx.moveTo(px + 1, y + 3);
    ctx.bezierCurveTo(px + lean, y + h * 0.30, px - lean * 0.65, y + h * 0.66, px + 2, y + h - 3);
    ctx.lineTo(px + pw - 1, y + h - 4);
    ctx.bezierCurveTo(px + pw - lean * 0.65, y + h * 0.64, px + pw + lean * 0.6, y + h * 0.30, px + pw - 2, y + 2);
    ctx.closePath();
    ctx.fill();
  }

  function drawKnot(ctx, x, y, w, variant) {
    const left = variant % 2 === 0;
    const px = left ? x + w * 0.24 : x + w * 0.72;
    const py = y + 34;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(left ? -0.18 : 0.18);
    ctx.fillStyle = '#1c1018';
    ctx.strokeStyle = '#0d080d';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 6.5, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(126,73,86,.34)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0.8, -0.2, 3.4, 2.0, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawVine(ctx, x, y, w, h, variant, intensity) {
    const leftStart = variant % 2 === 0;
    const sx = x + w * (leftStart ? 0.18 : 0.82);
    const ex = x + w * (leftStart ? 0.78 : 0.22);
    const mid = x + w * 0.50;

    ctx.save();
    ctx.strokeStyle = `rgba(45,24,42,${0.66 + intensity * 0.10})`;
    ctx.lineWidth = 3.1;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, y + 6);
    ctx.bezierCurveTo(mid, y + h * 0.25, mid, y + h * 0.58, ex, y + h - 6);
    ctx.stroke();

    ctx.strokeStyle = `rgba(104,50,94,${0.22 + intensity * 0.12})`;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(sx + (leftStart ? 1.2 : -1.2), y + 7);
    ctx.bezierCurveTo(mid, y + h * 0.26, mid, y + h * 0.59, ex + (leftStart ? -1.2 : 1.2), y + h - 7);
    ctx.stroke();
    ctx.restore();
  }

  function drawSegment(ctx, x, y, w, h, variant, intensity) {
    if (h <= 8) return;

    drawBarkBulge(ctx, x, y, w, h, 'left', variant);
    drawBarkBulge(ctx, x, y, w, h, 'right', variant + 1);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    drawBarkShard(ctx, x, y, w, h, variant, 0);
    drawBarkShard(ctx, x, y, w, h, variant, 1);
    drawBarkShard(ctx, x, y, w, h, variant, 2);
    drawVine(ctx, x, y, w, h, variant, intensity);
    ctx.restore();

    if (h > 50 && variant !== 1) drawKnot(ctx, x, y, w, variant);
  }

  function drawShortRune(ctx, x, y, w, frame, variant, intensity) {
    const pulse = 0.5 + Math.sin(frame * 0.075 + variant * 1.4) * 0.5;
    const runeX = x + w * (variant % 2 ? 0.44 : 0.56);
    const span = 38;
    const pts = [
      [runeX, y],
      [runeX + (variant % 2 ? 5 : -5), y + 11],
      [runeX + (variant % 2 ? -3 : 4), y + 22],
      [runeX + 1, y + span]
    ];

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(156,72,232,.82)';
    ctx.shadowBlur = 4 + intensity * 4 + pulse * 1.5;
    ctx.strokeStyle = `rgba(107,48,174,${0.50 + intensity * 0.18})`;
    ctx.lineWidth = 4.0;
    ctx.beginPath();
    pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py));
    ctx.stroke();

    ctx.shadowBlur = 2 + intensity * 2;
    ctx.strokeStyle = `rgba(214,176,255,${0.72 + intensity * 0.14})`;
    ctx.lineWidth = 1.55;
    ctx.beginPath();
    pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py));
    ctx.stroke();
    ctx.restore();
  }

  function drawGapCut(ctx, x, w, variant) {
    ctx.save();
    ctx.fillStyle = '#21131a';
    ctx.strokeStyle = '#0e090e';
    ctx.lineWidth = 1.6;

    const notches = variant % 3;
    const shapes = notches === 0
      ? [[0.03, 0.31, 8], [0.37, 0.62, 11], [0.67, 0.95, 7]]
      : notches === 1
        ? [[0.04, 0.27, 10], [0.31, 0.56, 7], [0.60, 0.93, 12]]
        : [[0.03, 0.35, 7], [0.40, 0.69, 12], [0.72, 0.96, 8]];

    for (const [a, b, depth] of shapes) {
      const x0 = x + w * a;
      const x1 = x + w * b;
      const xm = (x0 + x1) * 0.5;
      ctx.beginPath();
      ctx.moveTo(x0, 0);
      ctx.quadraticCurveTo(xm, depth, x1, 0);
      ctx.lineTo(x1, 4);
      ctx.quadraticCurveTo(xm, depth + 5, x0, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.strokeStyle = '#120b11';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x + 1, 0.5);
    ctx.lineTo(x + w - 1, 0.5);
    ctx.stroke();
    ctx.restore();
  }

  function drawSideBranch(ctx, x, y, w, variant, intensity) {
    const left = variant % 2 === 0;
    const dir = left ? -1 : 1;
    const bx = left ? x + 2 : x + w - 2;
    const by = y + 22;

    ctx.save();
    ctx.strokeStyle = '#1a0f18';
    ctx.lineWidth = 5.0;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx + dir * 5, by - 2, bx + dir * 8, by - 8);
    ctx.stroke();

    ctx.strokeStyle = `rgba(94,47,78,${0.24 + intensity * 0.08})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bx + dir * 1.5, by - 1);
    ctx.quadraticCurveTo(bx + dir * 5, by - 3, bx + dir * 7, by - 8);
    ctx.stroke();
    ctx.restore();
  }

  function drawFarRoots(ctx, x, w, h, variant) {
    if (h < 110) return;
    const y = h - 4;
    ctx.save();
    ctx.strokeStyle = '#170d16';
    ctx.lineCap = 'round';
    ctx.lineWidth = 4.2;
    const roots = variant % 2
      ? [[0.28, -8], [0.52, 6], [0.72, 9]]
      : [[0.24, 8], [0.50, -6], [0.76, -9]];
    for (const [p, dx] of roots) {
      const sx = x + w * p;
      ctx.beginPath();
      ctx.moveTo(sx, y - 10);
      ctx.quadraticCurveTo(sx + dx * 0.45, y - 3, sx + dx, y + 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawLocalTrunk(ctx, x, w, h, variant, frame, intensity) {
    if (h <= 0) return;
    drawCore(ctx, x, w, h);
    drawGapCut(ctx, x, w, variant);

    const capSafe = 22;
    const farSafe = 18;
    const usable = Math.max(0, h - capSafe - farSafe);
    const segH = 66;
    const count = Math.max(1, Math.ceil(usable / segH));

    for (let i = 0; i < count; i++) {
      const sy = capSafe + i * segH;
      const sh = Math.min(segH + 5, h - farSafe - sy);
      if (sh <= 10) continue;
      const v = (variant + i) % 3;
      drawSegment(ctx, x, sy, w, sh, v, intensity);
      if (i > 0 && i % 2 === 1 && sh > 40) drawSideBranch(ctx, x, sy, w, v, intensity);
    }

    if (h > 135) {
      const runeY = Math.min(h - 60, 62 + (variant % 2) * 22);
      drawShortRune(ctx, x, runeY, w, frame, variant, intensity);
    }

    drawFarRoots(ctx, x, w, h, variant);
  }

  function drawTrunk(ctx, x, edgeY, w, h, side, variant, frame, intensity) {
    if (h <= 0) return;
    ctx.save();
    ctx.translate(0, edgeY);
    if (side === 'top') ctx.scale(1, -1);
    drawLocalTrunk(ctx, x, w, h, variant, frame, intensity);
    ctx.restore();
  }

  function drawObstacle(ctx, pillar, gap, groundY, frame, intensity) {
    const x = pillar.x;
    const w = pillar.width;
    const topH = Math.max(0, pillar.topHeight);
    const bottomY = pillar.topHeight + gap;
    const bottomH = Math.max(0, groundY - bottomY);

    if (pillar.__ffCursedObstacleVariantV3 == null) {
      const seed = Math.abs(Math.round((pillar.x || 0) * 17 + topH * 11));
      pillar.__ffCursedObstacleVariantV3 = seed % 3;
    }
    const variant = pillar.__ffCursedObstacleVariantV3;

    drawTrunk(ctx, x, topH, w, topH, 'top', variant, frame, intensity);
    drawTrunk(ctx, x, bottomY, w, bottomH, 'bottom', (variant + 1) % 3, frame, intensity);
  }

  function install() {
    const game = window.game;
    if (!game || typeof game.drawPillars !== 'function') return false;
    if (game.__ffW1CursedObstaclesV3Installed) return true;

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

    game.__ffW1CursedObstaclesV3Installed = true;
    window.__FF_W1_CURSED_OBSTACLES_V3__ = {
      version: 'world1-cursed-obstacles-v3',
      visual: 'fixed-scale-cursed-tree-segments',
      construction: 'tiled-organic-segments-no-height-stretch',
      gapEdge: 'clean-flat-collision-edge-with-bark-inset',
      rune: 'short-fixed-scale-single-mark',
      sideBulges: 'small-forgiving-visual-overhang',
      hitboxChanged: false,
      gapChanged: false,
      speedChanged: false
    };
    console.log('[FF-LAB] world1-cursed-obstacles-v3-installed');
    return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => {
    tries += 1;
    if (install() || tries > 180) clearInterval(timer);
  }, 50);
})();
