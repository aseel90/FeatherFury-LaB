(() => {
  'use strict';
  let bootstrapReleased = false;
  const originalDrawCharacter = window.drawCharacter;
  const originalDrawBirdSkin = window.drawBirdSkin;
  window.__FF_ORIGINAL_DRAW_BIRD_SKIN__ = window.__FF_ORIGINAL_DRAW_BIRD_SKIN__ || originalDrawBirdSkin;

  // Keep the UI locked until the authoritative patch set is fully installed.
  // This prevents the player from entering World 1 while legacy visuals are still loading.
  const bootstrapGate = e => {
    if (bootstrapReleased) return;
    if (e && e.cancelable) e.preventDefault();
    if (e && typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
  };
  document.addEventListener('click', bootstrapGate, true);
  document.addEventListener('touchstart', bootstrapGate, true);
  document.addEventListener('keydown', bootstrapGate, true);
  const releaseBootstrapGate = () => {
    if (bootstrapReleased) return;
    bootstrapReleased = true;
    document.removeEventListener('click', bootstrapGate, true);
    document.removeEventListener('touchstart', bootstrapGate, true);
    document.removeEventListener('keydown', bootstrapGate, true);
  };

  const legacyPatches = [
    'ruins-pillars-v3.js?v=1','boss-crowking-v1.js?v=1','boss-fight-core-v1.js?v=1','w1-fixes-batch-v1.js?v=1','boss-audio-fix-v2.js?v=2','w1-final-audio-v1.js?v=1','w1-final-gameplay-v1.js?v=1','w1-final-story-v1.js?v=1','core-gameplay-ux-v1.js?v=3','pause-hud-polish-v2.js?v=1','world1-final-polish-v1.js?v=1','w2-audio-v1.js?v=1','w2-environment-assets-v1.js?v=3','w2-visuals-v1.js?v=4','w2-ice-ground-skeletons-v1.js?v=1','w2-gameplay-v1.js?v=1','revive-core-fix-v1.js?v=2','w2-boss-polish-v2.js?v=2','w2-boss-orb-v7.js?v=1','w2-boss-combat-v6.js?v=2','w2-boss-tuning-v8.js?v=1','w2-boss-phase2-relief-v9.js?v=1','victory-screen-fix-v1.js?v=1','w3-foundation-v1.js?v=1','w3-world-polish-v1.js?v=1','w3-boss-v1.js?v=1','w3-final-polish-v1.js?v=1','w3-balance-visual-v2.js?v=1','w3-challenge-audio-v3.js?v=1','w3-final-balance-v4.js?v=1','w3-critical-fix-v6.js?v=1','hero-blue-ninja-v1.js?v=2','hero-static-smooth-v2.js?v=1','hero-blue-effects-v1.js?v=3','fierce-falcon-v1.js?v=3','skin-routing-hardfix-v2.js?v=2','character-roster-v1.js?v=2','character-abilities-v2.js?v=2','mountain-eagle-stability-v3.js?v=1','character-ability-ui-v1.js?v=1','character-ability-fx-v1.js?v=1','world1-qa-fix-v2.js?v=1','owl-guardian-v2.js?v=2','world1-phase2-owl-dialogue-v3.js?v=2','world1-owl-dialogue-layer-fix-v3.js?v=1','crow-king-ingame-v4.js?v=1','crow-minions-ingame-v3.js?v=1','world1-crow-contrast-v1.js?v=1','world1-cursed-obstacle-asset-top-a.js?v=1','world1-cursed-obstacle-asset-bottom-a.js?v=2','world1-cursed-obstacles-v5.js?v=1','world1-classic-enhanced-background-v1.js?v=1','world1-ground-obstacle-polish-v2.js?v=3','w2-ice-ground-skeletons-v1.js?v=3'
  ];

  function loadScript(src) {
    return new Promise(resolve => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
  }

  async function legacyPatchChain() {
    for (const src of legacyPatches) {
      await loadScript(src);
    }
    releaseBootstrapGate();
  }
  window.__FF_START_LEGACY_PATCH_CHAIN__ = () => {
    if (window.__FF_LEGACY_PATCH_CHAIN_STARTED__) return;
    window.__FF_LEGACY_PATCH_CHAIN_STARTED__ = true;
    legacyPatchChain();
  };

  function waitForPatchBoot(timeout = 18000) {
    return new Promise(resolve => {
      const start = performance.now();
      const tick = () => {
        if (window.__FF_PATCH_BOOT_OK__ && window.__FF_PATCH_CHAIN_DONE__) return resolve(true);
        if (window.__FF_PATCH_BOOT_FAILED__ || performance.now() - start > timeout) return resolve(false);
        setTimeout(tick, 50);
      };
      tick();
    });
  }

  loadScript('patch-runner.js?v=3').then(async ok => {
    if (!ok) return window.__FF_START_LEGACY_PATCH_CHAIN__();
    const manifestOk = await loadScript('patch-manifest.js?v=27');
    if (!manifestOk) return window.__FF_START_LEGACY_PATCH_CHAIN__();
    const booted = await waitForPatchBoot();
    if (!booted) {
      console.warn('[FeatherFury] Patch boot wait timed out; using cleaned legacy fallback.');
      return window.__FF_START_LEGACY_PATCH_CHAIN__();
    }
    // Final World 2 visual pass. v3 raises the blue ground lip to overlap and hide the last dark seam.
    await loadScript('w2-ice-ground-skeletons-v1.js?v=3');
    releaseBootstrapGate();
  });
})();
