(() => {
  'use strict';
  if (window.__FF_W1_CURSED_OBSTACLES_V5__) return;

  const CFG = window.CONFIG || {};
  const HITBOX_W = 18;
  const VISUAL_W = 78;
  const MIN_SEGMENT_H = 104;
  const MOVE_AMPLITUDE = 8;
  const MOVE_SPEED = 0.034;

  const SOURCES = {
    top: window.__FF_W1_CWO_TOP_A__ || null,
    bottom: window.__FF_W1_CWO_BOTTOM_A__ || null
  };

  const assets = {
    top: null,
    bottom: null,
    topCrop: null,
    bottomCrop: null,
    ready: false,
    loading: false,
    failed: false
  };

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      if (!src) return reject(new Error('missing image source'));
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('image decode failed'));
      img.src = src;
    });
  }

  function alphaBounds(img, threshold = 18) {
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { x: 0, y: 0, w: img.width, h: img.height };
    ctx.drawImage(img, 0, 0);
    let data;
    try {
      data = ctx.getImageData(0, 0, img.width, img.height).data;
    } catch (_) {
      return { x: 0, y: 0, w: img.width, h: img.height };
    }
    let minX = img.width, minY = img.height, maxX = -1, maxY = -1;
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        if (data[(y * img.width + x) * 4 + 3] > threshold) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < minX || maxY < minY) return { x: 0, y: 0, w: img.width, h: img.height };
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  }

  async function preload() {
    if (assets.ready || assets.loading || assets.failed) return;
    assets.loading = true;
    try {
      const [top, bottom] = await Promise.all([loadImage(SOURCES.top), loadImage(SOURCES.bottom)]);
      assets.top = top;
      assets.bottom = bottom;
      assets.topCrop = alphaBounds(top);
      assets.bottomCrop = alphaBounds(bottom);
      assets.ready = true;
      console.log('[FF-LAB] world1-cursed-obstacles-v5-assets-ready');
    } catch (err) {
      assets.failed = true;
      console.warn('[FF-LAB] world1-cursed-obstacles-v5-assets-failed', err);
    } finally {
      assets.loading = false;
    }
  }

  function pillarSeed(p) {
    if (p.__ffCwoSeed != null) return p.__ffCwoSeed;
    const center = (p.x || 0) + (p.width || 60) * 0.5;
    const seed = Math.abs(Math.round(center * 19 + (p.topHeight || 0) * 11));
    p.__ffCwoSeed = seed;
    return seed;
  }

  function normalizePillar(p, game) {
    if (!p || p.smashed) return;
    const gap = Number(CFG.GAP_SIZE) || 154;
    const groundY = (Number(CFG.CANVAS_HEIGHT) || 640) - (Number(CFG.GROUND_HEIGHT) || 95);
    const maxTop = groundY - gap - MIN_SEGMENT_H;

    if (!p.__ffCwoV5Normalized) {
      const originalW = Number(p.width) || 60;
      const center = Number(p.x) + originalW * 0.5;
      const wasMoving = Math.abs(Number(p.vy) || 0) > 0.0001;
      p.x = center - HITBOX_W * 0.5;
      p.width = HITBOX_W;
      p.__ffCwoV5Normalized = true;
      p.__ffCwoV5Moving = wasMoving;
      p.__ffCwoV5Phase = (pillarSeed(p) % 360) * Math.PI / 180;
      const safeLo = MIN_SEGMENT_H + (wasMoving ? MOVE_AMPLITUDE : 0);
      const safeHi = maxTop - (wasMoving ? MOVE_AMPLITUDE : 0);
      p.__ffCwoV5BaseTop = clamp(Number(p.topHeight) || safeLo, safeLo, Math.max(safeLo, safeHi));
    } else if (Math.abs(Number(p.vy) || 0) > 0.0001) {
      p.__ffCwoV5Moving = true;
      p.vy = 0;
    }

    if (p.__ffCwoV5Moving) {
      const base = clamp(p.__ffCwoV5BaseTop, MIN_SEGMENT_H + MOVE_AMPLITUDE, maxTop - MOVE_AMPLITUDE);
      p.topHeight = base + Math.sin((game.frame || 0) * MOVE_SPEED + p.__ffCwoV5Phase) * MOVE_AMPLITUDE;
    } else {
      p.topHeight = clamp(Number(p.topHeight) || MIN_SEGMENT_H, MIN_SEGMENT_H, maxTop);
      p.__ffCwoV5BaseTop = p.topHeight;
    }
    p.gapY = p.topHeight + gap * 0.5;
    p.vy = 0;
  }

  function drawSlice(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (!img || sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0) return;
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  function drawTop(ctx, x, hitW, h) {
    if (!assets.top || !assets.topCrop || h <= 0) return;
    const b = assets.topCrop;
    const centerX = x + hitW * 0.5;
    const drawX = centerX - VISUAL_W * 0.5;
    const safeBottom = b.y + Math.max(1, Math.floor(b.h * 0.87));
    const srcH = safeBottom - b.y;
    const capSrcH = Math.min(54, Math.floor(srcH * 0.24));
    const tipSrcH = Math.min(104, Math.floor(srcH * 0.42));
    const midSrcY = b.y + capSrcH;
    const midSrcH = Math.max(1, srcH - capSrcH - tipSrcH);

    const capH = Math.min(40, Math.max(28, h * 0.18));
    const tipH = Math.min(62, Math.max(44, h * 0.26));
    const midH = Math.max(0, h - capH - tipH);

    if (midH < 8) {
      drawSlice(ctx, assets.top, b.x, b.y, b.w, srcH, drawX, 0, VISUAL_W, h);
      return;
    }
    drawSlice(ctx, assets.top, b.x, b.y, b.w, capSrcH, drawX, 0, VISUAL_W, capH);
    drawSlice(ctx, assets.top, b.x, midSrcY, b.w, midSrcH, drawX, capH, VISUAL_W, midH);
    drawSlice(ctx, assets.top, b.x, safeBottom - tipSrcH, b.w, tipSrcH, drawX, h - tipH, VISUAL_W, tipH);
  }

  function drawBottom(ctx, x, hitW, y, h, groundY) {
    if (!assets.bottom || !assets.bottomCrop || h <= 0) return;
    const b = assets.bottomCrop;
    const centerX = x + hitW * 0.5;
    const drawX = centerX - VISUAL_W * 0.5;
    const safeTop = b.y + Math.min(Math.floor(b.h * 0.14), 36);
    const safeBottom = b.y + b.h;
    const srcH = Math.max(1, safeBottom - safeTop);
    const tipSrcH = Math.min(96, Math.floor(srcH * 0.42));
    const baseSrcH = Math.min(74, Math.floor(srcH * 0.30));
    const midSrcY = safeTop + tipSrcH;
    const midSrcH = Math.max(1, srcH - tipSrcH - baseSrcH);

    const tipH = Math.min(60, Math.max(42, h * 0.25));
    const baseH = Math.min(58, Math.max(42, h * 0.22));
    const midH = Math.max(0, h - tipH - baseH);

    if (midH < 8) {
      drawSlice(ctx, assets.bottom, b.x, safeTop, b.w, srcH, drawX, y, VISUAL_W, h);
      return;
    }
    drawSlice(ctx, assets.bottom, b.x, safeTop, b.w, tipSrcH, drawX, y, VISUAL_W, tipH);
    drawSlice(ctx, assets.bottom, b.x, midSrcY, b.w, midSrcH, drawX, y + tipH, VISUAL_W, midH);
    drawSlice(ctx, assets.bottom, b.x, safeBottom - baseSrcH, b.w, baseSrcH, drawX, groundY - baseH, VISUAL_W, baseH);
  }

  function install() {
    const game = window.game;
    if (!game || typeof game.drawPillars !== 'function' || typeof game.update !== 'function') return false;
    if (game.__ffW1CursedObstaclesV5Installed) return true;

    preload();
    const priorDrawPillars = game.drawPillars.bind(game);
    const priorUpdate = game.update.bind(game);

    game.update = function(...args) {
      let existing = null;
      if (this.activeWorld === 0 && Array.isArray(this.pillars)) {
        existing = new Set(this.pillars);
        this.pillars.forEach(p => normalizePillar(p, this));
      }
      const result = priorUpdate(...args);
      if (this.activeWorld === 0 && Array.isArray(this.pillars)) {
        this.pillars.forEach(p => {
          if (!existing || !existing.has(p)) normalizePillar(p, this);
        });
      }
      return result;
    };

    game.drawPillars = function(...args) {
      if (this.activeWorld !== 0 || !this.ctx || !Array.isArray(this.pillars) || !assets.ready) {
        return priorDrawPillars(...args);
      }
      const gap = Number(CFG.GAP_SIZE) || 154;
      const groundY = (Number(CFG.CANVAS_HEIGHT) || 640) - (Number(CFG.GROUND_HEIGHT) || 95);
      this.pillars.forEach(p => {
        if (!p || p.smashed) return;
        const topH = p.topHeight;
        const bottomY = topH + gap;
        const bottomH = Math.max(0, groundY - bottomY);
        drawTop(this.ctx, p.x, p.width, topH);
        drawBottom(this.ctx, p.x, p.width, bottomY, bottomH, groundY);
      });
    };

    game.__ffW1CursedObstaclesV5Installed = true;
    window.__FF_W1_CURSED_OBSTACLES_V5__ = {
      version: 'world1-cursed-obstacles-v5',
      visualPair: 'top-a + bottom-a only',
      hitboxWidth: HITBOX_W,
      visualWidth: VISUAL_W,
      minSegmentHeight: MIN_SEGMENT_H,
      movement: 'stable sinusoidal, render and collision share topHeight',
      responsive: 'logical 360x640 world units; CSS scaling independent',
      fixes: ['stable sprite identity','trim transparent padding','gap-edge crop','ground anchor','fair collision core','smooth moving obstacles']
    };
    console.log('[FF-LAB] world1-cursed-obstacles-v5-installed');
    return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => {
    tries += 1;
    preload();
    if (install() || tries > 180) clearInterval(timer);
  }, 50);
})();