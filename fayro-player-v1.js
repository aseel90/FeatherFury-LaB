(() => {
  'use strict';

  function install() {
    const g = window.game;
    const sources = window.FAYRO_V1_FRAMES;
    if (!g || typeof window.drawBirdSkin !== 'function' || !sources?.idle || !sources?.flapUp || !sources?.flapDown || !sources?.glide) return false;
    if (g.__fayroPlayerV2Installed) return true;

    const legacyDrawBirdSkin = window.drawBirdSkin;
    const frames = {};
    let loaded = 0;
    let failed = 0;
    const keys = ['idle', 'flapUp', 'flapDown', 'glide'];

    const refreshUi = () => {
      try { g.updatePreview?.(); } catch (_) {}
      try { g.renderShop?.(); } catch (_) {}
    };

    keys.forEach(key => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        loaded += 1;
        if (loaded + failed === keys.length) refreshUi();
      };
      image.onerror = () => {
        failed += 1;
        console.warn('[FF-LAB] Fayro frame failed to decode:', key);
        if (loaded + failed === keys.length) refreshUi();
      };
      image.src = sources[key];
      frames[key] = image;
    });

    // All gameplay frames were exported at the same art scale, but their canvas
    // dimensions differ with the pose. Keep one source-pixel scale so Fayro's
    // body does not grow when gliding or shrink when flapping / entering Fury.
    const FRAME_TUNE = {
      idle:     { anchorX: 0.52, anchorY: 0.50, ox:  0.0, oy:  0.0 },
      flapUp:   { anchorX: 0.54, anchorY: 0.52, ox:  0.5, oy:  0.0 },
      flapDown: { anchorX: 0.53, anchorY: 0.49, ox:  0.0, oy: -0.5 },
      glide:    { anchorX: 0.55, anchorY: 0.50, ox:  0.0, oy:  0.0 }
    };

    const GAME_PIXEL_SCALE = 0.44;
    const UI_PIXEL_SCALE = 0.54;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const nowMs = () => (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const anim = { smoothWing: 0, lastMs: nowMs() };

    function smoothWingCycle(target) {
      const now = nowMs();
      const dt = clamp((now - anim.lastMs) / 16.667, 0.25, 3);
      anim.lastMs = now;
      const response = 1 - Math.pow(0.68, dt);
      anim.smoothWing += (target - anim.smoothWing) * response;
      if (Math.abs(anim.smoothWing) < 0.004 && Math.abs(target) < 0.004) anim.smoothWing = 0;
      return anim.smoothWing;
    }

    function feverWingCycle() {
      // Independent animation keeps Fayro alive even if game logic temporarily
      // holds wingCycle at zero during Fever transitions.
      return Math.sin(nowMs() * 0.0205);
    }

    function poseBlend(wingCycle) {
      const wc = clamp(wingCycle, -1, 1);
      if (wc >= 0) return { secondary: 'flapUp', amount: Math.pow(wc, 0.72) };
      return { secondary: 'flapDown', amount: Math.pow(-wc, 0.72) };
    }

    function drawFrame(ctx, frameKey, alpha, pixelScale, extraScale = 1, offsetX = 0, offsetY = 0) {
      const frame = frames[frameKey];
      if (!frame?.complete || !frame.naturalWidth) return false;

      const tune = FRAME_TUNE[frameKey] || FRAME_TUNE.glide;
      const s = pixelScale * extraScale;
      const drawW = frame.naturalWidth * s;
      const drawH = frame.naturalHeight * s;
      const dx = -(frame.naturalWidth * tune.anchorX) * s + tune.ox * s + offsetX;
      const dy = -(frame.naturalHeight * tune.anchorY) * s + tune.oy * s + offsetY;

      const oldAlpha = ctx.globalAlpha;
      ctx.globalAlpha = alpha;
      ctx.drawImage(frame, dx, dy, drawW, drawH);
      ctx.globalAlpha = oldAlpha;
      return true;
    }

    window.drawBirdSkin = function drawFayroOrLegacy(ctx, skinKey, x, y, rotation, wingCycle, scale = 1, inFever = false) {
      if (skinKey !== 'classic') return legacyDrawBirdSkin(ctx, skinKey, x, y, rotation, wingCycle, scale, inFever);

      const ready = keys.every(key => frames[key]?.complete && frames[key]?.naturalWidth);
      if (!ready) return legacyDrawBirdSkin(ctx, skinKey, x, y, rotation, wingCycle, scale, inFever);

      const isUiPreview = scale > 1.05;
      const safeScale = isUiPreview ? clamp(scale, 1, 1.30) : 1;
      const pixelScale = (isUiPreview ? UI_PIXEL_SCALE : GAME_PIXEL_SCALE) * safeScale;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      if (isUiPreview) {
        drawFrame(ctx, 'idle', 1, pixelScale);
        ctx.restore();
        return;
      }

      const targetWing = inFever ? feverWingCycle() : wingCycle;
      const smoothWing = smoothWingCycle(targetWing);
      const blend = poseBlend(smoothWing);
      const flapAmount = clamp(blend.amount, 0, 1);

      // During Fever, animate aura/trail separately from body size. The body
      // remains at exactly the same gameplay scale as normal flight.
      if (inFever) {
        const pulse = 0.5 + 0.5 * Math.sin(nowMs() * 0.014);
        ctx.save();
        ctx.shadowColor = '#ff6a21';
        ctx.shadowBlur = 14 + pulse * 10;
        drawFrame(ctx, 'glide', 0.16, pixelScale, 1.04, -7 - pulse * 3, 0);
        drawFrame(ctx, blend.secondary, 0.11 + flapAmount * 0.08, pixelScale, 1.03, -4, 0);
        ctx.restore();
      }

      // Cross-fade around the same anchored body center rather than snapping
      // between different-sized image boxes. This makes the flap loop smooth.
      const secondaryAlpha = clamp(flapAmount * 0.94, 0, 0.94);
      const glideAlpha = 1 - secondaryAlpha * 0.72;
      drawFrame(ctx, 'glide', glideAlpha, pixelScale);
      if (secondaryAlpha > 0.015) drawFrame(ctx, blend.secondary, secondaryAlpha, pixelScale);

      if (inFever) {
        const pulse = 0.5 + 0.5 * Math.sin(nowMs() * 0.018 + 1.2);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.10 + pulse * 0.08;
        ctx.fillStyle = '#ff7a1a';
        ctx.beginPath();
        ctx.ellipse(-5, 0, 25 + pulse * 3, 19 + pulse * 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    };

    try {
      if (typeof SKINS !== 'undefined' && SKINS.classic) {
        Object.assign(SKINS.classic, {
          name_ar: 'فايرو', name_en: 'Fayro',
          body: '#0b5fbd', wing: '#0a4b9e', belly: '#f4e3bf', beak: '#f59e0b', maskColor: '#e84420'
        });
      }
    } catch (error) {
      console.warn('[FF-LAB] Fayro skin metadata update skipped.', error);
    }

    g.__fayroPlayerV2Installed = true;
    // Keep the V1 marker for old fallback/dependency compatibility.
    g.__fayroPlayerV1Installed = true;
    g.__fayroPlayerV1Assets = frames;
    setTimeout(refreshUi, 250);
    console.log('[FF-LAB] fayro-player-v2-installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => { if (install() || ++tries > 120) clearInterval(timer); }, 80);
  setTimeout(install, 1200);
})();
