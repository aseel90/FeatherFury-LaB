(() => {
  'use strict';
  if (window.__FF_UI_HUD_V1__) return;

  const ICONS = {
    coin: 'assets/ui/icons/coin.svg',
    pause: 'assets/ui/icons/pause.svg'
  };

  function addImg(parent, cls, src, before) {
    if (!parent || parent.querySelector(`.${cls}`)) return;
    const img = document.createElement('img');
    img.className = cls;
    img.src = src;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    if (before) parent.insertBefore(img, parent.firstChild);
    else parent.appendChild(img);
  }

  function removeRetiredHud() {
    document.getElementById('ffBossHud')?.remove();
    const fever = document.querySelector('#gameHud .fever-bar-container');
    if (fever) {
      fever.hidden = true;
      fever.setAttribute('aria-hidden', 'true');
    }
  }

  function ensureHud(game) {
    const hud = document.getElementById('gameHud');
    if (!hud) return null;
    hud.classList.add('ff-hud-v1');

    const coin = hud.querySelector('.hud-coin-badge');
    addImg(coin, 'ff-hud-coin-icon', ICONS.coin, true);

    const pause = document.getElementById('ffPauseBtn');
    const top = hud.querySelector('.hud-top');
    if (pause) {
      if (top && pause.parentElement !== top) top.appendChild(pause);
      pause.classList.add('ff-hud-pause-v1');
      if (!pause.querySelector('img')) pause.innerHTML = `<img src="${ICONS.pause}" alt="" aria-hidden="true">`;
      pause.setAttribute('aria-label', game?.lang === 'en' ? 'Pause' : 'إيقاف مؤقت');
    }

    removeRetiredHud();
    return hud;
  }

  function install() {
    const game = window.game;
    if (!game) return false;
    const hud = ensureHud(game);
    if (!hud) return false;

    let lastLang = game.lang;
    let last = 0;
    const tick = now => {
      if (now - last > 250) {
        last = now;
        ensureHud(game);
        if (game.lang !== lastLang) {
          lastLang = game.lang;
          const pause = document.getElementById('ffPauseBtn');
          if (pause) pause.setAttribute('aria-label', game.lang === 'en' ? 'Pause' : 'إيقاف مؤقت');
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    window.__FF_UI_HUD_V1__ = {
      version: 'ui-hud-v1.2',
      feverBar: false,
      duplicateBossBar: false
    };
    console.log('[FF-LAB] ui-hud-v1.2-installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (install() || tries > 200) clearInterval(timer);
  }, 75);
  setTimeout(install, 1400);
})();
