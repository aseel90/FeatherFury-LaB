(() => {
  'use strict';
  if (window.__FF_W1_GROUND_OBSTACLE_POLISH_V2__) return;

  function install() {
    const game = window.game;
    const cfg = typeof CONFIG !== 'undefined' ? CONFIG : (window.CONFIG || null);
    if (!game || !cfg || !game.ctx || typeof game.draw !== 'function' || typeof game.update !== 'function') return false;
    if (game.__ffW1GroundObstaclePolishV2Installed) return true;

    const TAU = Math.PI * 2;
    const WRAP = 24;
    const GAP = 144;
    const W1_SPAWN_NORMAL = 112;
    const mod = (v, n) => ((v % n) + n) % n;
    const seed01 = n => {
      const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    cfg.GAP_SIZE = GAP;

    const priorDraw = game.draw.bind(game);
    const priorUpdate = game.update.bind(game);
    const scrollState = { travel: 0, lastWrapped: null, lastFrame: null };
    let earlyIndex = 0;

    function continuousTravel(g) {
      const frame = Number(g.frame) || 0;
      const wrapped = mod(Number(g.groundOffset) || 0, WRAP);
      if (scrollState.lastWrapped == null || scrollState.lastFrame == null || frame < scrollState.lastFrame) {
        scrollState.travel = wrapped;
        scrollState.lastWrapped = wrapped;
        scrollState.lastFrame = frame;
        return scrollState.travel;
      }
      let delta = wrapped - scrollState.lastWrapped;
      if (delta < -WRAP * .5) delta += WRAP;
      else if (delta > WRAP * .5) delta -= WRAP;
      if (delta >= 0 && delta < 12) scrollState.travel += delta;
      scrollState.lastWrapped = wrapped;
      scrollState.lastFrame = frame;
      return scrollState.travel;
    }

    function tuneEarlyPillar(p, g) {
      if (!p || p.__ffW1EarlyHeightV2 || (Number(g.score) || 0) >= (Number(cfg.STAGE1_END) || 15)) return;
      const groundY = (Number(cfg.CANVAS_HEIGHT) || 640) - (Number(cfg.GROUND_HEIGHT) || 95);
      const minSeg = 106;
      const lo = minSeg;
      const hi = Math.max(lo, groundY - GAP - minSeg);
      const pattern = [.20, .67, .36, .78, .27, .58, .43, .72];
      const t = pattern[earlyIndex % pattern.length];
      earlyIndex++;
      const top = Math.round(lo + (hi - lo) * t);
      p.topHeight = top;
      p.gapY = top + GAP * .5;
      if ('__ffCwoV5BaseTop' in p) p.__ffCwoV5BaseTop = top;
      p.__ffW1EarlyHeightV2 = true;

      if (Array.isArray(g.coins)) {
        const cx = Number(p.x) + (Number(p.width) || 18) * .5;
        let best = null, bestD = 999;
        for (const c of g.coins) {
          const d = Math.abs((Number(c.x) || 0) - cx);
          if (!c.collected && d < bestD) { best = c; bestD = d; }
        }
        if (best && bestD < 8) best.y = p.gapY;
      }
    }

    game.update = function(...args) {
      const isW1 = this.activeWorld === 0;
      const before = isW1 && Array.isArray(this.pillars) ? new Set(this.pillars) : null;
      const oldSpawn = cfg.SPAWN_NORMAL;
      if (isW1) cfg.SPAWN_NORMAL = W1_SPAWN_NORMAL;
      let result;
      try {
        result = priorUpdate(...args);
      } finally {
        if (isW1) cfg.SPAWN_NORMAL = oldSpawn;
      }
      if (isW1 && Array.isArray(this.pillars)) {
        for (const p of this.pillars) if (!before || !before.has(p)) tuneEarlyPillar(p, this);
        if ((Number(this.frame) || 0) < 3) earlyIndex = 0;
      }
      return result;
    };

    function drawSmoothGround(g) {
      const ctx = g.ctx;
      const w = Number(cfg.CANVAS_WIDTH) || 360;
      const h = Number(cfg.CANVAS_HEIGHT) || 640;
      const groundHeight = Number(cfg.GROUND_HEIGHT) || 95;
      const gY = h - groundHeight;
      const travel = continuousTravel(g);

      ctx.save();
      const soil = ctx.createLinearGradient(0, gY, 0, h);
      soil.addColorStop(0, '#241724');
      soil.addColorStop(.24, '#171019');
      soil.addColorStop(1, '#07080c');
      ctx.fillStyle = soil;
      ctx.fillRect(0, gY, w, groundHeight);

      const topGlow = ctx.createLinearGradient(0, gY, 0, gY + 30);
      topGlow.addColorStop(0, 'rgba(126,63,144,.12)');
      topGlow.addColorStop(1, 'rgba(57,30,69,0)');
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, gY, w, 30);

      const tile = 24;
      const tileScroll = mod(travel, tile);
      const tileBase = Math.floor(travel / tile);
      for (let i = -2; i <= Math.ceil(w / tile) + 2; i++) {
        const idx = tileBase + i;
        const x = i * tile - tileScroll;
        const a = seed01(idx * 3.17), b = seed01(idx * 7.41);
        ctx.fillStyle = b > .56 ? '#4b3446' : '#3d2a39';
        ctx.beginPath();
        ctx.moveTo(x - 1, gY + 15);
        ctx.lineTo(x, gY + 4 + a * 2);
        ctx.lineTo(x + tile * .28, gY + .5 + a * 1.7);
        ctx.lineTo(x + tile * .68, gY + 1.5 + b * 2.2);
        ctx.lineTo(x + tile + 1, gY + 5 + b * 1.5);
        ctx.lineTo(x + tile + 1, gY + 15);
        ctx.closePath(); ctx.fill();
      }

      const rootSpacing = 48;
      const rootTravel = travel * .62;
      const rootOffset = mod(rootTravel, rootSpacing);
      const rootBase = Math.floor(rootTravel / rootSpacing);
      ctx.lineCap = 'round';
      for (let i = -1; i <= Math.ceil(w / rootSpacing) + 1; i++) {
        const idx = rootBase + i;
        const x = i * rootSpacing - rootOffset + 10;
        const s = seed01(idx * 8.73);
        const len = 24 + s * 36;
        ctx.strokeStyle = `rgba(72,41,37,${.48 + s * .15})`;
        ctx.lineWidth = 2.2 + s * 1.8;
        ctx.beginPath();
        ctx.moveTo(x, gY + 8);
        ctx.bezierCurveTo(x - 9 + s * 14, gY + len * .35, x + 8 - s * 10, gY + len * .72, x - 3 + s * 7, gY + len);
        ctx.stroke();
      }

      const stoneSpacing = 42;
      const stoneTravel = travel * .38;
      const stoneOffset = mod(stoneTravel, stoneSpacing);
      const stoneBase = Math.floor(stoneTravel / stoneSpacing);
      for (let i = -1; i <= Math.ceil(w / stoneSpacing) + 1; i++) {
        const idx = stoneBase + i;
        const x = i * stoneSpacing - stoneOffset + 7;
        const s = seed01(idx * 10.91);
        const y = gY + 25 + seed01(idx * 4.33) * Math.max(18, groundHeight - 38);
        ctx.fillStyle = s > .62 ? '#29212e' : '#1a171f';
        ctx.beginPath();
        ctx.ellipse(x, y, 5 + s * 8, 3 + seed01(idx * 6.17) * 5, s - .5, 0, TAU);
        ctx.fill();
      }

      const floraSpacing = 78;
      const floraTravel = travel * .82;
      const floraOffset = mod(floraTravel, floraSpacing);
      const floraBase = Math.floor(floraTravel / floraSpacing);
      for (let i = -1; i <= Math.ceil(w / floraSpacing) + 1; i++) {
        const idx = floraBase + i;
        const x = i * floraSpacing - floraOffset + 17;
        if (idx % 2 === 0) {
          ctx.save();
          ctx.globalAlpha = .52;
          ctx.shadowColor = '#b950ff'; ctx.shadowBlur = 4;
          ctx.fillStyle = '#9148bf';
          ctx.beginPath(); ctx.moveTo(x, gY + 2); ctx.lineTo(x + 3, gY - 5); ctx.lineTo(x + 6, gY + 2); ctx.closePath(); ctx.fill();
          ctx.restore();
        } else {
          ctx.fillStyle = '#704086';
          ctx.fillRect(x + 2, gY - 3, 2, 5);
          ctx.beginPath(); ctx.ellipse(x + 3, gY - 4, 4.5, 2.1, 0, Math.PI, TAU); ctx.fill();
        }
      }

      ctx.strokeStyle = 'rgba(143,88,135,.72)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(0, gY + .5); ctx.lineTo(w, gY + .5); ctx.stroke();
      ctx.restore();
    }

    function redrawDialogueOverlay(g) {
      const ctx = g.ctx;
      const width = Number(cfg.CANVAS_WIDTH) || 360;
      const height = Number(cfg.CANVAS_HEIGHT) || 640;
      const boxW = width - 24;
      const boxH = 145;
      const boxX = 12;
      const boxY = height - boxH - 15;
      const r = 14;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.985)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(boxX, boxY, boxW, boxH, r);
      else ctx.rect(boxX, boxY, boxW, boxH);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(boxX + 4, boxY + 4, boxW - 8, boxH - 8, r - 3);
      else ctx.rect(boxX + 4, boxY + 4, boxW - 8, boxH - 8);
      ctx.stroke();

      ctx.font = 'bold 13.5px "Tajawal", "Changa", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      let curY = boxY + 28;
      if (g.storyText1 && typeof g.drawWrappedDialogueText === 'function') {
        curY = g.drawWrappedDialogueText(ctx, g.storyText1, width / 2, curY, boxW - 20, 20);
      }
      if (g.storyText2 && typeof g.drawWrappedDialogueText === 'function') {
        curY += 4;
        curY = g.drawWrappedDialogueText(ctx, g.storyText2, width / 2, curY, boxW - 20, 20);
      }

      if (g.storyCompleted) {
        ctx.font = 'bold 12.5px "Tajawal", "Changa", sans-serif';
        ctx.fillStyle = '#f1c40f';
        const dict = typeof I18N !== 'undefined' ? I18N[g.lang] : null;
        const actionText = g.state === 'STORY'
          ? (dict?.tapToLaunch || (g.lang === 'en' ? 'Tap to launch' : 'اضغط للانطلاق'))
          : (dict?.tapToContinue || (g.lang === 'en' ? 'Tap to continue' : 'اضغط للمتابعة'));
        if (Math.sin((Number(g.frame) || 0) * .1) > 0) ctx.fillText(actionText, width / 2, boxY + boxH - 12);
      }
      ctx.restore();
    }

    game.draw = function(...args) {
      const result = priorDraw(...args);
      if (this.activeWorld === 0 && this.ctx) {
        const dialogueScene = this.state === 'STORY' || this.state === 'BOSS_INTRO' || this.state === 'BOSS_OUTRO';
        drawSmoothGround(this);
        if (dialogueScene) redrawDialogueOverlay(this);
      }
      return result;
    };

    game.__ffW1GroundObstaclePolishV2Installed = true;
    window.__FF_W1_GROUND_OBSTACLE_POLISH_V2__ = {
      version: 'world1-ground-obstacle-polish-v2.2',
      gapSize: GAP,
      horizontalSpacingTuned: true,
      spawnNormal: W1_SPAWN_NORMAL,
      earlyHeightPattern: true,
      groundMotion: 'unwrapped continuous distance from wrapped groundOffset',
      obstacleArtChanged: false,
      hitboxWidthChanged: false,
      groundHeightChanged: false,
      birdPhysicsChanged: false,
      dialogueLayerSafe: true,
      dialogueFinalPass: true
    };
    console.log('[FF-LAB] world1-ground-obstacle-polish-v2-installed');
    return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 180) clearInterval(timer);
  }, 50);
})();