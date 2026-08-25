(() => {
  'use strict';

  const VERSION = 'fierce-falcon-v1';
  const baseDrawBirdSkin = window.drawBirdSkin;
  const stateByCtx = new WeakMap();
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function getVisualState(ctx, now) {
    let state = stateByCtx.get(ctx);
    if (!state) {
      state = { rotation: 0, lastTime: now };
      stateByCtx.set(ctx, state);
    }
    return state;
  }

  function polygon(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
  }

  function drawPredatorFever(ctx, w, h, now) {
    const pulse = 0.34 + Math.sin(now * 0.010) * 0.055;
    ctx.save();
    const aura = ctx.createRadialGradient(0, 0, w * 0.16, 0, 0, w * 0.73);
    aura.addColorStop(0, 'rgba(251,191,36,0)');
    aura.addColorStop(0.67, 'rgba(245,158,11,0.05)');
    aura.addColorStop(1, 'rgba(239,68,68,0.28)');
    ctx.globalAlpha = pulse;
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.67, h * 0.78, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const yy = -6 + i * 4;
      const trail = ctx.createLinearGradient(-w * 0.92, yy, -w * 0.50, yy);
      trail.addColorStop(0, 'rgba(185,28,28,0)');
      trail.addColorStop(0.48, 'rgba(239,68,68,0.48)');
      trail.addColorStop(1, 'rgba(251,191,36,0.78)');
      ctx.globalAlpha = 0.27 + i * 0.025;
      ctx.strokeStyle = trail;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-w * (0.88 + i * 0.025), yy);
      ctx.lineTo(-w * (0.51 + i * 0.012), yy);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFalconArt(ctx) {
    const outline = '#120b08';
    const brown = '#7c3f1d';
    const brownHi = '#a65d2b';
    const brownDark = '#3b2115';
    const band = '#241710';
    const cream = '#e6c28f';
    const gold = '#fbbf24';
    const goldDark = '#d97706';

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.fillStyle = brownDark;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.1;
    polygon(ctx, [[-16,-4],[-25,-9],[-23,-2],[-17,1]]); ctx.fill(); ctx.stroke();
    polygon(ctx, [[-17,1],[-25,5],[-22,10],[-14,4]]); ctx.fill(); ctx.stroke();

    ctx.fillStyle = brown;
    polygon(ctx, [[-15,6],[-22,9],[-17,11],[-22,14],[-13,13],[-9,8]]); ctx.fill(); ctx.stroke();

    ctx.fillStyle = brown;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(0, 1, 17.5, 14.3, -0.02, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.save();
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = brownHi;
    ctx.beginPath();
    ctx.ellipse(-4, -5, 11, 6.5, -0.18, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = cream;
    ctx.beginPath();
    ctx.moveTo(-2, 12.4);
    ctx.bezierCurveTo(2.5, 5.8, 10.5, 5.1, 16.5, 7.1);
    ctx.bezierCurveTo(13.2, 12.5, 6.7, 15.2, -2, 12.4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#5f2e17';
    ctx.globalAlpha = 0.72;
    ctx.beginPath(); ctx.ellipse(-7, 4, 1.9, 3.2, 0.25, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-2.5, 5.3, 1.8, 3.0, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = brown;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.1;
    polygon(ctx, [[-10,-11],[-12,-18],[-5,-14],[-4,-20],[2,-14],[5,-19],[8,-11]]);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = band;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(-15,-7.6);
    ctx.quadraticCurveTo(1,-11,15,-7.4);
    ctx.lineTo(15.8,-3.0);
    ctx.quadraticCurveTo(1,-5.2,-15,-3.4);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = gold;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.2;
    polygon(ctx, [[3,-8.5],[13,-6.5],[8,-4.4],[4,-5.4],[1,-6.6]]);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(5,-5.8);
    ctx.quadraticCurveTo(10,-5.0,13,-2.9);
    ctx.quadraticCurveTo(10.3,2.0,6.1,1.1);
    ctx.quadraticCurveTo(3.5,-0.4,5,-5.8);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = outline;
    ctx.beginPath(); ctx.arc(9.8,-1.1,1.15,0,Math.PI*2); ctx.fill();

    ctx.fillStyle = gold;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.8;
    polygon(ctx, [[14,-1.8],[21,1.3],[14,2.2]]); ctx.fill(); ctx.stroke();
    ctx.fillStyle = goldDark;
    polygon(ctx, [[14,2.2],[20,1.3],[16.2,5.1],[13,3.3]]); ctx.fill(); ctx.stroke();
  }

  function drawFalcon(ctx, x, y, rotation, scale = 1, inFever = false) {
    const now = performance.now();
    const state = getVisualState(ctx, now);
    const dt = clamp(now - state.lastTime, 0, 50);
    state.lastTime = now;
    const targetRotation = clamp((Number.isFinite(rotation) ? rotation : 0) * 0.46, -0.11, 0.20);
    const easing = 1 - Math.exp(-dt / 72);
    state.rotation += (targetRotation - state.rotation) * easing;
    const calm = Math.abs(targetRotation) < 0.055 && !inFever;
    const hoverY = calm ? Math.sin(now * 0.0062) * 0.48 : 0;
    const w = 43;
    const h = 39;

    ctx.save();
    ctx.translate(x, y + hoverY);
    ctx.scale(scale, scale);
    ctx.rotate(state.rotation);
    if (inFever) drawPredatorFever(ctx, w, h, now);
    drawFalconArt(ctx);
    ctx.restore();
  }

  window.drawBirdSkin = function(ctx, skinKey, x, y, rotation, wingCycle, scale = 1, inFever = false) {
    if (skinKey === 'falcon') return drawFalcon(ctx, x, y, rotation, scale, inFever);
    return baseDrawBirdSkin(ctx, skinKey, x, y, rotation, wingCycle, scale, inFever);
  };

  function recolorFalconParticles(game, startIndex) {
    if (!game || game.activeSkin !== 'falcon' || !Array.isArray(game.particles)) return;
    for (let i = startIndex; i < game.particles.length; i++) {
      const p = game.particles[i];
      if (!p) continue;
      p.color = Math.random() > 0.48 ? '#f59e0b' : '#ef4444';
    }
  }

  if (window.game && typeof window.game.launchDash === 'function' && !window.game.__falconLaunchFxWrapped) {
    const baseLaunchDash = window.game.launchDash.bind(window.game);
    window.game.launchDash = function(...args) {
      const startIndex = Array.isArray(this.particles) ? this.particles.length : 0;
      const result = baseLaunchDash(...args);
      recolorFalconParticles(this, startIndex);
      return result;
    };
    window.game.__falconLaunchFxWrapped = true;
  }

  if (window.game) {
    window.game.__fierceFalconV1Installed = true;
    try { window.game.updatePreview?.(); } catch (_) {}
    try { window.game.renderShop?.(); } catch (_) {}
  }
  window.__FF_FIERCE_FALCON_V1__ = VERSION;
})();
