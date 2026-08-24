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
    const tilt = flap * 0.03 + (variant === 1 ? -0.045 : variant === 2 ? 0.035 : 0);

    ctx.save();
    ctx.translate(x, y + bob);
    ctx.rotate(tilt);

    // Cleaner forked tail: clearer crow silhouette without increasing hitbox.
    ctx.fillStyle = '#0a101b';
    ctx.beginPath();
    ctx.moveTo(9, 1);
    ctx.lineTo(17, -2);
    ctx.lineTo(14, 3);
    ctx.lineTo(18, 6);
    ctx.lineTo(13, 5);
    ctx.lineTo(10, 8);
    ctx.closePath();
    ctx.fill();

    // Body.
    const bodyW = variant === 2 ? 12.3 : 13.2;
    const bodyH = variant === 1 ? 8.6 : 8.0;
    ctx.fillStyle = variant === 1 ? '#151c2b' : '#101827';
    ctx.beginPath();
    ctx.ellipse(1, 1, bodyW, bodyH, variant === 2 ? 0.08 : -0.035, 0, Math.PI * 2);
    ctx.fill();

    // Head.
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(-8, -3, variant === 2 ? 6.1 : 6.6, 0, Math.PI * 2);
    ctx.fill();

    // Small forehead crest for variant 2.
    if (variant === 2) {
      ctx.beginPath();
      ctx.moveTo(-10, -8);
      ctx.lineTo(-6, -12);
      ctx.lineTo(-3, -8);
      ctx.closePath();
      ctx.fill();
    }

    // Slightly smaller, sharper beak.
    ctx.fillStyle = '#e58a0a';
    ctx.beginPath();
    ctx.moveTo(-13, -1.5);
    ctx.lineTo(-18.2, 1);
    ctx.lineTo(-13, 3.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f3ad22';
    ctx.beginPath();
    ctx.moveTo(-13, -1.5);
    ctx.lineTo(-17.1, 0.2);
    ctx.lineTo(-13, 1);
    ctx.closePath();
    ctx.fill();

    // Softer eye glow; still readable on the dark forest.
    ctx.shadowColor = 'rgba(248, 70, 70, .42)';
    ctx.shadowBlur = 2.5;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-9, -5, 1.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fecaca';
    ctx.beginPath();
    ctx.arc(-9.45, -5.45, .48, 0, Math.PI * 2);
    ctx.fill();

    // Wing animation: softer curves read more like crow wings than bat wings.
    ctx.fillStyle = variant === 1 ? '#0b1320' : '#0c1422';
    ctx.beginPath();
    if (variant === 0) {
      ctx.moveTo(-1, 0);
      ctx.quadraticCurveTo(4, -6 - flap * 5.5, 10, -9 - flap * 6.5);
      ctx.quadraticCurveTo(9, -1, 4, 5);
      ctx.closePath();
    } else if (variant === 1) {
      ctx.moveTo(0, 1);
      ctx.quadraticCurveTo(6, -3 - flap * 4.2, 12, -4 - flap * 3.4);
      ctx.quadraticCurveTo(9, 2, 4, 6);
      ctx.closePath();
    } else {
      ctx.moveTo(-1, 0);
      ctx.quadraticCurveTo(3, -8 - flap * 6.3, 8, -11 - flap * 7.2);
      ctx.quadraticCurveTo(10.5, -3, 5, 5);
      ctx.closePath();
    }
    ctx.fill();

    // Slight tonal separation between body and wing for phone readability.
    ctx.strokeStyle = 'rgba(91,105,125,.34)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.quadraticCurveTo(5, 5.5, 9.5, 3);
    ctx.stroke();

    ctx.restore();
  }

  function install() {
    if (!window.game) return false;
    window.drawMinionCrow = drawCrow;
    window.game.__cursedCrowArtV2Installed = true;
    console.log('[FF-LAB] cursed-crows-polish-v2-installed');
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