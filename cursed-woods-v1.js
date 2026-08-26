(() => {
  'use strict';

  function install() {
    const game = window.game;
    if (!game || typeof game.drawRuinsBackground !== 'function') return false;
    if (game.__cursedWoodsAtmosphereV4Installed) return true;

    // World 1 / Stage 2 palette. Visual only; gameplay geometry is untouched.
    try {
      if (typeof STAGE_COLORS !== 'undefined' && STAGE_COLORS[2]) {
        STAGE_COLORS[2].top = [13, 13, 27];
        STAGE_COLORS[2].bot = [54, 31, 62];
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
      const x = 74;
      const y = 104;
      const pulse = 0.94 + Math.sin(frame * 0.010) * 0.06;

      ctx.save();
      const halo = ctx.createRadialGradient(x, y, 5, x, y, 108);
      halo.addColorStop(0, `rgba(224,218,249,${0.22 * pulse})`);
      halo.addColorStop(0.36, `rgba(145,111,184,${0.11 + depth * 0.025})`);
      halo.addColorStop(1, 'rgba(61,34,79,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, Math.min(width, 190), 210);

      ctx.globalAlpha = 0.72;
      ctx.fillStyle = '#ded9e9';
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x + 8, y - 5, 17, 0, TAU);
      ctx.fill();
      ctx.restore();

      // Thin cloud wisps crossing the moon keep it embedded in the forest rather than pasted on top.
      ctx.save();
      ctx.globalAlpha = 0.12 + depth * 0.025;
      ctx.strokeStyle = '#9a82ad';
      ctx.lineCap = 'round';
      ctx.lineWidth = 5;
      const drift = mod(frame * 0.035, width + 160) - 80;
      ctx.beginPath();
      ctx.moveTo(drift - 75, 116);
      ctx.bezierCurveTo(drift - 16, 106, drift + 22, 126, drift + 88, 113);
      ctx.stroke();
      ctx.globalAlpha *= 0.62;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width - drift - 112, 149);
      ctx.bezierCurveTo(width - drift - 56, 139, width - drift - 12, 157, width - drift + 52, 146);
      ctx.stroke();
      ctx.restore();
    }

    function drawSky(ctx, width, groundY, frame, depth) {
      const sky = ctx.createLinearGradient(0, 0, 0, groundY);
      sky.addColorStop(0, '#080a16');
      sky.addColorStop(0.34, '#151020');
      sky.addColorStop(0.70, '#25162f');
      sky.addColorStop(1, '#35203d');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, groundY);

      const curseWash = ctx.createLinearGradient(0, 85, 0, groundY);
      curseWash.addColorStop(0, 'rgba(117,73,139,0)');
      curseWash.addColorStop(0.55, `rgba(104,62,125,${0.035 + depth * 0.018})`);
      curseWash.addColorStop(1, `rgba(126,68,142,${0.085 + depth * 0.035})`);
      ctx.fillStyle = curseWash;
      ctx.fillRect(0, 0, width, groundY);

      // Subtle horizontal atmospheric bands add depth without competing with gameplay objects.
      ctx.save();
      ctx.globalAlpha = 0.055 + depth * 0.015;
      ctx.strokeStyle = '#9c72aa';
      ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const y = 180 + i * 82 + Math.sin(frame * 0.004 + i * 1.7) * 5;
        const slide = mod(frame * (0.018 + i * 0.004) + i * 57, 130);
        ctx.lineWidth = i % 2 ? 2 : 3;
        ctx.beginPath();
        ctx.moveTo(-80 + slide, y);
        ctx.lineTo(34 + slide, y);
        ctx.moveTo(118 + slide, y + 9);
        ctx.lineTo(242 + slide, y + 9);
        ctx.moveTo(290 + slide, y - 5);
        ctx.lineTo(width + 80, y - 5);
        ctx.stroke();
      }
      ctx.restore();

      drawCrescentMoon(ctx, width, frame, depth);
    }

    function treeProfile(index, layer) {
      const a = seed01(index * 2.113 + layer * 17.31);
      const b = seed01(index * 4.731 + layer * 9.77);
      const c = seed01(index * 7.219 + layer * 4.41);
      const d = seed01(index * 11.57 + layer * 3.19);
      return {
        height: 0.84 + a * 0.31,
        width: 0.84 + b * 0.30,
        bend: (c - 0.5) * 2,
        branchBias: d > 0.5 ? 1 : -1,
        fork: seed01(index * 15.91 + layer * 8.03),
        roots: seed01(index * 21.37 + layer * 2.67),
        crown: seed01(index * 27.41 + layer * 5.17),
        curse: seed01(index * 31.73 + layer * 6.11),
      };
    }

    function drawCanopyCluster(ctx, x, y, radius, index, layer, alpha) {
      const crownColor = layer === 0 ? '#111823' : layer === 1 ? '#0b1018' : '#070a0e';
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = crownColor;
      const count = layer === 0 ? 6 : 7;
      for (let i = 0; i < count; i++) {
        const s = seed01(index * 18.1 + i * 9.37 + layer * 2.7);
        const t = seed01(index * 22.7 + i * 5.13 + layer * 7.9);
        const angle = (i / count) * TAU + s * 0.55;
        const reach = radius * (0.27 + t * 0.28);
        const rx = radius * (0.52 + s * 0.34);
        const ry = radius * (0.27 + t * 0.23);
        ctx.beginPath();
        ctx.ellipse(
          x + Math.cos(angle) * reach,
          y + Math.sin(angle) * reach * 0.50,
          rx,
          ry,
          (s - 0.5) * 0.55,
          0,
          TAU
        );
        ctx.fill();
      }
      ctx.restore();
    }

    function drawOrganicTree(ctx, x, baseY, baseHeight, baseWidth, index, layer, frame, alpha, depth) {
      const p = treeProfile(index, layer);
      const height = baseHeight * p.height;
      const width = baseWidth * p.width;
      const topY = baseY - height;
      const layerSpeed = layer === 0 ? 0.20 : layer === 1 ? 0.31 : 0.40;
      const sway = Math.sin(frame * 0.008 * layerSpeed + index * 1.47) * (layer === 2 ? 2.0 : 1.25);
      const bend = p.bend * width * 0.25 + sway;
      const trunkColor = layer === 0 ? '#0e1420' : layer === 1 ? '#090d14' : '#05070b';

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = trunkColor;
      ctx.strokeStyle = trunkColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(x - width * 0.50, baseY);
      ctx.bezierCurveTo(
        x - width * 0.49,
        baseY - height * 0.22,
        x - width * 0.16 + bend * 0.30,
        baseY - height * 0.62,
        x + bend,
        topY
      );
      ctx.bezierCurveTo(
        x + width * 0.15 + bend * 0.50,
        topY + height * 0.17,
        x + width * 0.44 + bend * 0.16,
        baseY - height * 0.27,
        x + width * 0.43,
        baseY
      );
      ctx.closePath();
      ctx.fill();

      const jointY = baseY - height * (0.51 + p.fork * 0.11);
      const side = p.branchBias;
      const branchReach = width * (1.18 + p.fork * 0.52);
      ctx.lineWidth = Math.max(3.2, width * (layer === 2 ? 0.19 : 0.145));
      ctx.beginPath();
      ctx.moveTo(x + bend * 0.35, jointY);
      ctx.quadraticCurveTo(
        x - branchReach * 0.58,
        jointY - height * 0.10,
        x - branchReach,
        jointY - height * (0.23 + p.fork * 0.08)
      );
      ctx.moveTo(x + bend * 0.25, jointY + height * 0.052);
      ctx.quadraticCurveTo(
        x + branchReach * 0.60,
        jointY - height * 0.045,
        x + branchReach * 0.98,
        jointY - height * (0.19 + (1 - p.fork) * 0.08)
      );
      ctx.moveTo(x + bend * 0.12, jointY - height * 0.12);
      ctx.quadraticCurveTo(
        x - side * width * 0.30,
        jointY - height * 0.29,
        x - side * width * 0.07,
        jointY - height * 0.46
      );
      ctx.stroke();

      // Secondary crooked branches avoid the simple Y-shaped silhouette seen in the early version.
      ctx.lineWidth = Math.max(1.8, width * 0.070);
      ctx.beginPath();
      ctx.moveTo(x - branchReach * 0.59, jointY - height * 0.12);
      ctx.quadraticCurveTo(x - branchReach * 0.82, jointY - height * 0.22, x - branchReach * 1.18, jointY - height * 0.18);
      ctx.moveTo(x + branchReach * 0.56, jointY - height * 0.085);
      ctx.quadraticCurveTo(x + branchReach * 0.80, jointY - height * 0.19, x + branchReach * 1.18, jointY - height * 0.14);
      ctx.moveTo(x - width * 0.17, jointY - height * 0.25);
      ctx.quadraticCurveTo(x - width * 0.78, jointY - height * 0.34, x - width * 1.12, jointY - height * 0.43);
      ctx.moveTo(x + width * 0.08, jointY - height * 0.30);
      ctx.quadraticCurveTo(x + width * 0.66, jointY - height * 0.40, x + width * 0.93, jointY - height * 0.50);
      ctx.stroke();

      const crownY = topY + height * (0.17 + p.crown * 0.05);
      const crownRadius = width * (1.18 + p.crown * 0.46);
      drawCanopyCluster(ctx, x + bend * 0.72, crownY, crownRadius, index, layer, layer === 2 ? 0.56 : 0.72);
      drawCanopyCluster(ctx, x - branchReach * 0.70, jointY - height * 0.23, crownRadius * 0.62, index + 101, layer, layer === 2 ? 0.42 : 0.58);
      drawCanopyCluster(ctx, x + branchReach * 0.72, jointY - height * 0.19, crownRadius * 0.58, index + 203, layer, layer === 2 ? 0.40 : 0.56);

      if (layer > 0) {
        const rootReach = width * (0.76 + p.roots * 0.72);
        ctx.lineWidth = Math.max(2.6, width * 0.11);
        ctx.beginPath();
        ctx.moveTo(x - width * 0.20, baseY - 1);
        ctx.quadraticCurveTo(x - rootReach * 0.52, baseY - 9, x - rootReach, baseY + 3);
        ctx.moveTo(x + width * 0.22, baseY - 1);
        ctx.quadraticCurveTo(x + rootReach * 0.55, baseY - 8, x + rootReach * 0.96, baseY + 2);
        ctx.moveTo(x, baseY - 2);
        ctx.quadraticCurveTo(x + side * rootReach * 0.34, baseY - 12, x + side * rootReach * 0.63, baseY + 3);
        ctx.stroke();
      }

      // A restrained purple curse seam ties background trees to the approved obstacle art.
      if (layer === 2 && p.curse > 0.68) {
        ctx.save();
        ctx.globalAlpha = 0.11 + depth * 0.06;
        ctx.strokeStyle = '#a65ed1';
        ctx.shadowColor = '#9e52ca';
        ctx.shadowBlur = 5;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x + width * 0.04, baseY - height * 0.20);
        ctx.lineTo(x - width * 0.08, baseY - height * 0.31);
        ctx.lineTo(x + width * 0.08, baseY - height * 0.40);
        ctx.lineTo(x - width * 0.02, baseY - height * 0.49);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }

    function drawForestLayer(ctx, width, groundY, frame, depth, options) {
      const { spacing, speed, height, trunkWidth, layer, alpha, offsetSeed = 0 } = options;
      const travel = frame * speed;
      const offset = mod(travel, spacing);
      const baseIndex = Math.floor(travel / spacing) + offsetSeed;
      const extra = Math.ceil(width / spacing) + 3;
      for (let i = -2; i <= extra; i++) {
        const index = baseIndex + i;
        const x = i * spacing - offset + spacing * (0.40 + seed01(index * 4.1) * 0.18);
        drawOrganicTree(ctx, x, groundY + 5, height, trunkWidth, index, layer, frame, alpha, depth);
      }
    }

    function drawDistantCanopyWall(ctx, width, groundY, frame, depth) {
      const speed = 0.055;
      const spacing = 48;
      const travel = frame * speed;
      const offset = mod(travel, spacing);
      const baseIndex = Math.floor(travel / spacing);
      const ridgeY = groundY - 150;

      ctx.save();
      ctx.globalAlpha = 0.20 + depth * 0.035;
      ctx.fillStyle = '#101220';
      ctx.beginPath();
      ctx.moveTo(-30, groundY);
      ctx.lineTo(-30, ridgeY + 26);
      for (let i = -2; i <= Math.ceil(width / spacing) + 2; i++) {
        const index = baseIndex + i;
        const x = i * spacing - offset;
        const y = ridgeY - seed01(index * 5.29) * 46;
        const r = 28 + seed01(index * 7.13) * 25;
        ctx.quadraticCurveTo(x + spacing * 0.25, y - r * 0.25, x + spacing * 0.50, y);
        ctx.quadraticCurveTo(x + spacing * 0.74, y + r * 0.22, x + spacing, ridgeY + seed01(index * 9.11) * 18);
      }
      ctx.lineTo(width + 40, groundY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawFogRibbon(ctx, width, y, thickness, frame, phase, alpha, speed, color = '#82698d') {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-40, y + thickness * 0.55);
      for (let x = -40; x <= width + 40; x += 26) {
        const wave =
          Math.sin(x * 0.022 + frame * 0.008 * speed + phase) * 7 +
          Math.cos(x * 0.014 - frame * 0.005 * speed + phase * 0.7) * 3.5;
        ctx.quadraticCurveTo(x + 13, y + wave, x + 26, y + thickness * 0.52 + wave * 0.42);
      }
      ctx.lineTo(width + 40, y + thickness);
      ctx.lineTo(-40, y + thickness);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawGroundHaze(ctx, width, groundY, frame, depth) {
      const spacing = 138;
      const travel = frame * 0.14;
      const offset = mod(travel, spacing);
      const base = Math.floor(travel / spacing);
      for (let i = -2; i <= Math.ceil(width / spacing) + 2; i++) {
        const index = base + i;
        const x = i * spacing - offset;
        const y = groundY - 62 + Math.sin(frame * 0.013 + index * 1.13) * 7;
        const fog = ctx.createRadialGradient(x + 68, y, 6, x + 68, y, 98);
        fog.addColorStop(0, `rgba(132,99,148,${0.070 + depth * 0.034})`);
        fog.addColorStop(0.52, `rgba(95,72,111,${0.035 + depth * 0.020})`);
        fog.addColorStop(1, 'rgba(61,46,76,0)');
        ctx.fillStyle = fog;
        ctx.fillRect(x - 32, y - 54, 220, 108);
      }
    }

    function drawHangingVines(ctx, width, frame, depth) {
      ctx.save();
      ctx.strokeStyle = `rgba(8,10,15,${0.42 + depth * 0.08})`;
      ctx.lineCap = 'round';
      const count = 7;
      for (let i = 0; i < count; i++) {
        const seed = seed01(i * 5.37 + 1.9);
        const x = 10 + i * ((width - 20) / (count - 1));
        const length = 58 + seed * 84;
        const sway = Math.sin(frame * 0.009 + i * 1.4) * 2.8;
        ctx.lineWidth = 1.6 + (i % 2) * 0.75;
        ctx.beginPath();
        ctx.moveTo(x, -5);
        ctx.bezierCurveTo(x + sway, 26, x - 6 + sway, length * 0.63, x + sway * 0.5, length);
        ctx.stroke();
        if (i % 2 === 0) {
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + sway * 0.4, length * 0.70);
          ctx.quadraticCurveTo(x + 9 + sway, length * 0.78, x + 4 + sway, length * 0.90);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    function drawSporesAndEyes(ctx, width, groundY, frame, depth) {
      for (let i = 0; i < 11; i++) {
        const x = 18 + seed01(i * 7.31) * (width - 36) + Math.sin(frame * 0.010 + i) * 5;
        const y = 130 + seed01(i * 11.17) * Math.max(120, groundY - 205) + Math.cos(frame * 0.013 + i * 1.3) * 7;
        const violet = i % 4 !== 0;
        ctx.save();
        ctx.globalAlpha = (0.10 + depth * 0.105) * (0.75 + Math.sin(frame * 0.016 + i) * 0.25);
        ctx.shadowColor = violet ? '#c685ee' : '#74c69b';
        ctx.shadowBlur = 5;
        ctx.fillStyle = violet ? '#dda4f2' : '#8dd3ab';
        ctx.beginPath();
        ctx.arc(x, y, 1.0 + (i % 2) * 0.35, 0, TAU);
        ctx.fill();
        ctx.restore();
      }

      const eyeSets = [
        [42, groundY - 92, 0.2],
        [width - 48, groundY - 142, 1.5],
      ];
      for (const [x, y, phase] of eyeSets) {
        const blink = (Math.sin(frame * 0.034 + phase) + 1) * 0.5 < 0.052 ? 0.18 : 1;
        ctx.save();
        ctx.globalAlpha = 0.12 + depth * 0.13;
        ctx.shadowColor = '#c77aff';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#e1b0f5';
        ctx.beginPath();
        ctx.ellipse(x - 4.5, y, 1.8, 1.15 * blink, 0, 0, TAU);
        ctx.ellipse(x + 4.5, y, 1.8, 1.15 * blink, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    }

    function drawForegroundFrame(ctx, width, groundY, frame, depth) {
      const sway = Math.sin(frame * 0.007) * 1.9;
      ctx.save();
      ctx.globalAlpha = 0.42 + depth * 0.08;
      ctx.strokeStyle = '#030408';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(-15, 104);
      ctx.bezierCurveTo(30, 112 + sway, 58, 70 + sway, 112, 88 + sway);
      ctx.moveTo(width + 15, 166);
      ctx.bezierCurveTo(width - 32, 153 - sway, width - 61, 116 - sway, width - 112, 132 - sway);
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(58, 88 + sway); ctx.lineTo(88, 47 + sway);
      ctx.moveTo(78, 82 + sway); ctx.lineTo(112, 61 + sway);
      ctx.moveTo(width - 58, 132 - sway); ctx.lineTo(width - 87, 94 - sway);
      ctx.moveTo(width - 82, 128 - sway); ctx.lineTo(width - 116, 110 - sway);
      ctx.stroke();
      ctx.restore();

      const vignette = ctx.createRadialGradient(width * 0.50, groundY * 0.45, 118, width * 0.50, groundY * 0.45, 370);
      vignette.addColorStop(0, 'rgba(4,4,9,0)');
      vignette.addColorStop(1, `rgba(2,3,7,${0.16 + depth * 0.07})`);
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
      drawDistantCanopyWall(ctx, width, groundY, frame, depth);

      drawForestLayer(ctx, width, groundY, frame, depth, {
        spacing: 67,
        speed: 0.075,
        height: 236,
        trunkWidth: 31,
        layer: 0,
        alpha: 0.24 + depth * 0.025,
        offsetSeed: 400,
      });

      drawFogRibbon(ctx, width, 172, 45, frame, 0.35, 0.060 + depth * 0.018, 0.72, '#8c7697');

      drawForestLayer(ctx, width, groundY, frame, depth, {
        spacing: 116,
        speed: 0.19,
        height: 304,
        trunkWidth: 45,
        layer: 1,
        alpha: 0.39 + depth * 0.035,
        offsetSeed: 800,
      });

      drawFogRibbon(ctx, width, groundY - 210, 52, frame, 1.35, 0.052 + depth * 0.018, 0.91, '#765f84');
      drawGroundHaze(ctx, width, groundY, frame, depth);

      drawForestLayer(ctx, width, groundY, frame, depth, {
        spacing: 188,
        speed: 0.32,
        height: 365,
        trunkWidth: 61,
        layer: 2,
        alpha: 0.47 + depth * 0.040,
        offsetSeed: 1200,
      });

      drawFogRibbon(ctx, width, groundY - 96, 48, frame, 2.1, 0.070 + depth * 0.024, 1.05, '#92749d');
      drawHangingVines(ctx, width, frame, depth);
      drawSporesAndEyes(ctx, width, groundY, frame, depth);
      drawForegroundFrame(ctx, width, groundY, frame, depth);
      ctx.restore();
    };

    game.__cursedWoodsAtmosphereV1Installed = true;
    game.__cursedWoodsAtmosphereV2Installed = true;
    game.__cursedWoodsAtmosphereV3Installed = true;
    game.__cursedWoodsAtmosphereV4Installed = true;
    window.__FF_CURSED_WOODS_VISUAL_V4__ = {
      version: 'cursed-woods-visual-v4-final-background',
      source: 'Feather Fury approved Canvas 2D background renderer',
      gameplayGeometryChanged: false,
      obstacleSystemChanged: false,
      techniqueChanged: false,
      seamlessParallax: true,
      layers: ['violet-sky', 'distant-canopy', 'far-forest', 'high-fog', 'mid-forest', 'ground-haze', 'near-forest', 'atmosphere'],
    };
    console.log('[FF-LAB] cursed-woods-atmosphere-v4-installed');
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
