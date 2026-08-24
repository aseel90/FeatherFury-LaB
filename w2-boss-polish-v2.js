(() => {
  'use strict';

  function install() {
    const game = window.game;
    const C = window.CONFIG || {};
    if (!game || !game.__w2AudioV1Installed || !game.__w2VisualsV1Installed || !game.__w2GameplayV1Installed) return false;
    if (game.__w2BossPolishV2Installed) return true;

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const W = () => C.CANVAS_WIDTH || 360;
    const H = () => C.CANVAS_HEIGHT || 640;
    const GROUND = () => H() - (C.GROUND_HEIGHT || 70) - 5;

    // ---------------------------------------------------------------------
    // Emperor audio identity: short SFX only, never music.
    // ---------------------------------------------------------------------
    const sound = game.sound;
    const canAudio = () => {
      try {
        sound?.init?.();
        if (sound?.ctx?.state === 'suspended') sound.ctx.resume?.();
      } catch (_) {}
      return !!sound?.ctx && !sound.muted && sound.sfxEnabled !== false;
    };

    const emperorVoice = (kind) => {
      if (!canAudio()) return;
      try {
        const ctx = sound.ctx;
        const presets = {
          entrance: [155, 78, 0.52, 0.13],
          attack: [310, 145, 0.18, 0.075],
          hit: [125, 82, 0.16, 0.09],
          roar: [235, 62, 0.62, 0.16],
          defeat: [180, 42, 0.78, 0.15]
        };
        const p = presets[kind] || presets.attack;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const gain2 = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = kind === 'hit' ? 'triangle' : 'sawtooth';
        osc2.type = 'triangle';
        osc.frequency.setValueAtTime(p[0], now);
        osc.frequency.exponentialRampToValueAtTime(p[1], now + p[2]);
        osc2.frequency.setValueAtTime(p[0] * 1.62, now);
        osc2.frequency.exponentialRampToValueAtTime(Math.max(35, p[1] * 1.18), now + p[2] * 0.9);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(kind === 'attack' ? 1900 : 1200, now);
        filter.frequency.exponentialRampToValueAtTime(380, now + p[2]);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(p[3], now + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, now + p[2]);
        gain2.gain.setValueAtTime(0.001, now);
        gain2.gain.linearRampToValueAtTime(p[3] * 0.38, now + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + p[2] * 0.88);
        osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        osc2.connect(gain2); gain2.connect(ctx.destination);
        osc.start(now); osc2.start(now + 0.012);
        osc.stop(now + p[2] + 0.03); osc2.stop(now + p[2] + 0.03);
      } catch (_) {}
    };

    sound.playEmperorEntrance = () => emperorVoice('entrance');
    sound.playEmperorAttack = () => emperorVoice('attack');
    sound.playEmperorHit = () => emperorVoice('hit');
    sound.playEmperorRoar = () => emperorVoice('roar');
    sound.playEmperorDefeat = () => emperorVoice('defeat');

    const previousActivateBoss = typeof game.activateBoss === 'function' ? game.activateBoss.bind(game) : null;
    if (previousActivateBoss) {
      game.activateBoss = function(...args) {
        const result = previousActivateBoss(...args);
        if (this.activeWorld === 1 && this.boss?.type === 'penguin') {
          this.boss.__w2Recovery = 0;
          this.boss.__w2VoiceCooldown = 0;
          this.__w2ManualProjectiles = [];
          setTimeout(() => {
            if (this.activeWorld === 1 && this.boss?.active && this.boss?.type === 'penguin') {
              this.sound?.playEmperorEntrance?.();
            }
          }, 120);
        }
        return result;
      };
    }

    // ---------------------------------------------------------------------
    // Boss visual grounding: physics position is unchanged; render is lifted.
    // ---------------------------------------------------------------------
    const previousBossSprite = game.drawPenguinBossSprite.bind(game);
    game.drawPenguinBossSprite = function(ctx, x, y, frame, enraged) {
      const lift = 15;
      ctx.save();
      ctx.translate(x, y - lift);
      const scale = enraged ? 1.075 : 1.045;
      ctx.scale(scale, scale);
      previousBossSprite(ctx, 0, 0, frame, enraged);
      ctx.restore();
    };

    // ---------------------------------------------------------------------
    // Mountain Eagle redesign. Base art faces right; dialogue flips it left.
    // ---------------------------------------------------------------------
    game.drawEagle = function(ctx, x, y, frame) {
      const flying = this.state === 'FLY_AWAY';
      const face = flying ? 1 : -1;
      const flap = Math.sin(frame * (flying ? 0.32 : 0.18));
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(face, 1);

      // Tail behind body.
      ctx.fillStyle = '#e7e5e4';
      ctx.beginPath();
      ctx.moveTo(-8, 22); ctx.lineTo(-19, 42); ctx.lineTo(-4, 35);
      ctx.lineTo(2, 45); ctx.lineTo(8, 34); ctx.lineTo(20, 40); ctx.lineTo(10, 21);
      ctx.closePath(); ctx.fill();

      // Far wing with layered flight feathers.
      ctx.save();
      ctx.translate(-8, -1);
      ctx.rotate(-0.32 - flap * (flying ? 0.5 : 0.2));
      ctx.fillStyle = '#4b2b19';
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.quadraticCurveTo(-35, 1, -52, 30);
      ctx.quadraticCurveTo(-30, 23, -9, 16); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#6b3b20';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(-20 - i * 7, 17 + i * 2, 4.5, 13, -0.72, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Body.
      const bodyGrad = ctx.createLinearGradient(0, -16, 0, 31);
      bodyGrad.addColorStop(0, '#7c4524');
      bodyGrad.addColorStop(1, '#3f2416');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.ellipse(2, 6, 20, 29, -0.08, 0, Math.PI * 2); ctx.fill();

      // Near folded/flight wing.
      ctx.save();
      ctx.translate(10, -1);
      ctx.rotate(0.24 + flap * (flying ? 0.44 : 0.12));
      ctx.fillStyle = '#59301b';
      ctx.beginPath();
      ctx.moveTo(0, -6); ctx.quadraticCurveTo(31, 1, 39, 30);
      ctx.quadraticCurveTo(20, 22, 1, 15); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8a4e2b';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.ellipse(13 + i * 6, 15 + i * 2, 4.2, 11, 0.62, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();

      // White neck feather collar.
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(-11, -14); ctx.lineTo(-7, -6); ctx.lineTo(-2, -12); ctx.lineTo(3, -5);
      ctx.lineTo(8, -12); ctx.lineTo(14, -5); ctx.lineTo(16, -19); ctx.lineTo(-12, -21);
      ctx.closePath(); ctx.fill();

      // Profile head and hooked beak.
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath(); ctx.ellipse(10, -26, 16, 14, -0.15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(20, -27); ctx.quadraticCurveTo(34, -24, 38, -18);
      ctx.quadraticCurveTo(31, -19, 25, -14); ctx.lineTo(23, -22); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#111827';
      ctx.beginPath(); ctx.arc(14, -29, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(14.5, -29.5, 0.9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#5b3219'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(4, -34); ctx.lineTo(17, -35); ctx.stroke();

      // Legs/talons only while hovering in dialogue.
      if (!flying) {
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-5, 29); ctx.lineTo(-7, 37); ctx.lineTo(-13, 40);
        ctx.moveTo(7, 29); ctx.lineTo(8, 37); ctx.lineTo(14, 40);
        ctx.stroke();
      }

      ctx.restore();
    };

    // ---------------------------------------------------------------------
    // Manual orb projectile system. It bypasses the old guaranteed homing.
    // ---------------------------------------------------------------------
    function spawnManualShot(g, src) {
      const boss = g.boss;
      const dx = Math.max(70, (boss?.x || W()) - src.x);
      const frames = Math.max(7, dx / 15.5);
      const targetY = (boss?.y || GROUND()) - 36;
      const requiredVy = (targetY - src.y) / frames;
      const birdInfluence = clamp(Number(g.bird?.velocity || 0) * 0.22, -1.15, 1.15);
      return {
        x: src.x,
        y: src.y,
        vx: 15.5,
        vy: clamp(requiredVy * 0.42 + birdInfluence, -5.4, 5.4),
        active: true,
        life: 90,
        __w2Manual: true
      };
    }

    function updateManualShots(g) {
      const boss = g.boss;
      const shots = g.__w2ManualProjectiles || [];
      if (!boss?.active || boss.type !== 'penguin' || boss.state === 'EXPLODING') {
        g.__w2ManualProjectiles = [];
        return;
      }

      for (const p of shots) {
        if (!p.active) continue;
        const targetY = boss.y - 36;
        const correction = clamp((targetY - p.y) * 0.0028, -0.065, 0.065);
        p.vy = clamp(p.vy + correction, -5.6, 5.6);
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        if (g.frame % 2 === 0) {
          g.particles.push({ x:p.x, y:p.y, vx:-2.2-Math.random()*1.8, vy:(Math.random()-.5)*1.4, size:1.7, color:'#67e8f9', life:.42 });
        }

        const groundY = H() - (C.GROUND_HEIGHT || 70);
        if (p.y >= groundY || p.y < -35 || p.x > W() + 55 || p.life <= 0) {
          p.active = false;
          if (p.y >= groundY) {
            g.sound?.playIceShatter?.();
            for (let i=0;i<7;i++) g.particles.push({x:p.x,y:groundY-2,vx:(Math.random()-.5)*8,vy:-Math.random()*5,size:2,color:'#7dd3fc',life:.4});
          }
          continue;
        }

        const hittable = boss.state !== 'DODGING' && boss.state !== 'W2_ENRAGE' && boss.state !== 'EXPLODING';
        if (hittable && Math.hypot(p.x - boss.x, p.y - (boss.y - 36)) < 38) {
          p.active = false;
          boss.hp--;
          boss.__w2Recovery = Math.max(boss.__w2Recovery || 0, 18);
          g.sound?.playEmperorHit?.();
          g.sound?.playHit?.();
          g.screenShake = 14;
          for (let i=0;i<13;i++) g.particles.push({x:boss.x+(Math.random()-.5)*35,y:boss.y-35+(Math.random()-.5)*45,vx:(Math.random()-.5)*11,vy:(Math.random()-.5)*9,size:2+Math.random()*3,color:i%2?'#fef08a':'#7dd3fc',life:.72});
          if (boss.hp <= 0) {
            boss.hp = 0;
            boss.state = 'EXPLODING';
            boss.timer = 0;
            g.sound?.playEmperorDefeat?.();
            g.screenShake = 22;
          }
        }
      }
      g.__w2ManualProjectiles = shots.filter(p => p.active);
    }

    // ---------------------------------------------------------------------
    // Emperor AI v2: fewer orbs, stronger pressure, fair recovery windows.
    // ---------------------------------------------------------------------
    game.updatePenguinBoss = function() {
      const boss = this.boss;
      if (!boss || boss.type !== 'penguin') return;
      const ground = GROUND();
      boss.dodgeCooldown = Math.max(0, (boss.dodgeCooldown || 0) - 1);
      boss.__w2Recovery = Math.max(0, (boss.__w2Recovery || 0) - 1);
      boss.__w2VoiceCooldown = Math.max(0, (boss.__w2VoiceCooldown || 0) - 1);

      if (boss.hp <= Math.ceil((C.W2_BOSS_HP || 8) / 2) && !boss.__w2EnrageTriggered && boss.state !== 'EXPLODING') {
        boss.__w2EnrageTriggered = true;
        boss.enraged = true;
        boss.state = 'W2_ENRAGE';
        boss.timer = 0;
        boss.y = ground;
        this.screenShake = 20;
        this.lightning = .42;
        this.sound?.playPenguinEnrage?.();
        this.sound?.playEmperorRoar?.();
        for (let i=0;i<34;i++) this.particles.push({x:boss.x+(Math.random()-.5)*86,y:boss.y-38+(Math.random()-.5)*88,vx:(Math.random()-.5)*13,vy:(Math.random()-.5)*11,size:2+Math.random()*4,color:i%2?'#ef4444':'#7dd3fc',life:.95});
      }

      if (boss.state === 'W2_ENRAGE') {
        boss.y = ground;
        boss.x += (W() * .72 - boss.x) * .045;
        if (boss.timer > 54) { boss.state = 'IDLE'; boss.timer = 0; boss.__w2Recovery = 30; }
      }
      else if (boss.state === 'IDLE') {
        boss.y = ground;
        const minX = W() * .55, maxX = W() - 55;
        if (!boss.__w2DriftDir) boss.__w2DriftDir = -1;
        boss.x += boss.__w2DriftDir * (boss.enraged ? 1.18 : .82);
        if (boss.x < minX) { boss.x = minX; boss.__w2DriftDir = 1; }
        else if (boss.x > maxX) { boss.x = maxX; boss.__w2DriftDir = -1; }

        const incoming = (this.__w2ManualProjectiles || []).some(p => p.active && p.x > boss.x - 145 && p.x < boss.x - 28 && Math.abs(p.y - (boss.y - 36)) < 95);
        if (incoming && boss.dodgeCooldown <= 0 && boss.__w2Recovery <= 0) {
          if (Math.random() < (boss.enraged ? .40 : .28)) {
            boss.state = 'DODGING'; boss.timer = 0;
            boss.dodgeCooldown = boss.enraged ? 102 : 138;
            boss.dodgeDir = boss.x > W() - 78 ? -1 : 1;
            this.sound?.playPenguinDodge?.();
            this.floatingText.push({text:(this.lang==='ar'?'مراوغة!':'DODGE!'),x:boss.x,y:boss.y-82,life:.72,color:'#7dd3fc'});
          } else boss.dodgeCooldown = 72;
        }

        const fireRate = boss.enraged ? 40 : 64;
        if (boss.timer > 0 && boss.timer % fireRate === 0) {
          const speed = boss.enraged ? 9.5 : 7.8;
          const aim = (this.bird.y - (boss.y - 32)) * .018;
          this.snowballs.push({x:boss.x-27,y:boss.y-42,vx:-speed,vy:aim,__w2Boss:true});
          if (boss.enraged || Math.random() < .30) {
            this.snowballs.push({x:boss.x-27,y:boss.y-42,vx:-speed*.91,vy:aim-2.0,__w2Boss:true});
            this.snowballs.push({x:boss.x-27,y:boss.y-42,vx:-speed*.91,vy:aim+2.0,__w2Boss:true});
          }
          this.sound?.playSnowThrow?.();
          setTimeout(() => this.sound?.playSnowballWhoosh?.(), 20);
          if (boss.__w2VoiceCooldown <= 0) {
            this.sound?.playEmperorAttack?.();
            boss.__w2VoiceCooldown = boss.enraged ? 78 : 110;
          }
        }

        // One orb at a time. Average spawn is deliberately much lower than v1.
        if (Math.random() < (boss.enraged ? .008 : .006) && this.powerOrbs.length < 1) {
          this.powerOrbs.push({x:W()+20,y:H()*(.42+Math.random()*.28),collected:false});
        }

        if (boss.timer > (boss.enraged ? 88 : 130)) {
          boss.state = Math.random() < .5 ? 'JUMP_PREP' : 'SLIDE_PREP';
          boss.timer = 0;
          if (boss.state === 'JUMP_PREP') {
            boss.__w2LandingX = clamp(this.bird.x + 18, 48, W() - 48);
            this.sound?.playIceWarn?.();
          } else {
            this.sound?.playPenguinSlide?.();
          }
          this.sound?.playEmperorAttack?.();
          boss.__w2VoiceCooldown = 70;
        }
      }
      else if (boss.state === 'DODGING') {
        boss.y = ground - Math.sin(clamp(boss.timer/27,0,1)*Math.PI)*24;
        boss.x += (boss.dodgeDir || 1) * (boss.enraged ? 3.9 : 3.15);
        boss.x = clamp(boss.x, W()*.47, W()-35);
        if (this.frame % 3 === 0) this.particles.push({x:boss.x,y:ground,vx:(Math.random()-.5)*4,vy:-Math.random()*3,size:2.5,color:'#bae6fd',life:.45});
        if (boss.timer > 27) { boss.y=ground; boss.state='IDLE'; boss.timer=0; boss.__w2Recovery=24; }
      }
      else if (boss.state === 'JUMP_PREP') {
        boss.y = ground + 4;
        if (boss.timer > (boss.enraged ? 28 : 35)) {
          boss.state='JUMPING'; boss.jumpVy=boss.enraged?-20.5:-17.5; boss.timer=0;
          this.sound?.playFrostLaunch?.();
        }
      }
      else if (boss.state === 'JUMPING') {
        boss.jumpVy += .5; boss.y += boss.jumpVy;
        const tx = Number.isFinite(boss.__w2LandingX) ? boss.__w2LandingX : this.bird.x;
        boss.x += (tx - boss.x) * (boss.enraged ? .078 : .054);
        if (boss.y >= ground) {
          boss.y=ground; boss.state='LANDING'; boss.timer=0;
          this.screenShake=boss.enraged?30:23;
          this.sound?.playPenguinLand?.();
          for(let i=0;i<26;i++) this.particles.push({x:boss.x+(Math.random()-.5)*78,y:ground,vx:(Math.random()-.5)*14,vy:-Math.random()*9,size:2+Math.random()*4,color:'#e2e8f0',life:.78});
          if (this.icicles.length < 4) {
            const a=clamp(this.bird.x+30+(Math.random()-.5)*48,42,W()-42);
            const b=42+Math.random()*(W()-84);
            this.icicles.push({x:a,y:-30,state:'WARN',dropX:a,timer:0,__w2WarnTimer:28,__w2BossHazard:true,__w2HoldX:a});
            this.icicles.push({x:b,y:-30,state:'WARN',dropX:b,timer:0,__w2WarnTimer:28,__w2BossHazard:true,__w2HoldX:b});
            this.sound?.playIceWarn?.();
          }
        }
      }
      else if (boss.state === 'LANDING') {
        if (boss.timer > 38) { boss.state='IDLE'; boss.timer=0; boss.__w2LandingX=null; boss.__w2Recovery=58; }
      }
      else if (boss.state === 'SLIDE_PREP') {
        boss.x = Math.min(W()-38, boss.x+1.55);
        if (boss.timer > (boss.enraged ? 25 : 34)) {
          boss.state='SLIDING'; boss.slideSpeed=boss.enraged?-23:-18.5; boss.timer=0;
          this.sound?.playPenguinSlide?.();
        }
      }
      else if (boss.state === 'SLIDING') {
        boss.y=ground+9; boss.x+=boss.slideSpeed;
        if(this.frame%2===0) this.particles.push({x:boss.x+28,y:ground,vx:1+Math.random()*3,vy:-Math.random()*2,size:2+Math.random()*3,color:'#bfdbfe',life:.45});
        if(boss.x < -100) { boss.state='RETURNING'; boss.x=W()+52; boss.timer=0; }
      }
      else if (boss.state === 'RETURNING') {
        boss.y=ground; boss.x-=4.7;
        if(boss.x <= W()-78) { boss.state='IDLE'; boss.timer=0; boss.__w2Recovery=50; }
      }
      else if (boss.state === 'EXPLODING') {
        if(boss.timer%4===0) for(let i=0;i<6;i++) this.particles.push({x:boss.x+(Math.random()-.5)*84,y:boss.y-34+(Math.random()-.5)*68,vx:(Math.random()-.5)*14,vy:(Math.random()-.5)*14,size:2+Math.random()*5,color:Math.random()>.5?'#93c5fd':'#f8fafc',life:.95});
        if(boss.timer > 96) {
          boss.active=false;
          this.state='BOSS_OUTRO';
          this.owl.x=W()+100; this.owl.y=H()/2;
          const lines=[I18N[this.lang].w2_owlL1,I18N[this.lang].w2_owlL2];
          this.__w2VictoryCine={phase:'approach',frame:0,lines};
          this.storyLines=lines; this.storyText1=''; this.storyText2=''; this.storyCompleted=true;
          this.screenShake=0; this.snowballs=[]; this.icicles=[]; this.powerOrbs=[]; this.heroProjectiles=[]; this.__w2ManualProjectiles=[];
          document.getElementById('gameHud')?.classList.add('hidden');
          this.sound?.playEagleCall?.();
          for(let i=0;i<52;i++) this.particles.push({x:boss.x+(Math.random()-.5)*135,y:boss.y-35+(Math.random()-.5)*125,vx:(Math.random()-.5)*20,vy:(Math.random()-.5)*18,size:2+Math.random()*6,color:'#60a5fa',life:1.2});
        }
      }

      // Snowballs keep the proven World 2 movement/collision behavior.
      this.snowballs.forEach(s=>{
        if(s.vx>-3)s.vx=-7.5;
        s.x+=s.vx; s.y+=s.vy; s.vy+=.045;
        if(this.invincibleTimer<=0 && Math.hypot(this.bird.x-s.x,this.bird.y-s.y)<(C.BIRD_RADIUS||14)+9){
          if(this.feverActive||boss.state==='EXPLODING'||this.state==='BOSS_OUTRO'||this.state==='FLY_AWAY') s.x=-200;
          else this.gameOver(false);
        }
      });
      this.snowballs=this.snowballs.filter(s=>s.x>-55&&s.x<W()+60&&s.y<H()+30);

      if(boss.state!=='EXPLODING' && this.state==='PLAYING') {
        const hit=boss.state==='SLIDING'?46:40;
        if(this.invincibleTimer<=0 && Math.hypot(this.bird.x-boss.x,this.bird.y-(boss.y-25))<hit && !this.feverActive) this.gameOver(false);
      }
    };

    const previousUpdate = game.update.bind(game);
    game.update = function() {
      const manualMode = this.activeWorld === 1 && this.boss?.active && this.boss?.type === 'penguin';
      if (!manualMode) return previousUpdate();

      this.__w2ManualProjectiles = (this.__w2ManualProjectiles || []).filter(p => p.active);
      // Keep manual shots away from the legacy homing block for this frame.
      this.heroProjectiles = [];
      const result = previousUpdate();

      // Any projectile created during the old update came from collecting an orb.
      const newlyCollectedShots = (this.heroProjectiles || []).filter(p => p.active && !p.__w2Manual);
      for (const p of newlyCollectedShots) this.__w2ManualProjectiles.push(spawnManualShot(this, p));
      this.heroProjectiles = [];

      updateManualShots(this);
      // Reuse the normal renderer only; these are removed again before next update.
      this.heroProjectiles = this.__w2ManualProjectiles;
      return result;
    };

    game.__w2BossPolishV2Installed = true;
    console.log('[FF-LAB] w2-boss-polish-v2-installed');
    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 120) clearInterval(timer);
  }, 80);
  setTimeout(install, 1300);
})();
