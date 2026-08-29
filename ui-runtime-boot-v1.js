(() => {
  'use strict';
  if (window.__FF_UI_RUNTIME_BOOT_V1__) return;
  window.__FF_UI_RUNTIME_BOOT_V1__ = true;

  const UI_STACK = [
    'lab-ui.js?v=6',
    'ui-foundation-v1.js?v=1',
    'ui-settings-leaderboard-v1.js?v=2',
    'ui-store-v1.js?v=1',
    'ui-world-select-v1.js?v=8',
    'ui-main-menu-v3.js?v=5',
    'ui-end-screens-v1.js?v=1',
    'ui-hud-v1.js?v=3'
  ];

  const waitFor = (test, timeout = 60000, label = 'condition') => {
    const started = performance.now();
    return new Promise((resolve, reject) => {
      const tick = () => {
        try { if (test()) return resolve(true); } catch (_) {}
        if (performance.now() - started >= timeout) return reject(new Error(`Timed out waiting for ${label}`));
        setTimeout(tick, 50);
      };
      tick();
    });
  };

  const loadScript = src => new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.async = false;
    el.dataset.ffUiRuntime = '1';
    el.onload = () => resolve(true);
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(el);
  });

  function canvasHasInk(canvas) {
    if (!canvas?.width || !canvas?.height) return false;
    try {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 8) return true;
    } catch (_) {
      return true;
    }
    return false;
  }

  function menuContractReady() {
    const start = document.getElementById('startScreen');
    const thumb = document.querySelector('#worldCard .ff-world-thumb');
    const play = document.getElementById('startStoryBtn');
    const coinIcon = document.querySelector('#startScreen .ff-coin-icon');
    const birdButton = document.querySelector('#startScreen .ff-bird-avatar-btn');
    const preview = document.getElementById('previewBirdCanvas');
    const bg = thumb ? getComputedStyle(thumb).backgroundImage : 'none';
    return !!(
      start && start.classList.contains('active') && !start.classList.contains('hidden') &&
      thumb && bg && bg !== 'none' && /world-1\.webp/.test(bg) &&
      play && !play.disabled &&
      coinIcon && birdButton && preview && canvasHasInk(preview) &&
      window.__FF_UI_FOUNDATION_V1_READY__ &&
      window.__FF_WORLD_SELECT_V1__ && window.__FF_MAIN_MENU_V3__
    );
  }

  async function bootUi() {
    try {
      await waitFor(() => window.__FF_RUNTIME_APPROVED_STACK__ === true && window.game, 60000, 'approved runtime');

      for (const src of UI_STACK) await loadScript(src);

      try { window.game?.updateCarousel?.(); } catch (_) {}
      try { window.game?.updatePreview?.(); } catch (_) {}
      try { window.game?.renderShop?.(); } catch (_) {}
      try { window.__FF_WORLD_SELECT_V1__?.apply?.(); } catch (_) {}
      try { window.__FF_MAIN_MENU_V3__?.apply?.(); } catch (_) {}

      await waitFor(menuContractReady, 8000, 'complete main menu UI');

      window.__FF_MENU_UI_READY__ = true;
      window.__FF_RELEASE_BOOT_INPUT__?.();
      window.dispatchEvent(new CustomEvent('ff:menu-ready'));
      console.log('[FeatherFury] post-runtime UI ready');
    } catch (error) {
      window.__FF_MENU_UI_ERROR__ = error?.stack || String(error);
      console.error('[FeatherFury] post-runtime UI boot failed', error);
      window.__FF_SPLASH_APPROVED_SCREEN_V3__?.fail?.('Feather Fury could not finish loading. Please refresh.');
      const toast = document.getElementById('gameToast');
      if (toast) {
        toast.textContent = 'Feather Fury could not finish loading. Please refresh.';
        toast.classList.remove('hidden');
      }
    }
  }

  bootUi();
})();
