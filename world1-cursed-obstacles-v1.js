(() => {
  'use strict';

  if (window.__FF_W1_CURSED_OBSTACLES_V1__) return;

  const TWO_PI = Math.PI * 2;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function stageIntensity(game) {
    const cfg = window.CONFIG || {};
    const s1 = Number(cfg.STAGE1_END) || 15;
    const s2 = Number(cfg.STAGE2_END) || 35;
    const score = Number(game.score) || 0;
    if (game.boss?.active || ['BOSS_WARNING', 'BOSS_INTRO', 'BOSS_OUTRO', 'FLY_AWAY'].includes(game.state)) return 1;
    if (score < s1) return 0.18 + clamp(score / s1, 0, 1) * 0.22;
    return 0.48 + clamp((score - s1) / Math.max(1, s2 - s1), 0, 1) * 0.32;
  }

  function roundedRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  function drawStoneBlock(ctx, x, y, w, h, light = false) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, light ? '#77707a' : '#5e5862');
    g.addColorStop(0.55, light ? '#57515b' : '#45404a');
    g.addColorStop(1, light ? '#3e3943' : '#2f2b35');
    roundedRect(ctx, x, y, w, h, 3);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#1a1620';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(220,210,225,.12)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 3);
    ctx.lineTo(x + w - 4, y + 3);
    ctx.stroke();
  }

  function drawAnchor(ctx, x, farY, w, side, variant, intensity) {
    const isTop = side === 'top';
    const dir = isTop ? 1 : -1;
    const baseY = isTop ? farY : farY - 26;

    ctx.save();
    ctx.globalAlpha = 0.95;
    drawStoneBlock(ctx, x + 5, baseY, w - 10, 18, true);
    drawStoneBlock(ctx, x + 11, baseY + dir * 16, w - 22, 16, false);

    if (variant === 1 || variant === 3) {
      const cy = isTop ? baseY + 17 : baseY + 8;
      ctx.save();
      ctx.translate(x + w * 0.5, cy);
      ctx.rotate(Math.PI / 4);
      ctx.shadowColor = 'rgba(168,85,247,.5)';
      ctx.shadowBlur = 5 + intensity * 5;
      ctx.fillStyle = `rgba(112,67,145,${0.35 + intensity * 0.28})`;
      ctx.fillRect(-5, -5, 10, 10);
      ctx.strokeStyle = `rgba(216,180,254,${0.42 + intensity * 0.35})`;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-5, -5, 10, 10);
      ctx.restore();
    }
    ctx.restore();
  }

  function drawWoodBody(ctx, x, y, w, h, side, variant, frame, intensity) {
    const isTop = side === 'top';
    const edgeY = isTop ? y + h : y;
    const farY = isTop ? y : y + h;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    const wood = ctx.createLinearGradient(x, 0, x + w, 0);
    wood.addColorStop(0, '#281719');
    wood.addColorStop(0.18, '#4b2928');
    wood.addColorStop(0.48, '#6b3a32');
    wood.addColorStop(0.72, '#4a2728');
    wood.addColorStop(1, '#24151b');
    ctx.fillStyle = wood;
    ctx.fillRect(x, y, w, h);

    const centre = ctx.createLinearGradient(x, 0, x + w, 0);
    centre.addColorStop(0, 'rgba(255,255,255,0)');
    centre.addColorStop(0.48, 'rgba(255,190,150,.07)');
    centre.addColorStop(0.58, 'rgba(255,180,140,.03)');
    centre.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = centre;
    ctx.fillRect(x, y, w, h);

    const stripeCount = 5;
    for (let i = 0; i < stripeCount; i++) {
      const sx = x + 8 + i * ((w - 16) / (stripeCount - 1));
      const sway = ((i + variant) % 2 ? 1 : -1) * (2.5 + variant * 0.5);
      ctx.strokeStyle = i % 2 ? 'rgba(29,16,20,.34)' : 'rgba(105,58,49,.26)';
      ctx.lineWidth = i % 2 ? 2.2 : 1.4;
      ctx.beginPath();
      ctx.moveTo(sx, y - 8);
      ctx.bezierCurveTo(sx + sway, y + h * 0.28, sx - sway, y + h * 0.62, sx + sway * 0.4, y + h + 8);
      ctx.stroke();
    }

    const thornYs = [0.23, 0.43, 0.67, 0.82];
    thornYs.forEach((t, i) => {
      const py = y + h * t;
      const left = (i + variant) % 2 === 0;
      const bx = left ? x + 1 : x + w - 1;
      const inward = left ? 1 : -1;
      const len = 7 + ((i + variant) % 3) * 2;
      ctx.fillStyle = '#321b20';
      ctx.strokeStyle = '#181018';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx, py - 5);
      ctx.lineTo(bx + inward * len, py);
      ctx.lineTo(bx, py + 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    if (variant === 2 || variant === 3) {
      ctx.strokeStyle = `rgba(67,35,52,${0.56 + intensity * 0.16})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      const vx = x + (variant === 2 ? w * 0.32 : w * 0.72);
      ctx.moveTo(vx, y - 4);
      ctx.bezierCurveTo(vx - 8, y + h * .28, vx + 8, y + h * .54, vx - 3, y + h + 4);
      ctx.stroke();
    }

    const crackX = x + w * (variant === 1 ? 0.44 : variant === 2 ? 0.58 : 0.52);
    const topPad = Math.max(38, h * 0.16);
    const bottomPad = Math.max(28, h * 0.14);
    const c0 = isTop ? y + topPad : edgeY + bottomPad;
    const c3 = isTop ? edgeY - bottomPad : y + h - topPad;
    const span = c3 - c0;
    if (span > 34) {
      const pulse = 0.5 + Math.sin(frame * 0.075 + variant * 1.3) * 0.5;
      const pts = [
        [crackX, c0],
        [crackX + (variant % 2 ? 7 : -6), c0 + span * .24],
        [crackX + (variant % 2 ? -5 : 6), c0 + span * .49],
        [crackX + (variant % 2 ? 6 : -4), c0 + span * .73],
        [crackX, c3]
      ];
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(168,85,247,.85)';
      ctx.shadowBlur = 6 + intensity * 6 + pulse * 2;
      ctx.strokeStyle = `rgba(107,33,168,${0.48 + intensity * 0.24})`;
      ctx.lineWidth = 4.4;
      ctx.beginPath();
      pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py));
      ctx.stroke();
      ctx.shadowBlur = 3 + intensity * 4;
      ctx.strokeStyle = `rgba(216,180,254,${0.62 + intensity * 0.25 + pulse * 0.08})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py));
      ctx.stroke();
      ctx.restore();
    }

    const edgeDir = isTop ? -1 : 1;
    ctx.fillStyle = '#1b1016';
    ctx.fillRect(x, isTop ? edgeY - 4 : edgeY, w, 4);
    const teeth = [0, .17, .33, .51, .69, .86, 1];
    ctx.fillStyle = '#30191f';
    ctx.strokeStyle = '#160d13';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, edgeY);
    for (let i = 1; i < teeth.length - 1; i++) {
      const tx = x + w * teeth[i];
      const depth = 7 + ((i + variant) % 3) * 3;
      ctx.lineTo(tx - 4, edgeY + edgeDir * 2);
      ctx.lineTo(tx, edgeY + edgeDir * depth);
      ctx.lineTo(tx + 4, edgeY + edgeDir * 2);
    }
    ctx.lineTo(x + w, edgeY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    drawAnchor(ctx, x, farY, w, side, variant, intensity);

    ctx.restore();
  }

  function drawDecorativeRoots(ctx, x, y, w, h, side, variant, intensity) {
    if (h < 80) return;
    const isTop = side === 'top';
    const farY = isTop ? y + 24 : y + h - 24;
    ctx.save();
    ctx.strokeStyle = `rgba(42,23,34,${0.70 + intensity * 0.12})`;
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const sx = x + 14 + i * ((w - 28) / 2);
      const dir = (i + variant) % 2 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(sx, farY);
      ctx.bezierCurveTo(sx + dir * 9, farY + (isTop ? 10 : -10), sx - dir * 6, farY + (isTop ? 18 : -18), sx + dir * 12, farY + (isTop ? 25 : -25));
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawObstacle(ctx, pillar, gap, groundY, frame, intensity) {
    const x = pillar.x;
    const w = pillar.width;
    const topH = Math.max(0, pillar.topHeight);
    const bottomY = pillar.topHeight + gap;
    const bottomH = Math.max(0, groundY - bottomY);

    if (pillar.__ffCursedObstacleVariant == null) {
      const stageBias = intensity > 0.72 ? 2 : intensity > 0.44 ? 1 : 0;
      pillar.__ffCursedObstacleVariant = (Math.floor(Math.random() * 4) + stageBias) % 4;
    }
    const variant = pillar.__ffCursedObstacleVariant % 4;

    if (topH > 0) {
      drawWoodBody(ctx, x, 0, w, topH, 'top', variant, frame, intensity);
      drawDecorativeRoots(ctx, x, 0, w, topH, 'top', variant, intensity);
    }
    if (bottomH > 0) {
      drawWoodBody(ctx, x, bottomY, w, bottomH, 'bottom', (variant + 1) % 4, frame, intensity);
      drawDecorativeRoots(ctx, x, bottomY, w, bottomH, 'bottom', (variant + 1) % 4, intensity);
    }
  }

  function install() {
    const game = window.game;
    if (!game || typeof game.drawPillars !== 'function') return false;
    if (game.__ffW1CursedObstaclesV1Installed) return true;

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

    game.__ffW1CursedObstaclesV1Installed = true;
    window.__FF_W1_CURSED_OBSTACLES_V1__ = {
      version: 'world1-cursed-obstacles-v1',
      visual: 'cursed-wood-trunks',
      variants: 4,
      hitboxChanged: false,
      gapChanged: false,
      speedChanged: false
    };
    console.log('[FF-LAB] world1-cursed-obstacles-v1-installed');
    return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => {
    tries += 1;
    if (install() || tries > 180) clearInterval(timer);
  }, 50);
})();
