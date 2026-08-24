(() => {
  function install() {
    const game = window.game;
    if (!game || typeof game.drawRuinsBackground !== 'function') return false;
    if (game.__cursedWoodsAtmosphereV2Installed) return true;

    // Stage 2 should read as a cursed forest, not a fire world.
    try {
      if (typeof STAGE_COLORS !== 'undefined' && STAGE_COLORS[2]) {
        STAGE_COLORS[2].top = [44, 28, 58];
        STAGE_COLORS[2].bot = [92, 48, 66];
      }
    } catch (_) {}

    const originalDrawRuinsBackground = game.drawRuinsBackground.bind(game);
    const positiveMod = (value, size) => ((value % size) + size) % size;
    const seed01 = value => {
      const n = Math.sin(value * 12.9898 + 78.233) * 43758.5453;
      return n - Math.floor(n);
    };

    game.drawRuinsBackground = function () {
      const isCursedWoods = this.activeWorld === 0 && this.score >= CONFIG.STAGE1_END && !this.boss.active && this.state !== 'BOSS_INTRO' && this.state !== 'BOSS_OUTRO' && this.state !== 'STORY' && this.state !== 'FLY_AWAY';
      if (!isCursedWoods) return originalDrawRuinsBackground();

      const ctx = this.ctx;
      const groundY = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT;
      const width = CONFIG.CANVAS_WIDTH;
      const frame = Number.isFinite(this.frame) ? this.frame : 0;
      ctx.save();

      // Seamless parallax rule:
      // every layer wraps by its exact spacing and derives variants from an absolute
      // tile index. Nothing changes identity when the local offset wraps back to zero.

      // Far layer: ruined temple silhouettes swallowed by the forest.
      const farSpacing = 150;
      const farTravel = frame * 0.10;
      const farOffset = positiveMod(farTravel, farSpacing);
      const farBase = Math.floor(farTravel / farSpacing);
      ctx.fillStyle = 'rgba(28, 24, 40, .54)';
      for (let i = -2; i <= Math.ceil(width / farSpacing) + 2; i++) {
        const tileIndex = farBase + i;
        const rx = i * farSpacing - farOffset;
        const variation = seed01(tileIndex * 1.17);
        const roofLift = 30 + variation * 13;
        ctx.beginPath();
        ctx.moveTo(rx, groundY - 122);
        ctx.lineTo(rx + 72, groundY - 122 - roofLift);
        ctx.lineTo(rx + 144, groundY - 122);
        ctx.closePath();
        ctx.fill();
        const columnHeight = 112 + variation * 12;
        for (let c = 0; c < 4; c++) {
          ctx.fillRect(rx + 22 + c * 29, groundY - columnHeight, 8, columnHeight);
        }
      }

      // Purple low fog between far ruins and trees. Exact 150px wrap prevents a snap.
      const fogSpacing = 150;
      const fogTravel = frame * 0.18;
      const fogOffset = positiveMod(fogTravel, fogSpacing);
      const fogBase = Math.floor(fogTravel / fogSpacing);
      for (let i = -2; i <= Math.ceil(width / fogSpacing) + 2; i++) {
        const tileIndex = fogBase + i;
        const fx = i * fogSpacing - fogOffset;
        const phase = tileIndex * 0.91;
        const fy = groundY - 105 + Math.sin(frame * 0.015 + phase) * 9;
        const fog = ctx.createRadialGradient(fx + 70, fy, 8, fx + 70, fy, 92);
        fog.addColorStop(0, 'rgba(126, 93, 145, .15)');
        fog.addColorStop(1, 'rgba(84, 62, 106, 0)');
        ctx.fillStyle = fog;
        ctx.fillRect(fx - 30, fy - 55, 210, 110);
      }

      // Mid layer: crooked dead trunks and broken stone markers.
      const midSpacing = 82;
      const midTravel = frame * 0.34;
      const midOffset = positiveMod(midTravel, midSpacing);
      const midBase = Math.floor(midTravel / midSpacing);
      for (let i = -2; i <= Math.ceil(width / midSpacing) + 2; i++) {
        const tileIndex = midBase + i;
        const mx = i * midSpacing - midOffset;
        const r = seed01(tileIndex * 2.31);
        const h = 78 + r * 78;

        ctx.fillStyle = 'rgba(20, 18, 27, .92)';
        ctx.beginPath();
        ctx.moveTo(mx + 11, groundY);
        ctx.lineTo(mx + 15, groundY - h * .48);
        ctx.lineTo(mx + 8, groundY - h * .70);
        ctx.lineTo(mx + 19, groundY - h);
        ctx.lineTo(mx + 28, groundY - h * .72);
        ctx.lineTo(mx + 22, groundY - h * .46);
        ctx.lineTo(mx + 30, groundY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(24, 20, 30, .94)';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(mx + 17, groundY - h * .60);
        ctx.lineTo(mx - 2, groundY - h * .76);
        ctx.lineTo(mx - 8, groundY - h * .88);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mx + 21, groundY - h * .52);
        ctx.lineTo(mx + 38, groundY - h * .68);
        ctx.lineTo(mx + 43, groundY - h * .80);
        ctx.stroke();
      }

      // Near layer: stable tree identity across wrap. This was the most visible snap.
      const nearSpacing = 108;
      const nearTravel = frame * 0.62;
      const nearOffset = positiveMod(nearTravel, nearSpacing);
      const nearBase = Math.floor(nearTravel / nearSpacing);
      for (let i = -2; i <= Math.ceil(width / nearSpacing) + 2; i++) {
        const tileIndex = nearBase + i;
        const tx = i * nearSpacing - nearOffset;
        const r = seed01(tileIndex * 3.73);
        const h = 92 + r * 38;
        const topY = groundY - h;

        ctx.fillStyle = '#19151d';
        ctx.beginPath();
        ctx.moveTo(tx + 12, groundY);
        ctx.quadraticCurveTo(tx + 18, groundY - h * .54, tx + 20, topY + 25);
        ctx.lineTo(tx + 27, topY + 25);
        ctx.quadraticCurveTo(tx + 22, groundY - h * .50, tx + 31, groundY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = r > .5 ? '#263b32' : '#2c3833';
        ctx.beginPath(); ctx.arc(tx + 8, topY + 26, 22, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(tx + 27, topY + 18, 27, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(tx + 48, topY + 29, 20, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(111, 93, 124, .14)';
        ctx.beginPath(); ctx.arc(tx + 25, topY + 13, 13, 0, Math.PI * 2); ctx.fill();
      }

      // Thin drifting mist streaks. Positive modulo avoids the negative-modulo jump.
      ctx.lineCap = 'round';
      const mistPeriod = 500;
      for (let i = 0; i < 7; i++) {
        const y = 145 + positiveMod(i * 71 + frame * .28, 330);
        const x = positiveMod(i * 83 - frame * .46 + 70, mistPeriod) - 70;
        ctx.strokeStyle = `rgba(191, 169, 202, ${0.045 + (i % 3) * 0.018})`;
        ctx.lineWidth = 2 + (i % 2);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 34 + (i % 3) * 13, y);
        ctx.stroke();
      }

      const vignette = ctx.createRadialGradient(width / 2, CONFIG.CANVAS_HEIGHT * .48, 120, width / 2, CONFIG.CANVAS_HEIGHT * .48, 390);
      vignette.addColorStop(0, 'rgba(21, 15, 28, 0)');
      vignette.addColorStop(1, 'rgba(18, 11, 23, .22)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, groundY);

      ctx.restore();
    };

    // Keep the old flag for compatibility with any older checks, and expose V2.
    game.__cursedWoodsAtmosphereV1Installed = true;
    game.__cursedWoodsAtmosphereV2Installed = true;
    console.log('[FF-LAB] cursed-woods-atmosphere-v2-installed');
    return true;
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    if (install() || attempts > 50) clearInterval(timer);
  }, 100);

  setTimeout(install, 700);
  setTimeout(install, 1500);
})();
