(() => {
  'use strict';

  const VERSION = 'hero-blue-ninja-v1';

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
    const source = (typeof SKINS !== 'undefined' && (SKINS[skinKey] || SKINS.classic)) || {};
    const isClassic = skinKey === 'classic' || !skinKey;
    const body = isClassic ? '#1677e8' : (source.body || '#1677e8');
    const bodyDark = isClassic ? '#0c4fb5' : (source.wing || '#0c4fb5');
    const wing = isClassic ? '#1266d1' : (source.wing || bodyDark);
    const beak = isClassic ? '#fbbf24' : (source.beak || '#fbbf24');
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
    ctx.fill();
    ctx.stroke();

    if (glide) {
      ctx.save();
      ctx.translate(-2, 1);
      ctx.fillStyle = wing;
      ctx.strokeStyle = outline;
      ctx.lineWidth = 1.7;
      path(ctx, [[1,-3],[-15,-6],[-10,-1],[-17,2],[-7,5],[2,5],[6,1]]);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else {
      drawWing(ctx, flap, wing);
    }

    ctx.fillStyle = body;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 1, 15, 13, -0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isClassic ? '#0e61c9' : bodyDark;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(-2, 6, 10, 5, 0, 0, Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = body;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.8;
    path(ctx, [[-8,-10],[-12,-19],[-4,-14],[-4,-22],[2,-14],[5,-19],[6,-10]]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = band;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.5;
    path(ctx, [[-13,-9],[10,-8],[12,-5],[7,-4],[-13,-6]]);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(-13,-7,2.4,2.2,0,0,Math.PI*2);
    ctx.fill();
    ctx.stroke();
    path(ctx, [[-14,-8],[-21,-12],[-18,-6],[-14,-6]]);
    ctx.fill();
    ctx.stroke();
    path(ctx, [[-14,-6],[-21,-3],[-17,0],[-13,-5]]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(3,-5);
    ctx.quadraticCurveTo(8,-4,12,-2);
    ctx.quadraticCurveTo(9,4,4,3);
    ctx.quadraticCurveTo(1,1,3,-5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = beak;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.7;
    path(ctx, [[11,-1],[18,2],[11,5]]);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12,2);
    ctx.lineTo(17,2);
    ctx.stroke();

    if (!inFever && Math.abs(flap) < 0.18 && rotation < 0.18) {
      ctx.strokeStyle = beak;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-5,12); ctx.lineTo(-5,15); ctx.lineTo(-8,16);
      ctx.moveTo(4,12); ctx.lineTo(4,15); ctx.lineTo(7,16);
      ctx.stroke();
    }

    if (inFever) {
      ctx.save();
      ctx.globalAlpha = 0.38;
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 20, -2.2, 2.2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  window.drawBirdSkin = drawBirdSkinV1;
  if (window.game) {
    window.game.__heroBlueNinjaV1Installed = true;
    try { window.game.updatePreview?.(); } catch (_) {}
  }
  window.__FF_HERO_BLUE_NINJA_V1__ = VERSION;
})();
