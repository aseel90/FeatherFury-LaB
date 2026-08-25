(() => {
  'use strict';

  function install() {
    const g = window.game;
    const sources = window.FAYRO_V1_FRAMES;
    if (!g || typeof window.drawBirdSkin !== 'function' || !sources?.idle || !sources?.flapUp || !sources?.flapDown || !sources?.glide) return false;
    if (g.__fayroPlayerV1Installed) return true;

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

    const chooseFrame = (wingCycle, scale, inFever) => {
      if (scale > 1.05) return frames.idle;
      if (inFever) return frames.flapUp;
      if (wingCycle > 0.32) return frames.flapUp;
      if (wingCycle < -0.32) return frames.flapDown;
      return frames.glide;
    };

    window.drawBirdSkin = function drawFayroOrLegacy(ctx, skinKey, x, y, rotation, wingCycle, scale = 1, inFever = false) {
      if (skinKey !== 'classic') return legacyDrawBirdSkin(ctx, skinKey, x, y, rotation, wingCycle, scale, inFever);

      const frame = chooseFrame(wingCycle, scale, inFever);
      if (!frame?.complete || !frame.naturalWidth) return legacyDrawBirdSkin(ctx, skinKey, x, y, rotation, wingCycle, scale, inFever);

      const height = 42 * scale;
      const width = height * (frame.naturalWidth / frame.naturalHeight);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      if (inFever) { ctx.shadowColor = '#fb5b22'; ctx.shadowBlur = 18; }
      ctx.drawImage(frame, -width * 0.47, -height * 0.52, width, height);
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

    g.__fayroPlayerV1Installed = true;
    g.__fayroPlayerV1Assets = frames;
    setTimeout(refreshUi, 250);
    console.log('[FF-LAB] fayro-player-v1-installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => { if (install() || ++tries > 120) clearInterval(timer); }, 80);
  setTimeout(install, 1200);
})();
