(()=>{'use strict';
function install(){
  const g=window.game;
  if(!g?.__w2BossOrbV7Installed||!g?.__w2BossCombatV6Installed)return false;
  if(g.__w2BossTuningV8Installed)return true;
  const C=window.CONFIG||{},W=()=>+C.CANVAS_WIDTH||360,H=()=>+C.CANVAS_HEIGHT||640,GROUND=()=>H()-(+C.GROUND_HEIGHT||70)-5,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  const active=x=>x.activeWorld===1&&x.boss?.active&&x.boss.type==='penguin';

  function snapshot(x){
    const s=x.__w2OrbBossV6;if(!s)return;
    x.__w2V8Resume={
      charge:cl(+s.charge||0,0,+s.required||4),
      completedDrops:+s.completedDrops||0,
      spentIds:(s.blocks||[]).filter(b=>b?.state==='SPENT').map(b=>b.id)
    };
    s.__w2V8Bound=true;
  }
  function restore(x,s){
    const r=x.__w2V8Resume;if(!r||s.__w2V8Bound)return;
    s.charge=cl(+r.charge||0,0,+s.required||4);
    s.completedDrops=Math.max(0,+r.completedDrops||0);
    const spent=new Set(r.spentIds||[]);
    for(const b of(s.blocks||[])){
      if(!b)continue;
      if(spent.has(b.id)){b.state='SPENT';continue;}
      b.state='READY';b.timer=0;b.vy=0;b.fallY=b.y;
    }
    s.bolt=null;s.burstQueue=[];s.stun=0;s.lockedBlockId=null;s.nextOrbIn=Math.min(Number.isFinite(s.nextOrbIn)?s.nextOrbIn:42,42);
    s.__w2V8Bound=true;
  }

  const oldActivate=typeof g.activateBoss==='function'?g.activateBoss.bind(g):null;
  if(oldActivate)g.activateBoss=function(...a){
    const r=oldActivate(...a);
    if(active(this)){this.__w2V8Resume=null;this.boss.__w2V8FireCooldown=58;this.boss.__w2V8LandingTarget=null;}
    return r;
  };

  const oldBoss=typeof g.updatePenguinBoss==='function'?g.updatePenguinBoss.bind(g):null;
  if(oldBoss)g.updatePenguinBoss=function(){
    const b=this.boss;if(!active(this)||!b)return oldBoss();
    const beforeState=b.state,beforeX=+b.x||0;
    const legacyRate=b.enraged?40:64;
    const suppressLegacy=b.state==='IDLE'&&b.timer>0&&b.timer%legacyRate===0;
    const savedTimer=b.timer;
    if(suppressLegacy)b.timer=savedTimer+1;
    const r=oldBoss();
    if(suppressLegacy&&b.state==='IDLE'&&b.timer===savedTimer+1)b.timer=savedTimer;

    // Replace the old instant landing clamp with a short settle back into the boss lane.
    if(b.state==='LANDING'){
      if(beforeState!=='LANDING'){
        b.__w2V8LandingTarget=cl(Math.max(W()*.58,beforeX),W()*.55,W()-55);
        b.x=beforeX;b.jumpVy=0;
      }else{
        const target=Number.isFinite(b.__w2V8LandingTarget)?b.__w2V8LandingTarget:cl(W()*.62,W()*.55,W()-55);
        b.x=beforeX+(target-beforeX)*.11;
        const p=cl((+b.timer||0)/38,0,1);
        b.y=GROUND()-Math.sin(p*Math.PI)*4.5*(1-p*.35);
      }
    }else if(beforeState==='LANDING'){
      const target=Number.isFinite(b.__w2V8LandingTarget)?b.__w2V8LandingTarget:W()*.62;
      b.x=cl(beforeX+(target-beforeX)*.13,W()*.55,W()-55);b.y=GROUND();b.__w2V8LandingTarget=null;
    }

    // Slower, deliberate boss throws. V7 converts this single legacy cue into its fair 3-shot burst.
    if(!Number.isFinite(b.__w2V8FireCooldown))b.__w2V8FireCooldown=58;
    if(b.__w2V8FireCooldown>0)b.__w2V8FireCooldown--;
    if(b.state==='IDLE'&&(b.__w2Recovery||0)<=0&&b.__w2V8FireCooldown<=0){
      const aim=(this.bird.y-(b.y-32))*.018;
      this.snowballs.push({x:b.x-27,y:b.y-42,vx:-7,vy:aim,__w2Boss:true,__w2V8Cue:true});
      b.__w2V8FireCooldown=b.enraged?62:82;
      this.sound?.playSnowThrow?.();
      if(b.__w2VoiceCooldown<=0){this.sound?.playEmperorAttack?.();b.__w2VoiceCooldown=b.enraged?86:118;}
    }
    return r;
  };

  const oldUpdate=g.update.bind(g);
  g.update=function(){
    const r=oldUpdate();
    if(!active(this))return r;
    const s=this.__w2OrbBossV6;
    if(s){restore(this,s);snapshot(this);}
    // Combat V6 tunes every frame; make the final projectile travel speed a little calmer.
    for(const shot of(this.snowballs||[]))if(shot?.__w2V6BossShot){shot.vx=this.boss.enraged?-4.75:-4.45;}
    return r;
  };

  g.__w2BossTuningV8Installed=true;
  console.log('[FF-LAB] w2-boss-tuning-v8-installed');
  return true;
}
let n=0;const t=setInterval(()=>{if(install()||++n>150)clearInterval(t);},80);setTimeout(install,1500);
})();
