(() => {
  'use strict';
  if (window.__FF_ANDROID_NATIVE_V1__) return;
  window.__FF_ANDROID_NATIVE_V1__ = true;

  const waitFor = (test, timeout = 20000) => new Promise((resolve, reject) => {
    const started = performance.now();
    const tick = () => {
      try { const value = test(); if (value) return resolve(value); } catch (_) {}
      if (performance.now() - started >= timeout) return reject(new Error('Android native bridge timed out'));
      setTimeout(tick, 80);
    };
    tick();
  });

  const stopAudio = () => {
    try { window.game?.sound?.stopAmbiance?.(); } catch (_) {}
    try { window.game?.sound?.stopMusic?.(); } catch (_) {}
  };

  const pauseForBackground = () => {
    const nav = window.__FF_UI_NAV__;
    const game = window.game;
    if (!nav || !game) return;
    const route = nav.inferRoute?.();
    if (route === nav.routes?.GAMEPLAY && game.state !== 'MENU' && game.state !== 'GAMEOVER') {
      nav.showPause?.();
    }
    stopAudio();
  };

  const closeLeaderboard = () => {
    const board = document.getElementById('leaderboardScreen');
    if (!board || board.classList.contains('hidden')) return false;
    document.getElementById('closeLeaderboardBtn')?.click();
    return true;
  };

  const handleBack = () => {
    const nav = window.__FF_UI_NAV__;
    if (!nav) return false;
    const route = nav.inferRoute?.();
    const routes = nav.routes || {};

    if (route === routes.SETTINGS || route === routes.STORE) return !!nav.back?.();
    if (route === routes.LEADERBOARD) return closeLeaderboard();
    if (route === routes.PAUSE) return !!nav.resumeGameplay?.();
    if (route === routes.GAMEPLAY) return !!nav.showPause?.();
    if (route === routes.END) return !!nav.goMain?.();
    return false;
  };

  async function install() {
    const cap = window.Capacitor;
    if (!cap?.isNativePlatform?.()) return;

    const nav = await waitFor(() => window.__FF_UI_NAV__ && window.game && window.__FF_MENU_UI_READY__);
    if (!nav) return;

    let App = null;
    try {
      App = cap.registerPlugin?.('App') || cap.Plugins?.App || null;
    } catch (_) {
      App = cap.Plugins?.App || null;
    }
    if (!App?.addListener) {
      console.warn('[FeatherFury] Capacitor App plugin unavailable; native lifecycle bridge not installed');
      return;
    }

    await App.addListener('backButton', async () => {
      if (handleBack()) return;
      try { await App.exitApp?.(); } catch (_) {}
    });
    await App.addListener('pause', pauseForBackground);
    await App.addListener('appStateChange', state => {
      if (state && state.isActive === false) pauseForBackground();
    });
    await App.addListener('resume', () => {
      window.dispatchEvent(new CustomEvent('ff:native-resume'));
    });

    document.documentElement.classList.add('ff-native-android');
    window.__FF_ANDROID_NATIVE_READY__ = true;
    console.log('[FeatherFury] Android native lifecycle/back bridge ready');
  }

  install().catch(error => console.error('[FeatherFury] Android native bridge failed', error));
})();
