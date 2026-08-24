(() => {
  function drawCrowKing(ctx, x, y, frame, isEnraged) {
    const game = window.game;
    const intro = game && (game.state === 'BOSS_WARNING' || game.state === 'BOSS_INTRO');
    const t = frame || 0;
    const flap = Math.sin(t * 0.16) * (intro ? 0.22 : 0.34);
    const breathe = 1 + Math.sin(t * 0.08) * 0.025;
    const rage = isEnraged ? 1 : 0;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(breathe, breathe);

    if (intro) {
      const aura = ctx.createRadialGradient(0, 0, 12, 0, 0, 95);
      aura.addColorStop(0, 'rgba(127,29,29,.26)');
      aura.addColorStop(0.45, 'rgba(88,28,135,.16)');
      aura.addColorStop(1, 'rgba(15,23,42,0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 95, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rear wing: broad feathered silhouette.
    ctx.save();
    ctx.translate(12, -2);
    ctx.rotate(-0.24 - flap);
    ctx.fillStyle = '#0a0f1b';
    ctx.beginPath();
    ctx.moveTo(5, 4);
    ctx.quadraticCurveTo(28, -36, 66, -52);
    ctx.lineTo(50, -26);
    ctx.lineTo(72, -31);
    ctx.lineTo(49, -10);
    ctx.lineTo(67, -7);
    ctx.lineTo(35, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Tail fan.
    ctx.fillStyle = '#070b14';
    ctx.beginPath();
    ctx.moveTo(28, 5);
    ctx.lineTo(68, -8);
    ctx.lineTo(52, 7);
    ctx.lineTo(72, 15);
    ctx.lineTo(49, 17);
    ctx.lineTo(63, 31);
    ctx.lineTo(25, 20);
    ctx.closePath();
    ctx.fill();

    // Main body.
    const bodyGrad = ctx.createLinearGradient(-25, -20, 35, 25);
    bodyGrad.addColorStop(0, isEnraged ? '#3f1018' : '#141b2b');
    bodyGrad.addColorStop(0.55, isEnraged ? '#291018' : '#0f1728');
    bodyGrad.addColorStop(1, '#070b14');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(2, 5, 35, 25, 0.07, 0, Math.PI * 2);
    ctx.fill();

    // Chest plate / feather mantle.
    ctx.fillStyle = isEnraged ? '#7f1d1d' : '#25324a';
    ctx.beginPath();
    ctx.moveTo(-4, -5);
    ctx.quadraticCurveTo(14, 0, 26, 12);
    ctx.quadraticCurveTo(14, 19, -1, 17);
    ctx.quadraticCurveTo(8, 9, -4, -5);
    ctx.fill();

    // Head and angular brow.
    ctx.fillStyle = isEnraged ? '#2a0d14' : '#101827';
    ctx.beginPath();
    ctx.arc(-28, -6, 20, 0, Math.PI * 2);
    ctx.fill();

    // Crown made of dark feather spikes.
    ctx.fillStyle = '#050912';
    ctx.beginPath();
    ctx.moveTo(-41, -18);
    ctx.lineTo(-38, -38);
    ctx.lineTo(-29, -22);
    ctx.lineTo(-22, -43);
    ctx.lineTo(-17, -20);
    ctx.lineTo(-7, -33);
    ctx.lineTo(-10, -13);
    ctx.closePath();
    ctx.fill();

    // Brow ridge gives the face a boss expression.
    ctx.fillStyle = '#050912';
    ctx.beginPath();
    ctx.moveTo(-44, -12);
    ctx.lineTo(-22, -16);
    ctx.lineTo(-16, -8);
    ctx.lineTo(-37, -6);
    ctx.closePath();
    ctx.fill();

    // Eye glow.
    ctx.shadowColor = isEnraged ? 'rgba(253,224,71,.85)' : 'rgba(239,68,68,.72)';
    ctx.shadowBlur = intro ? 9 : 5;
    ctx.fillStyle = isEnraged ? '#fde047' : '#ef4444';
    ctx.beginPath();
    ctx.ellipse(-33, -8, 4.5, 3.1, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff7d6';
    ctx.beginPath();
    ctx.arc(-34.3, -9, 1.05, 0, Math.PI * 2);
    ctx.fill();

    // Strong crow beak.
    const beak = ctx.createLinearGradient(-45, -4, -69, 8);
    beak.addColorStop(0, '#f4b13b');
    beak.addColorStop(1, '#b8670a');
    ctx.fillStyle = beak;
    ctx.beginPath();
    ctx.moveTo(-43, -5);
    ctx.quadraticCurveTo(-61, -4, -72, 4);
    ctx.quadraticCurveTo(-59, 11, -43, 7);
    ctx.lineTo(-49, 3);
    ctx.closePath();
    ctx.fill();

    // Front wing with layered feathers.
    ctx.save();
    ctx.translate(5, 1);
    ctx.rotate(0.16 + flap);
    ctx.fillStyle = isEnraged ? '#1f0d16' : '#111c30';
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(18, -38, 45, -59);
    ctx.lineTo(39, -27);
    ctx.lineTo(58, -38);
    ctx.lineTo(43, -13);
    ctx.lineTo(61, -17);
    ctx.lineTo(34, 3);
    ctx.lineTo(46, 9);
    ctx.lineTo(11, 16);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(100,116,139,.38)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(8 + i * 7, 2);
      ctx.quadraticCurveTo(23 + i * 5, -15, 36 + i * 4, -31 - i * 4);
      ctx.stroke();
    }
    ctx.restore();

    // Subtle red rune marks when enraged.
    if (rage) {
      ctx.strokeStyle = 'rgba(248,113,113,.72)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, 4); ctx.lineTo(5, 10); ctx.lineTo(-1, 15);
      ctx.moveTo(10, 0); ctx.lineTo(17, 7); ctx.lineTo(13, 14);
      ctx.stroke();
    }

    if (intro) {
      // Intro dust / feather motes around the silhouette. Purely visual.
      ctx.fillStyle = 'rgba(203,213,225,.32)';
      for (let i = 0; i < 7; i++) {
        const a = t * 0.015 + i * 0.93;
        const rx = Math.cos(a) * (48 + (i % 3) * 9);
        const ry = Math.sin(a * 1.4) * 34;
        ctx.beginPath();
        ctx.ellipse(rx, ry, 2.2, 0.8, a, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function install() {
    const game = window.game;
    if (!game || typeof game.drawCrowBoss !== 'function') return false;
    if (game.__crowKingVisualV1Installed) return true;

    game.drawCrowBoss = function(ctx, x, y, frame, isEnraged) {
      drawCrowKing(ctx, x, y, frame, isEnraged);
    };

    game.__crowKingVisualV1Installed = true;
    console.log('[FF-LAB] crow-king-visual-v1-installed');
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
