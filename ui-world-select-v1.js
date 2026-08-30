(() => {
  'use strict';
  if (window.__FF_WORLD_SELECT_V1__) return;

  const THUMBS = [
    'assets/ui/world-thumbnails/world-1.webp',
    'assets/ui/world-thumbnails/world-2.webp',
    'assets/ui/world-thumbnails/world-3.webp',
    'assets/ui/world-thumbnails/world-4.webp'
  ];

  const WORLD_NAMES = ['Cursed Woods', null, null, null];
  const STAR_FILLED = 'assets/ui/icons/star-filled.svg?v=1';
  const STAR_EMPTY = 'assets/ui/icons/star-empty.svg?v=1';

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

    const title = card.querySelector('.world-title');
    const stars = card.querySelector('.world-stars');
    return { screen, card, kicker, thumb, title, stars };
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

  function getEarnedStars(game, index) {
    const cfg = window.CONFIG || {};
    const stage1 = Number(cfg.STAGE1_END);
    const stage2 = Number(cfg.STAGE2_END);

    if (index === 0) {
      if (game?.w1Completed) return 3;
      const score = Number(game?.highScore || 0);
      if (Number.isFinite(stage2) && score >= stage2) return 2;
      if (Number.isFinite(stage1) && score >= stage1) return 1;
      return 0;
    }

    if (index === 1) {
      if (!game?.w1Completed) return 0;
      if (game?.w2Completed) return 3;
      const score = Number(game?.highScoreW2 || 0);
      if (Number.isFinite(stage2) && score >= stage2) return 2;
      if (Number.isFinite(stage1) && score >= stage1) return 1;
      return 0;
    }

    if (index === 2) {
      if (!game?.w2Completed) return 0;
      if (game?.w3Completed) return 3;
      const score = Number(game?.highScoreW3 || 0);
      if (Number.isFinite(stage2) && score >= stage2) return 2;
      if (Number.isFinite(stage1) && score >= stage1) return 1;
      return 0;
    }

    return 0;
  }

  function syncStars(host, game, index) {
    if (!host) return;
    const total = 3;
    const filled = Math.max(0, Math.min(total, getEarnedStars(game, index)));

    host.replaceChildren(...Array.from({ length: total }, (_, i) => {
      const img = document.createElement('img');
      img.className = 'ff-star-icon';
      img.src = i < filled ? STAR_FILLED : STAR_EMPTY;
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      img.decoding = 'async';
      return img;
    }));
  }

  function apply(game) {
    const ui = ensureStructure();
    if (!ui) return;
    const raw = Number.isInteger(game?.currentWorldIndex) ? game.currentWorldIndex : 0;
    const index = Math.max(0, Math.min(THUMBS.length - 1, raw));
    ui.kicker.textContent = `WORLD ${index + 1}`;
    if (ui.title && WORLD_NAMES[index]) ui.title.textContent = WORLD_NAMES[index];
    syncStars(ui.stars, game, index);
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
