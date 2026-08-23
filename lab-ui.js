/* LAB UI / UX enhancement layer - isolated from core game logic */
(function () {
  'use strict';

  const MENU_BG_CLASS = 'world-bg-';
  const WORLD_BG_CLASSES = ['world-bg-ruins', 'world-bg-ice', 'world-bg-storm', 'world-bg-volcano'];

  function guardDoubleTapZoom() {
    let lastTouchEnd = 0;
    document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) e.preventDefault();
      lastTouchEnd = now;
    }, { passive: false });
  }

  function applyLabMenu(game) {
    const startScreen = document.getElementById('startScreen');
    const prev = document.getElementById('prevWorldBtn');
    const next = document.getElementById('nextWorldBtn');
    const worldStatus = document.getElementById('worldStatus');
    if (!startScreen || !game) return;

    startScreen.classList.remove(...WORLD_BG_CLASSES);
    const worldIndex = Math.max(0, Math.min(3, Number(game.currentWorld || 0)));
    startScreen.classList.add(WORLD_BG_CLASSES[worldIndex]);

    if (prev) prev.disabled = worldIndex <= 0;
    if (next) next.disabled = worldIndex >= 3;

    if (worldStatus && typeof game.worlds !== 'undefined' && game.worlds?.[worldIndex]) {
      const w = game.worlds[worldIndex];
      if (w.unlocked === false) {
        worldStatus.textContent = game.lang === 'ar' ? 'عالم مقفل' : 'Locked World';
      } else if (worldStatus.textContent && /locked|مقفل/i.test(worldStatus.textContent)) {
        worldStatus.textContent = game.lang === 'ar' ? 'جاهز للعب!' : 'Ready to play!';
      }
    }
  }

  function keyboardNavigation(game) {
    document.addEventListener('keydown', (e) => {
      const startScreen = document.getElementById('startScreen');
      if (!startScreen?.classList.contains('active')) return;
      if (e.key === 'ArrowLeft') {
        document.getElementById('prevWorldBtn')?.click();
      } else if (e.key === 'ArrowRight') {
        document.getElementById('nextWorldBtn')?.click();
      }
    });
  }

  function bindSettingsClean(game) {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsScreen = document.getElementById('settingsScreen');
    const returnBtn = document.getElementById('settingsReturnBtn');
    if (!settingsBtn || !settingsScreen || !returnBtn) return;

    settingsBtn.addEventListener('click', () => {
      settingsScreen.classList.remove('hidden');
      settingsScreen.classList.add('active');
      setTimeout(() => returnBtn.focus({ preventScroll: true }), 40);
    });

    returnBtn.addEventListener('click', () => {
      settingsScreen.classList.remove('active');
      settingsScreen.classList.add('hidden');
      settingsBtn.focus({ preventScroll: true });
    });
  }

  function buildShop(game) {
    const grid = document.getElementById('shopGrid');
    if (!grid || !game?.skins) return;
    grid.innerHTML = '';

    const ownedSkins = Array.isArray(game.ownedSkins) ? game.ownedSkins : [];
    const activeSkin = game.activeSkin;
    const coins = Number(game.coins || 0);

    game.skins.forEach((skin, index) => {
      const card = document.createElement('article');
      card.className = 'lab-shop-card';
      if (skin.id === activeSkin) card.classList.add('is-equipped');

      const canvasWrap = document.createElement('div');
      canvasWrap.className = 'lab-shop-bird';
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      canvasWrap.appendChild(canvas);

      try {
        if (typeof game.drawBirdPreview === 'function') {
          game.drawBirdPreview(canvas, skin.id);
        }
      } catch (_) {}

      const title = document.createElement('h3');
      title.className = 'lab-shop-name';
      title.textContent = skin.name || skin.id || `Hero ${index + 1}`;

      const cost = document.createElement('div');
      cost.className = 'lab-shop-cost';

      const isOwned = index === 0 || ownedSkins.includes(skin.id);
      const isEquipped = skin.id === activeSkin;
      if (isEquipped) {
        cost.textContent = 'Equipped';
        cost.classList.add('equipped-label');
      } else if (isOwned) {
        cost.textContent = 'Owned';
      } else {
        cost.textContent = `${skin.price || 0}`;
        const coin = document.createElement('span');
        coin.className = 'lab-coin-dot';
        cost.appendChild(coin);
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lab-shop-action';
      if (isEquipped) {
        btn.textContent = 'Equipped';
        btn.disabled = true;
        btn.classList.add('equipped');
      } else if (isOwned) {
        btn.textContent = 'Equip';
        btn.classList.add('equip');
        btn.addEventListener('click', () => {
          game.activeSkin = skin.id;
          try { localStorage.setItem('ff_active_skin', skin.id); } catch (_) {}
          buildShop(game);
        });
      } else {
        btn.textContent = 'Buy';
        const canAfford = coins >= Number(skin.price || 0);
        btn.disabled = !canAfford;
        if (!canAfford) btn.classList.add('cant-afford');
        btn.addEventListener('click', () => {
          if (btn.disabled) return;
          try {
            if (typeof game.buySkin === 'function') game.buySkin(skin.id);
          } catch (_) {}
          buildShop(game);
        });
      }

      card.append(canvasWrap, title, cost, btn);
      grid.appendChild(card);
    });
  }

  function bindShopClean(game) {
    const shopBtn = document.getElementById('shopBtn');
    const shopScreen = document.getElementById('shopScreen');
    const returnBtn = document.getElementById('shopReturnBtn');
    if (!shopBtn || !shopScreen || !returnBtn) return;

    shopBtn.addEventListener('click', () => {
      buildShop(game);
      shopScreen.classList.remove('hidden');
      shopScreen.classList.add('active');
      setTimeout(() => returnBtn.focus({ preventScroll: true }), 40);
    });

    returnBtn.addEventListener('click', () => {
      shopScreen.classList.remove('active');
      shopScreen.classList.add('hidden');
      shopBtn.focus({ preventScroll: true });
    });
  }

  function bindLeaderboardClean(game) {
    const openBtn = document.getElementById('leaderboardBtn');
    const closeBtn = document.getElementById('closeLeaderboardBtn');
    const screen = document.getElementById('leaderboardScreen');
    const list = document.getElementById('leaderboardList');
    if (!openBtn || !closeBtn || !screen || !list) return;

    const names = ['SkyWalker','Birdy','Faker','ProGamer','NoobMaster','IceKing','Feather','Glider','Ninja','Ghost'];
    openBtn.onclick = () => {
      const scoreTiers = [511, 438, 372, 309, 254];
      const usedNames = new Set();
      const players = scoreTiers.map((baseScore) => {
        let baseName;
        do {
          baseName = names[Math.floor(Math.random() * names.length)];
        } while (usedNames.has(baseName));
        usedNames.add(baseName);
        return {
          name: baseName + Math.floor(Math.random() * 99),
          score: baseScore - Math.floor(Math.random() * 18)
        };
      });
      const you = (typeof I18N !== 'undefined' && I18N[game.lang]?.you) ? I18N[game.lang].you : (game.lang === 'ar' ? 'أنت' : 'You');
      players.push({ name: you, score: game.highScore });
      players.sort((a,b) => b.score - a.score);

      list.innerHTML = '';
      players.forEach((p, index) => {
        const row = document.createElement('li');
        row.className = `leaderboard-row ${index < 3 ? `rank-${index + 1}` : 'rank-standard'} ${p.name === you ? 'is-you' : ''}`;

        const player = document.createElement('span');
        player.className = 'leaderboard-player';
        const rank = document.createElement('span');
        rank.className = 'leaderboard-rank';
        rank.textContent = `#${index + 1}`;
        const name = document.createElement('span');
        name.className = 'leaderboard-name';
        name.textContent = p.name;
        player.append(rank, name);

        const score = document.createElement('span');
        score.className = 'leaderboard-score';
        score.textContent = p.score;
        row.append(player, score);
        list.appendChild(row);
      });

      screen.classList.remove('hidden');
      screen.classList.add('active');
      closeBtn.focus({ preventScroll: true });
    };

    closeBtn.onclick = () => {
      screen.classList.remove('active');
      screen.classList.add('hidden');
      openBtn.focus({ preventScroll: true });
    };
  }

  function enhance(game) {
    guardDoubleTapZoom();
    applyLabMenu(game);
    keyboardNavigation(game);
    bindSettingsClean(game);
    bindShopClean(game);
    bindLeaderboardClean(game);

    if (typeof game.updateCarousel === 'function' && !game.__labCarouselHooked) {
      const original = game.updateCarousel.bind(game);
      game.updateCarousel = function (...args) {
        const result = original(...args);
        applyLabMenu(game);
        return result;
      };
      game.__labCarouselHooked = true;
    }
  }

  function boot() {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      const game = window.game;
      if (game) {
        clearInterval(timer);
        enhance(game);
      } else if (attempts > 80) {
        clearInterval(timer);
      }
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
