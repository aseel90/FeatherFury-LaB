(() => {
  'use strict';

  if (window.PatchRunner && window.PatchRunner.version) return;

  const VERSION = '1.0.0';
  const DEFAULT_TIMEOUT = 12000;
  const DEFAULT_READY_TIMEOUT = 2500;

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const now = () => (window.performance && performance.now ? performance.now() : Date.now());

  function query() {
    try { return new URLSearchParams(window.location.search || ''); }
    catch (_) { return new URLSearchParams(); }
  }

  function boolParam(params, key) {
    const v = params.get(key);
    return v === '1' || v === 'true' || v === 'yes' || v === 'on';
  }

  function csvParam(params, key) {
    const raw = params.get(key);
    return raw ? new Set(raw.split(',').map(v => v.trim()).filter(Boolean)) : new Set();
  }

  function dispatch(name, detail) {
    try { window.dispatchEvent(new CustomEvent(`patchrunner:${name}`, { detail })); }
    catch (_) {}
  }

  function withTimeout(promise, ms, label) {
    if (!ms || ms <= 0) return promise;
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms))
    ]);
  }

  function topoSort(entries) {
    const map = new Map(entries.map(entry => [entry.id, entry]));
    const visiting = new Set();
    const visited = new Set();
    const out = [];

    function visit(entry) {
      if (visited.has(entry.id)) return;
      if (visiting.has(entry.id)) throw new Error(`Circular patch dependency at: ${entry.id}`);
      visiting.add(entry.id);
      for (const depId of entry.dependsOn || []) {
        const dep = map.get(depId);
        if (!dep) throw new Error(`Patch ${entry.id} depends on missing patch ${depId}`);
        visit(dep);
      }
      visiting.delete(entry.id);
      visited.add(entry.id);
      out.push(entry);
    }

    for (const entry of entries) visit(entry);
    return out;
  }

  class Runner {
    constructor(plan) {
      if (!plan || !Array.isArray(plan.entries)) throw new Error('PatchRunner requires plan.entries[]');
      this.plan = plan;
      this.appId = plan.appId || 'app';
      this.params = query();
      this.debug = !!plan.debug || boolParam(this.params, 'patchDebug');
      this.safeMode = boolParam(this.params, 'patchSafe') || this._storedSafeMode();
      this.skip = csvParam(this.params, 'patchSkip');
      this.only = csvParam(this.params, 'patchOnly');
      this.records = new Map();
      this.startedAt = 0;
      this.finishedAt = 0;
      this.running = false;
      this.completed = false;
      this.failed = false;
      this.context = Object.assign({ runner: this, appId: this.appId }, plan.context || {});
    }

    _safeKey() { return `patchRunner:safe:${this.appId}`; }

    _storedSafeMode() {
      try { return localStorage.getItem(this._safeKey()) === '1'; }
      catch (_) { return false; }
    }

    setSafeMode(enabled) {
      this.safeMode = !!enabled;
      try {
        if (enabled) localStorage.setItem(this._safeKey(), '1');
        else localStorage.removeItem(this._safeKey());
      } catch (_) {}
      return this.safeMode;
    }

    log(...args) {
      if (this.debug) console.log(`[PatchRunner:${this.appId}]`, ...args);
    }

    warn(...args) { console.warn(`[PatchRunner:${this.appId}]`, ...args); }
    error(...args) { console.error(`[PatchRunner:${this.appId}]`, ...args); }

    _record(entry, state, extra = {}) {
      const previous = this.records.get(entry.id) || {};
      const record = Object.assign(previous, {
        id: entry.id,
        kind: entry.kind || 'patch',
        src: entry.src || null,
        critical: !!entry.critical,
        state,
        updatedAt: Date.now()
      }, extra);
      this.records.set(entry.id, record);
      dispatch('state', { appId: this.appId, record: Object.assign({}, record) });
      return record;
    }

    _shouldSkip(entry) {
      if (entry.enabled === false) return 'disabled';
      if (this.skip.has(entry.id)) return 'query-skip';
      if (this.only.size && !this.only.has(entry.id) && entry.kind !== 'core') return 'not-in-only-list';
      if (this.safeMode && entry.kind !== 'core' && entry.safe !== true) return 'safe-mode';
      if (typeof entry.when === 'function') {
        try { if (!entry.when(this.context)) return 'condition'; }
        catch (error) {
          this.warn(`when() failed for ${entry.id}`, error);
          return 'condition-error';
        }
      }
      return null;
    }

    async _waitUntilReady(entry) {
      if (typeof entry.ready !== 'function') return true;
      const timeout = Number.isFinite(entry.readyTimeout) ? entry.readyTimeout : DEFAULT_READY_TIMEOUT;
      const interval = Number.isFinite(entry.readyInterval) ? entry.readyInterval : 50;
      const started = now();
      while (now() - started <= timeout) {
        let result = false;
        try { result = await entry.ready(this.context); }
        catch (_) { result = false; }
        if (result) return true;
        await sleep(interval);
      }
      throw new Error(`${entry.id} loaded but did not become ready within ${timeout}ms`);
    }

    _loadScript(entry) {
      return new Promise((resolve, reject) => {
        const existing = entry.reuseExisting !== false
          ? document.querySelector(`script[data-patch-runner-id="${window.CSS && CSS.escape ? CSS.escape(entry.id) : entry.id}"]`)
          : null;
        if (existing && existing.dataset.patchRunnerLoaded === '1') return resolve(existing);

        const script = existing || document.createElement('script');
        script.async = false;
        script.src = entry.src;
        script.dataset.patchRunnerId = entry.id;
        script.onload = () => {
          script.dataset.patchRunnerLoaded = '1';
          resolve(script);
        };
        script.onerror = () => reject(new Error(`Failed to load ${entry.id}: ${entry.src}`));
        if (!existing) document.head.appendChild(script);
      });
    }

    async _execute(entry) {
      if (entry.src) await this._loadScript(entry);
      if (typeof entry.install === 'function') await entry.install(this.context);
      if (!entry.src && typeof entry.install !== 'function') {
        throw new Error(`${entry.id} has neither src nor install()`);
      }
      await this._waitUntilReady(entry);
    }

    async _runEntry(entry) {
      const skipReason = this._shouldSkip(entry);
      if (skipReason) {
        this._record(entry, 'skipped', { reason: skipReason, durationMs: 0 });
        this.log('skip', entry.id, skipReason);
        return;
      }

      for (const depId of entry.dependsOn || []) {
        const dep = this.records.get(depId);
        if (!dep || dep.state !== 'loaded') {
          const message = `Dependency ${depId} not available for ${entry.id}`;
          if (entry.critical) throw new Error(message);
          this._record(entry, 'skipped', { reason: 'dependency-failed', dependency: depId, durationMs: 0 });
          this.warn(message);
          return;
        }
      }

      const attempts = Math.max(1, (entry.retries || 0) + 1);
      const started = now();
      this._record(entry, 'loading', { startedAt: Date.now(), attempts: 0 });

      let lastError;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          this.log('load', entry.id, `attempt ${attempt}/${attempts}`);
          const timeout = Number.isFinite(entry.timeout) ? entry.timeout : DEFAULT_TIMEOUT;
          await withTimeout(this._execute(entry), timeout, entry.id);
          const durationMs = Math.round(now() - started);
          this._record(entry, 'loaded', { attempts: attempt, durationMs, finishedAt: Date.now() });
          this.log('loaded', entry.id, `${durationMs}ms`);
          dispatch('loaded', { appId: this.appId, id: entry.id, durationMs });
          return;
        } catch (error) {
          lastError = error;
          this.warn(`${entry.id} attempt ${attempt} failed`, error);
          if (attempt < attempts) await sleep(entry.retryDelay || 180);
        }
      }

      const durationMs = Math.round(now() - started);
      this._record(entry, 'failed', {
        attempts,
        durationMs,
        error: String(lastError && (lastError.stack || lastError.message || lastError))
      });
      dispatch('failed', { appId: this.appId, id: entry.id, error: lastError });

      if (typeof entry.rollback === 'function') {
        try { await entry.rollback(this.context, lastError); }
        catch (rollbackError) { this.warn(`rollback failed for ${entry.id}`, rollbackError); }
      }
      if (entry.critical) throw lastError;
    }

    async run() {
      if (this.running) return this;
      if (this.completed) return this;
      this.running = true;
      this.startedAt = Date.now();
      dispatch('start', { appId: this.appId, version: VERSION, safeMode: this.safeMode });

      try {
        const ordered = topoSort(this.plan.entries);
        for (const entry of ordered) await this._runEntry(entry);
        this.completed = true;
        this.failed = false;
        this.finishedAt = Date.now();
        dispatch('complete', { appId: this.appId, status: this.status() });
        this.log('complete', this.status());
        return this;
      } catch (error) {
        this.failed = true;
        this.finishedAt = Date.now();
        this.error('critical patch failure', error);
        dispatch('critical', { appId: this.appId, error, status: this.status() });
        if (typeof this.plan.onCriticalError === 'function') {
          try { await this.plan.onCriticalError(error, this.context); }
          catch (fallbackError) { this.error('critical fallback failed', fallbackError); }
        }
        throw error;
      } finally {
        this.running = false;
      }
    }

    status() {
      return {
        version: VERSION,
        appId: this.appId,
        safeMode: this.safeMode,
        running: this.running,
        completed: this.completed,
        failed: this.failed,
        startedAt: this.startedAt,
        finishedAt: this.finishedAt,
        patches: Array.from(this.records.values()).map(record => Object.assign({}, record))
      };
    }
  }

  const API = {
    version: VERSION,
    current: null,
    create(plan) { return new Runner(plan); },
    async run(plan) {
      const runner = new Runner(plan);
      API.current = runner;
      window.__PATCH_RUNNER__ = runner;
      return runner.run();
    },
    status() { return API.current ? API.current.status() : null; },
    setSafeMode(enabled) { return API.current ? API.current.setSafeMode(enabled) : false; }
  };

  window.PatchRunner = API;
})();
