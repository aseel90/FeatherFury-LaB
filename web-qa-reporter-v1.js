(() => {
  'use strict';

  const enabled = new URLSearchParams(window.location.search).get('ffqa') === '1';
  if (!enabled || window.__FF_WEB_QA_REPORTER_V1__) return;
  window.__FF_WEB_QA_REPORTER_V1__ = true;

  const VERSION = 'web-qa-reporter-v1.0';
  const ENDPOINT = 'https://featherfury-web-qa-reports.salahaseel82.workers.dev/v1/report';
  const SESSION_KEY = 'ffqa_session_v1';
  const MAX_EVENTS = 120;
  const MAX_ERRORS = 20;

  const state = {
    sessionId: '',
    currentRun: null,
    events: [],
    errors: [],
    jsErrors: 0,
    runtimeWarnings: 0,
    sent: 0,
    failed: 0,
    lastError: null,
    sessionStartSent: false
  };

  function id(prefix = 'qa') {
    try {
      if (crypto?.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
    } catch (_) {}
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function getSessionId() {
    try {
      let value = sessionStorage.getItem(SESSION_KEY);
      if (!value) {
        value = id('session');
        sessionStorage.setItem(SESSION_KEY, value);
      }
      return value;
    } catch (_) {
      return id('session');
    }
  }

  function num(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
  }

  function text(value, max = 120) {
    return typeof value === 'string' ? value.slice(0, max) : '';
  }

  function worldNumber(value) {
    if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.floor(value));
    const match = String(value || '').match(/world_(\d+)/i);
    return match ? num(match[1]) : 0;
  }

  function browserName() {
    const ua = navigator.userAgent || '';
    if (/Edg\//.test(ua)) return 'Edge';
    if (/OPR\//.test(ua)) return 'Opera';
    if (/Firefox\//.test(ua)) return 'Firefox';
    if (/Chrome\//.test(ua)) return 'Chrome';
    if (/Safari\//.test(ua)) return 'Safari';
    return 'Browser';
  }

  function buildLabel() {
    const gameScript = [...document.scripts].find(s => /(?:^|\/)game\.js(?:\?|$)/.test(s.src || ''));
    if (!gameScript) return '';
    try {
      const url = new URL(gameScript.src, location.href);
      return `game.js@${url.searchParams.get('v') || 'unversioned'}`;
    } catch (_) {
      return 'game.js';
    }
  }

  function compactEvent(name, params = {}) {
    return {
      name: text(name, 64),
      at: new Date().toISOString(),
      world: worldNumber(params.world),
      score: num(params.score),
      coins: num(params.amount ?? params.coins_earned ?? params.coin_balance),
      hero: text(params.hero, 48)
    };
  }

  function rememberEvent(name, params) {
    state.events.push(compactEvent(name, params));
    if (state.events.length > MAX_EVENTS) state.events.splice(0, state.events.length - MAX_EVENTS);
  }

  function rememberError(message) {
    const clean = text(String(message || 'Unknown browser error'), 500);
    if (!clean) return;
    state.errors.push(clean);
    if (state.errors.length > MAX_ERRORS) state.errors.splice(0, state.errors.length - MAX_ERRORS);
  }

  async function send(payload, { keepalive = false } = {}) {
    const body = {
      report_id: payload.report_id || id('report'),
      session_id: state.sessionId,
      event_time: payload.event_time || new Date().toISOString(),
      browser: browserName(),
      viewport: `${window.innerWidth || 0}x${window.innerHeight || 0}`,
      build: buildLabel(),
      js_errors: state.jsErrors,
      runtime_warnings: state.runtimeWarnings,
      errors: state.errors.slice(-MAX_ERRORS),
      ...payload
    };

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
        keepalive,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error(`QA reporter HTTP ${response.status}`);
      state.sent++;
      state.lastError = null;
      return true;
    } catch (error) {
      state.failed++;
      state.lastError = error?.message || String(error);
      console.warn('[FeatherFury QA] report failed', state.lastError);
      return false;
    }
  }

  function resetRun(params = {}) {
    state.events = [];
    state.currentRun = {
      runId: text(params.run_id, 80) || id('run'),
      world: worldNumber(params.world),
      hero: text(params.hero, 48),
      bossReached: false,
      bossCompleted: false,
      deaths: 0,
      revives: 0
    };
  }

  function reportRun(params = {}) {
    const run = state.currentRun || {
      runId: text(params.run_id, 80) || id('run'),
      world: worldNumber(params.world),
      hero: text(params.hero, 48),
      bossReached: false,
      bossCompleted: false,
      deaths: 0,
      revives: 0
    };

    const report = {
      report_id: `run_${state.sessionId}_${run.runId}`.slice(0, 80),
      kind: 'run_summary',
      world: worldNumber(params.world) || run.world,
      hero: text(params.hero, 48) || run.hero,
      score: num(params.score),
      coins_earned: num(params.coins_earned),
      revives: num(params.revives, run.revives),
      boss_reached: run.bossReached,
      boss_completed: run.bossCompleted || params.outcome === 'victory',
      runtime_warnings: state.runtimeWarnings,
      events: state.events.slice(-MAX_EVENTS)
    };

    send(report);
    state.currentRun = null;
    state.events = [];
  }

  function reportStandalone(kind, name, params = {}) {
    send({
      kind,
      world: worldNumber(params.world),
      hero: text(params.hero, 48),
      score: num(params.score),
      coins_earned: num(params.amount ?? params.coins_earned),
      revives: num(params.revives ?? params.revive_number),
      boss_reached: name === 'boss_start' || name === 'boss_complete',
      boss_completed: name === 'boss_complete',
      events: [compactEvent(name, params)]
    });
  }

  function onTelemetry(event) {
    const detail = event?.detail || {};
    const name = text(detail.name, 64);
    const params = detail.params || {};
    if (!name) return;

    if (!state.sessionStartSent && name === 'telemetry_ready') {
      state.sessionStartSent = true;
      reportStandalone('session_start', name, params);
    }

    if (name === 'run_start') resetRun(params);
    rememberEvent(name, params);

    if (state.currentRun) {
      if (name === 'boss_start') state.currentRun.bossReached = true;
      if (name === 'boss_complete') {
        state.currentRun.bossReached = true;
        state.currentRun.bossCompleted = true;
      }
      if (name === 'death') state.currentRun.deaths = Math.max(state.currentRun.deaths, num(params.deaths, 1));
      if (name === 'revive_used') state.currentRun.revives = Math.max(state.currentRun.revives, num(params.revive_number, 1));
    }

    if (name === 'run_end') reportRun(params);
    else if (name === 'hero_purchase' || name === 'hero_unlock') reportStandalone('economy_event', name, params);
  }

  function reportBrowserError(message) {
    state.jsErrors++;
    rememberError(message);
    send({
      kind: 'runtime_error',
      world: worldNumber(window.game?.activeWorld != null ? `world_${Number(window.game.activeWorld) + 1}` : ''),
      hero: text(window.game?.activeSkin, 48),
      score: num(window.game?.score),
      events: state.events.slice(-30)
    }, { keepalive: true });
  }

  state.sessionId = getSessionId();
  window.addEventListener('ff:telemetry', onTelemetry);
  window.addEventListener('error', (event) => {
    const where = event?.filename ? ` @ ${String(event.filename).split('/').pop()}:${event.lineno || 0}` : '';
    reportBrowserError(`${event?.message || 'window.error'}${where}`);
  });
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason?.message || event?.reason || 'Unhandled promise rejection';
    reportBrowserError(`unhandledrejection: ${String(reason).slice(0, 420)}`);
  });

  window.FFWebQA = Object.freeze({
    version: VERSION,
    enabled: true,
    endpoint: ENDPOINT,
    status() {
      return {
        version: VERSION,
        sessionId: state.sessionId,
        currentRun: state.currentRun?.runId || null,
        sent: state.sent,
        failed: state.failed,
        jsErrors: state.jsErrors,
        lastError: state.lastError
      };
    },
    test() {
      return send({ kind: 'manual_test', events: [{ name: 'manual_test', at: new Date().toISOString() }] });
    }
  });

  console.log('[FeatherFury QA] web reporter active', { session: state.sessionId, version: VERSION });
})();
