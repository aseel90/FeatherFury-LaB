(() => {
  'use strict';

  if (window.__FF_CROW_MINIONS_INGAME_V3__) return;

  const TWO_PI = Math.PI * 2;

  function findMeta(x, y) {
    const game = window.game;
    if (!game?.minions?.length) return null;
    let best = null;
    let bestD = Infinity;
    for (const m of game.minions) {
      const d = Math.abs(m.x - x) + Math.abs(m.y - y);
      if (d < bestD) { best = m; bestD = d; }
    }
    if (!best || bestD > 10) return null;
    if (best.__ffCrowWingPhase == null) best.__ffCrowWingPhase = Math.random() * TWO_PI;
    return best;
  }

  function fillStroke(ctx, fill, stroke = '#080711', width = 1.6) {
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function drawAura(ctx, frame, phase) {
    const pulse = 0.5 + Math.sin(frame * 0.09 + phase) * 0.5;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 22 + pulse * 2);
    glow.addColorStop(0, `rgba(139,92,246,${0.055 + pulse * 0.035})`);
    glow.addColorStop(0.62, `rgba(109,40,217,${0.045 + pulse * 0.025})`);
    glow.addColorStop(1, 'rgba(76,29,149,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, TWO_PI);
    ctx.fill();
    ctx.restore();
  }

  function drawTail(ctx) {
    const feathers = [-0.18, 0.02, 0.2];
    for (const a of feathers) {
      ctx.save();
      ctx.translate(9, 2);
      ctx.rotate(a);
      const g = ctx.createLinearGradient(0, 0, 13, 0);
      g.addColorStop(0, '#17152a');
      g.addColorStop(1, '#0a0b15');
      ctx.beginPath();
      ctx.moveTo(0, -2.8);
      ctx.lineTo(13, 0);
      ctx.lineTo(1, 3.1);
      ctx.closePath();
      fillStroke(ctx, g, '#070710', 1.25);
      ctx.restore();
    }
  }

  function drawWing(ctx, flap) {
    const lift = flap * 2.4;
    const sweep = flap * 1.2;
    const wing = ctx.createLinearGradient(-2, -5, 12, 8);
    wing.addColorStop(0, '#25233d');
    wing.addColorStop(0.62, '#151727');
    wing.addColorStop(1, '#0b0d16');

    ctx.beginPath();
    ctx.moveTo(-2, -2);
    ctx.quadraticCurveTo(4, -7 - lift, 10 + sweep, -5 - lift);
    ctx.lineTo(7, 0 - lift * 0.3);
    ctx.lineTo(11, 3 + lift * 0.18);
    ctx.lineTo(5, 4.5);
    ctx.quadraticCurveTo(1, 4, -2, 1);
    ctx.closePath();
    fillStroke(ctx, wing, '#080711', 1.55);

    ctx.strokeStyle = 'rgba(196,181,253,.18)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(1, -1);
    ctx.quadraticCurveTo(5, -2.8 - lift * 0.45, 8.3, -2.2 - lift * 0.5);
    ctx.stroke();
  }

  function drawCrest(ctx) {
    ctx.fillStyle = '#1e1a36';
    ctx.strokeStyle = '#080711';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(-5.5, -8.8);
    ctx.lineTo(-2.3, -14.2);
    ctx.lineTo(0.2, -9.6);
    ctx.lineTo(4.4, -12.3);
    ctx.lineTo(3.4, -7.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawEye(ctx) {
    ctx.save();
    ctx.shadowColor = 'rgba(168,85,247,.7)';
    ctx.shadowBlur = 3.2;
    ctx.fillStyle = '#fffafe';
    ctx.beginPath();
    ctx.moveTo(-10.7, -6.6);
    ctx.quadraticCurveTo(-5.5, -8.2, -1.4, -5.6);
    ctx.quadraticCurveTo(-3.2, -0.6, -7.8, -1.2);
    ctx.quadraticCurveTo(-10.5, -2.2, -10.7, -6.6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.ellipse(-6.4, -4.5, 1.55, 2.4, -0.15, 0, TWO_PI);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#080711';
    ctx.beginPath();
    ctx.moveTo(-11.2, -8.4);
    ctx.lineTo(-1.2, -6.1);
    ctx.lineTo(-2.4, -3.8);
    ctx.lineTo(-10.5, -5.5);
    ctx.closePath();
    ctx.fill();
  }

  function drawBeak(ctx) {
    const beak = ctx.createLinearGradient(-15, -3, -5, 3);
    beak.addColorStop(0, '#7c8090');
    beak.addColorStop(1, '#2b2c37');
    ctx.beginPath();
    ctx.moveTo(-10.8, -3.5);
    ctx.lineTo(-17.2, -0.6);
    ctx.lineTo(-11.1, 2.4);
    ctx.lineTo(-7.2, 0.3);
    ctx.closePath();
    fillStroke(ctx, beak, '#080711', 1.4);

    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(-14.8, -0.9);
    ctx.lineTo(-10.5, -1.6);
    ctx.stroke();
  }

  function drawCrow(ctx, x, y, frame) {
    const meta = findMeta(x, y);
    const phase = meta?.__ffCrowWingPhase || 0;
    const flap = Math.sin(frame * 0.28 + phase);
    const microBob = Math.sin(frame * 0.085 + phase) * 0.45;
    const tilt = flap * 0.012;

    ctx.save();
    ctx.translate(x, y + microBob);
    ctx.rotate(tilt);

    drawAura(ctx, frame, phase);
    drawTail(ctx);

    const body = ctx.createLinearGradient(-12, -9, 12, 10);
    body.addColorStop(0, '#25253d');
    body.addColorStop(0.52, '#171a2b');
    body.addColorStop(1, '#0b0d16');
    ctx.beginPath();
    ctx.ellipse(0.5, 1.2, 12.8, 9.7, -0.035, 0, TWO_PI);
    fillStroke(ctx, body, '#070710', 1.9);

    drawWing(ctx, flap);

    const head = ctx.createLinearGradient(-12, -11, 1, 3);
    head.addColorStop(0, '#292940');
    head.addColorStop(1, '#151725');
    ctx.beginPath();
    ctx.arc(-6.2, -4.1, 7.2, 0, TWO_PI);
    fillStroke(ctx, head, '#070710', 1.7);

    drawCrest(ctx);
    drawEye(ctx);
    drawBeak(ctx);

    ctx.fillStyle = 'rgba(231,229,228,.17)';
    ctx.beginPath();
    ctx.moveTo(-1.5, 6.5);
    ctx.lineTo(1.2, 8.6);
    ctx.lineTo(4.2, 6.1);
    ctx.lineTo(2.4, 8.8);
    ctx.lineTo(-0.2, 8.1);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function install() {
    const game = window.game;
    if (!game) return false;
    window.drawMinionCrow = drawCrow;
    game.__ffCrowMinionsIngameV3Installed = true;
    window.__FF_CROW_MINIONS_INGAME_V3__ = {
      version: 'crow-minions-ingame-v3',
      bodyScaleMode: 'fixed',
      flap: 'small-wing-tip-only',
      eye: 'violet-guardian-family',
      hitboxChanged: false,
      aiChanged: false
    };
    console.log('[FF-LAB] crow-minions-ingame-v3-installed');
    return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => {
    tries += 1;
    if (install() || tries > 180) clearInterval(timer);
  }, 50);
})();
