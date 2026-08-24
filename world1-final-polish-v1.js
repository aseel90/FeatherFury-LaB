(() => {
  'use strict';

  function install() {
    const game = window.game;
    const panel = document.getElementById('ffPausePanel');
    const overlay = document.getElementById('ffPauseOverlay');
    if (!game || !panel || !overlay) return false;
    if (game.__world1FinalPolishV1Installed) return true;

    const TEST_REVIVE_COST = 1;
    const forceReviveCost = () => {
      try { if (window.CONFIG) window.CONFIG.REVIVE_COST = TEST_REVIVE_COST; } catch (_) {}
    };

    const style = document.createElement('style');
    style.id = 'ff-world1-final-polish-v1-style';
    style.textContent = `
      #ffPauseOverlay{align-items:center!important;justify-content:center!important;padding:max(18px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) max(18px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left))!important}
      #ffPausePanel{width:min(90vw,390px)!important;gap:12px!important;padding:0!important}
      #ffPauseTitle{font-size:clamp(1.45rem,5vw,1.8rem)!important;margin:0 42px 2px!important}
      #ffPauseClose{position:absolute;top:-2px;right:0;width:44px;height:44px;border:2px solid #475569;border-radius:14px;background:linear-gradient(180deg,#475569,#334155);box-shadow:0 4px 0 #1e293b;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:3;touch-action:manipulation}
      #ffPauseClose:active{transform:translateY(3px);box-shadow:0 1px 0 #1e293b}
      #ffPauseClose:focus-visible{outline:3px solid #facc15;outline-offset:3px}
      #ffPauseCard{padding:15px!important;border-radius:20px!important;border-width:2px!important;gap:10px!important}
      #ffPauseCard .setting-row{min-height:48px!important;padding:0!important;font-size:.98rem!important}
      #ffPauseCard .setting-row+.setting-row{border-top:0!important}
      #ffPauseSoundSlot{min-width:108px!important;min-height:46px!important;padding:6px 12px!important;border-radius:23px!important}
      .ffPausePill{min-width:108px!important;min-height:46px!important;padding:8px 16px!important;border-radius:23px!important;font-size:.94rem!important}
      #ffPauseCard .ffPauseDangerRow{margin-top:4px!important;padding-top:10px!important;border-top:1px solid #334155!important}
      #ffPauseCard .ffPauseDangerRow>span{color:#94a3b8!important;font-size:.9rem!important}
      .ffPausePill.ffPauseDanger{background:linear-gradient(180deg,#334155,#263445)!important;border-color:#1e293b!important;box-shadow:0 4px 0 #111827,0 6px 12px rgba(0,0,0,.22)!important;color:#cbd5e1!important}
      #ffPerfHud{max-width:min(45vw,190px);font-size:10px!important;line-height:1.35!important}
      @media(max-width:380px){#ffPausePanel{width:min(92vw,345px)!important}#ffPauseCard{padding:13px!important}.ffPausePill,#ffPauseSoundSlot{min-width:100px!important;min-height:44px!important}#ffPauseCard .setting-row{font-size:.9rem!important}}
      @media(max-height:560px) and (orientation:landscape){#ffPauseOverlay{align-items:flex-start!important}#ffPausePanel{width:min(74vw,430px)!important}#ffPauseTitle{font-size:1.35rem!important}#ffPauseCard{padding:11px 14px!important}#ffPauseCard .setting-row{min-height:42px!important}.ffPausePill,#ffPauseSoundSlot{min-height:40px!important}}
    `;
    document.head.appendChild(style);

    const close = document.createElement('button');
    close.id = 'ffPauseClose';
    close.type = 'button';
    close.setAttribute('aria-label', game.lang === 'ar' ? 'إغلاق قائمة التوقف' : 'Close pause menu');
    close.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/></svg>';
    panel.prepend(close);
    close.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      game.resumeGame?.();
    });

    const menuBtn = panel.querySelector('[data-action="menu"]');
    if (menuBtn) {
      menuBtn.addEventListener('click', e => {
        if (menuBtn.dataset.ffConfirming === '1') return;
        e.preventDefault();
        e.stopImmediatePropagation();
        menuBtn.dataset.ffConfirming = '1';
        const original = menuBtn.textContent;
        menuBtn.textContent = game.lang === 'ar' ? 'اضغط مرة أخرى للتأكيد' : 'Tap again to confirm';
        setTimeout(() => {
          if (menuBtn.dataset.ffConfirming === '1') {
            menuBtn.dataset.ffConfirming = '0';
            menuBtn.textContent = original;
          }
        }, 2200);
      }, true);
    }

    forceReviveCost();
    const originalUpdateCoins = typeof game.updateCoinDisplays === 'function' ? game.updateCoinDisplays.bind(game) : null;
    if (originalUpdateCoins) {
      game.updateCoinDisplays = function() {
        forceReviveCost();
        const result = originalUpdateCoins();
        const price = document.querySelector('#reviveBtn .revive-price');
        if (price) {
          const svg = price.querySelector('svg');
          price.innerHTML = '';
          if (svg) price.appendChild(svg);
          price.append(document.createTextNode(' 1'));
        }
        return result;
      };
    }

    const originalGameOver = typeof game.gameOver === 'function' ? game.gameOver.bind(game) : null;
    if (originalGameOver) {
      game.gameOver = function(...args) {
        forceReviveCost();
        const result = originalGameOver(...args);
        try { this.updateCoinDisplays?.(); } catch (_) {}
        return result;
      };
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && ['PLAYING','BOSS_WARNING','BOSS_INTRO'].includes(game.state) && !game.__ffPaused) {
        game.pauseGame?.();
      }
    });

    const syncCloseLabel = () => close.setAttribute('aria-label', game.lang === 'ar' ? 'إغلاق قائمة التوقف' : 'Close pause menu');
    setInterval(syncCloseLabel, 700);

    game.__world1FinalPolishV1Installed = true;
    console.log('[FF-LAB] world1-final-polish-v1-installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 100) clearInterval(timer);
  }, 80);
  setTimeout(install, 1200);
})();