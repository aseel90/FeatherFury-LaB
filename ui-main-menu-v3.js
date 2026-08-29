(() => {
  'use strict';
  if (window.__FF_MAIN_MENU_V3__) return;

  const ICON = p => `assets/ui/icons/${p}.svg?v=1`;
  const NAMES = {
    ar: ['الغابة الملعونة','قمم الصقيع','برج العاصفة','وادي البراكين'],
    en: ['Cursed Woods','Frostbite Peaks','Storm Spire','Volcanic Valley']
  };

  const icon = (name, cls) => {
    const el = document.createElement('img');
    el.src = ICON(name); el.className = `ff-local-icon ${cls}`; el.alt = '';
    el.draggable = false; el.setAttribute('aria-hidden','true');
    return el;
  };

  const locked = (g, i) => {
    if (i === 0) return false;
    if (i >= 3) return true;
    const worldUnlocked = Array.isArray(g?.worlds) && g.worlds[i]?.unlocked === true;
    return i === 1 ? !(g?.w1Completed || worldUnlocked) : !(g?.w2Completed || worldUnlocked);
  };

  const openShop = () => {
    const btn = document.getElementById('shopBtnStart');
    if (btn) return btn.click();
    const start = document.getElementById('startScreen'), shop = document.getElementById('shopScreen');
    if (!start || !shop) return;
    start.classList.remove('active'); start.classList.add('hidden');
    shop.classList.remove('hidden'); shop.classList.add('active');
    window.game?.renderShop?.();
  };

  const attachBirdAvatar = (screen, topBar) => {
    const settings = document.getElementById('settingsBtn');
    if (!settings || !topBar) return null;

    let cluster = topBar.querySelector('.ff-top-right-actions');
    if (!cluster) {
      cluster = document.createElement('div');
      cluster.className = 'ff-top-right-actions';
      settings.before(cluster);
      cluster.append(settings);
    } else if (settings.parentElement !== cluster) {
      cluster.append(settings);
    }

    let btn = cluster.querySelector('.ff-bird-avatar-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ff-bird-avatar-btn';
      btn.addEventListener('click', openShop);
      cluster.insertBefore(btn, settings);
    }

    // Reuse the game's real selected-bird preview canvas, rather than a generic icon.
    const wrap = screen.querySelector('#worldCard .preview-canvas-wrap') || screen.querySelector('.bird-preview .preview-canvas-wrap');
    if (wrap && wrap.parentElement !== btn) {
      btn.replaceChildren(wrap);
      btn.classList.add('has-live-bird');
    }

    if (!btn.firstElementChild) {
      const fallback = document.createElement('img');
      fallback.src = 'icon.png?v=20260829';
      fallback.alt = '';
      fallback.className = 'ff-bird-avatar-fallback';
      fallback.setAttribute('aria-hidden','true');
      btn.append(fallback);
    }
    return btn;
  };

  function ensure() {
    const screen = document.getElementById('startScreen');
    const main = screen?.querySelector('.start-main-content');
    const carousel = main?.querySelector('.worlds-carousel');
    const topBar = screen?.querySelector('.top-bar');
    if (!screen || !main || !carousel) return null;

    // Remove the old bottom bird button from v2 if it exists in a cached session.
    main.querySelector('.ff-secondary-menu-actions')?.remove();

    const coin = screen.querySelector('.top-bar .coin-pill');
    if (coin && !coin.dataset.ffShopTrigger) {
      coin.dataset.ffShopTrigger = '1'; coin.classList.add('ff-shop-coin');
      coin.setAttribute('role','button'); coin.tabIndex = 0; coin.querySelector('svg')?.remove();
      const count = document.getElementById('startTotalCoins');
      if (count) { count.before(icon('coin','ff-coin-icon')); count.after(icon('plus','ff-coin-plus')); }
      coin.addEventListener('click', openShop);
      coin.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openShop(); } });
    }

    const settings = document.getElementById('settingsBtn');
    if (settings && !settings.dataset.ffLocalIcon) {
      settings.dataset.ffLocalIcon = '1'; settings.replaceChildren(icon('settings','ff-settings-icon'));
    }

    const birdButton = attachBirdAvatar(screen, topBar);

    let dots = main.querySelector('.ff-world-dots');
    if (!dots) {
      dots = document.createElement('div'); dots.className = 'ff-world-dots'; dots.setAttribute('aria-hidden','true');
      for (let i=0;i<4;i++) { const d=document.createElement('span'); d.className='ff-world-dot'; dots.append(d); }
      carousel.after(dots);
    }

    if (!carousel.dataset.ffSwipe) {
      carousel.dataset.ffSwipe='1'; let x=null,y=null,id=null;
      carousel.addEventListener('pointerdown',e=>{ if(e.target.closest('button')||(e.pointerType==='mouse'&&e.button!==0)) return; id=e.pointerId;x=e.clientX;y=e.clientY; });
      carousel.addEventListener('pointerup',e=>{ if(x==null||id!==e.pointerId)return; const dx=e.clientX-x,dy=e.clientY-y; x=y=id=null; if(Math.abs(dx)<42||Math.abs(dx)<=Math.abs(dy)*1.1)return; const b=document.getElementById(dx<0?'nextWorldBtn':'prevWorldBtn'); if(b&&!b.disabled)b.click(); });
      carousel.addEventListener('pointercancel',()=>{x=y=id=null;});
    }
    return {screen,main,carousel,dots,birdButton};
  }

  const status = (lang,i,isLocked) => {
    if (!isLocked) return lang==='ar'?'جاهز للعب!':'Ready to play!';
    if (i===1) return lang==='ar'?'أكمل الغابة الملعونة أولاً':'Complete Cursed Woods first';
    if (i===2) return lang==='ar'?'أكمل قمم الصقيع أولاً':'Complete Frostbite Peaks first';
    return lang==='ar'?'قريباً في تحديث قادم':'Coming in a future update';
  };

  function apply() {
    const ui=ensure(), g=window.game; if(!ui||!g)return;
    const i=Math.max(0,Math.min(3,Number.isInteger(g.currentWorldIndex)?g.currentWorldIndex:0));
    const lang=g.lang==='ar'?'ar':'en', isLocked=locked(g,i);
    const kicker=document.querySelector('#worldCard .ff-world-kicker'), title=document.getElementById('worldTitle'), state=document.getElementById('worldStatus'), card=document.getElementById('worldCard');
    if(kicker) kicker.textContent=lang==='ar'?`العالم ${i+1}`:`WORLD ${i+1}`;
    if(title){title.textContent=NAMES[lang][i];title.dir=lang==='ar'?'rtl':'ltr';}
    if(state){state.textContent=status(lang,i,isLocked);state.dir=lang==='ar'?'rtl':'ltr';}
    card?.classList.toggle('ff-locked',isLocked);
    [...ui.dots.children].forEach((d,n)=>{d.classList.toggle('is-active',n===i);d.classList.toggle('is-locked',locked(g,n)&&n!==i);});

    const play=document.getElementById('startStoryBtn');
    if(play){play.disabled=isLocked;play.classList.toggle('ff-disabled',isLocked);play.textContent=isLocked?(i===3?(lang==='ar'?'قريباً':'COMING SOON'):(lang==='ar'?'مغلق':'LOCKED')):(lang==='ar'?'ابدأ':'PLAY');}

    const coin=ui.screen.querySelector('.ff-shop-coin'); if(coin){const t=lang==='ar'?'فتح متجر الأبطال':'Open heroes shop';coin.title=t;coin.setAttribute('aria-label',t);}
    if(ui.birdButton){const t=lang==='ar'?'اختيار الطائر':'Choose bird';ui.birdButton.title=t;ui.birdButton.setAttribute('aria-label',t);}
    document.getElementById('settingsBtn')?.setAttribute('aria-label',lang==='ar'?'الإعدادات':'Settings');
  }

  function hook(){
    const g=window.game; if(!g||typeof g.updateCarousel!=='function')return false;
    if(!g.__ffMainMenuV3Hooked){
      const original=g.updateCarousel.bind(g);
      g.updateCarousel=(...a)=>{const card=document.getElementById('worldCard');card?.classList.add('ff-world-changing');const out=original(...a);requestAnimationFrame(apply);setTimeout(()=>card?.classList.remove('ff-world-changing'),220);return out;};
      g.__ffMainMenuV3Hooked=true;
    }
    apply(); return true;
  }

  let tries=0; const timer=setInterval(()=>{tries++;ensure();if(hook()||tries>160)clearInterval(timer);},50);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply();});
  window.__FF_MAIN_MENU_V3__={apply,openShop};
})();