(() => {
  'use strict';

  function install() {
    const game = window.game;
    if (!game || !game.ctx || typeof game.drawRuinsBackground !== 'function' || typeof game.draw !== 'function') return false;
    if (game.__world1FinalArtLockV1Installed) return true;

    const TAU = Math.PI * 2;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const mod = (v, n) => ((v % n) + n) % n;
    const seed01 = n => {
      const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    const priorBackground = game.drawRuinsBackground.bind(game);
    const priorDraw = game.draw.bind(game);

    function isWorld1Forest(g) {
      if (g.activeWorld !== 0) return false;
      return !g.boss?.active && !['BOSS_WARNING', 'BOSS_INTRO', 'BOSS_OUTRO', 'STORY', 'FLY_AWAY'].includes(g.state);
    }

    function worldDepth(g) {
      const cfg = window.CONFIG || {};
      const end = Number(cfg.STAGE2_END) || 35;
      return clamp((Number(g.score) || 0) / Math.max(1, end), 0, 1);
    }

    function drawMoon(ctx, w, frame, depth) {
      const x = 72;
      const y = 104;
      ctx.save();
      const halo = ctx.createRadialGradient(x, y, 7, x, y, 116);
      halo.addColorStop(0, 'rgba(235,224,255,.25)');
      halo.addColorStop(.4, `rgba(147,86,199,${.13 + depth * .03})`);
      halo.addColorStop(1, 'rgba(83,35,107,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, Math.min(w, 190), 220);

      ctx.globalAlpha = .88;
      ctx.fillStyle = '#e6def2';
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x + 8, y - 5, 17, 0, TAU);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = .11 + depth * .03;
      ctx.strokeStyle = '#a38bb7';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      const drift = mod(frame * .035, w + 170) - 85;
      ctx.beginPath();
      ctx.moveTo(drift - 90, 123);
      ctx.bezierCurveTo(drift - 25, 111, drift + 22, 132, drift + 96, 118);
      ctx.stroke();
      ctx.restore();
    }

    function drawSky(ctx, w, gY, frame, depth) {
      const sky = ctx.createLinearGradient(0, 0, 0, gY);
      sky.addColorStop(0, '#070512');
      sky.addColorStop(.30, '#130922');
      sky.addColorStop(.67, '#28103a');
      sky.addColorStop(1, '#451e53');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, gY);

      const haze = ctx.createLinearGradient(0, 100, 0, gY);
      haze.addColorStop(0, 'rgba(107,55,139,0)');
      haze.addColorStop(.62, `rgba(104,53,132,${.035 + depth * .02})`);
      haze.addColorStop(1, `rgba(145,70,166,${.09 + depth * .035})`);
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, w, gY);
      drawMoon(ctx, w, frame, depth);
    }

    function drawOverheadCanopy(ctx, w, frame, depth) {
      const spacing = 48;
      const travel = frame * .045;
      const offset = mod(travel, spacing);
      const base = Math.floor(travel / spacing);
      ctx.save();
      ctx.globalAlpha = .72 + depth * .05;
      ctx.fillStyle = '#030409';
      for (let i = -2; i <= Math.ceil(w / spacing) + 2; i++) {
        const index = base + i;
        const x = i * spacing - offset;
        const r = 25 + seed01(index * 7.17) * 28;
        const y = -7 + seed01(index * 4.93) * 16;
        ctx.beginPath();
        ctx.ellipse(x + 18, y, r, 18 + r * .21, seed01(index * 9.1) - .5, 0, TAU);
        ctx.fill();
      }
      ctx.strokeStyle = '#04050a';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-18, 42);
      ctx.bezierCurveTo(64, 62, 124, 20, 218, 46);
      ctx.moveTo(w + 18, 34);
      ctx.bezierCurveTo(w - 64, 58, w - 128, 22, w - 205, 52);
      ctx.stroke();
      ctx.restore();
    }

    function drawCanopyWall(ctx, w, gY, frame, depth) {
      const spacing = 43;
      const travel = frame * .055;
      const offset = mod(travel, spacing);
      const base = Math.floor(travel / spacing);
      const ridge = gY - 170;
      ctx.save();
      ctx.globalAlpha = .26 + depth * .04;
      ctx.fillStyle = '#0d0c18';
      ctx.beginPath();
      ctx.moveTo(-30, gY);
      ctx.lineTo(-30, ridge + 34);
      for (let i = -2; i <= Math.ceil(w / spacing) + 2; i++) {
        const index = base + i;
        const x = i * spacing - offset;
        const y = ridge - seed01(index * 5.29) * 52;
        ctx.quadraticCurveTo(x + spacing * .25, y - 14, x + spacing * .5, y);
        ctx.quadraticCurveTo(x + spacing * .76, y + 13, x + spacing, ridge + seed01(index * 8.71) * 17);
      }
      ctx.lineTo(w + 40, gY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function treeProfile(index, layer) {
      return {
        h: .84 + seed01(index * 2.13 + layer * 11.7) * .31,
        w: .82 + seed01(index * 4.71 + layer * 7.3) * .34,
        bend: (seed01(index * 7.19 + layer * 4.2) - .5) * 2,
        fork: seed01(index * 11.31 + layer * 9.8),
        side: seed01(index * 14.73 + layer * 3.9) > .5 ? 1 : -1,
        crown: seed01(index * 19.51 + layer * 5.1),
      };
    }

    function drawLeafMass(ctx, x, y, radius, index, layer, alpha) {
      const color = layer === 0 ? '#111224' : layer === 1 ? '#090b17' : '#05060d';
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU + seed01(index * 17.1 + i * 4.7) * .5;
        const reach = radius * (.22 + seed01(index * 22.3 + i * 8.1) * .28);
        const rx = radius * (.48 + seed01(index * 9.9 + i * 3.2) * .32);
        const ry = radius * (.25 + seed01(index * 13.4 + i * 6.3) * .19);
        ctx.beginPath();
        ctx.ellipse(x + Math.cos(a) * reach, y + Math.sin(a) * reach * .45, rx, ry, a * .18, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawTree(ctx, x, baseY, baseH, baseW, index, layer, frame, alpha, depth) {
      const p = treeProfile(index, layer);
      const h = baseH * p.h;
      const w = baseW * p.w;
      const top = baseY - h;
      const sway = Math.sin(frame * .0026 + index * 1.43) * (layer === 2 ? 1.8 : 1.05);
      const bend = p.bend * w * .26 + sway;
      const color = layer === 0 ? '#0d1020' : layer === 1 ? '#080a12' : '#040509';

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(x - w * .52, baseY);
      ctx.bezierCurveTo(x - w * .48, baseY - h * .23, x - w * .14 + bend * .25, baseY - h * .62, x + bend, top);
      ctx.bezierCurveTo(x + w * .15 + bend * .42, top + h * .18, x + w * .43 + bend * .12, baseY - h * .28, x + w * .45, baseY);
      ctx.closePath();
      ctx.fill();

      const joint = baseY - h * (.50 + p.fork * .10);
      const reach = w * (1.20 + p.fork * .55);
      ctx.lineWidth = Math.max(3, w * (layer === 2 ? .18 : .14));
      ctx.beginPath();
      ctx.moveTo(x + bend * .32, joint);
      ctx.quadraticCurveTo(x - reach * .58, joint - h * .10, x - reach, joint - h * (.23 + p.fork * .07));
      ctx.moveTo(x + bend * .22, joint + h * .05);
      ctx.quadraticCurveTo(x + reach * .58, joint - h * .05, x + reach, joint - h * (.20 + (1 - p.fork) * .07));
      ctx.moveTo(x + bend * .10, joint - h * .12);
      ctx.quadraticCurveTo(x - p.side * w * .35, joint - h * .30, x - p.side * w * .06, joint - h * .48);
      ctx.stroke();

      ctx.lineWidth = Math.max(1.6, w * .065);
      ctx.beginPath();
      ctx.moveTo(x - reach * .58, joint - h * .12);
      ctx.quadraticCurveTo(x - reach * .86, joint - h * .24, x - reach * 1.18, joint - h * .17);
      ctx.moveTo(x + reach * .56, joint - h * .10);
      ctx.quadraticCurveTo(x + reach * .82, joint - h * .21, x + reach * 1.17, joint - h * .15);
      ctx.stroke();

      const crownR = w * (1.18 + p.crown * .45);
      drawLeafMass(ctx, x + bend * .72, top + h * .18, crownR, index, layer, layer === 2 ? .58 : .75);
      drawLeafMass(ctx, x - reach * .72, joint - h * .22, crownR * .62, index + 101, layer, layer === 2 ? .43 : .60);
      drawLeafMass(ctx, x + reach * .72, joint - h * .19, crownR * .60, index + 203, layer, layer === 2 ? .42 : .58);

      if (layer > 0) {
        ctx.lineWidth = Math.max(2.2, w * .10);
        ctx.beginPath();
        ctx.moveTo(x - w * .20, baseY);
        ctx.quadraticCurveTo(x - w * .70, baseY - 8, x - w * 1.12, baseY + 3);
        ctx.moveTo(x + w * .20, baseY);
        ctx.quadraticCurveTo(x + w * .66, baseY - 8, x + w * 1.08, baseY + 3);
        ctx.stroke();
      }

      if (layer === 2 && seed01(index * 31.73) > .72) {
        ctx.save();
        ctx.globalAlpha = .12 + depth * .07;
        ctx.strokeStyle = '#b24bdf';
        ctx.shadowColor = '#9c3ccc';
        ctx.shadowBlur = 5;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x + bend * .22, baseY - h * .20);
        ctx.lineTo(x - 3 + bend * .30, baseY - h * .31);
        ctx.lineTo(x + 3 + bend * .35, baseY - h * .40);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }

    function drawForestLayer(ctx, w, gY, frame, depth, options) {
      const { spacing, speed, height, trunkWidth, layer, alpha, offsetSeed } = options;
      const travel = frame * speed;
      const offset = mod(travel, spacing);
      const base = Math.floor(travel / spacing) + offsetSeed;
      for (let i = -2; i <= Math.ceil(w / spacing) + 3; i++) {
        const index = base + i;
        const x = i * spacing - offset + spacing * (.38 + seed01(index * 4.1) * .20);
        drawTree(ctx, x, gY + 5, height, trunkWidth, index, layer, frame, alpha, depth);
      }
    }

    function drawRuinedArch(ctx, w, gY, frame, depth) {
      const spacing = 410;
      const travel = frame * .095;
      const offset = mod(travel, spacing);
      const base = Math.floor(travel / spacing);
      ctx.save();
      ctx.globalAlpha = .14 + depth * .04;
      ctx.strokeStyle = '#24152e';
      ctx.fillStyle = '#17101f';
      ctx.lineWidth = 6;
      for (let i = -1; i <= Math.ceil(w / spacing) + 1; i++) {
        const index = base + i;
        const x = i * spacing - offset + 95 + seed01(index * 3.17) * 50;
        const y = gY - 28;
        const aw = 112 + seed01(index * 6.43) * 30;
        const ah = 78 + seed01(index * 8.91) * 24;
        ctx.fillRect(x - aw * .53, y - ah * .58, 16, ah * .62);
        ctx.fillRect(x + aw * .53 - 16, y - ah * .58, 16, ah * .62);
        ctx.beginPath();
        ctx.arc(x, y - ah * .52, aw * .46, Math.PI, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y - ah * .52, aw * .33, Math.PI, 0);
        ctx.stroke();
        ctx.fillRect(x - aw * .58, y - 4, aw * 1.16, 7);
      }
      ctx.restore();
    }

    function drawFog(ctx, w, y, thickness, frame, phase, alpha, speed, color) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-40, y + thickness * .55);
      for (let x = -40; x <= w + 40; x += 26) {
        const wave = Math.sin(x * .022 + frame * .008 * speed + phase) * 7 + Math.cos(x * .014 - frame * .005 * speed + phase * .7) * 3.5;
        ctx.quadraticCurveTo(x + 13, y + wave, x + 26, y + thickness * .52 + wave * .42);
      }
      ctx.lineTo(w + 40, y + thickness);
      ctx.lineTo(-40, y + thickness);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawGroundHaze(ctx, w, gY, frame, depth) {
      const spacing = 132;
      const travel = frame * .14;
      const offset = mod(travel, spacing);
      const base = Math.floor(travel / spacing);
      for (let i = -2; i <= Math.ceil(w / spacing) + 2; i++) {
        const index = base + i;
        const x = i * spacing - offset;
        const y = gY - 58 + Math.sin(frame * .013 + index * 1.13) * 7;
        const fog = ctx.createRadialGradient(x + 66, y, 6, x + 66, y, 96);
        fog.addColorStop(0, `rgba(146,89,170,${.082 + depth * .038})`);
        fog.addColorStop(.52, `rgba(97,61,119,${.04 + depth * .02})`);
        fog.addColorStop(1, 'rgba(61,43,76,0)');
        ctx.fillStyle = fog;
        ctx.fillRect(x - 30, y - 52, 210, 104);
      }
    }

    function drawUndergrowth(ctx, w, gY, frame, depth) {
      const spacing = 31;
      const travel = frame * .26;
      const offset = mod(travel, spacing);
      const base = Math.floor(travel / spacing);
      ctx.save();
      for (let i = -2; i <= Math.ceil(w / spacing) + 2; i++) {
        const index = base + i;
        const x = i * spacing - offset;
        const h = 7 + seed01(index * 4.77) * 13;
        ctx.globalAlpha = .31 + depth * .06;
        ctx.fillStyle = index % 4 === 0 ? '#291433' : '#0a0c12';
        ctx.beginPath();
        ctx.moveTo(x - 7, gY + 2);
        ctx.quadraticCurveTo(x - 4, gY - h * .72, x, gY - h);
        ctx.quadraticCurveTo(x + 3, gY - h * .45, x + 5, gY + 2);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 1, gY + 1);
        ctx.quadraticCurveTo(x + 9, gY - h * .54, x + 13, gY - h * .67);
        ctx.quadraticCurveTo(x + 10, gY - h * .20, x + 8, gY + 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    function drawVinesEyesSpores(ctx, w, gY, frame, depth) {
      ctx.save();
      ctx.strokeStyle = `rgba(5,7,10,${.50 + depth * .06})`;
      ctx.lineCap = 'round';
      for (let i = 0; i < 7; i++) {
        const x = 10 + i * ((w - 20) / 6);
        const len = 58 + seed01(i * 5.37) * 86;
        const sway = Math.sin(frame * .009 + i * 1.4) * 2.5;
        ctx.lineWidth = 1.6 + (i % 2) * .7;
        ctx.beginPath();
        ctx.moveTo(x, -5);
        ctx.bezierCurveTo(x + sway, 28, x - 6 + sway, len * .64, x + sway * .5, len);
        ctx.stroke();
      }
      ctx.restore();

      for (let i = 0; i < 12; i++) {
        const x = 16 + seed01(i * 7.31) * (w - 32) + Math.sin(frame * .010 + i) * 5;
        const y = 125 + seed01(i * 11.17) * Math.max(120, gY - 205) + Math.cos(frame * .013 + i * 1.3) * 7;
        ctx.save();
        ctx.globalAlpha = (.12 + depth * .11) * (.75 + Math.sin(frame * .016 + i) * .25);
        ctx.shadowColor = '#c671ff';
        ctx.shadowBlur = 5;
        ctx.fillStyle = i % 4 ? '#d99af1' : '#81c89e';
        ctx.beginPath();
        ctx.arc(x, y, 1 + (i % 2) * .35, 0, TAU);
        ctx.fill();
        ctx.restore();
      }

      const eyes = [[42, gY - 92, .2], [w - 48, gY - 142, 1.5], [w * .58, gY - 112, 2.4]];
      for (const [x, y, phase] of eyes) {
        const blink = (Math.sin(frame * .034 + phase) + 1) * .5 < .05 ? .18 : 1;
        ctx.save();
        ctx.globalAlpha = .13 + depth * .15;
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

    function drawForegroundFrame(ctx, w, gY, frame, depth) {
      const sway = Math.sin(frame * .007) * 1.9;
      ctx.save();
      ctx.globalAlpha = .46 + depth * .07;
      ctx.strokeStyle = '#020308';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 13;
      ctx.beginPath();
      ctx.moveTo(-16, 112);
      ctx.bezierCurveTo(30, 118 + sway, 63, 75 + sway, 116, 92 + sway);
      ctx.moveTo(w + 16, 166);
      ctx.bezierCurveTo(w - 34, 154 - sway, w - 63, 116 - sway, w - 116, 134 - sway);
      ctx.stroke();
      ctx.restore();

      const vignette = ctx.createRadialGradient(w * .5, gY * .45, 118, w * .5, gY * .45, 380);
      vignette.addColorStop(0, 'rgba(3,3,8,0)');
      vignette.addColorStop(1, `rgba(1,2,6,${.16 + depth * .07})`);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, gY);
    }

    function drawFinalForest(g) {
      const cfg = window.CONFIG || {};
      const ctx = g.ctx;
      const w = Number(cfg.CANVAS_WIDTH) || 360;
      const h = Number(cfg.CANVAS_HEIGHT) || 640;
      const groundHeight = Number(cfg.GROUND_HEIGHT) || 95;
      const gY = h - groundHeight;
      const frame = Number(g.frame) || 0;
      const depth = worldDepth(g);

      ctx.save();
      drawSky(ctx, w, gY, frame, depth);
      drawOverheadCanopy(ctx, w, frame, depth);
      drawCanopyWall(ctx, w, gY, frame, depth);
      drawRuinedArch(ctx, w, gY, frame, depth);

      drawForestLayer(ctx, w, gY, frame, depth, { spacing: 66, speed: .075, height: 240, trunkWidth: 31, layer: 0, alpha: .25 + depth * .03, offsetSeed: 410 });
      drawFog(ctx, w, 170, 46, frame, .35, .065 + depth * .018, .72, '#8d70a1');
      drawForestLayer(ctx, w, gY, frame, depth, { spacing: 112, speed: .19, height: 310, trunkWidth: 46, layer: 1, alpha: .42 + depth * .04, offsetSeed: 810 });
      drawFog(ctx, w, gY - 212, 53, frame, 1.35, .06 + depth * .02, .91, '#70577f');
      drawGroundHaze(ctx, w, gY, frame, depth);
      drawForestLayer(ctx, w, gY, frame, depth, { spacing: 184, speed: .32, height: 372, trunkWidth: 62, layer: 2, alpha: .50 + depth * .04, offsetSeed: 1210 });
      drawFog(ctx, w, gY - 94, 48, frame, 2.1, .078 + depth * .025, 1.05, '#9b70a7');
      drawUndergrowth(ctx, w, gY, frame, depth);
      drawVinesEyesSpores(ctx, w, gY, frame, depth);
      drawForegroundFrame(ctx, w, gY, frame, depth);
      ctx.restore();
    }

    game.drawRuinsBackground = function(...args) {
      if (!isWorld1Forest(this) || !this.ctx) return priorBackground(...args);
      return drawFinalForest(this);
    };

    function drawGround(ctx, cfg, frame, groundOffset, score, raw) {
      const w = Number(cfg.CANVAS_WIDTH) || 360;
      const h = Number(cfg.CANVAS_HEIGHT) || 640;
      const groundHeight = Number(cfg.GROUND_HEIGHT) || 95;
      const gY = h - groundHeight;
      const stage2End = Number(cfg.STAGE2_END) || 35;
      const depth = clamp((Number(score) || 0) / Math.max(1, stage2End), 0, 1);

      ctx.save();
      const soil = ctx.createLinearGradient(0, gY, 0, h);
      soil.addColorStop(0, '#211522');
      soil.addColorStop(.24, '#160f19');
      soil.addColorStop(1, '#07080c');
      ctx.fillStyle = soil;
      raw.fillRect(0, gY, w, groundHeight);

      const glow = ctx.createLinearGradient(0, gY, 0, gY + 38);
      glow.addColorStop(0, `rgba(128,55,156,${.11 + depth * .04})`);
      glow.addColorStop(1, 'rgba(70,29,88,0)');
      ctx.fillStyle = glow;
      raw.fillRect(0, gY, w, 38);

      const segment = 26;
      const scroll = mod(Number(groundOffset) || 0, segment);
      for (let i = -2; i <= Math.ceil(w / segment) + 2; i++) {
        const index = i + Math.floor((Number(frame) || 0) * .018);
        const x = i * segment - scroll;
        const a = seed01(index * 3.17);
        const b = seed01(index * 7.41);
        const top = gY - 2 - a * 3;
        ctx.fillStyle = b > .56 ? '#493344' : '#3b2938';
        ctx.beginPath();
        ctx.moveTo(x - 2, gY + 13);
        ctx.lineTo(x, top + 4);
        ctx.lineTo(x + segment * .28, top);
        ctx.lineTo(x + segment * .68, top + 1 + b * 3);
        ctx.lineTo(x + segment + 2, top + 5);
        ctx.lineTo(x + segment + 2, gY + 14);
        ctx.closePath();
        raw.fill();
        ctx.strokeStyle = 'rgba(12,8,14,.68)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x + segment * .30, top + 2);
        ctx.lineTo(x + segment * .46, top + 7 + a * 4);
        ctx.lineTo(x + segment * .62, top + 4);
        ctx.stroke();
      }

      ctx.lineCap = 'round';
      for (let i = 0; i < 11; i++) {
        const x = mod(i * 43 - (Number(groundOffset) || 0) * .62 + 17, w + 55) - 22;
        const s = seed01(i * 8.73 + Math.floor((Number(frame) || 0) / 220));
        const rootLen = 24 + s * 42;
        ctx.strokeStyle = `rgba(69,39,35,${.50 + s * .15})`;
        ctx.lineWidth = 2.3 + s * 2.1;
        ctx.beginPath();
        ctx.moveTo(x, gY + 8);
        ctx.bezierCurveTo(x - 11 + s * 16, gY + rootLen * .35, x + 9 - s * 13, gY + rootLen * .72, x - 4 + s * 8, gY + rootLen);
        ctx.stroke();
      }

      for (let i = 0; i < 13; i++) {
        const s = seed01(i * 10.91);
        const x = mod(i * 37 - (Number(groundOffset) || 0) * .38 + 9, w + 36) - 18;
        const y = gY + 23 + seed01(i * 4.33) * Math.max(18, groundHeight - 35);
        ctx.fillStyle = s > .62 ? '#29212e' : '#1a171f';
        ctx.beginPath();
        ctx.ellipse(x, y, 5 + s * 9, 3 + seed01(i * 6.17) * 6, s - .5, 0, TAU);
        raw.fill();
      }

      for (let i = 0; i < 6; i++) {
        const x = mod(i * 71 - (Number(groundOffset) || 0) * .82 + 22, w + 50) - 20;
        if (i % 2 === 0) {
          ctx.save();
          ctx.globalAlpha = .50 + depth * .12;
          ctx.shadowColor = '#b950ff';
          ctx.shadowBlur = 5;
          ctx.fillStyle = '#9148bf';
          ctx.beginPath();
          ctx.moveTo(x, gY + 2);
          ctx.lineTo(x + 3, gY - 5);
          ctx.lineTo(x + 6, gY + 2);
          ctx.closePath();
          raw.fill();
          ctx.restore();
        } else {
          ctx.fillStyle = '#6f3b85';
          raw.fillRect(x + 2, gY - 4, 2, 5);
          ctx.beginPath();
          ctx.ellipse(x + 3, gY - 5, 5, 2.3, 0, Math.PI, TAU);
          raw.fill();
        }
      }

      ctx.strokeStyle = 'rgba(136,83,129,.78)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, gY + 1);
      ctx.lineTo(w, gY + 1);
      ctx.stroke();
      ctx.restore();
    }

    game.draw = function(...args) {
      if (this.activeWorld !== 0 || !this.ctx) return priorDraw(...args);

      const cfg = window.CONFIG || {};
      const w = Number(cfg.CANVAS_WIDTH) || 360;
      const h = Number(cfg.CANVAS_HEIGHT) || 640;
      const groundHeight = Number(cfg.GROUND_HEIGHT) || 95;
      const gY = h - groundHeight;
      const ctx = this.ctx;
      const previousFillRect = ctx.fillRect;
      const previousFill = ctx.fill;
      const raw = { fillRect: previousFillRect.bind(ctx), fill: previousFill.bind(ctx) };
      let customPainting = false;
      let groundPainted = false;
      let topSuppressed = false;
      let suppressStripeFill = false;
      const near = (a, b) => Math.abs(Number(a) - Number(b)) < .6;

      ctx.fillRect = function(x, y, rw, rh) {
        if (customPainting) return raw.fillRect(x, y, rw, rh);
        if (!groundPainted && near(x, 0) && near(y, gY) && near(rw, w) && near(rh, groundHeight)) {
          customPainting = true;
          try { drawGround(ctx, cfg, game.frame, game.groundOffset, game.score, raw); }
          finally { customPainting = false; }
          groundPainted = true;
          return;
        }
        if (groundPainted && !topSuppressed && near(x, 0) && near(y, gY) && near(rw, w) && near(rh, 10)) {
          topSuppressed = true;
          suppressStripeFill = true;
          return;
        }
        return raw.fillRect(x, y, rw, rh);
      };

      ctx.fill = function(...fillArgs) {
        if (customPainting) return raw.fill(...fillArgs);
        if (suppressStripeFill) {
          suppressStripeFill = false;
          return;
        }
        return raw.fill(...fillArgs);
      };

      try {
        return priorDraw(...args);
      } finally {
        ctx.fillRect = previousFillRect;
        ctx.fill = previousFill;
      }
    };

    game.__world1FinalArtLockV1Installed = true;
    window.__FF_WORLD1_FINAL_ART_LOCK_V1__ = {
      version: 'world1-final-art-lock-v1',
      background: 'approved-cursed-woods-concept',
      ground: 'organic-soil-rock-roots-purple-flora',
      renderer: 'Canvas 2D',
      obstacleSystemChanged: false,
      collisionChanged: false,
      groundHeightChanged: false,
      physicsChanged: false,
    };
    console.log('[FF-LAB] world1-final-art-lock-v1-installed');
    return true;
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    if (install() || attempts > 120) clearInterval(timer);
  }, 80);
  setTimeout(install, 900);
  setTimeout(install, 1800);
})();