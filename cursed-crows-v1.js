(() => {
  const VARIANTS = 3;

  function getCrowMeta(x, y) {
    const game = window.game;
    if (!game?.minions?.length) return null;
    let best = null;
    let bestD = Infinity;
    for (const m of game.minions) {
      const d = Math.abs(m.x - x) + Math.abs(m.y - y);
      if (d < bestD) { bestD = d; best = m; }
    }
    if (!best || bestD > 8) return null;
    if (best.__crowVariant == null) {
      best.__crowVariant = Math.floor(Math.random() * VARIANTS);
      best.__crowPhase = Math.random() * Math.PI * 2;
    }
    return best;
  }

  function drawCrow(ctx, x, y, frame) {
    const meta = getCrowMeta(x, y);
    const variant = meta?.__crowVariant ?? 0;
    const phase = meta?.__crowPhase ?? 0;
    const flap = Math.sin(frame * 0.38 + phase);
    const bob = Math.sin(frame * 0.11 + phase) * 1.8;
    const tilt = flap * 0.035 + (variant === 1 ? -0.05 : variant === 2 ? 0.04 : 0);

    ctx.save();
    ctx.translate(x, y + bob);
    ctx.rotate(tilt);

    // Tail feathers: make the silhouette read as a small crow.
    ctx.fillStyle = '#0b1220';
    ctx.beginPath();
    ctx.moveTo(10, 1);
    ctx.lineTo(18, -3);
    ctx.lineTo(15, 3);
    ctx.lineTo(20, 6);
    ctx.lineTo(10, 5);
    ctx.closePath();
    ctx.fill();

    // Body.
    const bodyW = variant === 2 ? 12.5 : 13.5;
    const bodyH = variant === 1 ? 8.8 : 8.2;
    ctx.fillStyle = variant === 1 ? '#121827' : '#0f172a';
    ctx.beginPath();
    ctx.ellipse(1, 1, bodyW, bodyH, variant === 2 ? 0.10 : -0.04, 0, Math.PI * 2);
    ctx.fill();

    // Head.
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(-8, -3, variant === 2 ? 6.2 : 6.8, 0, Math.PI * 2);
    ctx.fill();

    // Small forehead crest for variant 2.
    if (variant === 2) {
      ctx.beginPath();
      ctx.moveTo(-10, -8);
      ctx.lineTo(-6, -13);
      ctx.lineTo(-3, -8);
      ctx.closePath();
      ctx.fill();
    }

    // Beak.
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-13, -2);
    ctx.lineTo(-20, 1);
    ctx.lineTo(-13, 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(-13, -2);
    ctx.lineTo(-18, 0);
    ctx.lineTo(-13, 1);
    ctx.closePath();
    ctx.fill();

    // Eye with tiny glow so it stays readable on the dark forest.
    ctx.shadowColor = 'rgba(248, 70, 70, .65)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-9, -5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fecaca';
    ctx.beginPath();
    ctx.arc(-9.5, -5.5, .55, 0, Math.PI * 2);
    ctx.fill();

    // Wing animation: each variant has a visibly different pose.
    ctx.fillStyle = '#070d18';
    ctx.beginPath();
    if (variant === 0) {
      ctx.moveTo(-1, 0);
      ctx.quadraticCurveTo(4, -8 - flap * 7, 11, -12 - flap * 8);
      ctx.quadraticCurveTo(9, -2, 4, 5);
      ctx.closePath();
    } else if (variant === 1) {
      ctx.moveTo(0, 1);
      ctx.quadraticCurveTo(7, -4 - flap * 5, 14, -5 - flap * 4);
      ctx.quadraticCurveTo(9, 2, 4, 7);
      ctx.closePath();
    } else {
      ctx.moveTo(-1, 0);
      ctx.quadraticCurveTo(3, -11 - flap * 8, 8, -15 - flap * 10);
      ctx.quadraticCurveTo(12, -4, 5, 5);
      ctx.closePath();
    }
    ctx.fill();

    // Secondary lower wing edge improves the crow silhouette on phones.
    ctx.strokeStyle = 'rgba(71,85,105,.38)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.quadraticCurveTo(5, 6, 10, 3);
    ctx.stroke();

    ctx.restore();
  }

  function install() {
    if (!window.game) return false;
    window.drawMinionCrow = drawCrow;
    window.game.__cursedCrowArtV1Installed = true;
    console.log('[FF-LAB] cursed-crows-v1-installed');
    return true;
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    if (install() || attempts > 50) clearInterval(timer);
  }, 100);

  setTimeout(install, 700);
  setTimeout(install, 1500);
})();
