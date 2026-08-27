(() => {
  'use strict';

  // Preserve the full World 2 visual system from the last known-good revision,
  // then only replace the tiny early-stage penguin thrower artwork.
  const stableVisuals = 'https://cdn.jsdelivr.net/gh/aseel90/FeatherFury-LaB@9bd3b0f42769b66a8847eb34015d7720ed1ccdc2/w2-visuals-v1.js';

  function installSimpleThrower() {
    if (!window.game || !window.game.__w2VisualsV1Installed || typeof window.drawPenguinMinion !== 'function') return false;
    if (window.__FF_W2_SIMPLE_PENGUIN_THROWER_V1__) return true;

    window.drawPenguinMinion = function(ctx,x,y,frame) {
      const wobble = Math.sin(frame*.16 + x*.018) * 1.2;
      const throwPose = (Math.floor(frame/18)%5===4) ? 1 : 0;
      ctx.save();
      ctx.translate(x+wobble,y);

      // tiny shadow
      ctx.fillStyle='rgba(15,23,42,.18)';
      ctx.beginPath(); ctx.ellipse(0,13.6,10,3,0,0,Math.PI*2); ctx.fill();

      // simple compact penguin body
      ctx.fillStyle='#18243a';
      ctx.beginPath(); ctx.ellipse(0,1,10.2,13.2,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#e8f2fb';
      ctx.beginPath(); ctx.ellipse(0,4,6.2,8.5,0,0,Math.PI*2); ctx.fill();

      // head - no crown, no armor, no gem
      ctx.fillStyle='#223653';
      ctx.beginPath(); ctx.arc(0,-6.8,8.3,0,Math.PI*2); ctx.fill();

      // one tiny icy feather/tuft to connect it visually to the Emperor family
      ctx.fillStyle='#67d7ff';
      ctx.beginPath(); ctx.moveTo(-2.7,-13.6); ctx.lineTo(0,-16.5); ctx.lineTo(2.8,-13.6); ctx.closePath(); ctx.fill();

      // simple angry eyes
      ctx.fillStyle='#f8fbff';
      ctx.beginPath();
      ctx.ellipse(-3,-8.1,2.55,2.15,-.12,0,Math.PI*2);
      ctx.ellipse(3,-8.1,2.55,2.15,.12,0,Math.PI*2);
      ctx.fill();
      ctx.strokeStyle='#0f172a'; ctx.lineWidth=1.05;
      ctx.beginPath(); ctx.moveTo(-5.2,-10.2); ctx.lineTo(-1.1,-9.1); ctx.moveTo(5.2,-10.2); ctx.lineTo(1.1,-9.1); ctx.stroke();
      ctx.fillStyle='#38bdf8';
      ctx.beginPath(); ctx.arc(-2.8,-8,1.05,0,Math.PI*2); ctx.arc(2.8,-8,1.05,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#0f172a';
      ctx.beginPath(); ctx.arc(-2.65,-8,.48,0,Math.PI*2); ctx.arc(2.95,-8,.48,0,Math.PI*2); ctx.fill();

      // beak
      ctx.fillStyle='#f59e0b';
      ctx.beginPath(); ctx.moveTo(-3,-3.4); ctx.lineTo(0,.2); ctx.lineTo(3.8,-3.4); ctx.closePath(); ctx.fill();

      // plain flippers; only the throwing flipper animates strongly
      ctx.save(); ctx.translate(-8,0); ctx.rotate(-.30-throwPose*.30);
      ctx.fillStyle='#1d2c43'; ctx.beginPath(); ctx.ellipse(0,0,2.9,7,0,0,Math.PI*2); ctx.fill(); ctx.restore();
      ctx.save(); ctx.translate(8,0); ctx.rotate(.30+throwPose*.72);
      ctx.fillStyle='#1d2c43'; ctx.beginPath(); ctx.ellipse(0,0,2.9,7,0,0,Math.PI*2); ctx.fill(); ctx.restore();

      // tiny visible feet
      ctx.fillStyle='#f59e0b';
      ctx.beginPath();
      ctx.ellipse(-4.3,12.4,3.5,1.7,-.08,0,Math.PI*2);
      ctx.ellipse(4.3,12.4,3.5,1.7,.08,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    };

    window.__FF_W2_SIMPLE_PENGUIN_THROWER_V1__ = true;
    console.log('[FF-LAB] simple-world2-penguin-thrower-installed');
    return true;
  }

  const script = document.createElement('script');
  script.src = stableVisuals;
  script.async = false;
  script.onload = () => {
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (installSimpleThrower() || tries > 120) clearInterval(timer);
    }, 50);
    setTimeout(installSimpleThrower, 650);
  };
  script.onerror = () => console.error('[FF-LAB] failed to load stable World 2 visuals');
  document.head.appendChild(script);
})();