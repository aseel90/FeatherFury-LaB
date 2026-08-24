(() => {
  'use strict';

  const VERSION = '1.0.0';
  const globalState = window.__PATCH_RUNNER_STATE__ || (window.__PATCH_RUNNER_STATE__ = {
    runs: Object.create(null),
    scripts: Object.create(null)
  });

  const toList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    return String(value).split(',').map(v => v.trim()).filter(Boolean);
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, Math.max(0, ms || 0)));

  const readQuery = () => {
    try { return new URLSearchParams(window.location.search || ''); }
    catch (_) { return { get: () => null }; }
  };

  const storageKey = (appId) => `patchrunner:${appId}:disabled`;

  const readPersistedDisabled = (appId) => {
    try { return toList(localStorage.getItem(storageKey(appId))); }
    catch (_) { return []; }
  };

  const writePersistedDisabled = (appId, ids) => {
    try {
      const list = toList(ids);
      if (list.length) localStorage.setItem(storageKey(appId), list.join(','));
      else localStorage.removeItem(storageKey(appId));
      return list;
    } catch (_) { return []; }
  };

  const emit = (name, detail) => {
    try { window.dispatchEvent(new CustomEvent(name, { detail })); }
    catch (_) {}
  };

  const resolveBool = (value, fallback = false) => {
    if (typeof value === 'boolean') return value;
    if (value == null) return fallback;
    const v = String(value).toLowerCase();
    return v === '1' || v === 'true' || v === 'yes' || v === 'on';
  };

  const normalizePatch = (raw, index) => {
    const patch = raw || {};
    if (!patch.id) throw new Error(`Patch at index ${index} is missing id`);
    if (!patch.src) throw new Error(`Patch ${patch.id} is missing src`);
    return {
      id: String(patch.id),
      src: String(patch.src),
      critical: !!patch.critical,
      dependsOn: toList(patch.dependsOn),
      retries: Number.isFinite(patch.retries) ? Math.max(0, patch.retries) : 0,
      retryDelayMs: Number.isFinite(patch.retryDelayMs) ? Math.max(0, patch.retryDelayMs) : 250,
      timeoutMs: Number.isFinite(patch.timeoutMs) ? Math.max(1000, patch.timeoutMs) : 12000,
      settleMs: Number.isFinite(patch.settleMs) ? Math.max(0, patch.settleMs) : 0,
      when: typeof patch.when === 'function' ? patch.when : null,
      verify: typeof patch.verify === 'function' ? patch.verify : null,
      verifyTimeoutMs: Number.isFinite(patch.verifyTimeoutMs) ? Math.max(0, patch.verifyTimeoutMs) : 0,
      attributes: patch.attributes && typeof patch.attributes === 'object' ? patch.attributes : null,
      meta: patch.meta || null
    };
  };

  const waitForVerify = async (patch, ctx) => {
    if (!patch.verify) return true;
    const started = Date.now();
    const timeout = patch.verifyTimeoutMs;
    do {
      try {
        const result = await patch.verify(ctx);
        if (result) return true;
      } catch (_) {}
      if (!timeout) break;
      await delay(50);
    } while (Date.now() - started < timeout);
    return false;
  };

  const loadScript = (patch, debugLog) => {
    if (globalState.scripts[patch.src] === 'loaded') return Promise.resolve({ reused: true });

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      let finished = false;
      const timer = setTimeout(() => finish(new Error(`Timeout loading ${patch.id}`)), patch.timeoutMs);

      const finish = (error) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        if (error) {
          globalState.scripts[patch.src] = 'failed';
          try { script.remove(); } catch (_) {}
          reject(error);
        } else {
          globalState.scripts[patch.src] = 'loaded';
          resolve({ reused: false });
        }
      };

      script.src = patch.src;
      script.async = false;
      script.defer = false;
      script.dataset.patchRunnerId = patch.id;

      if (patch.attributes) {
        Object.keys(patch.attributes).forEach(key => {
          try {
            const value = patch.attributes[key];
            if (value != null) script.setAttribute(key, String(value));
          } catch (_) {}
        });
      }

      script.onload = () => finish();
      script.onerror = () => finish(new Error(`Failed to load ${patch.id}`));
      debugLog('loading', patch.id, patch.src);
      document.head.appendChild(script);
    });
  };

  const run = async (config) => {
    if (!config || typeof config !== 'object') throw new Error('PatchRunner config is required');

    const appId = String(config.appId || 'app');
    if (globalState.runs[appId] && globalState.runs[appId].promise) return globalState.runs[appId].promise;

    const query = readQuery();
    const debug = resolveBool(config.debug, false) || resolveBool(query.get('patchDebug'), false);
    const safeMode = resolveBool(config.safeMode, false) || resolveBool(query.get('patchSafe'), false);
    const queryDisabled = toList(query.get('patchDisable'));
    const configuredDisabled = toList(config.disabled);
    const persistedDisabled = readPersistedDisabled(appId);
    const disabled = new Set([...queryDisabled, ...configuredDisabled, ...persistedDisabled]);
    const patches = (config.patches || []).map(normalizePatch);

    const result = {
      appId,
      version: VERSION,
      startedAt: Date.now(),
      finishedAt: null,
      safeMode,
      debug,
      statuses: Object.create(null),
      order: patches.map(p => p.id),
      failedCritical: null
    };

    const log = (...args) => {
      if (debug && console && console.log) console.log('[PatchRunner]', ...args);
    };

    const setStatus = (patch, status, extra) => {
      result.statuses[patch.id] = Object.assign({
        id: patch.id,
        src: patch.src,
        status,
        critical: patch.critical,
        at: Date.now()
      }, extra || {});
      emit('patchrunner:patch', { appId, patch: result.statuses[patch.id] });
      log(status, patch.id, extra || '');
    };

    const context = {
      appId,
      config,
      result,
      getStatus: id => result.statuses[id] || null,
      isLoaded: id => !!(result.statuses[id] && result.statuses[id].status === 'loaded')
    };

    const promise = (async () => {
      emit('patchrunner:start', { appId, safeMode, debug });

      for (const patch of patches) {
        if (disabled.has(patch.id)) {
          setStatus(patch, 'skipped', { reason: 'disabled' });
          continue;
        }

        if (safeMode && !patch.critical) {
          setStatus(patch, 'skipped', { reason: 'safe-mode' });
          continue;
        }

        if (patch.when) {
          let allowed = false;
          try { allowed = !!(await patch.when(context)); }
          catch (_) { allowed = false; }
          if (!allowed) {
            setStatus(patch, 'skipped', { reason: 'condition' });
            continue;
          }
        }

        const missingDependency = patch.dependsOn.find(id => !context.isLoaded(id));
        if (missingDependency) {
          const error = new Error(`Dependency ${missingDependency} not loaded for ${patch.id}`);
          setStatus(patch, 'failed', { reason: 'dependency', error: error.message });
          if (patch.critical) {
            result.failedCritical = patch.id;
            throw error;
          }
          continue;
        }

        let loaded = false;
        let lastError = null;
        const attempts = patch.retries + 1;

        for (let attempt = 1; attempt <= attempts; attempt++) {
          try {
            setStatus(patch, 'loading', { attempt, attempts });
            await loadScript(patch, log);
            const verified = await waitForVerify(patch, context);
            if (!verified) throw new Error(`Verification failed for ${patch.id}`);
            if (patch.settleMs) await delay(patch.settleMs);
            setStatus(patch, 'loaded', { attempt, attempts });
            loaded = true;
            break;
          } catch (error) {
            lastError = error;
            log('attempt failed', patch.id, attempt, error && error.message);
            if (attempt < attempts) await delay(patch.retryDelayMs);
          }
        }

        if (!loaded) {
          setStatus(patch, 'failed', { error: lastError ? lastError.message : 'Unknown error' });
          if (patch.critical) {
            result.failedCritical = patch.id;
            throw lastError || new Error(`Critical patch failed: ${patch.id}`);
          }
        }
      }

      result.finishedAt = Date.now();
      emit('patchrunner:complete', { appId, result });
      log('complete', result);
      if (typeof config.onComplete === 'function') {
        try { await config.onComplete(result); } catch (_) {}
      }
      return result;
    })().catch(async (error) => {
      result.finishedAt = Date.now();
      result.error = error ? error.message : 'Unknown error';
      emit('patchrunner:error', { appId, result, error });
      if (typeof config.onCriticalError === 'function') {
        try { await config.onCriticalError(error, result); } catch (_) {}
      }
      throw error;
    });

    globalState.runs[appId] = { promise, result };
    return promise;
  };

  window.PatchRunner = {
    version: VERSION,
    run,
    getRun(appId) {
      const entry = globalState.runs[String(appId || 'app')];
      return entry ? entry.result : null;
    },
    getDisabled(appId) {
      return readPersistedDisabled(String(appId || 'app'));
    },
    setDisabled(appId, ids) {
      return writePersistedDisabled(String(appId || 'app'), ids);
    },
    clearDisabled(appId) {
      return writePersistedDisabled(String(appId || 'app'), []);
    },
    resetRun(appId) {
      delete globalState.runs[String(appId || 'app')];
    }
  };
})();
