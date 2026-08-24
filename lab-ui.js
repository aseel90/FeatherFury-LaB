/* FeatherFury LAB UI loader: restore the last known-good full UI and unlock playable worlds for testing. */
(function () {
  'use strict';

  const GOOD_UI = 'https://cdn.jsdelivr.net/gh/aseel90/FeatherFury-LaB@c7a02550edbbc12d30370a2551c02113008ffb4a/lab-ui.js';

  function unlockPlayableWorlds() {
    let tries = 0;
    const timer = setInterval(() => {
      const game = window.game;
      if (!game) {
        if (++tries > 120) clearInterval(timer);
        return;
      }

      game.w1Completed = true;
      game.w2Completed = true;
      if (Array.isArray(game.worlds)) {
        game.worlds.forEach((world, index) => {
          if (world && index <= 2) world.unlocked = true;
        });
      }

      if (typeof game.updateCarousel === 'function') game.updateCarousel();
      console.log('[FF-LAB] Playable worlds unlocked for test mode');
      clearInterval(timer);
    }, 50);
  }

  const script = document.createElement('script');
  script.src = GOOD_UI;
  script.async = false;
  script.onload = unlockPlayableWorlds;
  script.onerror = () => {
    console.error('[FF-LAB] Failed to load pinned full lab UI');
    unlockPlayableWorlds();
  };
  document.head.appendChild(script);
})();