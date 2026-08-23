(() => {
  'use strict';

  // Stop browser zoom gestures inside the game shell without breaking vertical scrolling in menus.
  let lastTouchEnd = 0;
  document.addEventListener('gesturestart', e => e.preventDefault(), { passive: false });
  document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
  document.addEventListener('touchend', e => {
    if (e.target?.closest?.('#shopScreen,#settingsScreen,#leaderboardScreen')) {
      lastTouchEnd = Date.now();
      return;
    }
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });

  function applyLabMenu(game) {
    const screen = document.getElementById('startScreen');
    const status = document.getElementById('worldStatus');
    const prev = document.getElementById('prevWorldBtn');
    const next = document.getElementById('nextWorldBtn');
    if (!screen || !status) return;

    const index = Number.isInteger(game.currentWorldIndex) ? game.currentWorldIndex : 0;
    const backgrounds = ['world-bg-ruins','world-bg-ice','world-bg-storm','world-bg-volcano'];
    screen.classList.remove(...backgrounds);
    screen.classList.add(backgrounds[index] || backgrounds[0]);

    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === 3;

    // Always refresh status so text from a locked world cannot leak into another card.
    if (index === 0 || (index === 1 && game.w1Completed) || (index === 2 && game.w2Completed)) {
      status.textContent = game.lang === 'ar' ? 'جاهز للعب!' : 'Ready to play!';
    } else if (index === 3) {
      status.textContent = game.lang === 'ar' ? 'قريباً في تحديث قادم' : 'Coming in a future update';
    }
  }

  function hookGame() {
    const game = window.game;
    if (!game || game.__labUiHooked || typeof game.updateCarousel !== 'function') return false;
    const original = game.updateCarousel.bind(game);
    game.updateCarousel = (...args) => {
      const result = original(...args);
      applyLabMenu(game);
      return result;
    };
    game.__labUiHooked = true;
    applyLabMenu(game);
    return true;
  }

  // Smart TV / keyboard: world switching from the home screen.
  document.addEventListener('keydown', e => {
    const screen = document.getElementById('startScreen');
    if (!screen || screen.classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft') {
      const btn = document.getElementById('prevWorldBtn');
      if (btn && !btn.disabled) { e.preventDefault(); btn.click(); btn.focus(); }
    } else if (e.key === 'ArrowRight') {
      const btn = document.getElementById('nextWorldBtn');
      if (btn && !btn.disabled) { e.preventDefault(); btn.click(); btn.focus(); }
    }
  });

  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (hookGame() || tries > 100) clearInterval(timer);
  }, 50);
})();
