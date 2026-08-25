(() => {
  'use strict';
  const finalRenderer = window.drawBirdSkin;
  const originalRenderer = window.__FF_ORIGINAL_DRAW_BIRD_SKIN__;
  if (typeof finalRenderer !== 'function' || typeof originalRenderer !== 'function') return;

  window.drawBirdSkin = function(ctx, skinKey, x, y, rotation, wingCycle, scale = 1, inFever = false) {
    const key = skinKey || 'classic';
    if (key === 'classic' || key === 'falcon') {
      return finalRenderer(ctx, key, x, y, rotation, wingCycle, scale, inFever);
    }
    return originalRenderer(ctx, key, x, y, rotation, wingCycle, scale, inFever);
  };

  if (window.game) {
    try { window.game.updatePreview?.(); } catch (_) {}
    try { window.game.renderShop?.(); } catch (_) {}
  }
  window.__FF_SKIN_ROUTING_HARDFIX_V2__ = true;
})();