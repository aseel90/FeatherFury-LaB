(() => {
  'use strict';
  if (window.__FF_W1_CLASSIC_ENHANCED_BG_V1__) return;

  function install() {
    const game = window.game;
    const cfg = typeof CONFIG !== 'undefined' ? CONFIG : (window.CONFIG || null);
    if (!game || !cfg || typeof game.drawRuinsBackground !== 'function') return false;
    if (game.__ffW1ClassicEnhancedBgV1Installed) return true;

    const prior = game.drawRuinsBackground.bind(game);
    const TAU = Math.PI * 2;
    const mod = (v, n) => ((v % n) + n) % n;
    const seed01 = n => {
      const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    function drawBranchTree(ctx, x, baseY, height, width, seed, alpha, bossScene, deep) {
      const bend = (seed01(seed * 3.7) - .5) * 24;
      const topY = baseY - height;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const trunk = bossScene ? '#120f16' : (deep ? '#17161d' : '#202027');
      ctx.strokeStyle = trunk;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x, baseY + 5);
      ctx.bezierCurveTo(x - bend * .15, baseY - height * .34, x + bend * .55, baseY - height * .70, x + bend, topY + 18);
      ctx.stroke();

      const crownX = x + bend;
      const branches = 4;
      ctx.lineWidth = Math.max(3, width * .34);
      for (let i = 0; i < branches; i++) {
        const s = seed01(seed * 11.3 + i * 7.2);
        const side = i % 2 ? 1 : -1;
        const by = topY + 28 + i * 17;
        const len = 28 + s * 34;
        ctx.beginPath();
        ctx.moveTo(crownX - bend * .15, by + 20);
        ctx.quadraticCurveTo(crownX + side * len * .42, by - 10 - s * 15, crownX + side * len, by - 18 - s * 18);
        ctx.stroke();
      }

      const leafA = bossScene ? 'rgba(30,20,30,.68)' : (deep ? 'rgba(24,48,42,.62)' : 'rgba(35,70,54,.56)');
      const leafB = bossScene ? 'rgba(42,22,37,.52)' : (deep ? 'rgba(29,64,52,.48)' : 'rgba(49,91,66,.44)');
      for (let i = 0; i < 5; i++) {
        const s = seed01(seed * 17.1 + i * 5.4);
        const angle = -2.7 + i * 1.08;
        const r = 17 + s * 12;
        const lx = crownX + Math.cos(angle) * (18 + s * 15);
        const ly = topY + 20 + Math.sin(angle) * 13 + i * 3;
        ctx.fillStyle = i % 2 ? leafB : leafA;
        ctx.beginPath();
        ctx.arc(lx, ly, r, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawEyes(ctx, width, groundY, frame, score, bossScene) {
      const stage1 = Number(cfg.STAGE1_END) || 15;
      const intensity = bossScene ? 1 : Math.min(1, Math.max(0, (score - 5) / Math.max(1, stage1)));
      const spacing = 118;
      const travel = frame * .19;
      const offset = mod(travel, spacing);
      const base = Math.floor(travel / spacing);
      ctx.save();
      for (let i = -1; i <= Math.ceil(width / spacing) + 1; i++) {
        const idx = base + i;
        const chance = seed01(idx * 9.31);
        if (chance < .48) continue;
        const x = i * spacing - offset + 32 + seed01(idx * 4.7) * 42;
        const y = groundY - 112 - seed01(idx * 6.2) * 145;
        const blink = Math.sin(frame * .055 + idx * 1.7) > -.84 ? 1 : .12;
        const a = (.20 + intensity * .24) * blink;
        ctx.shadowColor = bossScene ? 'rgba(255,65,80,.8)' : 'rgba(192,105,255,.75)';
        ctx.shadowBlur = bossScene ? 5 : 4;
        ctx.fillStyle = bossScene ? `rgba(255,68,78,${a})` : `rgba(205,125,255,${a})`;
        ctx.beginPath(); ctx.ellipse(x, y, 2.4, 1.35, 0, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + 8, y, 2.4, 1.35, 0, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }

    function drawFog(ctx, width, groundY, frame, score, bossScene) {
      const stage1 = Number(cfg.STAGE1_END) || 15;
      const deep = score >= stage1;
      ctx.save();

      const haze = ctx.createLinearGradient(0, groundY - 160, 0, groundY + 6);
      haze.addColorStop(0, 'rgba(255,255,255,0)');
      haze.addColorStop(.52, bossScene ? 'rgba(42,17,25,.08)' : (deep ? 'rgba(110,104,145,.09)' : 'rgba(190,205,215,.07)'));
      haze.addColorStop(1, bossScene ? 'rgba(18,8,12,.26)' : 'rgba(32,38,48,.18)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, groundY - 165, width, 170);

      const drift = frame * .22;
      for (let i = 0; i < 7; i++) {
        const x = mod(i * 92 - drift * (i % 2 ? .42 : .28), width + 150) - 75;
        const y = groundY - 32 - (i % 3) * 18;
        const rx = 70 + (i % 2) * 26;
        const ry = 18 + (i % 3) * 5;
        ctx.fillStyle = bossScene ? 'rgba(55,24,32,.065)' : (deep ? 'rgba(155,150,175,.055)' : 'rgba(218,226,232,.05)');
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    game.drawRuinsBackground = function(...args) {
      if (this.activeWorld !== 0 || !this.ctx) return prior(...args);

      const ctx = this.ctx;
      const width = Number(cfg.CANVAS_WIDTH) || 360;
      const height = Number(cfg.CANVAS_HEIGHT) || 640;
      const groundY = height - (Number(cfg.GROUND_HEIGHT) || 95);
      const score = Number(this.score) || 0;
      const stage1 = Number(cfg.STAGE1_END) || 15;
      const deep = score >= stage1;
      const bossScene = !!this.boss?.active || ['BOSS_WARNING','BOSS_INTRO','BOSS_OUTRO','FLY_AWAY','STORY'].includes(this.state);
      const frame = Number(this.frame) || 0;

      ctx.save();

      const farTravel = frame * .15;
      const farSpacing = 180;
      const farOffset = mod(farTravel, farSpacing);
      const farBase = Math.floor(farTravel / farSpacing);
      ctx.fillStyle = bossScene ? 'rgba(20,18,24,.34)' : (deep ? 'rgba(32,38,48,.28)' : 'rgba(52,68,78,.24)');
      for (let i = -2; i <= Math.ceil(width / farSpacing) + 2; i++) {
        const idx = farBase + i;
        const x = i * farSpacing - farOffset;
        const top = groundY - 120 - seed01(idx * 4.2) * 30;
        ctx.fillRect(x + 22, top, 132, 9);
        ctx.beginPath();
        ctx.moveTo(x + 14, top);
        ctx.lineTo(x + 88, top - 29);
        ctx.lineTo(x + 162, top);
        ctx.closePath();
        ctx.fill();
        for (let c = 0; c < 5; c++) ctx.fillRect(x + 30 + c * 25, top + 9, 7, groundY - (top + 9));
      }

      const farTreeSpacing = 82;
      const farTreeTravel = frame * .24;
      const farTreeOffset = mod(farTreeTravel, farTreeSpacing);
      const farTreeBase = Math.floor(farTreeTravel / farTreeSpacing);
      for (let i = -2; i <= Math.ceil(width / farTreeSpacing) + 2; i++) {
        const idx = farTreeBase + i;
        const x = i * farTreeSpacing - farTreeOffset + 20;
        drawBranchTree(ctx, x, groundY, 150 + seed01(idx * 3.4) * 60, 8 + seed01(idx * 8.2) * 4, idx + 120, bossScene ? .34 : .27, bossScene, deep);
      }

      drawEyes(ctx, width, groundY, frame, score, bossScene);

      const nearSpacing = 155;
      const nearTravel = frame * .52;
      const nearOffset = mod(nearTravel, nearSpacing);
      const nearBase = Math.floor(nearTravel / nearSpacing);
      for (let i = -2; i <= Math.ceil(width / nearSpacing) + 2; i++) {
        const idx = nearBase + i;
        const x = i * nearSpacing - nearOffset + 25 + seed01(idx * 5.8) * 28;
        drawBranchTree(ctx, x, groundY, 205 + seed01(idx * 2.9) * 75, 12 + seed01(idx * 7.7) * 5, idx + 710, bossScene ? .62 : .50, bossScene, deep);
      }

      drawFog(ctx, width, groundY, frame, score, bossScene);
      ctx.restore();
    };

    game.__ffW1ClassicEnhancedBgV1Installed = true;
    window.__FF_W1_CLASSIC_ENHANCED_BG_V1__ = {
      version: 'world1-classic-enhanced-background-v1',
      skyOwner: 'stable runtime dynamic stage gradient',
      additions: ['classic ruins','layered trees','watching eyes','rolling fog'],
      stagePaletteRestored: true,
      bossPaletteRestored: true,
      opaqueSkyRemoved: true,
      renderer: 'Canvas 2D'
    };
    console.log('[FF-LAB] world1-classic-enhanced-background-v1-installed');
    return true;
  }

  let tries = 0;
  if (install()) return;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 180) clearInterval(timer);
  }, 50);
})();
