(() => {
  'use strict';

  function install() {
    const game = window.game;
    if (!game || game.__pauseHudPolishV2Installed) return !!game;

    const style = document.createElement('style');
    style.id = 'ff-pause-hud-polish-v2-style';
    style.textContent = `
      #gameHud .hud-top{position:relative!important;display:block!important;width:100%!important;min-height:62px!important}
      #gameHud .hud-coin-badge{position:absolute!important;left:0!important;top:4px!important;margin:0!important;z-index:4!important}
      #gameHud .score-container{position:absolute!important;left:50%!important;right:auto!important;top:0!important;transform:translateX(-50%)!important;margin:0!important;z-index:4!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;pointer-events:none!important}
      #gameHud .score-badge,#gameHud .stage-badge{text-align:center!important;margin-left:auto!important;margin-right:auto!important}

      #ffPauseOverlay{align-items:flex-start!important;justify-content:center!important;background:#09131f!important;padding:max(28px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(24px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left))!important;overflow:auto!important}
      #ffPausePanel{width:min(94vw,780px)!important;gap:20px!important;padding-top:4px!important}
      #ffPauseTitle{margin:0!important;color:#f1c40f!important;font-family:'Tajawal',sans-serif!important;font-size:clamp(1.7rem,6vw,2.35rem)!important;font-weight:900!important;line-height:1.1!important;text-shadow:0 2px 0 #5d4a00,0 5px 14px rgba(241,196,15,.16)!important}
      #ffPauseCard{width:100%!important;display:flex!important;flex-direction:column!important;gap:0!important;background:rgba(0,0,0,.5)!important;padding:22px 26px!important;border-radius:28px!important;border:3px solid #334155!important;box-shadow:0 16px 36px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.035)!important}
      #ffPauseCard .setting-row{display:flex!important;justify-content:space-between!important;align-items:center!important;gap:18px!important;min-height:72px!important;padding:6px 8px!important;color:#e2e8f0!important;font-family:'Tajawal',sans-serif!important;font-size:clamp(1rem,3vw,1.18rem)!important;font-weight:800!important;text-align:start!important}
      #ffPauseCard .setting-row + .setting-row{border-top:1px solid rgba(71,85,105,.38)!important}
      #ffPauseCard .ffPauseDangerRow{margin-top:8px!important;padding-top:18px!important;border-top:2px solid #334155!important}
      #ffPauseCard .ffPauseDangerRow>span{color:#ff6b72!important}
      .ffPausePill{flex:0 0 auto!important;min-width:128px!important;min-height:50px!important;padding:9px 22px!important;border:2px solid #1f618d!important;border-radius:28px!important;background:linear-gradient(180deg,#3ca4df 0%,#2980b9 100%)!important;box-shadow:0 6px 0 #175a83,0 8px 18px rgba(0,0,0,.25),inset 0 2px 0 rgba(255,255,255,.18)!important;color:#fff!important;font-family:'Tajawal',sans-serif!important;font-size:1rem!important;font-weight:900!important;line-height:1!important;cursor:pointer!important;text-shadow:0 1px 2px rgba(0,0,0,.35)!important}
      .ffPausePill:active{transform:translateY(4px)!important;box-shadow:0 2px 0 #175a83,0 4px 10px rgba(0,0,0,.22)!important}
      .ffPausePill:focus-visible{outline:3px solid #facc15!important;outline-offset:3px!important}
      .ffPausePill.ffPauseDanger{background:linear-gradient(180deg,#e0564a 0%,#c0392b 100%)!important;border-color:#9d3328!important;box-shadow:0 6px 0 #7e291f,0 8px 18px rgba(0,0,0,.25),0 0 20px rgba(22,163,74,.18)!important}
      #ffPauseSoundSlot{display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;min-width:128px!important;min-height:50px!important;padding:7px 14px!important;border:2px solid #1f618d!important;border-radius:28px!important;background:linear-gradient(180deg,#3ca4df 0%,#2980b9 100%)!important;box-shadow:0 6px 0 #175a83,0 8px 18px rgba(0,0,0,.25),inset 0 2px 0 rgba(255,255,255,.18)!important;color:#fff!important;cursor:pointer!important;user-select:none!important}
      #ffPauseSoundSlot:active{transform:translateY(4px)!important;box-shadow:0 2px 0 #175a83,0 4px 10px rgba(0,0,0,.22)!important}
      #ffPauseSoundSlot #soundToggleBtn{position:static!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;width:30px!important;height:30px!important;min-width:30px!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:#fff!important}
      #ffPauseSoundState{min-width:62px!important;text-align:center!important;color:#fff!important;font-family:'Tajawal',sans-serif!important;font-size:1rem!important;font-weight:900!important;line-height:1!important}
      @media(max-width:520px){
        #ffPausePanel{width:min(94vw,430px)!important;gap:16px!important}
        #ffPauseCard{padding:16px 14px!important;border-radius:22px!important}
        #ffPauseCard .setting-row{min-height:64px!important;padding:5px 4px!important;gap:12px!important}
        .ffPausePill,#ffPauseSoundSlot{min-width:112px!important;min-height:47px!important;padding-left:15px!important;padding-right:15px!important}
      }
      @media(max-width:350px){
        #ffPauseCard .setting-row{font-size:.9rem!important}
        .ffPausePill,#ffPauseSoundSlot{min-width:100px!important;font-size:.9rem!important}
      }
    `;
    document.head.appendChild(style);

    const overlay = document.getElementById('ffPauseOverlay');
    const panel = document.getElementById('ffPausePanel');
    const soundToggle = document.getElementById('soundToggleBtn');
    if (!overlay || !panel) return false;

    panel.innerHTML = `
      <h2 id="ffPauseTitle">إيقاف مؤقت</h2>
      <div id="ffPauseCard">
        <div class="setting-row">
          <span id="ffPauseSoundLabel">المؤثرات الصوتية</span>
          <div id="ffPauseSoundSlot" role="button" tabindex="0" aria-label="Toggle sound">
            <span id="ffPauseSoundState">مفعل</span>
          </div>
        </div>
        <div class="setting-row">
          <span id="ffPauseResumeLabel">متابعة اللعب</span>
          <button type="button" class="ffPausePill" data-action="resume">متابعة</button>
        </div>
        <div class="setting-row">
          <span id="ffPauseRestartLabel">إعادة المحاولة</span>
          <button type="button" class="ffPausePill" data-action="restart">إعادة</button>
        </div>
        <div class="setting-row">
          <span id="ffPauseSettingsLabel">إعدادات اللعبة</span>
          <button type="button" class="ffPausePill" data-action="settings">فتح</button>
        </div>
        <div class="setting-row ffPauseDangerRow">
          <span id="ffPauseMenuLabel">العودة للقائمة</span>
          <button type="button" class="ffPausePill ffPauseDanger" data-action="menu">القائمة</button>
        </div>
      </div>`;

    const slot = panel.querySelector('#ffPauseSoundSlot');
    const state = panel.querySelector('#ffPauseSoundState');
    if (soundToggle && slot) slot.insertBefore(soundToggle, state || null);

    const updateSound = () => {
      const ar = game.lang === 'ar';
      const off = !!game.sound?.muted || game.sound?.sfxEnabled === false;
      if (state) state.textContent = ar ? (off ? 'مكتوم' : 'مفعل') : (off ? 'Muted' : 'Enabled');
      if (slot) slot.setAttribute('aria-pressed', off ? 'false' : 'true');
    };

    const syncLanguage = () => {
      const ar = game.lang === 'ar';
      panel.dir = ar ? 'rtl' : 'ltr';
      const map = ar ? {
        title:'إيقاف مؤقت', sound:'المؤثرات الصوتية', resumeLabel:'متابعة اللعب', resume:'متابعة',
        restartLabel:'إعادة المحاولة', restart:'إعادة', settingsLabel:'إعدادات اللعبة', settings:'فتح',
        menuLabel:'العودة للقائمة', menu:'القائمة'
      } : {
        title:'Paused', sound:'Sound Effects', resumeLabel:'Continue Game', resume:'Resume',
        restartLabel:'Restart Run', restart:'Restart', settingsLabel:'Game Settings', settings:'Open',
        menuLabel:'Return to Menu', menu:'Menu'
      };
      const ids = {
        ffPauseTitle:map.title, ffPauseSoundLabel:map.sound, ffPauseResumeLabel:map.resumeLabel,
        ffPauseRestartLabel:map.restartLabel, ffPauseSettingsLabel:map.settingsLabel, ffPauseMenuLabel:map.menuLabel
      };
      Object.entries(ids).forEach(([id,value]) => { const el = document.getElementById(id); if (el) el.textContent = value; });
      ['resume','restart','settings','menu'].forEach(key => { const b = panel.querySelector(`[data-action="${key}"]`); if (b) b.textContent = map[key]; });
      updateSound();
    };

    if (slot) {
      slot.addEventListener('click', e => {
        if (e.target !== soundToggle && !e.target.closest?.('#soundToggleBtn')) soundToggle?.click();
        setTimeout(updateSound, 0);
      });
      slot.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          soundToggle?.click();
          setTimeout(updateSound, 0);
        }
      });
    }
    if (soundToggle) soundToggle.addEventListener('click', () => setTimeout(updateSound, 0));

    const observer = new MutationObserver(() => {
      if (overlay.classList.contains('show')) syncLanguage();
    });
    observer.observe(overlay, { attributes:true, attributeFilter:['class'] });
    syncLanguage();

    game.__pauseHudPolishV2Installed = true;
    console.log('[FF-LAB] pause-hud-polish-v2-installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 100) clearInterval(timer);
  }, 80);
  setTimeout(install, 1000);
  setTimeout(install, 1800);
})();