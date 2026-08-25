(() => {
  'use strict';

  const VERSION = 'hero-blue-ninja-v1';
  const baseDrawBirdSkin = window.drawBirdSkin;

  function path(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
  }

  function drawWing(ctx, flap, color) {
    ctx.save();
    ctx.translate(-3, 1);
    ctx.rotate(-0.18 - flap * 0.72);
    ctx.fillStyle = color;
    ctx.strokeStyle = '#07152f';
    ctx.lineWidth = 1.7;
    path(ctx, [[0,-2],[-10,-6],[-7,-1],[-12,2],[-5,4],[-9,7],[1,5],[5,2]]);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawBirdSkinV1(ctx, skinKey, x, y, rotation, wingCycle, scale = 1, inFever = false) {
    const key = skinKey || 'classic';
    if (key !== 'classic' && typeof baseDrawBirdSkin === 'function') {
      return baseDrawBirdSkin(ctx, key, x, y, rotation, wingCycle, scale, inFever);
    }

    const body = '#1677e8';
    const bodyDark = '#0c4fb5';
    const wing = '#1266d1';
    const beak = '#fbbf24';
    const band = '#0c1836';
    const outline = '#07152f';
    const flap = Math.max(-1, Math.min(1, Number.isFinite(wingCycle) ? wingCycle : 0));
    const glide = !inFever && Math.abs(flap) < 0.08 && rotation > 0.22;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.rotate(rotation);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (inFever) {
      ctx.save();
      ctx.globalAlpha = 0.72;
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 9;
      for (let i = 0; i < 4; i++) {
        const yy = -8 + i * 5;
        ctx.beginPath();
        ctx.moveTo(-20 - i * 2, yy);
        ctx.lineTo(-13 - i, yy - 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.fillStyle = bodyDark;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.6;
    path(ctx, [[-12,1],[-18,-3],[-16,2],[-21,5],[-13,7]]);
    ctx.fill(); ctx.stroke();

    if (glide) {
      ctx.save();
      ctx.translate(-2, 1);
      ctx.fillStyle = wing;
      ctx.strokeStyle = outline;
      ctx.lineWidth = 1.7;
      path(ctx, [[1,-3],[-15,-6],[-10,-1],[-17,2],[-7,5],[2,5],[6,1]]);
      ctx.fill(); ctx.stroke();
      ctx.restore();
    } else {
      drawWing(ctx, flap, wing);
    }

    ctx.fillStyle = body;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 1, 15, 13, -0.06, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#0e61c9';
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(-2, 6, 10, 5, 0, 0, Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = body;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.8;
    path(ctx, [[-8,-10],[-12,-19],[-4,-14],[-4,-22],[2,-14],[5,-19],[6,-10]]);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = band;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.5;
    path(ctx, [[-13,-9],[10,-8],[12,-5],[7,-4],[-13,-6]]);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-13,-7,2.4,2.2,0,0,Math.PI*2);
    ctx.fill(); ctx.stroke();
    path(ctx, [[-14,-8],[-21,-12],[-18,-6],[-14,-6]]); ctx.fill(); ctx.stroke();
    path(ctx, [[-14,-6],[-21,-3],[-17,0],[-13,-5]]); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(5,-7);
    ctx.quadraticCurveTo(10,-6,13,-3);
    ctx.quadraticCurveTo(9,2,5,0);
    ctx.quadraticCurveTo(3,-2,5,-7);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = beak;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.5;
    path(ctx, [[13,-2],[20,1],[13,3]]); ctx.fill(); ctx.stroke();

    ctx.restore();
  }

  window.drawBirdSkin = drawBirdSkinV1;
  if (window.game) {
    window.game.__heroBlueNinjaV1Installed = true;
    try { window.game.updatePreview?.(); } catch (_) {}
  }
  window.__FF_HERO_BLUE_NINJA_V1__ = VERSION;
})();