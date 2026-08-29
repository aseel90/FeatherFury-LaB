(()=>{
  'use strict';
  if (window.__FF_STARTUP_MENU_GUARD_V1__) return;

  let normalized = false;
  let pauseObserver = null;

  const menuVisible = () => {
    const s = document.getElementById('startScreen');
    return !!s && s.classList.contains('active') && !s.classList.contains('hidden');
  };

  const hidePause = () => {
    const overlay = document.getElementById('ffPauseOverlay');
    const btn = document.getElementById('ffPauseBtn');
    overlay?.classList.remove('show');
    btn?.classList.remove('show');
    if (window.game) window.game.__ffPaused = false;
  };

  const normalizeBootDestination = () => {
    const game = window.game;
    const start = document.getElementById('startScreen');
    if (!game || !start || !window.__FF_RUNTIME_APPROVED_STACK__) return false;

    const end = document.getElementById('gameOverScreen');
    const settings = document.getElementById('settingsScreen');
    const shop = document.getElementById('shopScreen');

    game.__ffPaused = false;
    game.state = 'MENU';
    hidePause();

    end?.classList.remove('active'); end?.classList.add('hidden');
    settings?.classList.remove('active'); settings?.classList.add('hidden');
    shop?.classList.remove('active'); shop?.classList.add('hidden');
    start.classList.remove('hidden'); start.classList.add('active');

    try { game.updateCarousel?.(); } catch (_) {}
    normalized = true;
    return true;
  };

  const installPauseGuard = () => {
    const overlay = document.getElementById('ffPauseOverlay');
    if (!overlay || pauseObserver) return;
    pauseObserver = new MutationObserver(() => {
      const splashActive = document.documentElement.classList.contains('ff-approved-splash-active');
      if ((splashActive || menuVisible()) && overlay.classList.contains('show')) hidePause();
    });
    pauseObserver.observe(overlay, { attributes:true, attributeFilter:['class'] });
  };

  const tick = setInterval(() => {
    installPauseGuard();
    if (!normalized) normalizeBootDestination();
    if (normalized && menuVisible()) hidePause();
    if (normalized && pauseObserver) clearInterval(tick);
  }, 40);

  setTimeout(() => {
    installPauseGuard();
    if (!normalized) normalizeBootDestination();
  }, 1200);

  window.addEventListener('pageshow', () => {
    if (menuVisible()) hidePause();
  });

  window.__FF_STARTUP_MENU_GUARD_V1__ = { version:'1.0.0', normalize:normalizeBootDestination, hidePause };
})();
