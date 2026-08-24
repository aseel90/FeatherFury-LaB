(() => {
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function install(){
    const game=window.game;
    if(!game||game.__w1FinalGameplayV1Installed) return !!game;

    if(typeof game.updateBoss==='function'){
      const prior=game.updateBoss.bind(game);
      game.updateBoss=function(){
        const r=prior();
        if(this.boss?.active&&this.boss.type==='crow'){
          if(Array.isArray(this.boss.__ffAttackQueue)) for(const item of this.boss.__ffAttackQueue){
            if(!item.__ffFinalTiming){ const extra=this.boss.enraged?5:7; item.delay+=extra; item.total+=extra; item.__ffFinalTiming=true; }
          }
          if(Array.isArray(this.bossFeathers)&&this.bossFeathers.length>9) this.bossFeathers.splice(0,this.bossFeathers.length-9);
        }
        return r;
      };
    }

    if(typeof game.update==='function'){
      const prior=game.update.bind(game);
      game.update=function(){
        const oldHp=(this.activeWorld===0&&this.boss?.active&&this.boss.type==='crow')?this.boss.hp:null;
        const oldInv=this.invincibleTimer||0;
        const oldStage2=this.activeWorld===0&&this.score>=((typeof CONFIG!=='undefined'&&CONFIG.STAGE1_END)?CONFIG.STAGE1_END:15);
        const r=prior();
        if(oldInv>0&&this.invincibleTimer===0) this.__ffPostReviveGrace=24;
        if(this.__ffPostReviveGrace>0) this.__ffPostReviveGrace--;
        if(this.state!=='PLAYING'&&this.state!=='BOSS_WARNING'&&this.state!=='BOSS_INTRO') this.__ffPostReviveGrace=0;

        const stage2=this.activeWorld===0&&this.score>=((typeof CONFIG!=='undefined'&&CONFIG.STAGE1_END)?CONFIG.STAGE1_END:15)&&!this.boss?.active;
        if(this.activeWorld===0&&!stage2&&!this.boss?.active) this.__ffCursedAudioStarted=false;
        if(!oldStage2&&stage2&&!this.__ffCursedAudioStarted){
          this.__ffCursedAudioStarted=true;
          setTimeout(()=>{ if(this.activeWorld===0&&!this.boss?.active) this.sound?.startCursedAmbiance?.(); },420);
        }

        if(oldHp!=null&&this.boss?.hp<oldHp){
          this.sound?.playOrbImpact?.();
          const ix=this.boss.x-35,iy=this.boss.y,count=this.gfxEnabled===false?4:10;
          for(let i=0;i<count;i++) this.particles.push({x:ix,y:iy,vx:(Math.random()-.5)*9,vy:(Math.random()-.5)*9,size:2+Math.random()*3,color:i%2?'#67e8f9':'#e0f2fe',life:.65});
        }

        const lowEnd=navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4;
        const cap=lowEnd?120:180;
        if(Array.isArray(this.particles)&&this.particles.length>cap) this.particles.splice(0,this.particles.length-cap);
        return r;
      };
    }

    if(typeof game.gameOver==='function'){
      const prior=game.gameOver.bind(game);
      game.gameOver=function(isVictory=false){
        if(!isVictory&&((this.invincibleTimer||0)>0||(this.__ffPostReviveGrace||0)>0)) return;
        let oldScore;
        if(isVictory&&this.activeWorld===0&&this.sound){ oldScore=this.sound.playScore; this.sound.playScore=()=>{}; }
        const r=prior(isVictory);
        if(oldScore){ this.sound.playScore=oldScore; this.sound.playVictoryEffect?.(); }
        return r;
      };
    }

    if(typeof window.drawBirdSkin==='function'){
      const prior=window.drawBirdSkin; let visualY=null,visualRot=null;
      window.drawBirdSkin=function(ctx,skin,x,y,rotation,wingCycle,scale,feverActive){
        const g=window.game;
        if(g&&g.activeWorld===0&&g.state==='PLAYING'&&Math.abs(x-g.bird.x)<2){
          if(visualY==null||Math.abs(y-visualY)>22||g.invincibleTimer>170) visualY=y;
          if(visualRot==null) visualRot=rotation;
          visualY+=(y-visualY)*.76; visualRot+=(rotation-visualRot)*.62;
          return prior(ctx,skin,x,y+clamp(visualY-y,-4.5,4.5),visualRot,wingCycle,scale,feverActive);
        }
        visualY=y; visualRot=rotation; return prior(ctx,skin,x,y,rotation,wingCycle,scale,feverActive);
      };
    }

    if(typeof game.drawRuinsBackground==='function'){
      const prior=game.drawRuinsBackground.bind(game);
      game.drawRuinsBackground=function(){
        const left=this.__ffWorld1StageFade||0;
        const stage2=this.activeWorld===0&&this.score>=((typeof CONFIG!=='undefined'&&CONFIG.STAGE1_END)?CONFIG.STAGE1_END:15)&&!this.boss?.active;
        if(stage2&&left>0){ this.ctx.save(); this.ctx.globalAlpha*=clamp(1-left/76,.06,1); const r=prior(); this.ctx.restore(); return r; }
        return prior();
      };
    }

    const resume=()=>{
      if(!game.sound) return;
      try{ game.sound.init?.(); }catch(_){}
      if(game.state==='PLAYING'&&game.activeWorld===0&&!game.boss?.active){
        const stage2=game.score>=((typeof CONFIG!=='undefined'&&CONFIG.STAGE1_END)?CONFIG.STAGE1_END:15);
        if(stage2) game.sound.startCursedAmbiance?.(); else game.sound.startRuinsAmbiance?.();
      } else if(game.boss?.active&&game.boss.type==='crow') game.sound.startBossAmbiance?.();
    };
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){ try{game.sound?.stopAmbiance?.();}catch(_){} try{game.sound?.stopBossAmbiance?.();}catch(_){} }
      else setTimeout(resume,100);
    });
    window.addEventListener('pagehide',()=>{ try{game.sound?.stopAmbiance?.();}catch(_){} try{game.sound?.stopBossAmbiance?.();}catch(_){} });

    game.__w1FinalGameplayV1Installed=true;
    console.log('[FF-LAB] w1-final-gameplay-v1-installed');
    return true;
  }
  let tries=0; const timer=setInterval(()=>{tries++;if(install()||tries>90)clearInterval(timer);},100);
  setTimeout(install,1300); setTimeout(install,2500);
})();