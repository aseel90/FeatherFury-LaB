(() => {
  'use strict';

  if (window.__FF_STABLE_RUNTIME_LOADER_V1__) return;
  window.__FF_STABLE_RUNTIME_LOADER_V1__ = true;

  const LATEST_RUNTIME = 'https://cdn.jsdelivr.net/gh/aseel90/FeatherFury-LaB@5b83840b64b2609167997a10f27abfa8ccb0e452/game.js';
  const CACHE_BUST = 'r20260826-world1-clean-v1';
  const FALLBACK_BOOT_TIMEOUT_MS = 12000;

  const params = new URLSearchParams(location.search);
  const forceLatestRuntime = params.get('latestRuntime') === '1';
  const requestedRuntime = forceLatestRuntime ? LATEST_RUNTIME : LATEST_RUNTIME;
  window.__FF_RUNTIME_PIN__ = requestedRuntime;
  window.__FF_DISABLE_OVERLAY_RECOVERY__ = true;

  function loadScript(src) {
    return new Promise(resolve => {
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }

  const legacyPatches = [
    'ruins-pillars-v3.js?v=1','boss-crowking-v1.js?v=1','boss-fight-core-v1.js?v=1','w1-fixes-batch-v1.js?v=1','boss-audio-fix-v2.js?v=2','w1-final-audio-v1.js?v=1','w1-final-gameplay-v1.js?v=1','w1-final-story-v1.js?v=1','core-gameplay-ux-v1.js?v=3','pause-hud-polish-v2.js?v=1','world1-final-polish-v1.js?v=1','w2-audio-v1.js?v=1','w2-environment-assets-v1.js?v=2','w2-visuals-v1.js?v=3','w2-gameplay-v1.js?v=1','revive-core-fix-v1.js?v=2','w2-boss-polish-v2.js?v=1','w2-boss-orb-v7.js?v=1','w2-v7-compat-v1.js?v=1','w2-boss-combat-v6.js?v=1','w2-boss-tuning-v8.js?v=1','w2-boss-phase2-relief-v9.js?v=1','victory-screen-fix-v1.js?v=1','w3-foundation-v1.js?v=1','w3-world-polish-v1.js?v=1','w3-boss-v1.js?v=1','w3-final-polish-v1.js?v=1','w3-balance-visual-v2.js?v=1','w3-challenge-audio-v3.js?v=1','w3-final-balance-v4.js?v=1','w3-critical-fix-v6.js?v=1','hero-blue-ninja-v1.js?v=2','hero-static-smooth-v2.js?v=1','hero-blue-effects-v1.js?v=3','fierce-falcon-v1.js?v=3','skin-routing-hardfix-v2.js?v=2','character-roster-v1.js?v=2','character-abilities-v2.js?v=2','mountain-eagle-stability-v3.js?v=1','character-ability-ui-v1.js?v=1','character-ability-fx-v1.js?v=1','world1-qa-fix-v2.js?v=1','owl-guardian-v2.js?v=2','world1-phase2-owl-dialogue-v3.js?v=2','world1-owl-dialogue-layer-fix-v3.js?v=1','crow-king-ingame-v4.js?v=1','crow-minions-ingame-v3.js?v=1','world1-crow-contrast-v1.js?v=1','world1-cursed-obstacle-asset-top-a.js?v=1','world1-cursed-obstacle-asset-bottom-a.js?v=2','world1-cursed-obstacles-v5.js?v=1','world1-classic-enhanced-background-v1.js?v=1','world1-ground-obstacle-polish-v2.js?v=3'
  ];

  function lockStart(reason) {
    window.__FF_RUNTIME_READY__ = false;
    document.documentElement.dataset.ffRuntimeReady = '0';
    const btn = document.getElementById('worldActionBtn');
    if (btn) {
      btn.disabled = true;
      btn.dataset.runtimeLock = '1';
      btn.style.opacity = '.55';
      btn.style.pointerEvents = 'none';
    }
    window.__FF_RUNTIME_LOCK_REASON__ = reason || 'booting';
  }

  function unlockStart() {
    window.__FF_RUNTIME_READY__ = true;
    document.documentElement.dataset.ffRuntimeReady = '1';
    const btn = document.getElementById('worldActionBtn');
    if (btn) {
      btn.disabled = false;
      delete btn.dataset.runtimeLock;
      btn.style.opacity = '';
      btn.style.pointerEvents = '';
    }
    const game = window.game;
    try { game?.updateCarousel?.(); } catch (_) {}
  }

  async function startLegacyChain() {
    lockStart('legacy-fallback');
    let index = 0;
    return new Promise(resolve => {
      const deadline = Date.now() + FALLBACK_BOOT_TIMEOUT_MS;
      const tick = () => {
        if (!window.game) {
          if (Date.now() > deadline) return resolve(false);
          return setTimeout(tick, 80);
        }
        const next = async () => {
          if (index >= legacyPatches.length) return resolve(true);
          await loadScript(legacyPatches[index++]);
          next();
        };
        next();
      };
      tick();
    });
  }

  window.__FF_START_LEGACY_PATCH_CHAIN__ = async () => {
    await startLegacyChain();
    unlockStart();
  };

  async function waitForPatchBoot() {
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      if (window.__FF_PATCH_BOOT__?.ready) return true;
      await new Promise(r => setTimeout(r, 75));
    }
    return false;
  }

  lockStart('patch-manifest');
  loadScript('patch-runner.js?v=3').then(async ok => {
    if (!ok) return window.__FF_START_LEGACY_PATCH_CHAIN__();
    const manifestOk = await loadScript('patch-manifest.js?v=24');
    if (!manifestOk) return window.__FF_START_LEGACY_PATCH_CHAIN__();
    const booted = await waitForPatchBoot();
    if (!booted) {
      const loading = document.getElementById('loadingScreen');
      if (loading) loading.textContent = 'Retrying game load…';
      return window.__FF_START_LEGACY_PATCH_CHAIN__();
    }
    unlockStart();
  });
})();