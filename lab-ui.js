(() => {
  'use strict';

  if (!document.querySelector('style[data-lab-panels]')) {
    const style = document.createElement('style');
    style.dataset.labPanels = '1';
    style.textContent = `#settingsScreen,#leaderboardScreen,#shopScreen{
  background:
    radial-gradient(circle at 50% -10%,rgba(245,158,11,.12),transparent 32%),
    linear-gradient(180deg,rgba(7,14,24,.96),rgba(5,10,18,.99)) !important;
  padding:clamp(14px,3vw,24px) !important;color:#f8fafc;
}
#settingsScreen::before,#leaderboardScreen::before,#shopScreen::before{
  content:"";position:absolute;inset:0;pointer-events:none;opacity:.28;
  background:linear-gradient(90deg,transparent 0 48%,rgba(255,255,255,.025) 50%,transparent 52% 100%);
}
#settingsScreen>h2,#leaderboardScreen .shop-header h2,#shopScreen .shop-header h2{
  margin:0 !important;font-family:'Tajawal',sans-serif !important;
  font-size:clamp(1.3rem,4.5vw,1.7rem) !important;font-weight:900 !important;
  color:#fff7df !important;letter-spacing:.3px;
  text-shadow:0 3px 0 rgba(0,0,0,.45),0 0 16px rgba(245,158,11,.18);
}
#settingsScreen{justify-content:flex-start !important;align-items:center;gap:clamp(12px,1.8vh,18px);overflow-y:auto;}
#settingsScreen>h2{width:min(100%,520px);padding-top:clamp(8px,1.5vh,16px);text-align:center;position:relative;}
#settingsScreen>h2::after,#leaderboardScreen .shop-header::after,#shopScreen .shop-header::after{
  content:"";display:block;height:3px;margin-top:10px;border-radius:999px;
  background:linear-gradient(90deg,transparent,#8e7d61 22%,#fbbf24 50%,#8e7d61 78%,transparent);
  box-shadow:0 0 12px rgba(251,191,36,.22);
}
#settingsScreen .settings-panel{
  width:min(100%,520px);gap:0;padding:8px 15px;border:2px solid rgba(142,125,97,.62);border-radius:20px;
  background:linear-gradient(180deg,rgba(31,38,48,.96),rgba(13,20,29,.98));
  box-shadow:0 8px 0 rgba(0,0,0,.28),0 18px 38px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.08),inset 0 -18px 28px rgba(0,0,0,.18);
}
#settingsScreen .setting-row{min-height:62px;padding:9px 4px;gap:14px;border-bottom:1px solid rgba(142,125,97,.20);font-size:clamp(.95rem,3.4vw,1.05rem);font-weight:900;}
#settingsScreen .setting-row:last-child{margin-top:0 !important;padding-top:11px !important;border-top:none !important;border-bottom:none;}
#settingsScreen .secondary-btn{
  min-width:104px;min-height:38px;padding:7px 13px !important;border:2px solid #43566a;border-radius:11px;
  background:linear-gradient(180deg,#4b6075,#2d3e50);color:#f8fafc;font-size:.9rem !important;font-weight:900;
  box-shadow:0 3px 0 #1b2937,inset 0 1px 0 rgba(255,255,255,.14);
}
#settingsScreen #resetDataBtn{width:auto !important;min-height:38px;padding:7px 14px !important;border:2px solid #8b3038 !important;border-radius:11px;background:linear-gradient(180deg,#7f2933,#541c24) !important;color:#fecaca;box-shadow:0 3px 0 #351017 !important;font-size:.82rem !important;}
#settingsScreen .version-info{margin-top:clamp(14px,3vh,34px) !important;opacity:.66;}
#settingsScreen .return-btn,#shopScreen .return-btn{width:min(86%,330px);min-height:46px;margin-top:0 !important;border-color:#31465b;box-shadow:0 4px 0 #162231,0 9px 18px rgba(0,0,0,.22);}

#leaderboardScreen{justify-content:flex-start !important;gap:14px;overflow-y:auto;}
#leaderboardScreen .shop-header{width:min(100%,540px) !important;min-height:58px;padding:2px 2px 0;border-bottom:none;}
#leaderboardScreen .shop-header::after{width:100%;}
#closeLeaderboardBtn{position:relative;width:42px !important;height:42px;min-width:42px;padding:0 !important;margin:0 !important;border:2px solid #46586b !important;border-radius:14px;background:linear-gradient(180deg,#304156,#1f2c3c) !important;box-shadow:0 3px 0 #111b28 !important;color:transparent !important;font-size:0 !important;}
#closeLeaderboardBtn::before,#closeLeaderboardBtn::after{content:"";position:absolute;left:50%;top:50%;width:18px;height:2px;border-radius:2px;background:#f8fafc;}
#closeLeaderboardBtn::before{transform:translate(-50%,-50%) rotate(45deg)} #closeLeaderboardBtn::after{transform:translate(-50%,-50%) rotate(-45deg)}
#leaderboardScreen .leaderboard-content{width:min(100%,540px) !important;max-width:540px !important;margin-top:0 !important;padding:13px !important;border:2px solid rgba(142,125,97,.54);border-radius:20px !important;background:linear-gradient(180deg,rgba(30,39,50,.95),rgba(12,19,29,.98)) !important;box-shadow:0 7px 0 rgba(0,0,0,.30),0 18px 36px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.06);}
#leaderboardList{gap:8px !important;}
.leaderboard-row{min-height:54px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 12px;border:1px solid rgba(148,163,184,.14);border-radius:13px;background:linear-gradient(180deg,rgba(20,31,47,.82),rgba(12,22,37,.86));font-family:'Tajawal',sans-serif;box-shadow:inset 0 1px 0 rgba(255,255,255,.025);}
.leaderboard-row.rank-1{border-color:rgba(250,204,21,.58);background:linear-gradient(90deg,rgba(113,82,7,.30),rgba(17,27,42,.88));box-shadow:inset 4px 0 0 #facc15,0 0 18px rgba(250,204,21,.08);}
.leaderboard-row.rank-2{border-color:rgba(203,213,225,.40);box-shadow:inset 4px 0 0 #cbd5e1;}
.leaderboard-row.rank-3{border-color:rgba(217,119,6,.44);box-shadow:inset 4px 0 0 #d97706;}
.leaderboard-row.is-you{border-color:rgba(56,189,248,.62);background:linear-gradient(90deg,rgba(14,116,144,.26),rgba(15,23,42,.70));box-shadow:inset 4px 0 0 #38bdf8,0 0 18px rgba(56,189,248,.08);}
.leaderboard-player{display:flex;align-items:center;gap:10px;min-width:0}.leaderboard-rank{flex:0 0 34px;font-family:'Press Start 2P',cursive;font-size:.62rem;color:#64748b;}.rank-1 .leaderboard-rank{color:#facc15}.rank-2 .leaderboard-rank{color:#e2e8f0}.rank-3 .leaderboard-rank{color:#fb923c}.leaderboard-name{font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.leaderboard-score{flex:0 0 auto;min-width:58px;padding:6px 8px;text-align:center;border:1px solid rgba(250,204,21,.15);border-radius:9px;background:linear-gradient(180deg,rgba(78,73,36,.65),rgba(41,43,33,.7));color:#fde047;font-family:'Press Start 2P',cursive;font-size:.62rem;box-shadow:inset 0 1px 0 rgba(255,255,255,.05);}
#leaderboardScreen [data-i18n="leaderboardSubtitle"]{margin-top:12px !important;color:#77879a !important;font-size:.76rem !important;letter-spacing:.25px;}

#shopScreen{gap:12px;overflow:hidden;}
#shopScreen .shop-header{width:min(100%,660px);margin:0 auto;padding:0 2px 0;border-bottom:none;position:relative;}
#shopScreen .shop-header::after{width:100%;}
#shopScreen .shop-balance{min-height:40px;padding:6px 13px;border:2px solid #9a6510;border-radius:12px;background:linear-gradient(180deg,#2b2b26,#151a20);box-shadow:0 3px 0 #5e3d08,inset 0 1px 0 rgba(255,255,255,.08);}
#shopScreen .skins-grid{width:min(100%,660px);margin:0 auto;grid-template-columns:repeat(2,minmax(0,1fr));align-content:start;gap:12px;padding:3px 3px 12px;overscroll-behavior:contain;}
#shopScreen .skin-card{min-height:166px;padding:11px 9px 10px;gap:7px;border:2px solid #314157;border-radius:16px;background:linear-gradient(180deg,rgba(31,43,61,.97),rgba(13,23,39,.99));box-shadow:0 5px 0 #0b1320,0 12px 22px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.05);position:relative;overflow:visible;}
#shopScreen .skin-card::before{content:"";position:absolute;left:14%;right:14%;top:-2px;height:3px;border-radius:0 0 3px 3px;background:#53667a;opacity:.65;}
#shopScreen .skin-card.active-skin{border-color:#22c55e;box-shadow:0 5px 0 #0c5a2a,0 12px 24px rgba(0,0,0,.22),0 0 18px rgba(34,197,94,.14),inset 0 -18px 30px rgba(34,197,94,.08);}
#shopScreen .skin-card.active-skin::before{background:#4ade80;opacity:1;}
#shopScreen .skin-card-canvas-wrap{width:74px;height:60px;border:1px solid rgba(148,163,184,.12);border-radius:14px;background:radial-gradient(circle at 50% 40%,rgba(255,255,255,.09),rgba(255,255,255,.025) 65%);box-shadow:inset 0 -8px 12px rgba(0,0,0,.12);}
#shopScreen .skin-card-title{min-height:34px;display:flex;align-items:center;justify-content:center;font-size:.88rem;line-height:1.15;text-shadow:0 2px 0 rgba(0,0,0,.35);}
#shopScreen .skin-card-cost{min-height:20px;justify-content:center;font-size:.6rem;color:#facc15;}
#shopScreen .skin-card.active-skin .skin-card-cost{visibility:hidden;}
#shopScreen .skin-action-btn{width:100%;min-height:36px;padding:6px 9px;border:2px solid transparent;border-radius:10px;font-size:.82rem;box-shadow:0 3px 0 rgba(0,0,0,.32) !important;font-weight:900;}
#shopScreen .skin-action-btn.buy-btn{border-color:#8d4b08;background:linear-gradient(180deg,#d97706,#a94d08);}
#shopScreen .skin-action-btn.buy-btn:disabled{border-color:#4b3a25;background:linear-gradient(180deg,#5c452d,#3b3026);color:#8e8b84;opacity:1;filter:none;box-shadow:0 3px 0 #221b15 !important;}
#shopScreen .skin-action-btn.equip-btn{border-color:#1e40af;background:linear-gradient(180deg,#2563eb,#1d4ed8);}
#shopScreen .skin-action-btn.equipped-badge{border-color:#16813d;background:linear-gradient(180deg,#1fa852,#15743a);color:#ecfdf5;}
#shopScreen .return-btn{margin:0 auto;}
@media(max-width:390px){#settingsScreen,#leaderboardScreen,#shopScreen{padding:13px 12px !important}#settingsScreen .setting-row{min-height:57px}#settingsScreen .secondary-btn{min-width:92px}#shopScreen .skins-grid{gap:10px}#shopScreen .skin-card{min-height:156px;padding:9px 7px}#shopScreen .skin-card-canvas-wrap{width:66px;height:54px}}
@media(max-width:350px){#shopScreen .skins-grid{grid-template-columns:1fr}#shopScreen .skin-card{min-height:144px}}
@media(min-width:700px){#shopScreen .skins-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}#shopScreen .skin-card{min-height:184px;padding:14px 12px}#settingsScreen .settings-panel,#leaderboardScreen .leaderboard-content{max-width:560px !important}}
@media(max-height:650px){#settingsScreen,#leaderboardScreen,#shopScreen{padding-top:9px !important;padding-bottom:9px !important}#settingsScreen{gap:9px}#settingsScreen .setting-row{min-height:49px;padding:6px 3px}#settingsScreen .version-info{margin-top:8px !important}#shopScreen{gap:8px}#shopScreen .skin-card{min-height:142px}#shopScreen .return-btn,#settingsScreen .return-btn{min-height:43px}}
`;
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
      if (isEquipped) {
        cost.textContent = '';
      } else if (isUnlocked) {
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
