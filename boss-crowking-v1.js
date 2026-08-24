(() => {
  function drawCrowKing(ctx, x, y, frame, isEnraged) {
    const game = window.game;
    const intro = game && (game.state === 'BOSS_WARNING' || game.state === 'BOSS_INTRO');
    const t = frame || 0;
    const flap = Math.sin(t * 0.16) * (intro ? 0.18 : 0.28);
    const breathe = 1 + Math.sin(t * 0.08) * 0.018;
    const rage = isEnraged ? 1 : 0;
    const visualScale = intro ? 0.93 : 0.90;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(visualScale * breathe, visualScale * breathe);

    if (intro) {
      const aura = ctx.createRadialGradient(0, 0, 12, 0, 0, 90);
      aura.addColorStop(0, 'rgba(127,29,29,.24)');
      aura.addColorStop(0.45, 'rgba(88,28,135,.15)');
      aura.addColorStop(1, 'rgba(15,23,42,0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 90, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtle rim light keeps the dark boss readable against the red forest.
    ctx.save();
    ctx.shadowColor = isEnraged ? 'rgba(248,113,113,.44)' : 'rgba(167,139,250,.34)';
    ctx.shadowBlur = intro ? 11 : 7;
    ctx.strokeStyle = isEnraged ? 'rgba(248,113,113,.42)' : 'rgba(148,163,184,.28)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(1, 4, 36, 26, 0.07, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Rear wing: broad crow feathers with softer tips.
    ctx.save();
    ctx.translate(12, -2);
    ctx.rotate(-0.22 - flap);
    ctx.fillStyle = '#0a0f1b';
    ctx.beginPath();
    ctx.moveTo(5, 4);
    ctx.quadraticCurveTo(27, -32, 61, -47);
    ctx.quadraticCurveTo(55, -34, 47, -24);
    ctx.quadraticCurveTo(59, -27, 68, -28);
    ctx.quadraticCurveTo(58, -17, 47, -9);
    ctx.quadraticCurveTo(57, -9, 64, -6);
    ctx.quadraticCurveTo(48, 2, 34, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Softer fan tail; still reads as a crow rather than a spiked creature.
    ctx.fillStyle = '#070b14';
    ctx.beginPath();
    ctx.moveTo(27, 5);
    ctx.quadraticCurveTo(48, -3, 63, -6);
    ctx.quadraticCurveTo(54, 4, 47, 8);
    ctx.quadraticCurveTo(61, 9, 68, 14);
    ctx.quadraticCurveTo(55, 17, 47, 17);
    ctx.quadraticCurveTo(57, 24, 61, 29);
    ctx.quadraticCurveTo(43, 24, 25, 19);
    ctx.closePath();
    ctx.fill();

    // Main body.
    const bodyGrad = ctx.createLinearGradient(-25, -20, 35, 25);
    bodyGrad.addColorStop(0, isEnraged ? '#49151d' : '#1c2638');
    bodyGrad.addColorStop(0.55, isEnraged ? '#30131b' : '#121c2e');
    bodyGrad.addColorStop(1, '#080d17');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(2, 5, 35, 25, 0.07, 0, Math.PI * 2);
    ctx.fill();

    // Chest feather mantle adds separation from the wing.
    ctx.fillStyle = isEnraged ? '#7f1d1d' : '#30405a';
    ctx.beginPath();
    ctx.moveTo(-4, -5);
    ctx.quadraticCurveTo(14, 0, 26, 12);
    ctx.quadraticCurveTo(14, 19, -1, 17);
    ctx.quadraticCurveTo(8, 9, -4, -5);
    ctx.fill();

    // Head and angular brow.
    ctx.fillStyle = isEnraged ? '#2f1017' : '#151f31';
    ctx.beginPath();
    ctx.arc(-28, -6, 20, 0, Math.PI * 2);
    ctx.fill();

    // Crown made of dark feather spikes, slightly shorter and cleaner.
    ctx.fillStyle = '#050912';
    ctx.beginPath();
    ctx.moveTo(-41, -18);
    ctx.lineTo(-38, -35);
    ctx.lineTo(-29, -22);
    ctx.lineTo(-22, -39);
    ctx.lineTo(-17, -20);
    ctx.lineTo(-7, -31);
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
    ctx.shadowColor = isEnraged ? 'rgba(253,224,71,.78)' : 'rgba(239,68,68,.66)';
    ctx.shadowBlur = intro ? 8 : 4.5;
    ctx.fillStyle = isEnraged ? '#fde047' : '#ef4444';
    ctx.beginPath();
    ctx.ellipse(-33, -8, 4.3, 3, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff7d6';
    ctx.beginPath();
    ctx.arc(-34.2, -9, 1, 0, Math.PI * 2);
    ctx.fill();

    // Strong crow beak, slightly more compact.
    const beak = ctx.createLinearGradient(-45, -4, -67, 8);
    beak.addColorStop(0, '#f4b13b');
    beak.addColorStop(1, '#b8670a');
    ctx.fillStyle = beak;
    ctx.beginPath();
    ctx.moveTo(-43, -5);
    ctx.quadraticCurveTo(-58, -4, -68, 4);
    ctx.quadraticCurveTo(-57, 10, -43, 7);
    ctx.lineTo(-49, 3);
    ctx.closePath();
    ctx.fill();

    // Front wing with layered, rounded crow feathers.
    ctx.save();
    ctx.translate(5, 1);
    ctx.rotate(0.14 + flap);
    ctx.fillStyle = isEnraged ? '#241019' : '#17243a';
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(18, -34, 42, -54);
    ctx.quadraticCurveTo(40, -39, 36, -27);
    ctx.quadraticCurveTo(47, -34, 54, -34);
    ctx.quadraticCurveTo(48, -22, 40, -13);
    ctx.quadraticCurveTo(50, -17, 57, -15);
    ctx.quadraticCurveTo(46, -4, 33, 3);
    ctx.quadraticCurveTo(40, 6, 43, 9);
    ctx.quadraticCurveTo(26, 14, 11, 16);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(125,140,164,.34)';
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(8 + i * 7, 2);
      ctx.quadraticCurveTo(22 + i * 5, -13, 34 + i * 4, -27 - i * 3);
      ctx.stroke();
    }
    ctx.restore();

    // Subtle red rune marks when enraged.
    if (rage) {
      ctx.strokeStyle = 'rgba(248,113,113,.66)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, 4); ctx.lineTo(5, 10); ctx.lineTo(-1, 15);
      ctx.moveTo(10, 0); ctx.lineTo(17, 7); ctx.lineTo(13, 14);
      ctx.stroke();
    }

    if (intro) {
      // Intro dust / feather motes around the silhouette. Purely visual.
      ctx.fillStyle = 'rgba(203,213,225,.28)';
      for (let i = 0; i < 6; i++) {
        const a = t * 0.015 + i * 1.02;
        const rx = Math.cos(a) * (45 + (i % 3) * 8);
        const ry = Math.sin(a * 1.4) * 31;
        ctx.beginPath();
        ctx.ellipse(rx, ry, 2, 0.75, a, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function install() {
    const game = window.game;
    if (!game || typeof game.drawCrowBoss !== 'function') return false;
    if (game.__crowKingVisualV2Installed) return true;

    game.drawCrowBoss = function(ctx, x, y, frame, isEnraged) {
      drawCrowKing(ctx, x, y, frame, isEnraged);
    };

    game.__crowKingVisualV2Installed = true;
    console.log('[FF-LAB] crow-king-polish-v2-installed');
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