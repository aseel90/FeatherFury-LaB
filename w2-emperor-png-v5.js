(()=>{
'use strict';
const VERSION='w2-emperor-png-v5';
const FRAME=80;
const INDEX={idle:0,attack:1,jump:2,dash:3,phase2:4};
const PARTS=[
  'assets/world2/ice-emperor/png-sheet-v5.part1.b64?v=5',
  'assets/world2/ice-emperor/png-sheet-v5.part2.b64?v=5',
  'assets/world2/ice-emperor/png-sheet-v5.part3.b64?v=5'
];
const sheet=new Image();
sheet.decoding='async';
let installed=false,settled=false,resolveReady;
window.__FF_W2_EMPEROR_PNG_V5_READY__=new Promise(r=>{resolveReady=r;});
function settle(ok){if(settled)return;settled=true;resolveReady(ok);}
function install(){
  const g=window.game;
  if(!g||typeof g.drawPenguinBossSprite!=='function')return false;
  if(g.__w2EmperorPngV5Installed){installed=true;return true;}
  const ready=()=>!!(sheet.complete&&sheet.naturalWidth===FRAME*5&&sheet.naturalHeight===FRAME);
  g.drawPenguinBossSprite=function(ctx,x,y,frame,enraged){
    const b=this.boss||{},state=String(b.state||'IDLE'),f=Number(frame)||0,cd=Number(b.__w2V8FireCooldown);
    const phase2=!!(enraged||b.__w2V6Phase2Started);
    if(Number.isFinite(cd)){
      if(Number.isFinite(b.__w2SpriteLastCooldown)&&cd>b.__w2SpriteLastCooldown+20)b.__w2SpriteAttackUntil=f+12;
      b.__w2SpriteLastCooldown=cd;
    }
    const dash=/SLID/.test(state),jump=/JUMP|LAND/.test(state);
    const attack=!phase2&&!dash&&!jump&&((Number.isFinite(b.__w2SpriteAttackUntil)&&f<=b.__w2SpriteAttackUntil)||(state==='IDLE'&&Number.isFinite(cd)&&cd<=12));
    const key=phase2?'phase2':dash?'dash':jump?'jump':attack?'attack':'idle';
    if(!ready())return;
    const size=112,sx=INDEX[key]*FRAME;
    ctx.save();ctx.translate(x,y);ctx.scale(-1,1);
    if(phase2){
      const pulse=.88+Math.sin(f*.12)*.12;
      ctx.save();
      ctx.globalCompositeOperation='lighter';
      const glow=ctx.createRadialGradient(0,-48,12,0,-48,86);
      glow.addColorStop(0,`rgba(125,230,255,${.42*pulse})`);
      glow.addColorStop(.42,`rgba(54,170,255,${.34*pulse})`);
      glow.addColorStop(.72,`rgba(37,99,235,${.24*pulse})`);
      glow.addColorStop(1,'rgba(15,40,120,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,-48,86,0,Math.PI*2);ctx.fill();
      ctx.restore();
      ctx.shadowColor=`rgba(70,205,255,${.98*pulse})`;
      ctx.shadowBlur=30+10*pulse;
    }
    ctx.drawImage(sheet,sx,0,FRAME,FRAME,-size/2,-size+8,size,size);
    ctx.restore();
  };
  g.__w2EmperorPngV5Installed=true;
  window.__FF_W2_EMPEROR_PNG_V5__={version:VERSION,assetType:'png-sprite-sheet',phase2RuntimeGlow:true,imageBased:true,canvasConstructed:false,sourceFrame:[80,80],fixedDrawSize:112,poses:['idle','attack','jump','dash','phase2'],bakedEffects:false,runtimeChanged:false,hitboxesChanged:false};
  installed=true;console.log('[FF] Ice Emperor PNG sprite set V5 installed');return true;
}
Promise.all(PARTS.map(url=>fetch(url,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error(`${r.status} ${url}`);return r.text();})))
  .then(parts=>new Promise((resolve,reject)=>{sheet.onload=resolve;sheet.onerror=reject;sheet.src='data:image/png;base64,'+parts.join('');}))
  .then(()=>{if(installed)settle(true);else{let n=0,t=setInterval(()=>{if(install()){clearInterval(t);settle(true);}else if(++n>160){clearInterval(t);settle(false);}},50);}})
  .catch(err=>{console.error('[FF] Ice Emperor PNG sprite load failed',err);settle(false);});
let tries=0,timer=setInterval(()=>{if(install()||++tries>160)clearInterval(timer);},50);setTimeout(install,700);
})();