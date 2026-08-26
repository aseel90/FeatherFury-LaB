(() => {
  'use strict';

  if (window.__FF_CROW_KING_INGAME_V4__) return;

  const TWO_PI = Math.PI * 2;

  function pathFillStroke(ctx, fill, stroke = '#090713', lineWidth = 2.4) {
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function drawFeatherCrown(ctx, enraged) {
    const feathers = enraged ? [
      { x:-25, y:-24, a:-0.62, h:27, w:9.5 },
      { x:-13, y:-31, a:-0.27, h:34, w:10.5 },
      { x:0, y:-35, a:0.00, h:38, w:11.5 },
      { x:13, y:-31, a:0.27, h:34, w:10.5 },
      { x:25, y:-24, a:0.62, h:27, w:9.5 }
    ] : [
      { x:-22, y:-26, a:-0.48, h:23, w:9 },
      { x:-11, y:-31, a:-0.20, h:28, w:10 },
      { x:0, y:-34, a:0.00, h:31, w:10.5 },
      { x:11, y:-31, a:0.20, h:28, w:10 },
      { x:22, y:-26, a:0.48, h:23, w:9 }
    ];
    const base = enraged ? '#2f145a' : '#1b1637';
    const mid = enraged ? '#54208f' : '#2e2460';
    const hi = enraged ? '#9333ea' : '#4338ca';
    for (const f of feathers) {
      ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.a);
      const g = ctx.createLinearGradient(0, 0, 0, -f.h);
      g.addColorStop(0, base); g.addColorStop(0.56, mid); g.addColorStop(1, hi);
      ctx.beginPath();
      ctx.moveTo(-f.w * 0.48, 2);
      ctx.lineTo(-f.w * 0.62, -f.h * 0.36);
      ctx.quadraticCurveTo(-f.w * 0.52, -f.h * 0.72, 0, -f.h);
      ctx.quadraticCurveTo(f.w * 0.52, -f.h * 0.72, f.w * 0.62, -f.h * 0.36);
      ctx.lineTo(f.w * 0.48, 2);
      ctx.closePath(); pathFillStroke(ctx, g, '#090713', enraged ? 2.35 : 2.1);
      ctx.strokeStyle = enraged ? 'rgba(233,213,255,.38)' : 'rgba(196,181,253,.28)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(0, -f.h + 5); ctx.stroke(); ctx.restore();
    }
    ctx.save(); ctx.translate(0, enraged ? -31 : -29);
    ctx.fillStyle = enraged ? '#e9d5ff' : '#a78bfa';
    ctx.shadowColor = enraged ? 'rgba(216,180,254,.95)' : 'rgba(139,92,246,.58)';
    ctx.shadowBlur = enraged ? 12 : 4;
    const gem = enraged ? 7.5 : 6;
    ctx.beginPath(); ctx.moveTo(0, -gem); ctx.lineTo(gem * .78, 0); ctx.lineTo(0, gem + 1); ctx.lineTo(-gem * .78, 0); ctx.closePath();
    pathFillStroke(ctx, ctx.fillStyle, '#10091f', 1.6);
    if (enraged) {
      ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.moveTo(0,-4); ctx.lineTo(3,0); ctx.lineTo(0,4); ctx.lineTo(-3,0); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function drawFoldedWing(ctx, side, enraged) {
    ctx.save(); ctx.translate(side * 24, 4); ctx.scale(side, 1);
    const g = ctx.createLinearGradient(-8, -20, 20, 25);
    g.addColorStop(0, enraged ? '#482076' : '#242441');
    g.addColorStop(0.58, enraged ? '#281442' : '#17192d');
    g.addColorStop(1, '#0b0d18');

    if (enraged) {
      ctx.beginPath();
      ctx.moveTo(-5, -18); ctx.lineTo(12, -19); ctx.lineTo(22, -10);
      ctx.lineTo(13, -5); ctx.lineTo(23, 2); ctx.lineTo(14, 7);
      ctx.lineTo(21, 16); ctx.lineTo(10, 25); ctx.lineTo(-3, 21);
      ctx.quadraticCurveTo(3, 8, -5, -18); ctx.closePath();
      pathFillStroke(ctx, g, '#080711', 2.6);
      ctx.strokeStyle = 'rgba(216,180,254,.34)'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(0,-10); ctx.lineTo(15,-10); ctx.moveTo(2,-2); ctx.lineTo(17,2); ctx.moveTo(1,7); ctx.lineTo(14,14); ctx.stroke();
      ctx.fillStyle = 'rgba(168,85,247,.26)';
      ctx.beginPath(); ctx.moveTo(15,-16); ctx.lineTo(23,-10); ctx.lineTo(14,-8); ctx.closePath(); ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(-4, -17); ctx.quadraticCurveTo(13, -16, 18, -4);
      ctx.quadraticCurveTo(23, 8, 13, 24); ctx.quadraticCurveTo(6, 29, -3, 21);
      ctx.quadraticCurveTo(3, 8, -4, -17); ctx.closePath(); pathFillStroke(ctx, g, '#080711', 2.3);
      ctx.strokeStyle = 'rgba(148,163,184,.18)'; ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(2, -4 + i * 7); ctx.quadraticCurveTo(10, 1 + i * 7, 14, 8 + i * 6); ctx.stroke(); }
    }
    ctx.restore();
  }

  function drawTail(ctx, enraged) {
    ctx.save(); ctx.translate(29, 7);
    const base = enraged ? '#2f1554' : '#14182a';
    const count = enraged ? 4 : 3;
    for (let n = 0; n < count; n++) {
      const i = n - (count - 1) / 2;
      ctx.save(); ctx.rotate(i * (enraged ? 0.16 : 0.18));
      ctx.beginPath();
      ctx.moveTo(0, -5);
      if (enraged) {
        ctx.lineTo(19, -8); ctx.lineTo(32, 0); ctx.lineTo(18, 8); ctx.lineTo(0, 6);
      } else {
        ctx.quadraticCurveTo(18, -7, 31, 0); ctx.quadraticCurveTo(18, 8, 0, 6);
      }
      ctx.closePath(); pathFillStroke(ctx, base, '#080711', enraged ? 2 : 1.8); ctx.restore();
    }
    ctx.restore();
  }

  function drawPhase2ShoulderPlumes(ctx) {
    for (const side of [-1, 1]) {
      ctx.save(); ctx.scale(side, 1); ctx.translate(30, -8);
      const g = ctx.createLinearGradient(0, -20, 18, 12);
      g.addColorStop(0, '#7e22ce'); g.addColorStop(1, '#171329');
      for (let i = 0; i < 3; i++) {
        ctx.save(); ctx.rotate(-0.58 + i * 0.34);
        ctx.beginPath(); ctx.moveTo(-2, 3); ctx.lineTo(7, -16 - i * 2); ctx.lineTo(12, -2); ctx.lineTo(3, 8); ctx.closePath();
        pathFillStroke(ctx, g, '#080711', 1.8); ctx.restore();
      }
      ctx.restore();
    }
  }

  function drawPhase2FaceArmor(ctx, frame) {
    const pulse = 0.5 + Math.sin(frame * 0.13) * 0.5;
    ctx.save();
    const armor = ctx.createLinearGradient(-24, -20, 24, 6);
    armor.addColorStop(0, '#3b1765'); armor.addColorStop(.5, '#1f1738'); armor.addColorStop(1, '#3b1765');
    ctx.fillStyle = armor; ctx.strokeStyle = '#090713'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-28,-17); ctx.lineTo(-9,-18); ctx.lineTo(0,-9); ctx.lineTo(9,-18); ctx.lineTo(28,-17);
    ctx.lineTo(22,-7); ctx.lineTo(8,-10); ctx.lineTo(0,-2); ctx.lineTo(-8,-10); ctx.lineTo(-22,-7); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = `rgba(216,180,254,${0.24 + pulse * 0.22})`; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(-18,-14); ctx.lineTo(-6,-13); ctx.lineTo(0,-7); ctx.lineTo(6,-13); ctx.lineTo(18,-14); ctx.stroke();
    ctx.restore();
  }

  function drawPhase2ChestCore(ctx, frame) {
    const pulse = 0.5 + Math.sin(frame * 0.16) * 0.5;
    ctx.save(); ctx.translate(0, 17); ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = 'rgba(168,85,247,.85)'; ctx.shadowBlur = 7 + pulse * 5;
    ctx.fillStyle = `rgba(192,132,252,${0.55 + pulse * 0.28})`;
    ctx.beginPath(); ctx.moveTo(0,-7); ctx.lineTo(5,0); ctx.lineTo(0,8); ctx.lineTo(-5,0); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = `rgba(233,213,255,${0.45 + pulse * .35})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0,-10); ctx.lineTo(0,10); ctx.moveTo(-8,1); ctx.lineTo(-3,1); ctx.moveTo(3,1); ctx.lineTo(8,1); ctx.stroke();
    ctx.restore();
  }

  function drawBossAura(ctx, frame, enraged) {
    const pulse = 0.5 + Math.sin(frame * 0.09) * 0.5;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const radius = enraged ? 61 + pulse * 5 : 48 + pulse * 3;
    const glow = ctx.createRadialGradient(0, 0, 14, 0, 0, radius);
    glow.addColorStop(0, enraged ? 'rgba(192,132,252,.18)' : 'rgba(109,40,217,.09)');
    glow.addColorStop(0.5, enraged ? 'rgba(126,34,206,.24)' : 'rgba(91,33,182,.10)');
    glow.addColorStop(1, 'rgba(30,27,75,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, radius, 0, TWO_PI); ctx.fill();
    ctx.strokeStyle = enraged ? `rgba(216,180,254,${0.25 + pulse * 0.28})` : `rgba(139,92,246,${0.10 + pulse * 0.10})`;
    ctx.lineWidth = enraged ? 2 : 1.2; ctx.setLineDash(enraged ? [2, 5] : [4, 8]);
    ctx.beginPath(); ctx.ellipse(0, 2, radius * 0.72, radius * 0.63, 0, 0, TWO_PI); ctx.stroke(); ctx.setLineDash([]);
    if (enraged) {
      for (let i = 0; i < 8; i++) {
        const a = frame * 0.032 + i * (TWO_PI / 8), r = 43 + (i % 2) * 9;
        ctx.save(); ctx.translate(Math.cos(a) * r, Math.sin(a * 1.17) * 34); ctx.rotate(a + 0.6);
        ctx.fillStyle = `rgba(192,132,252,${0.34 + pulse * 0.24})`; ctx.beginPath();
        ctx.moveTo(-5, 0); ctx.lineTo(1, -3); ctx.lineTo(6, 0); ctx.lineTo(1, 3); ctx.closePath(); ctx.fill(); ctx.restore();
      }
      for (let i = -2; i <= 2; i++) {
        const fx = i * 16, fy = -39 - Math.abs(i) * 2;
        ctx.fillStyle = `rgba(147,51,234,${0.13 + pulse * 0.12})`;
        ctx.beginPath(); ctx.moveTo(fx - 5, fy + 10); ctx.quadraticCurveTo(fx - 9, fy - 3, fx, fy - 13 - pulse * 5); ctx.quadraticCurveTo(fx + 8, fy - 1, fx + 5, fy + 10); ctx.closePath(); ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawCrowKingBody(ctx, frame, enraged) {
    const hover = Math.sin(frame * 0.07) * 1.25;
    ctx.save(); ctx.translate(0, hover);
    drawBossAura(ctx, frame, enraged);
    drawTail(ctx, enraged);
    drawFoldedWing(ctx, -1, enraged); drawFoldedWing(ctx, 1, enraged);
    if (enraged) drawPhase2ShoulderPlumes(ctx);

    const body = ctx.createLinearGradient(-28, -24, 28, 31);
    body.addColorStop(0, enraged ? '#2d1f46' : '#20263a');
    body.addColorStop(0.55, enraged ? '#171126' : '#151a29');
    body.addColorStop(1, '#0a0d16');
    ctx.beginPath(); ctx.ellipse(0, 5, 34, 32, 0, 0, TWO_PI); pathFillStroke(ctx, body, '#070710', 3);

    ctx.fillStyle = enraged ? '#f1dfcc' : '#d8c7b3'; ctx.beginPath();
    if (enraged) {
      ctx.moveTo(-20, 10); ctx.lineTo(-9, 7); ctx.lineTo(0, 17); ctx.lineTo(10, 7); ctx.lineTo(21, 10); ctx.lineTo(14, 18); ctx.lineTo(0, 30); ctx.lineTo(-14, 18);
    } else {
      ctx.moveTo(-18, 11); ctx.lineTo(-8, 8); ctx.lineTo(0, 18); ctx.lineTo(9, 8); ctx.lineTo(19, 11); ctx.lineTo(0, 28);
    }
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = enraged ? '#161022' : '#121726'; ctx.beginPath();
    ctx.moveTo(-29, -14); ctx.quadraticCurveTo(-16, -27, 0, -22); ctx.quadraticCurveTo(16, -27, 29, -14);
    ctx.lineTo(25, 4); ctx.quadraticCurveTo(12, -2, 0, 2); ctx.quadraticCurveTo(-12, -2, -25, 4); ctx.closePath(); ctx.fill();

    if (enraged) drawPhase2FaceArmor(ctx, frame);

    ctx.save();
    ctx.shadowColor = enraged ? 'rgba(216,180,254,.98)' : 'rgba(139,92,246,.55)';
    ctx.shadowBlur = enraged ? 12 : 4;
    ctx.fillStyle = enraged ? '#fff7ff' : '#fffdf7';
    ctx.beginPath();
    if (enraged) {
      ctx.moveTo(-26, -14); ctx.lineTo(-6, -11); ctx.quadraticCurveTo(-9, 0, -20, -1); ctx.quadraticCurveTo(-27, -4, -26, -14);
    } else {
      ctx.moveTo(-25, -14); ctx.quadraticCurveTo(-15, -17, -5, -11); ctx.quadraticCurveTo(-8, -1, -19, -2); ctx.quadraticCurveTo(-25, -5, -25, -14);
    }
    ctx.fill();
    ctx.beginPath();
    if (enraged) {
      ctx.moveTo(26, -14); ctx.lineTo(6, -11); ctx.quadraticCurveTo(9, 0, 20, -1); ctx.quadraticCurveTo(27, -4, 26, -14);
    } else {
      ctx.moveTo(25, -14); ctx.quadraticCurveTo(15, -17, 5, -11); ctx.quadraticCurveTo(8, -1, 19, -2); ctx.quadraticCurveTo(25, -5, 25, -14);
    }
    ctx.fill(); ctx.restore();

    ctx.fillStyle = enraged ? '#d946ef' : '#7c3aed';
    ctx.beginPath(); ctx.ellipse(-13, -8, enraged ? 3.6 : 3.2, enraged ? 5.8 : 5.2, -0.12, 0, TWO_PI); ctx.fill();
    ctx.beginPath(); ctx.ellipse(13, -8, enraged ? 3.6 : 3.2, enraged ? 5.8 : 5.2, 0.12, 0, TWO_PI); ctx.fill();

    ctx.fillStyle = '#070710';
    ctx.beginPath(); ctx.moveTo(-28, enraged ? -20 : -18); ctx.lineTo(-5, -12); ctx.lineTo(-8, -6); ctx.lineTo(-25, -11); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(28, enraged ? -20 : -18); ctx.lineTo(5, -12); ctx.lineTo(8, -6); ctx.lineTo(25, -11); ctx.closePath(); ctx.fill();

    const beak = ctx.createLinearGradient(-8, -4, 0, 11);
    beak.addColorStop(0, enraged ? '#8b5cf6' : '#6b7280'); beak.addColorStop(1, enraged ? '#312e49' : '#27272a');
    ctx.beginPath(); ctx.moveTo(-8, -4); ctx.quadraticCurveTo(0, -8, 8, -4); ctx.lineTo(0, 10); ctx.closePath(); pathFillStroke(ctx, beak, '#080711', 1.8);

    if (enraged) drawPhase2ChestCore(ctx, frame);
    drawFeatherCrown(ctx, enraged);
    ctx.restore();
  }

  function drawShadowCrow(ctx, x, y, scale, alpha) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.globalAlpha *= alpha; ctx.fillStyle = '#120b25'; ctx.shadowColor = 'rgba(126,34,206,.65)'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.ellipse(0, 0, 20, 12, 0, 0, TWO_PI); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-10, -3); ctx.lineTo(-31, -19); ctx.lineTo(-22, 1); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(8, -3); ctx.lineTo(27, -16); ctx.lineTo(21, 3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-19, -2); ctx.lineTo(-31, 2); ctx.lineTo(-18, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c084fc'; ctx.beginPath(); ctx.arc(-13, -3, 2.1, 0, TWO_PI); ctx.fill(); ctx.restore();
  }

  function drawDashTrail(ctx, x, y, frame, enraged) {
    if (!enraged) return;
    for (let i = 1; i <= 3; i++) drawShadowCrow(ctx, x + 22 + i * 22, y + Math.sin(frame * 0.12 + i) * 3, 0.76 - i * 0.08, 0.20 - i * 0.035);
  }

  function drawDashTelegraph(ctx, x, y, frame) {
    const pulse = 0.18 + (Math.sin(frame * 0.42) + 1) * 0.07; ctx.save();
    const lane = ctx.createLinearGradient(0, y, x, y); lane.addColorStop(0, 'rgba(168,85,247,0)'); lane.addColorStop(0.55, `rgba(168,85,247,${pulse})`); lane.addColorStop(1, 'rgba(239,68,68,0.04)');
    ctx.fillStyle = lane; ctx.fillRect(0, y - 24, Math.max(0, x - 28), 48); ctx.strokeStyle = `rgba(216,180,254,${0.32 + pulse})`; ctx.setLineDash([7, 9]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(Math.max(0, x - 30), y); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  }

  function drawShotTelegraph(ctx, x, y, tele, frame) {
    if (!tele) return;
    const progress = 1 - Math.max(0, tele.delay) / Math.max(1, tele.total), radius = 7 + progress * 11, pulse = 0.5 + Math.sin(frame * 0.28) * 0.5;
    ctx.save(); ctx.translate(x - 33, y - 1); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = tele.pattern === 'SPREAD' ? `rgba(251,146,60,${0.62 + pulse * 0.20})` : `rgba(192,132,252,${0.68 + pulse * 0.22})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, radius, -2.2, 2.2); ctx.stroke(); ctx.fillStyle = tele.pattern === 'SPREAD' ? 'rgba(251,146,60,.13)' : 'rgba(168,85,247,.14)'; ctx.beginPath(); ctx.arc(0, 0, radius * 0.52, 0, TWO_PI); ctx.fill(); ctx.restore();
  }

  function drawCrowFeather(ctx, x, y, vx, vy) {
    const angle = Math.atan2(vy, vx); ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.shadowColor = 'rgba(168,85,247,.62)'; ctx.shadowBlur = 7;
    const grad = ctx.createLinearGradient(-11, 0, 11, 0); grad.addColorStop(0, '#21113f'); grad.addColorStop(0.55, '#7c3aed'); grad.addColorStop(1, '#d8b4fe'); ctx.fillStyle = grad;
    ctx.beginPath(); ctx.moveTo(-11, 0); ctx.quadraticCurveTo(-2, -5.2, 10, -1.4); ctx.quadraticCurveTo(1, 5.3, -11, 0); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(233,213,255,.72)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(9, -0.8); ctx.stroke(); ctx.restore();
  }

  function install() {
    const game = window.game;
    if (!game || typeof game.drawCrowBoss !== 'function') return false;
    if (game.__ffCrowKingIngameV4Installed) return true;
    game.drawCrowBoss = function(ctx, x, y, frame, isEnraged) {
      const crow = this.boss && this.boss.type === 'crow';
      if (crow && this.state === 'PLAYING' && this.boss.state === 'DASH_PREP') drawDashTelegraph(ctx, x, y, frame || 0);
      if (crow && this.state === 'PLAYING' && this.boss.state === 'DASHING') drawDashTrail(ctx, x, y, frame || 0, !!isEnraged);
      ctx.save(); ctx.translate(x, y); drawCrowKingBody(ctx, frame || 0, !!isEnraged); ctx.restore();
      if (crow && this.state === 'PLAYING') drawShotTelegraph(ctx, x, y, this.boss.__ffTelegraph, frame || 0);
    };
    game.drawCrowFeather = drawCrowFeather;
    game.__ffCrowKingIngameV4Installed = true;
    window.__FF_CROW_KING_INGAME_V4__ = { version:'crow-king-ingame-v4', phase1:'royal-feather-crown', phase2:'transformed-war-form-fixed-body', dash:'shadow-crow-trail', projectile:'violet-feather' };
    console.log('[FF-LAB] crow-king-ingame-v4-installed'); return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => { tries++; if (install() || tries > 180) clearInterval(timer); }, 50);
})();