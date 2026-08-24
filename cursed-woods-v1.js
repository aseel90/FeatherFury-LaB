(() => {
  function install() {
    const game = window.game;
    if (!game || typeof game.drawRuinsBackground !== 'function') return false;
    if (game.__cursedWoodsAtmosphereV1Installed) return true;

    // Stage 2 should read as a cursed forest, not a fire world.
    try {
      if (typeof STAGE_COLORS !== 'undefined' && STAGE_COLORS[2]) {
        STAGE_COLORS[2].top = [44, 28, 58];
        STAGE_COLORS[2].bot = [92, 48, 66];
      }
    } catch (_) {}

    const originalDrawRuinsBackground = game.drawRuinsBackground.bind(game);

    game.drawRuinsBackground = function () {
      const isCursedWoods = this.activeWorld === 0 && this.score >= CONFIG.STAGE1_END && !this.boss.active && this.state !== 'BOSS_INTRO' && this.state !== 'BOSS_OUTRO' && this.state !== 'STORY' && this.state !== 'FLY_AWAY';
      if (!isCursedWoods) return originalDrawRuinsBackground();

      const ctx = this.ctx;
      const groundY = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT;
      ctx.save();

      // Far layer: ruined temple silhouettes swallowed by the forest.
      const farOffset = (this.frame * 0.10) % 220;
      ctx.fillStyle = 'rgba(28, 24, 40, .54)';
      for (let x = -220; x < CONFIG.CANVAS_WIDTH + 220; x += 150) {
        const rx = x - farOffset;
        ctx.beginPath();
        ctx.moveTo(rx, groundY - 122);
        ctx.lineTo(rx + 72, groundY - 158);
        ctx.lineTo(rx + 144, groundY - 122);
        ctx.closePath();
        ctx.fill();
        for (let c = 0; c < 4; c++) ctx.fillRect(rx + 22 + c * 29, groundY - 121, 8, 121);
      }

      // Purple low fog between the far ruins and trees.
      const fogOffset = (this.frame * 0.18) % 180;
      for (let i = -1; i < 4; i++) {
        const fx = i * 150 - fogOffset;
        const fy = groundY - 105 + Math.sin((this.frame + i * 47) * 0.015) * 9;
        const fog = ctx.createRadialGradient(fx + 70, fy, 8, fx + 70, fy, 92);
        fog.addColorStop(0, 'rgba(126, 93, 145, .15)');
        fog.addColorStop(1, 'rgba(84, 62, 106, 0)');
        ctx.fillStyle = fog;
        ctx.fillRect(fx - 30, fy - 55, 210, 110);
      }

      // Mid layer: crooked dead trunks and broken stone markers.
      const midOffset = (this.frame * 0.34) % 125;
      for (let x = -125; x < CONFIG.CANVAS_WIDTH + 125; x += 82) {
        const mx = x - midOffset;
        const seed = Math.sin((x + 37) * 12.17) * 999;
        const r = seed - Math.floor(seed);
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

        // Sparse twisted branches.
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

      // Near layer: dark cursed tree canopies, intentionally less saturated than Ruins.
      const nearSpacing = 108;
      const nearOffset = (this.frame * 0.62) % nearSpacing;
      for (let x = -nearSpacing * 2; x < CONFIG.CANVAS_WIDTH + nearSpacing * 2; x += nearSpacing) {
        const tx = x - nearOffset;
        const index = Math.floor((x + this.frame * .62) / nearSpacing);
        const seed = Math.sin(index * 71.9) * 1000;
        const r = seed - Math.floor(seed);
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

      // Thin drifting mist streaks to separate gameplay silhouettes from scenery.
      ctx.lineCap = 'round';
      for (let i = 0; i < 7; i++) {
        const y = 145 + ((i * 71 + this.frame * .28) % 330);
        const x = ((i * 83 - this.frame * .46) % 430) - 70;
        ctx.strokeStyle = `rgba(191, 169, 202, ${0.045 + (i % 3) * 0.018})`;
        ctx.lineWidth = 2 + (i % 2);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 34 + (i % 3) * 13, y);
        ctx.stroke();
      }

      // Subtle vignette makes the woods feel enclosed without hiding obstacles.
      const vignette = ctx.createRadialGradient(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT * .48, 120, CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT * .48, 390);
      vignette.addColorStop(0, 'rgba(21, 15, 28, 0)');
      vignette.addColorStop(1, 'rgba(18, 11, 23, .22)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, groundY);

      ctx.restore();
    };

    game.__cursedWoodsAtmosphereV1Installed = true;
    console.log('[FF-LAB] cursed-woods-atmosphere-v1-installed');
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
