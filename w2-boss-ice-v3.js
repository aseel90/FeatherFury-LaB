(() => {
  'use strict';
  function install() {
    const g = window.game, C = window.CONFIG || {};
    if (!g?.__w2BossPolishV2Installed || g.__w2BossIceV3Installed) return false;
    const W=()=>C.CANVAS_WIDTH||360, H=()=>C.CANVAS_HEIGHT||640;
    const ground=()=>H()-(C.GROUND_HEIGHT||70)-5;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

    const resetIce = game => {
      game.__w2IceTargets=[
        {id:0,x:W()*.62,y:72,hits:3,max:3,state:'READY',fallY:72,vy:0},
        {id:1,x:W()*.76,y:68,hits:4,max:4,state:'READY',fallY:68,vy:0},
        {id:2,x:W()*.90,y:76,hits:4,max:4,state:'READY',fallY:76,vy:0}
      ];
      game.__w2IceLock=null;
      game.__w2BossIceInitialized=true;
    };

    const oldActivate = g.activateBoss?.bind(g);
    if (oldActivate) g.activateBoss=function(...a){
      const r=oldActivate(...a);
      if(this.activeWorld===1 && this.boss?.type==='penguin') resetIce(this);
      return r;
    };

    function readyIce(game){return (game.__w2IceTargets||[]).filter(i=>i.state==='READY');}
    function chooseIce(game,shot){
      const list=readyIce(game); if(!list.length)return null;
      return list.reduce((b,i)=>!b||Math.abs(i.x-shot.x)<Math.abs(b.x-shot.x)?i:b,null);
    }
    function redirectShots(game){
      const high=(game.bird?.y||H()/2)<H()*.43;
      for(const p of (game.__w2ManualProjectiles||[])){
        if(!p.active)continue;
        if(p.__v3Mode==null){
          if(high){const i=chooseIce(game,p); if(i){p.__v3Mode='ice';p.__v3IceId=i.id;}}
          if(!p.__v3Mode)p.__v3Mode='boss';
        }
        if(p.__v3Mode==='ice'){
          const i=(game.__w2IceTargets||[]).find(x=>x.id===p.__v3IceId&&x.state==='READY');
          if(!i){p.__v3Mode='boss';continue;}
          const dx=Math.max(30,i.x-p.x), frames=Math.max(3,dx/15.5);
          const desired=(i.y-p.y)/frames;
          p.vy=clamp(p.vy+(desired-p.vy)*.42,-8.2,6.2);
          game.__w2IceLock=i.id;
        } else if(game.boss?.active){
          const targetY=game.boss.y-36;
          p.vy=clamp(p.vy+(targetY-p.y)*.006,-5.8,5.8);
        }
      }
      if(!high)game.__w2IceLock=null;
    }
    function hitIce(game){
      for(const p of (game.__w2ManualProjectiles||[])){
        if(!p.active||p.__v3Mode!=='ice')continue;
        const i=(game.__w2IceTargets||[]).find(x=>x.id===p.__v3IceId&&x.state==='READY');
        if(!i)continue;
        if(Math.hypot(p.x-i.x,p.y-i.y)<31){
          p.active=false;i.hits--;
          game.sound?.playIceShatter?.(); game.screenShake=Math.max(game.screenShake||0,7);
          for(let n=0;n<9;n++)game.particles.push({x:i.x+(Math.random()-.5)*24,y:i.y+(Math.random()-.5)*18,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*6,size:1.5+Math.random()*2,color:n%2?'#e0f2fe':'#7dd3fc',life:.55});
          if(i.hits<=0){i.state='FALLING';i.vy=1.8;i.fallY=i.y;game.__w2IceLock=null;game.sound?.playIceWarn?.();}
        }
      }
    }
    function updateFallingIce(game){
      const boss=game.boss;if(!boss?.active)return;
      for(const i of (game.__w2IceTargets||[])){
        if(i.state!=='FALLING')continue;
        i.vy=Math.min(15,(i.vy||1.8)+.48);i.fallY+=i.vy;
        if(i.fallY<ground()-26)continue;
        i.state='SPENT'; const direct=Math.abs(boss.x-i.x)<92;
        if(direct&&boss.state!=='EXPLODING'){
          boss.hp=Math.max(0,boss.hp-2);boss.__v3Stun=72;boss.timer=0;
          game.sound?.playEmperorHit?.();game.screenShake=26;
          game.floatingText?.push({text:game.lang==='ar'?'ضربة جليدية!':'ICE BREAK!',x:boss.x,y:boss.y-100,life:1,color:'#bae6fd'});
          if(boss.hp<=0){boss.hp=0;boss.state='EXPLODING';boss.timer=0;game.sound?.playEmperorDefeat?.();}
        }else game.screenShake=15;
        game.sound?.playIceShatter?.();
        for(let n=0;n<24;n++)game.particles.push({x:i.x+(Math.random()-.5)*70,y:ground()-18,vx:(Math.random()-.5)*13,vy:-Math.random()*10,size:2+Math.random()*4,color:n%2?'#e0f2fe':'#7dd3fc',life:.85});
      }
    }
    function improveBossAim(game){
      const boss=game.boss;if(!boss?.active||boss.type!=='penguin')return;
      for(const s of game.snowballs||[]){
        if(!s.__w2Boss||s.__v3Aim)continue;s.__v3Aim=true;
        const speed=Math.max(7,Math.abs(s.vx||8));
        const frames=Math.max(8,Math.abs((game.bird?.x||80)-s.x)/speed);
        let vy=((game.bird?.y||H()/2)-s.y)/frames-.045*(frames-1)*.5;
        if((game.bird?.y||H()/2)<H()*.30)vy=Math.min(vy,boss.enraged?-4.9:-4.15);
        s.vy=clamp(vy,-8.2,4.8);
      }
    }

    const oldUpdate=g.update.bind(g);
    g.update=function(){
      const bossFight=this.activeWorld===1&&this.boss?.active&&this.boss?.type==='penguin';
      if(bossFight&&!this.__w2BossIceInitialized)resetIce(this);
      if(bossFight){
        redirectShots(this);
        if((this.boss.__v3Stun||0)>0){this.boss.__v3Stun--;this.boss.timer=1;this.boss.__w2Recovery=Math.max(this.boss.__w2Recovery||0,24);}
      }
      const r=oldUpdate();
      if(bossFight){redirectShots(this);hitIce(this);updateFallingIce(this);improveBossAim(this);}
      return r;
    };

    const oldDraw=g.draw.bind(g);
    g.draw=function(){
      oldDraw();
      if(this.activeWorld!==1||!this.boss?.active||this.boss?.type!=='penguin'||this.boss.state==='EXPLODING')return;
      const ctx=this.ctx, high=(this.bird?.y||H()/2)<H()*.43, list=readyIce(this);
      if(high&&list.length&&this.__w2IceLock==null)this.__w2IceLock=list[0].id;
      ctx.save();
      for(const i of (this.__w2IceTargets||[])){
        if(i.state==='SPENT')continue;const y=i.state==='FALLING'?i.fallY:i.y;
        ctx.save();ctx.translate(i.x,y);ctx.fillStyle='#bfdbfe';ctx.strokeStyle='#67e8f9';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(-18,-13);ctx.lineTo(14,-16);ctx.lineTo(22,2);ctx.lineTo(5,23);ctx.lineTo(-17,16);ctx.lineTo(-23,-2);ctx.closePath();ctx.fill();ctx.stroke();
        if(i.state==='READY'){
          const cracks=i.max-i.hits;ctx.strokeStyle='#fff';ctx.lineWidth=1.4;
          for(let c=0;c<cracks;c++){ctx.beginPath();ctx.moveTo(-5+c*5,-8);ctx.lineTo(-10+c*6,2);ctx.lineTo(-3+c*4,10);ctx.stroke();}
          if(high&&this.__w2IceLock===i.id){ctx.strokeStyle='#fef08a';ctx.lineWidth=3;ctx.globalAlpha=.75+Math.sin(this.frame*.2)*.2;ctx.beginPath();ctx.arc(0,0,31,0,Math.PI*2);ctx.stroke();}
        }ctx.restore();
      }
      if(high&&list.length){ctx.globalAlpha=1;ctx.fillStyle='rgba(15,23,42,.72)';ctx.fillRect(W()/2-76,18,152,24);ctx.fillStyle='#e0f2fe';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText(this.lang==='ar'?'هدف الجليد مُثبت':'ICE TARGET LOCK',W()/2,34);}
      ctx.restore();
    };

    g.__w2BossIceV3Installed=true;
    console.log('[FF-LAB] w2-boss-ice-v3-installed');
    return true;
  }
  let tries=0;const t=setInterval(()=>{tries++;if(install()||tries>120)clearInterval(t);},80);setTimeout(install,1300);
})();
