(() => {
  'use strict';

  const VERSION = 'hero-blue-effects-v1';
  const BLUE = '#1178ee';
  const CYAN = '#38bdf8';
  const DEEP = '#2563eb';
  const PALE = '#bae6fd';

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function drawBlueAura(ctx, x, y, rotation, scale, now) {
    const w = 43;
    const h = w * (76 / 96);
    const r = clamp((Number.isFinite(rotation) ? rotation : 0) * 0.46, -0.11, 0.20);
    const pulse = 0.34 + Math.sin(now * 0.0085) * 0.055;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.rotate(r);

    const aura = ctx.createRadialGradient(0, 0, w * 0.2, 0, 0, w * 0.67);
    aura.addColorStop(0, 'rgba(56,189,248,0)');
    aura.addColorStop(0.7, 'rgba(17,120,238,0.03)');
    aura.addColorStop(1, 'rgba(37,99,235,0.22)');
    ctx.globalAlpha = pulse;
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.62, h * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const yy = -6 + i * 4;
      const trail = ctx.createLinearGradient(-w * 0.88, yy, -w * 0.48, yy);
      trail.addColorStop(0, 'rgba(17,120,238,0)');
      trail.addColorStop(0.52, 'rgba(17,120,238,0.38)');
      trail.addColorStop(1, 'rgba(56,189,248,0.72)');
      ctx.globalAlpha = 0.22 + i * 0.025;
      ctx.strokeStyle = trail;
      ctx.lineWidth = 1.05;
      ctx.beginPath();
      ctx.moveTo(-w * (0.82 + i * 0.025), yy);
      ctx.lineTo(-w * (0.51 + i * 0.012), yy);
      ctx.stroke();
    }

    ctx.restore();
  }

  function recolorNewHeroParticles(game, startIndex) {
    if (!Array.isArray(game.particles)) return;
    for (let i = startIndex; i < game.particles.length; i++) {
      const p = game.particles[i];
      if (!p) continue;
      if (p.color === '#f59e0b' || p.color === '#f1c40f' || p.color === '#f39c12') {
        p.color = Math.random() > 0.44 ? CYAN : BLUE;
      }
    }
  }

  function install() {
    if (window.__FF_BLUE_EFFECTS_V1_INSTALLED__) return true;
    if (!window.__FF_HERO_STATIC_SMOOTH_V2__ || typeof window.drawBirdSkin !== 'function') return false;
    if (!window.game || !window.game.__coreGameplayUxV1Installed) return false;

    const baseDrawBirdSkin = window.drawBirdSkin;
    window.drawBirdSkin = function(ctx, skinKey, x, y, rotation, wingCycle, scale = 1, inFever = false) {
      if (inFever) drawBlueAura(ctx, x, y, rotation, scale, performance.now());
      return baseDrawBirdSkin(ctx, skinKey, x, y, rotation, wingCycle, scale, inFever);
    };

    if (typeof window.game.launchDash === 'function' && !window.game.__blueLaunchFxWrapped) {
      const baseLaunchDash = window.game.launchDash.bind(window.game);
      window.game.launchDash = function(...args) {
        const startIndex = Array.isArray(this.particles) ? this.particles.length : 0;
        const result = baseLaunchDash(...args);
        recolorNewHeroParticles(this, startIndex);
        return result;
      };
      window.game.__blueLaunchFxWrapped = true;
    }

    window.game.__heroBlueEffectsV1Installed = true;
    window.__FF_BLUE_EFFECTS_V1_INSTALLED__ = VERSION;
    return true;
  }

  if (!install()) {
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (install() || tries > 100) clearInterval(timer);
    }, 60);
  }
})();