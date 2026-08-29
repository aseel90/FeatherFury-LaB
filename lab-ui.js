/* Feather Fury LAB local helper. No remote UI/runtime loaders. */
(() => {
  'use strict';
  if (window.__FF_LAB_RUNTIME_SAFE__) return;
  window.__FF_LAB_RUNTIME_SAFE__ = 'FF_LAB_RUNTIME_SAFE';

  // Keep the LAB preview convenient for full-world QA without changing the
  // production runtime/renderer ownership map.
  let tries = 0;
  const timer = setInterval(() => {
    const game = window.game;
    if (!game) {
      if (++tries > 200) clearInterval(timer);
      return;
    }

    game.w1Completed = true;
    game.w2Completed = true;
    if (Array.isArray(game.worlds)) {
      game.worlds.forEach((world, index) => {
        if (world && index <= 2) world.unlocked = true;
      });
    }

    try { game.updateCarousel?.(); } catch (_) {}
    clearInterval(timer);
    console.log('[FF-LAB] local helper ready', window.__FF_RUNTIME_MAP__?.version || 'runtime-pending');
  }, 50);
})();
