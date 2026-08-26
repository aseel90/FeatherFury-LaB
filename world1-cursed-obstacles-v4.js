(() => {
  'use strict';
  if (window.__FF_W1_CURSED_OBSTACLES_V4__) return;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const SOURCES = {
    top: [window.__FF_W1_CWO_TOP_A__, window.__FF_W1_CWO_TOP_B__].filter(Boolean),
    bottom: [window.__FF_W1_CWO_BOTTOM_A__, window.__FF_W1_CWO_BOTTOM_B__].filter(Boolean)
  };
  const assets = { top: [], bottom: [], ready: false, failed: false, loading: false };

  function seedForPillar(pillar) {
    return Math.abs(Math.round((pillar?.x || 0) * 17 + (pillar?.topHeight || 0) * 7 + (pillar?.width || 0) * 31));
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function preload() {
    if (assets.ready || assets.failed || assets.loading) return;
    assets.loading = true;
    try {
      const [topSettled, bottomSettled] = await Promise.all([
        Promise.allSettled(SOURCES.top.map(loadImage)),
        Promise.allSettled(SOURCES.bottom.map(loadImage))
      ]);
      assets.top = topSettled.filter(r => r.status === 'fulfilled').map(r => r.value);
      assets.bottom = bottomSettled.filter(r => r.status === 'fulfilled').map(r => r.value);
      assets.ready = assets.top.length > 0 && assets.bottom.length > 0;
      if (!assets.ready) throw new Error('No usable top/bottom obstacle image pair');
      console.log(`[FF-LAB] world1-cursed-obstacles-v4-assets-ready top=${assets.top.length} bottom=${assets.bottom.length}`);
    } catch (err) {
      assets.failed = true;
      console.warn('[FF-LAB] world1-cursed-obstacles-v4-assets-failed', err);
    } finally {
      assets.loading = false;
    }
  }

  function pick(list, pillar, salt = 0) {
    if (!list.length) return null;
    return list[(seedForPillar(pillar) + salt) % list.length];
  }

  function drawSlice(ctx, img, sy, sh, dx, dy, dw, dh) {
    if (!img || sh <= 0 || dh <= 0) return;
    ctx.drawImage(img, 0, sy, img.width, sh, dx, dy, dw, dh);
  }

  function drawTop(ctx, img, x, w, h) {
    if (!img || h <= 0) return;
    const overhang = clamp(w * 0.13, 5, 9);
    const drawW = w + overhang * 2;
    const drawX = x - overhang;

    if (h < 92) {
      ctx.drawImage(img, 0, 0, img.width, img.height, drawX, 0, drawW, h);
      return;
    }

    const srcCap = Math.round(img.height * 0.16);
    const srcTip = Math.round(img.height * 0.22);
    const srcMid = Math.max(1, img.height - srcCap - srcTip);
    const capH = Math.round(clamp(h * 0.16, 30, 58));
    const tipH = Math.round(clamp(h * 0.24, 40, 82));
    const midH = h - capH - tipH;

    if (midH < 20) {
      ctx.drawImage(img, 0, 0, img.width, img.height, drawX, 0, drawW, h);
      return;
    }

    drawSlice(ctx, img, 0, srcCap, drawX, 0, drawW, capH);
    drawSlice(ctx, img, srcCap, srcMid, drawX, capH, drawW, midH);
    drawSlice(ctx, img, img.height - srcTip, srcTip, drawX, capH + midH, drawW, tipH);
  }

  function drawBottom(ctx, img, x, w, y, h, groundY) {
    if (!img || h <= 0) return;
    const overhang = clamp(w * 0.13, 5, 9);
    const drawW = w + overhang * 2;
    const drawX = x - overhang;

    if (h < 96) {
      ctx.drawImage(img, 0, 0, img.width, img.height, drawX, y, drawW, h);
      return;
    }

    const srcTip = Math.round(img.height * 0.17);
    const srcBase = Math.round(img.height * 0.24);
    const srcMid = Math.max(1, img.height - srcTip - srcBase);
    const tipH = Math.round(clamp(h * 0.18, 30, 60));
    const baseH = Math.round(clamp(h * 0.25, 42, 90));
    const midH = h - tipH - baseH;

    if (midH < 20) {
      ctx.drawImage(img, 0, 0, img.width, img.height, drawX, y, drawW, h);
      return;
    }

    drawSlice(ctx, img, 0, srcTip, drawX, y, drawW, tipH);
    drawSlice(ctx, img, srcTip, srcMid, drawX, y + tipH, drawW, midH);
    drawSlice(ctx, img, img.height - srcBase, srcBase, drawX, groundY - baseH, drawW, baseH);
  }

  function install() {
    const game = window.game;
    if (!game || typeof game.drawPillars !== 'function') return false;
    if (game.__ffW1CursedObstaclesV4Installed) return true;

    preload();
    const priorDrawPillars = game.drawPillars.bind(game);

    game.drawPillars = function(...args) {
      if (this.activeWorld !== 0 || !this.ctx || !Array.isArray(this.pillars) || !assets.ready) {
        return priorDrawPillars(...args);
      }

      const cfg = window.CONFIG || {};
      const gap = Number(cfg.GAP_SIZE) || 154;
      const canvasH = Number(cfg.CANVAS_HEIGHT) || this.canvas?.height || 640;
      const groundH = Number(cfg.GROUND_HEIGHT) || 95;
      const groundY = canvasH - groundH;

      this.pillars.forEach((pillar) => {
        if (!pillar || pillar.smashed) return;
        const x = pillar.x;
        const w = pillar.width;
        const topH = Math.max(0, pillar.topHeight);
        const bottomY = topH + gap;
        const bottomH = Math.max(0, groundY - bottomY);

        drawTop(this.ctx, pick(assets.top, pillar), x, w, topH);
        drawBottom(this.ctx, pick(assets.bottom, pillar, 1), x, w, bottomY, bottomH, groundY);
      });
    };

    game.__ffW1CursedObstaclesV4Installed = true;
    window.__FF_W1_CURSED_OBSTACLES_V4__ = {
      version: 'world1-cursed-obstacles-v4.1',
      visual: 'image-based-cursed-woods-sprites',
      responsive: 'pillar-geometry-relative',
      variants: SOURCES.top.length + SOURCES.bottom.length,
      assetResolution: '128px-wide-webp',
      hitboxChanged: false,
      gapChanged: false,
      speedChanged: false
    };
    console.log('[FF-LAB] world1-cursed-obstacles-v4-installed');
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
