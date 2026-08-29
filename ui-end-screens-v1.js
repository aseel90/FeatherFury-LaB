(() => {
  'use strict';
  if (window.__FF_END_SCREENS_V1__) return;

  const state = { victory:false };
  const lang = () => window.game?.lang === 'ar' ? 'ar' : 'en';
  const copy = {
    ar: { victory:'اكتمل العالم', defeat:'انتهت المحاولة' },
    en: { victory:'World Complete', defeat:'Run Over' }
  };

  function ensureKicker() {
    const dialog = document.querySelector('#gameOverScreen .game-over-dialog');
    if (!dialog) return null;
    let kicker = document.getElementById('ffEndKicker');
    if (!kicker) {
      kicker = document.createElement('div');
      kicker.id = 'ffEndKicker';
      const title = document.getElementById('endGameTitle');
      dialog.insertBefore(kicker, title || dialog.firstChild);
    }
    return kicker;
  }

  function applyState(victory) {
    state.victory = !!victory;
    const screen = document.getElementById('gameOverScreen');
    if (!screen) return;
    screen.classList.add('ff-end-ui');
    screen.classList.toggle('ff-victory', state.victory);
    screen.classList.toggle('ff-defeat', !state.victory);
    const kicker = ensureKicker();
    if (kicker) kicker.textContent = copy[lang()][state.victory ? 'victory' : 'defeat'];
  }

  function inferState() {
    const next = document.getElementById('nextWorldActionBtn');
    return !!next && !next.classList.contains('hidden') && next.style.display !== 'none';
  }

  function decoratePause() {
    const overlay = document.getElementById('ffPauseOverlay');
    if (!overlay) return false;
    overlay.classList.add('ff-end-ui');
    return true;
  }

  function installGameHook() {
    const game = window.game;
    if (!game || typeof game.gameOver !== 'function') return false;
    if (!game.__ffEndScreensV1Wrapped) {
      const baseGameOver = game.gameOver.bind(game);
      game.gameOver = function(isVictory = false, ...args) {
        applyState(!!isVictory);
        const result = baseGameOver(isVictory, ...args);
        [30, 220, 1080].forEach(ms => setTimeout(() => applyState(!!isVictory), ms));
        return result;
      };
      if (typeof game.reset === 'function') {
        const baseReset = game.reset.bind(game);
        game.reset = function(...args) {
          applyState(false);
          return baseReset(...args);
        };
      }
      game.__ffEndScreensV1Wrapped = true;
    }
    return true;
  }

  function watchEndScreen() {
    const screen = document.getElementById('gameOverScreen');
    if (!screen || screen.__ffEndScreenObserver) return !!screen;
    screen.classList.add('ff-end-ui');
    const obs = new MutationObserver(() => {
      const active = screen.classList.contains('active') && !screen.classList.contains('hidden');
      if (active) requestAnimationFrame(() => applyState(inferState()));
    });
    obs.observe(screen, { attributes:true, attributeFilter:['class'] });
    screen.__ffEndScreenObserver = obs;
    return true;
  }

  let lastLang = null;
  const timer = setInterval(() => {
    const gameOk = installGameHook();
    const endOk = watchEndScreen();
    decoratePause();
    const nowLang = lang();
    if (nowLang !== lastLang) {
      lastLang = nowLang;
      if (document.getElementById('gameOverScreen')?.classList.contains('active')) applyState(inferState());
    }
    if (gameOk && endOk && document.getElementById('ffPauseOverlay')) {
      clearInterval(timer);
      setInterval(() => {
        decoratePause();
        const nextLang = lang();
        if (nextLang !== lastLang) {
          lastLang = nextLang;
          if (document.getElementById('gameOverScreen')?.classList.contains('active')) applyState(inferState());
        }
      }, 350);
    }
  }, 80);

  window.__FF_END_SCREENS_V1__ = true;
})();