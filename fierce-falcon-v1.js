(() => {
  'use strict';

  const VERSION = 'fierce-falcon-v1';
  const baseDrawBirdSkin = window.drawBirdSkin;
  const img = new Image();
  img.decoding = 'async';
  img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAACwCAYAAAD5dR9jAAABK2lDQ1BBZG9iZSBSR0IgKDE5OTgpAAAokZWPv0rDUBSHvxtFxaFWCOLgcCdRUGzVwV4q1IbaNKQpFUu6ufQLIOLg4Cg4+QIiDj6Cn6Cz4Cg4ODpL0uk2r6w8OO7H+eecwOENiaK6W4HBNNM7IgsiWm6TiK8H4QQ+/7E/OkfK1OUwAxhBQ0y6YsG3PHKb7tYqf3QcBQjOO5xwEQKxmWOeInid8VNzhG8ciowG5OeI4mwiDeJo4iiuYxXxOI1hZ7nMcVnQYM7wimuYSx0EVGm6O1Lo4q5EqeJxVleXvyF45uXrZ4yNeXfNKrKFGEhGxJBBqKKKKEVRQZ1VEF0nED7Qe4P8zY3/SS5FkGMWkRrDB0l0O8P8H/zdI1DQnqcXcC0EMT7T5j9O9GAVaD4Z9ryG+uAecf4fJM2h34RoAqUeW+wO8daO9kZ1SAhjtELgAxuY9MFA6xJ6pC3L/5zvH7n8HtD+1L9x1oVnQAAAAlwSFlzAAALEwAACxMBAJqcGAAAIABJREFUeJzs/XecXVWd9//v3Jl5z5mZ3Uwmk4QkIYQOISQhLUiAAAVxUVHwIiIqCoIiiLjxAXFxxhXFcQXF/V3+FARxv4iK4oIiuAjSO5RAkA4pCZDOZDJ9z3Pn3v39cWdnZnIymUzOvJ/368U5s7O7O+eec+4551zP43me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53me53ke53ke9/8BfQxjucqv5jMAAAAASUVORK5CYII=';

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
    const h = w * (176 / 192);

    ctx.save();
    ctx.translate(x, y + hoverY);
    ctx.scale(scale, scale);
    ctx.rotate(state.rotation);

    if (inFever) drawPredatorFever(ctx, w, h, now);

    if (img.complete && img.naturalWidth) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, -w * 0.5, -h * 0.5, w, h);
    }
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

  const markReady = () => {
    if (window.game) {
      window.game.__fierceFalconV1Installed = true;
      try { window.game.updatePreview?.(); } catch (_) {}
      try { window.game.renderShop?.(); } catch (_) {}
    }
    window.__FF_FIERCE_FALCON_V1__ = VERSION;
  };

  if (img.complete) markReady();
  else {
    img.onload = markReady;
    img.onerror = markReady;
    setTimeout(markReady, 900);
  }
})();
