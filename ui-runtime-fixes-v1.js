(() => {
  'use strict';
  if (window.__FF_RUNTIME_FIXES_V1__) return;

  function setText(id, value) {
    const el = document.getElementById(id);
    const next = String(value ?? '');
    if (el && el.textContent !== next) el.textContent = next;
  }

  function installPauseGuard(game) {
    if (!game || game.__ffFinalPauseGuardV1 || typeof game.update !== 'function') return false;
    const finalUpdate = game.update.bind(game);
    game.__ffFinalPauseUpdateBase = finalUpdate;
    game.update = function(...args) {
      if (this.__ffPaused) return;
      return finalUpdate(...args);
    };
    game.__ffFinalPauseGuardV1 = true;

    const overlay = document.getElementById('ffPauseOverlay');
    if (overlay && !overlay.__ffPauseInputGuardV1) {
      overlay.addEventListener('pointerdown', e => e.stopPropagation(), true);
      overlay.__ffPauseInputGuardV1 = true;
    }
    return true;
  }

  function installNavigationContract(game) {
    if (!game || game.__ffNavigationContractV1) return !!game;

    const ROUTES = Object.freeze({
      MAIN:'MAIN', GAMEPLAY:'GAMEPLAY', PAUSE:'PAUSE', SETTINGS:'SETTINGS', STORE:'STORE', END:'END', LEADERBOARD:'LEADERBOARD'
    });
    const nav = {
      version:'1.0.0',
      route:'MAIN',
      returnStack:[],
      lastEndKind:'defeat'
    };

    const el = id => document.getElementById(id);
    const visible = id => {
      const node = el(id);
      return !!node && node.classList.contains('active') && !node.classList.contains('hidden');
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

    const container = document.querySelector('#gameHud .fever-bar-container');
    const fill = document.getElementById('feverFill');
    if (!container || !fill) return;
    container.hidden = false;
    container.removeAttribute('aria-hidden');

    const cfg = window.CONFIG || {};
    const maxFever = game.activeWorld === 2 ? 150 : (game.activeWorld === 1 ? 120 : Number(cfg.FEVER_MAX || 100));
    const duration = game.activeSkin === 'falcon'
      ? Math.round(Number(cfg.FEVER_DURATION || 360) * 1.25)
      : Number(cfg.FEVER_DURATION || 360);
    const pct = game.feverActive
      ? (Number(game.feverTimer || 0) / Math.max(1, duration)) * 100
      : (Number(game.fever || 0) / Math.max(1, maxFever)) * 100;
    const clamped = Math.max(0, Math.min(100, pct));
    fill.style.width = `${clamped}%`;
    fill.classList.toggle('max', !!game.feverActive || clamped >= 99.5);
  }

  function install() {
    const game = window.game;
    if (!game || window.__FF_RUNTIME_APPROVED_STACK__ !== true) return false;
    installPauseGuard(game);
    installNavigationContract(game);

    let last = 0;
    const tick = now => {
      if (now - last >= 80) {
        last = now;
        syncHudData(game);
      }
      requestAnimationFrame(tick);
    };
    syncHudData(game);
    requestAnimationFrame(tick);

    window.__FF_RUNTIME_FIXES_V1__ = Object.freeze({
      version: '1.1.0',
      pauseSimulationFreeze: true,
      hudDataBridge: true,
      feverRestored: true,
      rtlHudPinned: true,
      navigationContract: true
    });
    console.log('[FeatherFury] runtime fixes v1 installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (install() || tries > 240) clearInterval(timer);
  }, 50);
})();
