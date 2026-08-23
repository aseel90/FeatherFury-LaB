(() => {
  'use strict';

  if (!document.querySelector('style[data-lab-panels]')) {
    const style = document.createElement('style');
    style.dataset.labPanels = '1';
    style.textContent = '#settingsScreen,#leaderboardScreen,#shopScreen{background:linear-gradient(180deg,rgba(7,14,24,.94),rgba(8,15,27,.98)) !important;padding:clamp(16px,3vw,24px) !important;color:#f8fafc;} #settingsScreen>h2,#leaderboardScreen .shop-header h2,#shopScreen .shop-header h2{margin:0 !important;font-family:\'Tajawal\',sans-serif !important;font-size:clamp(1.28rem,4.5vw,1.65rem) !important;font-weight:900 !important;color:#f8fafc !important;letter-spacing:.2px;text-shadow:0 2px 8px rgba(0,0,0,.35);} #settingsScreen{justify-content:flex-start !important;align-items:center;gap:clamp(14px,2vh,20px);overflow-y:auto;} #settingsScreen>h2{width:min(100%,520px);padding-top:clamp(8px,1.5vh,18px);text-align:center;} #settingsScreen .settings-panel{width:min(100%,520px);gap:0;padding:8px 14px;border:1px solid rgba(148,163,184,.22);border-radius:22px;background:linear-gradient(180deg,rgba(30,41,59,.78),rgba(15,23,42,.88));box-shadow:0 18px 38px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.05);} #settingsScreen .setting-row{min-height:64px;padding:9px 4px;gap:14px;border-bottom:1px solid rgba(148,163,184,.14);font-size:clamp(.95rem,3.4vw,1.05rem);font-weight:800;} #settingsScreen .setting-row:last-child{margin-top:0 !important;padding-top:12px !important;border-top:none !important;border-bottom:none;} #settingsScreen .secondary-btn{min-width:104px;min-height:38px;padding:7px 13px !important;border:1px solid rgba(148,163,184,.28);border-radius:12px;background:linear-gradient(180deg,#334155,#263548);color:#f8fafc;font-size:.9rem !important;font-weight:900;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 4px 10px rgba(0,0,0,.16);} #settingsScreen #resetDataBtn{width:auto !important;min-height:38px;padding:7px 14px !important;border:1px solid rgba(248,113,113,.5) !important;border-radius:12px;background:rgba(127,29,29,.55) !important;color:#fecaca;box-shadow:none;font-size:.82rem !important;} #settingsScreen .version-info{margin-top:auto !important;opacity:.72;} #settingsScreen .return-btn{width:min(100%,320px);min-height:48px;margin-top:0 !important;} #leaderboardScreen{justify-content:flex-start !important;gap:16px;overflow-y:auto;} #leaderboardScreen .shop-header{width:min(100%,520px) !important;min-height:56px;padding:2px 2px 12px;border-bottom:1px solid rgba(148,163,184,.18);} #closeLeaderboardBtn{position:relative;width:42px !important;height:42px;min-width:42px;padding:0 !important;margin:0 !important;border:1px solid rgba(148,163,184,.24) !important;border-radius:50%;background:rgba(30,41,59,.82) !important;box-shadow:none !important;color:transparent !important;font-size:0 !important;} #closeLeaderboardBtn::before,#closeLeaderboardBtn::after{content:"";position:absolute;left:50%;top:50%;width:18px;height:2px;border-radius:2px;background:#e2e8f0;} #closeLeaderboardBtn::before{transform:translate(-50%,-50%) rotate(45deg)} #closeLeaderboardBtn::after{transform:translate(-50%,-50%) rotate(-45deg)} #leaderboardScreen .leaderboard-content{width:min(100%,520px) !important;max-width:520px !important;margin-top:0 !important;padding:12px !important;border:1px solid rgba(148,163,184,.18);border-radius:20px !important;background:linear-gradient(180deg,rgba(30,41,59,.76),rgba(15,23,42,.88)) !important;box-shadow:0 18px 36px rgba(0,0,0,.25);} #leaderboardList{gap:8px !important;} .leaderboard-row{min-height:52px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 12px;border:1px solid rgba(148,163,184,.10);border-radius:14px;background:rgba(15,23,42,.52);font-family:\'Tajawal\',sans-serif;} .leaderboard-row.is-you{border-color:rgba(56,189,248,.48);background:linear-gradient(90deg,rgba(14,116,144,.22),rgba(15,23,42,.56));box-shadow:inset 3px 0 0 #38bdf8;} .leaderboard-player{display:flex;align-items:center;gap:10px;min-width:0} .leaderboard-rank{flex:0 0 34px;font-family:\'Press Start 2P\',cursive;font-size:.62rem;color:#64748b;} .rank-1 .leaderboard-rank{color:#facc15} .rank-2 .leaderboard-rank{color:#cbd5e1} .rank-3 .leaderboard-rank{color:#d97706} .leaderboard-name{font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis} .leaderboard-score{flex:0 0 auto;min-width:58px;padding:5px 8px;text-align:center;border-radius:10px;background:rgba(250,204,21,.10);color:#fde047;font-family:\'Press Start 2P\',cursive;font-size:.62rem;} #leaderboardScreen [data-i18n="leaderboardSubtitle"]{margin-top:12px !important;color:#64748b !important;font-size:.76rem !important;} #shopScreen{gap:14px;overflow:hidden;} #shopScreen .shop-header{width:min(100%,640px);margin:0 auto;padding:0 2px 12px;border-bottom:1px solid rgba(148,163,184,.18);} #shopScreen .shop-balance{min-height:38px;padding:6px 12px;border-radius:14px;background:rgba(2,6,23,.58);} #shopScreen .skins-grid{width:min(100%,640px);margin:0 auto;grid-template-columns:repeat(2,minmax(0,1fr));align-content:start;gap:10px;padding:2px 3px 10px;overscroll-behavior:contain;} #shopScreen .skin-card{min-height:164px;padding:11px 9px 10px;gap:7px;border:1px solid rgba(148,163,184,.18);border-radius:18px;background:linear-gradient(180deg,rgba(30,41,59,.90),rgba(15,23,42,.96));box-shadow:0 10px 22px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.04);} #shopScreen .skin-card.active-skin{border-color:rgba(34,197,94,.72);box-shadow:0 0 0 1px rgba(34,197,94,.16),0 10px 24px rgba(0,0,0,.20),inset 0 -18px 30px rgba(34,197,94,.08);} #shopScreen .skin-card-canvas-wrap{width:72px;height:58px;border-radius:15px;background:rgba(255,255,255,.04);} #shopScreen .skin-card-title{min-height:34px;display:flex;align-items:center;justify-content:center;font-size:.88rem;line-height:1.15;} #shopScreen .skin-card-cost{min-height:20px;justify-content:center;font-size:.6rem;} #shopScreen .skin-action-btn{width:100%;min-height:36px;padding:6px 9px;border-radius:11px;font-size:.82rem;box-shadow:none !important;} #shopScreen .skin-action-btn.buy-btn{background:linear-gradient(180deg,#d97706,#b45309)} #shopScreen .skin-action-btn.equip-btn{background:linear-gradient(180deg,#2563eb,#1d4ed8)} #shopScreen .skin-action-btn.equipped-badge{background:rgba(22,101,52,.88);color:#dcfce7} #shopScreen .return-btn{width:min(100%,360px);min-height:48px;margin:0 auto;} @media(max-width:390px){#settingsScreen,#leaderboardScreen,#shopScreen{padding:14px 12px !important} #settingsScreen .setting-row{min-height:58px} #settingsScreen .secondary-btn{min-width:92px} #shopScreen .skins-grid{gap:8px} #shopScreen .skin-card{min-height:154px;padding:9px 7px} #shopScreen .skin-card-canvas-wrap{width:64px;height:52px}} @media(max-width:350px){#shopScreen .skins-grid{grid-template-columns:1fr} #shopScreen .skin-card{min-height:142px}} @media(min-width:700px){#shopScreen .skins-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:14px} #shopScreen .skin-card{min-height:184px;padding:14px 12px} #settingsScreen .settings-panel,#leaderboardScreen .leaderboard-content{max-width:560px !important}} @media(max-height:650px){#settingsScreen,#leaderboardScreen,#shopScreen{padding-top:10px !important;padding-bottom:10px !important} #settingsScreen{gap:10px} #settingsScreen .setting-row{min-height:50px;padding:6px 3px} #shopScreen{gap:9px} #shopScreen .skin-card{min-height:142px} #shopScreen .return-btn,#settingsScreen .return-btn{min-height:44px}}';
    document.head.appendChild(style);
  }

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

    if (index === 0 || (index === 1 && game.w1Completed) || (index === 2 && game.w2Completed)) {
      status.textContent = game.lang === 'ar' ? 'جاهز للعب!' : 'Ready to play!';
    } else if (index === 3) {
      status.textContent = game.lang === 'ar' ? 'قريباً في تحديث قادم' : 'Coming in a future update';
    }
  }

  function renderShopClean(game) {
    const grid = document.getElementById('skinsGrid');
    if (!grid || typeof SKINS === 'undefined' || typeof drawBirdSkin !== 'function') return;
    grid.innerHTML = '';

    Object.keys(SKINS).forEach(key => {
      const skin = SKINS[key];
      const isUnlocked = game.unlockedSkins.has(key);
      const isEquipped = game.activeSkin === key;

      const card = document.createElement('div');
      card.className = `skin-card ${isEquipped ? 'active-skin' : ''}`;

      const canvasWrap = document.createElement('div');
      canvasWrap.className = 'skin-card-canvas-wrap';
      const canvas = document.createElement('canvas');
      canvas.width = 60; canvas.height = 50;
      drawBirdSkin(canvas.getContext('2d'), key, 30, 25, 0, 0, 1.15);
      canvasWrap.appendChild(canvas);

      const title = document.createElement('div');
      title.className = 'skin-card-title';
      title.textContent = skin['name_' + game.lang];

      const cost = document.createElement('div');
      cost.className = 'skin-card-cost';
      if (isUnlocked) {
        cost.textContent = game.lang === 'ar' ? 'مملوك' : 'Owned';
      } else {
        const price = document.createElement('span');
        price.textContent = skin.price;
        const coin = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        coin.setAttribute('width', '12'); coin.setAttribute('height', '12'); coin.setAttribute('viewBox', '0 0 24 24');
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttribute('href', '#coin-svg');
        coin.appendChild(use);
        cost.append(price, coin);
      }

      const btn = document.createElement('button');
      btn.className = 'skin-action-btn';
      if (isEquipped) {
        btn.classList.add('equipped-badge');
        btn.textContent = game.lang === 'ar' ? 'مفعّل' : 'Equipped';
      } else if (isUnlocked) {
        btn.classList.add('equip-btn');
        btn.textContent = game.lang === 'ar' ? 'اختيار' : 'Equip';
        btn.onclick = () => {
          game.activeSkin = key;
          safeSet('fh_active_skin', key);
          game.sound.playScore();
          game.updatePreview();
          renderShopClean(game);
        };
      } else {
        btn.classList.add('buy-btn');
        btn.textContent = game.lang === 'ar' ? 'شراء' : 'Buy';
        if (game.totalCoins < skin.price) btn.disabled = true;
        btn.onclick = () => {
          if (game.totalCoins < skin.price) return;
          game.totalCoins -= skin.price;
          game.unlockedSkins.add(key);
          game.activeSkin = key;
          safeSet('fh_unlocked_skins', JSON.stringify([...game.unlockedSkins]));
          safeSet('fh_active_skin', key);
          game.updateCoinDisplays();
          game.updatePreview();
          renderShopClean(game);
        };
      }

      card.append(canvasWrap, title, cost, btn);
      grid.appendChild(card);
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
      const players = Array.from({ length: 5 }, () => ({
        name: names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 99),
        score: Math.floor(Math.random() * 80) + 20
      }));
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

  function hookGame() {
    const game = window.game;
    if (!game || game.__labUiHooked || typeof game.updateCarousel !== 'function') return false;

    const originalCarousel = game.updateCarousel.bind(game);
    game.updateCarousel = (...args) => {
      const result = originalCarousel(...args);
      applyLabMenu(game);
      return result;
    };

    game.renderShop = () => renderShopClean(game);
    renderShopClean(game);
    bindLeaderboardClean(game);

    game.__labUiHooked = true;
    applyLabMenu(game);
    return true;
  }

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
    if (hookGame() || tries > 200) clearInterval(timer);
  }, 50);
})();
