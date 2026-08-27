(() => {
  'use strict';

  function install() {
    const game = window.game;
    if (!game?.__w2VisualsV1Installed || typeof game.drawPenguinBossSprite !== 'function') return false;
    if (window.__FF_W2_EMPEROR_ART_V1__?.version === 'w2-emperor-svg-v3') return true;

    const base = 'assets/world2/ice-emperor/';
    const assets = { idle:new Image(), attack:new Image(), jump:new Image(), phase2:new Image() };
    assets.idle.src=base+'idle.svg?v=3';assets.attack.src=base+'attack.svg?v=3';assets.jump.src=base+'jump.svg?v=3';assets.phase2.src=base+'phase2.svg?v=3';
    const ready=img=>!!(img&&img.complete&&img.naturalWidth);

    function shard(ctx,x,y,s,rot,alpha){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.globalAlpha*=alpha;const g=ctx.createLinearGradient(0,-12,0,12);g.addColorStop(0,'#ecfeff');g.addColorStop(.45,'#67e8f9');g.addColorStop(1,'#2563eb');ctx.fillStyle=g;ctx.strokeStyle='rgba(224,251,255,.9)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-13*s);ctx.lineTo(5*s,3*s);ctx.lineTo(0,10*s);ctx.lineTo(-5*s,3*s);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
    function aura(ctx,frame,phase2){const p=.5+.5*Math.sin(frame*.12);ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=phase2?`rgba(103,232,249,${.34+p*.25})`:`rgba(56,189,248,${.12+p*.12})`;ctx.lineWidth=phase2?2:1.2;ctx.beginPath();ctx.ellipse(0,-35,phase2?49:42,phase2?57:48,0,0,Math.PI*2);ctx.stroke();if(phase2){for(let i=0;i<6;i++){const a=frame*.028+i*Math.PI/3;shard(ctx,Math.cos(a)*54,-35+Math.sin(a)*42,.65,a,.45+.2*p);}}ctx.restore();}
    function attackFx(ctx,frame){const p=.5+.5*Math.sin(frame*.22);ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const x=-62-i*18-p*5,y=-58+i*21;shard(ctx,x,y,.8,-Math.PI/2,.75);}const g=ctx.createLinearGradient(-125,0,-40,0);g.addColorStop(0,'rgba(56,189,248,0)');g.addColorStop(1,`rgba(103,232,249,${.12+p*.12})`);ctx.fillStyle=g;ctx.fillRect(-128,-86,88,84);ctx.restore();}
    function jumpFx(ctx,frame,state){ctx.save();ctx.globalCompositeOperation='lighter';const p=.5+.5*Math.sin(frame*.18);if(state==='JUMP_PREP'||state==='LANDING'){ctx.strokeStyle=`rgba(125,211,252,${.35+p*.25})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,4,48+p*8,10+p*3,0,0,Math.PI*2);ctx.stroke();for(let i=-2;i<=2;i++)shard(ctx,i*17,2-Math.abs(i)*3,.55,i*.08,.55);}ctx.restore();}
    function fallback(ctx,x,y,frame,enraged){ctx.save();ctx.translate(x,y);aura(ctx,frame,!!enraged);ctx.fillStyle=enraged?'#164e63':'#0f2a45';ctx.beginPath();ctx.ellipse(0,-34,36,43,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#eaf5f8';ctx.beginPath();ctx.ellipse(0,-24,21,29,0,0,Math.PI*2);ctx.fill();ctx.restore();}

    game.drawPenguinBossSprite=function(ctx,x,y,frame,enraged){const boss=this.boss,state=boss?.state||'IDLE';const phase2=!!(enraged||boss?.__w2V6Phase2Started);const airborne=state==='JUMP_PREP'||state==='JUMPING'||state==='LANDING';const attacking=state==='IDLE'&&Number(boss?.__w2V8FireCooldown)<16;const key=phase2?'phase2':airborne?'jump':attacking?'attack':'idle';const img=assets[key],f=frame||0;if(!ready(img)){fallback(ctx,x,y,f,phase2);return;}const bob=state==='IDLE'?Math.sin(f*.09)*.7:0;const crouch=state==='JUMP_PREP'?4:state==='LANDING'?2:0;ctx.save();ctx.translate(x,y+bob+crouch);aura(ctx,f,phase2);ctx.shadowColor=phase2?'rgba(56,189,248,.75)':'rgba(56,189,248,.32)';ctx.shadowBlur=phase2?14:5;const w=phase2?118:110,h=phase2?122:116;ctx.drawImage(img,-w/2,-h+7,w,h);ctx.shadowBlur=0;if(attacking)attackFx(ctx,f);if(airborne)jumpFx(ctx,f,state);ctx.restore();};

    game.__w2EmperorArtV1Installed=true;
    window.__FF_W2_EMPEROR_ART_V1__={version:'w2-emperor-svg-v3',assetBased:true,assets:Object.keys(assets),effects:['crystal-aura','attack-shards','jump-ring','phase2-orbit'],gameplayGeometryChanged:false,hitboxesChanged:false,runtimeChanged:false};
    console.log('[FF-LAB] w2-emperor-svg-v3-installed');return true;
  }
  let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>120)clearInterval(timer);},80);setTimeout(install,1200);
})();