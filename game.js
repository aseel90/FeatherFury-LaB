(() => {
  'use strict';

  const FALLBACK_RUNTIME = 'https://cdn.jsdelivr.net/gh/aseel90/FeatherFury-LaB@5b83840d68ad65939b8efae336afd76c47b7bdc1/game.js';
  let fallbackStarted = false;

  const inject = (src, onload, onerror) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = onload || null;
    script.onerror = onerror || null;
    document.head.appendChild(script);
    return script;
  };

  const fallback = (reason) => {
    if (fallbackStarted || window.game) return;
    fallbackStarted = true;
    console.error('[FF-LAB] PatchRunner fallback:', reason || 'unknown');
    inject(FALLBACK_RUNTIME, null, () => console.error('[FF-LAB] Failed to load fallback runtime'));
  };

  window.__FF_PATCH_RUNNER_STARTED__ = true;

  inject('patch-runner/patch-runner.js?v=1', () => {
    inject('featherfury-patches.js?v=1', () => {
      if (!window.PatchRunner || !window.FEATHERFURY_PATCH_PLAN) {
        fallback('runner-or-manifest-missing');
        return;
      }

      window.PatchRunner.run(window.FEATHERFURY_PATCH_PLAN)
        .then(result => {
          window.__FF_PATCH_RUNNER_RESULT__ = result;
          if (result.debug) console.log('[FF-LAB] PatchRunner ready', result);
        })
        .catch(error => {
          console.error('[FF-LAB] PatchRunner critical failure', error);
          fallback(error && error.message ? error.message : 'critical-failure');
        });
    }, () => fallback('manifest-load-failed'));
  }, () => fallback('runner-load-failed'));

  setTimeout(() => {
    if (!window.game) fallback('startup-timeout');
  }, 25000);
})();
