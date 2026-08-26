(() => {
  'use strict';
  if (window.__FF_W1_CROW_CONTRAST_V1__) return;

  const TAU = Math.PI * 2;

  function install() {
    const game = window.game;
    if (!game || typeof window.drawMinionCrow !== 'function') return false;
    if (game.__ffW1CrowContrastV1Installed) return true;

    function findMeta(x, y) {
      if (!game.minions?.length) return null;
      let best = null, bestD = Infinity;
      for (const m of game.minions) {
        const d = Math.abs((m.x || 0) - x) + Math.abs((m.y || 0) - y);
        if (d < bestD) { best = m; bestD = d; }
      }
      if (!best || bestD > 12) return null;
      if (best.__ffContrastPhase == null) best.__ffContrastPhase = Math.random() * TAU;
      return best;
    }

    function drawCrow(ctx, x, y, frame) {
      const meta = findMeta(x, y);
      const phase = meta?.__ffContrastPhase || 0;
      const flap = Math.sin(frame * .28 + phase);
      const bob = Math.sin(frame * .085 + phase) * .45;

      ctx.save();
      ctx.translate(x, y + bob);
      ctx.rotate(flap * .012);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const aura = ctx.createRadialGradient(0, 0, 7, 0, 0, 21);
      aura.addColorStop(0, 'rgba(150,165,215,.07)');
      aura.addColorStop(1, 'rgba(110,120,175,0)');
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#1a2032';
      for (const a of [-.17,.02,.19]) {
        ctx.save(); ctx.translate(9, 2); ctx.rotate(a);
        ctx.beginPath(); ctx.moveTo(0,-3); ctx.lineTo(14,0); ctx.lineTo(1,3.2); ctx.closePath();
        ctx.fill(); ctx.restore();
      }

      const body = ctx.createLinearGradient(-12,-10,12,10);
      body.addColorStop(0, '#414860');
      body.addColorStop(.52, '#293047');
      body.addColorStop(1, '#121724');
      ctx.fillStyle = body;
      ctx.strokeStyle = '#080b13';
      ctx.lineWidth = 1.7;
      ctx.beginPath(); ctx.ellipse(.5,1.2,12.8,9.7,-.035,0,TAU); ctx.fill(); ctx.stroke();

      ctx.strokeStyle = 'rgba(226,231,255,.48)';
      ctx.lineWidth = .95;
      ctx.beginPath(); ctx.arc(-.4,-.5,11.4,Math.PI*1.08,Math.PI*1.78); ctx.stroke();

      const lift = flap * 2.3;
      const wing = ctx.createLinearGradient(-2,-7,11,7);
      wing.addColorStop(0,'#3b435e');
      wing.addColorStop(.62,'#252c43');
      wing.addColorStop(1,'#111622');
      ctx.fillStyle = wing;
      ctx.strokeStyle = '#080b13';
      ctx.lineWidth = 1.45;
      ctx.beginPath();
      ctx.moveTo(-2,-2);
      ctx.quadraticCurveTo(4,-7-lift,10+flap,-5-lift);
      ctx.lineTo(7,-lift*.25);
      ctx.lineTo(11,3+lift*.18);
      ctx.lineTo(5,4.5);
      ctx.quadraticCurveTo(1,4,-2,1);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(226,231,255,.40)';
      ctx.lineWidth = .8;
      ctx.beginPath(); ctx.moveTo(1,-1); ctx.quadraticCurveTo(5,-3-lift*.4,8.5,-2.3-lift*.45); ctx.stroke();

      const head = ctx.createLinearGradient(-13,-12,1,3);
      head.addColorStop(0,'#434a62');
      head.addColorStop(1,'#252c40');
      ctx.fillStyle = head; ctx.strokeStyle = '#080b13'; ctx.lineWidth = 1.55;
      ctx.beginPath(); ctx.arc(-6.2,-4.1,7.2,0,TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#394057';
      ctx.beginPath(); ctx.moveTo(-5.5,-8.8); ctx.lineTo(-2.3,-14); ctx.lineTo(.2,-9.6); ctx.lineTo(4.4,-12.2); ctx.lineTo(3.4,-7.6); ctx.closePath(); ctx.fill();

      ctx.save();
      ctx.shadowColor = 'rgba(255,72,96,.95)'; ctx.shadowBlur = 4;
      ctx.fillStyle = '#fff7f8';
      ctx.beginPath(); ctx.ellipse(-6.4,-4.6,3.9,2.8,-.12,0,TAU); ctx.fill();
      ctx.fillStyle = '#ff4d6d';
      ctx.beginPath(); ctx.ellipse(-6.2,-4.5,1.55,2.15,-.12,0,TAU); ctx.fill();
      ctx.restore();

      const beak = ctx.createLinearGradient(-17,-3,-7,3);
      beak.addColorStop(0,'#a2a7b5'); beak.addColorStop(1,'#404553');
      ctx.fillStyle = beak; ctx.strokeStyle = '#080b13'; ctx.lineWidth = 1.25;
      ctx.beginPath(); ctx.moveTo(-10.8,-3.4); ctx.lineTo(-17.2,-.6); ctx.lineTo(-11.1,2.4); ctx.lineTo(-7.2,.3); ctx.closePath(); ctx.fill(); ctx.stroke();

      ctx.restore();
    }

    window.drawMinionCrow = drawCrow;
    game.__ffW1CrowContrastV1Installed = true;
    window.__FF_W1_CROW_CONTRAST_V1__ = {
      version: 'world1-crow-contrast-v1',
      body: 'cool blue-gray charcoal',
      rim: 'thin cool rim light',
      eye: 'clear red enemy eye',
      sizeChanged: false,
      hitboxChanged: false,
      aiChanged: false
    };
    console.log('[FF-LAB] world1-crow-contrast-v1-installed');
    return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 180) clearInterval(timer);
  }, 50);
})();
