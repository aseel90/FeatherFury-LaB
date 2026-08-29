(() => {
  'use strict';

  function install() {
    const game = window.game;
    const cfg = window.CONFIG;
    const canvas = document.getElementById('gameCanvas');
    const hud = document.getElementById('gameHud');
    if (!game || !cfg || !canvas || !hud) return false;
    if (game.__coreGameplayUxV1Installed) return true;

    const activePauseStates = new Set(['STORY', 'PLAYING', 'BOSS_WARNING', 'BOSS_INTRO']);
    const style = document.createElement('style');
    style.id = 'ff-core-gameplay-ux-v1-style';
    style.textContent = `
      #ffPauseBtn{position:fixed;top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));z-index:12000;width:48px;height:48px;border:2px solid #4b5a70;border-radius:15px;background:linear-gradient(180deg,#3e4b62 0%,#2b3548 100%);display:none;align-items:center;justify-content:center;color:#fff;box-shadow:0 5px 0 #182231,0 10px 20px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.16);touch-action:manipulation}
      #ffPauseBtn.show{display:flex} #ffPauseBtn:active{transform:translateY(3px);box-shadow:0 2px 0 #182231,0 6px 12px rgba(0,0,0,.24)} #ffPauseBtn:focus-visible{outline:3px solid #facc15;outline-offset:3px}
      #ffPauseOverlay{position:fixed;inset:0;z-index:13000;background:#09131f;display:none;align-items:center;justify-content:center;padding:max(22px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(22px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));overflow:auto}
      #ffPauseOverlay::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 0%,rgba(251,191,36,.08),transparent 31%),linear-gradient(180deg,#0c1825 0%,#09131f 48%,#07101a 100%)}
      #ffPauseOverlay.show{display:flex}
      #ffPausePanel{position:relative;z-index:1;width:min(94vw,760px);display:flex;flex-direction:column;gap:18px}
      #ffPauseTitle{margin:0;text-align:center;color:#f1c40f;font-family:'Tajawal',sans-serif;font-size:clamp(1.7rem,6vw,2.4rem);font-weight:900;text-shadow:0 2px 0 #5d4a00,0 5px 14px rgba(241,196,15,.16)}
      #ffPauseCard{width:100%;display:flex;flex-direction:column;background:rgba(0,0,0,.5);padding:20px 24px;border-radius:27px;border:3px solid #334155;box-shadow:0 16px 36px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.035);box-sizing:border-box}
      #ffPauseCard .setting-row{display:flex;justify-content:space-between;align-items:center;gap:18px;min-height:68px;padding:7px 8px;color:#e2e8f0;font-family:'Tajawal',sans-serif;font-size:clamp(1rem,3vw,1.18rem);font-weight:800}
      #ffPauseCard .setting-row+.setting-row{border-top:1px solid rgba(71,85,105,.38)}
      #ffPauseCard .ffPauseDangerRow{margin-top:8px;padding-top:16px;border-top:2px solid #334155} #ffPauseCard .ffPauseDangerRow>span{color:#ff6b72}
      .ffPausePill{flex:0 0 auto;min-width:128px;min-height:50px;padding:9px 22px;border:2px solid #1f618d;border-radius:28px;background:linear-gradient(180deg,#3ca4df,#2980b9);box-shadow:0 6px 0 #175a83,0 8px 18px rgba(0,0,0,.25),inset 0 2px 0 rgba(255,255,255,.18);color:#fff;font-family:'Tajawal',sans-serif;font-size:1rem;font-weight:900;line-height:1;text-shadow:0 1px 2px rgba(0,0,0,.35)}
      .ffPausePill:active{transform:translateY(4px);box-shadow:0 2px 0 #175a83,0 4px 10px rgba(0,0,0,.22)} .ffPausePill:focus-visible{outline:3px solid #facc15;outline-offset:3px}
      .ffPausePill.ffPauseDanger{background:linear-gradient(180deg,#e0564a,#c0392b);border-color:#9d3328;box-shadow:0 6px 0 #7e291f,0 8px 18px rgba(0,0,0,.25)}
      #ffPauseSoundSlot{display:flex;align-items:center;justify-content:center;gap:8px;min-width:128px;min-height:50px;padding:7px 14px;border:2px solid #1f618d;border-radius:28px;background:linear-gradient(180deg,#3ca4df,#2980b9);box-shadow:0 6px 0 #175a83,0 8px 18px rgba(0,0,0,.25),inset 0 2px 0 rgba(255,255,255,.18);color:#fff;cursor:pointer;user-select:none}
      #ffPauseSoundSlot #soundToggleBtn{position:static!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;width:30px!important;height:30px!important;min-width:30px!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:#fff!important}
      #ffPauseSoundState{min-width:62px;text-align:center;color:#fff;font-family:'Tajawal',sans-serif;font-size:1rem;font-weight:900}
      #ffCountdown{position:fixed;inset:0;z-index:13500;display:none;align-items:center;justify-content:center;pointer-events:none;background:rgba(5,12,22,.12);backdrop-filter:blur(1px)} #ffCountdown.show{display:flex}
      #ffCountdownValue{font-family:'Press Start 2P',monospace;font-size:clamp(4rem,24vw,8.5rem);line-height:1;color:#fff;text-shadow:0 5px 0 rgba(0,0,0,.5),0 0 35px rgba(56,189,248,.35);animation:ffCountPop .78s ease both}
      @keyframes ffCountPop{0%{transform:scale(.5);opacity:0}20%{transform:scale(1.12);opacity:1}70%{transform:scale(1);opacity:1}100%{transform:scale(.9);opacity:.15}}
      #ffBossIntroCard{position:fixed;z-index:11800;top:max(84px,calc(env(safe-area-inset-top) + 66px));left:50%;transform:translate(-50%,-10px);display:none;flex-direction:column;align-items:center;gap:5px;min-width:min(78vw,330px);padding:12px 20px;border:2px solid #7f1d1d;border-radius:18px;background:linear-gradient(180deg,rgba(69,10,10,.94),rgba(23,8,14,.94));color:#fff;box-shadow:0 12px 28px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.08);pointer-events:none;text-align:center}
      #ffBossIntroCard.show{display:flex;animation:ffBossCardIn .3s ease-out both} #ffBossIntroTitle{color:#fecaca;font-family:'Tajawal',sans-serif;font-size:clamp(1rem,4vw,1.25rem);font-weight:900} #ffBossIntroHp{color:#fff;font-family:'Press Start 2P',monospace;font-size:.62rem;opacity:.8}
      @keyframes ffBossCardIn{from{opacity:0;transform:translate(-50%,-18px) scale(.96)}to{opacity:1;transform:translate(-50%,0) scale(1)}}
      #ffBossCharge{position:fixed;z-index:11700;top:max(138px,calc(env(safe-area-inset-top) + 122px));left:50%;transform:translateX(-50%);width:min(70vw,300px);height:7px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.16);display:none;pointer-events:none} #ffBossCharge.show{display:block} #ffBossChargeFill{height:100%;width:0;background:linear-gradient(90deg,#f97316,#ef4444,#dc2626);box-shadow:0 0 12px rgba(239,68,68,.65)}
      #ffPerfHud{position:fixed;z-index:25000;left:max(8px,env(safe-area-inset-left));bottom:max(8px,env(safe-area-inset-bottom));display:none;min-width:120px;padding:7px 9px;border:1px solid #334155;border-radius:9px;background:rgba(2,6,23,.82);color:#cbd5e1;font:700 10px/1.45 monospace;pointer-events:none;direction:ltr;text-align:left} #ffPerfHud.show{display:block}
      @media(max-width:520px){#ffPausePanel{width:min(94vw,430px);gap:15px}#ffPauseCard{padding:15px 13px;border-radius:22px}#ffPauseCard .setting-row{min-height:60px;padding:5px 4px;gap:11px}.ffPausePill,#ffPauseSoundSlot{min-width:110px;min-height:46px;padding-left:14px;padding-right:14px}}
    `;
    document.head.appendChild(style);

    const pauseBtn = document.createElement('button');
    pauseBtn.id = 'ffPauseBtn';
    pauseBtn.type = 'button';
    pauseBtn.setAttribute('aria-label', 'Pause');
    pauseBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"></rect><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"></rect></svg>';

    const pauseOverlay = document.createElement('div');
    pauseOverlay.id = 'ffPauseOverlay';
    pauseOverlay.innerHTML = `
      <div id="ffPausePanel" role="dialog" aria-modal="true" aria-labelledby="ffPauseTitle">
        <h2 id="ffPauseTitle">إيقاف مؤقت</h2>
        <div id="ffPauseCard">
          <div class="setting-row"><span id="ffPauseSoundLabel">المؤثرات الصوتية</span><div id="ffPauseSoundSlot" role="button" tabindex="0"><span id="ffPauseSoundState">مفعل</span></div></div>
          <div class="setting-row"><span>متابعة اللعب</span><button type="button" class="ffPausePill" data-action="resume">متابعة</button></div>
          <div class="setting-row"><span>إعادة المحاولة</span><button type="button" class="ffPausePill" data-action="restart">إعادة</button></div>
          <div class="setting-row"><span>إعدادات اللعبة</span><button type="button" class="ffPausePill" data-action="settings">فتح</button></div>
          <div class="setting-row ffPauseDangerRow"><span>العودة للقائمة</span><button type="button" class="ffPausePill ffPauseDanger" data-action="menu">القائمة</button></div>
        </div>
      </div>`;

    const countdown = document.createElement('div'); countdown.id = 'ffCountdown'; countdown.innerHTML = '<div id="ffCountdownValue">3</div>';
    const bossIntro = document.createElement('div'); bossIntro.id = 'ffBossIntroCard'; bossIntro.innerHTML = '<div id="ffBossIntroTitle"></div><div id="ffBossIntroHp"></div>';
    const bossCharge = document.createElement('div'); bossCharge.id = 'ffBossCharge'; bossCharge.innerHTML = '<div id="ffBossChargeFill"></div>';
    const perfHud = document.createElement('div'); perfHud.id = 'ffPerfHud';
    document.body.append(pauseBtn, pauseOverlay, countdown, bossIntro, bossCharge, perfHud);

    const existingSoundToggle = document.getElementById('soundToggleBtn');
    const pauseSoundSlot = pauseOverlay.querySelector('#ffPauseSoundSlot');
    const pauseSoundState = pauseOverlay.querySelector('#ffPauseSoundState');
    if (existingSoundToggle && pauseSoundSlot) pauseSoundSlot.insertBefore(existingSoundToggle, pauseSoundState || null);
    const updateSoundState = () => {
      const ar = game.lang === 'ar';
      const off = !!game.sound?.muted || game.sound?.sfxEnabled === false;
      if (pauseSoundState) pauseSoundState.textContent = ar ? (off ? 'مكتوم' : 'مفعل') : (off ? 'Muted' : 'Enabled');
      if (pauseSoundSlot) pauseSoundSlot.setAttribute('aria-pressed', off ? 'false' : 'true');
    };
    if (pauseSoundSlot) {
      pauseSoundSlot.addEventListener('click', e => { if (e.target !== existingSoundToggle && !e.target.closest?.('#soundToggleBtn')) existingSoundToggle?.click(); });
      pauseSoundSlot.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); existingSoundToggle?.click(); } });
    }
    existingSoundToggle?.addEventListener('click', () => setTimeout(updateSoundState, 0));

    const updatePauseLabels = () => {
      const ar = game.lang === 'ar';
      const labels = ar
        ? { title:'إيقاف مؤقت', sound:'المؤثرات الصوتية', resume:'متابعة', restart:'إعادة اللعب', settings:'الإعدادات', menu:'القائمة الرئيسية' }
        : { title:'Paused', sound:'Sound Effects', resume:'Resume', restart:'Restart', settings:'Settings', menu:'Main Menu' };
      pauseOverlay.querySelector('#ffPauseTitle').textContent = labels.title;
      const soundLabel = pauseOverlay.querySelector('#ffPauseSoundLabel');
      if (soundLabel) soundLabel.textContent = labels.sound;
      if (existingSoundToggle) existingSoundToggle.setAttribute('aria-label', ar ? 'تشغيل أو كتم الصوت' : 'Toggle sound');
      if (pauseSoundSlot) pauseSoundSlot.setAttribute('aria-label', ar ? 'تشغيل أو كتم المؤثرات الصوتية' : 'Toggle sound effects');
      updateSoundState();
      Object.keys(labels).forEach(k => {
        const b = pauseOverlay.querySelector(`[data-action="${k}"]`);
        if (b) b.textContent = labels[k];
      });
    };

    const stopGameAudio = () => {
      try { game.sound?.stopAmbiance?.(); } catch (_) {}
      try { game.sound?.stopBossAmbiance?.(); } catch (_) {}
    };
    const resumeGameAudio = () => {
      if (!game.sound) return;
      try { game.sound.init?.(); } catch (_) {}
      if (game.boss?.active && game.boss.type === 'crow') {
        try { game.sound.startBossAmbiance?.(); } catch (_) {}
      } else if (game.activeWorld === 0 && game.state === 'PLAYING') {
        const stage2 = game.score >= (cfg.STAGE1_END || 15);
        try { (stage2 ? game.sound.startCursedAmbiance : game.sound.startRuinsAmbiance)?.call(game.sound); } catch (_) {}
      }
    };
    const canPauseNow = () => {
      if (!activePauseStates.has(game.state)) return false;
      if (document.documentElement.classList.contains('ff-approved-splash-active')) return false;
      const start = document.getElementById('startScreen');
      if (start && start.classList.contains('active') && !start.classList.contains('hidden')) return false;
      const hud = document.getElementById('gameHud');
      if (!hud || hud.classList.contains('hidden')) return false;
      const end = document.getElementById('gameOverScreen');
      if (end && end.classList.contains('active') && !end.classList.contains('hidden')) return false;
      return true;
    };
    const setPaused = (paused) => {
      if (paused && !canPauseNow()) return false;
      game.__ffPaused = !!paused;
      updatePauseLabels();
      pauseOverlay.classList.toggle('show', !!paused);
      pauseBtn.classList.toggle('show', !paused && canPauseNow());
      if (paused) {
        stopGameAudio();
        requestAnimationFrame(() => pauseOverlay.querySelector('[data-action="resume"]')?.focus());
      } else {
        resumeGameAudio();
        try { pauseBtn.focus({ preventScroll:true }); } catch (_) {}
      }
      return true;
    };
    game.pauseGame = () => setPaused(true);
    game.resumeGame = () => setPaused(false);

    pauseBtn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); setPaused(true); });
    pauseOverlay.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'resume') setPaused(false);
      if (action === 'restart') {
        setPaused(false);
        pauseOverlay.classList.remove('show');
        if (game.gameMode === 'endless') { game.reset(); game.startGame?.('endless'); }
        else { game.reset(); game.startStory?.(game.activeWorld || 0); }
      }
      if (action === 'settings') {
        pauseOverlay.classList.remove('show');
        game.__ffSettingsFromPause = true;
        const settings = document.getElementById('settingsScreen');
        if (settings) { settings.classList.remove('hidden'); settings.classList.add('active'); }
      }
      if (action === 'menu') {
        setPaused(false);
        pauseOverlay.classList.remove('show');
        game.returnToMenu?.();
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (game.__ffPaused) { e.preventDefault(); setPaused(false); return; }
      if (canPauseNow()) { e.preventDefault(); setPaused(true); }
    });

    const uiWatch = () => {
      const show = !game.__ffPaused && canPauseNow() && !document.getElementById('settingsScreen')?.classList.contains('active');
      pauseBtn.classList.toggle('show', show);
      if (!canPauseNow() && game.__ffPaused) setPaused(false);
      requestAnimationFrame(uiWatch);
    };
    requestAnimationFrame(uiWatch);

    game.__coreGameplayUxV1Installed = true;
    console.log('[FF-LAB] core-gameplay-ux-v1-installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => { tries++; if (install() || tries > 120) clearInterval(timer); }, 80);
  setTimeout(install, 900);
})();
