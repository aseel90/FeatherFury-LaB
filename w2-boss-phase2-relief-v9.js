(()=>{'use strict';
function install(){
  const g=window.game;
  if(!g?.__w2BossTuningV8Installed)return false;
  if(g.__w2BossPhase2ReliefV9Installed)return true;
  const C=window.CONFIG||{};
  const active=x=>x.activeWorld===1&&x.boss?.active&&x.boss.type==='penguin';
  const isPhase2=x=>{
    const maxHp=Math.max(4,+C.W2_BOSS_HP||8);
    const phase2Hp=Math.max(1,Math.ceil(maxHp*.35));
    const drops=+x.__w2OrbBossV6?.completedDrops||0;
    return !!(x.boss&&(x.boss.hp<=phase2Hp||drops>=2||x.boss.__w2V6Phase2Started));
  };

  const oldActivate=typeof g.activateBoss==='function'?g.activateBoss.bind(g):null;
  if(oldActivate)g.activateBoss=function(...a){
    const r=oldActivate(...a);
    if(active(this)&&this.boss){
      this.boss.__w2V9BurstCooldown=0;
      this.boss.__w2V9Phase2Seen=false;
    }
    return r;
  };

  const oldBoss=typeof g.updatePenguinBoss==='function'?g.updatePenguinBoss.bind(g):null;
  if(oldBoss)g.updatePenguinBoss=function(){
    const b=this.boss;
    if(!active(this)||!b)return oldBoss();

    const phase2=isPhase2(this);
    if(phase2&&!b.__w2V9Phase2Seen){
      b.__w2V9Phase2Seen=true;
      b.__w2V9BurstCooldown=52;
    }
    if((b.__w2V9BurstCooldown||0)>0)b.__w2V9BurstCooldown--;

    const beforeLen=(this.snowballs||[]).length;
    const r=oldBoss();
    if(!phase2)return r;

    const balls=this.snowballs||[];
    const created=[];
    for(let i=beforeLen;i<balls.length;i++){
      const s=balls[i];
      if(s?.__w2Boss&&!s.__w2V6BossShot)created.push(s);
    }
    if(!created.length)return r;

    if((b.__w2V9BurstCooldown||0)>0){
      this.snowballs=balls.filter(s=>!created.includes(s));
      return r;
    }

    const keep=created[0];
    this.snowballs=balls.filter(s=>!created.includes(s)||s===keep);
    b.__w2V9BurstCooldown=118;
    return r;
  };

  // Final integrity guard: V7 defines falling ice as the only Emperor damage source.
  // Restore HP lost by older projectile wrappers unless V7's completed-drop count advanced.
  const oldUpdate=g.update.bind(g);
  g.update=function(){
    const wasActive=active(this),boss=this.boss;
    const dropsBefore=+this.__w2OrbBossV6?.completedDrops||0;
    const stateBefore=boss?.state;
    const r=oldUpdate();
    if(!wasActive||!boss||this.boss!==boss)return r;
    const s=this.__w2OrbBossV6;
    if(!s)return r;
    const drops=Math.max(0,+s.completedDrops||0);
    const maxHp=Math.max(4,+C.W2_BOSS_HP||8);
    const expectedHp=drops>=3?0:Math.max(1,Math.round(maxHp*((3-drops)/3)));
    if(drops===dropsBefore&&boss.hp<expectedHp){
      boss.hp=expectedHp;
      if(boss.state==='EXPLODING'&&expectedHp>0){
        boss.state=stateBefore&&stateBefore!=='EXPLODING'?stateBefore:'IDLE';
        boss.timer=0;
      }
    }
    return r;
  };

  g.__w2BossPhase2ReliefV9Installed=true;
  console.log('[FF-LAB] w2-boss-phase2-relief-v9-installed');
  return true;
}
let n=0;const t=setInterval(()=>{if(install()||++n>150)clearInterval(t);},80);setTimeout(install,1500);
})();