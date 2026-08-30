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
      version: '1.0.0',
      pauseSimulationFreeze: true,
      hudDataBridge: true,
      feverRestored: true,
      rtlHudPinned: true
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
