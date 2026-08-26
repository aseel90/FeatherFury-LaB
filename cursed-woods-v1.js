(() => {
  'use strict';

  function install() {
    const game = window.game;
    if (!game || typeof game.drawRuinsBackground !== 'function') return false;
    if (game.__cursedWoodsAtmosphereV3Installed) return true;

    // Stage 2 is the deep cursed-forest section of World 1.
    try {
      if (typeof STAGE_COLORS !== 'undefined' && STAGE_COLORS[2]) {
        STAGE_COLORS[2].top = [17, 22, 31];
        STAGE_COLORS[2].bot = [45, 31, 45];
      }
    } catch (_) {}

    const originalDrawRuinsBackground = game.drawRuinsBackground.bind(game);
    const TAU = Math.PI * 2;
    const mod = (value, size) => ((value % size) + size) % size;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const seed01 = value => {
      const n = Math.sin(value * 12.9898 + 78.233) * 43758.5453;
      return n - Math.floor(n);
    };

    function drawCrescentMoon(ctx, width, frame, depth) {
      const x = width - 68;
      const y = 88;
      const pulse = 0.92 + Math.sin(frame * 0.012) * 0.08;

      ctx.save();
      const halo = ctx.createRadialGradient(x, y, 4, x, y, 94);
      halo.addColorStop(0, `rgba(221,211,246,${0.20 * pulse})`);
      halo.addColorStop(0.38, `rgba(137,103,170,${0.10 + depth * 0.035})`);
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(Math.max(0, x - 100), 0, 180, 178);

      ctx.globalAlpha = 0.62;
      ctx.fillStyle = '#d9d4e6';
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x + 7, y - 4, 14, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    function drawSky(ctx, width, groundY, frame, depth) {
      const sky = ctx.createLinearGradient(0, 0, 0, groundY);
      sky.addColorStop(0, '#07110f');
      sky.addColorStop(0.40, '#0c1714');
      sky.addColorStop(0.76, '#151714');
      sky.addColorStop(1, '#191712');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, groundY);

      const wash = ctx.createLinearGradient(0, 90, 0, groundY);
      wash.addColorStop(0, 'rgba(91,56,107,0)');
      wash.addColorStop(0.72, `rgba(90,56,105,${0.035 + depth * 0.025})`);
      wash.addColorStop(1, `rgba(83,48,97,${0.07 + depth * 0.035})`);
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, width, groundY);

      drawCrescentMoon(ctx, width, frame, depth);
    }

    function treeProfile(index, layer) {
      const a = seed01(index * 2.113 + layer * 17.31);
      const b = seed01(index * 4.731 + layer * 9.77);
      const c = seed01(index * 7.219 + layer * 4.41);
      const d = seed01(index * 11.57 + layer * 3.19);
      return {
        height: 0.84 + a * 0.30,
        width: 0.83 + b * 0.34,
        bend: (c - 0.5) * 2,
        branchBias: d > 0.5 ? 1 : -1,
        fork: seed01(index * 15.91 + layer * 8.03),
        roots: seed01(index * 21.37 + layer * 2.67),
      };
    }

    function drawOrganicTree(ctx, x, baseY, baseHeight, baseWidth, index, layer, frame, alpha) {
      const p = treeProfile(index, layer);
      const height = baseHeight * p.height;
      const width = baseWidth * p.width;
      const topY = baseY - height;
      const layerSpeed = layer === 0 ? 0.22 : layer === 1 ? 0.34 : 0.44;
      const sway = Math.sin(frame * 0.010 * layerSpeed + index * 1.47) * (layer === 2 ? 2.6 : 1.6);
      const bend = p.bend * width * 0.25 + sway;
      const trunkColor = layer === 0 ? '#0b1813' : layer === 1 ? '#07120e' : '#040a08';

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = trunkColor;
      ctx.strokeStyle = trunkColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(x - width * 0.47, baseY);
      ctx.bezierCurveTo(
        x - width * 0.43,
        baseY - height * 0.22,
        x - width * 0.17 + bend * 0.28,
        baseY - height * 0.61,
        x + bend,
        topY
      );
      ctx.bezierCurveTo(
        x + width * 0.13 + bend * 0.48,
        topY + height * 0.18,
        x + width * 0.39 + bend * 0.16,
        baseY - height * 0.28,
        x + width * 0.41,
        baseY
      );
      ctx.closePath();
      ctx.fill();

      const jointY = baseY - height * (0.53 + p.fork * 0.10);
      const side = p.branchBias;
      const branchReach = width * (1.05 + p.fork * 0.46);
      ctx.lineWidth = Math.max(2.5, width * (layer === 2 ? 0.17 : 0.13));
      ctx.beginPath();
      ctx.moveTo(x + bend * 0.35, jointY);
      ctx.quadraticCurveTo(
        x - branchReach * 0.56,
        jointY - height * 0.10,
        x - branchReach,
        jointY - height * (0.22 + p.fork * 0.08)
      );
      ctx.moveTo(x + bend * 0.26, jointY + height * 0.055);
      ctx.quadraticCurveTo(
        x + branchReach * 0.58,
        jointY - height * 0.035,
        x + branchReach * 0.94,
        jointY - height * (0.18 + (1 - p.fork) * 0.08)
      );
      ctx.moveTo(x + bend * 0.14, jointY - height * 0.14);
      ctx.quadraticCurveTo(
        x - side * width * 0.26,
        jointY - height * 0.28,
        x - side * width * 0.05,
        jointY - height * 0.44
      );
      ctx.stroke();

      ctx.lineWidth = Math.max(1.5, width * 0.065);
      ctx.beginPath();
      ctx.moveTo(x - branchReach * 0.61, jointY - height * 0.12);
      ctx.lineTo(x - branchReach * 1.12, jointY - height * 0.16);
      ctx.moveTo(x + branchReach * 0.56, jointY - height * 0.08);
      ctx.lineTo(x + branchReach * 1.12, jointY - height * 0.13);
      if (p.fork > 0.44) {
        ctx.moveTo(x - branchReach * 0.34, jointY - height * 0.08);
        ctx.lineTo(x - branchReach * 0.48, jointY - height * 0.28);
      }
      if (p.fork < 0.67) {
        ctx.moveTo(x + branchReach * 0.35, jointY - height * 0.05);
        ctx.lineTo(x + branchReach * 0.50, jointY - height * 0.23);
      }
      ctx.stroke();

      if (layer > 0) {
        const rootReach = width * (0.65 + p.roots * 0.65);
        ctx.lineWidth = Math.max(2.2, width * 0.10);
        ctx.beginPath();
        ctx.moveTo(x - width * 0.20, baseY - 1);
        ctx.quadraticCurveTo(x - rootReach * 0.55, baseY - 8, x - rootReach, baseY + 3);
        ctx.moveTo(x + width * 0.22, baseY - 1);
        ctx.quadraticCurveTo(x + rootReach * 0.54, baseY - 7, x + rootReach * 0.95, baseY + 2);
        ctx.stroke();
      }

      if (layer === 1 && p.fork > 0.30) {
        ctx.fillStyle = 'rgba(27,48,37,.58)';
        const mossY = topY + height * 0.20;
        ctx.beginPath();
        ctx.ellipse(x + bend * 0.8 - width * 0.42, mossY, width * 0.38, width * 0.22, -0.35, 0, TAU);
        ctx.ellipse(x + bend * 0.5 + width * 0.30, mossY + 7, width * 0.42, width * 0.24, 0.25, 0, TAU);
        ctx.fill();
      }

      ctx.restore();
    }

    function drawForestLayer(ctx, width, groundY, frame, options) {
      const { spacing, speed, height, trunkWidth, layer, alpha } = options;
      const travel = frame * speed;
      const offset = mod(travel, spacing);
      const baseIndex = Math.floor(travel / spacing);
      const extra = Math.ceil(width / spacing) + 3;
      for (let i = -2; i <= extra; i++) {
        const index = baseIndex + i;
        const x = i * spacing - offset + spacing * 0.46;
        drawOrganicTree(ctx, x, groundY + 4, height, trunkWidth, index, layer, frame, alpha);
      }
    }

    function drawFogRibbon(ctx, width, y, thickness, frame, phase, alpha, speed) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#74617f';
      ctx.beginPath();
      ctx.moveTo(-40, y + thickness * 0.55);
      for (let x = -40; x <= width + 40; x += 26) {
        const wave =
          Math.sin(x * 0.022 + frame * 0.009 * speed + phase) * 7 +
          Math.cos(x * 0.014 - frame * 0.006 * speed + phase * 0.7) * 3.5;
        ctx.quadraticCurveTo(x + 13, y + wave, x + 26, y + thickness * 0.52 + wave * 0.42);
      }
      ctx.lineTo(width + 40, y + thickness);
      ctx.lineTo(-40, y + thickness);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawGroundHaze(ctx, width, groundY, frame, depth) {
      const spacing = 155;
      const travel = frame * 0.17;
      const offset = mod(travel, spacing);
      const base = Math.floor(travel / spacing);
      for (let i = -2; i <= Math.ceil(width / spacing) + 2; i++) {
        const index = base + i;
        const x = i * spacing - offset;
        const y = groundY - 67 + Math.sin(frame * 0.016 + index * 1.13) * 8;
        const fog = ctx.createRadialGradient(x + 75, y, 8, x + 75, y, 94);
        fog.addColorStop(0, `rgba(116,91,132,${0.055 + depth * 0.035})`);
        fog.addColorStop(1, 'rgba(72,57,88,0)');
        ctx.fillStyle = fog;
        ctx.fillRect(x - 24, y - 50, 205, 100);
      }
    }

    function drawHangingVines(ctx, width, frame, depth) {
      ctx.save();
      ctx.strokeStyle = `rgba(8,20,15,${0.38 + depth * 0.11})`;
      ctx.lineCap = 'round';
      const count = 6;
      for (let i = 0; i < count; i++) {
        const seed = seed01(i * 5.37 + 1.9);
        const x = 18 + i * ((width - 36) / (count - 1));
        const length = 62 + seed * 66;
        const sway = Math.sin(frame * 0.011 + i * 1.4) * 3.2;
        ctx.lineWidth = 1.6 + (i % 2) * 0.7;
        ctx.beginPath();
        ctx.moveTo(x, -4);
        ctx.bezierCurveTo(x + sway, 26, x - 5 + sway, length * 0.63, x + sway * 0.5, length);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawSporesAndEyes(ctx, width, groundY, frame, depth) {
      for (let i = 0; i < 10; i++) {
        const x = 22 + seed01(i * 7.31) * (width - 44) + Math.sin(frame * 0.012 + i) * 5;
        const y = 135 + seed01(i * 11.17) * Math.max(120, groundY - 210) + Math.cos(frame * 0.015 + i * 1.3) * 7;
        const violet = i % 3 !== 0;
        ctx.save();
        ctx.globalAlpha = (0.12 + depth * 0.12) * (0.75 + Math.sin(frame * 0.018 + i) * 0.25);
        ctx.shadowColor = violet ? '#c285e8' : '#77c99b';
        ctx.shadowBlur = 5;
        ctx.fillStyle = violet ? '#d39af0' : '#8ad7a8';
        ctx.beginPath();
        ctx.arc(x, y, 1.05 + (i % 2) * 0.35, 0, TAU);
        ctx.fill();
        ctx.restore();
      }

      const eyeSets = [
        [44, groundY - 88, 0.2],
        [width - 52, groundY - 132, 1.5],
      ];
      for (const [x, y, phase] of eyeSets) {
        const blink = (Math.sin(frame * 0.038 + phase) + 1) * 0.5 < 0.055 ? 0.18 : 1;
        ctx.save();
        ctx.globalAlpha = 0.16 + depth * 0.15;
        ctx.shadowColor = '#c77aff';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#deb0f4';
        ctx.beginPath();
        ctx.ellipse(x - 4.5, y, 1.8, 1.15 * blink, 0, 0, TAU);
        ctx.ellipse(x + 4.5, y, 1.8, 1.15 * blink, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    }

    function drawForegroundFrame(ctx, width, groundY, frame, depth) {
      const sway = Math.sin(frame * 0.008) * 2.2;
      ctx.save();
      ctx.globalAlpha = 0.48 + depth * 0.10;
      ctx.strokeStyle = '#030806';
      ctx.lineCap = 'round';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(-12, 108);
      ctx.bezierCurveTo(34, 112 + sway, 58, 78 + sway, 97, 93 + sway);
      ctx.moveTo(width + 12, 158);
      ctx.bezierCurveTo(width - 34, 151 - sway, width - 57, 120 - sway, width - 96, 136 - sway);
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(58, 92 + sway); ctx.lineTo(80, 60 + sway);
      ctx.moveTo(width - 54, 135 - sway); ctx.lineTo(width - 75, 102 - sway);
      ctx.stroke();
      ctx.restore();

      const vignette = ctx.createRadialGradient(width * 0.50, groundY * 0.46, 110, width * 0.50, groundY * 0.46, 360);
      vignette.addColorStop(0, 'rgba(4,8,7,0)');
      vignette.addColorStop(1, `rgba(2,5,4,${0.16 + depth * 0.08})`);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, groundY);
    }

    game.drawRuinsBackground = function (...args) {
      const cfg = window.CONFIG || {};
      const stage1End = Number(cfg.STAGE1_END) || 15;
      const stage2End = Number(cfg.STAGE2_END) || 35;
      const score = Number(this.score) || 0;
      const bossScene = !!this.boss?.active || ['BOSS_WARNING', 'BOSS_INTRO', 'BOSS_OUTRO', 'STORY', 'FLY_AWAY'].includes(this.state);
      const isCursedWoods = this.activeWorld === 0 && score >= stage1End && !bossScene;
      if (!isCursedWoods || !this.ctx) return originalDrawRuinsBackground(...args);

      const ctx = this.ctx;
      const width = Number(cfg.CANVAS_WIDTH) || 360;
      const height = Number(cfg.CANVAS_HEIGHT) || 640;
      const groundHeight = Number(cfg.GROUND_HEIGHT) || 95;
      const groundY = height - groundHeight;
      const frame = Number.isFinite(this.frame) ? this.frame : 0;
      const depth = clamp((score - stage1End) / Math.max(1, stage2End - stage1End), 0, 1);

      ctx.save();
      drawSky(ctx, width, groundY, frame, depth);

      drawForestLayer(ctx, width, groundY, frame, {
        spacing: 76,
        speed: 0.11,
        height: 194,
        trunkWidth: 27,
        layer: 0,
        alpha: 0.26 + depth * 0.035,
      });

      drawFogRibbon(ctx, width, 170, 44, frame, 0.35, 0.055 + depth * 0.018, 0.78);

      drawForestLayer(ctx, width, groundY, frame, {
        spacing: 132,
        speed: 0.29,
        height: 255,
        trunkWidth: 39,
        layer: 1,
        alpha: 0.46 + depth * 0.045,
      });

      drawGroundHaze(ctx, width, groundY, frame, depth);
      drawFogRibbon(ctx, width, groundY - 126, 48, frame, 1.7, 0.06 + depth * 0.025, 1.06);

      drawForestLayer(ctx, width, groundY, frame, {
        spacing: 205,
        speed: 0.47,
        height: 292,
        trunkWidth: 52,
        layer: 2,
        alpha: 0.58 + depth * 0.045,
      });

      drawHangingVines(ctx, width, frame, depth);
      drawSporesAndEyes(ctx, width, groundY, frame, depth);
      drawForegroundFrame(ctx, width, groundY, frame, depth);
      ctx.restore();
    };

    game.__cursedWoodsAtmosphereV1Installed = true;
    game.__cursedWoodsAtmosphereV2Installed = true;
    game.__cursedWoodsAtmosphereV3Installed = true;
    window.__FF_CURSED_WOODS_VISUAL_V3__ = {
      version: 'cursed-woods-visual-v3',
      source: 'Feather Fury procedural adaptation',
      gameplayGeometryChanged: false,
      seamlessParallax: true,
      layers: ['far-trees', 'high-fog', 'mid-trees', 'ground-haze', 'near-trees', 'atmosphere'],
    };
    console.log('[FF-LAB] cursed-woods-atmosphere-v3-installed');
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
