// ===== WORLD 2: FROSTBITE - Emperor Penguin Boss =====
window.World2 = {

  // --- Drawing Functions ---
  drawPenguinBossSprite(ctx, x, y, frame, isEnraged) {
    ctx.save(); ctx.translate(x, y);
    
    if (isEnraged) {
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#ef4444';
    }
    
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0, 5, 35, 8, 0, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = isEnraged ? '#450a0a' : '#0f172a';
    ctx.beginPath(); ctx.ellipse(0, -25, 28, 35, 0, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath(); ctx.ellipse(0, -15, 18, 25, 0, 0, Math.PI*2); ctx.fill();
    
    const bGrad = ctx.createRadialGradient(0, -25, 2, 0, -25, 15);
    bGrad.addColorStop(0, '#fbbf24'); bGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = bGrad;
    ctx.beginPath(); ctx.ellipse(0, -30, 10, 8, 0, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = isEnraged ? '#450a0a' : '#0f172a';
    ctx.beginPath(); ctx.arc(0, -55, 18, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-8, -58, 5, 0, Math.PI*2); ctx.arc(8, -58, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = isEnraged ? '#ef4444' : '#1e293b';
    ctx.beginPath(); ctx.arc(-8, -58, 2.5, 0, Math.PI*2); ctx.arc(8, -58, 2.5, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.moveTo(-5, -50); ctx.lineTo(0, -42); ctx.lineTo(5, -50); ctx.closePath(); ctx.fill();
    
    ctx.fillStyle = '#93c5fd';
    ctx.shadowBlur = 10; ctx.shadowColor = '#60a5fa';
    ctx.beginPath();
    ctx.moveTo(-12, -70); ctx.lineTo(-8, -82); ctx.lineTo(-4, -72);
    ctx.lineTo(0, -85); ctx.lineTo(4, -72);
    ctx.lineTo(8, -82); ctx.lineTo(12, -70);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    
    const flapAngle = Math.sin(frame * 0.2) * 0.3;
    ctx.save(); ctx.translate(-25, -30); ctx.rotate(-0.5 + flapAngle);
    ctx.fillStyle = isEnraged ? '#450a0a' : '#0f172a';
    ctx.beginPath(); ctx.ellipse(0, 0, 8, 20, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.translate(25, -30); ctx.rotate(0.5 - flapAngle);
    ctx.fillStyle = isEnraged ? '#450a0a' : '#0f172a';
    ctx.beginPath(); ctx.ellipse(0, 0, 8, 20, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-18, 0, 12, 5); ctx.fillRect(6, 0, 12, 5);
    
    ctx.restore();
  },

  drawEagle(ctx, x, y, frame) {
    ctx.save(); ctx.translate(x, y);
    const wingAngle = Math.sin(frame * 0.25) * 0.6;
    
    ctx.save(); ctx.translate(-5, -5); ctx.rotate(-wingAngle + 0.4);
    ctx.fillStyle = '#78350f';
    ctx.beginPath(); ctx.ellipse(-5, 8, 10, 22, -0.2, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    
    ctx.fillStyle = '#451a03';
    ctx.beginPath(); ctx.ellipse(0, 5, 18, 22, 0, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath(); ctx.arc(0, -15, 12, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = '#78350f';
    ctx.beginPath(); ctx.arc(-5, -17, 3, 0, Math.PI*2); ctx.arc(5, -17, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(-5, -17, 1.5, 0, Math.PI*2); ctx.arc(5, -17, 1.5, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.moveTo(-3, -10); ctx.lineTo(0, -4); ctx.lineTo(3, -10); ctx.closePath(); ctx.fill();
    
    ctx.save(); ctx.translate(5, 0); ctx.rotate(wingAngle - 0.3);
    ctx.fillStyle = '#92400e';
    ctx.beginPath(); ctx.ellipse(5, 10, 12, 20, 0.2, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    
    ctx.restore();
  },

  // --- Boss AI: Emperor Penguin (World 2) ---
  updatePenguinBoss() {
    const boss = this.boss;
    const fireRate = boss.enraged ? 30 : 60;
    const groundY = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - 5;
    
    boss.dodgeCooldown = (boss.dodgeCooldown || 0);
    if (boss.dodgeCooldown > 0) boss.dodgeCooldown--;

    if (boss.state === 'IDLE') {
      boss.y = groundY;
      const targetX = Math.max(CONFIG.CANVAS_WIDTH * 0.5, Math.min(CONFIG.CANVAS_WIDTH - 40, boss.x));
      boss.x += (boss.x > CONFIG.CANVAS_WIDTH * 0.65 ? -0.5 : 0.5) * (boss.enraged ? 2.5 : 1.5);
      
      // Dodge incoming hero projectile if not on cooldown
      if (boss.dodgeCooldown <= 0 && this.heroProjectiles && this.heroProjectiles.some(p => p.active && p.x > boss.x - 140 && p.x < boss.x - 30)) {
        if (Math.random() < (boss.enraged ? 0.6 : 0.45)) {
          boss.state = 'DODGING';
          boss.timer = 0;
          boss.dodgeCooldown = boss.enraged ? 70 : 110;
          boss.dodgeDir = boss.x > CONFIG.CANVAS_WIDTH - 70 ? -1 : 1;
          this.sound.playFlap();
          const dodgeTxt = (I18N[this.lang] && I18N[this.lang].dodgeText) || 'DODGE! 💨';
          this.floatingText.push({ text: dodgeTxt, x: boss.x, y: boss.y - 65, life: 0.9, color: '#38bdf8' });
          for (let i = 0; i < 15; i++) {
            this.particles.push({ x: boss.x + (Math.random()-0.5)*40, y: groundY, vx: (Math.random()-0.5)*12, vy: -Math.random()*6, size: 3, color: '#bfdbfe', life: 0.6 });
          }
        } else {
          boss.dodgeCooldown = 50; // Missed dodge chance, open for hit
        }
      }

      if (boss.timer > 0 && boss.timer % fireRate === 0) {
        const speed = boss.enraged ? 9.5 : 7.5;
        // Central snowball targeting player
        this.snowballs.push({ x: boss.x - 20, y: boss.y - 30, vx: -speed, vy: (this.bird.y - boss.y) * 0.02 });
        // In enraged mode or 40% chance, fire triple spread
        if (boss.enraged || Math.random() < 0.4) {
          this.snowballs.push({ x: boss.x - 20, y: boss.y - 30, vx: -speed * 0.9, vy: (this.bird.y - boss.y) * 0.02 - 2.2 });
          this.snowballs.push({ x: boss.x - 20, y: boss.y - 30, vx: -speed * 0.9, vy: (this.bird.y - boss.y) * 0.02 + 2.2 });
        }
        this.sound.playFlap();
      }
      
      if (Math.random() < (boss.enraged ? 0.04 : 0.02) && this.powerOrbs.length < 2) {
        this.powerOrbs.push({ x: CONFIG.CANVAS_WIDTH + 20, y: 180 + Math.random()*(CONFIG.CANVAS_HEIGHT-380), collected: false });
      }
      
      if (boss.timer > (boss.enraged ? 70 : 130)) {
        const attacks = ['JUMP_PREP', 'SLIDE_PREP'];
        boss.state = attacks[Math.floor(Math.random() * attacks.length)];
        boss.timer = 0;
        this.sound.playLaunch();
      }
    }
    else if (boss.state === 'DODGING') {
      boss.y = groundY + Math.sin(boss.timer * 0.25) * -20; // Quick nimble hop
      boss.x += (boss.dodgeDir || 1) * (boss.enraged ? 4 : 3);
      boss.x = Math.max(CONFIG.CANVAS_WIDTH * 0.45, Math.min(CONFIG.CANVAS_WIDTH - 30, boss.x));
      if (this.frame % 2 === 0) {
        this.particles.push({ x: boss.x, y: groundY, vx: Math.random()*2, vy: -Math.random()*2, size: 3, color: '#93c5fd', life: 0.5 });
      }
      if (boss.timer > 25) {
        boss.y = groundY;
        boss.state = 'IDLE';
        boss.timer = 0;
      }
    }
    else if (boss.state === 'JUMP_PREP') {
      boss.y = groundY + 5;
      if (boss.timer > 30) {
        boss.state = 'JUMPING';
        boss.jumpVy = boss.enraged ? -21 : -17;
        boss.timer = 0;
        this.sound.playSmash();
      }
    }
    else if (boss.state === 'JUMPING') {
      boss.jumpVy += 0.5;
      boss.y += boss.jumpVy;
      boss.x += (this.bird.x - boss.x) * (boss.enraged ? 0.06 : 0.035);
      
      if (boss.y >= groundY) {
        boss.y = groundY;
        boss.state = 'LANDING';
        boss.timer = 0;
        this.screenShake = boss.enraged ? 35 : 25;
        this.sound.playSmash();
        for (let i = 0; i < 30; i++) {
          this.particles.push({ x: boss.x + (Math.random()-0.5)*80, y: groundY, vx: (Math.random()-0.5)*20, vy: -Math.random()*12, size: Math.random()*6+3, color: '#e2e8f0', life: 1 });
        }
        // Avalanche Slam: Drop 2 icicles from the ceiling
        if (this.icicles.length < 4) {
          this.icicles.push({ x: Math.max(40, Math.min(CONFIG.CANVAS_WIDTH - 40, this.bird.x + (Math.random() - 0.5) * 60)), y: -30, state: 'FALL', timer: 0 });
          this.icicles.push({ x: Math.random() * (CONFIG.CANVAS_WIDTH - 80) + 40, y: -30, state: 'FALL', timer: 0 });
        }
      }
    }
    else if (boss.state === 'LANDING') {
      if (boss.timer > 30) {
        boss.state = 'IDLE';
        boss.timer = 0;
      }
    }
    else if (boss.state === 'SLIDE_PREP') {
      boss.x += 2;
      if (boss.timer > 30) {
        boss.state = 'SLIDING';
        boss.slideSpeed = boss.enraged ? -24 : -18;
        boss.timer = 0;
        this.sound.playLaunch();
      }
    }
    else if (boss.state === 'SLIDING') {
      boss.y = groundY + 10;
      boss.x += boss.slideSpeed;
      if (this.frame % 2 === 0) {
        this.particles.push({ x: boss.x + 30, y: groundY, vx: Math.random()*3, vy: -Math.random()*2, size: Math.random()*4+2, color: '#bfdbfe', life: 0.6 });
      }
      
      if (boss.x < -100) {
        boss.state = 'RETURNING';
        boss.x = CONFIG.CANVAS_WIDTH + 50;
        boss.timer = 0;
      }
    }
    else if (boss.state === 'RETURNING') {
      boss.y = groundY;
      boss.x -= 4;
      if (boss.x <= CONFIG.CANVAS_WIDTH - 80) {
        boss.state = 'IDLE';
        boss.timer = 0;
      }
    }
    else if (boss.state === 'EXPLODING') {
      if (boss.timer % 5 === 0) {
        for (let i = 0; i < 5; i++) {
          this.particles.push({ x: boss.x + (Math.random()-0.5)*80, y: boss.y - 30 + (Math.random()-0.5)*60, vx: (Math.random()-0.5)*15, vy: (Math.random()-0.5)*15, size: Math.random()*6+3, color: Math.random()>0.5?'#93c5fd':'#bfdbfe', life: 1 });
        }
      }
      if (boss.timer > 90) {
        boss.active = false;
        this.state = 'BOSS_OUTRO';
        this.owl.x = CONFIG.CANVAS_WIDTH + 100; this.owl.y = CONFIG.CANVAS_HEIGHT / 2;
        this.startDialogue([I18N[this.lang].w2_owlL1, I18N[this.lang].w2_owlL2]);
        this.screenShake = 0;
        for (let i = 0; i < 60; i++) {
          this.particles.push({ x: boss.x + (Math.random()-0.5)*150, y: boss.y - 30 + (Math.random()-0.5)*150, vx: (Math.random()-0.5)*30, vy: (Math.random()-0.5)*30, size: Math.random()*8+3, color: '#60a5fa', life: 1.5 });
        }
      }
    }

    // Snowball collision
    this.snowballs.forEach(s => {
      if (s.vx > -3) s.vx = -8;
      s.x += s.vx; s.y += s.vy;
      s.vy += 0.05;
      if (this.invincibleTimer <= 0 && Math.hypot(this.bird.x - s.x, this.bird.y - s.y) < CONFIG.BIRD_RADIUS + 10) {
        if (this.feverActive || this.boss.state === 'EXPLODING' || this.state === 'BOSS_OUTRO' || this.state === 'FLY_AWAY') s.x = -200; else this.gameOver(false);
      }
    });
    this.snowballs = this.snowballs.filter(s => s.x > -50 && s.x < CONFIG.CANVAS_WIDTH + 50 && s.y < CONFIG.CANVAS_HEIGHT);

    // Boss body collision
    if (boss.state !== 'EXPLODING' && this.state === 'PLAYING') {
      const hitDist = boss.state === 'SLIDING' ? 45 : 40;
      if (this.invincibleTimer <= 0 && Math.hypot(this.bird.x - boss.x, this.bird.y - (boss.y - 25)) < hitDist) {
        if (!this.feverActive) this.gameOver(false);
      }
    }
  }
};
