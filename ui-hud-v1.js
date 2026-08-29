(() => {
  'use strict';
  if (window.__FF_UI_HUD_V1__) return;

  const ICONS = {
    coin: 'assets/ui/icons/coin.svg',
    fever: 'assets/ui/icons/fever.svg',
    pause: 'assets/ui/icons/pause.svg',
    boss: 'assets/ui/icons/boss.svg'
  };

  const bossCopy = {
    ar: ['ملك الغربان', 'إمبراطور الجليد', 'سيد العاصفة'],
    en: ['Crow King', 'Ice Emperor', 'Lord Voltbat']
  };

  function lang(game) { return game?.lang === 'en' ? 'en' : 'ar'; }

  function addImg(parent, cls, src, before) {
    if (!parent || parent.querySelector(`.${cls}`)) return;
    const img = document.createElement('img');
    img.className = cls; img.src = src; img.alt = ''; img.setAttribute('aria-hidden', 'true');
    if (before) parent.insertBefore(img, parent.firstChild); else parent.appendChild(img);
  }

  function ensureHud(game) {
    const hud = document.getElementById('gameHud');
    if (!hud) return null;
    hud.classList.add('ff-hud-v1');

    const coin = hud.querySelector('.hud-coin-badge');
    addImg(coin, 'ff-hud-coin-icon', ICONS.coin, true);

    const feverLabel = hud.querySelector('.fever-label');
    addImg(feverLabel, 'ff-hud-fever-icon', ICONS.fever, true);

    const pause = document.getElementById('ffPauseBtn');
    if (pause) pause.classList.add('ff-hud-pause-v1');
    if (pause && !pause.querySelector('img')) pause.innerHTML = `<img src="${ICONS.pause}" alt="" aria-hidden="true">`;

    let boss = document.getElementById('ffBossHud');
    if (!boss) {
      boss = document.createElement('div');
      boss.id = 'ffBossHud';
      boss.className = 'ff-hidden';
      boss.innerHTML = `<div class="ff-boss-head"><div class="ff-boss-title"><img src="${ICONS.boss}" alt="" aria-hidden="true"><span id="ffBossTitle"></span></div><span class="ff-boss-hp" id="ffBossHp"></span></div><div class="ff-boss-track"><div class="ff-boss-fill" id="ffBossFill"></div></div>`;
      const ability = document.getElementById('ffAbilityHud');
      if (ability && ability.parentElement === hud) ability.insertAdjacentElement('afterend', boss);
      else hud.appendChild(boss);
    }
    return hud;
  }

  function maxBossHp(game, boss) {
    const direct = Number(boss?.maxHp ?? boss?.maxHP ?? boss?.hpMax ?? boss?.maxHealth);
    if (Number.isFinite(direct) && direct > 0) return direct;
    try {
      const w = Number(game?.activeWorld) || 0;
      if (w === 1) return Math.max(1, Number(CONFIG.W2_BOSS_HP) || 8);
      if (w === 2) return Math.max(1, Number(CONFIG.W3_BOSS_HP) || 9);
      return Math.max(1, Number(CONFIG.BOSS_HP) || 5);
    } catch (_) { return [5,8,9][Number(game?.activeWorld) || 0] || 5; }
  }

  function updateLabels(game) {
    const l = lang(game);
    const fever = document.querySelector('#gameHud .fever-label');
    if (fever) {
      const img = fever.querySelector('.ff-hud-fever-icon');
      [...fever.childNodes].forEach(n => { if (n !== img) n.remove(); });
      fever.append(document.createTextNode(l === 'ar' ? 'الحمّى' : 'FEVER'));
    }
    const pause = document.getElementById('ffPauseBtn');
    if (pause) pause.setAttribute('aria-label', l === 'ar' ? 'إيقاف مؤقت' : 'Pause');
  }

  function updateBoss(game) {
    const el = document.getElementById('ffBossHud');
    if (!el) return;
    const b = game?.boss;
    const hp = Number(b?.hp);
    const active = !!b && !!b.active && Number.isFinite(hp) && hp > 0 && !['EXPLODING','DEAD'].includes(String(b.state || '').toUpperCase());
    if (!active) { el.classList.add('ff-hidden'); return; }

    const max = maxBossHp(game, b);
    const pct = Math.max(0, Math.min(100, hp / max * 100));
    const l = lang(game);
    const world = Math.max(0, Math.min(2, Number(game?.activeWorld) || 0));
    const title = document.getElementById('ffBossTitle');
    const hpText = document.getElementById('ffBossHp');
    const fill = document.getElementById('ffBossFill');
    if (title) title.textContent = bossCopy[l][world];
    if (hpText) hpText.textContent = `${Math.max(0, Math.ceil(hp))}/${max}`;
    if (fill) fill.style.width = `${pct}%`;
    el.classList.remove('ff-hidden');
  }

  function install() {
    const game = window.game;
    if (!game) return false;
    const hud = ensureHud(game);
    if (!hud) return false;
    updateLabels(game);
    let lastLang = game.lang;
    let last = 0;
    const tick = now => {
      if (now - last > 100) {
        last = now;
        ensureHud(game);
        updateBoss(game);
        if (game.lang !== lastLang) { lastLang = game.lang; updateLabels(game); }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    window.__FF_UI_HUD_V1__ = { version:'ui-hud-v1' };
    console.log('[FF-LAB] ui-hud-v1-installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => { tries += 1; if (install() || tries > 160) clearInterval(timer); }, 75);
  setTimeout(install, 1200);
})();
