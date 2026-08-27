(() => {
  'use strict';

  function install() {
    const game = window.game;
    if (!game?.__w2VisualsV1Installed || typeof game.drawPenguinBossSprite !== 'function') return false;
    if (game.__w2EmperorArtV1Installed) return true;

    function fillIceShard(ctx, points, enraged, alpha = 1) {
      const minY = Math.min(...points.map(p => p[1]));
      const maxY = Math.max(...points.map(p => p[1]));
      const grad = ctx.createLinearGradient(0, minY, 0, maxY || minY + 1);
      grad.addColorStop(0, enraged ? `rgba(254,202,202,${alpha})` : `rgba(224,247,255,${alpha})`);
      grad.addColorStop(.45, `rgba(125,211,252,${alpha})`);
      grad.addColorStop(1, enraged ? `rgba(37,99,235,${alpha})` : `rgba(30,100,170,${alpha})`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = enraged ? `rgba(253,164,175,${.54 * alpha})` : `rgba(186,230,253,${.58 * alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function drawCrown(ctx, frame, enraged) {
      const shimmer = .55 + .25 * Math.sin(frame * .11);
      ctx.save();
      ctx.translate(0, -78);
      ctx.fillStyle = enraged ? '#7f1d1d' : '#153a5b';
      ctx.beginPath();
      ctx.moveTo(-17, 5); ctx.lineTo(17, 5); ctx.lineTo(14, 12); ctx.lineTo(-14, 12);
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur = enraged ? 10 : 7;
      ctx.shadowColor = enraged ? 'rgba(248,113,113,.62)' : 'rgba(56,189,248,.66)';
      fillIceShard(ctx, [[-15,5],[-12,-9],[-6,0],[-2,-18],[2,0],[8,-11],[11,1],[16,-7],[17,5]], enraged);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = shimmer;
      ctx.strokeStyle = '#f0fbff';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-2,-15); ctx.lineTo(1,-1);
      ctx.moveTo(-11,-6); ctx.lineTo(-8,2);
      ctx.moveTo(9,-8); ctx.lineTo(11,1);
      ctx.stroke();
      ctx.restore();
    }

    function drawShoulderArmor(ctx, side, enraged, phase2) {
      ctx.save();
      ctx.scale(side, 1);
      const alpha = phase2 ? 1 : .88;
      fillIceShard(ctx, [[21,-49],[35,-55],[31,-42],[43,-44],[31,-34],[20,-37]], enraged, alpha);
      if (phase2) fillIceShard(ctx, [[30,-50],[39,-66],[39,-48]], enraged, .76);
      ctx.restore();
    }

    function drawWing(ctx, side, pose, enraged) {
      const slide = pose === 'slide';
      const airborne = pose === 'air';
      const attack = pose === 'attack';
      const angle = slide ? -.32 : airborne ? -.58 : attack ? -.20 : -.08;
      const sweep = airborne ? 6 : attack ? 4 : 0;
      ctx.save();
      ctx.scale(side, 1);
      ctx.translate(24, -37);
      ctx.rotate(angle);
      const grad = ctx.createLinearGradient(0, -8, 28, 24);
      grad.addColorStop(0, enraged ? '#5d1724' : '#172a41');
      grad.addColorStop(1, enraged ? '#2b1018' : '#0b1728');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-2,-5);
      ctx.quadraticCurveTo(19,-3,27 + sweep,14);
      ctx.quadraticCurveTo(17,24,4,16);
      ctx.quadraticCurveTo(-1,8,-2,-5);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = enraged ? 'rgba(251,113,133,.35)' : 'rgba(125,211,252,.24)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }

    function drawChestCrystal(ctx, frame, enraged, phase2) {
      const pulse = .78 + .22 * Math.sin(frame * .13);
      ctx.save();
      ctx.translate(0, -27);
      ctx.shadowBlur = phase2 ? 9 : 5;
      ctx.shadowColor = enraged ? '#fb7185' : '#38bdf8';
      const grad = ctx.createLinearGradient(0, -9, 0, 10);
      grad.addColorStop(0, enraged ? '#fecdd3' : '#e0f7ff');
      grad.addColorStop(.45, enraged ? '#fb7185' : '#67e8f9');
      grad.addColorStop(1, enraged ? '#be123c' : '#2563eb');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0,-10); ctx.lineTo(7,-2); ctx.lineTo(4,8); ctx.lineTo(0,12); ctx.lineTo(-4,8); ctx.lineTo(-7,-2);
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = .42 + pulse * .28;
      ctx.strokeStyle = '#f8fdff'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-1,-7); ctx.lineTo(2,7); ctx.stroke();
      ctx.restore();
    }

    function drawFace(ctx, enraged, phase2) {
      ctx.save();
      ctx.translate(0, -62);
      ctx.fillStyle = enraged ? '#39101a' : '#0b1728';
      ctx.beginPath(); ctx.ellipse(0,2,21,18,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#f5fbff';
      ctx.beginPath();
      ctx.ellipse(-8,1,7,6,-.15,0,Math.PI*2);
      ctx.ellipse(8,1,7,6,.15,0,Math.PI*2);
      ctx.fill();
      const eye = enraged ? '#fb7185' : '#38bdf8';
      ctx.fillStyle = '#07111f';
      ctx.beginPath(); ctx.ellipse(-7.3,1,3.3,3.6,0,0,Math.PI*2); ctx.ellipse(7.3,1,3.3,3.6,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = eye;
      ctx.beginPath(); ctx.arc(-7.1,1.2,1.55,0,Math.PI*2); ctx.arc(7.1,1.2,1.55,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = .72;
      ctx.beginPath(); ctx.arc(-6.6,.6,.45,0,Math.PI*2); ctx.arc(7.6,.6,.45,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = enraged ? '#fecaca' : '#9bdff1';
      ctx.lineWidth = phase2 ? 3.2 : 2.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-15,-7); ctx.lineTo(-4,-4);
      ctx.moveTo(15,-7); ctx.lineTo(4,-4);
      ctx.stroke();
      const beak = ctx.createLinearGradient(0,7,0,17);
      beak.addColorStop(0,'#fbbf24'); beak.addColorStop(1,'#d97706');
      ctx.fillStyle = beak;
      ctx.beginPath();
      ctx.moveTo(-7,8); ctx.lineTo(0,16); ctx.lineTo(8,8); ctx.lineTo(0,11);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    function drawArmorCracks(ctx, frame, enraged) {
      ctx.save();
      ctx.globalAlpha = .36 + .12 * Math.sin(frame * .16);
      ctx.strokeStyle = enraged ? '#fecaca' : '#a5f3fc';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-22,-43); ctx.lineTo(-15,-35); ctx.lineTo(-19,-27);
      ctx.moveTo(22,-43); ctx.lineTo(15,-35); ctx.lineTo(19,-27);
      ctx.moveTo(-8,-15); ctx.lineTo(-3,-8); ctx.lineTo(-6,-2);
      ctx.stroke();
      ctx.restore();
    }

    game.drawPenguinBossSprite = function(ctx, x, y, frame, enraged) {
      const boss = this.boss;
      const state = boss?.state || 'IDLE';
      const phase2 = !!(enraged || boss?.__w2V6Phase2Started);
      const slide = state === 'SLIDE_PREP' || state === 'SLIDING';
      const airborne = state === 'JUMP_PREP' || state === 'JUMPING' || state === 'LANDING';
      const attack = state === 'IDLE' && Number(boss?.__w2V8FireCooldown) < 16;
      const pose = slide ? 'slide' : airborne ? 'air' : attack ? 'attack' : 'idle';
      const breath = Math.sin((frame || 0) * .09);
      const crouch = state === 'SLIDE_PREP' ? 2.5 : state === 'JUMP_PREP' ? 3.5 : state === 'LANDING' ? 1.8 : 0;
      const lean = slide ? -.085 : state === 'RETURNING' ? .025 : 0;
      const bob = state === 'IDLE' ? breath * .7 : 0;

      ctx.save();
      ctx.translate(x, y + crouch + bob);
      ctx.rotate(lean);
      ctx.fillStyle = 'rgba(2,6,23,.30)';
      ctx.beginPath(); ctx.ellipse(0,4,38,8.5,0,0,Math.PI*2); ctx.fill();

      ctx.fillStyle = enraged ? '#3b1220' : '#102b46';
      ctx.beginPath();
      ctx.moveTo(-25,-52); ctx.lineTo(-35,-21); ctx.lineTo(-28,-2); ctx.lineTo(-14,-12);
      ctx.lineTo(0,-4); ctx.lineTo(14,-12); ctx.lineTo(28,-2); ctx.lineTo(35,-21); ctx.lineTo(25,-52);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = enraged ? 'rgba(251,113,133,.28)' : 'rgba(125,211,252,.28)';
      ctx.lineWidth = 1.2; ctx.stroke();

      drawShoulderArmor(ctx, -1, enraged, phase2);
      drawShoulderArmor(ctx, 1, enraged, phase2);
      drawWing(ctx, -1, pose, enraged);
      drawWing(ctx, 1, pose, enraged);

      const bodyGrad = ctx.createLinearGradient(0,-63,0,4);
      bodyGrad.addColorStop(0, enraged ? '#49121d' : '#17283d');
      bodyGrad.addColorStop(.58, enraged ? '#2c1018' : '#0d1b2d');
      bodyGrad.addColorStop(1, '#07111f');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.ellipse(0,-29,32,39,0,0,Math.PI*2); ctx.fill();

      const belly = ctx.createLinearGradient(0,-49,0,4);
      belly.addColorStop(0,'#f8fdff');
      belly.addColorStop(.55,'#dcecf2');
      belly.addColorStop(1,'#9fc4d2');
      ctx.fillStyle = belly;
      ctx.beginPath(); ctx.ellipse(0,-23,20,29,0,0,Math.PI*2); ctx.fill();

      ctx.fillStyle = enraged ? '#9f2943' : '#26658a';
      ctx.beginPath();
      ctx.moveTo(-18,-51); ctx.lineTo(-9,-44); ctx.lineTo(0,-49); ctx.lineTo(9,-44); ctx.lineTo(18,-51);
      ctx.lineTo(13,-39); ctx.lineTo(0,-35); ctx.lineTo(-13,-39); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = enraged ? 'rgba(254,202,202,.42)' : 'rgba(186,230,253,.48)';
      ctx.lineWidth = 1; ctx.stroke();

      drawChestCrystal(ctx, frame || 0, enraged, phase2);
      if (phase2) drawArmorCracks(ctx, frame || 0, enraged);
      drawFace(ctx, enraged, phase2);
      drawCrown(ctx, frame || 0, enraged);

      ctx.fillStyle = '#e69a1f';
      ctx.beginPath(); ctx.ellipse(-15,2,9,3.2,-.06,0,Math.PI*2); ctx.ellipse(15,2,9,3.2,.06,0,Math.PI*2); ctx.fill();

      if (phase2) {
        ctx.globalAlpha = .20 + .06 * Math.sin((frame || 0) * .15);
        ctx.strokeStyle = enraged ? '#fb7185' : '#67e8f9';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(0,-31,34,41,0,0,Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    };

    game.__w2EmperorArtV1Installed = true;
    window.__FF_W2_EMPEROR_ART_V1__ = {
      version: 'w2-emperor-art-v1',
      canvas2d: true,
      gameplayGeometryChanged: false,
      hitboxesChanged: false,
      runtimeChanged: false,
      statePoses: ['idle','slide','air','attack'],
      reusableFactionMotifs: ['ice-crown','ice-collar','chest-crystal','angular-brow']
    };
    console.log('[FF-LAB] w2-emperor-art-v1-installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 120) clearInterval(timer);
  }, 80);
  setTimeout(install, 1200);
})();