(() => {
  'use strict';

  if (window.__FF_OWL_GUARDIAN_V2__) return;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

  function pathFillStroke(ctx, fill, stroke = '#160d0a', lineWidth = 2.4) {
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function drawAura(ctx, frame, introProgress, leaving) {
    const pulse = 0.5 + Math.sin(frame * 0.075) * 0.5;
    const strength = leaving ? 0.72 : (0.78 + pulse * 0.18);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = strength * (0.72 + introProgress * 0.28);

    const glow = ctx.createRadialGradient(0, 2, 18, 0, 2, 54 + pulse * 4);
    glow.addColorStop(0, 'rgba(124,58,237,.12)');
    glow.addColorStop(0.56, 'rgba(126,34,206,.16)');
    glow.addColorStop(1, 'rgba(88,28,135,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 2, 58 + pulse * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(168,85,247,${0.18 + pulse * 0.12})`;
    ctx.lineWidth = 1.6;
    ctx.setLineDash([4, 7]);
    ctx.beginPath();
    ctx.ellipse(0, 3, 43 + pulse * 2, 40 + pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    for (let i = 0; i < 6; i++) {
      const a = frame * 0.018 + i * (Math.PI * 2 / 6);
      const r = 39 + (i % 2) * 7;
      const px = Math.cos(a) * r;
      const py = Math.sin(a * 1.15) * (30 + (i % 3) * 3);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(a + 0.8);
      ctx.fillStyle = i % 2 ? 'rgba(192,132,252,.45)' : 'rgba(126,34,206,.48)';
      ctx.beginPath();
      ctx.moveTo(-3.6, 0);
      ctx.quadraticCurveTo(0, -2.1, 4.8, 0);
      ctx.quadraticCurveTo(0.4, 2.5, -3.6, 0);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  function drawWing(ctx, side, tuck) {
    ctx.save();
    ctx.translate(side * (27 + tuck), 5);
    ctx.scale(side, 1);

    const wing = ctx.createLinearGradient(0, -18, 22, 20);
    wing.addColorStop(0, '#6b3d25');
    wing.addColorStop(0.58, '#56301f');
    wing.addColorStop(1, '#3f241a');
    ctx.beginPath();
    ctx.moveTo(-2, -15);
    ctx.quadraticCurveTo(13, -14, 18, -2);
    ctx.quadraticCurveTo(22, 11, 12, 25);
    ctx.quadraticCurveTo(5, 31, -4, 23);
    ctx.quadraticCurveTo(2, 10, -2, -15);
    ctx.closePath();
    pathFillStroke(ctx, wing, '#1f120e', 2.6);

    ctx.strokeStyle = 'rgba(235,184,137,.22)';
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(3, -4 + i * 8);
      ctx.quadraticCurveTo(10, 1 + i * 8, 14, 8 + i * 7);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawGuardianOwl(ctx, x, y, frame) {
    const game = window.game;
    const state = game?.state || '';
    const leaving = state === 'FLY_AWAY';
    const dialogue = game?.activeWorld === 0 && state === 'BOSS_OUTRO' && game?.__ffVictoryCine?.phase === 'dialogue';
    const talking = dialogue && !game?.storyCompleted;
    const cfg = window.CONFIG || {};
    const canvasW = Number(cfg.CANVAS_WIDTH) || 480;
    const spawnX = canvasW + 100;
    const targetX = canvasW / 2 + 50;
    const travel = Math.max(1, spawnX - targetX);
    const introRaw = state === 'BOSS_OUTRO' ? (spawnX - x) / travel : 1;
    const introProgress = easeOut(introRaw);

    const hover = Math.sin(frame * 0.085) * 1.7;
    const breathe = 1 + Math.sin(frame * 0.055) * 0.008;
    const tuck = Math.sin(frame * 0.07) * 0.8;
    const introScale = state === 'BOSS_OUTRO' ? 0.90 + introProgress * 0.10 : 1;
    const exitTilt = leaving ? -0.08 : 0;
    const dialogueTilt = dialogue ? Math.sin(frame * 0.038) * 0.035 : 0;
    const talkPulse = talking ? (0.5 + Math.sin(frame * 0.48) * 0.5) : 0;

    ctx.save();
    ctx.translate(x, y + hover);
    ctx.rotate(exitTilt + dialogueTilt);
    ctx.scale(introScale * breathe, introScale * breathe);

    if (state === 'BOSS_OUTRO') ctx.globalAlpha *= 0.58 + introProgress * 0.42;

    drawAura(ctx, frame, introProgress, leaving);

    ctx.save();
    ctx.globalAlpha = 0.20;
    ctx.fillStyle = '#12091a';
    ctx.beginPath();
    ctx.ellipse(0, 37, 29, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawWing(ctx, -1, tuck);
    drawWing(ctx, 1, tuck);

    const body = ctx.createLinearGradient(-25, -29, 25, 36);
    body.addColorStop(0, '#75472f');
    body.addColorStop(0.52, '#5d3725');
    body.addColorStop(1, '#3f271d');
    ctx.beginPath();
    ctx.ellipse(0, 5, 34, 36, 0, 0, Math.PI * 2);
    pathFillStroke(ctx, body, '#160d0a', 3.0);

    const head = ctx.createLinearGradient(-18, -34, 16, 5);
    head.addColorStop(0, '#815038');
    head.addColorStop(1, '#573221');
    ctx.beginPath();
    ctx.ellipse(0, -15, 31.5, 27, 0, Math.PI, Math.PI * 2);
    ctx.lineTo(31.5, -8);
    ctx.quadraticCurveTo(24, 1, 0, 5);
    ctx.quadraticCurveTo(-24, 1, -31.5, -8);
    ctx.closePath();
    ctx.fillStyle = head;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-25, -29);
    ctx.quadraticCurveTo(-34, -44, -29, -51);
    ctx.quadraticCurveTo(-18, -43, -12, -31);
    ctx.closePath();
    pathFillStroke(ctx, '#6b3e29', '#160d0a', 2.7);

    ctx.beginPath();
    ctx.moveTo(25, -29);
    ctx.quadraticCurveTo(34, -44, 29, -51);
    ctx.quadraticCurveTo(18, -43, 12, -31);
    ctx.closePath();
    pathFillStroke(ctx, '#6b3e29', '#160d0a', 2.7);

    ctx.fillStyle = '#f2bd7a';
    ctx.beginPath();
    ctx.moveTo(-26, -34); ctx.lineTo(-29, -46); ctx.quadraticCurveTo(-22, -41, -17, -33); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(26, -34); ctx.lineTo(29, -46); ctx.quadraticCurveTo(22, -41, 17, -33); ctx.closePath(); ctx.fill();

    const chest = ctx.createLinearGradient(0, 0, 0, 35);
    chest.addColorStop(0, '#f6d29b');
    chest.addColorStop(1, '#e7b570');
    ctx.fillStyle = chest;
    ctx.beginPath();
    ctx.moveTo(-22, 8);
    ctx.quadraticCurveTo(-13, 11, -7, 17);
    ctx.lineTo(0, 11);
    ctx.lineTo(7, 17);
    ctx.quadraticCurveTo(13, 11, 22, 8);
    ctx.quadraticCurveTo(16, 28, 0, 35);
    ctx.quadraticCurveTo(-16, 28, -22, 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f4c88f';
    ctx.beginPath();
    ctx.moveTo(-26, -23);
    ctx.quadraticCurveTo(-12, -29, -2, -19);
    ctx.quadraticCurveTo(-7, -2, -23, -4);
    ctx.quadraticCurveTo(-30, -10, -26, -23);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(26, -23);
    ctx.quadraticCurveTo(12, -29, 2, -19);
    ctx.quadraticCurveTo(7, -2, 23, -4);
    ctx.quadraticCurveTo(30, -10, 26, -23);
    ctx.fill();

    const eyePulse = 0.82 + Math.sin(frame * 0.09) * 0.08;
    ctx.save();
    ctx.shadowColor = `rgba(250,204,21,${0.42 * eyePulse})`;
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#facc15';
    ctx.beginPath(); ctx.ellipse(-12, -14, 8.3, 9.2, -0.12, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, -14, 8.3, 9.2, 0.12, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#17110d';
    ctx.beginPath(); ctx.ellipse(-10.8, -13.2, 3.4, 5.3, -0.08, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(10.8, -13.2, 3.4, 5.3, 0.08, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff8dc';
    ctx.beginPath(); ctx.arc(-12.2, -16.5, 1.25, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(12.2, -16.5, 1.25, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#180f0b';
    ctx.beginPath();
    ctx.moveTo(-27, -28); ctx.lineTo(-3, -20); ctx.lineTo(-6, -14); ctx.lineTo(-25, -21); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(27, -28); ctx.lineTo(3, -20); ctx.lineTo(6, -14); ctx.lineTo(25, -21); ctx.closePath(); ctx.fill();

    const beak = ctx.createLinearGradient(0, -8, 0, 5);
    beak.addColorStop(0, '#fbbf24');
    beak.addColorStop(1, '#d97706');
    ctx.beginPath();
    ctx.moveTo(-6.5, -8);
    ctx.quadraticCurveTo(0, -12, 6.5, -8);
    ctx.lineTo(0, 4.5 + talkPulse * 3.2);
    ctx.closePath();
    pathFillStroke(ctx, beak, '#4a260c', 1.8);

    if (talking) {
      ctx.save();
      ctx.globalAlpha = 0.28 + talkPulse * 0.42;
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-2.8, -1 + talkPulse * 1.2);
      ctx.quadraticCurveTo(0, 0.8 + talkPulse * 1.8, 2.8, -1 + talkPulse * 1.2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.strokeStyle = 'rgba(255,239,213,.28)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(-7, 22, 9, 0.45, 1.9);
    ctx.stroke();

    ctx.restore();
  }

  function install() {
    const game = window.game;
    if (!game || typeof game.drawOwl !== 'function') return false;
    if (game.__ffOwlGuardianV2Installed) return true;

    game.drawOwl = function(ctx, x, y, frame) {
      drawGuardianOwl(ctx, x, y, frame);
    };

    game.__ffOwlGuardianV2Installed = true;
    window.__FF_OWL_GUARDIAN_V2__ = { version: 'owl-guardian-v2' };
    console.log('[FF-LAB] owl-guardian-v2-installed');
    return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 160) clearInterval(timer);
  }, 50);
})();
