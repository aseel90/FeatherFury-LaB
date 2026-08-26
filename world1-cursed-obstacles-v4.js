(() => {
  'use strict';

  if (window.__FF_W1_CURSED_OBSTACLES_V4__) return;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const TOP_KEYS = ['__FF_W1_CWO_TOP_A__', '__FF_W1_CWO_TOP_B__'];
  const BOTTOM_KEYS = ['__FF_W1_CWO_BOTTOM_A__', '__FF_W1_CWO_BOTTOM_B__'];

  const assetState = {
    loading: false,
    ready: false,
    failed: false,
    top: [],
    bottom: []
  };

  function seedForPillar(pillar) {
    const x = Math.round((pillar?.x || 0) * 17);
    const th = Math.round((pillar?.topHeight || 0) * 7);
    const w = Math.round((pillar?.width || 0) * 31);
    return Math.abs(x + th + w);
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      if (!src) return reject(new Error('missing embedded obstacle asset'));
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function ensureAssets() {
    if (assetState.ready || assetState.loading || assetState.failed) return;
    assetState.loading = true;
    try {
      const topSources = TOP_KEYS.map(key => window[key]);
      const bottomSources = BOTTOM_KEYS.map(key => window[key]);
      assetState.top = await Promise.all(topSources.map(loadImage));
      assetState.bottom = await Promise.all(bottomSources.map(loadImage));
      assetState.ready = assetState.top.length === TOP_KEYS.length && assetState.bottom.length === BOTTOM_KEYS.length;
      console.log('[FF-LAB] world1-cursed-obstacles-v4 assets ready');
    } catch (err) {
      assetState.failed = true;
      console.warn('[FF-LAB] world1-cursed-obstacles-v4 assets failed to load', err);
    } finally {
      assetState.loading = false;
    }
  }

  function chooseTopImage(pillar) {
    const seed = seedForPillar(pillar);
    return assetState.top[seed % assetState.top.length];
  }

  function chooseBottomImage(pillar) {
    const seed = seedForPillar(pillar);
    return assetState.bottom[(Math.floor(seed / 3)) % assetState.bottom.length];
  }

  function drawSlice(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (!img || sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0) return;
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  function drawThreeSlice(ctx, img, dx, dy, dw, dh, topRatio, bottomRatio) {
    if (!img || dh <= 0 || dw <= 0) return;

    const srcTop = Math.max(1, Math.round(img.height * topRatio));
    const srcBottom = Math.max(1, Math.round(img.height * bottomRatio));
    const srcMid = Math.max(1, img.height - srcTop - srcBottom);
    const naturalScale = dw / img.width;
    let dstTop = srcTop * naturalScale;
    let dstBottom = srcBottom * naturalScale;

    const capTotal = dstTop + dstBottom;
    const maxCapTotal = Math.max(4, dh * 0.68);
    if (capTotal > maxCapTotal) {
      const capScale = maxCapTotal / capTotal;
      dstTop *= capScale;
      dstBottom *= capScale;
    }

    const dstMid = Math.max(0, dh - dstTop - dstBottom);
    drawSlice(ctx, img, 0, 0, img.width, srcTop, dx, dy, dw, dstTop);
    if (dstMid > 0.5) {
      drawSlice(ctx, img, 0, srcTop, img.width, srcMid, dx, dy + dstTop, dw, dstMid);
    }
    drawSlice(ctx, img, 0, img.height - srcBottom, img.width, srcBottom, dx, dy + dh - dstBottom, dw, dstBottom);
  }

  function drawTopObstacle(ctx, img, x, w, h) {
    if (!img || h <= 0) return;
    const drawW = Math.round(clamp(w + 18, w + 10, 100));
    const drawX = Math.round(x - (drawW - w) * 0.5);
    drawThreeSlice(ctx, img, drawX, 0, drawW, h, 0.24, 0.30);
  }

  function drawBottomObstacle(ctx, img, x, groundY, w, h) {
    if (!img || h <= 0) return;
    const drawW = Math.round(clamp(w + 18, w + 10, 102));
    const drawX = Math.round(x - (drawW - w) * 0.5);
    const drawY = Math.round(groundY - h);
    drawThreeSlice(ctx, img, drawX, drawY, drawW, h, 0.28, 0.27);
  }

  function install() {
    const game = window.game;
    if (!game || typeof game.drawPillars !== 'function') return false;
    if (game.__ffW1CursedObstaclesV4Installed) return true;

    ensureAssets();

    const priorDrawPillars = game.drawPillars.bind(game);
    game.drawPillars = function(...args) {
      if (this.activeWorld !== 0 || !this.ctx || !Array.isArray(this.pillars) || !assetState.ready) {
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

        drawTopObstacle(this.ctx, chooseTopImage(pillar), x, w, topH);
        drawBottomObstacle(this.ctx, chooseBottomImage(pillar), x, groundY, w, bottomH);
      });
    };

    game.__ffW1CursedObstaclesV4Installed = true;
    window.__FF_W1_CURSED_OBSTACLES_V4__ = {
      version: 'world1-cursed-obstacles-v4',
      type: 'embedded-image-cursed-woods-obstacles',
      topVariants: TOP_KEYS.length,
      bottomVariants: BOTTOM_KEYS.length,
      rendering: 'vertical-three-slice-preserve-art-edges',
      fallback: 'previous-drawPillars-until-assets-ready',
      hitboxChanged: false,
      speedChanged: false,
      gapChanged: false
    };
    console.log('[FF-LAB] world1-cursed-obstacles-v4-installed');
    return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => {
    tries += 1;
    ensureAssets();
    if (install() || tries > 180) clearInterval(timer);
  }, 50);
})();