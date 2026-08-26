(() => {
  'use strict';

  let legacyStarted = false;
  const stableRuntime = 'https://cdn.jsdelivr.net/gh/aseel90/FeatherFury-LaB@5b83840d68ad65939b8efae336afd76c47b7bdc1/game.js';
  const originalDrawBirdSkin = window.drawBirdSkin;
  window.__FF_ORIGINAL_DRAW_BIRD_SKIN__ = window.__FF_ORIGINAL_DRAW_BIRD_SKIN__ || originalDrawBirdSkin;

  const legacyPatches = [
    'ruins-pillars-v3.js?v=1','cursed-woods-v1.js?v=2','cursed-crows-v1.js?v=1','boss-crowking-v1.js?v=1','boss-fight-core-v1.js?v=1','w1-fixes-batch-v1.js?v=1','boss-audio-fix-v2.js?v=2','w1-final-audio-v1.js?v=1','w1-final-gameplay-v1.js?v=1','w1-final-story-v1.js?v=1','core-gameplay-ux-v1.js?v=3','pause-hud-polish-v2.js?v=1','world1-final-polish-v1.js?v=1','w2-audio-v1.js?v=1','w2-visuals-v1.js?v=1','w2-gameplay-v1.js?v=1','revive-core-fix-v1.js?v=2','w2-boss-polish-v2.js?v=1','w2-boss-orb-v7.js?v=1','w2-v7-compat-v1.js?v=1','w2-boss-combat-v6.js?v=1','w2-boss-tuning-v8.js?v=1','w2-boss-phase2-relief-v9.js?v=1','victory-screen-fix-v1.js?v=1','w3-foundation-v1.js?v=1','w3-world-polish-v1.js?v=1','w3-boss-v1.js?v=1','w3-final-polish-v1.js?v=1','w3-balance-visual-v2.js?v=1','w3-challenge-audio-v3.js?v=1','w3-final-balance-v4.js?v=1','w3-critical-fix-v6.js?v=1','hero-blue-ninja-v1.js?v=2','hero-static-smooth-v2.js?v=1','hero-blue-effects-v1.js?v=2','fierce-falcon-v1.js?v=2','skin-routing-hardfix-v2.js?v=1','character-roster-v1.js?v=1','character-abilities-v2.js?v=1','mountain-eagle-stability-v3.js?v=1','character-ability-ui-v1.js?v=1','character-ability-fx-v1.js?v=1','world1-qa-fix-v2.js?v=1','owl-guardian-v2.js?v=2','world1-phase2-owl-dialogue-v3.js?v=2','world1-owl-dialogue-layer-fix-v3.js?v=1','crow-king-ingame-v4.js?v=1','crow-minions-ingame-v3.js?v=1','world1-cursed-woods-background-v3.js?v=1','world1-cursed-obstacle-asset-top-a.js?v=1','world1-cursed-obstacle-asset-bottom-a.js?v=2','world1-cursed-obstacles-v5.js?v=1','world1-final-art-lock-v1.js?v=1'
  ];

  function loadScript(src) {
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = () => resolve(true);
      script.onerror = () => { console.error(`[FeatherFury] Failed to load ${src}`); resolve(false); };
      document.head.appendChild(script);
    });
  }

  function waitForPatchBoot(timeout = 30000) {
    const started = performance.now();
    return new Promise(resolve => {
      const tick = () => {
        if (window.__FF_PATCH_BOOTING__ === false && window.game) return resolve(true);
        if (performance.now() - started > timeout) return resolve(false);
        setTimeout(tick, 50);
      };
      tick();
    });
  }

  async function installFinalCharacterStack() {
    await loadScript('hero-blue-effects-v1.js?v=3');
    await loadScript('fierce-falcon-v1.js?v=3');
    await loadScript('skin-routing-hardfix-v2.js?v=2');
    await loadScript('character-roster-v1.js?v=2');
    await loadScript('character-abilities-v2.js?v=2');
    await loadScript('mountain-eagle-stability-v3.js?v=1');
    await loadScript('character-ability-ui-v1.js?v=1');
    await loadScript('character-ability-fx-v1.js?v=1');
    await loadScript('world1-qa-fix-v2.js?v=1');
    await loadScript('owl-guardian-v2.js?v=2');
    await loadScript('world1-phase2-owl-dialogue-v3.js?v=2');
    await loadScript('world1-owl-dialogue-layer-fix-v3.js?v=1');
    await loadScript('crow-king-ingame-v4.js?v=1');
    await loadScript('crow-minions-ingame-v3.js?v=1');
    await loadScript('world1-cursed-woods-background-v3.js?v=1');
    await loadScript('world1-cursed-obstacle-asset-top-a.js?v=1');
    await loadScript('world1-cursed-obstacle-asset-bottom-a.js?v=2');
    await loadScript('world1-cursed-obstacles-v5.js?v=1');
    await loadScript('world1-final-art-lock-v1.js?v=1');
  }

  window.__FF_START_LEGACY_PATCH_CHAIN__ = async function() {
    if (legacyStarted) return;
    legacyStarted = true;
    await loadScript(stableRuntime);
    for (const src of legacyPatches) await loadScript(src);
  };

  const langIconPath = document.querySelector('#lang-svg path');
  if (langIconPath) {
    const d = langIconPath.getAttribute('d') || '';
    langIconPath.setAttribute('d', d.replace('c-.43-1.43-1.08-2.76-1.91-3.96z', 'c-.43 1.43-1.08 2.76-1.91 3.96z'));
  }

  const params = new URLSearchParams(window.location.search || '');
  if (params.get('legacyPatches') === '1') {
    window.__FF_START_LEGACY_PATCH_CHAIN__();
    return;
  }

  loadScript('patch-runner.js?v=3').then(ok => {
    if (!ok) return window.__FF_START_LEGACY_PATCH_CHAIN__();
    loadScript('patch-manifest.js?v=19').then(async manifestOk => {
      if (!manifestOk) return window.__FF_START_LEGACY_PATCH_CHAIN__();
      const booted = await waitForPatchBoot();
      if (!booted) {
        console.warn('[FeatherFury] Patch boot wait timed out; using legacy fallback.');
        return window.__FF_START_LEGACY_PATCH_CHAIN__();
      }
      await installFinalCharacterStack();
    });
  });
})();