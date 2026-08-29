(() => {
  'use strict';
  if (window.__FF_APPROVED_RUNTIME_BOOT_V1__) return;
  window.__FF_APPROVED_RUNTIME_BOOT_V1__ = true;

  const CORE_RUNTIME = 'stable-runtime-w3-clean-v1.js?v=4';
  const ACTIVE_PATCHES = [
    // Bootstrap compatibility: exposes the legacy lexical CONFIG as window.CONFIG.
    'runtime-config-bridge-v1.js?v=1',

    // Core gameplay and World 1 systems. Retired visual owners are intentionally omitted.
    'boss-fight-core-v1.js?v=2',
    'w1-fixes-batch-v1.js?v=2',
    'boss-audio-fix-v2.js?v=3',
    'w1-final-audio-v1.js?v=2',
    'w1-final-gameplay-v1.js?v=2',
    'w1-final-story-v1.js?v=2',
    'core-gameplay-ux-v1.js?v=5',
    'pause-hud-polish-v2.js?v=3',
    'world1-final-polish-v1.js?v=2',

    // World 2: consolidated runtime V10 owns boss behavior; PNG V5 owns final boss art.
    'w2-audio-v1.js?v=2',
    'w2-environment-assets-v1.js?v=4',
    'w2-visuals-v1.js?v=6',
    'w2-ice-ground-skeletons-v1.js?v=4',
    'w2-gameplay-v1.js?v=2',
    'revive-core-fix-v1.js?v=3',
    'w2-emperor-art-v1.js?v=4',
    'w2-boss-polish-v2.js?v=2',
    'w2-boss-orb-v7.js?v=2',
    'w2-boss-runtime-v10.js?v=2',
    'victory-screen-fix-v1.js?v=2',

    // World 3: cleaned runtime + latest storm/boss passes.
    'w3-foundation-v1.js?v=2',
    'w3-world-polish-v1.js?v=7',
    'w3-boss-v1.js?v=3',
    'w3-final-polish-v1.js?v=2',
    'w3-balance-visual-v2.js?v=2',
    'w3-challenge-audio-v3.js?v=3',
    'w3-final-balance-v4.js?v=3',
    'w3-critical-fix-v6.js?v=3',
    'w3-runtime-cleanup-v1.js?v=5',

    // Approved playable character stack. This is the only active bird renderer chain.
    'hero-blue-ninja-v1.js?v=3',
    'hero-static-smooth-v2.js?v=2',
    'hero-blue-effects-v1.js?v=4',
    'fierce-falcon-v1.js?v=4',
    'skin-routing-hardfix-v2.js?v=3',
    'character-roster-v1.js?v=3',
    'character-abilities-v2.js?v=3',
    'mountain-eagle-stability-v3.js?v=2',
    'character-ability-ui-v1.js?v=2',
    'character-ability-fx-v1.js?v=2',

    // World 1 final approved visual/story ownership. These intentionally load after characters.
    'world1-qa-fix-v2.js?v=2',
    'owl-guardian-v2.js?v=3',
    'world1-phase2-owl-dialogue-v3.js?v=3',
    'crow-king-ingame-v4.js?v=2',
    'crow-minions-ingame-v3.js?v=2',
    'world1-crow-contrast-v1.js?v=2',
    'world1-cursed-woods-background-v3.js?v=4',
    'world1-cursed-obstacle-asset-top-a.js?v=2',
    'world1-cursed-obstacle-asset-bottom-a.js?v=3',
    'world1-cursed-obstacles-v5.js?v=2',
    'world1-final-art-lock-v1.js?v=4',
    'world1-ground-obstacle-polish-v2.js?v=4',
    'world1-owl-dialogue-layer-fix-v3.js?v=4'
  ];

  const RETIRED_PATCHES = [
    'boss-crowking-v1.js',
    'world1-classic-enhanced-background-v1.js',
    'ruins-pillars-v3.js',
    'w2-v7-compat-v1.js',
    'w2-boss-combat-v5.js',
    'w2-boss-combat-v6.js',
    'w2-boss-tuning-v8.js',
    'w2-boss-phase2-relief-v9.js',
    'w3-critical-fix-v5.js',
    'world1-ground-gap-polish-v1.js'
  ];

  window.__FF_RUNTIME_MAP__ = Object.freeze({
    version: 'approved-runtime-v1.3',
    core: CORE_RUNTIME,
    active: ACTIVE_PATCHES.slice(),
    retired: RETIRED_PATCHES.slice()
  });

  let bootReleased = false;
  const blockBootInput = e => {
    if (bootReleased) return;
    if (e?.cancelable) e.preventDefault();
    e?.stopImmediatePropagation?.();
  };
  for (const type of ['pointerdown', 'click', 'keydown']) document.addEventListener(type, blockBootInput, true);
  document.addEventListener('touchstart', blockBootInput, { capture:true, passive:false });

  function releaseBootInput() {
    if (bootReleased) return;
    bootReleased = true;
    for (const type of ['pointerdown', 'click', 'keydown']) document.removeEventListener(type, blockBootInput, true);
    document.removeEventListener('touchstart', blockBootInput, true);
    window.__FF_BOOTSTRAP_READY__ = true;
  }

  function loadScript(src, maxAttempts = 3) {
    const run = attempt => new Promise((resolve, reject) => {
      const el = document.createElement('script');
      const retryUrl = new URL(src, document.baseURI);
      if (attempt > 1) retryUrl.searchParams.set('ffretry', `${attempt}-${Date.now()}`);
      el.src = retryUrl.href;
      el.async = false;
      el.dataset.ffApprovedRuntime = '1';
      el.dataset.ffAttempt = String(attempt);
      el.onload = () => resolve(true);
      el.onerror = () => {
        el.remove();
        if (attempt >= maxAttempts) {
          reject(new Error(`Failed to load ${src} after ${maxAttempts} attempts`));
          return;
        }
        const delay = attempt === 1 ? 350 : 900;
        console.warn(`[FeatherFury] retrying runtime asset ${src} (${attempt + 1}/${maxAttempts})`);
        setTimeout(() => run(attempt + 1).then(resolve, reject), delay);
      };
      document.head.appendChild(el);
    });
    return run(1);
  }

  function waitFor(test, timeout = 6000, label = 'runtime condition') {
    const start = performance.now();
    return new Promise((resolve, reject) => {
      const tick = () => {
        let ok = false;
        try { ok = !!test(); } catch (_) {}
        if (ok) return resolve(true);
        if (performance.now() - start >= timeout) return reject(new Error(`Timed out waiting for ${label}`));
        setTimeout(tick, 40);
      };
      tick();
    });
  }

  async function loadApprovedStack() {
    window.__FF_PATCH_BOOTING__ = true;
    window.__FF_RUNTIME_APPROVED_STACK__ = false;

    await loadScript(CORE_RUNTIME);
    await waitFor(() => window.game, 8000, 'core game');

    for (const src of ACTIVE_PATCHES) {
      await loadScript(src);
      if (src.startsWith('runtime-config-bridge-v1')) {
        await waitFor(() => window.__FF_RUNTIME_CONFIG_BRIDGE_V1__ && window.CONFIG, 2500, 'runtime CONFIG bridge');
      }
      if (src.startsWith('core-gameplay-ux-v1')) {
        await waitFor(() => window.game?.__coreGameplayUxV1Installed && document.getElementById('ffPauseBtn') && document.getElementById('ffPauseOverlay'), 4500, 'gameplay UX and pause controls');
      }
      if (src.startsWith('character-roster-v1')) {
        await waitFor(() => window.__FF_CHARACTER_ROSTER_V1__, 4500, 'approved character roster');
      }
      if (src.startsWith('w2-boss-runtime-v10')) {
        await waitFor(() => window.game?.__w2BossRuntimeV10Installed, 4500, 'World 2 boss runtime V10');
      }
      if (src.startsWith('crow-king-ingame-v4')) {
        await waitFor(() => window.game?.__ffCrowKingIngameV4Installed, 4500, 'Crow King V4');
      }
      if (src.startsWith('world1-final-art-lock-v1')) {
        await waitFor(() => window.game?.__world1FinalArtLockV1Installed, 4500, 'World 1 final art lock');
      }
    }

    await loadScript('w2-emperor-png-v5.js?v=7');
    if (window.__FF_W2_EMPEROR_PNG_V5_READY__) await window.__FF_W2_EMPEROR_PNG_V5_READY__;
    await loadScript('w2-outro-eagle-skin-v3.js?v=4');
    await loadScript('w2-dialogue-ground-fix-v1.js?v=2');

    await loadScript('w3-voltbat-png-v1.js?v=3');
    if (window.__FF_W3_VOLTBAT_PNG_V1_READY__) await window.__FF_W3_VOLTBAT_PNG_V1_READY__;
    await loadScript('w3-boss-tuning-v2.js?v=3');
    await loadScript('w3-enemy-png-v1.js?v=4');
    if (window.__FF_W3_ENEMY_PNG_V1_READY__) await window.__FF_W3_ENEMY_PNG_V1_READY__;
    await loadScript('w3-environment-png-v1.js?v=5');
    if (window.__FF_W3_ENVIRONMENT_PNG_V1_READY__) await window.__FF_W3_ENVIRONMENT_PNG_V1_READY__;

    const game = window.game;
    if (game) {
      game.__ffPaused = false;
      game.__ffSettingsFromPause = false;
      game.state = 'MENU';
    }
    document.getElementById('ffPauseOverlay')?.classList.remove('show');
    document.getElementById('ffPauseBtn')?.classList.remove('show');
    document.getElementById('gameHud')?.classList.add('hidden');
    const start = document.getElementById('startScreen');
    if (start) {
      start.classList.remove('hidden');
      start.classList.add('active');
    }
    for (const id of ['gameOverScreen','settingsScreen','shopScreen','leaderboardScreen']) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.classList.remove('active');
      el.classList.add('hidden');
    }
    try { game?.updateCarousel?.(); } catch (_) {}
    try { game?.updatePreview?.(); } catch (_) {}
    try { game?.renderShop?.(); } catch (_) {}

    window.__FF_RUNTIME_APPROVED_STACK__ = true;
    window.__FF_PATCH_BOOTING__ = false;
    releaseBootInput();
    console.log('[FeatherFury] approved runtime ready', window.__FF_RUNTIME_MAP__);
  }

  loadApprovedStack().catch(err => {
    window.__FF_PATCH_BOOTING__ = false;
    console.error('[FeatherFury] approved runtime boot failed', err);
    const splash = window.__FF_SPLASH_APPROVED_SCREEN_V3__;
    try { splash?.mark?.('game'); } catch (_) {}
    const toast = document.getElementById('gameToast');
    if (toast) {
      toast.textContent = 'Feather Fury failed to initialize. Please refresh.';
      toast.classList.remove('hidden');
    }
  });
})();
