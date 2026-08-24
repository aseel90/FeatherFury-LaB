(() => {
  'use strict';

  function install() {
    const game = window.game;
    if (!game || game.__coreGameplayUxV1Installed) return !!game;

    const cfg = window.CONFIG || {};
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const easeOutCubic = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
    const easeInOutCubic = t => {
      t = clamp(t, 0, 1);
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    const easeInQuad = t => { t = clamp(t, 0, 1); return t * t; };

    const style = document.createElement('style');
    style.id = 'ff-core-gameplay-ux-style';
    style.textContent = `
      /* HUD: keep score truly centered after moving sound control into Pause. */
      #gameHud .hud-top{display:grid!important;grid-template-columns:1fr auto 1fr!important;align-items:start!important;width:100%!important;position:relative!important}
      #gameHud .hud-coin-badge{grid-column:1!important;justify-self:start!important;align-self:start!important}
      #gameHud .score-container{grid-column:2!important;justify-self:center!important;align-self:start!important;min-width:0!important}
      #gameHud .score-badge,#gameHud .stage-badge{text-align:center!important}

      #ffPauseBtn{position:fixed;top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));z-index:12000;width:48px;height:48px;border:2px solid #4b5a70;border-radius:15px;background:linear-gradient(180deg,#3e4b62 0%,#2b3548 100%);display:none;align-items:center;justify-content:center;color:#fff;box-shadow:0 5px 0 #182231,0 10px 20px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.16);touch-action:manipulation}
      #ffPauseBtn.show{display:flex} #ffPauseBtn:active{transform:translateY(3px);box-shadow:0 2px 0 #182231,0 6px 12px rgba(0,0,0,.24)} #ffPauseBtn:focus-visible{outline:3px solid #facc15;outline-offset:3px}

      #ffPauseOverlay{position:fixed;inset:0;z-index:13000;background:#09131f;display:none;align-items:center;justify-content:center;padding:max(22px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(22px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));overflow:auto}
      #ffPauseOverlay::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 0%,rgba(251,191,36,.08),transparent 31%),linear-gradient(180deg,#0c1825 0%,#09131f 48%,#07101a 100%)}
      #ffPauseOverlay.show{display:flex}
      #ffPausePanel{position:relative;z-index:1;width:min(92vw,430px);display:flex;flex-direction:column;align-items:stretch;gap:16px;text-align:center}
      #ffPauseTitle{margin:0;color:#f1c40f;font-family:'Tajawal',sans-serif;font-size:clamp(1.6rem,6vw,2rem);font-weight:900;letter-spacing:.2px;text-shadow:0 2px 0 #5d4a00,0 5px 14px rgba(241,196,15,.18)}
      #ffPauseCard{position:relative;display:flex;flex-direction:column;gap:14px;padding:20px 18px 18px;border:3px solid #334155;border-radius:22px;background:rgba(3,8,14,.84);box-shadow:0 7px 0 #02060a,0 18px 34px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.04)}
      #ffPauseCard::before{content:"";position:absolute;left:16px;right:16px;top:-3px;height:3px;border-radius:3px;background:linear-gradient(90deg,transparent,rgba(241,196,15,.85),transparent)}
      #ffPausePanel .setting-row{display:flex!important;justify-content:space-between!important;align-items:center!important;gap:16px!important;min-height:52px!important;padding:2px 0!important;color:#e2e8f0!important;font-family:'Tajawal',sans-serif!important;font-size:1rem!important;font-weight:800!important;text-align:start!important}
      #ffPauseSoundSlot{display:flex;align-items:center;justify-content:flex-end;gap:8px;min-width:132px;padding:4px 10px;border:2px solid #1f618d;border-radius:25px;background:linear-gradient(135deg,#3498db,#2980b9);box-shadow:0 4px 0 #1a5276,0 6px 14px rgba(0,0,0,.28);color:#fff;cursor:pointer;user-select:none}
      #ffPauseSoundSlot:active{transform:translateY(3px);box-shadow:0 1px 0 #1a5276}
      #ffPauseSoundSlot #soundToggleBtn{position:static!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;width:34px!important;height:34px!important;min-width:34px!important;margin:0!important;padding:0!important;border:0!important;border-radius:50%!important;background:transparent!important;box-shadow:none!important;color:#fff!important;pointer-events:auto}
      #ffPauseSoundState{min-width:68px;text-align:center;color:#fff;font-family:'Tajawal',sans-serif;font-size:.92rem;font-weight:900;line-height:1}
      #ffPauseDivider{height:1px;background:#334155;margin:2px 0 0}
      #ffPauseActions{display:grid;grid-template-columns:1fr 1fr;gap:11px}
      #ffPauseActions button{width:100%;min-height:50px;margin:0;padding:10px 12px;border-radius:18px;font-family:'Tajawal',sans-serif;font-size:.98rem;font-weight:900;color:#fff;cursor:pointer;transition:transform .08s,filter .08s}
      #ffPauseActions [data-action="resume"]{grid-column:1/-1;min-height:56px;background:linear-gradient(135deg,#3498db,#2980b9);border:2px solid #1f618d;box-shadow:0 5px 0 #1a5276,0 8px 16px rgba(0,0,0,.28)}
      #ffPauseActions [data-action="restart"],#ffPauseActions [data-action="settings"]{background:linear-gradient(180deg,#475569,#334155);border:2px solid #253449;box-shadow:0 4px 0 #172231,0 7px 14px rgba(0,0,0,.25)}
      #ffPauseActions [data-action="menu"]{grid-column:1/-1;background:linear-gradient(180deg,#263548,#1c2938);border:2px solid #111c29;box-shadow:0 4px 0 #0b121c,0 7px 14px rgba(0,0,0,.24);color:#e2e8f0}
      #ffPauseActions button:active{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.55)!important} #ffPauseActions button:focus-visible{outline:3px solid #facc15;outline-offset:3px}
      @media(max-width:380px){#ffPausePanel{width:min(94vw,360px)}#ffPauseCard{padding:17px 14px 15px}#ffPauseActions{grid-template-columns:1fr}#ffPauseActions [data-action]{grid-column:1!important}}
      #ffPerfHud{position:fixed;left:max(8px,env(safe-area-inset-left));top:max(8px,env(safe-area-inset-top));z-index:14000;display:none;pointer-events:none;background:rgba(2,6,23,.78);border:1px solid rgba(255,255,255,.13);border-radius:9px;padding:6px 8px;color:#e2e8f0;font:600 10px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre;text-shadow:0 1px 2px #000}
      #ffPerfHud.show{display:block}
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
          <div class="setting-row">
            <span id="ffPauseSoundLabel">المؤثرات الصوتية</span>
            <div id="ffPauseSoundSlot" role="button" tabindex="0" aria-label="Toggle sound">
              <span id="ffPauseSoundState">مفعل</span>
            </div>
          </div>
          <div id="ffPauseDivider"></div>
          <div id="ffPauseActions">
            <button type="button" data-action="resume">متابعة</button>
            <button type="button" data-action="restart">إعادة اللعب</button>
            <button type="button" data-action="settings">الإعدادات</button>
            <button type="button" data-action="menu">القائمة الرئيسية</button>
          </div>
        </div>
      </div>`;
    document.body.append(pauseBtn, pauseOverlay);

    const existingSoundToggle = document.getElementById('soundToggleBtn');
    const pauseSoundSlot = pauseOverlay.querySelector('#ffPauseSoundSlot');
    const pauseSoundState = pauseOverlay.querySelector('#ffPauseSoundState');
    if (existingSoundToggle && pauseSoundSlot) {
      pauseSoundSlot.insertBefore(existingSoundToggle, pauseSoundState || null);
      existingSoundToggle.setAttribute('aria-label', game.lang === 'ar' ? 'تشغيل أو كتم الصوت' : 'Toggle sound');
    }
    const updateSoundState = () => {
      const ar = game.lang === 'ar';
      const off = !!game.sound?.muted || game.sound?.sfxEnabled === false;
      if (pauseSoundState) pauseSoundState.textContent = ar ? (off ? 'مكتوم' : 'مفعل') : (off ? 'Muted' : 'Enabled');
      if (pauseSoundSlot) pauseSoundSlot.setAttribute('aria-pressed', off ? 'false' : 'true');
    };
    if (existingSoundToggle) existingSoundToggle.addEventListener('click', () => setTimeout(updateSoundState, 0));
    if (pauseSoundSlot) {
      pauseSoundSlot.addEventListener('click', e => { if (e.target !== existingSoundToggle && !e.target.closest?.('#soundToggleBtn')) existingSoundToggle?.click(); });
      pauseSoundSlot.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); existingSoundToggle?.click(); } });
    }

    // Temporary LAB testing price. Restore the final value after boss/revive QA.
    try { if (window.CONFIG) window.CONFIG.REVIVE_COST = 1; } catch (_) {}

    const perfHud = document.createElement('div');
    perfHud.id = 'ffPerfHud';
    document.body.appendChild(perfHud);

    const activePauseStates = new Set(['PLAYING', 'BOSS_WARNING', 'BOSS_INTRO']);
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
    const setPaused = (paused) => {
      if (paused && !activePauseStates.has(game.state)) return false;
      game.__ffPaused = !!paused;
      updatePauseLabels();
      pauseOverlay.classList.toggle('show', !!paused);
      pauseBtn.classList.toggle('show', !paused && activePauseStates.has(game.state));
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
        try { game.enterStoryState(); } catch (_) {}
      }
      if (action === 'settings') {
        game.__ffSettingsFromPause = true;
        pauseOverlay.classList.remove('show');
        const settings = document.getElementById('settingsScreen');
        settings?.classList.remove('hidden'); settings?.classList.add('active');
      }
      if (action === 'menu') {
        setPaused(false);
        document.getElementById('mainMenuBtn')?.click();
      }
    });

    document.addEventListener('click', e => {
      if (!game.__ffSettingsFromPause || !e.target.closest('#closeSettingsBtn')) return;
      e.preventDefault(); e.stopImmediatePropagation();
      game.__ffSettingsFromPause = false;
      const settings = document.getElementById('settingsScreen');
      settings?.classList.remove('active'); settings?.classList.add('hidden');
      pauseOverlay.classList.add('show');
      game.__ffPaused = true;
      requestAnimationFrame(() => pauseOverlay.querySelector('[data-action="resume"]')?.focus());
    }, true);

    const blockWhilePaused = e => {
      if (!game.__ffPaused) return;
      if (e.target?.closest?.('#ffPauseOverlay,#settingsScreen')) return;
      e.preventDefault(); e.stopImmediatePropagation();
    };
    document.addEventListener('pointerdown', blockWhilePaused, true);
    document.addEventListener('touchstart', blockWhilePaused, { capture:true, passive:false });

    const handleBack = e => {
      if (game.__ffPaused) { e?.preventDefault?.(); setPaused(false); return; }
      if (activePauseStates.has(game.state)) { e?.preventDefault?.(); setPaused(true); }
    };
    document.addEventListener('backbutton', handleBack, false);
    window.addEventListener('popstate', handleBack, false);

    const q = new URLSearchParams(location.search || '');
    const perfEnabled = q.get('fps') === '1' || q.get('debug') === '1';
    if (perfEnabled) perfHud.classList.add('show');
    const perf = { fps:60, frameMs:16.7, minFps:60, drops:0, samples:[] };
    window.FFPerformance = { getStats: () => ({ ...perf, samples: undefined }) };
    let perfLast = performance.now(), bucketStart = perfLast, frames = 0, sumFrame = 0, dropSince = 0, lastDropLog = 0;
    function perfLoop(ts) {
      const dt = ts - perfLast; perfLast = ts; frames++; sumFrame += dt;
      if (ts - bucketStart >= 500) {
        const span = ts - bucketStart;
        const fps = frames * 1000 / Math.max(1, span);
        const frameMs = sumFrame / Math.max(1, frames);
        perf.fps = Math.round(fps);
        perf.frameMs = Math.round(frameMs * 10) / 10;
        perf.samples.push({ t:ts, fps });
        while (perf.samples.length && ts - perf.samples[0].t > 5000) perf.samples.shift();
        perf.minFps = Math.round(Math.min(...perf.samples.map(s => s.fps), fps));
        if (fps < 45) {
          if (!dropSince) dropSince = ts;
          if (ts - dropSince > 1000 && ts - lastDropLog > 4000) {
            perf.drops++; lastDropLog = ts;
            console.warn(`[FF PERF] sustained FPS drop: ${perf.fps} FPS, ${perf.frameMs}ms/frame`);
          }
        } else dropSince = 0;
        if (perfEnabled) perfHud.textContent = `FPS ${perf.fps}\nFrame ${perf.frameMs} ms\nMin(5s) ${perf.minFps}\nDrops ${perf.drops}`;
        bucketStart = ts; frames = 0; sumFrame = 0;
      }
      requestAnimationFrame(perfLoop);
    }
    requestAnimationFrame(perfLoop);

    const originalLaunchDash = typeof game.launchDash === 'function' ? game.launchDash.bind(game) : null;
    if (originalLaunchDash) {
      game.launchDash = function() {
        if (this.activeWorld !== 0) return originalLaunchDash();
        if (this.__ffLaunchAnimating) return;
        this.__ffLaunchAnimating = true;
        this.state = 'LAUNCH';
        this.screenShake = Math.max(this.screenShake || 0, 11);
        this.sound?.playCageBreak?.();

        const x0 = this.bird.x, y0 = this.bird.y;
        const settleY = (cfg.CANVAS_HEIGHT || 640) / 2 - 28;
        const token = (this.__ffLaunchToken || 0) + 1;
        this.__ffLaunchToken = token;
        for (let i = 0; i < 16; i++) {
          this.particles.push({ x:x0+(Math.random()-.5)*50, y:y0+(Math.random()-.5)*58, vx:(Math.random()-.5)*11, vy:-2-Math.random()*7, size:1.5+Math.random()*2.5, color:'#64748b', life:.9, isBar:true, rot:Math.random()*Math.PI, vrot:(Math.random()-.5)*.35 });
          this.particles.push({ x:x0+(Math.random()-.5)*34, y:y0+(Math.random()-.5)*34, vx:(Math.random()-.5)*10, vy:(Math.random()-.5)*9, size:1.5+Math.random()*2.5, color:'#f59e0b', life:.65 });
        }
        const start = performance.now();
        const animate = now => {
          if (this.__ffLaunchToken !== token) return;
          const elapsed = now - start;
          if (elapsed < 300) {
            const p = easeOutCubic(elapsed / 300);
            this.bird.x = x0 + 52 * p;
            this.bird.y = y0 - 18 * p;
            this.bird.rotation = -0.28 * p;
            this.bird.wingCycle = Math.sin(elapsed * .04);
          } else {
            const p = easeInOutCubic((elapsed - 300) / 360);
            this.bird.x = (x0 + 52) + (80 - (x0 + 52)) * p;
            this.bird.y = (y0 - 18) + (settleY - (y0 - 18)) * p;
            this.bird.rotation = -0.28 * (1 - p);
            this.bird.wingCycle = Math.sin(elapsed * .035);
          }
          if (elapsed < 660) requestAnimationFrame(animate);
          else {
            this.bird.x = 80; this.bird.y = settleY; this.bird.rotation = 0; this.bird.velocity = -3.2;
            this.state = 'PLAYING'; this.spawnTimer = 60; this.__ffLaunchAnimating = false;
            document.getElementById('gameHud')?.classList.remove('hidden');
          }
        };
        requestAnimationFrame(animate);
      };
    }

    const originalGameOver = typeof game.gameOver === 'function' ? game.gameOver.bind(game) : null;
    if (originalGameOver) {
      game.gameOver = function(isVictory = false) {
        if (isVictory && this.activeWorld === 0 && this.__ffVictoryCine?.phase === 'depart' && !this.__ffVictoryAllowFinish) {
          return;
        }
        if (isVictory && this.activeWorld === 0 && this.state === 'BOSS_OUTRO' && !this.__ffVictoryAllowFinish) {
          const w = cfg.CANVAS_WIDTH || 360;
          this.__ffVictoryCine = {
            phase:'depart', frame:0,
            birdX:this.bird.x, birdY:this.bird.y,
            owlX:this.owl.x, owlY:this.owl.y,
            endX:w + 120
          };
          this.state = 'FLY_AWAY';
          this.bossFeathers = []; this.powerOrbs = [];
          return;
        }
        return originalGameOver(isVictory);
      };
    }

    const originalUpdate = typeof game.update === 'function' ? game.update.bind(game) : null;
    if (originalUpdate) {
      game.update = function() {
        if (this.__ffPaused) return;

        const enteringOutro = this.activeWorld === 0 && this.state === 'BOSS_OUTRO' && (!this.__ffVictoryCine || this.__ffVictoryCine.phase !== 'approach') && (!this.__ffVictoryCine || this.__ffVictoryCine.phase !== 'dialogue');
        if (enteringOutro) {
          this.__ffVictoryCine = { phase:'approach', frame:0 };
          this.bossFeathers = []; this.powerOrbs = [];
          try { this.sound?.stopBossAmbiance?.(); } catch (_) {}
        }

        const cine = this.__ffVictoryCine;
        if (this.activeWorld === 0 && this.state === 'BOSS_OUTRO' && cine?.phase === 'approach') {
          const storyCompleted = this.storyCompleted;
          this.storyCompleted = true;
          const r = originalUpdate();
          this.storyCompleted = storyCompleted;
          cine.frame++;
          const targetBirdX = (cfg.CANVAS_WIDTH || 360) / 2 - 52;
          const targetOwlX = (cfg.CANVAS_WIDTH || 360) / 2 + 52;
          const targetY = (cfg.CANVAS_HEIGHT || 640) / 2 - 32;
          this.bird.x += (targetBirdX - this.bird.x) * .075;
          this.bird.y += (targetY - this.bird.y) * .065;
          this.owl.x += (targetOwlX - this.owl.x) * .07;
          this.owl.y += (targetY - this.owl.y) * .06;
          this.bird.rotation += (0 - this.bird.rotation) * .15;
          this.bird.wingCycle = Math.sin(this.frame * .45);
          if ((Math.abs(this.bird.x-targetBirdX)<2.5 && Math.abs(this.owl.x-targetOwlX)<3) || cine.frame > 105) {
            this.bird.x = targetBirdX; this.owl.x = targetOwlX;
            this.bird.y = targetY; this.owl.y = targetY;
            cine.phase = 'dialogue';
          }
          return r;
        }

        if (this.activeWorld === 0 && this.state === 'FLY_AWAY' && cine?.phase === 'depart') {
          cine.frame++;
          const p = clamp(cine.frame / 90, 0, 1);
          const e = easeInQuad(p);
          const lift = easeInOutCubic(p);
          this.bird.x = cine.birdX + (cine.endX - cine.birdX) * e;
          this.owl.x = cine.owlX + (cine.endX + 42 - cine.owlX) * e;
          this.bird.y = cine.birdY - 58 * lift;
          this.owl.y = cine.owlY - 62 * lift;
          this.bird.rotation = -0.08 - 0.2 * e;
          this.bird.wingCycle = Math.sin(this.frame * .72);
          if (p >= 1 && !this.__ffVictoryAllowFinish) {
            this.__ffVictoryAllowFinish = true;
            originalGameOver(true);
          }
          return;
        }

        return originalUpdate();
      };
    }

    const blockVictoryApproach = e => {
      if (game.activeWorld === 0 && game.state === 'BOSS_OUTRO' && game.__ffVictoryCine?.phase === 'approach') {
        e.preventDefault(); e.stopImmediatePropagation();
      }
    };
    document.addEventListener('pointerdown', blockVictoryApproach, true);
    document.addEventListener('touchstart', blockVictoryApproach, { capture:true, passive:false });
    document.addEventListener('keydown', blockVictoryApproach, true);

    const originalReset = typeof game.reset === 'function' ? game.reset.bind(game) : null;
    if (originalReset) {
      game.reset = function() {
        this.__ffLaunchToken = (this.__ffLaunchToken || 0) + 1;
        this.__ffLaunchAnimating = false;
        this.__ffVictoryCine = null;
        this.__ffVictoryAllowFinish = false;
        this.__ffPaused = false;
        pauseOverlay.classList.remove('show');
        const r = originalReset();
        try { if (window.CONFIG) window.CONFIG.REVIVE_COST = 1; } catch (_) {}
        return r;
      };
    }

    const uiWatch = () => {
      const show = !game.__ffPaused && activePauseStates.has(game.state) && !document.getElementById('settingsScreen')?.classList.contains('active');
      pauseBtn.classList.toggle('show', show);
      if (!activePauseStates.has(game.state) && game.__ffPaused) setPaused(false);
      requestAnimationFrame(uiWatch);
    };
    requestAnimationFrame(uiWatch);

    game.__coreGameplayUxV1Installed = true;
    console.log('[FF-LAB] core-gameplay-ux-v1-installed');
    return true;
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    if (install() || attempts > 100) clearInterval(timer);
  }, 80);
  setTimeout(install, 900);
  setTimeout(install, 1800);
})();