(()=>{'use strict';
function install(){
  const g=window.game;
  if(!g?.__w3RuntimeCleanupV1Installed)return false;
  if(g.__w3BossTuningV2Installed)return true;
  const C=(typeof CONFIG!=='undefined'&&CONFIG)?CONFIG:{};
  const W3=2,HP=10,PHASE2_HP=5;
  C.W3_BOSS_HP=HP;
  const fight=x=>x.activeWorld===W3&&x.state==='PLAYING'&&x.boss?.active&&x.boss.type==='thunderbird'&&x.boss.state!=='EXPLODING';

  function tuneBoss(x,resetHp=false){
    if(x.activeWorld!==W3||!x.boss?.active||x.boss.type!=='thunderbird')return;
    if(resetHp)x.boss.hp=HP;
    x.boss.__w3TunedMaxHp=HP;
  }

  function startEarlierPhase2(x){
    const b=x.boss,s=x.__w3BossFightV1;
    if(!fight(x)||!s?.shieldBroken||s.phase2Started||b.hp>PHASE2_HP||b.state==='W3_SHIELD_BREAK')return;
    s.phase2Started=true;
    s.warning=null;
    b.enraged=true;
    b.__w3Phase2=true;
    b.state='W3_RAGE';
    b.timer=0;
    x.bossFeathers=[];
    x.electricBats=(x.electricBats||[]).filter(q=>!q?.__w3BossSwarm);
    x.__w3ArcClean=null;
    x.__w3SonicClean=null;
    x.lightning=1;
    x.screenShake=Math.max(+x.screenShake||0,20);
    x.sound?.playVoltRage?.();
    s.cinema={type:'phase2',timer:0,duration:58};
    b.__w3PhaseBurstT=58;
  }

  const oa=g.activateBoss?.bind(g);
  if(oa)g.activateBoss=function(...a){
    const r=oa(...a);
    tuneBoss(this,true);
    return r;
  };

  const or=g.reset?.bind(g);
  if(or)g.reset=function(...a){
    const r=or(...a);
    this.__w3BossTuningV2Fight=false;
    return r;
  };

  const ou=g.update?.bind(g);
  if(ou)g.update=function(){
    if(fight(this)){
      tuneBoss(this,false);
      startEarlierPhase2(this);
    }
    const beforeState=fight(this)?this.boss.state:null;
    const r=ou();

    if(fight(this)){
      const b=this.boss;
      tuneBoss(this,false);
      startEarlierPhase2(this);

      if(beforeState&&b.state===beforeState){
        if(b.state==='IDLE') b.timer+=b.enraged?.25:.16;
        else if(/_PREP$/.test(b.state)||b.state==='DASH_PREP') b.timer+=b.enraged?.18:.12;
        else if(/_RECOVER$/.test(b.state)) b.timer+=b.enraged?.15:.10;
        else if(b.state==='DASHING') b.x-=b.enraged?1.0:.7;
        else if(b.state==='RETURNING') b.x-=b.enraged?.4:.25;
      }

      for(const bat of(this.electricBats||[])){
        if(!bat?.__w3BossSwarm)continue;
        const cap=b.enraged?-4.05:-3.5;
        bat.vx=Math.min(+bat.vx||cap,cap);
      }
      for(const w of(this.__w3ArcClean?.waves||[])){
        w.speed=Math.max(+w.speed||0,b.enraged?5.45:4.9);
      }
      for(const w of(this.__w3SonicClean?.waves||[])){
        w.speed=Math.max(+w.speed||0,b.enraged?4.05:3.55);
      }
      this.__w3BossTuningV2Fight=true;
    }
    return r;
  };

  if(fight(g))tuneBoss(g,true);
  g.__w3BossTuningV2Installed=true;
  window.__FF_W3_BOSS_TUNING_V2__={
    hp:HP,phase2Hp:PHASE2_HP,
    fasterCadence:true,fasterDash:true,fasterBossProjectiles:true
  };
  console.log('[FF-LAB] w3-boss-tuning-v2-installed');
  return true;
}
let n=0;const t=setInterval(()=>{if(install()||++n>180)clearInterval(t);},80);setTimeout(install,1500);
})();