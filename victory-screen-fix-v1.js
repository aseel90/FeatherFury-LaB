(() => {
  'use strict';

  function install() {
    const game = window.game;
    const reviveBtn = document.getElementById('reviveBtn');
    if (!game || !reviveBtn || typeof game.gameOver !== 'function') return false;
    if (game.__victoryScreenFixV1Installed) return true;

    const setReviveVisibility = (isVictory) => {
      const btn = document.getElementById('reviveBtn');
      if (!btn) return;
      if (isVictory) {
        btn.classList.add('hidden');
        btn.style.display = 'none';
        btn.setAttribute('aria-hidden', 'true');
      } else {
        btn.classList.remove('hidden');
        btn.style.display = '';
        btn.removeAttribute('aria-hidden');
      }
    };

    const originalGameOver = game.gameOver.bind(game);
    game.gameOver = function(isVictory = false, ...args) {
      const victory = !!isVictory;
      const result = originalGameOver(isVictory, ...args);

      // Some older end-screen/revive patches refresh UI shortly after gameOver.
      // Re-assert the correct state after those refreshes so victory can never
      // show the revive CTA, while normal deaths still can.
      setReviveVisibility(victory);
      [20, 180, 1100].forEach(ms => setTimeout(() => setReviveVisibility(victory), ms));
      return result;
    };

    if (typeof game.reset === 'function') {
      const originalReset = game.reset.bind(game);
      game.reset = function(...args) {
        setReviveVisibility(false);
        return originalReset(...args);
      };
    }

    game.__victoryScreenFixV1Installed = true;
    console.log('[FF-LAB] victory-screen-fix-v1-installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 100) clearInterval(timer);
  }, 80);
  setTimeout(install, 1400);
})();
