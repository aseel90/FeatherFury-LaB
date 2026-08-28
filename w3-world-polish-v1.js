(()=>{
  'use strict';

  function install() {
    const g = window.game;
    if (!g || !g.ctx || !Array.isArray(g.electricBats) || !Array.isArray(g.miniTeslas)) return false;
    if (g.__w3WorldPolishV1Installed) return true;

    const C = (typeof CONFIG !== 'undefined' && CONFIG) ? CONFIG : {};
    const W3 = 2;
    const W = () => Number(C.CANVAS_WIDTH || 360);
    const H = () => Number(C.CANVAS_HEIGHT || 640);
    const groundY = () => H() - Number(C.GROUND_HEIGHT || 95);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    function stageOf(x) {
      if (x.activeWorld !== W3) return 0;
      if (x.boss?.active) return 3;
      return Number(x.score || 0) >= Number(C.STAGE1_END || 15) ? 2 : 1;
    }

    function installSky() {
      g.drawWorld3Background = function(ctx, frame = this.frame) {
        const stage = stageOf(this);
        const h = H(), w = W(), gy = groundY();
        const charged = stage >= 2;
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, charged ? '#080b2a' : '#091633');
        grad.addColorStop(.5, charged ? '#17134b' : '#102849');
        grad.addColorStop(1, charged ? '#281342' : '#142d43');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const moonX = w * .82, moonY = 92;
        ctx.save();
        ctx.globalAlpha = .92;
        ctx.fillStyle = '#facc15';
        ctx.beginPath(); ctx.arc(moonX, moonY, 29, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        const cloudShift = (frame * .16) % 190;
        ctx.save();
        ctx.globalAlpha = charged ? .34 : .24;
        ctx.fillStyle = charged ? '#51429d' : '#2c5f91';
        for (let row = 0; row < 2; row++) {
          const y = 124 + row * 48;
          for (let i = -1; i < 4; i++) {
            const x = i * 150 - cloudShift * (row ? .65 : 1);
            ctx.beginPath();
            ctx.ellipse(x + 35, y, 58, 15, 0, 0, Math.PI * 2);
            ctx.ellipse(x + 82, y + 4, 76, 18, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();

        const back = charged ? '#171334' : '#102238';
        const mid = charged ? '#221641' : '#173147';
        ctx.fillStyle = back;
        for (let i = 0; i < 7; i++) {
          const x = i * 72 - 35;
          const top = 270 + (i % 3) * 24;
          ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + 30, top); ctx.lineTo(x + 60, gy); ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = mid;
        for (let i = 0; i < 6; i++) {
          const x = i * 88 - 18;
          const top = 330 + (i % 2) * 35;
          ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + 35, top); ctx.lineTo(x + 70, gy); ctx.closePath(); ctx.fill();
        }

        ctx.save();
        ctx.globalAlpha = charged ? .25 : .16;
        ctx.fillStyle = '#7c3aed';
        for (let i = 0; i < 5; i++) {
          const x = 18 + i * 85;
          ctx.beginPath();
          ctx.ellipse(x, gy - 46 - (i % 2) * 10, 50, 18, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      };
    }

    function installPillarArt() {
      g.drawStormPillarSprite = function(ctx, p, frame = this.frame) {
        if (!p) return;
        const gy = groundY();
        const topH = Number(p.topHeight || 150);
        const gap = Number(C.W3_GAP_SIZE || 142);
        const lowerY = topH + gap;
        const x = Number(p.x || 0), pw = Number(C.PIPE_WIDTH || 62);
        const pulse = .5 + .5 * Math.sin(frame * .16 + x * .02);
        const drawBody = (y, hh, topCap) => {
          if (hh <= 0) return;
          ctx.save(); ctx.translate(x, y);
          const gr = ctx.createLinearGradient(0, 0, pw, 0);
          gr.addColorStop(0, '#111827'); gr.addColorStop(.45, '#24304c'); gr.addColorStop(1, '#0b1225');
          ctx.fillStyle = gr; ctx.fillRect(0, 0, pw, hh);
          ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.strokeRect(1, 0, pw - 2, hh);
          ctx.fillStyle = 'rgba(139,92,246,.17)';
          for (let yy = 15; yy < hh; yy += 34) ctx.fillRect(8, yy, pw - 16, 4);
          if (topCap) {
            ctx.fillStyle = '#252f4b'; ctx.fillRect(-7, 0, pw + 14, 14);
            ctx.strokeStyle = '#64748b'; ctx.strokeRect(-7, 0, pw + 14, 14);
          } else {
            ctx.fillStyle = '#252f4b'; ctx.fillRect(-7, hh - 14, pw + 14, 14);
            ctx.strokeStyle = '#64748b'; ctx.strokeRect(-7, hh - 14, pw + 14, 14);
          }
          ctx.restore();
        };
        drawBody(0, topH, false);
        drawBody(lowerY, gy - lowerY, true);
        ctx.save();
        ctx.shadowColor = '#7dd3fc'; ctx.shadowBlur = 7 + pulse * 6;
        ctx.strokeStyle = `rgba(125,211,252,${.35 + pulse * .25})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x + 7, topH - 3); ctx.lineTo(x + pw - 7, topH - 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 7, lowerY + 3); ctx.lineTo(x + pw - 7, lowerY + 3); ctx.stroke();
        ctx.restore();
      };
    }

    function installGround() {
      g.drawWorld3Ground = function(ctx, frame = this.frame) {
        const gy = groundY(), w = W(), h = H() - gy;
        ctx.save();
        const gr = ctx.createLinearGradient(0, gy, 0, H());
        gr.addColorStop(0, '#10182a'); gr.addColorStop(1, '#070b14');
        ctx.fillStyle = gr; ctx.fillRect(0, gy, w, h);
        ctx.fillStyle = '#2d3550'; ctx.fillRect(0, gy, w, 12);
        ctx.fillStyle = '#49536e'; ctx.fillRect(0, gy, w, 3);
        const off = (frame * 1.3) % 58;
        ctx.strokeStyle = 'rgba(139,92,246,.18)'; ctx.lineWidth = 2;
        for (let x = -60 + off; x < w + 60; x += 58) {
          ctx.beginPath(); ctx.moveTo(x, gy + 13); ctx.lineTo(x - 22, H()); ctx.stroke();
        }
        ctx.restore();
      };
    }

    function installHazardArt() {
      g.drawElectricBatSprite = function(ctx, x, y, frame) {
        ctx.save(); ctx.translate(x, y);
        const flap = Math.sin(frame * .45) * 8;
        ctx.fillStyle = '#2e1065'; ctx.strokeStyle = '#111827'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(0, 0, 10, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath(); ctx.moveTo(-5, -2); ctx.lineTo(-28, -8 + flap); ctx.lineTo(-18, 6 + flap * .35); ctx.lineTo(-7, 7); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(5, -2); ctx.lineTo(28, -8 - flap); ctx.lineTo(18, 6 - flap * .35); ctx.lineTo(7, 7); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(-4, -3, 2.1, 0, Math.PI * 2); ctx.arc(4, -3, 2.1, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      };
      g.drawMiniTeslaSprite = function(ctx, x, y, frame) {
        const p = .5 + .5 * Math.sin(frame * .28);
        ctx.save(); ctx.translate(x, y); ctx.lineJoin = 'round';
        ctx.fillStyle = '#111827'; ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
        ctx.fillRect(-18, -17, 36, 17); ctx.strokeRect(-18, -17, 36, 17);
        ctx.fillStyle = '#334155'; ctx.fillRect(-15, -5, 8, 6); ctx.fillRect(7, -5, 8, 6);
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(-4, -34, 8, 17);
        ctx.strokeStyle = '#818cf8'; ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(0, -21 - i * 5, 8 + i * 1.5, 3.5, 0, 0, Math.PI * 2); ctx.stroke(); }
        ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 10 + p * 8;
        ctx.fillStyle = frame % 10 < 5 ? '#7dd3fc' : '#a78bfa'; ctx.beginPath(); ctx.arc(0, -37, 7.5 + p, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0; ctx.restore();
      };
    }

    function spawnTesla(g, pillar) {
      if (!pillar || g.miniTeslas.some(t => t.__w3Director)) return;
      g.miniTeslas.push({
        x: pillar.x + 30,
        y: pillar.topHeight + Number(C.W3_GAP_SIZE || 142),
        timer: 0,
        vx: -Number(C.W3_SPEED || 2.4),
        pillar,
        __w3Director: true
      });
    }

    function spawnBat(g, step, charged = false) {
      const live = (g.electricBats || []).filter(b => b?.__w3Director && Number(b.x || 0) > -55).length;
      if (live >= 2) return;
      const lanes = [115, 275, Math.min(430, groundY() - 70)];
      const lane = lanes[step % lanes.length];
      g.electricBats.push({
        x: W() + 90 + live * 34,
        y: lane,
        vx: -(charged ? 3.72 : 3.38) - (step % 2) * .18,
        timer: 0,
        __w3Director: true,
        __w3Charged: !!charged
      });
    }

    function spawnCurrent(g, pillar, step) {
      if (g.gravityGates.some(q => q.__w3Current)) return;
      const dir = step % 2 === 0 ? -1 : 1;
      const base = pillar?.gapY ?? H() * .45;
      const y = clamp(base + (dir < 0 ? 22 : -22), 105, groundY() - 70);
      g.__w3CurrentSerial = Number(g.__w3CurrentSerial || 0) + 1;
      g.gravityGates.push({
        x: W() + 105,
        y,
        radius: 25,
        __w3Current: true,
        __w3Dir: dir,
        __w3Director: true,
        __w3Serial: g.__w3CurrentSerial
      });
    }

    function runDirector(g, newPillars) {
      if (!newPillars.length || g.boss?.active || g.state !== 'PLAYING') return;
      for (const pillar of newPillars) {
        const step = Number(g.__w3DirectorStep || 0);
        const score = Number(g.score || 0);
        const stage2Start = Number(C.STAGE1_END || 15);
        const phase2 = score >= stage2Start;

        if (!phase2) {
          // Keep the opening readable, but introduce a few normal Voltbats before Stage 2.
          if (step % 4 === 1) spawnTesla(g, pillar);
          else if (score >= 7 && step % 8 === 5) spawnBat(g, step, false);
        } else {
          // Stage 2 now shows Charged Voltbats clearly and a little more often before the boss.
          // Two bat beats per ten beats is ~20% denser than the previous 1-in-6 cadence.
          const pattern = step % 10;
          if (pattern === 0) spawnTesla(g, pillar);
          else if (pattern === 2 || pattern === 8) spawnBat(g, step, true);
          else if (pattern === 5) spawnCurrent(g, pillar, step);
        }
        g.__w3DirectorStep = step + 1;
      }
    }

    const oldReset = typeof g.reset === 'function' ? g.reset.bind(g) : null;
    if (oldReset) g.reset = function(...args) {
      const r = oldReset(...args);
      this.__w3DirectorStep = 0;
      this.__w3CurrentSerial = 0;
      return r;
    };

    const oldUpdate = typeof g.update === 'function' ? g.update.bind(g) : null;
    if (oldUpdate) g.update = function() {
      const before = this.activeWorld === W3 ? new Set(this.pillars || []) : null;
      const r = oldUpdate();
      if (this.activeWorld === W3 && before) {
        const fresh = (this.pillars || []).filter(p => !before.has(p));
        runDirector(this, fresh);
      }
      return r;
    };

    const oldDraw = typeof g.draw === 'function' ? g.draw.bind(g) : null;
    if (oldDraw) g.draw = function() {
      if (this.activeWorld !== W3) return oldDraw();
      const ctx = this.ctx;
      if (!ctx) return oldDraw();
      const oldBg = this.drawBackground;
      const oldGround = this.drawGround;
      const oldPillar = this.drawPillar;
      this.drawBackground = (c) => this.drawWorld3Background(c, this.frame);
      this.drawGround = (c) => this.drawWorld3Ground(c, this.frame);
      this.drawPillar = (c, p) => this.drawStormPillarSprite(c, p, this.frame);
      let r;
      try { r = oldDraw(); }
      finally { this.drawBackground = oldBg; this.drawGround = oldGround; this.drawPillar = oldPillar; }
      return r;
    };

    installSky(); installPillarArt(); installGround(); installHazardArt();
    g.__w3WorldPolishV1Installed = true;
    console.log('[FF-LAB] w3-world-polish-v1-installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => { tries++; if (install() || tries > 150) clearInterval(timer); }, 80);
  setTimeout(install, 1300);
})();
