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

    function installPillarArt() {
      g.__w3StormPillarSystem = {
        version: '2.0.0',
        variants: ['standard', 'charged', 'heavy'],
        modular: true,
        animatedEnergy: true,
        lightningReactive: true,
        preservesHitbox: true
      };
    }

    function installCurrentArt() {
      const oldGlobalGate = window.drawGravityGate;
      if (typeof oldGlobalGate === 'function' && !window.__ffW3LegacyGateHiddenV1) {
        window.__ffW3LegacyGateHiddenV1 = true;
        window.drawGravityGate = function(...args) {
          if (window.game?.activeWorld === W3) return;
          return oldGlobalGate(...args);
        };
      }

      const oldGateSprite = typeof g.drawGravityGateSprite === 'function'
        ? g.drawGravityGateSprite.bind(g)
        : null;
      if (oldGateSprite) {
        g.drawGravityGateSprite = function(ctx, x, y, frame, radius) {
          if (this.activeWorld !== W3) return oldGateSprite(ctx, x, y, frame, radius);
          const gate = (this.gravityGates || []).find(q =>
            Math.abs(Number(q?.x || 0) - x) < .75 &&
            Math.abs(Number(q?.y || 0) - y) < .75
          );
          if (!gate?.__w3Current) return;

          const dir = Number(gate.__w3Dir || -1);
          const pulse = 1 + Math.sin(frame * .14) * .08;
          ctx.save();
          ctx.translate(x, y);
          ctx.scale(pulse, pulse);
          ctx.fillStyle = 'rgba(56,189,248,.14)';
          ctx.strokeStyle = dir < 0 ? '#7dd3fc' : '#c4b5fd';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.lineCap = 'round';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(0, dir < 0 ? 12 : -12);
          ctx.lineTo(0, dir < 0 ? -9 : 9);
          ctx.stroke();

          ctx.fillStyle = dir < 0 ? '#7dd3fc' : '#c4b5fd';
          ctx.beginPath();
          if (dir < 0) {
            ctx.moveTo(0, -17); ctx.lineTo(-8, -7); ctx.lineTo(8, -7);
          } else {
            ctx.moveTo(0, 17); ctx.lineTo(-8, 7); ctx.lineTo(8, 7);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        };
      }
    }

    function applyStormCurrent(x) {
      if (x.activeWorld !== W3 || x.state !== 'PLAYING') return;
      const birdR = Number(C.BIRD_RADIUS || 14);
      for (const gate of (x.gravityGates || [])) {
        if (!gate?.__w3Current || gate.__w3Consumed) continue;
        if (Math.hypot(x.bird.x - gate.x, x.bird.y - gate.y) >= Number(gate.radius || 25) + birdR) continue;
        gate.__w3Consumed = true;
        gate.x = -120;
        x.gravityFlipped = false;
        if (Number(gate.__w3Dir || -1) < 0) x.bird.velocity = Math.min(Number(x.bird.velocity || 0), -4.8);
        else x.bird.velocity = Math.max(Number(x.bird.velocity || 0), 3.9);
        x.screenShake = Math.max(Number(x.screenShake || 0), 5);
        x.sound?.playLaser?.();
      }
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

    function stylePillar(g, pillar, step, phase2) {
      if (!pillar || pillar.__w3Variant) return;
      let variant = 'standard';
      if (phase2) {
        const pick = step % 5;
        variant = pick === 0 ? 'heavy' : (pick === 1 || pick === 4 ? 'standard' : 'charged');
      } else if (step % 7 === 5) {
        variant = 'heavy';
      }
      pillar.__w3Variant = variant;
      pillar.__w3EnergySeed = (step * 29 + Math.round(Number(pillar.topHeight || 0))) % 101;
    }

    function runDirector(g, newPillars) {
      if (!newPillars.length || g.boss?.active || g.state !== 'PLAYING') return;
      for (const pillar of newPillars) {
        const step = Number(g.__w3DirectorStep || 0);
        const score = Number(g.score || 0);
        const stage2Start = Number(C.STAGE1_END || 15);
        const phase2 = score >= stage2Start;
        stylePillar(g, pillar, step, phase2);

        if (!phase2) {
          if (step % 4 === 1) spawnTesla(g, pillar);
          else if (score >= 7 && step % 8 === 5) spawnBat(g, step, false);
        } else {
          const pattern = step % 9;
          if (pattern === 0) spawnTesla(g, pillar);
          else if (pattern === 2 || pattern === 4 || pattern === 7) spawnBat(g, step, true);
          else if (pattern === 6) spawnCurrent(g, pillar, step);
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
      const isW3 = this.activeWorld === W3;
      const before = isW3 ? new Set(this.pillars || []) : null;
      const gatesBefore = isW3 ? new Set(this.gravityGates || []) : null;
      const gateRadii = new Map();

      if (isW3) {
        for (const gate of (this.gravityGates || [])) {
          if (!gate?.__w3Current) continue;
          gateRadii.set(gate, gate.radius);
          gate.radius = -9999;
        }
        this.gravityFlipped = false;
      }

      const r = oldUpdate();

      if (isW3 && before) {
        this.gravityGates = (this.gravityGates || []).filter(gate =>
          gate?.__w3Current || gatesBefore?.has(gate)
        );
        for (const gate of this.gravityGates) {
          if (gateRadii.has(gate)) gate.radius = gateRadii.get(gate);
        }
        this.gravityFlipped = false;

        const fresh = (this.pillars || []).filter(p => !before.has(p));
        runDirector(this, fresh);
        applyStormCurrent(this);
      }
      return r;
    };

    // Background and ground are intentionally not owned here.
    // World 3 environment is provided only by w3-environment-png-v1.js.
    installPillarArt(); installCurrentArt(); installHazardArt();
    g.__w3LegacyEnvironmentIsolated = true;
    g.__w3WorldPolishV1Installed = true;
    console.log('[FF-LAB] w3-world-polish-v1-installed (Storm Spire pillars v2)');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => { tries++; if (install() || tries > 150) clearInterval(timer); }, 80);
  setTimeout(install, 1300);
})();