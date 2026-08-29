(() => {
  'use strict';
  if (window.__FF_WORLD_SELECT_V1__) return;

  const THUMBS = [
    'assets/ui/world-thumbnails/world-1.webp',
    'assets/ui/world-thumbnails/world-2.webp',
    'assets/ui/world-thumbnails/world-3.webp',
    'assets/ui/world-thumbnails/world-4.webp'
  ];

  THUMBS.forEach(src => {
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
  });

  function ensureStructure() {
    const screen = document.getElementById('startScreen');
    const titleBox = screen?.querySelector('.title-container');
    const card = document.getElementById('worldCard');
    const preview = card?.querySelector('.bird-preview');
    if (!screen || !titleBox || !card || !preview) return null;

    let logo = titleBox.querySelector('.ff-main-logo');
    if (!logo) {
      logo = document.createElement('img');
      logo.className = 'ff-main-logo';
      logo.src = 'assets/ui/loading-hq/feather-fury-logo.png?v=20260828b';
      logo.alt = 'Feather Fury';
      logo.decoding = 'async';
      logo.draggable = false;
      titleBox.appendChild(logo);
    }

    let kicker = card.querySelector('.ff-world-kicker');
    if (!kicker) {
      kicker = document.createElement('div');
      kicker.className = 'ff-world-kicker';
      card.prepend(kicker);
    }

    let thumb = preview.querySelector('.ff-world-thumb');
    if (!thumb) {
      thumb = document.createElement('div');
      thumb.className = 'ff-world-thumb';
      thumb.setAttribute('aria-hidden','true');
      preview.appendChild(thumb);
    }

    return { screen, card, kicker, thumb };
  }

  function isWorldLocked(game, index, card) {
    if (card.classList.contains('locked')) return true;
    if (Array.isArray(game?.worlds) && game.worlds[index] && typeof game.worlds[index].unlocked === 'boolean') {
      return !game.worlds[index].unlocked;
    }
    if (index === 1) return !game?.w1Completed;
    if (index === 2) return !game?.w2Completed;
    if (index >= 3) return true;
    return false;
  }

  function apply(game) {
    const ui = ensureStructure();
    if (!ui) return;
    const raw = Number.isInteger(game?.currentWorldIndex) ? game.currentWorldIndex : 0;
    const index = Math.max(0, Math.min(THUMBS.length - 1, raw));
    ui.kicker.textContent = `WORLD ${index + 1}`;
    ui.thumb.style.backgroundImage = `url('${THUMBS[index]}')`;
    ui.card.classList.toggle('ff-locked', isWorldLocked(game, index, ui.card));
    ui.card.dataset.ffWorld = String(index + 1);

    const play = document.getElementById('startStoryBtn');
    if (play && !play.dataset.ffWorldLabel) {
      play.dataset.ffWorldLabel = '1';
    }
    if (play && !play.disabled) play.textContent = game?.lang === 'ar' ? 'ابدأ' : 'PLAY';
  }

  function hook() {
    const game = window.game;
    if (!game || typeof game.updateCarousel !== 'function') return false;
    if (!game.__ffWorldSelectV1Hooked) {
      const original = game.updateCarousel.bind(game);
      game.updateCarousel = (...args) => {
        const out = original(...args);
        requestAnimationFrame(() => apply(game));
        return out;
      };
      game.__ffWorldSelectV1Hooked = true;
    }
    apply(game);
    return true;
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    ensureStructure();
    if (hook() || attempts > 160) clearInterval(timer);
  }, 50);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.game) apply(window.game);
  });

  window.__FF_WORLD_SELECT_V1__ = { apply: () => apply(window.game) };
})();
