// ===== WORLD 1: ANCIENT RUINS - Crow King Boss =====
window.World1 = {

  // --- Boss Activation (shared entry point for all worlds) ---
  activateBoss() {
    // Clear all entities
    this.pillars = []; this.coins = []; this.minions = [];
    this.snowballs = []; this.icicles = []; this.penguinMinions = [];
    this.powerOrbs = []; this.heroProjectiles = [];
    this.miniTeslas = []; this.electricBats = []; this.gravityGates = [];
    
    this.boss.active = true;
    this.boss.enraged = false;
    this.boss.timer = 0;
    
    if (this.activeWorld === 2) {
      // Thunderbird Boss
      this.boss.type = 'thunderbird';
      this.boss.hp = CONFIG.W3_BOSS_HP;
      this.boss.shield = 3;
      this.boss.x = CONFIG.CANVAS_WIDTH + 100;
      this.boss.y = CONFIG.CANVAS_HEIGHT/2;
      this.boss.state = 'INTRO_FLY';
      document.getElementById('stageDisplay').textContent = I18N[this.lang].w3_bossStage;
    } else if (this.activeWorld === 1) {
      // Emperor Penguin Boss (grounded)
      this.boss.type = 'penguin';
      this.boss.hp = CONFIG.W2_BOSS_HP;
      this.boss.x = CONFIG.CANVAS_WIDTH + 100;
      this.boss.y = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - 5;
      this.boss.jumpVy = 0;
      this.boss.baseY = this.boss.y;
      document.getElementById('stageDisplay').textContent = I18N[this.lang].w2_bossStage;
    } else {
      // Crow King Boss (flying)
      this.boss.type = 'crow';
      this.boss.hp = CONFIG.BOSS_HP;
      this.boss.x = CONFIG.CANVAS_WIDTH + 100;
      this.boss.y = CONFIG.CANVAS_HEIGHT/2;
      document.getElementById('stageDisplay').textContent = I18N[this.lang].bossStage;
    }
    
    this.boss.state = 'INTRO_FLY';
    this.boss.timer = 0;
    this.state = 'BOSS_WARNING';
    
    document.getElementById('gameHud').classList.add('hidden');
    document.getElementById('stageDisplay').style.color = '#ef4444';
    const w = document.getElementById('bossWarning');
    w.classList.remove('hidden');
    this.sound.playThunder();
    this.lightning = 1;
  },

  // --- Drawing Functions ---
  drawCrowBoss(ctx, x, y, frame, isEnraged) {
    ctx.save(); ctx.translate(x, y);
    const wingY = Math.sin(frame * 0.4) * 20;
    
    ctx.fillStyle = '#020617';
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(30, -50 + wingY); ctx.lineTo(20, 0); ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.moveTo(25, 0); ctx.lineTo(60, -5); ctx.lineTo(65, 15); ctx.lineTo(20, 15); ctx.fill();

    ctx.fillStyle = isEnraged ? '#7f1d1d' : '#0f172a';
    ctx.beginPath(); ctx.ellipse(5, 5, 30, 20, Math.PI/8, 0, Math.PI*2); ctx.fill();
    
    ctx.beginPath(); ctx.arc(-20, -5, 16, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-20, -15); ctx.lineTo(-10, -35); ctx.lineTo(-5, -15); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-10, -20); ctx.lineTo(0, -30); ctx.lineTo(5, -15); ctx.fill();

    ctx.fillStyle = isEnraged ? '#fde047' : '#ef4444';
    ctx.beginPath(); ctx.moveTo(-25, -10); ctx.lineTo(-32, -4); ctx.lineTo(-22, -6); ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.moveTo(-30, -5); ctx.quadraticCurveTo(-50, -5, -60, 5); ctx.quadraticCurveTo(-45, 10, -30, 5); ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(40, -60 + wingY); ctx.lineTo(25, 10); ctx.fill();

    ctx.restore();
  },

  drawCrowFeather(ctx, x, y, vx, vy) {
    const angle = Math.atan2(vy, vx);
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    ctx.fillStyle = '#ef4444'; ctx.beginPath();
    ctx.moveTo(-10, 0); ctx.quadraticCurveTo(0, -5, 10, 0); ctx.quadraticCurveTo(0, 5, -10, 0); ctx.fill();
    ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke();
    ctx.restore();
  },

  drawOwl(ctx, x, y, frame) {
    ctx.save(); ctx.translate(x, y);
    const wingAngle = Math.sin(frame * 0.2) * 0.5;
    
    ctx.save();
    ctx.translate(5, -5);
    ctx.rotate(-wingAngle + 0.5);
    ctx.fillStyle = '#78350f';
    ctx.beginPath(); ctx.ellipse(0, 8, 7, 14, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#d4d4d8';
    ctx.beginPath(); ctx.ellipse(0, 5, 20, 25, 0, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = '#e4e4e7';
    ctx.beginPath(); ctx.ellipse(-5, 10, 12, 15, 0, 0, Math.PI*2); ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.arc(-10, -5, 7, 0, Math.PI*2); ctx.arc(6, -5, 7, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-10, -5, 3, 0, Math.PI*2); ctx.arc(6, -5, 3, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = '#d97706';
    ctx.beginPath(); ctx.moveTo(-5, 1); ctx.lineTo(1, 1); ctx.lineTo(-4, 8); ctx.fill();

    ctx.fillStyle = '#d4d4d8';
    ctx.beginPath(); ctx.ellipse(-15, -15, 5, 10, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(10, -15, 5, 10, 0.3, 0, Math.PI*2); ctx.fill();
    
    ctx.save();
    ctx.translate(2, 5);
    ctx.rotate(wingAngle - 0.3);
    ctx.fillStyle = '#92400e';
    ctx.beginPath(); ctx.ellipse(0, 10, 10, 18, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    
    ctx.restore();
  },

  // --- Boss AI: Shared State & Routing ---
  updateBoss() {
    if (!this.boss.active) return;
    this.boss.timer++;

    if (this.boss.type === 'crow' && this.boss.hp === 1 && !this.boss.enraged) {
       this.boss.enraged = true;
       this.sound.playThunder();
       this.lightning = 1;
       this.screenShake = 15;
    }

    if (this.state === 'BOSS_WARNING') {
      if (this.boss.type === 'penguin') {
        if (this.boss.x > CONFIG.CANVAS_WIDTH - 80) this.boss.x -= 2;
      } else if (this.boss.type === 'thunderbird') {
        if (this.boss.x > CONFIG.CANVAS_WIDTH - 80) this.boss.x -= 2.5;
        this.boss.y += Math.sin(this.boss.timer * 0.1) * 1.5;
      } else {
        if (this.boss.x > CONFIG.CANVAS_WIDTH - 60) this.boss.x -= 3;
      }
      
      if (this.boss.timer > 90) {
        document.getElementById('bossWarning').classList.add('hidden');
        this.state = 'BOSS_INTRO';
        if (this.boss.type === 'thunderbird') {
          this.startDialogue([I18N[this.lang].w3_bossL1, I18N[this.lang].w3_bossL2]);
        } else if (this.boss.type === 'penguin') {
          this.startDialogue([I18N[this.lang].w2_bossL1, I18N[this.lang].w2_bossL2]);
        } else {
          this.startDialogue([I18N[this.lang].bossL1, I18N[this.lang].bossL2]);
        }
      }
      return; 
    }

    if (this.state === 'BOSS_INTRO') {
      return; 
    }

    // Thunderbird Boss AI (World 3)
    if (this.boss.type === 'thunderbird') {
      this.updateThunderbirdBoss();
      return;
    }

    // Penguin Boss AI (World 2)
    if (this.boss.type === 'penguin') {
      this.updatePenguinBoss();
      return;
    }

    const fireRate = this.boss.enraged ? 30 : 60; 
    const dashCooldown = this.boss.enraged ? 140 : 200;

    if (this.boss.state === 'IDLE' || this.boss.state === 'SHOOTING') {
      this.boss.y += (this.bird.y - this.boss.y) * 0.03;
      
      if (this.boss.timer > dashCooldown) { 
        this.boss.state = 'DASH_PREP';
        this.boss.timer = 0;
        this.sound.playLaunch(); 
      } else if (this.boss.timer > 0 && this.boss.timer % fireRate === 0) {
        this.bossFeathers.push({ x: this.boss.x - 30, y: this.boss.y, vx: -6 - Math.random()*4, vy: (this.bird.y - this.boss.y)*0.015 });
        this.sound.playFlap();
      }
      
      if (Math.random() < 0.02 && this.powerOrbs.length < 2) {
         this.powerOrbs.push({ x: CONFIG.CANVAS_WIDTH + 20, y: 150 + Math.random()*(CONFIG.CANVAS_HEIGHT-300), collected: false });
      }
    } 
    else if (this.boss.state === 'DASH_PREP') {
      this.boss.x += (CONFIG.CANVAS_WIDTH - 20 - this.boss.x) * 0.1;
      if (this.boss.timer > 45) { 
        this.boss.state = 'DASHING';
        this.sound.playSmash();
        this.screenShake = 10;
      }
    }
    else if (this.boss.state === 'DASHING') {
      this.boss.x -= this.boss.enraged ? 20 : 16;
      if (this.boss.x < -100) this.boss.state = 'RETURNING';
    }
    else if (this.boss.state === 'RETURNING') {
      this.boss.x += 8;
      if (this.boss.x >= CONFIG.CANVAS_WIDTH - 60) {
        this.boss.x = CONFIG.CANVAS_WIDTH - 60;
        this.boss.state = 'IDLE';
        this.boss.timer = 0;
      }
    }
    else if (this.boss.state === 'EXPLODING') {
      this.screenShake = 15;
      if (this.frame % 4 === 0) {
        this.particles.push({
          x: this.boss.x + (Math.random()-0.5)*80, y: this.boss.y + (Math.random()-0.5)*80,
          vx: (Math.random()-0.5)*15, vy: (Math.random()-0.5)*15,
          size: Math.random()*8+4, color: '#ef4444', life: 1
        });
      }
      if (this.boss.timer > 90) { 
        this.boss.active = false;
        this.state = 'BOSS_OUTRO';
        this.startDialogue([I18N[this.lang].owlL1, I18N[this.lang].owlL2]);
        this.bird.velocity = 0;
        this.screenShake = 35;
        this.sound.playThunder();
        this.lightning = 1;
        for (let i = 0; i < 60; i++) {
          this.particles.push({
            x: this.boss.x + (Math.random()-0.5)*150, y: this.boss.y + (Math.random()-0.5)*150,
            vx: (Math.random()-0.5)*30, vy: (Math.random()-0.5)*30,
            size: Math.random()*8+3, color: '#f1c40f', life: 1.5
          });
        }
      }
    }

    this.bossFeathers.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (Math.hypot(this.bird.x - p.x, this.bird.y - p.y) < CONFIG.BIRD_RADIUS + 8) {
        if(this.feverActive || this.boss.state === 'EXPLODING' || this.state === 'BOSS_OUTRO' || this.state === 'FLY_AWAY') p.x = -100; else this.gameOver(false);
      }
    });
    this.bossFeathers = this.bossFeathers.filter(p => p.x > -20);

    if (this.boss.state !== 'EXPLODING' && this.state === 'PLAYING') {
      if (Math.hypot(this.bird.x - this.boss.x, this.bird.y - this.boss.y) < 40) {
        if (!this.feverActive) this.gameOver(false);
      }
    }
  }
};
