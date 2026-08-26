(() => {
  'use strict';
  if (window.__FF_W1_GROUND_GAP_POLISH_V1__) return;

  function install() {
    const game = window.game;
    const cfg = typeof CONFIG !== 'undefined' ? CONFIG : (window.CONFIG || null);
    if (!game || !game.ctx || typeof game.draw !== 'function' || !cfg) return false;
    if (game.__ffW1GroundGapPolishV1Installed) return true;

    const TAU = Math.PI * 2;
    const mod = (v, n) => ((v % n) + n) % n;
    const seed01 = n => {
      const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    // User-approved micro tune: slightly tighten World 1 obstacle opening.
    // CONFIG is the shared geometry source, so render + collision stay aligned.
    cfg.GAP_SIZE = 144;

    const priorDraw = game.draw.bind(game);

    function drawSmoothGround(g) {
      const ctx = g.ctx;
      const w = Number(cfg.CANVAS_WIDTH) || 360;
      const h = Number(cfg.CANVAS_HEIGHT) || 640;
      const groundHeight = Number(cfg.GROUND_HEIGHT) || 95;
      const gY = h - groundHeight;
      const travel = Number(g.groundOffset) || 0;

      ctx.save();

      // Opaque base fully replaces the previous ground art without changing geometry.
      const soil = ctx.createLinearGradient(0, gY, 0, h);
      soil.addColorStop(0, '#241724');
      soil.addColorStop(.24, '#171019');
      soil.addColorStop(1, '#07080c');
      ctx.fillStyle = soil;
      ctx.fillRect(0, gY, w, groundHeight);

      const topGlow = ctx.createLinearGradient(0, gY, 0, gY + 30);
      topGlow.addColorStop(0, 'rgba(126,63,144,.13)');
      topGlow.addColorStop(1, 'rgba(57,30,69,0)');
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, gY, w, 30);

      // World-space tiles: identity changes only when a tile crosses an edge.
      // No frame buckets, so there is no visual popping/judder.
      const tile = 24;
      const tileScroll = mod(travel, tile);
      const tileBase = Math.floor(travel / tile);
      for (let i = -2; i <= Math.ceil(w / tile) + 2; i++) {
        const worldIndex = tileBase + i;
        const x = i * tile - tileScroll;
        const a = seed01(worldIndex * 3.17);
        const b = seed01(worldIndex * 7.41);
        const lipY = gY + 2 + a * 2.2;

        ctx.fillStyle = b > .56 ? '#4b3446' : '#3d2a39';
        ctx.beginPath();
        ctx.moveTo(x - 1, gY + 15);
        ctx.lineTo(x, lipY + 3);
        ctx.lineTo(x + tile * .28, gY + .4 + a * 1.8);
        ctx.lineTo(x + tile * .68, gY + 1.5 + b * 2.4);
        ctx.lineTo(x + tile + 1, lipY + 4);
        ctx.lineTo(x + tile + 1, gY + 15);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(13,8,14,.72)';
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        ctx.moveTo(x + tile * .31, gY + 3);
        ctx.lineTo(x + tile * .46, gY + 8 + a * 3);
        ctx.lineTo(x + tile * .62, gY + 4);
        ctx.stroke();
      }

      // Roots are also world-space seeded, so each root keeps its shape while moving.
      const rootSpacing = 46;
      const rootScroll = mod(travel * .62, rootSpacing);
      const rootBase = Math.floor((travel * .62) / rootSpacing);
      ctx.lineCap = 'round';
      for (let i = -1; i <= Math.ceil(w / rootSpacing) + 1; i++) {
        const worldIndex = rootBase + i;
        const x = i * rootSpacing - rootScroll + 12;
        const s = seed01(worldIndex * 8.73);
        const rootLen = 25 + s * 38;
        ctx.strokeStyle = `rgba(72,41,37,${.48 + s * .16})`;
        ctx.lineWidth = 2.2 + s * 1.9;
        ctx.beginPath();
        ctx.moveTo(x, gY + 9);
        ctx.bezierCurveTo(x - 10 + s * 15, gY + rootLen * .34, x + 8 - s * 11, gY + rootLen * .70, x - 3 + s * 7, gY + rootLen);
        ctx.stroke();
      }

      // Buried stones.
      const stoneSpacing = 39;
      const stoneScroll = mod(travel * .38, stoneSpacing);
      const stoneBase = Math.floor((travel * .38) / stoneSpacing);
      for (let i = -1; i <= Math.ceil(w / stoneSpacing) + 1; i++) {
        const worldIndex = stoneBase + i;
        const x = i * stoneSpacing - stoneScroll + 8;
        const s = seed01(worldIndex * 10.91);
        const y = gY + 25 + seed01(worldIndex * 4.33) * Math.max(18, groundHeight - 38);
        ctx.fillStyle = s > .62 ? '#29212e' : '#1a171f';
        ctx.beginPath();
        ctx.ellipse(x, y, 5 + s * 8, 3 + seed01(worldIndex * 6.17) * 5, s - .5, 0, TAU);
        ctx.fill();
      }

      // Sparse purple flora attached to world-space positions.
      const floraSpacing = 74;
      const floraScroll = mod(travel * .82, floraSpacing);
      const floraBase = Math.floor((travel * .82) / floraSpacing);
      for (let i = -1; i <= Math.ceil(w / floraSpacing) + 1; i++) {
        const worldIndex = floraBase + i;
        const x = i * floraSpacing - floraScroll + 19;
        if (worldIndex % 2 === 0) {
          ctx.save();
          ctx.globalAlpha = .56;
          ctx.shadowColor = '#b950ff';
          ctx.shadowBlur = 4;
          ctx.fillStyle = '#9148bf';
          ctx.beginPath();
          ctx.moveTo(x, gY + 2);
          ctx.lineTo(x + 3, gY - 5);
          ctx.lineTo(x + 6, gY + 2);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          ctx.fillStyle = '#704086';
          ctx.fillRect(x + 2, gY - 3, 2, 5);
          ctx.beginPath();
          ctx.ellipse(x + 3, gY - 4, 4.5, 2.1, 0, Math.PI, TAU);
          ctx.fill();
        }
      }

      ctx.strokeStyle = 'rgba(143,88,135,.74)';
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(0, gY + .5);
      ctx.lineTo(w, gY + .5);
      ctx.stroke();
      ctx.restore();
    }

    game.draw = function(...args) {
      const result = priorDraw(...args);
      if (this.activeWorld === 0 && this.ctx) drawSmoothGround(this);
      return result;
    };

    game.__ffW1GroundGapPolishV1Installed = true;
    window.__FF_W1_GROUND_GAP_POLISH_V1__ = {
      version: 'world1-ground-gap-polish-v1',
      gapSize: 144,
      groundMotion: 'world-space deterministic scrolling',
      obstacleArtChanged: false,
      hitboxWidthChanged: false,
      movementModelChanged: false,
      groundHeightChanged: false,
      physicsChanged: false,
    };
    console.log('[FF-LAB] world1-ground-gap-polish-v1-installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 120) clearInterval(timer);
  }, 80);
  setTimeout(install, 900);
})();
