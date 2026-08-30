(() => {
  'use strict';
  if (window.__FF_RUNTIME_FIXES_V1__) return;
  window.__FF_RUNTIME_FIXES_V1__ = true;

  const text = (id) => document.getElementById(id)?.textContent?.trim() || '';
  const setText = (id, value) => {
    const node = document.getElementById(id);
    if (node && node.textContent !== String(value)) node.textContent = String(value);
  };
  const pct = (value) => Math.max(0, Math.min(100, Number(value) || 0));

  function installPauseGuard(game) {
    if (!game || game.__ffFinalPauseGuardV1 || typeof game.update !== 'function') return;
    const baseUpdate = game.update.bind(game);
    game.update = function ffFinalPauseUpdateGuard(...args) {
      if (this.__ffPaused) return;
      return baseUpdate(...args);
    };
    game.__ffFinalPauseGuardV1 = true;
  }

  function installNavigationContract(game) {
    if (!game || game.__ffNavigationContractV1) return true;
    const ROUTES = Object.freeze({ MAIN:'MAIN', GAMEPLAY:'GAMEPLAY', PAUSE:'PAUSE', SETTINGS:'SETTINGS', STORE:'STORE', END:'END', LEADERBOARD:'LEADERBOARD' });
    const nav = { route:ROUTES.MAIN, returnStack:[] };
    const el = id => document.getElementById(id);
    const visible = id => {
      const node = el(id);
      return !!node && !node.classList.contains('hidden') && getComputedStyle(node).display !== 'none';
    };
    const show = id => {
      const node = el(id);
      if (!node) return;
      node.classList.remove('hidden');
      node.classList.add('active');
    };
    const hide = id => {
      const node = el(id);
      if (!node) return;
      node.classList.remove('active');
      node.classList.add('hidden');
    };
    const hidePause = () => el('ffPauseOverlay')?.classList.remove('show');
    const showPause = () => el('ffPauseOverlay')?.classList.add('show');
    const hidePauseButton = () => el('ffPauseBtn')?.classList.remove('show');
    const stopAudio = () => { try { game.sound?.stopAmbiance?.(); } catch (_) {} };
    const tick = () => { try { game.sound?.playTick?.(); } catch (_) {} };

    function inferRoute() {
      if (visible('settingsScreen')) return ROUTES.SETTINGS;
      if (visible('shopScreen')) return ROUTES.STORE;
      if (el('ffPauseOverlay')?.classList.contains('show')) return ROUTES.PAUSE;
      if (visible('gameOverScreen')) return ROUTES.END;
      if (visible('leaderboardScreen')) return ROUTES.LEADERBOARD;
      if (visible('startScreen') || game.state === 'MENU') return ROUTES.MAIN;
      return ROUTES.GAMEPLAY;
    }

    function clearTransientScreens() {
      hide('settingsScreen');
      hide('shopScreen');
      hide('leaderboardScreen');
      hide('gameOverScreen');
      hidePause();
    }

    function goMain(selectedWorld) {
      clearTransientScreens();
      hidePauseButton();
      game.__ffPaused = false;
      game.__ffSettingsFromPause = false;
      hide('gameHud');
      show('startScreen');
      stopAudio();
      game.state = 'MENU';
      try { game.reset?.(); } catch (_) {}

      if (Number.isInteger(selectedWorld)) {
        game.currentWorldIndex = Math.max(0, Math.min(3, selectedWorld));
      } else if (!Number.isInteger(game.currentWorldIndex) || game.currentWorldIndex < 0 || game.currentWorldIndex > 3) {
        game.currentWorldIndex = 0;
      }
      try { game.updateCarousel?.(); } catch (_) {}
      try { game.updatePreview?.(); } catch (_) {}
      nav.returnStack.length = 0;
      nav.route = ROUTES.MAIN;
      return true;
    }

    function resumeGameplay() {
      hide('settingsScreen');
      hidePause();
      game.__ffSettingsFromPause = false;
      if (typeof game.resumeGame === 'function') game.resumeGame();
      else game.__ffPaused = false;
      nav.returnStack.length = 0;
      nav.route = ROUTES.GAMEPLAY;
      return true;
    }

    function showPauseRoute() {
      hide('settingsScreen');
      hide('shopScreen');
      game.__ffPaused = true;
      game.__ffSettingsFromPause = false;
      hidePauseButton();
      showPause();
      nav.route = ROUTES.PAUSE;
      return true;
    }

    function openSettings(origin = inferRoute()) {
      const returnRoute = origin === ROUTES.PAUSE || game.__ffPaused ? ROUTES.PAUSE : ROUTES.MAIN;
      if (returnRoute === ROUTES.MAIN) hide('startScreen');
      if (returnRoute === ROUTES.PAUSE) {
        game.__ffPaused = true;
        game.__ffSettingsFromPause = true;
        hidePause();
        hidePauseButton();
      }
      hide('leaderboardScreen');
      show('settingsScreen');
      nav.returnStack.push(returnRoute);
      nav.route = ROUTES.SETTINGS;
      return true;
    }

    function openStore(origin = inferRoute()) {
      let returnRoute = ROUTES.MAIN;
      if (origin === ROUTES.END || visible('gameOverScreen') || game.state === 'GAMEOVER') returnRoute = ROUTES.END;
      else if (origin === ROUTES.PAUSE || game.__ffPaused) returnRoute = ROUTES.PAUSE;

      if (returnRoute === ROUTES.END) hide('gameOverScreen');
      else if (returnRoute === ROUTES.MAIN) hide('startScreen');
      else if (returnRoute === ROUTES.PAUSE) { game.__ffPaused = true; hidePause(); hidePauseButton(); }

      show('shopScreen');
      try { game.renderShop?.(); } catch (_) {}
      nav.returnStack.push(returnRoute);
      nav.route = ROUTES.STORE;
      return true;
    }

    function back() {
      const from = inferRoute();
      const target = nav.returnStack.pop() || (game.__ffPaused ? ROUTES.PAUSE : ROUTES.MAIN);
      if (from === ROUTES.SETTINGS) hide('settingsScreen');
      if (from === ROUTES.STORE) hide('shopScreen');
      if (target === ROUTES.PAUSE) return showPauseRoute();
      if (target === ROUTES.END) {
        game.__ffPaused = false;
        hidePause();
        hidePauseButton();
        game.state = 'GAMEOVER';
        hide('gameHud');
        show('gameOverScreen');
        nav.route = ROUTES.END;
        return true;
      }
      return goMain();
    }

    function restartCurrentRun() {
      clearTransientScreens();
      hidePauseButton();
      game.__ffPaused = false;
      game.__ffSettingsFromPause = false;
      nav.returnStack.length = 0;
      if (game.activeWorld === 'ENDLESS' || game.gameMode === 'endless') {
        try { game.reset?.(); } catch (_) {}
        game.state = 'LAUNCH';
        show('gameHud');
        try { game.birdJump?.(); } catch (_) {}
      } else {
        hide('gameHud');
        if (typeof game.enterStoryState === 'function') game.enterStoryState();
        else {
          try { game.reset?.(); } catch (_) {}
          game.state = 'STORY';
        }
      }
      nav.route = ROUTES.GAMEPLAY;
      return true;
    }

    function nextWorld() {
      const current = Number.isInteger(game.activeWorld) ? game.activeWorld : Number(game.currentWorldIndex);
      const next = Number.isFinite(current) ? Math.max(0, Math.min(3, current + 1)) : 0;
      return goMain(next);
    }

    function handleClick(e) {
      const target = e.target?.closest?.('button,[data-action]');
      if (!target) return;
      let handled = false;

      if (target.id === 'settingsBtn') { tick(); handled = openSettings(ROUTES.MAIN); }
      else if (target.id === 'closeSettingsBtn') { tick(); handled = back(); }
      else if (target.id === 'shopBtnStart') { tick(); handled = openStore(ROUTES.MAIN); }
      else if (target.id === 'shopBtnGameOver') { tick(); handled = openStore(ROUTES.END); }
      else if (target.id === 'closeShopBtn') { tick(); handled = back(); }
      else if (target.id === 'mainMenuBtn') { tick(); handled = goMain(); }
      else if (target.id === 'restartBtn') { tick(); handled = restartCurrentRun(); }
      else if (target.id === 'nextWorldActionBtn') { tick(); handled = nextWorld(); }
      else if (target.closest('#ffPauseOverlay')) {
        const action = target.dataset.action;
        if (action === 'resume') { tick(); handled = resumeGameplay(); }
        else if (action === 'restart') { tick(); handled = restartCurrentRun(); }
        else if (action === 'settings') { tick(); handled = openSettings(ROUTES.PAUSE); }
        else if (action === 'menu') { tick(); handled = goMain(); }
      }

      if (handled) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }

    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      const route = inferRoute();
      if (route === ROUTES.SETTINGS || route === ROUTES.STORE) {
        e.preventDefault();
        e.stopImmediatePropagation();
        back();
      }
    }, true);

    game.returnToMenu = goMain;
    game.restartCurrentRun = restartCurrentRun;
    game.__ffNavigationContractV1 = true;
    nav.route = inferRoute();
    nav.routes = ROUTES;
    nav.goMain = goMain;
    nav.back = back;
    nav.showPause = showPauseRoute;
    nav.resumeGameplay = resumeGameplay;
    nav.openSettings = openSettings;
    nav.openStore = openStore;
    nav.restartCurrentRun = restartCurrentRun;
    nav.nextWorld = nextWorld;
    nav.inferRoute = inferRoute;
    window.__FF_UI_NAV__ = nav;
    return true;
  }

  function syncHudData(game) {
    if (!game) return;
    setText('runCoins', Math.max(0, Math.floor(Number(game.sessionCoins) || 0)));
    setText('scoreValue', Math.max(0, Math.floor(Number(game.score) || 0)));

    const stage = document.getElementById('stageDisplay')?.textContent?.trim();
    if (stage) setText('stageName', stage);
    setText('feverText', game.lang === 'en' ? 'FEVER' : 'الحمّى');

    const fever = pct(game.fever);
    const fill = document.getElementById('feverFill');
    if (fill) fill.style.width = `${fever}%`;
  }

  function bridgeLegacyDisplays() {
    const pairs = [
      ['sessionCoinDisplay', 'runCoins'],
      ['currentScoreDisplay', 'scoreValue'],
      ['stageDisplay', 'stageName']
    ];
    for (const [legacyId, visibleId] of pairs) {
      const legacy = document.getElementById(legacyId);
      const visible = document.getElementById(visibleId);
      if (!legacy || !visible || legacy.__ffBridgeObserver) continue;
      const sync = () => { if (legacy.textContent !== visible.textContent) visible.textContent = legacy.textContent; };
      const observer = new MutationObserver(sync);
      observer.observe(legacy, { childList:true, characterData:true, subtree:true });
      legacy.__ffBridgeObserver = observer;
      sync();
    }
  }

  function fixPauseButtonPlacement() {
    const btn = document.getElementById('ffPauseBtn');
    const top = document.querySelector('#gameHud .hud-top');
    if (btn && top && btn.parentElement !== top) top.appendChild(btn);
  }

  function ensureFever() {
    const box = document.querySelector('#gameHud .fever-bar-container');
    if (!box) return;
    box.classList.remove('hidden');
    box.removeAttribute('hidden');
  }

  function install() {
    const game = window.game;
    if (!game) return false;
    installPauseGuard(game);
    installNavigationContract(game);
    bridgeLegacyDisplays();
    fixPauseButtonPlacement();
    ensureFever();
    syncHudData(game);
    return true;
  }

  const timer = setInterval(() => {
    if (!install()) return;
    const game = window.game;
    syncHudData(game);
    fixPauseButtonPlacement();
    ensureFever();
  }, 120);

  window.addEventListener('beforeunload', () => clearInterval(timer), { once:true });
  window.__FF_RUNTIME_FIXES_V1_READY__ = true;
  window.__FF_RUNTIME_FIXES_V1_INFO__ = Object.freeze({
    version: '1.2.0',
    pauseSimulationFreeze: true,
    navigationContract: true,
    hudDataBridge: true,
    feverRestored: true,
    rtlHudDirectionFixed: true
  });
  console.log('[FeatherFury] runtime fixes v1 installed');
})();
