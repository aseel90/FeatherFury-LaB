(() => {
  'use strict';
  if (window.__FF_RUNTIME_CONFIG_BRIDGE_V1__) return;
  if (typeof CONFIG === 'undefined') {
    console.error('[FeatherFury] runtime config bridge: CONFIG is unavailable');
    return;
  }
  window.CONFIG = CONFIG;
  window.__FF_RUNTIME_CONFIG_BRIDGE_V1__ = true;
  console.log('[FeatherFury] runtime config bridge ready');
})();
