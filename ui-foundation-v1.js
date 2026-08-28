(()=>{'use strict';
  if (window.FFUI?.version === '1.0.0') return;
  const root = document.documentElement;
  const listeners = new Set();
  const viewport = () => {
    const vv = window.visualViewport;
    return { width: Math.round(vv?.width || window.innerWidth || 360), height: Math.round(vv?.height || window.innerHeight || 640), scale: Number(vv?.scale || 1), portrait: (vv?.height || innerHeight) >= (vv?.width || innerWidth) };
  };
  const syncViewport = () => {
    const v = viewport();
    root.style.setProperty('--ff-runtime-vw', `${v.width}px`);
    root.style.setProperty('--ff-runtime-vh', `${v.height}px`);
    root.classList.toggle('ff-viewport-compact', v.width < 360 || v.height < 620);
    root.classList.toggle('ff-viewport-landscape', !v.portrait);
    root.classList.toggle('ff-viewport-portrait', v.portrait);
    listeners.forEach(fn => { try { fn(v); } catch (_) {} });
    return v;
  };
  const mount = target => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return null;
    el.classList.add('ff-ui-v2');
    return el;
  };
  const button = (label, opts={}) => {
    const el = document.createElement('button');
    const variant = opts.variant || 'secondary';
    el.type = opts.type || 'button';
    el.className = `ff-btn ff-btn--${variant}${opts.compact ? ' ff-btn--compact' : ''}`;
    el.textContent = label;
    if (opts.ariaLabel) el.setAttribute('aria-label', opts.ariaLabel);
    if (opts.disabled) el.disabled = true;
    if (typeof opts.onClick === 'function') el.addEventListener('click', opts.onClick);
    return el;
  };
  const panel = (opts={}) => {
    const el = document.createElement(opts.tag || 'section');
    el.className = `ff-panel${opts.className ? ` ${opts.className}` : ''}`;
    if (opts.ariaLabel) el.setAttribute('aria-label', opts.ariaLabel);
    return el;
  };
  const progress = (value=0) => {
    const wrap = document.createElement('div');
    wrap.className = 'ff-progress';
    wrap.setAttribute('role', 'progressbar');
    const fill = document.createElement('div');
    fill.className = 'ff-progress__fill';
    wrap.appendChild(fill);
    const set = next => {
      const n = Math.max(0, Math.min(1, Number(next) || 0));
      wrap.style.setProperty('--ff-progress', `${Math.round(n*100)}%`);
      wrap.setAttribute('aria-valuemin','0');
      wrap.setAttribute('aria-valuemax','100');
      wrap.setAttribute('aria-valuenow', String(Math.round(n*100)));
    };
    wrap.setProgress = set;
    set(value);
    return wrap;
  };
  const onViewport = fn => {
    if (typeof fn !== 'function') return () => {};
    listeners.add(fn);
    fn(viewport());
    return () => listeners.delete(fn);
  };
  window.FFUI = Object.freeze({ version: '1.0.0', viewport, syncViewport, onViewport, mount, button, panel, progress });
  window.addEventListener('resize', syncViewport, {passive:true});
  window.addEventListener('orientationchange', syncViewport, {passive:true});
  window.visualViewport?.addEventListener('resize', syncViewport, {passive:true});
  syncViewport();
  window.__FF_UI_FOUNDATION_V1_READY__ = true;
})();
