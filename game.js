(() => {
  'use strict';

  let bootStarted = false;
  let bootstrapReleased = false;
  const originalDrawBirdSkin = window.drawBirdSkin;
  window.__FF_ORIGINAL_DRAW_BIRD_SKIN__ = window.__FF_ORIGINAL_DRAW_BIRD_SKIN__ || originalDrawBirdSkin;

  const bootstrapGate = e => {
    if (bootstrapReleased) return;
    if (e && e.cancelable) e.preventDefault();
    e?.stopImmediatePropagation?.();
  };
  for (const type of ['pointerdown', 'click', 'keydown']) document.addEventListener(type, bootstrapGate, true);
  document.addEventListener('touchstart', bootstrapGate, { capture: true, passive: false });

  function releaseBootstrapGate() {
    if (bootstrapReleased) return;
    bootstrapReleased = true;
    for (const type of ['pointerdown', 'click', 'keydown']) document.removeEventListener(type, bootstrapGate, true);
    document.removeEventListener('touchstart', bootstrapGate, true);
    window.__FF_BOOTSTRAP_READY__ = true;
  }

  function loadScript(src) {
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error(`[FeatherFury] Failed to load ${src}`);
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }

  async function awaitReady(key, timeout = 8000) {
    const value = window[key];
    if (!value || typeof value.then !== 'function') return;
    await Promise.race([
      value.catch?.(() => {}) || value,
      new Promise(resolve => setTimeout(resolve, timeout))
    ]);
  }

  const corePatches = [
    // World 1 gameplay/core. The obsolete boss-crowking-v1 visual renderer is intentionally retired.
    'ruins-pillars-v3.js?v=1',
    'cursed-woods-v1.js?v=2',
    'cursed-crows-v1.js?v=1',
    'boss-fight-core-v1.js?v=1',
    'w1-fixes-batch-v1.js?v=1',
    'boss-audio-fix-v2.js?v=2',
    'w1-final-audio-v1.js?v=1',
    'w1-final-gameplay-v1.js?v=1',
    'w1-final-story-v1.js?v=1',
    'core-gameplay-ux-v1.js?v=3',
    'pause-hud-polish-v2.js?v=1',
    'world1-final-polish-v1.js?v=1',

    // World 2 approved runtime/art stack.
    'w2-audio-v1.js?v=1',
    'w2-environment-assets-v1.js?v=3',
    'w2-visuals-v1.js?v=5',
    'w2-ice-ground-skeletons-v1.js?v=3',
    'w2-gameplay-v1.js?v=1',
    'revive-core-fix-v1.js?v=2',
    'w2-emperor-art-v1.js?v=3',
    'w2-boss-polish-v2.js?v=1',
    'w2-boss-orb-v7.js?v=1',
    'w2-boss-runtime-v10.js?v=1',
    'victory-screen-fix-v1.js?v=1',

    // World 3 approved gameplay stack. Environment image owners are loaded after this list.
    'w3-foundation-v1.js?v=1',
    'w3-world-polish-v1.js?v=6',
    'w3-boss-v1.js?v=2',
    'w3-final-polish-v1.js?v=1',
    'w3-balance-visual-v2.js?v=1',
    'w3-challenge-audio-v3.js?v=2',
    'w3-final-balance-v4.js?v=2',
    'w3-critical-fix-v6.js?v=2',
    'w3-runtime-cleanup-v1.js?v=4',

    // Character gameplay/skins.
    'hero-blue-ninja-v1.js?v=2',
    'hero-static-smooth-v2.js?v=1',
    'hero-blue-effects-v1.js?v=3',
    'fierce-falcon-v1.js?v=3',
    'skin-routing-hardfix-v2.js?v=2',
    'character-roster-v1.js?v=2',
    'character-abilities-v2.js?v=2',
    'mountain-eagle-stability-v3.js?v=1',
    'character-ability-ui-v1.js?v=1',
    'character-ability-fx-v1.js?v=1',

    'world1-qa-fix-v2.js?v=1',
    'owl-guardian-v2.js?v=2',
    'world1-phase2-owl-dialogue-v3.js?v=2',
    'world1-owl-dialogue-layer-fix-v3.js?v=1'
  ];

  const finalWorld1Visuals = [
    'crow-king-ingame-v4.js?v=2',
    'crow-minions-ingame-v3.js?v=1',
    'world1-cursed-woods-background-v3.js?v=2',
    'world1-cursed-obstacle-asset-top-a.js?v=1',
    'world1-cursed-obstacle-asset-bottom-a.js?v=2',
    'world1-cursed-obstacles-v5.js?v=2',
    'world1-final-art-lock-v1.js?v=2'
  ];

  async function boot() {
    if (bootStarted) return window.__FF_RUNTIME_BOOT_PROMISE__;
    bootStarted = true;
    window.__FF_PATCH_BOOTING__ = true;

    window.__FF_RUNTIME_BOOT_PROMISE__ = (async () => {
      // Use the cleaned stable runtime so legacy World 3 painting cannot leak back in.
      const runtimeOk = await loadScript('stable-runtime-w3-clean-v1.js?v=3');
      if (!runtimeOk || !window.game) throw new Error('clean runtime did not initialize');

      for (const src of corePatches) await loadScript(src);

      // Final World 2 image owner and outro/dialogue fixes.
      await loadScript('w2-emperor-png-v5.js?v=6');
      await awaitReady('__FF_W2_EMPEROR_PNG_V5_READY__');
      await loadScript('w2-outro-eagle-skin-v3.js?v=3');
      await loadScript('w2-dialogue-ground-fix-v1.js?v=1');

      // Final World 3 PNG owners and tuning. These are the last World 3 renderers by design.
      await loadScript('w3-voltbat-png-v1.js?v=2');
      await awaitReady('__FF_W3_VOLTBAT_PNG_V1_READY__');
      await loadScript('w3-boss-tuning-v2.js?v=2');
      await loadScript('w3-enemy-png-v1.js?v=3');
      await awaitReady('__FF_W3_ENEMY_PNG_V1_READY__');
      await loadScript('w3-environment-png-v1.js?v=4');
      await awaitReady('__FF_W3_ENVIRONMENT_PNG_V1_READY__');

      // Re-assert World 1's approved final renderers after every other world's owner has loaded.
      for (const src of finalWorld1Visuals) await loadScript(src);

      window.__FF_PATCH_BOOTING__ = false;
      releaseBootstrapGate();
      window.__FF_RUNTIME_APPROVED_STACK__ = {
        version: '2026-08-29-runtime-lock-1',
        world1: 'final-art-lock + crow-king-ingame-v4',
        world2: 'emperor-runtime-v10 + png-v5',
        world3: 'clean-runtime + png-environment'
      };
      console.log('[FF-LAB] approved runtime stack ready');
      return true;
    })().catch(err => {
      window.__FF_PATCH_BOOTING__ = false;
      releaseBootstrapGate();
      console.error('[FeatherFury] approved runtime boot failed', err);
      return false;
    });

    return window.__FF_RUNTIME_BOOT_PROMISE__;
  }

  // Keep the old public entry point for any code that calls it, but route it to the single approved boot.
  window.__FF_START_LEGACY_PATCH_CHAIN__ = boot;

  const langIconPath = document.querySelector('#lang-svg path');
  if (langIconPath) {
    const d = langIconPath.getAttribute('d') || '';
    langIconPath.setAttribute('d', d.replace('c-.43-1.43-1.08-2.76-1.91-3.96z', 'c-.43 1.43-1.08 2.76-1.91 3.96z'));
  }

  boot();
})();
