(() => {
  'use strict';

  if (window.__FF_CHARACTER_ABILITY_UI_V1__) return;

  const COPY = {
    classic: {
      icon: '●', accent: '#60a5fa',
      en: ['Balanced', 'Standard flight with no gameplay modifier.'],
      ar: ['متوازن', 'طيران قياسي بدون ميزة إضافية.']
    },
    pigeon: {
      icon: '◎', accent: '#cbd5e1',
      en: ['Precision', 'Perfect Pass window is 20% wider.'],
      ar: ['الدقة', 'منطقة Perfect Pass أوسع بنسبة 20%.']
    },
    falcon: {
      icon: '◆', accent: '#f59e0b',
      en: ['Predator Fever', 'Fever lasts 25% longer.'],
      ar: ['حمّى المفترس', 'مدة الحمى أطول بنسبة 25%.']
    },
    phoenix: {
      icon: '▲', accent: '#fb923c',
      en: ['Ember Charge', 'Fever charge gains are 20% stronger.'],
      ar: ['شحنة الجمر', 'تعبئة الحمى أسرع بنسبة 20%.']
    },
    cyber: {
      icon: '⬡', accent: '#22d3ee',
      en: ['Energy Shield', 'Blocks the first fatal hit in each run.'],
      ar: ['درع الطاقة', 'يحميك من أول ضربة قاتلة في كل جولة.']
    },
    ghost: {
      icon: '✦', accent: '#c4b5fd',
      en: ['Phase', 'Phases through the first fatal collision in each run.'],
      ar: ['العبور', 'يتجاوز أول اصطدام قاتل في كل جولة.']
    },
    king: {
      icon: '♛', accent: '#fbbf24',
      en: ['Royal Fortune', 'Medium coin magnet and +1 bonus coin every 3 collected coins.'],
      ar: ['الحظ الملكي', 'جذب متوسط للعملات + عملة إضافية بعد كل 3 عملات.']
    },
    eagle: {
      icon: '◇', accent: '#a3e635',
      en: ['Stability', 'Special gravity and wind effects are 50% weaker.'],
      ar: ['الثبات', 'الرياح والجاذبية الخاصة تؤثر عليه بنسبة 50% أقل.']
    }
  };

  const CSS = `
    .skin-card.ff-details-ready { cursor:pointer; }
    .skin-card.ff-details-ready:active { transform:scale(.985); }
    #ffAbilityDetails {
      position:absolute; inset:0; z-index:40; display:none;
      align-items:center; justify-content:center; padding:22px;
      background:rgba(2,6,23,.76); backdrop-filter:blur(3px);
      pointer-events:auto;
    }
    #ffAbilityDetails.ff-open { display:flex; }
    .ff-ability-panel {
      width:min(330px,92%); background:linear-gradient(180deg,#172033,#101827);
      border:2px solid var(--ff-accent,#60a5fa); border-radius:20px;
      padding:18px 18px 16px; box-shadow:0 18px 50px rgba(0,0,0,.45);
      color:#f8fafc; text-align:center; direction:inherit;
    }
    .ff-ability-icon {
      width:50px; height:50px; margin:0 auto 8px; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      border:2px solid var(--ff-accent); color:var(--ff-accent); font-size:25px;
      background:rgba(15,23,42,.85);
    }
    .ff-hero-name { font-size:1.05rem; font-weight:900; color:#fff; margin-bottom:3px; }
    .ff-ability-name { font-size:1rem; font-weight:900; color:var(--ff-accent); margin-bottom:8px; }
    .ff-ability-desc { color:#cbd5e1; font-size:.9rem; line-height:1.55; }
    .ff-details-hint { margin-top:12px; color:#64748b; font-size:.72rem; }
    .ff-ability-hud {
      align-self:center; min-width:118px; max-width:90%; padding:3px 10px;
      border-radius:999px; border:1px solid var(--ff-hud-accent,#64748b);
      background:rgba(2,6,23,.62); color:#e2e8f0; text-align:center;
      font-family:'Tajawal',sans-serif; font-size:.69rem; font-weight:800;
      letter-spacing:.02em; line-height:1.25; text-shadow:0 1px 2px #000;
    }
    .ff-ability-hud.ff-hidden { display:none; }
    @media (max-width:380px) {
      .ff-ability-panel { padding:15px; }
      .ff-ability-desc { font-size:.84rem; }
      .ff-ability-hud { font-size:.64rem; }
    }
  `;

  function addStyle() {
    if (document.getElementById('ffCharacterAbilityUiStyle')) return;
    const style = document.createElement('style');
    style.id = 'ffCharacterAbilityUiStyle';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function language(game) {
    return game && game.lang === 'en' ? 'en' : 'ar';
  }

  function skinName(key, game) {
    try {
      const skin = SKINS[key];
      const lang = language(game);
      return skin?.[`name_${lang}`] || skin?.name_en || key;
    } catch (_) { return key; }
  }

  function ensureDetails(game) {
    const shop = document.getElementById('shopScreen');
    if (!shop) return null;
    let modal = document.getElementById('ffAbilityDetails');
    if (modal && modal.parentElement === shop) return modal;
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'ffAbilityDetails';
    modal.innerHTML = `
      <div class="ff-ability-panel" role="dialog" aria-modal="true">
        <div class="ff-ability-icon" id="ffAbilityIcon"></div>
        <div class="ff-hero-name" id="ffAbilityHero"></div>
        <div class="ff-ability-name" id="ffAbilityName"></div>
        <div class="ff-ability-desc" id="ffAbilityDesc"></div>
        <div class="ff-details-hint" id="ffAbilityHint"></div>
      </div>`;
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.classList.remove('ff-open');
    });
    shop.appendChild(modal);
    return modal;
  }

  function openDetails(key, game) {
    const data = COPY[key] || COPY.classic;
    const lang = language(game);
    const modal = ensureDetails(game);
    if (!modal) return;
    modal.style.setProperty('--ff-accent', data.accent);
    modal.querySelector('#ffAbilityIcon').textContent = data.icon;
    modal.querySelector('#ffAbilityHero').textContent = skinName(key, game);
    modal.querySelector('#ffAbilityName').textContent = data[lang][0];
    modal.querySelector('#ffAbilityDesc').textContent = data[lang][1];
    modal.querySelector('#ffAbilityHint').textContent = lang === 'ar' ? 'اضغط خارج النافذة للإغلاق' : 'Tap outside to close';
    modal.classList.add('ff-open');
  }

  function decorateCards(game) {
    const grid = document.getElementById('skinsGrid');
    if (!grid) return;
    let keys;
    try { keys = Object.keys(SKINS); } catch (_) { return; }
    const cards = [...grid.querySelectorAll('.skin-card')];
    cards.forEach((card, i) => {
      const key = keys[i];
      if (!key) return;
      card.dataset.skinKey = key;
      card.classList.add('ff-details-ready');
      if (!card.__ffDetailsBound) {
        card.addEventListener('click', e => {
          if (e.target.closest('button')) return;
          openDetails(card.dataset.skinKey, game);
        });
        card.__ffDetailsBound = true;
      }
      card.querySelectorAll('button').forEach(btn => {
        if (!btn.__ffStopDetails) {
          btn.addEventListener('click', e => e.stopPropagation());
          btn.__ffStopDetails = true;
        }
      });
    });
  }

  function installShopDetails(game) {
    if (!game || typeof game.renderShop !== 'function') return;
    if (!game.__ffAbilityShopWrapped) {
      const baseRenderShop = game.renderShop.bind(game);
      game.renderShop = function(...args) {
        const result = baseRenderShop(...args);
        decorateCards(this);
        return result;
      };
      game.__ffAbilityShopWrapped = true;
    }
    ensureDetails(game);
    decorateCards(game);

    const grid = document.getElementById('skinsGrid');
    if (grid && !grid.__ffAbilityObserver) {
      const observer = new MutationObserver(() => decorateCards(game));
      observer.observe(grid, { childList:true });
      grid.__ffAbilityObserver = observer;
    }
  }

  function ensureHud() {
    const hud = document.getElementById('gameHud');
    if (!hud) return null;
    let badge = document.getElementById('ffAbilityHud');
    if (badge && badge.parentElement === hud) return badge;
    if (badge) badge.remove();
    badge = document.createElement('div');
    badge.id = 'ffAbilityHud';
    badge.className = 'ff-ability-hud ff-hidden';
    const fever = hud.querySelector('.fever-bar-container');
    if (fever) fever.insertAdjacentElement('afterend', badge);
    else hud.appendChild(badge);
    return badge;
  }

  function hudStatus(game) {
    const key = game.activeSkin || 'classic';
    const lang = language(game);
    switch (key) {
      case 'classic': return null;
      case 'pigeon': return lang === 'ar' ? 'الدقة +20%' : 'PRECISION +20%';
      case 'falcon': return lang === 'ar' ? 'حمّى المفترس +25%' : 'PREDATOR FEVER +25%';
      case 'phoenix': return lang === 'ar' ? 'شحنة الجمر +20%' : 'EMBER CHARGE +20%';
      case 'cyber':
        return game.cyberShieldUsed
          ? (lang === 'ar' ? 'الدرع استُخدم' : 'SHIELD USED')
          : (lang === 'ar' ? 'الدرع جاهز' : 'SHIELD READY');
      case 'ghost':
        return game.ghostPhaseUsed
          ? (lang === 'ar' ? 'العبور استُخدم' : 'PHASE USED')
          : (lang === 'ar' ? 'العبور جاهز' : 'PHASE READY');
      case 'king': {
        const n = Math.max(0, Number(game.kingCoinsCollected) || 0) % 3;
        return lang === 'ar' ? `الحظ الملكي ${n}/3` : `ROYAL FORTUNE ${n}/3`;
      }
      case 'eagle': return lang === 'ar' ? 'الثبات 50%' : 'STABILITY 50%';
      default: return null;
    }
  }

  function updateHud(game) {
    const badge = ensureHud();
    if (!badge) return;
    const key = game.activeSkin || 'classic';
    const data = COPY[key] || COPY.classic;
    const text = hudStatus(game);
    const hud = document.getElementById('gameHud');
    const visible = text && hud && !hud.classList.contains('hidden');
    badge.classList.toggle('ff-hidden', !visible);
    if (!visible) return;
    badge.textContent = text;
    badge.style.setProperty('--ff-hud-accent', data.accent);
    badge.style.opacity = ((key === 'cyber' && game.cyberShieldUsed) || (key === 'ghost' && game.ghostPhaseUsed)) ? '.58' : '1';
  }

  function install() {
    if (!window.game) return false;
    addStyle();
    const game = window.game;
    installShopDetails(game);
    ensureHud();

    let last = 0;
    const tick = now => {
      if (now - last > 120) {
        last = now;
        updateHud(game);
        if (!document.getElementById('ffAbilityDetails')) ensureDetails(game);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') document.getElementById('ffAbilityDetails')?.classList.remove('ff-open');
    });

    window.__FF_CHARACTER_ABILITY_UI_V1__ = {
      version: 'character-ability-ui-v1',
      openDetails: key => openDetails(key, game)
    };
    return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 160) clearInterval(timer);
  }, 50);
})();