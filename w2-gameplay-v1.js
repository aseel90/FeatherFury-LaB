(() => {
  'use strict';

  function install() {
    const game = window.game;
    if (!game) return false;
    if (game.__w2GameplayV1Installed) return true;

    const C = window.CONFIG || {};
    const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
    const ease = t => { t=clamp(t,0,1); return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; };
    const W = () => C.CANVAS_WIDTH || 360;
    const H = () => C.CANVAS_HEIGHT || 640;
    const GY = () => H() - (C.GROUND_HEIGHT || 70) - 5;

    const oldEnterStory = typeof game.enterStoryState === 'function' ? game.enterStoryState.bind(game) : null;
    if (oldEnterStory) {
      game.enterStoryState = function() {
        const r = oldEnterStory();
        if (this.activeWorld === 1) {
          this.__w2Stage2Announced = false;
          this.__w2LastIcicleSpawnFrame = -9999;
          this.__w2VictoryCine = null;
          this.__w2LaunchAnimating = false;
          try { this.sound?.startFrostAmbiance?.(1); } catch (_) {}
        }
        return r;
      };
    }

    const oldLaunch = typeof game.launchDash === 'function' ? game.launchDash.bind(game) : null;
    if (oldLaunch) {
      game.launchDash = function() {
        if (this.activeWorld !== 1) return oldLaunch();
        if (this.__w2LaunchAnimating) return;
        this.__w2LaunchAnimating = true;
        this.state = 'LAUNCH';
        this.sound?.playFrostLaunch?.();
        this.screenShake = Math.max(this.screenShake || 0, 8);
        const x0=this.bird.x, y0=this.bird.y;
        const targetY=H()/2-24;
        for(let i=0;i<22;i++) this.particles.push({x:x0+(Math.random()-.5)*36,y:y0+(Math.random()-.5)*32,vx:(Math.random()-.5)*10,vy:(Math.random()-.5)*9,size:1.5+Math.random()*3,color:i%3===0?'#f8fafc':'#7dd3fc',life:.75});
        const started=performance.now();
        const token=(this.__w2LaunchToken||0)+1; this.__w2LaunchToken=token;
        const tick=now=>{
          if(this.__w2LaunchToken!==token)return;
          const p=ease((now-started)/620);
          this.bird.x=x0+(80-x0)*p;
          this.bird.y=y0+(targetY-y0)*p-Math.sin(p*Math.PI)*16;
          this.bird.rotation=.12*(1-p)-.16*Math.sin(p*Math.PI);
          this.bird.wingCycle=Math.sin((now-started)*.035);
          if(p<1)requestAnimationFrame(tick);else{
            this.bird.x=80;this.bird.y=targetY;this.bird.rotation=0;this.bird.velocity=-3.5;
            this.state='PLAYING';this.spawnTimer=60;this.__w2LaunchAnimating=false;
            document.getElementById('gameHud')?.classList.remove('hidden');
            try{this.sound?.startFrostAmbiance?.(1);}catch(_){}
          }
        };
        requestAnimationFrame(tick);
      };
    }

    const oldActivateBoss = typeof game.activateBoss === 'function' ? game.activateBoss.bind(game) : null;
    if (oldActivateBoss) {
      game.activateBoss = function() {
        const r = oldActivateBoss();
        if (this.activeWorld === 1) {
          this.boss.__w2EnrageTriggered = false;
          this.boss.__w2LandingX = null;
          try { this.sound?.startFrostAmbiance?.(3); } catch (_) {}
        }
        return r;
      };
    }

    function updateBossSnowballs(g,boss) {
      g.snowballs.forEach(s=>{
        if(s.vx>-3)s.vx=-7.5;
        s.x+=s.vx; s.y+=s.vy; s.vy+=.045;
        if(g.invincibleTimer<=0 && Math.hypot(g.bird.x-s.x,g.bird.y-s.y)<(C.BIRD_RADIUS||14)+9){
          if(g.feverActive||boss.state==='EXPLODING'||g.state==='BOSS_OUTRO'||g.state==='FLY_AWAY')s.x=-200;else g.gameOver(false);
        }
      });
      g.snowballs=g.snowballs.filter(s=>s.x>-55&&s.x<W()+60&&s.y<H()+30);
    }

    game.updatePenguinBoss = function() {
      const boss=this.boss;
      const ground=GY();
      if(!boss||boss.type!=='penguin')return;

      if(boss.hp<=Math.ceil((C.W2_BOSS_HP||8)/2) && !boss.__w2EnrageTriggered && boss.state!=='EXPLODING'){
        boss.__w2EnrageTriggered=true;boss.enraged=true;boss.state='W2_ENRAGE';boss.timer=0;boss.y=ground;
        this.screenShake=18;this.lightning=.35;
        this.sound?.playPenguinEnrage?.();
        for(let i=0;i<30;i++)this.particles.push({x:boss.x+(Math.random()-.5)*80,y:boss.y-35+(Math.random()-.5)*80,vx:(Math.random()-.5)*12,vy:(Math.random()-.5)*10,size:2+Math.random()*4,color:i%2?'#ef4444':'#7dd3fc',life:.9});
      }

      boss.dodgeCooldown=Math.max(0,(boss.dodgeCooldown||0)-1);

      if(boss.state==='W2_ENRAGE'){
        boss.y=ground;boss.x+=(W()*.72-boss.x)*.04;
        if(boss.timer>48){boss.state='IDLE';boss.timer=0;}
      }
      else if(boss.state==='IDLE'){
        boss.y=ground;
        const minX=W()*.56,maxX=W()-56;
        if(!boss.__w2DriftDir)boss.__w2DriftDir=-1;
        boss.x+=boss.__w2DriftDir*(boss.enraged?1.0:.72);
        if(boss.x<minX){boss.x=minX;boss.__w2DriftDir=1;}else if(boss.x>maxX){boss.x=maxX;boss.__w2DriftDir=-1;}

        const incoming=this.heroProjectiles?.some(p=>p.active&&p.x>boss.x-135&&p.x<boss.x-28&&Math.abs(p.y-(boss.y-25))<80);
        if(incoming&&boss.dodgeCooldown<=0){
          if(Math.random()<(boss.enraged?.43:.33)){
            boss.state='DODGING';boss.timer=0;boss.dodgeCooldown=boss.enraged?95:130;boss.dodgeDir=boss.x>W()-78?-1:1;
            this.sound?.playPenguinDodge?.();
            this.floatingText.push({text:(this.lang==='ar'?'مراوغة!':'DODGE!'),x:boss.x,y:boss.y-78,life:.75,color:'#7dd3fc'});
          }else boss.dodgeCooldown=65;
        }

        const fireRate=boss.enraged?46:72;
        if(boss.timer>0&&boss.timer%fireRate===0){
          const speed=boss.enraged?9.0:7.3;
          const aim=(this.bird.y-(boss.y-30))*.018;
          this.snowballs.push({x:boss.x-25,y:boss.y-38,vx:-speed,vy:aim,__w2Boss:true});
          if(boss.enraged||Math.random()<.32){
            this.snowballs.push({x:boss.x-25,y:boss.y-38,vx:-speed*.9,vy:aim-1.9,__w2Boss:true});
            this.snowballs.push({x:boss.x-25,y:boss.y-38,vx:-speed*.9,vy:aim+1.9,__w2Boss:true});
          }
          this.sound?.playSnowThrow?.();
          setTimeout(()=>this.sound?.playSnowballWhoosh?.(),25);
        }

        if(Math.random()<(boss.enraged?.028:.018)&&this.powerOrbs.length<2){
          this.powerOrbs.push({x:W()+20,y:165+Math.random()*(H()-360),collected:false});
        }

        if(boss.timer>(boss.enraged?96:142)){
          boss.state=Math.random()<.5?'JUMP_PREP':'SLIDE_PREP';boss.timer=0;
          if(boss.state==='JUMP_PREP'){
            boss.__w2LandingX=clamp(this.bird.x+20,48,W()-48);
            this.sound?.playIceWarn?.();
          }else this.sound?.playPenguinSlide?.();
        }
      }
      else if(boss.state==='DODGING'){
        boss.y=ground-Math.sin(clamp(boss.timer/26,0,1)*Math.PI)*22;
        boss.x+=(boss.dodgeDir||1)*(boss.enraged?3.6:3.0);
        boss.x=clamp(boss.x,W()*.48,W()-36);
        if(this.frame%3===0)this.particles.push({x:boss.x,y:ground,vx:(Math.random()-.5)*4,vy:-Math.random()*3,size:2.5,color:'#bae6fd',life:.45});
        if(boss.timer>26){boss.y=ground;boss.state='IDLE';boss.timer=0;}
      }
      else if(boss.state==='JUMP_PREP'){
        boss.y=ground+4;
        if(boss.timer>36){boss.state='JUMPING';boss.jumpVy=boss.enraged?-20:-17;boss.timer=0;this.sound?.playFrostLaunch?.();}
      }
      else if(boss.state==='JUMPING'){
        boss.jumpVy+=.5;boss.y+=boss.jumpVy;
        const tx=Number.isFinite(boss.__w2LandingX)?boss.__w2LandingX:this.bird.x;
        boss.x+=(tx-boss.x)*(boss.enraged?.075:.052);
        if(boss.y>=ground){
          boss.y=ground;boss.state='LANDING';boss.timer=0;this.screenShake=boss.enraged?28:21;this.sound?.playPenguinLand?.();
          for(let i=0;i<24;i++)this.particles.push({x:boss.x+(Math.random()-.5)*74,y:ground,vx:(Math.random()-.5)*14,vy:-Math.random()*9,size:2+Math.random()*4,color:'#e2e8f0',life:.75});
          if(this.icicles.length<4){
            const a=clamp(this.bird.x+30+(Math.random()-.5)*48,42,W()-42);
            const b=42+Math.random()*(W()-84);
            this.icicles.push({x:a,y:-30,state:'WARN',dropX:a,timer:0,__w2WarnTimer:28,__w2BossHazard:true,__w2HoldX:a});
            this.icicles.push({x:b,y:-30,state:'WARN',dropX:b,timer:0,__w2WarnTimer:28,__w2BossHazard:true,__w2HoldX:b});
            this.sound?.playIceWarn?.();
          }
        }
      }
      else if(boss.state==='LANDING'){
        if(boss.timer>34){boss.state='IDLE';boss.timer=0;boss.__w2LandingX=null;}
      }
      else if(boss.state==='SLIDE_PREP'){
        boss.x=Math.min(W()-38,boss.x+1.5);
        if(boss.timer>(boss.enraged?27:36)){boss.state='SLIDING';boss.slideSpeed=boss.enraged?-22:-17;boss.timer=0;this.sound?.playPenguinSlide?.();}
      }
      else if(boss.state==='SLIDING'){
        boss.y=ground+9;boss.x+=boss.slideSpeed;
        if(this.frame%2===0)this.particles.push({x:boss.x+28,y:ground,vx:1+Math.random()*3,vy:-Math.random()*2,size:2+Math.random()*3,color:'#bfdbfe',life:.45});
        if(boss.x<-100){boss.state='RETURNING';boss.x=W()+52;boss.timer=0;}
      }
      else if(boss.state==='RETURNING'){
        boss.y=ground;boss.x-=4.5;if(boss.x<=W()-78){boss.state='IDLE';boss.timer=0;}
      }
      else if(boss.state==='EXPLODING'){
        if(boss.timer%5===0)for(let i=0;i<5;i++)this.particles.push({x:boss.x+(Math.random()-.5)*80,y:boss.y-30+(Math.random()-.5)*60,vx:(Math.random()-.5)*13,vy:(Math.random()-.5)*13,size:2+Math.random()*5,color:Math.random()>.5?'#93c5fd':'#f8fafc',life:.9});
        if(boss.timer>90){
          boss.active=false;this.state='BOSS_OUTRO';this.owl.x=W()+100;this.owl.y=H()/2;
          const lines=[I18N[this.lang].w2_owlL1,I18N[this.lang].w2_owlL2];
          this.__w2VictoryCine={phase:'approach',frame:0,lines};
          this.storyLines=lines;this.storyText1='';this.storyText2='';this.storyCompleted=true;
          this.screenShake=0;this.snowballs=[];this.icicles=[];this.powerOrbs=[];this.heroProjectiles=[];
          this.sound?.playEagleCall?.();
          for(let i=0;i<48;i++)this.particles.push({x:boss.x+(Math.random()-.5)*130,y:boss.y-30+(Math.random()-.5)*120,vx:(Math.random()-.5)*20,vy:(Math.random()-.5)*18,size:2+Math.random()*6,color:'#60a5fa',life:1.2});
        }
      }

      updateBossSnowballs(this,boss);
      if(boss.state!=='EXPLODING'&&this.state==='PLAYING'){
        const hit=boss.state==='SLIDING'?46:40;
        if(this.invincibleTimer<=0&&Math.hypot(this.bird.x-boss.x,this.bird.y-(boss.y-25))<hit&&!this.feverActive)this.gameOver(false);
      }
    };

    const oldGameOver = typeof game.gameOver === 'function' ? game.gameOver.bind(game) : null;
    if (oldGameOver) {
      game.gameOver = function(isVictory=false) {
        if(isVictory&&this.activeWorld===1&&this.state==='BOSS_OUTRO'&&this.__w2VictoryCine?.phase==='dialogue'&&!this.__w2VictoryAllowFinish){
          this.state='FLY_AWAY';
          const cine=this.__w2VictoryCine;
          cine.phase='depart';cine.frame=0;cine.birdX=this.bird.x;cine.birdY=this.bird.y;cine.eagleX=this.owl.x;cine.eagleY=this.owl.y;
          this.sound?.playFrostLaunch?.();
          return;
        }
        const result = oldGameOver(isVictory);
        if (this.activeWorld === 1) {
          const refreshHigh = () => { const el = document.getElementById('highScore'); if (el) el.textContent = this.highScoreW2; };
          setTimeout(refreshHigh, 20);
          setTimeout(refreshHigh, 1040);
        }
        return result;
      };
    }

    const nextWorldBtn = document.getElementById('nextWorldActionBtn');
    const oldNextWorld = nextWorldBtn?.onclick;
    if (nextWorldBtn) {
      nextWorldBtn.onclick = (e) => {
        if (game.activeWorld !== 1) return oldNextWorld?.call(nextWorldBtn, e);
        document.getElementById('mainMenuBtn')?.click();
        game.currentWorldIndex = 2;
        game.updateCarousel?.();
      };
    }

    const oldUpdate = typeof game.update === 'function' ? game.update.bind(game) : null;
    if (oldUpdate) {
      game.update = function() {
        if(this.activeWorld===1&&this.state==='FLY_AWAY'&&this.__w2VictoryCine?.phase==='depart'){
          this.frame++;
          this.particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(!p.isLine&&!p.isBar)p.vy+=.12;p.life-=.025;});
          this.particles=this.particles.filter(p=>p.life>0);
          const c=this.__w2VictoryCine;c.frame++;
          const p=clamp(c.frame/92,0,1),e=ease(p);
          this.bird.x=c.birdX+(W()+120-c.birdX)*e;this.owl.x=c.eagleX+(W()+170-c.eagleX)*e;
          this.bird.y=c.birdY-54*e;this.owl.y=c.eagleY-60*e;this.bird.rotation=-.08-.2*e;this.bird.wingCycle=Math.sin(this.frame*.72);
          if(this.frame%3===0)this.particles.push({x:this.bird.x-8,y:this.bird.y,vx:-4,vy:(Math.random()-.5)*2,size:1.5+Math.random()*2,color:'#bae6fd',life:.5});
          if(p>=1&&!this.__w2VictoryAllowFinish){this.__w2VictoryAllowFinish=true;oldGameOver(true);}
          return;
        }

        let holdWarn=[];
        if(this.activeWorld===1){
          const speed=this.feverActive?(C.SPEED_FEVER||4.5):(C.W2_SPEED||2.2);
          this.icicles.forEach(ice=>{
            if(ice.state==='HANG'&&!ice.__w2Warned&&ice.x-speed<=ice.dropX){
              ice.state='WARN';ice.__w2Warned=true;ice.__w2WarnTimer=28;ice.__w2HoldX=ice.x;this.sound?.playIceWarn?.();
            }
            if(ice.state==='WARN'){holdWarn.push({ice,x:ice.x});}
          });
        }

        const oldFlap=this.sound?.playFlap;
        if(this.activeWorld===1&&!this.boss?.active&&this.sound?.playSnowThrow)this.sound.playFlap=this.sound.playSnowThrow.bind(this.sound);
        const fallingBefore=this.activeWorld===1?this.icicles.filter(i=>i.state==='FALL').slice():[];

        const cine=this.__w2VictoryCine;
        if(this.activeWorld===1&&this.state==='BOSS_OUTRO'&&cine?.phase==='approach'){
          this.storyCompleted=true;
        }
        const r=oldUpdate();
        if(oldFlap&&this.sound)this.sound.playFlap=oldFlap;

        if(this.activeWorld===1&&this.state==='BOSS_OUTRO'&&cine?.phase==='approach'){
          this.storyCompleted=true;cine.frame++;
          const bx=W()/2-54, ex=W()/2+54, ty=H()/2-34;
          this.bird.x+=(bx-this.bird.x)*.07;this.bird.y+=(ty-this.bird.y)*.065;this.owl.x+=(ex-this.owl.x)*.07;this.owl.y+=(ty-this.owl.y)*.06;
          if((Math.abs(this.bird.x-bx)<2.5&&Math.abs(this.owl.x-ex)<3)||cine.frame>110){
            this.bird.x=bx;this.bird.y=ty;this.owl.x=ex;this.owl.y=ty;cine.phase='dialogue';this.startDialogue(cine.lines);
          }
        }

        if(this.activeWorld===1){
          holdWarn.forEach(({ice,x})=>{if(this.icicles.includes(ice)&&ice.state==='WARN'){ice.x=x;ice.__w2HoldX=x;ice.__w2WarnTimer=(ice.__w2WarnTimer||1)-1;if(ice.__w2WarnTimer<=0){ice.state='FALL';this.sound?.playIceDrop?.();}}});
          fallingBefore.forEach(ice=>{if(!ice.__w2ShatterPlayed&&ice.y>=H()-(C.GROUND_HEIGHT||70)){ice.__w2ShatterPlayed=true;this.sound?.playIceShatter?.();}});

          if(!this.boss?.active){
            let accepted=[];
            for(const ice of this.icicles){
              if(!ice.__w2Tracked){
                ice.__w2Tracked=true;ice.__w2SpawnFrame=this.frame;
                if(!ice.__w2BossHazard&&this.frame-(this.__w2LastIcicleSpawnFrame||-9999)<92)continue;
                if(!ice.__w2BossHazard)this.__w2LastIcicleSpawnFrame=this.frame;
              }
              accepted.push(ice);
            }
            if(accepted.length>2)accepted=accepted.slice(-2);
            this.icicles=accepted;
          }

          if(this.score>=(C.STAGE1_END||15)&&!this.__w2Stage2Announced){
            this.__w2Stage2Announced=true;
            const el=document.getElementById('stageDisplay');if(el)el.textContent=I18N[this.lang].w2_stage2;
            this.sound?.startFrostAmbiance?.(2);
          }
          if(this.score<(C.STAGE1_END||15)&&this.__w2Stage2Announced&&!this.boss?.active){this.__w2Stage2Announced=false;this.sound?.startFrostAmbiance?.(1);}
        }
        return r;
      };
    }

    const blockApproach=e=>{
      if(game.activeWorld===1&&game.state==='BOSS_OUTRO'&&game.__w2VictoryCine?.phase==='approach'){e.preventDefault();e.stopImmediatePropagation();}
    };
    document.addEventListener('pointerdown',blockApproach,true);
    document.addEventListener('touchstart',blockApproach,{capture:true,passive:false});
    document.addEventListener('keydown',blockApproach,true);

    game.__w2GameplayV1Installed = true;
    console.log('[FF-LAB] w2-gameplay-v1-installed');
    return true;
  }

  let tries=0;
  const timer=setInterval(()=>{tries++;if(install()||tries>100)clearInterval(timer);},80);
  setTimeout(install,1200);
})();
