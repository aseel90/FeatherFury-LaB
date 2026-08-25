(()=>{'use strict';
function install(){
  const game = window.game;
  if (!game?.__w2BossPolishV2Installed) return false;
  if (game.__w2BossOrbV7Installed) return true;

  const C = window.CONFIG || {};
  const W = () => C.CANVAS_WIDTH || 360;
  const H = () => C.CANVAS_HEIGHT || 640;
  const GROUND = () => H() - (C.GROUND_HEIGHT || 70) - 5;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ORBS_PER_DROP = 4;
  const ICE_COUNT = 3;

  function setFeverBarHidden(hidden) {
    const el = document.querySelector('.fever-bar-container');
    if (!el) return;
    if (hidden) {
      if (!el.dataset.w2V4PrevDisplay) el.dataset.w2V4PrevDisplay = el.style.display || '__EMPTY__';
      el.style.display = 'none';
    } else if (el.dataset.w2V4PrevDisplay) {
      el.style.display = el.dataset.w2V4PrevDisplay === '__EMPTY__' ? '' : el.dataset.w2V4PrevDisplay;
      delete el.dataset.w2V4PrevDisplay;
    }
  }

  function makeBlocks() {
    const y = Math.max(122, H() * .205);
    return [
      { id: 0, x: W() * .58, y, fallY: y, vy: 0, state: 'READY', timer: 0 },
      { id: 1, x: W() * .75, y: y + 9, fallY: y + 9, vy: 0, state: 'READY', timer: 0 },
      { id: 2, x: W() * .90, y: y - 2, fallY: y - 2, vy: 0, state: 'READY', timer: 0 }
    ];
  }

  function resetFight(g) {
    g.__w2OrbBossV6 = {charge:0,required:ORBS_PER_DROP,completedDrops:0,blocks:makeBlocks(),bolt:null,nextOrbIn:42,orbSequence:0,burstQueue:[],stun:0,active:true,lockedBlockId:null};
    g.feverActive=false; g.fever=0; g.feverTimer=0;
    const feverFill=document.getElementById('feverBarFill'); if(feverFill){feverFill.style.width='0%';feverFill.classList.remove('max');}
    setFeverBarHidden(true);
    g.powerOrbs=[]; g.heroProjectiles=[]; g.__w2ManualProjectiles=[]; g.snowballs=[];
    g.icicles=(g.icicles||[]).filter(i=>!i.__w2BossHazard);
    if(g.boss){g.boss.__w2EnrageTriggered=true;g.boss.enraged=false;}
  }

  const oldActivateBoss=typeof game.activateBoss==='function'?game.activateBoss.bind(game):null;
  if(oldActivateBoss){game.activateBoss=function(...args){const result=oldActivateBoss(...args);if(this.activeWorld===1&&this.boss?.active&&this.boss?.type==='penguin')resetFight(this);return result;};}
  function bossFightActive(g){return g.activeWorld===1&&g.boss?.active&&g.boss?.type==='penguin'&&g.state!=='BOSS_OUTRO'&&g.state!=='FLY_AWAY';}

  function orbYForSequence(g,index){const gy=GROUND();const lanes=[H()*.24,gy-46,H()*.49,H()*.31,gy-54,H()*.57,H()*.20,gy-43,H()*.43];const base=lanes[index%lanes.length];const jitter=((index*37)%23)-11;return clamp(base+jitter,74,gy-38);}

  function processCollectedOrbs(g,s){
    // World 2 collection-only rule: every collected orb becomes charge immediately.
    // Manual projectiles are consumed here before they can ever damage the penguin directly.
    let gained=0;
    const shots=g.__w2ManualProjectiles||[];
    for(const p of shots){
      if(!p||p.__w2V7Consumed)continue;
      p.__w2V7Consumed=true;
      p.active=false;
      gained++;
    }
    if(!gained)return;
    g.__w2ManualProjectiles=[];
    g.heroProjectiles=[];
    s.lockedBlockId=null;
    for(let n=0;n<gained;n++){
      if(s.completedDrops>=ICE_COUNT||s.bolt||s.blocks.some(b=>b.state==='SHAKE'||b.state==='FALLING'||b.state==='TARGETED'))break;
      s.charge=Math.min(s.required,s.charge+1);
      g.screenShake=Math.max(g.screenShake||0,3);
      g.sound?.playHit?.();
      if(s.charge>=s.required)triggerIceStrike(g,s);
    }
  }

  function triggerIceStrike(g,s,forcedBlock=null){
    const ready=s.blocks.filter(b=>b.state==='READY'); if(!ready.length||!g.boss?.active)return;
    const block=forcedBlock||ready.reduce((best,b)=>!best||Math.abs(b.x-g.boss.x)<Math.abs(best.x-g.boss.x)?b:best,null); if(!block)return;
    s.charge=0;block.state='TARGETED';block.timer=0;s.lockedBlockId=null;
    s.bolt={x:g.bird.x+10,y:g.bird.y,blockId:block.id,life:70};s.nextOrbIn=9999;g.sound?.playLaser?.();
  }

  function updateStrikeAndIce(g,s){
    const boss=g.boss;if(!boss?.active)return;
    if(s.bolt){const block=s.blocks.find(b=>b.id===s.bolt.blockId);if(!block||block.state!=='TARGETED')s.bolt=null;else{const dx=block.x-s.bolt.x,dy=block.y-s.bolt.y,d=Math.hypot(dx,dy)||1,speed=20;s.bolt.x+=dx/d*speed;s.bolt.y+=dy/d*speed;s.bolt.life--;if(g.frame%2===0)g.particles.push({x:s.bolt.x,y:s.bolt.y,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2,size:2.1,color:'#67e8f9',life:.38});if(d<22||s.bolt.life<=0){block.state='SHAKE';block.timer=0;s.bolt=null;g.screenShake=Math.max(g.screenShake||0,7);g.sound?.playIceWarn?.();}}}
    for(const block of s.blocks){if(block.state==='SHAKE'){block.timer++;if(block.timer%4===0){for(let n=0;n<4;n++)g.particles.push({x:block.x+(Math.random()-.5)*32,y:block.y+10+(Math.random()-.5)*20,vx:(Math.random()-.5)*5,vy:Math.random()*3,size:1.5+Math.random()*2,color:'#dbeafe',life:.45});}if(block.timer>=20){block.state='FALLING';block.vy=2.6;block.fallY=block.y;}}else if(block.state==='FALLING'){block.x+=clamp((boss.x-block.x)*.045,-1.35,1.35);block.vy=Math.min(17,block.vy+.62);block.fallY+=block.vy;if(block.fallY>=GROUND()-26)impactBoss(g,s,block);}}
    if(s.stun>0&&boss.state!=='EXPLODING'){s.stun--;boss.state='V4_STUN';boss.timer=0;if(s.stun===0){boss.state='IDLE';boss.timer=0;}}
  }

  function impactBoss(g,s,block){
    if(block.state!=='FALLING')return;block.state='SPENT';s.completedDrops++;s.stun=44;
    const maxHp=Math.max(3,C.W2_BOSS_HP||8);
    // Ice is the ONLY damage source in World 2. Three successful drops defeat the boss.
    if(s.completedDrops>=ICE_COUNT)g.boss.hp=0;
    else{const remainingFraction=(ICE_COUNT-s.completedDrops)/ICE_COUNT;g.boss.hp=Math.max(1,Math.round(maxHp*remainingFraction));}
    g.screenShake=26;g.sound?.playIceShatter?.();g.sound?.playEmperorHit?.();
    for(let n=0;n<30;n++)g.particles.push({x:g.boss.x+(Math.random()-.5)*80,y:GROUND()-26+(Math.random()-.5)*36,vx:(Math.random()-.5)*15,vy:-Math.random()*11,size:2+Math.random()*4,color:n%3===0?'#f8fafc':'#7dd3fc',life:.9});
    if(g.boss.hp<=0){g.boss.hp=0;g.boss.state='EXPLODING';g.boss.timer=0;s.stun=0;g.sound?.playEmperorDefeat?.();}
    else{g.boss.state='V4_STUN';g.boss.timer=0;s.nextOrbIn=66;}
  }

  function manageBossOrbs(g,s){
    const existing=(g.powerOrbs||[]).filter(o=>!o.collected&&o.__w2V6Orb);let hasOrb=existing.length>0;
    for(const orb of(g.powerOrbs||[])){if(orb.collected||orb.__w2V6Orb)continue;if(!hasOrb&&s.nextOrbIn<=0&&!s.bolt&&!s.blocks.some(b=>b.state==='SHAKE'||b.state==='FALLING')){orb.__w2V6Orb=true;orb.x=W()+18;orb.y=orbYForSequence(g,s.orbSequence++);hasOrb=true;s.nextOrbIn=58;}else orb.collected=true;}
    g.powerOrbs=(g.powerOrbs||[]).filter(o=>!o.collected&&o.x>-20);hasOrb=g.powerOrbs.some(o=>o.__w2V6Orb&&!o.collected);
    const iceBusy=!!s.bolt||s.blocks.some(b=>b.state==='TARGETED'||b.state==='SHAKE'||b.state==='FALLING');
    if(!hasOrb&&!iceBusy&&s.completedDrops<ICE_COUNT){s.nextOrbIn--;if(s.nextOrbIn<=0){g.powerOrbs.push({x:W()+18,y:orbYForSequence(g,s.orbSequence++),collected:false,__w2V6Orb:true});s.nextOrbIn=58;}}
  }

  function ballisticVy(startX,startY,targetY,vx){const frames=Math.max(7,Math.abs((game.bird.x-startX)/vx)),gravity=.045;return clamp((targetY-startY-gravity*frames*(frames-1)*.5)/frames,-21,11);}
  function queueThreeShotBurst(g,s){if(s.burstQueue.length||!g.boss?.active||g.boss.state==='EXPLODING')return;const lockedY=clamp(g.bird.y,54,GROUND()-42);s.burstQueue=[{delay:0,targetY:lockedY-145},{delay:12,targetY:lockedY},{delay:24,targetY:lockedY+145}];}
  function processBossShots(g,s){
    const legacy=(g.snowballs||[]).filter(ball=>ball.__w2Boss&&!ball.__w2V6BossShot);if(legacy.length){g.snowballs=g.snowballs.filter(ball=>!legacy.includes(ball));queueThreeShotBurst(g,s);}
    if(!s.burstQueue.length||g.boss.state==='EXPLODING'||s.stun>0)return;
    for(const item of s.burstQueue)item.delay--;const due=s.burstQueue.filter(item=>item.delay<0);s.burstQueue=s.burstQueue.filter(item=>item.delay>=0);
    for(const item of due){const startX=g.boss.x-28,startY=g.boss.y-44,vx=-5.15,targetY=clamp(item.targetY,34,GROUND()-32),vy=ballisticVy(startX,startY,targetY,vx);g.snowballs.push({x:startX,y:startY,vx,vy,__w2Boss:true,__w2V6BossShot:true});g.sound?.playSnowballWhoosh?.();}
  }

  const oldUpdate=game.update.bind(game);
  game.update=function(){
    const before=bossFightActive(this);if(before&&!this.__w2OrbBossV6)resetFight(this);
    if(before){setFeverBarHidden(true);this.feverActive=false;this.fever=0;this.feverTimer=0;this.boss.__w2EnrageTriggered=true;this.boss.enraged=false;}
    const result=oldUpdate();const active=bossFightActive(this);if(!active){if(this.__w2OrbBossV6?.active)this.__w2OrbBossV6.active=false;setFeverBarHidden(false);return result;}
    const s=this.__w2OrbBossV6||(resetFight(this),this.__w2OrbBossV6);setFeverBarHidden(true);
    processCollectedOrbs(this,s);manageBossOrbs(this,s);this.icicles=(this.icicles||[]).filter(i=>!i.__w2BossHazard);processBossShots(this,s);updateStrikeAndIce(this,s);return result;
  };

  function drawIceBlock(ctx,block,frame){if(block.state==='SPENT')return;const y=block.state==='FALLING'?block.fallY:block.y,shake=block.state==='SHAKE'?Math.sin(frame*1.8)*3.2:0;ctx.save();ctx.translate(block.x+shake,y);ctx.fillStyle='#cfe8f7';ctx.strokeStyle='#67c9e8';ctx.lineWidth=2.3;ctx.beginPath();ctx.moveTo(-24,-17);ctx.lineTo(15,-20);ctx.lineTo(27,-4);ctx.lineTo(16,18);ctx.lineTo(-4,26);ctx.lineTo(-26,12);ctx.lineTo(-30,-6);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#ffffff';ctx.globalAlpha=.78;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-7,-12);ctx.lineTo(-1,-2);ctx.lineTo(-10,8);ctx.lineTo(2,18);ctx.stroke();ctx.beginPath();ctx.moveTo(9,-15);ctx.lineTo(5,-5);ctx.lineTo(15,4);ctx.stroke();ctx.restore();}
  function drawOrbGauge(g,s){const ctx=g.ctx,w=76,h=10,x=clamp(g.bird.x-w/2,8,W()-w-8),y=Math.max(94,g.bird.y-38),ratio=clamp(s.charge/s.required,0,1);ctx.save();ctx.fillStyle='rgba(7,18,32,.82)';ctx.strokeStyle='rgba(224,242,254,.85)';ctx.lineWidth=1.5;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,5);else ctx.rect(x,y,w,h);ctx.fill();ctx.stroke();if(ratio>0){ctx.fillStyle='#38bdf8';ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x+2,y+2,(w-4)*ratio,h-4,3);else ctx.rect(x+2,y+2,(w-4)*ratio,h-4);ctx.fill();}ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1;for(let i=1;i<s.required;i++){const tx=x+w*i/s.required;ctx.beginPath();ctx.moveTo(tx,y+1);ctx.lineTo(tx,y+h-1);ctx.stroke();}ctx.restore();}

  const oldDraw=game.draw.bind(game);
  game.draw=function(){oldDraw();if(!bossFightActive(this)||!this.__w2OrbBossV6||this.boss.state==='EXPLODING')return;const s=this.__w2OrbBossV6,ctx=this.ctx;ctx.save();for(const block of s.blocks)drawIceBlock(ctx,block,this.frame);if(s.bolt){ctx.strokeStyle='#7dd3fc';ctx.lineWidth=4;ctx.globalAlpha=.9;ctx.beginPath();ctx.moveTo(this.bird.x+8,this.bird.y);ctx.lineTo(s.bolt.x,s.bolt.y);ctx.stroke();ctx.fillStyle='#f8fafc';ctx.beginPath();ctx.arc(s.bolt.x,s.bolt.y,5,0,Math.PI*2);ctx.fill();}if(s.lockedBlockId!==null&&s.lockedBlockId!==undefined){const lock=s.blocks.find(b=>b.id===s.lockedBlockId&&b.state==='READY');if(lock){const pulse=1+Math.sin(this.frame*.18)*.08;ctx.strokeStyle='rgba(250,204,21,.92)';ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(lock.x,lock.y,34*pulse,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(250,204,21,.95)';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText('LOCK',lock.x,lock.y-40);}}ctx.restore();drawOrbGauge(this,s);};

  game.__w2BossOrbV7Installed=true;console.log('[FF-LAB] w2-boss-orb-v7-installed');return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>120)clearInterval(timer);},80);setTimeout(install,1300);
})();