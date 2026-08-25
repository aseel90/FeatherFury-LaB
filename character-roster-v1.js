(() => {
  'use strict';

  if (window.__FF_CHARACTER_ROSTER_V1__) return;
  const VERSION = 'character-roster-v1';
  const baseDrawBirdSkin = window.drawBirdSkin;
  const stateByCtx = new WeakMap();
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const FX = {
    pigeon: ['rgba(226,232,240,0.30)', 'rgba(148,163,184,0.70)'],
    phoenix: ['rgba(251,146,60,0.34)', 'rgba(251,191,36,0.84)'],
    cyber: ['rgba(34,211,238,0.34)', 'rgba(56,189,248,0.84)'],
    ghost: ['rgba(167,139,250,0.30)', 'rgba(224,231,255,0.76)'],
    king: ['rgba(251,191,36,0.34)', 'rgba(253,230,138,0.84)'],
    eagle: ['rgba(101,163,13,0.24)', 'rgba(214,181,122,0.70)']
  };

  function stateFor(ctx, now) {
    let s = stateByCtx.get(ctx);
    if (!s) {
      s = { rotation: 0, last: now };
      stateByCtx.set(ctx, s);
    }
    return s;
  }

  function motionFor(ctx, rotation, inFever, now) {
    const s = stateFor(ctx, now);
    const dt = clamp(now - s.last, 0, 50);
    s.last = now;
    const target = clamp((Number.isFinite(rotation) ? rotation : 0) * 0.44, -0.12, 0.20);
    s.rotation += (target - s.rotation) * (1 - Math.exp(-dt / 72));
    return {
      rotation: s.rotation,
      hover: Math.abs(target) < 0.05 && !inFever ? Math.sin(now * 0.006) * 0.42 : 0
    };
  }

  function poly(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
  }

  function drawAura(ctx, key, w, h, now, strength = 1) {
    const colors = FX[key] || FX.pigeon;
    ctx.save();
    const pulse = 0.82 + Math.sin(now * 0.009) * 0.08;
    const g = ctx.createRadialGradient(0, 0, w * 0.12, 0, 0, w * 0.76);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.60, colors[0]);
    g.addColorStop(1, colors[0]);
    ctx.globalAlpha = 0.62 * pulse * strength;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.67, h * 0.78, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const yy = -5 + i * 5;
      const trail = ctx.createLinearGradient(-w * 0.92, yy, -w * 0.48, yy);
      trail.addColorStop(0, 'rgba(255,255,255,0)');
      trail.addColorStop(1, colors[1]);
      ctx.globalAlpha = (0.25 + i * 0.04) * strength;
      ctx.strokeStyle = trail;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-w * (0.90 + i * 0.03), yy);
      ctx.lineTo(-w * 0.50, yy);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBand(ctx, color = '#10194a') {
    ctx.fillStyle = color;
    ctx.strokeStyle = '#05070d';
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(-15.2,-7.4);
    ctx.quadraticCurveTo(1,-10.7,15.0,-7.2);
    ctx.lineTo(15.7,-2.8);
    ctx.quadraticCurveTo(1,-5.0,-15.1,-3.2);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = color;
    poly(ctx, [[-15.2,-5.3],[-23.8,-9.3],[-21.8,-3.0],[-15.8,-1.0]]);
    ctx.fill(); ctx.stroke();
    poly(ctx, [[-15.4,-1.8],[-23.5,2.8],[-20.1,7.1],[-14.5,2.0]]);
    ctx.fill(); ctx.stroke();
  }

  function drawEye(ctx) {
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#05070d';
    ctx.lineWidth = 1.75;
    ctx.beginPath();
    ctx.moveTo(5.0,-5.7);
    ctx.quadraticCurveTo(10.1,-5.0,13.0,-2.8);
    ctx.quadraticCurveTo(10.5,2.0,6.1,1.1);
    ctx.quadraticCurveTo(3.5,-0.4,5.0,-5.7);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
  }

  function bodyBase(ctx, body, belly, outline = '#05070d', rx = 17.6, ry = 14.3) {
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.fillStyle = body;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.45;
    ctx.beginPath();
    ctx.ellipse(0, 1, rx, ry, -0.02, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.save();
    ctx.globalAlpha = 0.30;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-4.2, -4.8, 10.6, 6.2, -0.18, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = belly;
    ctx.beginPath();
    ctx.moveTo(-2.3, 12.4);
    ctx.bezierCurveTo(2.4, 5.7, 10.6, 5.1, 16.5, 7.2);
    ctx.bezierCurveTo(13.1, 12.6, 6.4, 15.1, -2.3, 12.4);
    ctx.closePath();
    ctx.fill();
  }

  function sideMarks(ctx, color, third = false) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(-7.0, 4.3, 1.8, 3.0, 0.24, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-2.6, 5.4, 1.7, 2.8, 0.28, 0, Math.PI*2); ctx.fill();
    if (third) { ctx.beginPath(); ctx.ellipse(1.5, 6.4, 1.35, 2.2, 0.30, 0, Math.PI*2); ctx.fill(); }
    ctx.restore();
  }

  function drawPigeon(ctx) {
    const outline = '#05070d';
    ctx.fillStyle = '#c4c8cf'; ctx.strokeStyle = outline; ctx.lineWidth = 2.0;
    poly(ctx, [[-14.8,5.7],[-22.0,8.5],[-17.1,10.4],[-21.1,13.2],[-13.5,12.6],[-9.3,8.4]]);
    ctx.fill(); ctx.stroke();

    bodyBase(ctx, '#b7bbc3', '#e5e7eb', outline, 17.2, 14.4);
    sideMarks(ctx, '#6b7280');

    ctx.fillStyle = '#bfc3cb'; ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-9.8,-11.0);
    ctx.quadraticCurveTo(-12.2,-17.3,-6.7,-15.8);
    ctx.quadraticCurveTo(-4.8,-19.2,1.3,-14.1);
    ctx.quadraticCurveTo(4.0,-12.1,7.6,-10.4);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    drawBand(ctx, '#11194d');
    drawEye(ctx);

    ctx.fillStyle = '#fbbf24'; ctx.strokeStyle = outline; ctx.lineWidth = 1.8;
    poly(ctx, [[14.0,-1.8],[20.7,1.0],[14.0,2.2]]); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    poly(ctx, [[14.0,2.2],[19.8,1.0],[16.0,4.8],[13.0,3.1]]); ctx.fill(); ctx.stroke();
  }

  function drawCyber(ctx) {
    const outline = '#05070d';
    ctx.fillStyle = '#1f3a5a'; ctx.strokeStyle = outline; ctx.lineWidth = 2.0;
    poly(ctx, [[-14.7,6.0],[-22.0,8.0],[-19.2,11.8],[-13.2,13.1],[-9.6,8.2]]);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-19.7,9.2); ctx.lineTo(-15.2,9.0); ctx.stroke();

    bodyBase(ctx, '#243f61', '#93a4b7', outline, 17.4, 14.3);
    sideMarks(ctx, '#102b47');

    ctx.fillStyle = '#294a70'; ctx.strokeStyle = outline; ctx.lineWidth = 2.0;
    poly(ctx, [[-10.0,-11.0],[-13.5,-17.6],[-6.0,-14.5],[-4.8,-20.2],[1.1,-14.5],[5.0,-19.2],[8.4,-10.5]]);
    ctx.fill(); ctx.stroke();

    drawBand(ctx, '#11194d');
    ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1.15;
    ctx.beginPath(); ctx.moveTo(2.4,-8.1); ctx.quadraticCurveTo(10.2,-7.1,14.7,-5.6); ctx.lineTo(14.9,-3.9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-13.5,-2.7); ctx.lineTo(-13.5,6.7); ctx.lineTo(-8.9,11.1); ctx.stroke();

    drawEye(ctx);

    ctx.fillStyle = '#67e8f9'; ctx.strokeStyle = outline; ctx.lineWidth = 1.8;
    poly(ctx, [[14.0,-1.8],[21.0,1.0],[14.0,2.2]]); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#22d3ee';
    poly(ctx, [[14.0,2.2],[20.0,1.0],[16.1,4.8],[13.1,3.1]]); ctx.fill(); ctx.stroke();

    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = '#dbeafe'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(1.5,10.8); ctx.lineTo(6.0,6.6); ctx.lineTo(11.4,7.1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6.0,6.6); ctx.lineTo(10.0,11.1); ctx.stroke();
    ctx.restore();
  }

  function drawGhost(ctx) {
    const outline = '#5956a9';
    ctx.save();
    ctx.shadowColor = 'rgba(139,92,246,0.38)';
    ctx.shadowBlur = 5;

    ctx.fillStyle = 'rgba(238,242,255,0.82)'; ctx.strokeStyle = outline; ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(-13.0,7.2);
    ctx.bezierCurveTo(-20.0,5.3,-22.0,8.8,-25.8,9.3);
    ctx.bezierCurveTo(-21.6,11.0,-24.0,14.7,-28.4,15.7);
    ctx.bezierCurveTo(-22.4,17.2,-18.7,14.4,-13.4,12.2);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    bodyBase(ctx, '#edf2ff', '#ffffff', outline, 17.4, 14.2);
    sideMarks(ctx, '#b8c0ee');

    ctx.fillStyle = '#eef2ff'; ctx.strokeStyle = outline; ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(-10.1,-11.0);
    ctx.quadraticCurveTo(-12.0,-17.0,-6.8,-15.9);
    ctx.quadraticCurveTo(-4.5,-19.4,1.1,-14.3);
    ctx.quadraticCurveTo(4.0,-12.0,7.4,-10.4);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    drawBand(ctx, '#1d245d');
    drawEye(ctx);

    ctx.fillStyle = '#c4b5fd'; ctx.strokeStyle = '#373071'; ctx.lineWidth = 1.7;
    poly(ctx, [[14.0,-1.8],[20.6,1.0],[14.0,2.2]]); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#a78bfa';
    poly(ctx, [[14.0,2.2],[19.6,1.0],[16.0,4.8],[13.1,3.1]]); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function drawKing(ctx) {
    const outline = '#05070d';
    ctx.fillStyle = '#f5b915'; ctx.strokeStyle = outline; ctx.lineWidth = 2.0;
    poly(ctx, [[-14.8,5.8],[-22.2,8.7],[-17.1,10.6],[-21.5,13.8],[-13.4,13.0],[-9.5,8.4]]);
    ctx.fill(); ctx.stroke();

    bodyBase(ctx, '#f8bd18', '#fde7a3', outline, 17.5, 14.3);
    sideMarks(ctx, '#d69409');

    ctx.fillStyle = '#f8bd18'; ctx.strokeStyle = outline; ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(-9.8,-11.0);
    ctx.quadraticCurveTo(-12.1,-17.0,-6.8,-15.8);
    ctx.quadraticCurveTo(-4.5,-19.0,1.2,-14.1);
    ctx.quadraticCurveTo(4.0,-12.1,7.5,-10.3);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#fbbf24'; ctx.strokeStyle = outline; ctx.lineWidth = 1.5;
    poly(ctx, [[0.4,-12.6],[1.1,-19.0],[4.2,-15.2],[7.0,-19.1],[8.0,-14.6],[11.7,-17.0],[10.2,-11.3]]);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fde68a';
    ctx.beginPath(); ctx.arc(1.1,-19.0,0.8,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(7.0,-19.1,0.8,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(11.7,-17.0,0.8,0,Math.PI*2); ctx.fill(); ctx.stroke();

    drawBand(ctx, '#151d4f');
    drawEye(ctx);

    ctx.fillStyle = '#fbbf24'; ctx.strokeStyle = outline; ctx.lineWidth = 1.8;
    poly(ctx, [[14.0,-1.8],[20.8,1.0],[14.0,2.2]]); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d99a0b';
    poly(ctx, [[14.0,2.2],[19.8,1.0],[16.1,4.8],[13.1,3.1]]); ctx.fill(); ctx.stroke();
  }

  function drawEagle(ctx) {
    const outline = '#05070d';
    ctx.fillStyle = '#5d3724'; ctx.strokeStyle = outline; ctx.lineWidth = 2.0;
    poly(ctx, [[-14.4,5.8],[-23.1,7.5],[-18.0,10.1],[-22.0,14.1],[-13.0,12.9],[-9.4,8.1]]);
    ctx.fill(); ctx.stroke();

    bodyBase(ctx, '#65402b', '#ead8b6', outline, 17.9, 14.4);
    sideMarks(ctx, '#3f2619', true);

    ctx.fillStyle = '#65402b'; ctx.strokeStyle = outline; ctx.lineWidth = 2.0;
    poly(ctx, [[-10.2,-10.5],[-13.0,-17.2],[-7.0,-14.8],[-5.0,-20.0],[0.0,-14.8],[4.0,-19.0],[6.1,-13.4],[10.0,-16.1],[8.7,-10.1]]);
    ctx.fill(); ctx.stroke();

    drawBand(ctx, '#414425');
    drawEye(ctx);

    ctx.fillStyle = '#f4b51c'; ctx.strokeStyle = outline; ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(13.8,-2.0);
    ctx.quadraticCurveTo(21.0,-0.5,21.0,3.0);
    ctx.quadraticCurveTo(20.2,7.0,17.8,7.6);
    ctx.quadraticCurveTo(18.0,4.3,14.1,3.1);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#5f3b15'; ctx.lineWidth = 1.0;
    ctx.beginPath(); ctx.moveTo(15.0,2.0); ctx.quadraticCurveTo(18.1,2.6,19.4,3.8); ctx.stroke();
  }

  function drawPhoenix(ctx) {
    const outline = '#160704';
    ctx.fillStyle = '#f97316'; ctx.strokeStyle = outline; ctx.lineWidth = 2.0;
    poly(ctx, [[-14.8,5.3],[-23.5,3.2],[-19.2,8.0],[-25.0,11.0],[-17.2,12.2],[-20.2,16.0],[-11.3,12.7],[-9.2,8.1]]);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    poly(ctx, [[-15.5,7.0],[-21.8,7.1],[-18.2,10.0],[-21.8,12.7],[-14.0,11.9],[-10.8,8.8]]);
    ctx.fill(); ctx.stroke();

    bodyBase(ctx, '#ef2b16', '#ffd28a', outline, 17.7, 14.4);
    sideMarks(ctx, '#9f1b12');

    ctx.fillStyle = '#f97316'; ctx.strokeStyle = outline; ctx.lineWidth = 2.1;
    poly(ctx, [[-11,-11],[-10,-18],[-5,-15],[-3,-22],[1,-16],[5,-22],[7,-15],[12,-18],[10,-10]]);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    poly(ctx, [[-6,-12],[-5,-17],[-1,-14],[2,-19],[4,-13],[7,-15],[7,-11]]);
    ctx.fill(); ctx.stroke();

    drawBand(ctx, '#651515');
    drawEye(ctx);

    ctx.fillStyle = '#fbbf24'; ctx.strokeStyle = outline; ctx.lineWidth = 1.8;
    poly(ctx, [[14,-1.8],[21,1.1],[14,2.1]]); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f97316';
    poly(ctx, [[14,2.1],[20,1.1],[16.1,5.0],[13.1,3.2]]); ctx.fill(); ctx.stroke();
  }

  const customDrawers = {
    pigeon: drawPigeon,
    phoenix: drawPhoenix,
    cyber: drawCyber,
    ghost: drawGhost,
    king: drawKing,
    eagle: drawEagle
  };

  function drawCustom(ctx, key, x, y, rotation, scale = 1, inFever = false) {
    const now = performance.now();
    const m = motionFor(ctx, rotation, inFever, now);
    ctx.save();
    ctx.translate(x, y + m.hover);
    ctx.scale(scale, scale);
    ctx.rotate(m.rotation);
    if (key === 'ghost' && !inFever) drawAura(ctx, key, 45, 39, now, 0.22);
    if (inFever) drawAura(ctx, key, 45, 39, now, 1);
    customDrawers[key](ctx);
    ctx.restore();
  }

  window.drawBirdSkin = function(ctx, skinKey, x, y, rotation, wingCycle, scale = 1, inFever = false) {
    const key = skinKey || 'classic';
    if (customDrawers[key]) return drawCustom(ctx, key, x, y, rotation, scale, inFever);
    return baseDrawBirdSkin(ctx, key, x, y, rotation, wingCycle, scale, inFever);
  };

  if (window.game && !window.game.__phoenixEmberChargeV1) {
    if (typeof window.game.reset === 'function') {
      const baseReset = window.game.reset.bind(window.game);
      window.game.reset = function(...args) {
        const result = baseReset(...args);
        if (this.activeSkin === 'phoenix') {
          this.fever = 0;
          try { document.getElementById('feverBarFill').style.width = '0%'; } catch (_) {}
        }
        return result;
      };
    }

    if (typeof window.game.update === 'function') {
      const baseUpdate = window.game.update.bind(window.game);
      window.game.update = function(...args) {
        const before = this.fever;
        const wasActive = this.feverActive;
        const result = baseUpdate(...args);
        if (this.activeSkin === 'phoenix' && !wasActive && !this.feverActive && this.fever > before) {
          const gain = this.fever - before;
          const maxFever = this.activeWorld === 2 ? 150 : (this.activeWorld === 1 ? 120 : CONFIG.FEVER_MAX);
          this.fever = Math.min(maxFever, this.fever + gain * 0.20);
          try { document.getElementById('feverBarFill').style.width = `${Math.min(100, (this.fever / maxFever) * 100)}%`; } catch (_) {}
          if (this.fever >= maxFever) {
            this.feverActive = true;
            this.feverTimer = CONFIG.FEVER_DURATION;
            try { document.getElementById('feverBarFill').classList.add('max'); } catch (_) {}
            try { this.sound.playLaunch(); } catch (_) {}
            this.screenShake = 8;
          }
        }
        return result;
      };
    }
    window.game.__phoenixEmberChargeV1 = true;
  }

  if (window.game && typeof window.game.launchDash === 'function' && !window.game.__characterRosterLaunchFxV1) {
    const baseLaunchDash = window.game.launchDash.bind(window.game);
    const colors = {
      pigeon: ['#e2e8f0', '#94a3b8'],
      phoenix: ['#f97316', '#fbbf24'],
      cyber: ['#22d3ee', '#38bdf8'],
      ghost: ['#a78bfa', '#e0e7ff'],
      king: ['#fbbf24', '#fde68a'],
      eagle: ['#65a30d', '#d6b57a']
    };
    window.game.launchDash = function(...args) {
      const start = Array.isArray(this.particles) ? this.particles.length : 0;
      const result = baseLaunchDash(...args);
      const palette = colors[this.activeSkin];
      if (palette && Array.isArray(this.particles)) {
        for (let i = start; i < this.particles.length; i++) {
          if (this.particles[i]) this.particles[i].color = palette[Math.random() > 0.5 ? 0 : 1];
        }
      }
      return result;
    };
    window.game.__characterRosterLaunchFxV1 = true;
  }

  window.__FF_CHARACTER_ROSTER_V1__ = VERSION;
  if (window.game) {
    try { window.game.updatePreview?.(); } catch (_) {}
    try { window.game.renderShop?.(); } catch (_) {}
  }
})();