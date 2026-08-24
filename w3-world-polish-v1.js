(() => {
  'use strict';

  function install() {
    const game = window.game;
    if (!game) return false;
    if (game.__w3WorldPolishV1Installed) return true;

    const C = (typeof CONFIG !== 'undefined' && CONFIG) ? CONFIG : {};
    const W3 = 2;
    const W = () => Number(C.CANVAS_WIDTH || 360);
    const H = () => Number(C.CANVAS_HEIGHT || 640);
    const groundY = () => H() - Number(C.GROUND_HEIGHT || 95);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const hash = n => {
      const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    // Remove the first/legacy W3 hazard render pass; the richer W3 sprite pass later in draw() remains.
    const oldDrawElectricBat = window.drawElectricBat;
    const oldDrawMiniTesla = window.drawMiniTesla;
    const oldDrawGravityGate = window.drawGravityGate;
    if (typeof oldDrawElectricBat === 'function') {
      window.drawElectricBat = function(...args) {
        if (window.game?.activeWorld === W3) return;
        return oldDrawElectricBat(...args);
      };
    }
    if (typeof oldDrawMiniTesla === 'function') {
      window.drawMiniTesla = function(...args) {
        if (window.game?.activeWorld === W3) return;
        return oldDrawMiniTesla(...args);
      };
    }
    if (typeof oldDrawGravityGate === 'function') {
      window.drawGravityGate = function(...args) {
        if (window.game?.activeWorld === W3) return;
        return oldDrawGravityGate(...args);
      };
    }

    // New Storm Spire background: cloud sea, distant lightning towers and layered peaks.
    game.drawStormSpireBackground = function() {
      const ctx = this.ctx;
      const w = W(), h = H(), gy = groundY();
      const phase2 = Number(this.score || 0) >= Number(C.STAGE1_END || 15);
      ctx.save();

      // High cloud shelf.
      const cloudOffset = (this.frame * 0.12) % 170;
      ctx.fillStyle = phase2 ? 'rgba(49,46,129,.42)' : 'rgba(30,41,59,.40)';
      for (let x = -220; x < w + 220; x += 85) {
        const cx = x - cloudOffset;
        const y = 105 + Math.sin((x + 40) * 0.035) * 18;
        ctx.beginPath();
        ctx.ellipse(cx, y, 62, 21, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 42, y + 5, 50, 17, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Distant mountain teeth.
      const far = (this.frame * 0.16) % 220;
      ctx.fillStyle = phase2 ? 'rgba(24,20,58,.82)' : 'rgba(15,23,42,.84)';
      ctx.beginPath();
      ctx.moveTo(-20, gy);
      for (let x = -220; x <= w + 240; x += 55) {
        const rx = x - far;
        const peak = 175 + hash(Math.floor(x / 55)) * 90;
        ctx.lineTo(rx + 28, gy - peak);
        ctx.lineTo(rx + 55, gy);
      }
      ctx.lineTo(w + 20, gy);
      ctx.closePath();
      ctx.fill();

      // Far thunder spires with tiny energized caps.
      const towerOffset = (this.frame * 0.30) % 190;
      for (let x = -190; x < w + 190; x += 190) {
        const tx = x - towerOffset + 28;
        const towerH = 110 + hash(Math.floor(x / 190) + 8) * 75;
        ctx.fillStyle = phase2 ? 'rgba(30,27,75,.92)' : 'rgba(17,24,39,.92)';
        ctx.beginPath();
        ctx.moveTo(tx - 22, gy);
        ctx.lineTo(tx - 14, gy - towerH + 28);
        ctx.lineTo(tx - 5, gy - towerH + 18);
        ctx.lineTo(tx, gy - towerH - 18);
        ctx.lineTo(tx + 5, gy - towerH + 18);
        ctx.lineTo(tx + 14, gy - towerH + 28);
        ctx.lineTo(tx + 22, gy);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(56,189,248,.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tx, gy - towerH - 20);
        ctx.lineTo(tx, gy - towerH + 12);
        ctx.stroke();
      }

      // Near cloud sea gives the world height without trees/forest silhouettes.
      const mistOffset = (this.frame * 0.48) % 95;
      ctx.fillStyle = phase2 ? 'rgba(76,29,149,.20)' : 'rgba(51,65,85,.28)';
      for (let x = -120; x < w + 120; x += 70) {
        const mx = x - mistOffset;
        const my = gy - 58 + Math.sin((x + this.frame) * 0.025) * 8;
        ctx.beginPath();
        ctx.ellipse(mx, my, 54, 22, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Deterministic distant lightning: readable atmosphere, no random draw-time allocations.
      const period = phase2 ? 190 : 300;
      const flashAge = this.frame % period;
      if (flashAge < 12) {
        const cycle = Math.floor(this.frame / period);
        const lx = 85 + hash(cycle + 17) * (w - 170);
        ctx.globalAlpha = (12 - flashAge) / 18;
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = phase2 ? 2.3 : 1.6;
        ctx.beginPath();
        ctx.moveTo(lx, 32);
        for (let i = 1; i <= 7; i++) {
          const yy = 32 + i * 33;
          const xx = lx + Math.sin((cycle + i) * 2.13) * 17;
          ctx.lineTo(xx, yy);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    };

    const oldDarkForest = typeof game.drawDarkForest === 'function' ? game.drawDarkForest.bind(game) : null;
    if (oldDarkForest) {
      game.drawDarkForest = function() {
        if (this.activeWorld === W3) return this.drawStormSpireBackground();
        return oldDarkForest();
      };
    }

    // Replace W2 blizzard art reused by W3 story with a true storm-entry sequence.
    game.drawStormIntro = function() {
      const ctx = this.ctx, w = W(), h = H();
      ctx.save();
      ctx.fillStyle = 'rgba(15,23,42,.22)';
      ctx.fillRect(0, 0, w, h);

      // Wind/rain bands.
      ctx.strokeStyle = 'rgba(186,230,253,.52)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 24; i++) {
        const x = (w + 120) - ((this.frame * 7 + i * 41) % (w + 160));
        const y = (i * 29 + this.frame * 3) % (h - 120);
        ctx.moveTo(x, y);
        ctx.lineTo(x - 34, y + 14);
      }
      ctx.stroke();

      // Rolling storm cloud bands.
      ctx.fillStyle = 'rgba(49,46,129,.35)';
      const off = (this.frame * .55) % 100;
      for (let x = -120; x < w + 120; x += 80) {
        ctx.beginPath();
        ctx.ellipse(x - off, 120 + Math.sin(x * .04) * 18, 65, 26, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Periodic centered bolt behind the dialogue box.
      if ((this.frame % 95) < 10) {
        ctx.globalAlpha = .7;
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(w * .72, 25);
        ctx.lineTo(w * .66, 92);
        ctx.lineTo(w * .73, 91);
        ctx.lineTo(w * .60, 184);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    };

    const oldBlizzardIntro = typeof game.drawBlizzardIntro === 'function' ? game.drawBlizzardIntro.bind(game) : null;
    if (oldBlizzardIntro) {
      game.drawBlizzardIntro = function() {
        if (this.activeWorld === W3) return this.drawStormIntro();
        return oldBlizzardIntro();
      };
    }

    // Storm Current visual: communicates vertical push instead of a hidden control inversion.
    const oldGateSprite = typeof game.drawGravityGateSprite === 'function' ? game.drawGravityGateSprite.bind(game) : null;
    if (oldGateSprite) {
      game.drawGravityGateSprite = function(ctx, x, y, frame, radius) {
        const gate = this.gravityGates?.find(g => Math.abs(g.x - x) < .5 && Math.abs(g.y - y) < .5);
        if (this.activeWorld !== W3 || !gate?.__w3Current) return oldGateSprite(ctx, x, y, frame, radius);
        const dir = gate.__w3Dir || -1;
        ctx.save();
        ctx.translate(x, y);
        const pulse = 1 + Math.sin(frame * .14) * .08;
        ctx.scale(pulse, pulse);
        ctx.fillStyle = 'rgba(56,189,248,.16)';
        ctx.strokeStyle = dir < 0 ? '#7dd3fc' : '#c4b5fd';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, dir < 0 ? 12 : -12);
        ctx.lineTo(0, dir < 0 ? -10 : 10);
        ctx.stroke();
        ctx.fillStyle = dir < 0 ? '#7dd3fc' : '#c4b5fd';
        ctx.beginPath();
        if (dir < 0) { ctx.moveTo(0,-17); ctx.lineTo(-8,-7); ctx.lineTo(8,-7); }
        else { ctx.moveTo(0,17); ctx.lineTo(-8,7); ctx.lineTo(8,7); }
        ctx.closePath(); ctx.fill();
        ctx.restore();
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

    function spawnBat(g, step) {
      if (g.electricBats.some(b => b.__w3Director)) return;
      const lanes = [115, 275, Math.min(430, groundY() - 70)];
      const lane = lanes[step % lanes.length];
      g.electricBats.push({
        x: W() + 90,
        y: lane,
        vx: -(3.25 + (step % 2) * .25),
        timer: 0,
        __w3Director: true
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
        const phase2 = Number(g.score || 0) >= Number(C.STAGE1_END || 15);

        if (!phase2) {
          // Phase 1 teaches the Storm Spire: a single Tesla every four pillar beats.
          if (step % 4 === 1) spawnTesla(g, pillar);
        } else {
          // Phase 2 uses one readable hazard, then one full rest beat. Never stack all systems together.
          const pattern = step % 6;
          if (pattern === 0) spawnTesla(g, pillar);
          else if (pattern === 2) spawnBat(g, step);
          else if (pattern === 4) spawnCurrent(g, pillar, step);
        }
        g.__w3DirectorStep = step + 1;
      }
    }

    function applyStormCurrent(g) {
      const birdR = Number(C.BIRD_RADIUS || 14);
      for (const gate of g.gravityGates) {
        if (!gate.__w3Current || gate.__w3Consumed) continue;
        if (Math.hypot(g.bird.x - gate.x, g.bird.y - gate.y) < gate.radius + birdR) {
          gate.__w3Consumed = true;
          gate.x = -120;
          g.gravityFlipped = false;
          if ((gate.__w3Dir || -1) < 0) g.bird.velocity = Math.min(g.bird.velocity, -4.8);
          else g.bird.velocity = Math.max(g.bird.velocity, 3.9);
          g.screenShake = Math.max(g.screenShake || 0, 5);
          g.sound?.playLaser?.();
          const text = g.lang === 'ar' ? ((gate.__w3Dir || -1) < 0 ? 'تيار صاعد' : 'تيار هابط') : ((gate.__w3Dir || -1) < 0 ? 'UPDRAFT' : 'DOWNDRAFT');
          g.floatingText.push({ text, x: g.bird.x + 10, y: g.bird.y - 26, life: .75, color: '#7dd3fc' });
          for (let i = 0; i < 12; i++) g.particles.push({
            x: g.bird.x + (Math.random() - .5) * 26,
            y: g.bird.y + (Math.random() - .5) * 26,
            vx: -1 - Math.random() * 3,
            vy: (gate.__w3Dir || -1) * (1 + Math.random() * 4),
            size: 1.5 + Math.random() * 2,
            color: '#7dd3fc', life: .6
          });
        }
      }
    }

    function addWeather(g) {
      if (g.gfxEnabled === false || g.boss?.active) return;
      if (!['PLAYING', 'STORY', 'LAUNCH'].includes(g.state)) return;
      const phase2 = Number(g.score || 0) >= Number(C.STAGE1_END || 15);
      const every = phase2 ? 2 : 4;
      if (g.frame % every === 0 && g.rain.length < (phase2 ? 48 : 28)) {
        g.rain.push({ x: Math.random() * W(), y: -18, vy: phase2 ? 15 + Math.random() * 5 : 10 + Math.random() * 4, __w3StageRain: true });
      }
      const flashPeriod = phase2 ? 250 : 390;
      if (g.state === 'PLAYING' && g.frame > 30 && g.frame % flashPeriod === 0) {
        g.lightning = Math.max(g.lightning || 0, phase2 ? .34 : .20);
      }
    }

    const oldUpdate = typeof game.update === 'function' ? game.update.bind(game) : null;
    if (oldUpdate) {
      game.update = function() {
        if (this.activeWorld !== W3 || this.boss?.active) return oldUpdate();

        // Snapshot pre-existing hazards so random W3 spawns from the legacy loop can be rejected post-update.
        const beforePillars = new Set(this.pillars || []);
        const beforeTesla = new Set(this.miniTeslas || []);
        const beforeBats = new Set(this.electricBats || []);
        const beforeGates = new Set(this.gravityGates || []);
        const gateRadii = new Map();

        // Disable legacy gravity-flip collision while still allowing gates to scroll normally.
        for (const gate of this.gravityGates || []) {
          gateRadii.set(gate, gate.radius);
          gate.radius = -9999;
        }
        this.gravityFlipped = false;

        const result = oldUpdate();

        // Keep only hazards that existed before this tick; director owns all new normal-stage W3 hazard births.
        this.miniTeslas = (this.miniTeslas || []).filter(x => beforeTesla.has(x));
        this.electricBats = (this.electricBats || []).filter(x => beforeBats.has(x));
        this.gravityGates = (this.gravityGates || []).filter(x => beforeGates.has(x));

        for (const gate of this.gravityGates) {
          gate.radius = gateRadii.get(gate) ?? 25;
          if (!gate.__w3Current) {
            gate.__w3Current = true;
            this.__w3CurrentSerial = Number(this.__w3CurrentSerial || 0) + 1;
            gate.__w3Serial = gate.__w3Serial || this.__w3CurrentSerial;
            gate.__w3Dir = (gate.__w3Serial % 2 === 0) ? -1 : 1;
          }
        }
        this.gravityFlipped = false;

        const newPillars = (this.pillars || []).filter(p => !beforePillars.has(p));
        runDirector(this, newPillars);
        applyStormCurrent(this);
        addWeather(this);
        return result;
      };
    }

    game.__w3WorldPolishV1Installed = true;
    console.log('[FF-LAB] w3-world-polish-v1-installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 100) clearInterval(timer);
  }, 80);
  setTimeout(install, 1200);
})();
