(() => {
  'use strict';
  if (window.__FF_TELEMETRY_V1__) return;
  window.__FF_TELEMETRY_V1__ = true;

  const VERSION = 'telemetry-v1.0';
  const POLL_MS = 180;
  const MAX_STRING = 100;
  const MAX_PARAMS = 23; // reserve room for telemetry_version + platform

  const runtime = {
    installed: false,
    native: false,
    analytics: null,
    sent: 0,
    failed: 0,
    lastError: null,
    run: null,
    runSeq: 0,
    knownUnlocked: new Set(),
    lastSkin: null,
    lastEngineState: null,
    lastRoute: null,
    watchTimer: null
  };

  const nowMs = () => Date.now();
  const int = value => Math.max(0, Math.floor(Number(value) || 0));
  const boolInt = value => value ? 1 : 0;

  function safeConfig() {
    try { return window.CONFIG || (typeof CONFIG !== 'undefined' ? CONFIG : null); } catch (_) { return window.CONFIG || null; }
  }

  function worldKey(game = window.game) {
    const w = game?.activeWorld;
    if (w === 'ENDLESS' || game?.gameMode === 'endless') return 'endless';
    if (w === 0) return 'world_1';
    if (w === 1) return 'world_2';
    if (w === 2) return 'world_3';
    if (Number.isFinite(Number(w))) return `world_${Number(w) + 1}`;
    return 'unknown';
  }

  function heroKey(game = window.game) {
    const key = game?.activeSkin;
    return typeof key === 'string' && key ? key : 'unknown';
  }

  function bossKey(game = window.game) {
    const type = game?.boss?.type;
    return typeof type === 'string' && type ? type : 'unknown';
  }

  function phaseKey(game = window.game) {
    if (!game) return 'unknown';
    if (game.boss?.active || ['BOSS_INTRO','BOSS_OUTRO','BOSS_WARNING'].includes(game.state)) return 'boss';
    const cfg = safeConfig();
    const score = int(game.score);
    const stage2 = Number(cfg?.STAGE2_END);
    const stage1 = Number(cfg?.STAGE1_END);
    if (Number.isFinite(stage2) && score >= stage2) return 'boss_gate';
    if (Number.isFinite(stage1) && score >= stage1) return 'stage_2';
    return 'stage_1';
  }

  function deathReason(game = window.game) {
    if (!game?.bird) return 'unknown';
    const cfg = safeConfig();
    const radius = Number(cfg?.BIRD_RADIUS || 14);
    const height = Number(cfg?.CANVAS_HEIGHT || 640);
    const ground = Number(cfg?.GROUND_HEIGHT || 70);
    const floorY = height - ground - radius;
    if (Number(game.bird.y) >= floorY - 3) return 'ground';
    if (Number(game.bird.y) <= radius + 3) return 'ceiling';
    if (game.boss?.active) return 'boss_or_boss_hazard';
    return 'obstacle_or_enemy';
  }

  function completedBefore(game, world) {
    if (!game) return false;
    if (world === 'world_1') return !!game.w1Completed;
    if (world === 'world_2') return !!game.w2Completed;
    if (world === 'world_3') return !!game.w3Completed;
    return false;
  }

  function cleanKey(key) {
    const out = String(key || '').replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 40);
    return /^[A-Za-z]/.test(out) ? out : `p_${out}`;
  }

  function cleanValue(value) {
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value === 'string') return value.slice(0, MAX_STRING);
    if (value == null) return '';
    return String(value).slice(0, MAX_STRING);
  }

  function cleanParams(params = {}) {
    const out = {};
    let count = 0;
    for (const [rawKey, rawValue] of Object.entries(params)) {
      if (count >= MAX_PARAMS) break;
      const key = cleanKey(rawKey);
      if (!key || key.startsWith('firebase_') || key.startsWith('google_') || key.startsWith('ga_')) continue;
      out[key] = cleanValue(rawValue);
      count++;
    }
    out.telemetry_version = VERSION;
    out.platform = runtime.native ? 'android' : 'web';
    return out;
  }

  function getAnalyticsPlugin() {
    const cap = window.Capacitor;
    runtime.native = !!cap?.isNativePlatform?.();
    if (!runtime.native) return null;
    try {
      return cap.registerPlugin?.('FirebaseAnalytics') || cap.Plugins?.FirebaseAnalytics || null;
    } catch (error) {
      runtime.lastError = error?.message || String(error);
      return cap?.Plugins?.FirebaseAnalytics || null;
    }
  }

  function emit(name, params = {}) {
    const eventName = cleanKey(name).slice(0, 40);
    const payload = cleanParams(params);
    try {
      window.dispatchEvent(new CustomEvent('ff:telemetry', { detail: { name: eventName, params: payload } }));
    } catch (_) {}

    const analytics = runtime.analytics;
    if (!analytics?.logEvent) return Promise.resolve(false);
    try {
      return Promise.resolve(analytics.logEvent({ name: eventName, params: payload }))
        .then(() => { runtime.sent++; return true; })
        .catch(error => {
          runtime.failed++;
          runtime.lastError = error?.message || String(error);
          console.warn('[FeatherFury] telemetry event failed', eventName, error);
          return false;
        });
    } catch (error) {
      runtime.failed++;
      runtime.lastError = error?.message || String(error);
      return Promise.resolve(false);
    }
  }

  function runId() {
    runtime.runSeq++;
    return `${nowMs().toString(36)}_${runtime.runSeq.toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  }

  function runBase(game = window.game) {
    return {
      run_id: runtime.run?.id || '',
      world: worldKey(game),
      hero: heroKey(game),
      score: int(game?.score),
      coin_balance: int(game?.totalCoins),
      phase: phaseKey(game)
    };
  }

  function startRun(source = 'play') {
    const game = window.game;
    if (!game) return;
    if (runtime.run && !runtime.run.ended) finalizeRun(runtime.run.pendingDeath ? 'restart_after_death' : 'restart_during_run');
    runtime.run = {
      id: runId(),
      startedAt: nowMs(),
      world: worldKey(game),
      startHero: heroKey(game),
      earnedCoins: 0,
      reviveSpend: 0,
      deaths: 0,
      revives: 0,
      pendingDeath: false,
      bossStarted: false,
      ended: false,
      lastWorld: worldKey(game),
      lastHero: heroKey(game),
      lastScore: int(game.score),
      lastPhase: phaseKey(game)
    };
    emit('run_start', {
      ...runBase(game),
      source,
      language: game.lang === 'ar' ? 'ar' : 'en'
    });
  }

  function finalizeRun(outcome, extra = {}) {
    const game = window.game;
    const run = runtime.run;
    if (!run || run.ended) return;
    run.ended = true;
    const durationS = Math.max(0, Math.round((nowMs() - run.startedAt) / 1000));
    emit('run_end', {
      ...runBase(game),
      world: run.lastWorld || worldKey(game),
      hero: run.lastHero || heroKey(game),
      score: int(run.lastScore),
      phase: run.lastPhase || phaseKey(game),
      outcome,
      duration_s: durationS,
      coins_earned: int(run.earnedCoins),
      revive_spend: int(run.reviveSpend),
      deaths: int(run.deaths),
      revives: int(run.revives),
      ...extra
    });
    runtime.run = null;
  }

  function installRunHooks(game) {
    if (game.__ffTelemetryV1RunHooks) return;

    if (typeof game.enterStoryState === 'function') {
      const baseEnterStory = game.enterStoryState.bind(game);
      game.enterStoryState = function ffTelemetryEnterStory(...args) {
        const source = runtime.run ? 'restart' : 'play';
        if (runtime.run && !runtime.run.ended) finalizeRun(runtime.run.pendingDeath ? 'restart_after_death' : 'restart_during_run');
        const out = baseEnterStory(...args);
        startRun(source);
        return out;
      };
    }

    if (typeof game.activateBoss === 'function') {
      const baseActivateBoss = game.activateBoss.bind(game);
      game.activateBoss = function ffTelemetryActivateBoss(...args) {
        const wasActive = !!this.boss?.active;
        const out = baseActivateBoss(...args);
        if (!wasActive && this.boss?.active) {
          if (runtime.run) runtime.run.bossStarted = true;
          emit('boss_start', { ...runBase(this), boss: bossKey(this) });
        }
        return out;
      };
    }

    if (typeof game.gameOver === 'function') {
      const baseGameOver = game.gameOver.bind(game);
      game.gameOver = function ffTelemetryGameOver(isVictory = false, ...args) {
        if (this.state === 'GAMEOVER') return baseGameOver(isVictory, ...args);
        const before = {
          world: worldKey(this),
          hero: heroKey(this),
          score: int(this.score),
          segmentCoins: int(this.sessionCoins),
          phase: phaseKey(this),
          boss: bossKey(this),
          completed: completedBefore(this, worldKey(this))
        };
        if (runtime.run) {
          runtime.run.lastWorld = before.world;
          runtime.run.lastHero = before.hero;
          runtime.run.lastScore = before.score;
          runtime.run.lastPhase = before.phase;
        }
        const out = baseGameOver(isVictory, ...args);

        // Some hero abilities can cancel a fatal hit inside gameOver(). Only log an
        // actual death/victory after the engine really reached GAMEOVER.
        if (this.state !== 'GAMEOVER') return out;
        if (!runtime.run) startRun('recovered');
        const run = runtime.run;
        if (run) run.earnedCoins += before.segmentCoins;

        if (before.segmentCoins > 0) {
          emit('coins_earned', {
            ...runBase(this),
            amount: before.segmentCoins,
            checkpoint: isVictory ? 'victory' : 'death'
          });
        }

        if (isVictory) {
          emit('boss_complete', {
            ...runBase(this),
            boss: before.boss,
            score: before.score,
            revives: int(run?.revives)
          });
          emit('world_complete', {
            ...runBase(this),
            world: before.world,
            score: before.score,
            first_time: boolInt(!before.completed)
          });
          finalizeRun('victory', { score: before.score });
        } else {
          if (run) {
            run.deaths++;
            run.pendingDeath = true;
          }
          emit('death', {
            ...runBase(this),
            world: before.world,
            hero: before.hero,
            score: before.score,
            phase: before.phase,
            reason: deathReason(this),
            deaths: int(run?.deaths),
            revives: int(run?.revives),
            coins_earned: int(run?.earnedCoins)
          });
        }
        return out;
      };
    }

    game.__ffTelemetryV1RunHooks = true;
  }

  function installReviveHook(game) {
    const btn = document.getElementById('reviveBtn');
    if (!btn || btn.__ffTelemetryV1ReviveHook || typeof btn.onclick !== 'function') return;
    const base = btn.onclick;
    btn.onclick = function ffTelemetryReviveClick(...args) {
      const beforeCount = int(game.__ffReviveCount);
      const beforeCoins = int(game.totalCoins);
      const beforeState = game.state;
      const out = base.apply(this, args);
      setTimeout(() => {
        const afterCount = int(game.__ffReviveCount);
        if (beforeState === 'GAMEOVER' && afterCount > beforeCount && game.state === 'PLAYING') {
          const cost = Math.max(0, beforeCoins - int(game.totalCoins));
          if (runtime.run) {
            runtime.run.revives += Math.max(1, afterCount - beforeCount);
            runtime.run.reviveSpend += cost;
            runtime.run.pendingDeath = false;
          }
          emit('revive_used', {
            ...runBase(game),
            revive_number: afterCount,
            cost,
            coin_balance: int(game.totalCoins)
          });
        }
      }, 0);
      return out;
    };
    btn.__ffTelemetryV1ReviveHook = true;
  }

  function detectHeroChanges(game) {
    const current = new Set(game?.unlockedSkins ? [...game.unlockedSkins] : []);
    for (const key of current) {
      if (runtime.knownUnlocked.has(key)) continue;
      const entry = window.FFEconomy?.heroes?.[key];
      const purchasable = entry?.purchasable === true;
      emit(purchasable ? 'hero_purchase' : 'hero_unlock', {
        hero: key,
        price: purchasable ? int(entry?.price) : 0,
        unlock_source: purchasable ? 'coins' : (entry?.unlock || 'progression'),
        coin_balance: int(game?.totalCoins),
        world: worldKey(game)
      });
    }
    runtime.knownUnlocked = current;

    const skin = heroKey(game);
    if (runtime.lastSkin && skin !== runtime.lastSkin) {
      emit('hero_selected', {
        hero: skin,
        previous_hero: runtime.lastSkin,
        coin_balance: int(game?.totalCoins)
      });
    }
    runtime.lastSkin = skin;
  }

  function watchState(game) {
    const currentState = String(game?.state || '');
    const previous = runtime.lastEngineState;

    if (runtime.run && currentState === 'MENU' && previous && previous !== 'MENU') {
      finalizeRun(runtime.run.pendingDeath ? 'menu_after_death' : 'quit_to_menu');
    } else if (runtime.run && currentState !== 'MENU') {
      runtime.run.lastWorld = worldKey(game);
      runtime.run.lastHero = heroKey(game);
      runtime.run.lastScore = int(game?.score);
      runtime.run.lastPhase = phaseKey(game);
    }

    if (worldKey(game) === 'endless') {
      if (currentState === 'LAUNCH' && previous !== 'LAUNCH') {
        if (runtime.run && !runtime.run.ended) finalizeRun(runtime.run.pendingDeath ? 'restart_after_death' : 'restart_during_run');
        startRun('endless_restart');
      } else if (!runtime.run && currentState === 'PLAYING' && previous === 'MENU') {
        startRun('endless');
      }
    }

    runtime.lastEngineState = currentState;

    const route = window.__FF_UI_NAV__?.inferRoute?.();
    if (route && route !== runtime.lastRoute) {
      runtime.lastRoute = route;
      const analytics = runtime.analytics;
      if (analytics?.setCurrentScreen) {
        Promise.resolve(analytics.setCurrentScreen({
          screenName: String(route).toLowerCase(),
          screenClassOverride: 'FeatherFury'
        })).catch(() => {});
      }
    }
  }

  function beginWatch(game) {
    runtime.knownUnlocked = new Set(game?.unlockedSkins ? [...game.unlockedSkins] : []);
    runtime.lastSkin = heroKey(game);
    runtime.lastEngineState = String(game?.state || '');
    if (runtime.watchTimer) clearInterval(runtime.watchTimer);
    runtime.watchTimer = setInterval(() => {
      try {
        detectHeroChanges(game);
        watchState(game);
        installReviveHook(game);
      } catch (error) {
        runtime.lastError = error?.message || String(error);
      }
    }, POLL_MS);
  }

  function install() {
    if (runtime.installed) return true;
    const game = window.game;
    if (!game || window.__FF_MENU_UI_READY__ !== true) return false;

    runtime.analytics = getAnalyticsPlugin();
    installRunHooks(game);
    installReviveHook(game);
    beginWatch(game);
    runtime.installed = true;

    emit('telemetry_ready', {
      native_bridge: boolInt(!!runtime.analytics?.logEvent),
      language: game.lang === 'ar' ? 'ar' : 'en',
      coin_balance: int(game.totalCoins)
    });
    console.log('[FeatherFury] telemetry-v1.0-ready', { native: runtime.native, firebase: !!runtime.analytics?.logEvent });
    return true;
  }

  window.FFTelemetry = Object.freeze({
    version: VERSION,
    log: emit,
    status() {
      return {
        version: VERSION,
        installed: runtime.installed,
        native: runtime.native,
        firebaseReady: !!runtime.analytics?.logEvent,
        sent: runtime.sent,
        failed: runtime.failed,
        lastError: runtime.lastError,
        runActive: !!runtime.run
      };
    },
    test() { return emit('telemetry_test', { timestamp_s: Math.floor(nowMs() / 1000) }); }
  });

  if (!install()) {
    window.addEventListener('ff:menu-ready', install, { once: true });
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (install() || tries > 400) clearInterval(timer);
    }, 100);
  }
})();
