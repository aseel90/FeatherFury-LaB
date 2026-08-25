(() => {
  'use strict';

  let legacyStarted = false;
  const stableRuntime = 'https://cdn.jsdelivr.net/gh/aseel90/FeatherFury-LaB@5b83840d68ad65939b8efae336afd76c47b7bdc1/game.js';
  const legacyPatches = [
    'ruins-pillars-v3.js?v=1',
    'cursed-woods-v1.js?v=2',
    'cursed-crows-v1.js?v=1',
    'boss-crowking-v1.js?v=1',
    'boss-fight-core-v1.js?v=1',
    'w1-fixes-batch-v1.js?v=1',
    'boss-audio-fix-v2.js?v=2',
    'w1-final-audio-v1.js?v=1',
    'w1-final-gameplay-v1.js?v=1',
    'w1-final-story-v1.js?v=1',
    'core-gameplay-ux-v1.js?v=3',
    'pause-hud-polish-v2.js?v=1',
    'world1-final-polish-v1.js?v=1',
    'w2-audio-v1.js?v=1',
    'w2-visuals-v1.js?v=1',
    'w2-gameplay-v1.js?v=1',
    'revive-core-fix-v1.js?v=2',
    'w2-boss-polish-v2.js?v=1',
    'w2-boss-orb-v7.js?v=1',
    'w2-boss-combat-v6.js?v=1',
    'victory-screen-fix-v1.js?v=1',
    'w3-foundation-v1.js?v=1',
    'w3-world-polish-v1.js?v=1',
    'w3-boss-v1.js?v=1',
    'w3-final-polish-v1.js?v=1',
    'w3-balance-visual-v2.js?v=1',
    'w3-challenge-audio-v3.js?v=1',
    'w3-final-balance-v4.js?v=1',
    'w3-critical-fix-v6.js?v=1'
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

  window.__FF_START_LEGACY_PATCH_CHAIN__ = async function() {
    if (legacyStarted) return;
    legacyStarted = true;
    await loadScript(stableRuntime);
    for (const src of legacyPatches) await loadScript(src);
  };

  const params = new URLSearchParams(window.location.search || '');
  if (params.get('legacyPatches') === '1') {
    window.__FF_START_LEGACY_PATCH_CHAIN__();
    return;
  }

  loadScript('patch-runner.js?v=3').then(ok => {
    if (!ok) return window.__FF_START_LEGACY_PATCH_CHAIN__();
    loadScript('patch-manifest.js?v=13').then(manifestOk => {
      if (!manifestOk) window.__FF_START_LEGACY_PATCH_CHAIN__();
    });
  });
})();