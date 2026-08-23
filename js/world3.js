// ===== WORLD 3: STORM PEAKS - Lord Voltbat Boss & Hazards =====
window.World3 = {

  // --- Drawing Functions ---
  drawThunderbirdBossSprite(ctx, x, y, frame, enraged, shield) {
    ctx.save();
    ctx.translate(x, y);

    // 1. Electric Energy Shield Aura
    if (shield > 0) {
      const shieldPulse = Math.sin(frame * 0.2) * 5;
      ctx.beginPath();
      ctx.arc(0, 0, 52 + shieldPulse, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(56, 189, 248, 0.22)";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = (frame % 6 < 3) ? "#38bdf8" : "#c084fc";
      ctx.stroke();

      // Orbiting plasma sparks
      for (let i = 0; i < shield; i++) {
        const a = (frame * 0.08) + (i * Math.PI * 2 / 3);
        const sx = Math.cos(a) * (52 + shieldPulse);
        const sy = Math.sin(a) * (52 + shieldPulse);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI * 2); ctx.stroke();
      }
    }

    const flap = Math.sin(frame * 0.3) * 25;

    // 2. Giant Bat Wings (Left & Right)
    // Left Wing
    ctx.fillStyle = enraged ? "#450a0a" : "#1e1b4b";
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.lineTo(-75, flap - 30); // Wing tip
    ctx.lineTo(-55, flap + 10); // Scallop 1
    ctx.lineTo(-40, flap - 5);  // Rib bone
    ctx.lineTo(-30, flap + 20); // Scallop 2
    ctx.lineTo(-15, 12);
    ctx.closePath(); ctx.fill();

    // Left Wing Ribs & Neon Electric Webbing
    ctx.strokeStyle = enraged ? "#ef4444" : "#818cf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -5); ctx.lineTo(-75, flap - 30);
    ctx.moveTo(-10, -5); ctx.lineTo(-40, flap - 5);
    ctx.moveTo(-10, -5); ctx.lineTo(-15, 12);
    ctx.stroke();

    // Right Wing
    ctx.fillStyle = enraged ? "#450a0a" : "#1e1b4b";
    ctx.beginPath();
    ctx.moveTo(10, -5);
    ctx.lineTo(75, flap - 30);
    ctx.lineTo(55, flap + 10);
    ctx.lineTo(40, flap - 5);
    ctx.lineTo(30, flap + 20);
    ctx.lineTo(15, 12);
    ctx.closePath(); ctx.fill();

    // Right Wing Ribs
    ctx.beginPath();
    ctx.moveTo(10, -5); ctx.lineTo(75, flap - 30);
    ctx.moveTo(10, -5); ctx.lineTo(40, flap - 5);
    ctx.moveTo(10, -5); ctx.lineTo(15, 12);
    ctx.stroke();

    // Electric arcs between wing tips
    if (frame % 4 < 2) {
      ctx.strokeStyle = enraged ? "#fca5a5" : "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-75, flap - 30);
      ctx.lineTo((Math.random() - 0.5) * 30, flap - 45);
      ctx.lineTo(75, flap - 30);
      ctx.stroke();
    }

    // 3. Bat Body & Torso
    ctx.fillStyle = enraged ? "#7f1d1d" : "#0f172a";
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chest Armor Plate
    ctx.fillStyle = enraged ? "#991b1b" : "#312e81";
    ctx.beginPath();
    ctx.moveTo(0, -15); ctx.lineTo(-14, 0); ctx.lineTo(0, 20); ctx.lineTo(14, 0);
    ctx.closePath(); ctx.fill();

    // 4. Bat Head & Large Pointed Ears
    ctx.fillStyle = enraged ? "#7f1d1d" : "#0f172a";
    ctx.beginPath(); ctx.arc(0, -22, 18, 0, Math.PI * 2); ctx.fill();

    // Left Ear
    ctx.fillStyle = enraged ? "#450a0a" : "#1e1b4b";
    ctx.beginPath();
    ctx.moveTo(-6, -32); ctx.lineTo(-24, -58); ctx.lineTo(-12, -26);
    ctx.closePath(); ctx.fill();
    // Inner ear neon
    ctx.fillStyle = enraged ? "#ef4444" : "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(-8, -32); ctx.lineTo(-20, -52); ctx.lineTo(-12, -28);
    ctx.closePath(); ctx.fill();

    // Right Ear
    ctx.fillStyle = enraged ? "#450a0a" : "#1e1b4b";
    ctx.beginPath();
    ctx.moveTo(6, -32); ctx.lineTo(24, -58); ctx.lineTo(12, -26);
    ctx.closePath(); ctx.fill();
    // Inner ear neon
    ctx.fillStyle = enraged ? "#ef4444" : "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(8, -32); ctx.lineTo(20, -52); ctx.lineTo(12, -28);
    ctx.closePath(); ctx.fill();

    // 5. Glowing Red / Yellow Bat Eyes
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(-8, -24, 5, 0, Math.PI * 2); ctx.arc(8, -24, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = enraged ? "#ef4444" : "#f59e0b";
    ctx.shadowBlur = 10; ctx.shadowColor = enraged ? "#ef4444" : "#f59e0b";
    ctx.beginPath(); ctx.arc(-8, -24, 3, 0, Math.PI * 2); ctx.arc(8, -24, 3, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // 6. Bat Snout & Sharp Fangs
    ctx.fillStyle = "#0f172a";
    ctx.beginPath(); ctx.ellipse(0, -16, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
    // Upper Fangs
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(-5, -14); ctx.lineTo(-3, -7); ctx.lineTo(-1, -14); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(1, -14); ctx.lineTo(3, -7); ctx.lineTo(5, -14); ctx.fill();
    // Lower Fangs
    ctx.beginPath();
    ctx.moveTo(-4, -10); ctx.lineTo(-2, -16); ctx.lineTo(0, -10); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.lineTo(2, -16); ctx.lineTo(4, -10); ctx.fill();

    ctx.restore();
  },

  drawElectricBatSprite(ctx, x, y, frame) {
    ctx.save(); ctx.translate(x, y);
    const flap = Math.sin(frame * 0.5) * 16;
    
    // Body
    ctx.fillStyle = "#3b0764";
    ctx.beginPath(); ctx.ellipse(0, 0, 7, 10, 0, 0, Math.PI * 2); ctx.fill();
    
    // Ears
    ctx.beginPath();
    ctx.moveTo(-5, -7); ctx.lineTo(-8, -14); ctx.lineTo(-2, -9);
    ctx.moveTo(5, -7); ctx.lineTo(8, -14); ctx.lineTo(2, -9);
    ctx.fill();
    
    // Electric Wings
    ctx.fillStyle = "#8b5cf6";
    ctx.beginPath();
    ctx.moveTo(-4, -2); ctx.lineTo(-26, flap - 6); ctx.quadraticCurveTo(-16, flap + 6, -12, flap + 2);
    ctx.quadraticCurveTo(-8, 6, -4, 6); ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(4, -2); ctx.lineTo(26, flap - 6); ctx.quadraticCurveTo(16, flap + 6, 12, flap + 2);
    ctx.quadraticCurveTo(8, 6, 4, 6); ctx.fill();
    
    // Glowing Eyes
    ctx.fillStyle = "#fde047";
    ctx.beginPath(); ctx.arc(-3, -3, 2, 0, Math.PI * 2); ctx.arc(3, -3, 2, 0, Math.PI * 2); ctx.fill();
    
    // Spark trail
    ctx.fillStyle = "rgba(192, 132, 252, 0.6)";
    ctx.fillRect(8, -2, 6, 4);
    
    ctx.restore();
  },

  drawMiniTeslaSprite(ctx, x, y, frame) {
    ctx.save();
    ctx.translate(x, y);
    
    // Base Box
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(-14, -10, 28, 20);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.strokeRect(-14, -10, 28, 20);
    
    // Tesla Coil Rod
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(-4, -24, 8, 14);
    
    // Tesla Sphere Core
    const sparkColor = (frame % 10 < 5) ? "#38bdf8" : "#818cf8";
    ctx.fillStyle = sparkColor;
    ctx.shadowBlur = 10; ctx.shadowColor = "#38bdf8";
    ctx.beginPath(); ctx.arc(0, -28, 7, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    
    // Electric Spark Arc
    if (frame % 6 < 3) {
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -28); ctx.lineTo((Math.random() - 0.5) * 20, -35 + (Math.random() - 0.5) * 10);
      ctx.stroke();
    }
    
    ctx.restore();
  },

  drawGravityGateSprite(ctx, x, y, frame, radius) {
    ctx.save();
    ctx.translate(x, y);
    
    const rot = frame * 0.05;
    ctx.rotate(rot);
    
    // Outer Vortex
    ctx.fillStyle = "rgba(139, 92, 246, 0.35)";
    ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();
    
    // Glowing Ring
    ctx.strokeStyle = (frame % 8 < 4) ? "#c4b5fd" : "#38bdf8";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, radius - 2, 0, Math.PI * 2); ctx.stroke();
    
    // Crosshair Lines
    ctx.beginPath(); ctx.moveTo(-radius + 4, 0); ctx.lineTo(radius - 4, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -radius + 4); ctx.lineTo(0, radius - 4); ctx.stroke();
    
    ctx.restore();
  },

  drawPhoenix(ctx, x, y, frame) {
    ctx.save(); ctx.translate(x, y);
    const wingAngle = Math.sin(frame * 0.25) * 0.6;
    
    // Left Wing
    ctx.save(); ctx.translate(-5, -5); ctx.rotate(-wingAngle + 0.4);
    ctx.fillStyle = '#ea580c';
    ctx.beginPath(); ctx.ellipse(-5, 8, 10, 22, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath(); ctx.ellipse(-5, 8, 5, 14, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    
    // Body
    ctx.fillStyle = '#c2410c';
    ctx.beginPath(); ctx.ellipse(0, 5, 18, 22, 0, 0, Math.PI * 2); ctx.fill();
    
    // Head
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(0, -15, 12, 0, Math.PI * 2); ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(-5, -17, 3, 0, Math.PI * 2); ctx.arc(5, -17, 3, 0, Math.PI * 2); ctx.fill();
    
    // Beak
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.moveTo(-3, -10); ctx.lineTo(0, -4); ctx.lineTo(3, -10); ctx.closePath(); ctx.fill();
    
    // Right Wing
    ctx.save(); ctx.translate(5, 0); ctx.rotate(wingAngle - 0.3);
    ctx.fillStyle = '#f97316';
    ctx.beginPath(); ctx.ellipse(5, 10, 12, 20, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath(); ctx.ellipse(5, 10, 6, 12, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    
    ctx.restore();
  },

  // --- Boss AI: Lord Voltbat (World 3) ---
  updateThunderbirdBoss() {
    const boss = this.boss;
    const cx = boss.x; const cy = boss.y;

    if (boss.hp <= 0 && boss.state !== 'EXPLODING') {
      boss.state = 'EXPLODING';
      boss.timer = 0;
      this.sound.playLaser();
      this.score += 500;
      this.screenShake = 35;
      this.lightning = 1;
      return;
    }
    
    if (boss.state === 'EXPLODING') {
      boss.y += 2;
      for (let i = 0; i < 5; i++) {
        this.particles.push({
          x: cx + (Math.random() - 0.5) * 100, y: cy + (Math.random() - 0.5) * 100,
          vx: (Math.random() - 0.5) * 14, vy: (Math.random() - 0.5) * 14,
          size: Math.random() * 8 + 4, color: (Math.random() > 0.5 ? '#38bdf8' : '#fde047'), life: 1
        });
      }
      if (boss.timer > 90) {
         boss.active = false;
         this.state = 'BOSS_OUTRO';
         this.owl.x = CONFIG.CANVAS_WIDTH + 100; this.owl.y = CONFIG.CANVAS_HEIGHT / 2;
         this.startDialogue([I18N[this.lang].w3_owlL1, I18N[this.lang].w3_owlL2]);
         for (let i = 0; i < 60; i++) {
           this.particles.push({
             x: cx + (Math.random() - 0.5) * 150, y: cy + (Math.random() - 0.5) * 150,
             vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30,
             size: Math.random() * 8 + 3, color: '#60a5fa', life: 1.5
           });
         }
      }
      return;
    }

    if (boss.state === 'IDLE') {
      // Smooth tracking hover
      boss.y += ((this.bird.y - boss.y) * 0.03) + Math.sin(boss.timer * 0.06) * 1.8;
      boss.y = Math.max(70, Math.min(CONFIG.CANVAS_HEIGHT - 160, boss.y));

      // Regularly spawn Power Orbs so the player can attack
      if (Math.random() < (boss.enraged ? 0.04 : 0.02) && this.powerOrbs.length < 2) {
        this.powerOrbs.push({ x: CONFIG.CANVAS_WIDTH + 20, y: 120 + Math.random() * (CONFIG.CANVAS_HEIGHT - 260), collected: false });
      }

      const attackCooldown = boss.enraged ? 65 : 100;
      if (boss.timer > attackCooldown) {
        boss.timer = 0;
        const attackList = ['DASH_PREP', 'PLASMA_SHOT', 'SUMMON_SWARM', 'SUMMON_GATES'];
        boss.state = attackList[Math.floor(Math.random() * attackList.length)];
        this.sound.playLaunch();
      }
    }
    else if (boss.state === 'DASH_PREP') {
      boss.x += (CONFIG.CANVAS_WIDTH - 30 - boss.x) * 0.1;
      if (boss.timer > 35) {
        boss.state = 'DASHING';
        boss.timer = 0;
        this.sound.playSmash();
        this.screenShake = 15;
        this.lightning = 0.8;
      }
    }
    else if (boss.state === 'DASHING') {
      boss.x -= boss.enraged ? 22 : 18;
      if (this.frame % 2 === 0) {
        this.particles.push({
          x: boss.x + 30, y: boss.y + (Math.random() - 0.5) * 30,
          vx: Math.random() * 4, vy: (Math.random() - 0.5) * 4,
          size: 3, color: '#38bdf8', life: 0.5
        });
      }
      if (boss.x < -100) {
        boss.state = 'RETURNING';
        boss.x = CONFIG.CANVAS_WIDTH + 60;
        boss.timer = 0;
      }
    }
    else if (boss.state === 'RETURNING') {
      boss.x -= 6;
      if (boss.x <= CONFIG.CANVAS_WIDTH - 80) {
        boss.x = CONFIG.CANVAS_WIDTH - 80;
        boss.state = 'IDLE';
        boss.timer = 0;
      }
    }
    else if (boss.state === 'PLASMA_SHOT') {
      if (boss.timer === 20) {
        this.sound.playThunder();
        this.lightning = 0.8;
        this.screenShake = 10;
        // Triple Plasma shot
        const speed = boss.enraged ? -9 : -7;
        this.bossFeathers.push({ x: cx - 30, y: cy - 20, vx: speed, vy: -2 });
        this.bossFeathers.push({ x: cx - 30, y: cy, vx: speed - 1, vy: 0 });
        this.bossFeathers.push({ x: cx - 30, y: cy + 20, vx: speed, vy: 2 });
      }
      if (boss.timer > 45) {
        boss.state = 'IDLE';
        boss.timer = 0;
      }
    }
    else if (boss.state === 'SUMMON_SWARM') {
      if (boss.timer === 20) {
        this.sound.playFlap();
        const count = boss.enraged ? 4 : 3;
        for (let i = 0; i < count; i++) {
          this.electricBats.push({ x: cx - 20, y: cy - 40 + i * 30, vx: -7 - Math.random() * 2, timer: 0 });
        }
      }
      if (boss.timer > 40) {
        boss.state = 'IDLE';
        boss.timer = 0;
      }
    }
    else if (boss.state === 'SUMMON_GATES') {
      if (boss.timer === 20) {
        this.gravityGates.push({ x: CONFIG.CANVAS_WIDTH + 40, y: 150, radius: 26 });
        this.gravityGates.push({ x: CONFIG.CANVAS_WIDTH + 40, y: 380, radius: 26 });
        this.sound.playThunder();
        this.lightning = 0.6;
      }
      if (boss.timer > 50) {
        boss.state = 'IDLE';
        boss.timer = 0;
      }
    }

    if (boss.shield <= 0 && !boss.enraged) {
      boss.enraged = true;
      this.lightning = 1;
      this.sound.playThunder();
      this.screenShake = 20;
    }

    // Plasma Orbs Collision & Movement
    this.bossFeathers.forEach(p => {
      p.x += p.vx; p.y += (p.vy || 0);
      if (Math.hypot(this.bird.x - p.x, this.bird.y - p.y) < CONFIG.BIRD_RADIUS + 8) {
        if (this.feverActive || this.boss.state === 'EXPLODING' || this.state === 'BOSS_OUTRO' || this.state === 'FLY_AWAY') {
          p.x = -100;
        } else {
          this.gameOver(false);
        }
      }
    });
    this.bossFeathers = this.bossFeathers.filter(p => p.x > -50 && p.x < CONFIG.CANVAS_WIDTH + 50);

    // Boss body collision
    if (boss.state !== 'EXPLODING' && this.state === 'PLAYING') {
      if (Math.hypot(this.bird.x - boss.x, this.bird.y - boss.y) < 45) {
        if (!this.feverActive) this.gameOver(false);
      }
    }
  }
};
