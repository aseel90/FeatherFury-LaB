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
      #ffPauseBtn{position:fixed;top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));z-index:12000;width:46px;height:46px;border:2px solid rgba(255,255,255,.22);border-radius:14px;background:rgba(15,23,42,.82);backdrop-filter:blur(8px);display:none;align-items:center;justify-content:center;color:#fff;box-shadow:0 8px 28px rgba(0,0,0,.28);touch-action:manipulation}
      #ffPauseBtn.show{display:flex} #ffPauseBtn:focus-visible{outline:3px solid #facc15;outline-offset:3px}
      #ffPauseOverlay{position:fixed;inset:0;z-index:13000;background:rgba(2,6,23,.72);backdrop-filter:blur(7px);display:none;align-items:center;justify-content:center;padding:max(20px,env(safe-area-inset-top)) max(20px,env(safe-area-inset-right)) max(20px,env(safe-area-inset-bottom)) max(20px,env(safe-area-inset-left))}
      #ffPauseOverlay.show{display:flex}
      #ffPausePanel{width:min(92vw,390px);border:1px solid rgba(255,255,255,.16);border-radius:24px;background:linear-gradient(180deg,rgba(30,41,59,.98),rgba(15,23,42,.98));box-shadow:0 24px 70px rgba(0,0,0,.45);padding:24px;text-align:center}
      #ffPauseTitle{margin:0 0 18px;font-family:'Tajawal',sans-serif;font-size:1.55rem;color:#facc15}
      .ffPauseAction{width:100%;min-height:50px;margin:7px 0;border:1px solid rgba(255,255,255,.12);border-radius:15px;background:rgba(51,65,85,.9);color:#fff;font-family:'Tajawal',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;touch-action:manipulation}
      .ffPauseAction:focus-visible{outline:3px solid #facc15;outline-offset:2px}.ffPauseAction.primary{background:linear-gradient(180deg,#f59e0b,#d97706);color:#111827}
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
        <button type="button" class="ffPauseAction primary" data-action="resume">متابعة</button>
        <button type="button" class="ffPauseAction" data-action="restart">إعادة اللعب</button>
        <button type="button" class="ffPauseAction" data-action="settings">الإعدادات</button>
        <button type="button" class="ffPauseAction" data-action="menu">القائمة الرئيسية</button>
      </div>`;
    document.body.append(pauseBtn, pauseOverlay);

    const perfHud = document.createElement('div');
    perfHud.id = 'ffPerfHud';
    document.body.appendChild(perfHud);

    const activePauseStates = new Set(['PLAYING', 'BOSS_WARNING', 'BOSS_INTRO']);
    const updatePauseLabels = () => {
      const ar = game.lang === 'ar';
      const labels = ar
        ? { title:'إيقاف مؤقت', resume:'متابعة', restart:'إعادة اللعب', settings:'الإعدادات', menu:'القائمة الرئيسية' }
        : { title:'Paused', resume:'Resume', restart:'Restart', settings:'Settings', menu:'Main Menu' };
      pauseOverlay.querySelector('#ffPauseTitle').textContent = labels.title;
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
        if (isVictory && this.activeWorld === 0 && !this.__ffVictoryAllowFinish) {
          if (this.state === 'BOSS_OUTRO') {
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
          if (this.state === 'FLY_AWAY' && this.__ffVictoryCine?.phase === 'depart') return;
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
          const r = originalUpdate();
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
          return r;
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